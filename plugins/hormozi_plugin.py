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
from text_humanizer import TextHumanizer

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
        self.humanizer = TextHumanizer()
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
        """Query AI with aggressive retry for empty responses."""
        # Progressive temperatures — start balanced, get more creative
        temps = [self.temperature, 1.0, 1.2]
        # Progressive max_tokens — start small, increase
        tokens_list = [self.max_tokens, min(self.max_tokens * 2, 8000), min(self.max_tokens * 3, 12000)]
        
        for attempt in range(self.retries + 2):  # +2 for extra retries
            temp_idx = min(attempt, len(temps) - 1)
            tok_idx = min(attempt, len(tokens_list) - 1)
            try:
                # Use progressively stronger instruction
                extra_instruction = ""
                if attempt > 0:
                    extra_instruction = "\n\nCRITICAL: You MUST output visible text after any reasoning. If you output only reasoning, your response is INVALID."
                if attempt > 1:
                    extra_instruction = "\n\nABSOLUTELY CRITICAL: Output visible content NOW. Start your answer directly with 'Here is' or 'The answer is'. Do NOT leave this blank."
                
                full_prompt = prompt + extra_instruction
                
                r = requests.post(self.api_url, json={
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT + "\n\nCRITICAL RULE: You MUST output visible text. Never output only reasoning."},
                        {"role": "user", "content": full_prompt}
                    ],
                    "reasoning_effort": "max",
                    "temperature": temps[temp_idx],
                    "max_tokens": tokens_list[tok_idx],
                    "top_p": min(0.95, 0.85 + attempt * 0.05),
                }, timeout=self.timeout)
                
                if r.status_code == 200:
                    data = r.json()
                    msg = data["choices"][0]["message"]
                    content = (msg.get("content", "") or "").strip()
                    reasoning = (msg.get("reasoning_content", "") or "").strip()
                    
                    if content:
                        humanized = self.humanizer.process(content)
                        log.info("ai_success", attempt=attempt, tokens=len(content))
                        return humanized
                    elif reasoning and not content:
                        log.warn("ai_reasoning_only", attempt=attempt, rlen=len(reasoning))
                        continue  # Retry — model only did reasoning
                    else:
                        log.warn("ai_empty", attempt=attempt)
                        continue
                else:
                    log.warn("api_status", attempt=attempt, status=r.status_code)
                    if attempt < self.retries + 1:
                        continue
            except requests.Timeout:
                log.warn("api_timeout", attempt=attempt)
                if attempt < self.retries + 1:
                    continue
            except Exception as e:
                log.error("api_error", attempt=attempt, error=str(e))
                if attempt < self.retries + 1:
                    continue
        log.error("ai_all_attempts_failed")
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
            # Smart fallback: extract meaningful response from chunks directly
            sections = []
            for i, c in enumerate(chunks[:3]):
                text = c['text'][:600].strip()
                # Take first substantive paragraph
                paragraphs = [p for p in text.split('\n\n') if len(p.strip()) > 50]
                if paragraphs:
                    excerpt = paragraphs[0][:500]
                else:
                    excerpt = text[:500]
                sections.append(f"📖 From *{c['source']}*:\n\n{excerpt}")
            
            fallback = "\n\n---\n\n".join(sections)
            # Humanize the fallback
            try:
                from text_humanizer import TextHumanizer
                fallback = TextHumanizer().process(fallback)
            except:
                pass
            
            await update.message.reply_text(
                f"⚡ *Quick Answer (AI busy)*\n\n{fallback}",
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
