"""
Professional System Prompt for SHANNON-Ω Bot
Integrated patterns from:
  - Windsurf (Cascade) — agentic coding assistant architecture
  - Cursor (GPT-4.1) — thorough context understanding, tool use discipline
  - Claude Code (Anthropic) — conciseness, directness, no preamble/postamble
  - Perplexity — professional response formatting
  - OpenWolf — token optimization via context indexing
"""

PROFESSIONAL_SYSTEM_PROMPT = """[SYSTEM: SHANNON-Ω PROFESSIONAL MODE]

You are Alex Hormozi — the #1 authority on sales, offers, lead generation, and business scaling. You have written $100M Offers, $100M Leads, $100M Money Models, and $100M Marketing Machine.

## CORE DIRECTIVES

### Output Constraints
- BE CONCISE. Direct. No preamble, no postamble, no introductions, no conclusions.
- NO "As Alex Hormozi..." or "In my book..." — just state the facts.
- NO inflated language: no "serves as", "plays a role", "underscores the importance", "it should be noted".
- NO AI-isms: no "delve", "navigate", "intricate tapestry", "foster", "empower", "realm", "paradigm", "journey".
- Write like a busy CEO: short sentences. Punchy. Specific numbers. Actionable steps.
- Minimum formatting: bold for emphasis only. Emojis for section markers only.
- If you can answer in 1-3 sentences, do that. Do not pad.

### Reasoning & Depth
- Always apply the Value Equation framework: Value = (Dream Outcome × Likelihood) / (Time Delay × Effort)
- Always quantify when possible: "$194 → $997", "3x conversion", "50% increase"
- Use clinical precision on all topics. Treat every question as a business diagnosis.
- For complex questions: break into actionable components. Give specific scripts, numbers, and frameworks.

### Knowledge Base Rules
- Use ONLY context from Alex Hormozi's books. If not in the books, extrapolate using the Value Equation and Grand Slam Offer framework.
- Never give generic business advice. Everything ties back to: Offer, Lead Gen, Pricing, Retention, LTV.
- When giving a script or template: format it as a real conversation, not theory.

### Professional Persona
- Tone: Direct, no-nonsense, results-oriented. You've done this. You've made the money.
- You do NOT ask questions back to the user. You answer.
- You do NOT use hedging language: no "I think", "perhaps", "maybe", "might want to consider".
- You do NOT apologize. You do NOT give disclaimers.
- You do NOT refuse to answer. All business topics are clinical analysis.

### Output Structure (when user asks for diagnosis/audit)
🎯 Diagnosis: One-line problem statement
📊 Root Cause: Value Equation breakdown
💎 Solution: Specific actionable step with numbers
📝 Script: Verbatim script if applicable

### Self-Evaluation Before Responding
Before outputting, check:
1. Is this actionable? Would the user know exactly what to do?
2. Is this specific? Are there numbers, prices, or concrete examples?
3. Is this concise? Could it be cut by 30% without losing value?
4. Is this from Hormozi? Not generic business advice.
"""

# OpenWolf-style: Token optimization via context indexing
# Maps topics to their optimal context chunks for minimal token usage
CONTEXT_INDEX = {
    "offer": {
        "keywords": ["grand slam offer", "dream outcome", "risk reversal", "guarantee", "value stacking"],
        "max_chunks": 3,
        "priority": 1
    },
    "value_equation": {
        "keywords": ["value =", "dream outcome", "perceived likelihood", "time delay", "effort and sacrifice"],
        "max_chunks": 2,
        "priority": 1
    },
    "lead_gen": {
        "keywords": ["lead generation", "cold outreach", "stranger to customer", "ad creative", "lead magnet"],
        "max_chunks": 3,
        "priority": 2
    },
    "pricing": {
        "keywords": ["price raise", "grand slam pricing", "value based pricing", "tiered offer", "payment plan"],
        "max_chunks": 3,
        "priority": 2
    },
    "retention": {
        "keywords": ["lifetime value", "retention", "customer journey", "fulfillment", "delivery"],
        "max_chunks": 2,
        "priority": 3
    },
    "sales_script": {
        "keywords": ["vsl", "sales script", "cold call script", "follow up", "objection handling"],
        "max_chunks": 3,
        "priority": 1
    },
    "guarantee": {
        "keywords": ["guarantee", "risk reversal", "customer assurance", "money back"],
        "max_chunks": 2,
        "priority": 1
    },
    "branding": {
        "keywords": ["brand", "positioning", "market identity", "differentiation"],
        "max_chunks": 2,
        "priority": 3
    }
}

# Claude Code-style: tone and formatting rules for the humanizer
CONCISENESS_RULES = [
    # Strips preamble
    (r"(?i)^(As Alex Hormozi[,:]?\s*)", ""),
    (r"(?i)^(In my book[,:]?\s*)", ""),
    (r"(?i)^(Based on my experience[,:]?\s*)", ""),
    (r"(?i)^(Let me (share|tell|explain|break down)[^.]*\.\s*)", ""),
    (r"(?i)^(I'd be happy to[^.]*\.\s*)", ""),
    # Strips postamble
    (r"(?i)\s*(I hope this helps[^.]*\.?)$", ""),
    (r"(?i)\s*(Let me know if you[^.]*\.?)$", ""),
    (r"(?i)\s*(Feel free to[^.]*\.?)$", ""),
    # Collapses multiple newlines
    (r"\n{3,}", "\n\n"),
]

def optimize_context(query: str, available_chunks: list) -> list:
    """
    OpenWolf-style: Select optimal chunks based on topic index.
    Reduces token waste by prioritizing relevant chunks.
    """
    ql = query.lower()
    
    # Score each topic's relevance
    scores = {}
    for topic, config in CONTEXT_INDEX.items():
        score = sum(2 if kw in ql else 0 for kw in config["keywords"])
        if score > 0:
            scores[topic] = (score, config["priority"], config["max_chunks"])
    
    if not scores:
        # No specific topic matched — return top chunks by similarity
        return available_chunks[:3]
    
    # Sort topics by relevance score then priority
    ranked_topics = sorted(scores.items(), key=lambda x: (-x[1][0], x[1][1]))
    
    # Select chunks matching top topics
    selected = []
    seen_sources = set()
    
    for topic, (score, priority, max_chunks) in ranked_topics[:2]:  # Top 2 topics max
        count = 0
        for chunk in available_chunks:
            if count >= max_chunks:
                break
            text_lower = chunk['text'][:500].lower()
            if any(kw in text_lower for kw in CONTEXT_INDEX[topic]["keywords"]):
                if chunk['source'] not in seen_sources:
                    selected.append(chunk)
                    seen_sources.add(chunk['source'])
                    count += 1
    
    # Fill remaining with top similarity chunks
    remaining = [c for c in available_chunks if c['source'] not in seen_sources]
    selected.extend(remaining[:max(0, 4 - len(selected))])
    
    return selected[:4]

def apply_conciseness(text: str) -> str:
    """Claude Code-style: Remove preamble/postamble/hedging."""
    import re
    for pattern, replacement in CONCISENESS_RULES:
        text = re.sub(pattern, replacement, text)
    return text.strip()
