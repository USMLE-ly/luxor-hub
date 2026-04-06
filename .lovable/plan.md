

# Publish + Blog/Deep Dive Enhancements

## Overview

Six changes: publish the site, add read-time-remaining indicator, add OG images to blog articles, add a link-preview hover component, redesign Deep Dive with grid feature cards, and remove Sparkles icons from blog/deep-dive pages.

---

## 1. Publish the Site

Use the publish settings tool to ensure the site is public, then instruct the user to click "Publish > Update" to push frontend changes live.

---

## 2. Read Time Remaining Indicator

**File:** `src/pages/BlogArticle.tsx`

Parse the `readTime` string (e.g. "8 min read") to get total minutes. Calculate remaining minutes based on scroll progress: `Math.ceil(totalMin * (1 - progress / 100))`. Display next to the progress bar as a small label like "3 min left" that fades in once scrolling begins.

---

## 3. Open Graph Images for Blog Articles

**File:** `src/pages/BlogArticle.tsx`

Add `og:image` and `twitter:image` meta tags in the Helmet. Since we don't have custom images per article, we'll generate a dynamic OG image URL using a free service (e.g. `https://og.luxor.ly` or a simple fallback to a branded static image). The simplest approach: add a single branded OG image to `public/og/blog-default.png` and reference it, or use a dynamic OG image generator via URL params. We'll use a static branded fallback image for now with the path `/og/blog-og.png`.

---

## 4. Link Preview Component (Adapted for React/Vite)

**File:** `src/components/ui/link-preview.tsx`

Adapt the provided Next.js component for our React/Vite stack:
- Replace `next/image` with standard `<img>` tags
- Replace `next/link` with React Router `<Link>` or `<a>` tags
- Install `qss` package (framer-motion and @radix-ui/react-hover-card already exist)
- Keep the hover card animation, microlink API screenshot integration, and mouse-follow effect
- Style to match our dark theme (dark card background, subtle border)

**File:** `src/pages/Blog.tsx`

Use `LinkPreview` on article titles or "Read Full Article" links so hovering shows a preview of the article content.

---

## 5. Deep Dive with Grid Feature Cards

**File:** `src/components/ui/grid-feature-cards.tsx` — already exists, no changes needed.

**File:** `src/pages/DeepDive.tsx` and `src/components/landing/AIFashionEditorial.tsx`

Redesign the Deep Dive page to use the grid-feature-cards layout:
- Replace the vertical timeline layout with a 2x3 or 3-column grid of `FeatureCard` components
- Each of the 5 steps becomes a card with its icon, title, and description
- Add the AnimatedContainer wrapper for blur-in animation
- Keep the closing "Why AI Styling Matters" section below the grid
- Use dashed border grid dividers as shown in the demo

---

## 6. Remove Sparkles Icon

**Files:** `src/pages/Blog.tsx`, `src/pages/BlogArticle.tsx`, `src/components/landing/AIFashionEditorial.tsx`

- Remove the `<Sparkles>` icon from the blog header badge, article CTA section, and deep dive header badge
- Replace with nothing (just remove the icon) or use a simpler visual indicator

---

## Technical Notes

- `qss` is the only new npm dependency needed
- The link-preview uses microlink.io's free API for screenshot generation — no API key required
- Grid feature cards use `React.useId()` for unique SVG pattern IDs — no collision risk
- OG image will be a static fallback until custom per-article images are created

