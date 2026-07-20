"""Circuit Breaker — Prevents cascading failures when MiMo API is down.

States:
  CLOSED  → Normal operation, requests pass through
  OPEN    → MiMo is failing, requests are blocked for cooldown period
  HALF_OPEN → Cooldown expired, allow one probe request

Usage:
    from backend.circuit_breaker import mimo_breaker
    
    if not mimo_breaker.allow_request():
        return {"error": "AI service temporarily unavailable"}
    
    result = call_mimo(...)
    if result:
        mimo_breaker.record_success()
    else:
        mimo_breaker.record_failure()
"""

import time
import logging
from enum import Enum
from typing import Optional

_log = logging.getLogger("luxor.circuit")


class CircuitState(Enum):
    CLOSED = "closed"       # Normal — requests pass through
    OPEN = "open"           # Failing — requests blocked
    HALF_OPEN = "half_open" # Probing — one request allowed


class CircuitBreaker:
    """Thread-safe circuit breaker for external API calls."""
    
    def __init__(
        self,
        name: str = "default",
        failure_threshold: int = 3,
        cooldown_seconds: int = 300,  # 5 minutes
        half_open_max: int = 1,
    ):
        self.name = name
        self.failure_threshold = failure_threshold
        self.cooldown_seconds = cooldown_seconds
        self.half_open_max = half_open_max
        
        self._state = CircuitState.CLOSED
        self._failure_count = 0
        self._success_count = 0
        self._last_failure_time: float = 0
        self._half_open_attempts = 0
    
    @property
    def state(self) -> CircuitState:
        """Check if cooldown has expired and transition to HALF_OPEN."""
        if self._state == CircuitState.OPEN:
            if time.time() - self._last_failure_time >= self.cooldown_seconds:
                self._state = CircuitState.HALF_OPEN
                self._half_open_attempts = 0
                _log.info("[CIRCUIT-%s] Cooldown expired → HALF_OPEN", self.name)
        return self._state
    
    def allow_request(self) -> bool:
        """Check if a request should be allowed through."""
        current = self.state
        if current == CircuitState.CLOSED:
            return True
        elif current == CircuitState.HALF_OPEN:
            if self._half_open_attempts < self.half_open_max:
                self._half_open_attempts += 1
                return True
            return False
        else:  # OPEN
            remaining = self.cooldown_seconds - (time.time() - self._last_failure_time)
            _log.warning(
                "[CIRCUIT-%s] OPEN — blocking request (%.0fs remaining)",
                self.name, max(0, remaining),
            )
            return False
    
    def record_success(self):
        """Record a successful API call."""
        if self._state == CircuitState.HALF_OPEN:
            # Success in HALF_OPEN → transition to CLOSED
            self._state = CircuitState.CLOSED
            self._failure_count = 0
            _log.info("[CIRCUIT-%s] Probe success → CLOSED", self.name)
        elif self._state == CircuitState.CLOSED:
            self._failure_count = max(0, self._failure_count - 1)
    
    def record_failure(self):
        """Record a failed API call."""
        self._failure_count += 1
        self._last_failure_time = time.time()
        
        if self._state == CircuitState.HALF_OPEN:
            # Failure in HALF_OPEN → back to OPEN
            self._state = CircuitState.OPEN
            _log.warning("[CIRCUIT-%s] Probe failed → OPEN (cooldown %ds)", self.name, self.cooldown_seconds)
        elif self._failure_count >= self.failure_threshold:
            self._state = CircuitState.OPEN
            _log.warning(
                "[CIRCUIT-%s] %d failures → OPEN (cooldown %ds)",
                self.name, self._failure_count, self.cooldown_seconds,
            )
    
    def get_status(self) -> dict:
        """Return current circuit status for monitoring."""
        return {
            "name": self.name,
            "state": self.state.value,
            "failure_count": self._failure_count,
            "cooldown_remaining": max(0, self.cooldown_seconds - (time.time() - self._last_failure_time)) if self._state == CircuitState.OPEN else 0,
        }


# Global circuit breakers
mimo_breaker = CircuitBreaker(
    name="mimo",
    failure_threshold=3,
    cooldown_seconds=300,  # 5 minutes
)

mimo_vision_breaker = CircuitBreaker(
    name="mimo-vision",
    failure_threshold=3,
    cooldown_seconds=300,
)
