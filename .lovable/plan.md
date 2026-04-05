

## Plan: SEO, GEO & AI Discoverability Overhaul for luxor.ly

### Problems Identified (from the report)

The SEO audit flags 7 issues — all critical:
1. **Target keyword "fashion" missing** from: title, meta description, H1, body content
2. **Low word count** compared to competitors
3. **Poor readability** of text content
4. **No backlink strategy** (list of target domains provided)
5. **No sitemap.xml** exists
6. **No structured data** (JSON-LD) anywhere
7. **No AI discoverability** — no llms.txt, no schema markup for ChatGPT/Perplexity/Google AI

### What We'll Build

#### 1. Fix index.html Meta Tags (SEO keywords)
- **Title**: `LEXOR® — AI Fashion Stylist & Virtual Wardrobe | Personal Style OS`
- **Meta description**: `LEXOR® is the AI fashion platform that styles your wardrobe. Get daily outfit recommendations, trend forecasting, and personal fashion styling — powered by AI.`
- **OG/Twitter tags**: Updated to match
- Add `<meta name="keywords">` with: `AI fashion stylist, virtual wardrobe, outfit recommendations, fashion trends, personal styling, AI outfit analyzer, wardrobe management`
- Add canonical: `<link rel="canonical" href="https://luxor.ly/" />`

#### 2. Fix Hero H1 & Body Content (keyword integration)
- Update H1 from "Your AI Stylist That Actually Knows You" → "Your AI Fashion Stylist That Actually Knows You"
- Update hero description to include "fashion" naturally
- Add more text content to landing sections to increase word count

#### 3. Add JSON-LD Structured Data (index.html)
- **Organization** schema (name, url, logo, sameAs for socials)
- **WebApplication** schema (name, description, applicationCategory: "Fashion")
- **FAQPage** schema generated from existing FAQ data
- This helps Google rich results AND AI systems like ChatGPT

#### 4. Create sitemap.xml (public/)
- Static sitemap listing all public routes: `/`, `/auth`, `/install`
- Add `Sitemap: https://luxor.ly/sitemap.xml` to robots.txt

#### 5. Create llms.txt (public/) — AI Discoverability
- A structured file that ChatGPT, Perplexity, and other AI systems read to understand the site
- Contains: site description, key features, pricing, and links
- This is the emerging standard for AI recommendation visibility

#### 6. Update robots.txt
- Add sitemap reference
- Add explicit allows for AI crawlers: GPTBot, PerplexityBot, ClaudeBot, Google-Extended

#### 7. Improve Content Readability
- Shorten sentences in FAQ answers
- Add more descriptive text to HowItWorks and Features sections
- Use simpler language patterns (Flesch reading score improvement)

### Files to Create/Modify

| Action | File |
|--------|------|
| Modify | `index.html` — meta tags, canonical, JSON-LD scripts |
| Modify | `src/components/ui/glassmorphism-trust-hero.tsx` — H1 keyword, more body text |
| Modify | `src/components/landing/FAQ.tsx` — readability improvements |
| Modify | `src/components/landing/HowItWorks.tsx` — more descriptive content |
| Modify | `src/components/landing/Features.tsx` — keyword-rich headings |
| Modify | `public/robots.txt` — sitemap + AI bot rules |
| Create | `public/sitemap.xml` — static sitemap |
| Create | `public/llms.txt` — AI discoverability file |

### AI System Recommendations (ChatGPT, Perplexity, etc.)
- **llms.txt** makes the site parseable by AI assistants
- **JSON-LD structured data** feeds Google's AI Overviews and Perplexity citations
- **GPTBot/PerplexityBot allowed** in robots.txt ensures crawling
- **FAQPage schema** increases chance of being cited in AI answers about fashion apps

