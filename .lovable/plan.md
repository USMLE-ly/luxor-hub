

## Landing Page — Premium Rebuild Plan

### Analysis Summary

Current state has strong individual components (WebGL hero, glass shader, grid features) but suffers from **section redundancy**, **inconsistent rhythm**, **weak conversion hierarchy**, and **FAQ/pricing copy contradictions**. Three separate feature showcase sections (ContainerScroll, RevealImageList, FeatureCarousel) compete for attention instead of building a narrative arc.

---

### Architecture: Section Flow Redesign

Current (11 sections, redundant):
```text
Hero → SocialProof → HowItWorks → ContainerScroll → Features → RevealList → FeatureCarousel → BrandMarquee → Proof → Pricing → FAQ → CTA → Footer
```

Proposed (9 sections, narrative arc):
```text
Hero → SocialProof → Features(grid) → HowItWorks → AppShowcase(ContainerScroll) → BrandMarquee → Proof → Pricing → FAQ → CTA → Footer
```

**Removed**: RevealImageList section and FeatureCarousel section — they dilute the feature message. ContainerScroll stays as the single app showcase moment.

---

### 1. Hero — Micro-interaction Polish
- Add a subtle entrance stagger delay to CTA buttons (200ms after title completes)
- Reduce slide auto-advance from 5s to 6s for breathing room
- Add a scroll-down indicator (animated chevron) at bottom center, fading out after first scroll

### 2. Social Proof Strip — Authority Upgrade
- Replace generic "12,000+ Active Users" with specific trust signals: "Featured in Vogue", "12K+ Stylists", "$2.4M+ Revenue Generated", "98% Satisfaction"
- Add subtle gold left-border accent to each stat for visual weight
- Increase vertical padding from `py-12` to `py-16`

### 3. Features Grid — Elevation
- Add staggered entrance per card (50ms delay each) instead of all-at-once
- Add hover state: card background subtly shifts, icon scales up 1.1x
- Section title: tighten max-width for better text balance

### 4. HowItWorks — No changes needed, Gallery4 is strong

### 5. App Showcase (ContainerScroll) — Refinement
- Add a subtle gold border glow to the container on scroll-in
- Update subtitle copy to be more conversion-oriented

### 6. Brand Marquee — Spacing & Trust
- Change "Integrated With" to "Trusted By Leading Brands" for authority framing
- Add LinkedIn logo to the brand set
- Ensure gap remains at `6rem`+

### 7. Proof Section — Hierarchy & Credibility
- Make the top proof card (highest revenue: $673K) span full width as a "hero proof"
- Remaining 5 cards in 2-column grid below
- Add a subtle animated counter to each stat card (count up on scroll-in)
- Add a "Verified ✓" micro-badge with green accent on each card

### 8. Pricing — Copy Fix & Mobile
- Fix FAQ answer that still says "free plan" — update to reflect paid-only model
- Fix CTA copy inconsistency: "Get Started Free" in CTA banner vs paid-only pricing
- Mobile: stack pricing selector above feature cards (already correct with `lg:grid-cols-2`)

### 9. FAQ — Content Fix
- Update Q3 ("Can I use AURELIA for free?") answer to match paid-only model: "AURELIA offers a 7-day free trial on all plans. After that, choose a plan that fits your style journey."
- Update Q6 cancellation answer to remove "free plan" reference

### 10. CTA Banner — Conversion Optimization
- Change "Get Started Free" to "Start Your Free Trial" for consistency with paid model
- Add a trust micro-line below CTA: "No credit card required · Cancel anytime · 7-day free trial"
- Add subtle floating sparkle particles behind the CTA text

### 11. Footer — Polish
- Add "Privacy Policy" and "Terms of Service" links
- Add TikTok social icon alongside existing ones

### 12. Global Motion System
- Standardize all `whileInView` animations to use `once: true` and `margin: "-80px"`
- Standardize entrance: blur(4px) + translateY(-8px) for headings, translateY(20px) for cards
- Add `will-change: transform` to animated elements for GPU acceleration

### 13. Mobile-Specific Optimizations
- Hero: Increase bottom padding for slide content to avoid nav overlap
- Proof section: Single column cards on mobile with horizontal scroll option
- Features grid: 1 column on mobile (already correct)
- Reduce all section `py-24` to `py-16` on mobile for tighter rhythm

---

### Files to Modify
1. **src/pages/Index.tsx** — Remove RevealImageList and FeatureCarousel sections
2. **src/components/landing/SocialProofStrip.tsx** — Authority stat upgrade + gold accents
3. **src/components/landing/Features.tsx** — Staggered card animation + hover states
4. **src/components/landing/BrandMarquee.tsx** — Copy change + LinkedIn logo
5. **src/components/landing/Testimonials.tsx** — Hero proof card + animated counters + verified badges
6. **src/components/landing/Pricing.tsx** — Copy consistency
7. **src/components/landing/FAQ.tsx** — Fix free tier references
8. **src/components/landing/CTABanner.tsx** — CTA copy + trust line + sparkles
9. **src/components/landing/Footer.tsx** — Privacy/terms links + TikTok
10. **src/components/landing/Hero.tsx** — Scroll indicator + timing tweaks
11. **src/index.css** — Mobile responsive tweaks

