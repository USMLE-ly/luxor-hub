#!/usr/bin/env python3
"""🤖 Alex Hormozi Bot v2 — reads books, answers as Alex, based ONLY on his content."""
import os, sys, json, time, logging, requests

TOKEN = os.environ.get('TELEGRAM_TOKEN', '8758115339:AAHH6gAIHmSo7Qf_VMc_HmBxz2Jy8w_1mtM')
BASE = f"https://api.telegram.org/bot{TOKEN}"
ZEN_URL = "https://opencode.ai/zen/v1/chat/completions"
CHUNKS_FILE = "hormozi_books/chunks/all_chunks.json"

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
log = logging.getLogger('bot')

class RAG:
    def __init__(self):
        with open(CHUNKS_FILE) as f:
            self.chunks = json.load(f)
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity
        self.cos = cosine_similarity
        texts = [c['text'] for c in self.chunks]
        self.vec = TfidfVectorizer(max_features=5000, stop_words='english', ngram_range=(1,2))
        self.matrix = self.vec.fit_transform(texts)
        log.info(f"Loaded {len(self.chunks)} chunks")
    
    def retrieve(self, query, k=4):
        qv = self.vec.transform([query])
        scores = self.cos(qv, self.matrix).flatten()
        results = []
        for idx in scores.argsort()[::-1]:
            if scores[idx] < 0.02: break
            results.append({'score': float(scores[idx]), 'text': self.chunks[idx]['text'], 'source': self.chunks[idx].get('source','?')})
            if len(results) >= k: break
        return results


# ─── Knowledge Graph ─────────────────────────────────
import json, os
GRAPH_FILE = "hormozi_books/graph/graph.json"
_graph = None

def load_graph():
    global _graph
    if _graph is None and os.path.exists(GRAPH_FILE):
        with open(GRAPH_FILE) as f:
            g = json.load(f)
        _graph = g
    return _graph

def graph_search(query):
    g = load_graph()
    if not g: return []
    query_lower = query.lower()
    matches = []
    for n in g['nodes']:
        if query_lower in n['label'].lower() or query_lower in n['id']:
            # Find connected concepts via edges
            connected = []
            for e in g['edges']:
                if e['source'] == n['id']:
                    connected.append(e['target'])
                elif e['target'] == n['id']:
                    connected.append(e['source'])
            matches.append({
                'concept': n['label'],
                'description': n['metadata'].get('description', ''),
                'connected': connected[:8]
            })
    return matches


# ─── Knowledge Graph ─────────────────────────────────
GRAPH_FILE = "hormozi_books/graph/graph.json"
concept_labels = {}
concept_desc = {}
adj = {}

def _load_graph():
    global concept_labels, concept_desc, adj
    if concept_labels: return
    try:
        with open(GRAPH_FILE) as f:
            g = json.load(f)
        concept_labels = {n['id']: n['label'] for n in g['nodes']}
        concept_desc = {n['id']: n['metadata'].get('description', '') for n in g['nodes']}
        for e in g['edges']:
            adj.setdefault(e['source'], set()).add(e['target'])
            adj.setdefault(e['target'], set()).add(e['source'])
    except: pass

def graph_enhanced_retrieve(rag, query, k=4):
    _load_graph()
    ql = query.lower()
    matched = [nid for nid, label in concept_labels.items() if any(w in ql for w in label.lower().split())]
    if matched:
        extra = set()
        for nid in matched:
            extra.add(concept_labels.get(nid, nid))
            for nb in adj.get(nid, set()):
                extra.add(concept_labels.get(nb, nb))
        aug = query + " " + " ".join(extra)
        return rag.retrieve(aug, k=k)
    return rag.retrieve(query, k=k)


def tg(method, **kw):
    try:
        r = requests.get(f"{BASE}/{method}", params=kw, timeout=5)
        return r.json() if r.status_code == 200 else None
    except: return None

def send(chat_id, text, pm="Markdown"):
    if not text: return
    for i in range(0, len(text), 4000):
        tg("sendMessage", chat_id=chat_id, text=text[i:i+4000], parse_mode=pm)

def ask_ai(question, chunks):
    ctx = "\n\n".join(f"[{c['source']}]\n{c['text'][:600]}" for c in chunks[:4])
    prompt = f"CONTEXT FROM BOOKS:\n{ctx}\n\nQUESTION: {question}\n\nYou are Alex Hormozi. Answer based ONLY on the context above, in YOUR voice — direct, specific numbers, no fluff. If the context doesn't have the answer, say what it DOES contain. Keep to 2-4 paragraphs."
    try:
        r = requests.post(ZEN_URL, json={
            "model": "deepseek-v4-flash-free",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7,
            "max_tokens": 8000
        }, timeout=90)
        if r.status_code == 200:
            content = r.json()["choices"][0]["message"].get("content","")
            if content: return content.strip()
    except Exception as e:
        log.error(f"AI: {e}")
    return None

def main():
    log.info("Loading...")
    rag = RAG()
    me = tg("getMe")
    if not me: log.error("No Telegram"); return
    log.info(f"✅ @{me['result']['username']}")
    
    offset = 0
    while True:
        try:
            r = tg("getUpdates", offset=offset, timeout=2, allowed_updates="message")
            if r and r.get("ok"):
                for u in r.get("result", []):
                    offset = u["update_id"] + 1
                    msg = u.get("message", {})
                    cid = msg.get("chat", {}).get("id")
                    text = msg.get("text", "").strip()
                    name = msg.get("from", {}).get("first_name", "")
                    if not cid or not text: continue
                    log.info(f"📩 {name}: {text[:60]}")
                    
                    if text == "/start":
                        send(cid, "🤵 *Alex Hormozi* — I've read all his books.\n\nAsk me about sales, offers, leads, pricing — I'll answer with specific frameworks from the books.")
                        continue
                    if text.startswith("/"): continue
                    
                    chunks = graph_enhanced_retrieve(rag, text)
                    if not chunks:
                        send(cid, "Ask me about sales, offers, leads, or pricing.")
                        continue
                    
                    resp = ask_ai(text, chunks)
                    if resp:
                        srcs = list(set(c['source'] for c in chunks))
                        send(cid, f"📖 *Sources:* {', '.join(srcs)}\n\n{resp}")
                    else:
                        c = chunks[0]
                        send(cid, f"📖 From *{c['source']}*:\n\n{c['text'][:3000]}")
            time.sleep(1)
        except KeyboardInterrupt:
            break
        except Exception as e:
            log.error(f"⚠️ {e}")
            time.sleep(3)

if __name__ == "__main__":
    main()
