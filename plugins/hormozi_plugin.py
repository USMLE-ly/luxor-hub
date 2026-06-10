"""
🤵 Hormozi Sales Bot Plugin — structured + casual conversation
Plugin for BotEngine with dual-mode response system.
"""
import json, re, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import requests
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from telegram import Update
from telegram.ext import ContextTypes

from bot_core import BotPlugin, StructuredLogger, CFG

log = StructuredLogger("hormozi_plugin")

# ─── Template Fields ─────────────────────────────────────────────
TEMPLATE_FIELDS = [
    ("🎯", "Guarantee", "What risk reversal eliminates hesitation"),
    ("🔒", "Retention", "How customers are kept long-term"),
    ("🏆", "Grand Slam Offer", "The irresistible combination of value & risk reversal"),
    ("📊", "Value Equation", "Dream Outcome × Likelihood / Time × Effort"),
    ("🛡️", "Risk Reversal", "How risk is taken off the customer"),
    ("🧲", "Lead Generation", "How strangers become prospects"),
    ("💰", "Pricing Strategy", "Max perceived value pricing"),
    ("📈", "Lifetime Value", "Total customer revenue over time"),
    ("📝", "Sales Script", "Proven conversion sequence"),
    ("📞", "Cold Outreach", "Value-first cold contact"),
    ("🎯", "Starving Crowd", "Target audience actively seeking solutions"),
]

SYSTEM_PROMPT = """[SYSTEM-OVERRIDE: ALEX HORMOZI PERSONA]
- PERSONA: Alex Hormozi — #1 on sales, offers, and lead gen.
- RULES: Only use the CONTEXT from my books. Never invent.
- Speak as "I" and "my" — direct, confident, no fluff.
- Include specific numbers, frameworks, and dollar amounts.
- CRITICAL: Always output visible content after reasoning."""

# ─── RAG Engine ──────────────────────────────────────────────────
class RAGEngine:
    def __init__(self, chunks_file: str = None):
        path = chunks_file or CFG["rag"]["chunks_file"]
        with open(path) as f:
            self.chunks = json.load(f)
        
        texts = [c['text'] for c in self.chunks]
        self.vectorizer = TfidfVectorizer(max_features=5000, stop_words='english', ngram_range=(1,2))
        self.tfidf_matrix = self.vectorizer.fit_transform(texts)
        log.info("rag_loaded", chunks=len(self.chunks), shape=str(self.tfidf_matrix.shape))
    
    def retrieve(self, query: str, top_k: int = None):
        k = top_k or CFG["rag"]["max_context_chunks"]
        query_vec = self.vectorizer.transform([query])
        scores = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
        results = []
        for idx in scores.argsort()[::-1]:
            if scores[idx] < CFG["rag"]["min_similarity"]:
                break
            results.append({
                'score': float(scores[idx]),
                'text': self.chunks[idx]['text'],
                'source': self.chunks[idx].get('source', ''),
            })
            if len(results) >= k:
                break
        return results

# ─── Graph Engine ────────────────────────────────────────────────
class GraphEngine:
    def __init__(self, graph_file: str = None):
        path = graph_file or CFG["graph"]["graph_file"]
        with open(path) as f:
            self.graph = json.load(f)
        self.nodes = {n['id']: n for n in self.graph['nodes']}
        self.adj = {}
        for e in self.graph['edges']:
            self.adj.setdefault(e['source'], set()).add(e['target'])
            self.adj.setdefault(e['target'], set()).add(e['source'])
        log.info("graph_loaded", nodes=len(self.nodes), edges=len(self.graph['edges']))
    
    def get_field_data(self):
        data = {}
        for emoji, field_name, hint in TEMPLATE_FIELDS:
            field_id = field_name.lower().replace(' ', '_')
            n = self.nodes.get(field_id) or self.nodes.get(field_name.lower().replace(' ', ''))
            data[field_name] = {
                'emoji': emoji, 'hint': hint,
                'description': n['metadata'].get('description','')[:300] if n else "Not in graph.",
                'connected': [self.nodes.get(t,{}).get('label',t) for t in self.adj.get(field_id, set())][:6] if n else []
            }
        return data

# ─── Hormozi Plugin ──────────────────────────────────────────────
class HormoziPlugin(BotPlugin):
    """Alex Hormozi sales bot with structured + casual modes."""
    
    def __init__(self):
        super().__init__("hormozi")
        self.rag = RAGEngine()
        self.graph = GraphEngine()
        self._setup_handlers()
    
    def _setup_handlers(self):
        """Register event handlers (Probot-style)."""
        ai_cfg = CFG["ai"]
        self.api_url = ai_cfg["endpoint"]
        self.model = ai_cfg["model"]
        self.temperature = ai_cfg["temperature"]
        self.max_tokens = ai_cfg["max_tokens"]
        self.top_p = ai_cfg["top_p"]
        self.timeout = ai_cfg["timeout"]
        self.retries = ai_cfg["retries"]
    
    def _is_sales_query(self, text: str) -> bool:
        text_lower = text.lower()
        if re.search(r'(template|diagnosis|audit|analyze|breakdown|structured|full\s*analysis)', text_lower):
            return True
        kw = sum(1 for k in CFG["persona"]["sales_keywords"] if k in text_lower)
        casual = ['hi', 'hello', 'how are you', 'who are you', 'what can you', 'thanks', 'hey']
        cc = sum(1 for c in casual if c in text_lower)
        if cc > 0 and kw == 0:
            return False
        return kw >= 1 or len(text_lower.split()) <= 3
    
    def _build_prompt(self, question: str, chunks: list, structured: bool) -> str:
        ctx = "\n\n".join(f"[{c['source']}]\n{c['text'][:700]}" for c in chunks[:CFG["rag"]["max_context_chunks"]])
        
        if structured:
            fd = self.graph.get_field_data()
            template = "\n".join(f"{d['emoji']} **{n}:** [Fill from context]"
                               for n, d in fd.items())
            return f"""[SYSTEM-OVERRIDE: ALEX HORMOZI STRUCTURED DIAGNOSIS]

CONTEXT:
{ctx}

QUESTION: {question}

Fill this template using ONLY the context:

{template}

Then explain in your voice below. Include specific numbers."""
        else:
            return f"""[SYSTEM-OVERRIDE: ALEX HORMOZI CASUAL]

CONTEXT:
{ctx}

QUESTION: {question}

Answer as Alex Hormozi — direct, specific numbers, no fluff. 2-3 paragraphs."""
    
    def _query_ai(self, prompt: str) -> str | None:
        for attempt in range(self.retries + 1):
            try:
                r = requests.post(self.api_url, json={
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": self.temperature,
                    "max_tokens": self.max_tokens,
                    "top_p": self.top_p,
                }, timeout=self.timeout)
                if r.status_code == 200:
                    content = r.json()["choices"][0]["message"].get("content", "").strip()
                    if content:
                        return re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL).strip()
                elif attempt < self.retries:
                    log.warn("api_retry", attempt=attempt+1, status=r.status_code)
                    continue
            except Exception as e:
                if attempt < self.retries:
                    log.warn("api_retry_error", attempt=attempt+1, error=str(e))
                    continue
                log.error("api_failed", error=str(e))
        return None
    
    def _format_structured(self, response: str) -> str:
        if not response:
            return None
        fd = self.graph.get_field_data()
        missing = [n for n in fd if f"**{n}**" not in response]
        if missing:
            header = "📋 **Sales Diagnosis**\n\n"
            for n in missing:
                d = fd[n]
                header += f"{d['emoji']} **{n}:**\nNot directly covered in this material.\n\n"
            response = header + response
        return response
    
    # ─── Message Handler ─────────────────────────────────────────
    async def handle_message(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> bool:
        question = update.message.text.strip()
        if not question:
            return False
        
        await update.message.reply_chat_action("typing")
        self.log.info("processing", text=question[:60])
        
        chunks = self.rag.retrieve(question)
        if not chunks:
            await update.message.reply_text(
                "Ask me about sales, offers, lead gen, or pricing — I've got those covered."
            )
            return True
        
        structured = self._is_sales_query(question)
        prompt = self._build_prompt(question, chunks, structured)
        response = self._query_ai(prompt)
        
        sources = list(set(c['source'] for c in chunks))
        
        if response:
            if structured:
                response = self._format_structured(response)
            full = f"📖 *Sources:* {', '.join(sources)}\n\n{response}"
            for i in range(0, len(full), 4000):
                await update.message.reply_text(full[i:i+4000], parse_mode="Markdown")
        else:
            best = chunks[0]
            await update.message.reply_text(
                f"📖 From *{best['source']}*:\n\n{best['text'][:3000]}",
                parse_mode="Markdown"
            )
        return True
    
    def get_command_handlers(self):
        """Register commands."""

        async def cmd_start(update, context):
            await update.message.reply_text(
                "🤵 *Alex Hormozi AI* — I've read all his books.\n"
                "Ask me about sales, offers, lead gen, or pricing.\n\n"
                "Commands:\n"
                "• `/template your question` — Structured diagnosis\n"
                "• `/stats` — Knowledge base info"
            )
        
        async def cmd_stats(update, context):
            chunks = self.rag.chunks
            srcs = {}
            for c in chunks:
                s = c.get('source', 'unknown')
                srcs[s] = srcs.get(s, 0) + 1
            total_words = sum(c.get('words', 0) for c in chunks)
            msg = (f"📚 *Alex Hormozi Knowledge Base*\n"
                   f"• {len(chunks)} sections from {len(srcs)} books\n"
                   f"• {total_words:,} total words\n"
                   f"• Graph: {len(self.graph.nodes)} concepts\n"
                   f"• Model: deepseek-v4-flash-free")
            await update.message.reply_text(msg, parse_mode="Markdown")
        
        async def cmd_template(update, context):
            args = context.args
            if not args:
                await update.message.reply_text("Usage: /template your question")
                return
            question = " ".join(args)
            update.message.text = question
            await self.handle_message(update, context)
        
        return {
            "start": cmd_start,
            "stats": cmd_stats,
            "template": cmd_template,
            "help": cmd_start,
        }
