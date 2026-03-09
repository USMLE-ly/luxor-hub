

# Clean Slate Landing Page Rebuild

The current landing page has accumulated complexity — a broken WebGL hero, 12+ section components, and layered effects that conflict. We'll strip it down and rebuild with a clean, premium architecture that matches AURELIA's luxury AI stylist brand.

## Architecture

Strip `Index.tsx` to a minimal shell. Rebuild each section as a clean, self-contained component. Keep `Navbar.tsx` and `Footer.tsx` (they work fine). Delete/replace the broken Hero and rebuild all middle sections.

```text
┌─────────────────────────────┐
│  Navbar (keep existing)     │
├─────────────────────────────┤
│  Hero — new, clean design   │
│  (video/image bg + overlay  │
│   gold typography + CTAs)   │
├─────────────────────────────┤
│  Social Proof Strip         │
├─────────────────────────────┤
│  How It Works (3 steps)     │
├─────────────────────────────┤
│  Features (bento grid)      │
├─────────────────────────────┤
│  Brand Marquee              │
├─────────────────────────────┤
│  Testimonials               │
├─────────────────────────────┤
│  Pricing                    │
├─────────────────────────────┤
│  FAQ                        │
├─────────────────────────────┤
│  Footer (keep existing)     │
└─────────────────────────────┘
```

## File Changes

### 1. `src/components/landing/Hero.tsx` — Full rewrite
- Remove all WebGL/Three.js/GSAP/CDN script loading
- Clean CSS-only hero with a full-bleed background image, dark gradient overlay
- Playfair Display gold shimmer title, Inter subtitle
- Two CTA buttons (primary gold, secondary outline)
- Social proof avatars row
- Framer Motion entrance animations (no external deps)

### 2. `src/pages/Index.tsx` — Simplify
- Remove `ScrollProgressBar`, `SectionReveal`, `GoldSectionDivider`, parallax transforms
- Clean sequential layout: Navbar → Hero → sections → Footer
- Simple framer-motion `whileInView` fade-ups directly on each section
- Remove `SparkleParticles` and `CursorSpotlight` imports (can re-add later)

### 3. All other section components — Rebuild clean
- **SocialProofStrip** — minimal stats bar with NumberTicker
- **HowItWorks** — 3-step horizontal cards with icons
- **Features** — 6-card bento grid with feature images
- **BrandMarquee** — simple logo scroll strip
- **Testimonials** — 3-card grid with quotes
- **Pricing** — 3-tier cards (Free/Pro/Elite)
- **FAQ** — accordion with 6 common questions
- Remove `AppPreview`, `IntegrationHero`, `ThemeShowcase` from the page (files stay, just not imported)

### 4. `src/index.css` — Clean up
- Remove `hero-gold-shimmer` animation and related WebGL styles
- Keep the gold shimmer keyframe but simplify

## Design Principles
- No CDN script loading, no WebGL — pure React + Framer Motion + Tailwind
- Gold (`hsl(43 74% 49%)`) as accent, charcoal backgrounds in dark mode, warm ivory in light
- Playfair Display for headings, Inter for body
- Glassmorphic cards with `backdrop-blur` and subtle borders
- Every section self-contained and independently testable

