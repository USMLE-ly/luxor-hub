

# Humanize All Copy + Blog/Deep Dive Enhancements

## What's Happening

The entire site's copy reads like polished AI output: rule-of-three structures, promotional language ("vibrant," "genuine," "deeply personal"), copula avoidance ("serves as," "stands as"), and padded paragraphs. We'll rewrite every user-facing string using the uploaded Humanizer patterns, cut word count by ~40%, and add three technical features.

---

## Part 1: Humanize Copy Across All Files

**Files to rewrite** (copy only — no layout/logic changes):

| File | What changes |
|------|-------------|
| `glassmorphism-trust-hero.tsx` | Tighten H1 subtext, testimonial quotes (cut filler), stat labels |
| `Features.tsx` | Rewrite subtitle — kill "combines every fashion styling feature into a single intelligent platform" |
| `HowItWorks.tsx` (Gallery items) | Shorten 6 card descriptions. Cut "-ing" phrases and promotional words |
| `SocialProofStrip.tsx` | Tighten UVP labels and subs |
| `FAQ.tsx` | Rewrite all 6 answers: shorter, direct, no padding. Kill "genuine source of stress," "that's the promise of" |
| `Pricing.tsx` | Tier descriptions: cut "full AI styling arsenal" type language |
| `CTABanner.tsx` | Tighten CTA headline and body |
| `Testimonials.tsx` | Clean up screenshot captions |
| `AIFashionEditorial.tsx` | Rewrite all 5 step bodies + closing essay — ~50% shorter. Kill "transforms," "eliminates friction," "amplifying it" |
| `Blog.tsx` | Rewrite article excerpts, header copy, CTA copy |
| `BlogArticle.tsx` | Rewrite all 25 article body paragraphs across 5 articles — cut filler, use direct "is/has" constructions |
| `DeepDive.tsx` | Update meta description to match new editorial copy |
| `NewsletterSignup.tsx` | Tighten newsletter CTA copy |
| `Footer.tsx` | Tighten "Stay in Style" copy |
| `Navbar.tsx` | No copy changes needed (already minimal) |

**Humanizer rules applied:**
- Replace "serves as / stands as / marks / represents" → "is / has"
- Kill rule-of-three lists
- Remove "-ing" filler phrases (showcasing, reflecting, ensuring)
- Cut promotional words (vibrant, groundbreaking, stunning, breathtaking)
- Remove negative parallelisms ("not just X, it's Y")
- Remove "Additionally" / "Furthermore" / "Moreover"
- Vary sentence length. Add direct opinion where appropriate.
- Keep SEO keywords intact — just remove the padding around them

---

## Part 2: Newsletter Signup Test

The newsletter form already exists and writes to `newsletter_subscribers`. No code changes needed — just manual testing by navigating to `/blog` and submitting an email. Will verify the form works during implementation.

---

## Part 3: JSON-LD for Deep Dive Page

**File:** `src/pages/DeepDive.tsx`

Add an `Article` structured data block inside `<Helmet>`:
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How AI Fashion Styling Works — Deep Dive",
  "description": "...",
  "author": { "@type": "Organization", "name": "LEXOR®" },
  "publisher": { "@type": "Organization", "name": "LEXOR®" },
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://luxor.ly/deep-dive" }
}
```

---

## Part 4: Reading Progress Bar for Blog Articles

**File:** `src/pages/BlogArticle.tsx`

Add a thin fixed progress bar at the top of the page that fills as the user scrolls through the article. Implementation:
- Use `window.scrollY` and `document.documentElement.scrollHeight` to calculate progress
- Render a `<div>` with `position: fixed; top: 0; height: 3px; bg-primary` that scales width from 0-100%
- Lightweight — no library needed

---

## Summary of Deliverables

1. Rewritten copy across ~14 files (shorter, human, direct)
2. JSON-LD structured data on `/deep-dive`
3. Reading progress bar on blog article pages
4. Newsletter form verification

