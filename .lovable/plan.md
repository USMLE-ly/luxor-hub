

# AURELIA — Final Premium Polish (Wave 3)

## Gap Analysis vs 21st.dev Top Patterns

After reviewing 1000+ components, these high-impact patterns are still missing from AURELIA:

1. **No particle/sparkle effects** — The #5 most popular pattern (664 stars). Zero floating particles on any section.
2. **No cursor spotlight** — Global radial gradient following the mouse on dark sections. Standard in top-tier sites.
3. **No number ticker** — Current counters use simple count-up. Top sites use rolling digit animations.
4. **No animated gradient mesh** — Hero/CTA sections lack depth. Static gradients feel flat.
5. **No meteor/shooting star effects** — Popular on testimonial and card sections (177 stars).
6. **No text shimmer on key phrases** — "gold-text" is static. Should have a moving highlight sweep.
7. **Social proof strip is visually thin** — Needs a glassmorphic card treatment and more visual weight.
8. **No floating dock on mobile** — Bottom navigation pattern is missing for mobile landing page.

## Implementation Plan (6 Upgrades)

### 1. Sparkle Particle Canvas — Global Effect
**New**: `src/components/ui/sparkle-particles.tsx`

A lightweight canvas-based particle system that renders gold sparkles. Configurable density, speed, and color. Apply to:
- Hero section background
- Footer CTA band background
- Behind the pricing popular card

Uses `requestAnimationFrame` + HTML5 Canvas. No WebGL dependency. ~60 particles at 60fps. Fades at edges with CSS mask.

### 2. Cursor Spotlight — Global Mouse Tracker
**New**: `src/components/ui/cursor-spotlight.tsx`

A fixed-position div that follows the mouse with a large (400px) radial gradient (`hsl(var(--primary) / 0.04)`). Only visible on desktop (`pointer: fine` media query). Renders once at page level in Index.tsx. Uses `mousemove` with `requestAnimationFrame` throttle. Respects `prefers-reduced-motion`.

### 3. Number Ticker — Rolling Digit Counter
**New**: `src/components/ui/number-ticker.tsx`

Replace the simple count-up in SocialProofStrip with a slot-machine-style rolling digit animation. Each digit column scrolls independently with staggered timing. Uses CSS `translateY` transitions. More premium than linear interpolation.

Apply to: SocialProofStrip counters, Testimonials revenue counter.

### 4. Text Shimmer Upgrade — Moving Highlight
**Edit**: `src/index.css`

Add a `gold-shimmer-text` class that applies an animated `background-position` sweep on a linear-gradient `background-clip: text`. Apply to:
- "AURELIA" brand text in Navbar
- "gold-text" headings in Hero, Features, HowItWorks
- Footer "Made with ♥ and AI"

CSS-only, no JS. Uses `@keyframes shimmer-text` with `background-size: 200%`.

### 5. Meteor Effect — Testimonials Background
**Edit**: `src/components/landing/Testimonials.tsx`

Add 5-8 animated "meteor" streaks (thin gold lines) that fall diagonally across the testimonials section background. CSS-only using `@keyframes`. Each meteor has randomized delay and duration. Opacity: 0.1-0.15 so they're subtle.

### 6. Social Proof Strip — Visual Weight Upgrade
**Edit**: `src/components/landing/SocialProofStrip.tsx`

Wrap each stat in a glassmorphic card (`bg-card/40 backdrop-blur-md border border-border`). Add a subtle gold top-line accent on hover. Increase section padding. Add a thin gold separator line between stats on desktop.

### 7. Index Orchestration
**Edit**: `src/pages/Index.tsx`

- Add `CursorSpotlight` at page root level
- Add `SparkleParticles` behind Hero and Footer CTA sections

---

## Execution Order
1. Sparkle particles (visual impact)
2. Cursor spotlight (global polish)
3. Number ticker (social proof upgrade)
4. Text shimmer CSS (quick win)
5. Meteor effect (testimonials depth)
6. Social proof visual weight
7. Index wiring

## Technical Notes
- Canvas particles use `devicePixelRatio` for crisp rendering on retina
- Cursor spotlight is a single `position: fixed` div — zero layout cost
- Number ticker uses CSS transforms only — no JS animation loop
- All effects check `prefers-reduced-motion` and disable accordingly
- No new dependencies

