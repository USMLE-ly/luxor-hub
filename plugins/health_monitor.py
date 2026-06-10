"""
💓 Health Monitor Plugin — Probot-inspired ping/health handler
Monitors bot uptime, message counts, API health, and provides keepalive.
"""
import time, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from bot_core import BotPlugin, StructuredLogger

log = StructuredLogger("health_monitor")

class HealthMonitor(BotPlugin):
    """Track bot health, uptime, and message stats."""
    
    def __init__(self):
        super().__init__("health")
        self.start_time = time.time()
        self.message_count = 0
        self.error_count = 0
        self.last_message_time = 0
        self.api_errors = 0
        self.api_calls = 0
        self.last_keepalive = time.time()
    
    @property
    def uptime(self) -> str:
        delta = time.time() - self.start_time
        hours, remainder = divmod(int(delta), 3600)
        minutes, seconds = divmod(remainder, 60)
        return f"{hours}h {minutes}m {seconds}s"
    
    def on(self, event: str):
        """Override to track events."""
        def decorator(fn):
            return fn
        return decorator
    
    async def handle_message(self, update, context) -> bool:
        self.message_count += 1
        self.last_message_time = time.time()
        return False  # Don't consume — let other plugins handle it
    
    async def health_check(self) -> dict:
        """Probot-style ping: returns bot health status."""
        return {
            "status": "ok",
            "uptime": self.uptime,
            "messages_processed": self.message_count,
            "errors": self.error_count,
            "api_calls": self.api_calls,
            "api_errors": self.api_errors,
            "last_message": time.ctime(self.last_message_time) if self.last_message_time else "none",
            "api_rate": f"{self.api_calls / max(time.time() - self.start_time, 1) * 3600:.1f}/hr" if self.api_calls else "0",
        }
    
    def get_command_handlers(self):
        from telegram.ext import CommandHandler
        
        async def cmd_health(update, context):
            h = await self.health_check()
            msg = (f"💓 **Bot Health**\n\n"
                   f"• Status: {'✅ Online' if h['status'] == 'ok' else '❌'}\n"
                   f"• Uptime: {h['uptime']}\n"
                   f"• Messages: {h['messages_processed']}\n"
                   f"• API calls: {h['api_calls']}\n"
                   f"• API errors: {h['api_errors']}\n"
                   f"• Last msg: {h['last_message']}\n"
                   f"• API rate: {h['api_rate']}")
            await update.message.reply_text(msg, parse_mode="Markdown")
        
        return {"health": cmd_health}
