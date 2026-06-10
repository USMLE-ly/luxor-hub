"""
Tests for Bot Core — Probot-inspired testing approach.
"""
import sys, os, json, tempfile, asyncio
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import pytest
from bot_core import BotEngine, BotPlugin, StructuredLogger, RateLimiter, load_config, CFG

# ─── Test StructuredLogger ───────────────────────────────────────

class TestStructuredLogger:
    def test_logger_creation(self):
        log = StructuredLogger("test")
        assert log.name == "test"
        assert log.threshold == 20  # INFO
    
    def test_logger_debug_not_shown(self):
        log = StructuredLogger("test", "ERROR")
        assert log.threshold == 40


# ─── Test RateLimiter ────────────────────────────────────────────

class TestRateLimiter:
    @pytest.mark.asyncio
    async def test_rate_limiter_acquire(self):
        limiter = RateLimiter(max_calls=5, period=60.0)
        for _ in range(5):
            wait = await limiter.acquire()
            assert wait == 0.0
    
    def test_rate_limiter_structure(self):
        limiter = RateLimiter(max_calls=10, period=60.0)
        assert limiter.max_calls == 10
        assert limiter.period == 60.0


# ─── Test Config ─────────────────────────────────────────────────

class TestConfig:
    def test_default_config_exists(self):
        assert "bot" in CFG
        assert "ai" in CFG
        assert "rag" in CFG
        assert "graph" in CFG
        assert "persona" in CFG
    
    def test_ai_config(self):
        assert CFG["ai"]["model"] == "deepseek-v4-flash-free"
        assert CFG["ai"]["temperature"] == 0.9
        assert CFG["ai"]["retries"] == 2
    
    def test_sales_keywords_exist(self):
        kws = CFG["persona"]["sales_keywords"]
        assert "offer" in kws
        assert "guarantee" in kws
        assert "lead" in kws
    
    def test_load_config_missing_file(self):
        cfg = load_config("/nonexistent/config.toml")
        assert cfg == CFG  # Falls back to defaults
    
    def test_load_config_with_file(self):
        with tempfile.NamedTemporaryFile(mode='w', suffix='.toml', delete=False) as f:
            f.write('[ai]\ntemperature = 0.5\n')
            tmp = f.name
        cfg = load_config(tmp)
        os.unlink(tmp)
        assert cfg["ai"]["temperature"] == 0.5  # Overridden
        assert cfg["bot"]["polling_timeout"] == 30  # From defaults


# ─── Test BotPlugin System ───────────────────────────────────────

class TestBotPlugins:
    def test_plugin_base(self):
        plugin = BotPlugin("test_plugin")
        assert plugin.name == "test_plugin"
        assert plugin._handlers == {}
    
    def test_plugin_event_handlers(self):
        plugin = BotPlugin("test_plugin")
        
        @plugin.on("message")
        def handler(msg):
            return f"got: {msg}"
        
        handlers = plugin.get_handlers("message")
        assert len(handlers) == 1
        assert handlers[0]("hello") == "got: hello"
    
    def test_plugin_multiple_events(self):
        plugin = BotPlugin("test_plugin")
        
        @plugin.on("message")
        def h1(msg): pass
        
        @plugin.on("command:start")
        def h2(): pass
        
        assert len(plugin.get_handlers("message")) == 1
        assert len(plugin.get_handlers("command:start")) == 1
        assert len(plugin.get_handlers("nonexistent")) == 0


# ─── Test RAG (if chunks exist) ──────────────────────────────────

@pytest.mark.skipif(not os.path.exists("hormozi_books/chunks/all_chunks.json"),
                    reason="No chunks file available")
class TestRAG:
    def test_rag_loads(self):
        from plugins.hormozi_plugin import RAGEngine
        rag = RAGEngine()
        assert len(rag.chunks) > 0
        assert hasattr(rag, 'tfidf_matrix')
    
    def test_rag_retrieve(self):
        from plugins.hormozi_plugin import RAGEngine
        rag = RAGEngine()
        results = rag.retrieve("guarantee")
        assert len(results) > 0
        assert 'score' in results[0]
        assert 'text' in results[0]
        assert 'source' in results[0]
    
    def test_rag_empty_query(self):
        from plugins.hormozi_plugin import RAGEngine
        rag = RAGEngine()
        results = rag.retrieve("")
        assert len(results) == 0


# ─── Test Graph ──────────────────────────────────────────────────

@pytest.mark.skipif(not os.path.exists("hormozi_books/graph/graph.json"),
                    reason="No graph file available")
class TestGraph:
    def test_graph_loads(self):
        from plugins.hormozi_plugin import GraphEngine
        graph = GraphEngine()
        assert len(graph.nodes) > 0
        assert len(graph.adj) > 0
    
    def test_graph_field_data(self):
        from plugins.hormozi_plugin import GraphEngine
        graph = GraphEngine()
        fd = graph.get_field_data()
        assert len(fd) >= 11  # All template fields
        for name, data in fd.items():
            assert 'emoji' in data
            assert 'description' in data
            assert len(data['description']) > 20  # Should be enriched
    
    def test_graph_connected_concepts(self):
        from plugins.hormozi_plugin import GraphEngine
        graph = GraphEngine()
        fd = graph.get_field_data()
        guarantee = fd.get('Guarantee', {})
        assert 'connected' in guarantee


# ─── Test Sales Detection ────────────────────────────────────────

@pytest.mark.skipif(not os.path.exists("hormozi_books/graph/graph.json"),
                    reason="No graph file")
class TestSalesDetection:
    @classmethod
    def setup_class(cls):
        from plugins.hormozi_plugin import HormoziPlugin
        cls.plugin = HormoziPlugin()
    
    def setup_method(self):
        pass  # Plugin already loaded in setup_class
    
    def test_sales_query_detected(self):
        assert self.plugin._is_sales_query("What guarantee should I offer?") == True
        assert self.plugin._is_sales_query("Analyze my pricing strategy") == True
        assert self.plugin._is_sales_query("How do I generate leads?") == True
    
    def test_casual_query(self):
        assert self.plugin._is_sales_query("Hello, who are you?") == False
        assert self.plugin._is_sales_query("Hi there") == False
    
    def test_edge_cases(self):
        assert self.plugin._is_sales_query("What is a grand slam offer?") == True
        assert self.plugin._is_sales_query("Template my business") == True
    
    def test_short_queries(self):
        assert self.plugin._is_sales_query("hi") == False
        assert self.plugin._is_sales_query("sales") == True
