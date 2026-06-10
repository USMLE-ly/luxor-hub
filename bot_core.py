"""
🤖 Bot Core — modular plugin-based Telegram bot framework
Inspired by Probot's architecture:
  - Plugin system (app.on("event") pattern)
  - Structured logging
  - Config-as-code
  - Rate limiting
  - Health monitoring
"""
import json, logging, os, re, time, asyncio
from typing import Callable, Dict, List, Optional, Any
from dataclasses import dataclass, field
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

# ─── Structured Logging ─────────────────────────────────────────
class StructuredLogger:
    """Pino-style structured logging with levels."""
    
    def __init__(self, name: str, level: str = "INFO"):
        self.name = name
        self.level_map = {"DEBUG": 10, "INFO": 20, "WARN": 30, "ERROR": 40, "FATAL": 50}
        self.threshold = self.level_map.get(level.upper(), 20)
        
        handler = logging.StreamHandler()
        handler.setFormatter(logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        ))
        self._log = logging.getLogger(name)
        self._log.addHandler(handler)
        self._log.setLevel(level.upper())
    
    def _log_structured(self, level: str, msg: str, **extra):
        if self.level_map.get(level, 0) >= self.threshold:
            extra_str = " ".join(f"{k}={v}" for k, v in extra.items())
            line = f"{msg} {extra_str}" if extra_str else msg
            getattr(self._log, level.lower(), self._log.info)(line)
    
    def info(self, msg: str, **kw): self._log_structured("INFO", msg, **kw)
    def warn(self, msg: str, **kw): self._log_structured("WARN", msg, **kw)
    def error(self, msg: str, **kw): self._log_structured("ERROR", msg, **kw)
    def debug(self, msg: str, **kw): self._log_structured("DEBUG", msg, **kw)
    def fatal(self, msg: str, **kw): self._log_structured("FATAL", msg, **kw)

log = StructuredLogger("bot_core")

# ─── Rate Limiter ────────────────────────────────────────────────
class RateLimiter:
    """Bottleneck-style rate limiter for API calls."""
    
    def __init__(self, max_calls: int = 10, period: float = 60.0):
        self.max_calls = max_calls
        self.period = period
        self.calls: List[float] = []
    
    async def acquire(self) -> float:
        now = time.time()
        self.calls = [t for t in self.calls if now - t < self.period]
        if len(self.calls) >= self.max_calls:
            wait = self.calls[0] + self.period - now
            if wait > 0:
                log.warn("rate_limit_hit", wait=f"{wait:.1f}s")
                await asyncio.sleep(wait)
                now = time.time()
                self.calls = [t for t in self.calls if now - t < self.period]
        self.calls.append(now)
        return 0.0

# ─── Config-as-Code ──────────────────────────────────────────────
DEFAULT_CONFIG = {
    "bot": {
        "token_env": "TELEGRAM_TOKEN",
        "polling_timeout": 30,
        "allowed_updates": ["message"],
    },
    "ai": {
        "provider": "opencode_zen",
        "model": "deepseek-v4-flash-free",
        "endpoint": "https://opencode.ai/zen/v1/chat/completions",
        "temperature": 0.9,
        "max_tokens": 4000,
        "top_p": 0.95,
        "timeout": 300,
        "rate_limit_calls": 10,
        "rate_limit_period": 60,
        "retries": 2,
    },
    "rag": {
        "chunks_file": "hormozi_books/chunks/all_chunks.json",
        "max_context_chunks": 5,
        "min_similarity": 0.02,
    },
    "graph": {
        "graph_file": "hormozi_books/graph/graph.json",
    },
    "persona": {
        "structured_fields": [
            "Guarantee", "Retention", "Grand Slam Offer", "Value Equation",
            "Risk Reversal", "Lead Generation", "Pricing Strategy",
            "Lifetime Value", "Sales Script", "Cold Outreach", "Starving Crowd"
        ],
        "sales_keywords": [
            'offer', 'guarantee', 'retention', 'lead', 'pricing', 'ltv',
            'grand slam', 'value equation', 'risk reversal', 'cold outreach',
            'sales script', 'conversion', 'funnel', 'campaign', 'acquisition',
            'diagnosis', 'audit', 'analyze', 'strategy', 'framework',
        ],
    }
}

def load_config(path: str = "config.toml") -> dict:
    """Load configuration from file with defaults."""
    config = dict(DEFAULT_CONFIG)
    if os.path.exists(path):
        try:
            import tomllib
            with open(path, "rb") as f:
                user = tomllib.load(f)
            # Deep merge
            for section, values in user.items():
                if section in config and isinstance(values, dict):
                    config[section].update(values)
                else:
                    config[section] = values
            log.info("config_loaded", path=path)
        except Exception as e:
            log.warn("config_load_failed", path=path, error=str(e))
    else:
        log.info("config_using_defaults")
    return config

CFG = load_config()

# ─── Plugin System (Probot-inspired) ─────────────────────────────
class BotPlugin:
    """Base class for bot plugins. Register event handlers via decorators."""
    
    def __init__(self, name: str):
        self.name = name
        self._handlers: Dict[str, List[Callable]] = {}
        self.log = StructuredLogger(name)
    
    def on(self, event: str):
        """Decorator: register handler for an event.
        
        Events: 'message', 'command:start', 'command:stats', 'command:help',
                'command:template', 'structured_query', 'casual_query'
        """
        def decorator(fn):
            self._handlers.setdefault(event, []).append(fn)
            return fn
        return decorator
    
    def get_handlers(self, event: str) -> List[Callable]:
        return self._handlers.get(event, [])
    
    async def handle_message(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Override to handle raw messages directly."""
        pass
    
    def get_command_handlers(self) -> Dict[str, Callable]:
        """Return dict of command_name -> handler for CommandHandler registration."""
        return {}


class BotEngine:
    """Core bot engine — inspired by Probot's architecture."""

    def __init__(self, token: str, config: dict = None):
        self.token = token
        self.config = config or CFG
        self.plugins: List[BotPlugin] = []
        self.log = StructuredLogger("bot_engine")
        self.rate_limiter = RateLimiter(
            self.config["ai"]["rate_limit_calls"],
            self.config["ai"]["rate_limit_period"]
        )
        self._app: Optional[Application] = None
    
    def register_plugin(self, plugin: BotPlugin):
        """Register a plugin (Probot-style: app = new Probot(); app.load(plugin))."""
        self.plugins.append(plugin)
        self.log.info("plugin_registered", name=plugin.name)
    
    def _emit(self, event: str, *args, **kwargs):
        """Emit an event to all registered plugin handlers (Probot's app.on())."""
        results = []
        for plugin in self.plugins:
            handlers = plugin.get_handlers(event)
            for handler in handlers:
                try:
                    results.append(handler(*args, **kwargs))
                except Exception as e:
                    self.log.error("handler_error", plugin=plugin.name, event=event, error=str(e))
        return results
    
    def build_app(self):
        """Build the Telegram Application with all plugin handlers."""
        self._app = Application.builder().token(self.token).build()
        app = self._app
        
        # Register command handlers from plugins
        for plugin in self.plugins:
            for cmd, handler in plugin.get_command_handlers().items():
                app.add_handler(CommandHandler(cmd, handler))
        
        # Register main message handler that routes to plugins
        async def router(update: Update, context: ContextTypes.DEFAULT_TYPE):
            text = (update.message.text or "").strip()
            if not text or text.startswith("/"):
                return
            
            self.log.info("incoming_message", text=text[:60])
            
            # Try each plugin's direct handle_message
            for plugin in self.plugins:
                if hasattr(plugin, 'handle_message'):
                    result = await plugin.handle_message(update, context)
                    if result:
                        return
            
            # Emit event for further processing
            self._emit("message", update, context)
        
        app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, router))
        
        # Error handler
        async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
            self.log.error("unhandled_error", error=str(context.error))
        
        app.add_error_handler(error_handler)
        
        return app
    
    async def start(self):
        """Start polling."""
        app = self.build_app()
        self.log.info("bot_starting", plugins=[p.name for p in self.plugins])
        await app.initialize()
        await app.start()
        await app.updater.start_polling()
        self.log.info("bot_running")
        # Keep running
        while True:
            await asyncio.sleep(60)
    
    def run(self):
        """Synchronous entry point."""
        asyncio.run(self.start())
