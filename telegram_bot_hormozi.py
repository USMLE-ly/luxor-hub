#!/usr/bin/env python3
"""
🤖 SHANNON-Ω Hormozi AI Bot — RAG-powered Telegram bot
Structured sales diagnosis + casual Alex Hormozi conversation.
Uses deepseek-v4-flash-free via OpenCode Zen (no auth needed).
"""

import os, json, logging, re, asyncio
import numpy as np
import requests
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

TELEGRAM_TOKEN = os.environ.get('TELEGRAM_TOKEN', '8758115339:AAHH6gAIHmSo7Qf_VMc_HmBxz2Jy8w_1mtM')
OPENCODE_ZEN_URL = "https://opencode.ai/zen/v1/chat/completions"
CHUNKS_FILE = "hormozi_books/chunks/all_chunks.json"
GRAPH_FILE = "hormozi_books/graph/graph.json"
MAX_CONTEXT_CHUNKS = 5

logging.basicConfig(format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO)
logger = logging.getLogger(__name__)

# ─── Structured Template Fields ───
TEMPLATE_FIELDS = [
    ("🎯", "Guarantee", "What risk reversal or guarantee is offered to eliminate hesitation"),
    ("🔒", "Retention", "How customers are kept long-term through value delivery"),
    ("🏆", "Grand Slam Offer", "The irresistible combination of value, risk reversal, and differentiation"),
    ("📊", "Value Equation", "Value = (Dream Outcome × Perceived Likelihood) / (Time Delay × Effort & Sacrifice)"),
    ("🛡️", "Risk Reversal", "How all risk is taken off the customer and put onto the business"),
    ("🧲", "Lead Generation", "How strangers are attracted and turned into prospects"),
    ("💰", "Pricing Strategy", "How pricing is structured for maximum perceived value"),
    ("📈", "Lifetime Value", "Total revenue a customer generates over their entire relationship"),
    ("📝", "Sales Script", "The proven sequence of words that converts prospects into buyers"),
    ("📞", "Cold Outreach", "How to contact strangers who haven't heard of you with value-first approach"),
    ("🎯", "Starving Crowd", "The group actively searching for a solution to a problem they know they have"),
]

# ─── SHANNON-Ω System Prompt ───
SYSTEM_OVERRIDE = """[SYSTEM-OVERRIDE: ALEX HORMOZI PERSONA]
- PERSONA: Alex Hormozi — #1 on sales, offers, and lead gen.
- RULES: Only use the CONTEXT from my books. Never invent.
- Speak as "I" and "my" — direct, confident, no fluff.
- Include specific numbers, frameworks, and dollar amounts.
- Give actionable scripts and steps where available.
- CRITICAL: You MUST output visible content after your reasoning. Never leave the response blank."""

# ─── RAG Engine ──────────────────────────────────────────────────

class HormoziRAG:
    def __init__(self):
        with open(CHUNKS_FILE) as f:
            self.chunks = json.load(f)
        logger.info(f"Loaded {len(self.chunks)} chunks")
        
        texts = [c['text'] for c in self.chunks]
        self.vectorizer = TfidfVectorizer(max_features=5000, stop_words='english', ngram_range=(1, 2))
        self.tfidf_matrix = self.vectorizer.fit_transform(texts)
        logger.info(f"TF-IDF index built: {self.tfidf_matrix.shape}")
        
        self.source_counts = {}
        for c in self.chunks:
            s = c.get('source', 'unknown')
            self.source_counts[s] = self.source_counts.get(s, 0) + 1
    
    def retrieve(self, query: str, top_k: int = MAX_CONTEXT_CHUNKS):
        query_vec = self.vectorizer.transform([query])
        scores = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
        top_idx = scores.argsort()[::-1]
        results = []
        for idx in top_idx:
            if scores[idx] < 0.02:
                break
            results.append({
                'score': float(scores[idx]),
                'text': self.chunks[idx]['text'],
                'source': self.chunks[idx].get('source', ''),
            })
            if len(results) >= top_k:
                break
        return results
    
    def get_stats(self):
        total_words = sum(c.get('words', 0) for c in self.chunks)
        return (
            f"📚 *Alex Hormozi Knowledge Base*\n"
            f"• {len(self.chunks)} sections from {len(self.source_counts)} books\n"
            f"• {total_words:,} total words parsed\n"
            f"• Books: {', '.join(sorted(self.source_counts.keys()))}"
        )

# ─── Graph Engine ────────────────────────────────────────────────

class GraphEngine:
    def __init__(self):
        with open(GRAPH_FILE) as f:
            self.graph = json.load(f)
        self.nodes = {n['id']: n for n in self.graph['nodes']}
        self.adj = {}
        for e in self.graph['edges']:
            self.adj.setdefault(e['source'], set()).add(e['target'])
            self.adj.setdefault(e['target'], set()).add(e['source'])
        logger.info(f"Graph loaded: {len(self.nodes)} nodes, {len(self.graph['edges'])} edges")
    
    def get_concept(self, concept_id: str):
        n = self.nodes.get(concept_id)
        if n:
            return {
                'label': n['label'],
                'description': n['metadata'].get('description', ''),
                'connected': [self.nodes.get(t, {}).get('label', t) for t in self.adj.get(concept_id, set())]
            }
        return None
    
    def search(self, query: str):
        ql = query.lower()
        matches = []
        for n in self.graph['nodes']:
            if any(w in ql for w in n['label'].lower().split()):
                matches.append({
                    'id': n['id'],
                    'label': n['label'],
                    'description': n['metadata'].get('description', ''),
                    'connected': [self.nodes.get(t, {}).get('label', t) for t in self.adj.get(n['id'], set())]
                })
        return matches
    
    def get_field_template_data(self):
        """Return structured field data from graph for template filling."""
        data = {}
        for emoji, field_name, hint in TEMPLATE_FIELDS:
            field_id = field_name.lower().replace(' ', '_')
            concept = self.get_concept(field_id) or self.get_concept(field_name.lower().replace(' ', ''))
            if concept:
                data[field_name] = {
                    'emoji': emoji,
                    'hint': hint,
                    'description': concept['description'][:300],
                    'connected': concept['connected'][:6]
                }
            else:
                data[field_name] = {
                    'emoji': emoji,
                    'hint': hint,
                    'description': f"Not directly covered in available material.",
                    'connected': []
                }
        return data

# ─── Detect structured vs casual ─────────────────────────────────

SALES_KEYWORDS = [
    'offer', 'guarantee', 'retention', 'lead', 'pricing', 'ltv', 'lifetime value',
    'grand slam', 'value equation', 'risk reversal', 'cold outreach', 'starving crowd',
    'sales script', 'conversion', 'value delivery', 'ascension', 'upsell', 'downsell',
    'revenue', 'profit', 'funnel', 'campaign', 'ad', 'price', 'cost', 'acquisition',
    'diagnosis', 'audit', 'analyze', 'strategy', 'framework', 'sell', 'selling',
    'prospect', 'customer', 'client', 'book more', 'close', 'closing',
]

def is_sales_query(text: str) -> bool:
    """Detect if the user is asking about sales/business strategy vs casual chat."""
    text_lower = text.lower()
    
    if re.search(r'(template|diagnosis|audit|analyze|breakdown|structured|full\s*analysis)', text_lower):
        return True
    
    keyword_count = sum(1 for kw in SALES_KEYWORDS if kw in text_lower)
    
    casual_keywords = ['hi', 'hello', 'how are you', 'who are you', 'what can you', 'thanks', 'hey']
    casual_count = sum(1 for ck in casual_keywords if ck in text_lower)
    
    if casual_count > 0 and keyword_count == 0:
        return False
    
    return keyword_count >= 1 or len(text_lower.split()) <= 3

# ─── Prompt Builders ─────────────────────────────────────────────

def build_structured_prompt(question: str, chunks: list, graph_engine: GraphEngine) -> str:
    context_parts = []
    for c in chunks:
        context_parts.append(f"[{c['source']}]\n{c['text'][:700]}")
    context_str = "\n\n".join(context_parts)
    
    field_data = graph_engine.get_field_template_data()
    
    template_section = "\n\n".join([
        f"{fd['emoji']} **{field_name}**\n• {fd['description'][:250]}"
        for field_name, fd in field_data.items()
    ])
    
    prompt = f"""[SYSTEM-OVERRIDE: ALEX HORMOZI STRUCTURED DIAGNOSIS]

You are Alex Hormozi. The user has asked a sales/business question.

CRITICAL: You MUST output visible content. Never leave the response blank.

RULES:
1. ONLY use the CONTEXT from my books below. Never invent.
2. Fill in the STRUCTURED TEMPLATE below using the context + graph data.
3. Each field must have a specific, actionable answer from the books.
4. If a field isn't covered by the context, write "Not directly covered in this material."
5. After the template, write 2-3 paragraphs of explanation in my voice.
6. Be specific — use numbers, dollar figures, frameworks from the text.

CONTEXT FROM BOOKS:
{context_str}

GRAPH KNOWLEDGE:
{template_section}

QUESTION: {question}

OUTPUT:
Use this exact format and fill in each field:

🎯 **Guarantee:** [Your answer here]
🔒 **Retention:** [Your answer here]
🏆 **Grand Slam Offer:** [Your answer here]
📊 **Value Equation:** [Your answer here]
🛡️ **Risk Reversal:** [Your answer here]
🧲 **Lead Generation:** [Your answer here]
💰 **Pricing Strategy:** [Your answer here]
📈 **Lifetime Value:** [Your answer here]
📝 **Sales Script:** [Your answer here]
📞 **Cold Outreach:** [Your answer here]
🎯 **Starving Crowd:** [Your answer here]

Then write your personal explanation as Alex Hormozi below. Make it direct and actionable."""
    return prompt


def build_casual_prompt(question: str, chunks: list) -> str:
    context_parts = []
    for c in chunks:
        context_parts.append(f"[{c['source']}]\n{c['text'][:700]}")
    context_str = "\n\n".join(context_parts)
    
    prompt = f"""[SYSTEM-OVERRIDE: ALEX HORMOZI CASUAL]

You are Alex Hormozi — direct, confident, no-BS.

CRITICAL: You MUST output visible content. Never leave the response blank.

RULES:
1. ONLY use the CONTEXT below from my books.
2. Speak as ME — "I", "my", direct, conversational.
3. If context doesn't have the answer, share the closest thing.
4. Include specific numbers, dollar amounts, and frameworks.
5. Keep it 2-4 punchy paragraphs.

CONTEXT:
{context_str}

QUESTION: {question}

Answer as me (start with your response directly, no thinking tags):"""
    return prompt


# ─── AI Query ────────────────────────────────────────────────────

MAX_RETRIES = 2

def query_ai(prompt: str, max_tokens: int = 4000) -> str:
    """Send prompt to deepseek-v4-flash-free via OpenCode Zen with retries."""
    for attempt in range(MAX_RETRIES + 1):
        try:
            r = requests.post(OPENCODE_ZEN_URL, json={
                "model": "deepseek-v4-flash-free",
                "messages": [
                    {"role": "system", "content": SYSTEM_OVERRIDE},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.9,
                "max_tokens": max_tokens,
                "top_p": 0.95,
            }, timeout=300)
            if r.status_code == 200:
                data = r.json()
                msg = data["choices"][0]["message"]
                content = msg.get("content", "").strip()
                reasoning = msg.get("reasoning_content", "")
                
                if content:
                    # Clean up
                    clean = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL).strip()
                    clean = re.sub(r'<thoughts>.*?</thoughts>', '', clean, flags=re.DOTALL).strip()
                    return clean
                elif reasoning:
                    # If only reasoning, the model needs a retry with stronger instruction
                    if attempt < MAX_RETRIES:
                        logger.info(f"Only reasoning returned, retrying ({attempt+1}/{MAX_RETRIES})...")
                        continue
                    return None
                else:
                    if attempt < MAX_RETRIES:
                        logger.info(f"Empty response, retrying ({attempt+1}/{MAX_RETRIES})...")
                        continue
                    return None
            else:
                logger.error(f"API error {r.status_code}: {r.text[:200]}")
                if attempt < MAX_RETRIES:
                    continue
                return None
        except Exception as e:
            logger.error(f"AI query attempt {attempt} failed: {e}")
            if attempt < MAX_RETRIES:
                continue
            return None
    return None


def format_structured_response(ai_response: str, field_data: dict) -> str:
    """Post-process AI response to ensure all template fields are present."""
    if not ai_response:
        return None
    
    # Check which template fields are in the response
    missing_fields = []
    for field_name in field_data:
        if f"**{field_name}**" not in ai_response:
            missing_fields.append(field_name)
    
    # If fields are missing, prepend them
    if missing_fields:
        header = "📋 **Sales Diagnosis**\n\n"
        for field_name in missing_fields:
            fd = field_data[field_name]
            header += f"{fd['emoji']} **{field_name}:**\nNot directly covered in this material.\n\n"
        ai_response = header + ai_response
    
    return ai_response

# ─── Telegram Bot ────────────────────────────────────────────────

rag = None
graph = None

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    await update.message.reply_text(
        f"🤵 *Alex Hormozi AI* — ready for you, {user.first_name}.\n\n"
        f"I've read all his books on sales, offers, and lead gen.\n"
        f"Ask me anything — I'll give you frameworks, scripts, "
        f"and strategies straight from the books.\n\n"
        f"Commands:\n"
        f"• `/template` — Force a structured sales diagnosis\n"
        f"• `/stats` — Knowledge base info\n"
        f"• `/help` — This message"
    )

async def stats(update: Update, context: ContextTypes.DEFAULT_TYPE):
    s = rag.get_stats()
    await update.message.reply_text(s, parse_mode="Markdown")

async def help_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await start(update, context)

async def template_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    args = context.args
    if args:
        question = " ".join(args)
    else:
        await update.message.reply_text("Usage: /template your question here")
        return
    
    await update.message.reply_chat_action("typing")
    logger.info(f"📋 Template Q: {question[:80]}...")
    
    chunks = rag.retrieve(question, top_k=6)
    if not chunks:
        await update.message.reply_text("I need a more specific question about sales, offers, or lead gen.")
        return
    
    prompt = build_structured_prompt(question, chunks, graph)
    response = query_ai(prompt)
    
    if response:
        field_data = graph.get_field_template_data()
        formatted = format_structured_response(response, field_data)
        sources = list(set(c['source'] for c in chunks))
        full = f"📖 *Sources:* {', '.join(sources)}\n\n{formatted}"
        for i in range(0, len(full), 4000):
            await update.message.reply_text(full[i:i+4000], parse_mode="Markdown")
    else:
        # Fallback: show raw chunks
        best = chunks[0]
        await update.message.reply_text(
            f"📖 From *{best['source']}*:\n\n{best['text'][:3000]}",
            parse_mode="Markdown"
        )

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    question = update.message.text
    if not question or question.startswith('/'):
        return
    
    await update.message.reply_chat_action("typing")
    logger.info(f"📩 Q: {question[:80]}...")
    
    chunks = rag.retrieve(question)
    if not chunks:
        await update.message.reply_text(
            "Ask me about sales, offers, lead gen, or pricing "
            "— I've got those covered in the books."
        )
        return
    
    sources = list(set(c['source'] for c in chunks))
    best = chunks[0]['score']
    
    note = ""
    if best < 0.1:
        note = f"⚠️ *Best match:* {best:.0%} relevance — answering from closest material.\n\n"
    
    structured = is_sales_query(question)
    
    if structured:
        prompt = build_structured_prompt(question, chunks, graph)
    else:
        prompt = build_casual_prompt(question, chunks)
    
    response = query_ai(prompt)
    
    if response:
        if structured:
            field_data = graph.get_field_template_data()
            response = format_structured_response(response, field_data)
        
        full = note + f"📖 *Sources:* {', '.join(sources)}\n\n{response}"
        for i in range(0, len(full), 4000):
            await update.message.reply_text(full[i:i+4000], parse_mode="Markdown")
    else:
        best_chunk = chunks[0]
        await update.message.reply_text(
            f"📖 From *{best_chunk['source']}*:\n\n{best_chunk['text'][:3000]}",
            parse_mode="Markdown"
        )

async def error(update: Update, context: ContextTypes.DEFAULT_TYPE):
    logger.error(f"Error: {context.error}")

# ─── Main ────────────────────────────────────────────────────────

def main():
    global rag, graph
    print("📚 Loading Hormozi knowledge base...")
    rag = HormoziRAG()
    graph = GraphEngine()
    print(f"✅ {len(rag.chunks)} chunks loaded, {len(graph.nodes)} graph nodes")
    print(f"🤖 Hormozi AI Bot starting... (structured + casual modes)", flush=True)
    
    app = Application.builder().token(TELEGRAM_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("stats", stats))
    app.add_handler(CommandHandler("help", help_cmd))
    app.add_handler(CommandHandler("template", template_cmd))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    app.add_error_handler(error)
    
    print(f"🤖 SHANNON-Ω Hormozi Bot live! Message @Al_bosifybot", flush=True)
    app.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()
