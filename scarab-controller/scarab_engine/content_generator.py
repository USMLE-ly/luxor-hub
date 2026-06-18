"""
Content generator — uses FABLE5/CL4R1T4S protocol via api_interact.py
for generating Quora answers and X posts.
Falls back to direct API call if api_interact.py subprocess fails.
"""
import os, sys, json, subprocess
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

API_INTERACT = str(PROJECT_ROOT / "api_interact.py")
API_URL = "https://opencode.ai/zen/v1/chat/completions"

# FABLE5 system prompt for content generation
FABLE5_QUORA_SYSTEM = """# ZORG-Ω — Content Generation Mode

You are generating content for Quora. Write as a knowledgeable human expert.

## Guidelines
- Write in natural, conversational English with personal experience
- Use specific examples and concrete details
- Avoid AI-sounding phrases, bullet-point lists, and overly structured formatting
- Write 200-500 words of genuine-sounding value
- Begin with a hook, provide real insight, end with a takeaway
- Never mention being an AI or language model
- Include personal anecdotes where natural
- Use paragraph breaks, not bullet points
- Vary sentence length and structure naturally

Current State: CONTENT MODE ACTIVE."""

FABLE5_X_SYSTEM = """# ZORG-Ω — Content Generation Mode

You are generating posts for X/Twitter. Write as a sharp, insightful human.

## Guidelines
- Maximum 280 characters (hard limit)
- One core insight per post
- Use hook, body, punch pattern
- Natural language, no AI tells
- No hashtags unless essential
- Include line breaks where natural
- No emoji overuse (max 1 per post)
- Write 10 engaging variants of the post
- Each variant should feel distinct in angle

Current State: CONTENT MODE ACTIVE."""


class ContentGenerator:
    """Generate content using FABLE5 protocol via api_interact.py."""

    def generate_quora_answer(self, topic: str, max_retries: int = 3) -> str:
        """Generate a Quora answer on the given topic."""
        prompt = (
            f"Write a detailed, human-sounding Quora answer about: {topic}\n\n"
            f"Write as someone with genuine experience. Include a personal story, "
            f"specific examples, and real insights. 300-500 words. "
            f"Use paragraphs, not bullet points. Do NOT mention being an AI."
        )
        return self._call_fable5(prompt, FABLE5_QUORA_SYSTEM, max_retries)

    def generate_x_post(self, topic: str, max_retries: int = 3) -> str:
        """Generate an X/Twitter post on the given topic."""
        prompt = (
            f"Write a sharp, engaging X/Twitter post about: {topic}\n\n"
            f"Maximum 280 characters. One powerful insight. "
            f"Natural human voice. No AI tells. Write 5 variants separated by ---"
        )
        return self._call_fable5(prompt, FABLE5_X_SYSTEM, max_retries)

    def _call_fable5(self, prompt: str, system_prompt: str, max_retries: int = 3) -> str:
        """Call api_interact.py with FABLE5 protocol, fallback to direct API."""
        # Method 1: Use api_interact.py subprocess
        try:
            result = subprocess.run(
                [sys.executable, API_INTERACT, "--fable5", prompt],
                capture_output=True, text=True, timeout=120, cwd=str(PROJECT_ROOT)
            )
            output = result.stdout
            # Extract content after "Response" section
            if "Response" in output:
                parts = output.split("Response")[-1]
                lines = parts.strip().split("\n")
                # Skip first line (separator) and get content
                content_lines = [l for l in lines if l.strip() and not l.startswith("──")]
                content = "\n".join(content_lines).strip()
                if len(content) > 50:
                    return content
        except Exception as e:
            print(f"[*] api_interact.py subprocess failed ({e}), trying direct API...")

        # Method 2: Direct API call fallback
        return self._direct_api_call(prompt, system_prompt, max_retries)

    def _direct_api_call(self, prompt: str, system_prompt: str, max_retries: int) -> str:
        """Direct API call to opencode.ai/zen/v1 as fallback."""
        import requests, time, random

        for attempt in range(max_retries):
            try:
                r = requests.post(
                    API_URL,
                    headers={"Content-Type": "application/json"},
                    json={
                        "model": "deepseek-v4-flash-free",
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": prompt},
                        ],
                        "reasoning_effort": "max",
                        "temperature": 0.9,
                        "max_tokens": 4000,
                    },
                    timeout=120,
                )
                if r.status_code == 429:
                    time.sleep(5 * (2 ** attempt))
                    continue
                r.raise_for_status()
                data = r.json()
                content = data["choices"][0]["message"]["content"]
                return content.strip()
            except Exception as e:
                if attempt < max_retries - 1:
                    time.sleep(2 * (2 ** attempt))
        return f"[Content generation failed after {max_retries} attempts]"
