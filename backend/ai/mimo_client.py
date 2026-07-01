"""MiMo Vision 2.5 client — single provider, single implementation, no fallbacks."""

import json
import logging
import re
from typing import Any, Optional, Dict, List

import requests
from backend.config import MIMO_API_KEY, MIMO_API_URL, MIMO_VISION_MODEL, MIMO_TEXT_MODEL
from backend.image.preprocess import compress_image_b64

_log = logging.getLogger("luxor.mimo")


def _extract_first_json(text: str) -> Optional[str]:
    """Find the first complete JSON object using brace-matching.
    
    Counts braces to handle nested objects properly instead of fragile regex.
    """
    start = text.find("{")
    if start == -1:
        return None
    depth = 0
    for i in range(start, len(text)):
        if text[i] == "{":
            depth += 1
        elif text[i] == "}":
            depth -= 1
            if depth == 0:
                return text[start:i + 1]
    return None


def call_mimo_vision(
    image_b64: str,
    system_prompt: str,
    temperature: float = 0.2,
) -> Optional[Dict[str, Any]]:
    """Call MiMo V2.5 Vision — single provider, no fallbacks.
    
    Logs every stage. Returns parsed dict or None (never fake data).
    """
    if not MIMO_API_KEY:
        _log.error("[MIMO] No MIMO_API_KEY configured")
        return None

    _log.info("[MIMO] Stage 1/6: Compressing image")
    compressed = compress_image_b64(image_b64)

    _log.info("[MIMO] Stage 2/6: Building request (model=%s, %d KB)", MIMO_VISION_MODEL, len(compressed) // 1024)
    headers = {
        "Content-Type": "application/json",
        "api-key": MIMO_API_KEY,
        "HTTP-Referer": "https://luxor.ly",
        "X-Title": "LuxorHub",
    }
    vision_payload = {
        "model": MIMO_VISION_MODEL,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": system_prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{compressed}"}},
                ],
            }
        ],
        "max_tokens": 8192,
        "temperature": temperature,
    }

    _log.info("[MIMO] Stage 3/6: Sending to MiMo API")
    try:
        resp = requests.post(MIMO_API_URL, json=vision_payload, headers=headers, timeout=120)
        _log.info("[MIMO] Stage 4/6: Response HTTP %s", resp.status_code)

        if resp.status_code == 402:
            _log.error("[MIMO] Insufficient balance — check API key credits")
            return None
        if resp.status_code != 200:
            _log.error("[MIMO] API returned %s: %s", resp.status_code, resp.text[:200])
            return None

        data = resp.json()
        choice = data["choices"][0]["message"]
        finish = data["choices"][0].get("finish_reason", "")
        content_text = choice.get("content", "")
        reasoning_text = choice.get("reasoning_content", "")
        _log.info(
            "[MIMO] Stage 5/6: finish=%s content=%d chars reasoning=%d chars",
            finish, len(content_text), len(reasoning_text),
        )

        raw = content_text.strip() or reasoning_text.strip()
        if not raw:
            _log.error("[MIMO] Empty response from MiMo")
            return None

        # Strip markdown code fences
        raw_clean = re.sub(r'^```(?:json)?\s*', '', raw.strip())
        raw_clean = re.sub(r'\s*```$', '', raw_clean)
        raw_clean = raw_clean.strip()

        # Extract JSON using balanced brace parsing
        json_str = _extract_first_json(raw_clean)
        if not json_str:
            _log.error("[MIMO] No JSON object found in response")
            return None

        try:
            parsed = json.loads(json_str)
            if not parsed or not isinstance(parsed, dict):
                _log.error("[MIMO] Parsed JSON is not a dict")
                return None
            parsed["source"] = "cipher_vision"
            top = parsed.get("top_type") or parsed.get("top", "")
            bottom = parsed.get("bottom_type") or parsed.get("bottom", "")
            _log.info(
                "[MIMO] Stage 6/6: OK keys=%s top=%s bottom=%s",
                list(parsed.keys())[:5], top or "(not an outfit)", bottom or "(not an outfit)",
            )
            return parsed
        except json.JSONDecodeError:
            _log.error("[MIMO] JSON parse failed — response may be truncated")
            return None

    except requests.exceptions.Timeout:
        _log.error("[MIMO] Timeout after 120s")
        return None
    except requests.exceptions.ConnectionError as e:
        _log.error("[MIMO] Connection error: %s", e)
        return None
    except Exception as exc:
        _log.error("[MIMO] Unexpected error: %s", exc)
        return None


def call_mimo_text(
    messages: List[Dict[str, str]],
    system_prompt: str = "",
    temperature: float = 0.7,
    timeout: int = 30,
    max_tokens: Optional[int] = None,
    model: Optional[str] = None,
) -> Any:
    """Call MiMo text completion — used by stylist, dressing room, etc."""
    if not MIMO_API_KEY:
        return None

    headers = {
        "Content-Type": "application/json",
        "api-key": MIMO_API_KEY,
        "HTTP-Referer": "https://luxor.ly",
        "X-Title": "LuxorHub",
    }

    models_to_try = [model] if model else [MIMO_TEXT_MODEL]
    from backend.config import CIPHER_MAX_TOKENS

    for model_name in models_to_try:
        groq_messages = []
        if system_prompt:
            groq_messages.append({"role": "system", "content": system_prompt})
        groq_messages.extend(messages)
        payload = {
            "model": model_name,
            "messages": groq_messages,
            "max_tokens": max_tokens if max_tokens is not None else CIPHER_MAX_TOKENS,
            "temperature": temperature,
        }
        try:
            _log.info("[MIMO-TEXT] Trying model=%s", model_name)
            resp = requests.post(MIMO_API_URL, json=payload, headers=headers, timeout=timeout)
            _log.info("[MIMO-TEXT] HTTP %s for %s (key=%s...)",
                      resp.status_code, model_name, MIMO_API_KEY[:8] if MIMO_API_KEY else "NONE")
            if resp.status_code == 200:
                choice = resp.json()["choices"][0]["message"]
                content_text = choice.get("content", "")
                reasoning_text = choice.get("reasoning_content", "")
                raw = content_text.strip()
                if not raw:
                    raw = reasoning_text.strip()
                    _log.info("[MIMO-TEXT] Using reasoning_content (content was empty)")
                raw = raw.strip()
                _log.info("[MIMO-TEXT] Raw response (first 100): %s", raw[:100])
                # Strip markdown code block wrappers
                while raw.startswith("```"):
                    first_nl = raw.find("\n")
                    if first_nl >= 0:
                        raw = raw[first_nl + 1:]
                    else:
                        raw = ""
                        break
                raw = raw.strip()
                # Try JSON first, fall back to raw text
                try:
                    return json.loads(raw)
                except (json.JSONDecodeError, ValueError):
                    return raw
            elif resp.status_code == 402:
                _log.warning("[MIMO-TEXT] Insufficient balance")
                continue
            else:
                _log.warning("[MIMO-TEXT] HTTP %s for %s", resp.status_code, model_name)
                continue
        except requests.exceptions.Timeout:
            _log.warning("[MIMO-TEXT] Timeout for %s", model_name)
            continue
        except Exception as exc:
            _log.error("[MIMO-TEXT] %s", exc)
            continue

    _log.warning("[MIMO-TEXT] All models exhausted")
    return None
