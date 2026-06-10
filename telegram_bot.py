#!/usr/bin/env python3
"""
🤖 Telegram AI Bot — reads messages and replies intelligently.
Uses deepseek-v4-flash-free via OpenCode Zen (free, no API key needed)
or falls back to OpenAI if you set OPENAI_API_KEY.
"""

import os
import sys
import json
import asyncio
import logging
import requests
from datetime import datetime

from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

# ─── Configuration ───────────────────────────────────────────────

TELEGRAM_TOKEN = os.environ.get('TELEGRAM_TOKEN', '')
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')
OPENCODE_ZEN_URL = "https://opencode.ai/zen/v1/chat/completions"

# Bot personality (matches the n8n workflow's system prompt)
SYSTEM_PROMPT = (
    "You are a friendly chatbot. "
    "First, detect the user's language from their message. "
    "Reply in the same language they wrote in. "
    "Include several suitable emojis in your answer. "
    "Keep responses concise and natural."
)

# ─── Logging ─────────────────────────────────────────────────────

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# ─── AI Response Functions ───────────────────────────────────────

def get_ai_response(user_message: str, user_name: str = "Friend") -> str:
    """
    Get an AI response using OpenCode Zen (free) or OpenAI as fallback.
    Matches the logic from the n8n Telegram AI-bot workflow.
    """
    system = f"{SYSTEM_PROMPT}\nUser name is {user_name}."

    # Try OpenCode Zen first (free, no key needed)
    try:
        payload = {
            "model": "deepseek-v4-flash-free",
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user_message}
            ],
            "reasoning_effort": "max",
            "temperature": 0.8,
            "max_tokens": 500
        }
        r = requests.post(OPENCODE_ZEN_URL, json=payload, timeout=60)
        if r.status_code == 200:
            data = r.json()
            content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            # If content is empty but reasoning exists, use reasoning
            if not content:
                content = data.get("choices", [{}])[0].get("message", {}).get("reasoning_content", "")
            if content:
                return content.strip()
    except Exception as e:
        logger.warning(f"OpenCode Zen failed: {e}")

    # Fallback to OpenAI if key is set
    if OPENAI_API_KEY:
        try:
            import openai
            client = openai.OpenAI(api_key=OPENAI_API_KEY)
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user_message}
                ],
                max_tokens=500,
                temperature=0.8
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.warning(f"OpenAI failed: {e}")

    return None

def generate_image(prompt: str) -> str | None:
    """Generate an image using DALL-E (requires OpenAI key)."""
    if not OPENAI_API_KEY:
        return None
    try:
        import openai
        client = openai.OpenAI(api_key=OPENAI_API_KEY)
        response = client.images.generate(
            model="dall-e-2",
            prompt=prompt,
            size="512x512",
            n=1
        )
        return response.data[0].url
    except Exception as e:
        logger.warning(f"Image generation failed: {e}")
        return None

# ─── Welcome / greeting ──────────────────────────────────────────

def get_greeting(user_name: str) -> str:
    """Generate a welcome message for /start."""
    return (
        f"👋 Hello {user_name}! Welcome! 🤗\n\n"
        f"I'm an AI-powered bot 🤖 I can:\n"
        f"• 💬 Chat with you — just send any message\n"
        f"• 🎨 Generate images — use /image <description>\n\n"
        f"Let's get started! 😊"
    )

# ─── Handlers ────────────────────────────────────────────────────

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /start command."""
    user = update.effective_user
    greeting = get_greeting(user.first_name or "Friend")
    await update.message.reply_text(greeting)

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /help command."""
    help_text = (
        "🤖 *Available Commands*\n\n"
        "• `/start` — Welcome message\n"
        "• `/help` — Show this help\n"
        "• `/image <prompt>` — Generate an image\n"
        "• *Any message* — I'll reply intelligently!\n\n"
        "I auto-detect your language and reply in the same language 😊"
    )
    await update.message.reply_text(help_text, parse_mode="Markdown")

async def image_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /image command — generate DALL-E image."""
    prompt = " ".join(context.args) if context.args else ""
    if not prompt:
        await update.message.reply_text(
            "🎨 Please provide an image description!\n"
            "Example: `/image a cat wearing a hat`",
            parse_mode="Markdown"
        )
        return

    await update.message.reply_chat_action("typing")
    image_url = generate_image(prompt)
    
    if image_url:
        await update.message.reply_photo(photo=image_url, caption=f"🎨 *{prompt}*", parse_mode="Markdown")
    else:
        await update.message.reply_text(
            "❌ Sorry, image generation failed. "
            "Make sure an OpenAI API key is configured."
        )

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle regular text messages — the core 'read and reply' logic."""
    user = update.effective_user
    user_message = update.message.text
    user_name = user.first_name or "Friend"

    if not user_message:
        return

    # Show typing indicator while we think
    await update.message.reply_chat_action("typing")

    # Get AI response
    response = get_ai_response(user_message, user_name)

    if response:
        await update.message.reply_text(response)
    else:
        # Fallback: echo if AI is unavailable
        await update.message.reply_text(
            f"👋 Hey {user_name}! Thanks for your message 😊\n\n"
            f"You said: _{user_message}_\n\n"
            f"_AI response unavailable — try again in a moment._",
            parse_mode="Markdown"
        )

async def handle_photo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle photo messages."""
    await update.message.reply_text(
        "📸 Nice photo! Though I can't see it yet, "
        "I got your image. Send me text to chat!"
    )

async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle errors gracefully."""
    logger.error(f"Update {update} caused error {context.error}")
    if update and update.effective_message:
        await update.effective_message.reply_text(
            "❌ Sorry, something went wrong. Please try again!"
        )

# ─── Main ────────────────────────────────────────────────────────

def main():
    token = TELEGRAM_TOKEN or "8758115339:AAHH6gAIHmSo7Qf_VMc_HmBxz2Jy8w_1mtM"
    
    if not token or token == "YOUR_TOKEN_HERE":
        print("❌ No Telegram token found!")
        print("   Set TELEGRAM_TOKEN environment variable or edit this script.")
        sys.exit(1)

    # Build application
    app = Application.builder().token(token).build()

    # Register handlers
    app.add_handler(CommandHandler("start", start_command))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(CommandHandler("image", image_command))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    app.add_handler(MessageHandler(filters.PHOTO, handle_photo))
    app.add_error_handler(error_handler)

    print(f"🤖 Bot started! Message @Al_bosifybot on Telegram")
    print(f"   Using OpenCode Zen API (free) for AI responses")
    if OPENAI_API_KEY:
        print(f"   OpenAI fallback: ✅ configured")
    else:
        print(f"   OpenAI fallback: ❌ not set (image gen won't work)")
    print(f"   Press Ctrl+C to stop")
    print()

    # Start polling
    app.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()
