#!/usr/bin/env python3
"""
🤖 SHANNON-Ω Hormozi Bot — Plugin-based Telegram Bot
Inspired by Probot's architecture: plugins, structured logging, rate limiting, config-as-code.

Usage:
  python3 run_bot.py                    # Start bot
  python3 run_bot.py --health           # One-shot health check
  python3 run_bot.py --stats            # One-shot stats
"""
import os, sys, json

from bot_core import BotEngine, StructuredLogger, CFG
from plugins.hormozi_plugin import HormoziPlugin
from plugins.health_monitor import HealthMonitor as HM

log = StructuredLogger("main")

def main():
    token = os.environ.get('TELEGRAM_TOKEN', '8758115339:AAHH6gAIHmSo7Qf_VMc_HmBxz2Jy8w_1mtM')
    
    if '--health' in sys.argv:
        import asyncio
        hm = HM()
        h = asyncio.run(hm.health_check())
        print(json.dumps(h, indent=2))
        return
    
    if '--stats' in sys.argv:
        from plugins.hormozi_plugin import RAGEngine, GraphEngine
        rag = RAGEngine()
        graph = GraphEngine()
        srcs = {}
        for c in rag.chunks:
            s = c.get('source', 'unknown')
            srcs[s] = srcs.get(s, 0) + 1
        print(f"📚 Chunks: {len(rag.chunks)}")
        print(f"📊 Graph nodes: {len(graph.nodes)} edges: {len(graph.adj)}")
        print(f"📖 Books: {', '.join(sorted(srcs.keys()))}")
        print(f"📝 Total words: {sum(c.get('words',0) for c in rag.chunks):,}")
        return
    
    print("🚀 SHANNON-Ω Bot starting...")
    print(f"📡 Plugins: hormozi, health")
    
    engine = BotEngine(token)
    engine.register_plugin(HormoziPlugin())
    engine.register_plugin(HM())
    
    log.info("bot_initialized", plugins=["hormozi", "health"])
    
    try:
        engine.run()
    except KeyboardInterrupt:
        log.info("bot_stopped")
    except Exception as e:
        log.fatal("bot_crashed", error=str(e))
        raise

if __name__ == "__main__":
    main()
