

# AURELIA Landing Page — Premium Rebuild Plan

## Audit Summary

After deep analysis of every landing section, here are the critical weaknesses and the upgrade plan.

### Weaknesses Identified

1. **Hero (LuminaSlider)**: Strong WebGL shader slider — keep. But CTA positioning is awkward on mobile (right-aligned, stacked poorly). Badges feel generic ("10K+ Users", "98% Satisfaction" — unsubstantiated).
2. **HowItWorks**: Recharts RadialBar/AreaChart feel like dashboard widgets, not a landing page. Step cards are small and cramped. The "Style Score Progression" chart adds complexity without conversion value.
3. **Features (BentoGrid)**: Feature images at 25% opacity are invisible. Cards lack visual weight. Tags (#Vision, #AI) feel like developer metadata, not user value. "Explore →" CTA leads nowhere.
4. **AppPreview (ContainerScroll)**: Mock dashboard is too simple — static grid of icons. Doesn't showcase actual product capability. Style Formula card has hardcoded light background that breaks in dark mode.
5. **BrandMarquee**: Two separate marquee rows for reviews is excessive. Review text is generic placeholder copy. Brand logos + reviews in same section dilutes both.
6. **IntegrationHero**: External flaticon CDN images — fragile, slow, potential CORS. "250+ apps" claim is unsubstantiated. Section feels disconnected from fashion context.
7. **Testimonials (Proof Slider)**: Good premium card treatment. "Live Revenue" label and dollar amounts are strong. Keep and refine.
8. **Pricing**: Double header — section has its own header AND CreativePricing component has one. Redundant.
9. **Footer**: Solid. Minor polish needed.
10. **Navbar**: Clean. No major issues.
11. **Section rhythm**: Every section uses the same `py-32` padding and identical GoldDivider. No variation creates monotony.
12. **Mobile**: Hero overlay conflicts with nav items. Feature cards stack poorly. No mobile-specific optimizations.

### Rebuild Plan

#### 1. Hero — Refine CTAs and Social Proof
- Move CTA buttons to center-bottom on mobile for thumb reach
- Replace generic badges with specific metrics: "50K+ Outfits Generated", "4.9★ App Store"
- Add a subtle scroll indicator (animated chevron) at bottom center

#### 2. HowItWorks — Strip Charts, Add Visual Drama
- Remove AreaChart and RadialBarChart entirely — they're dashboard widgets, not landing content
- Replace with a vertical timeline layout (desktop) / horizontal scroll (mobile)
- Each step gets a large editorial number (already exists), icon, title, one-line description
- Add a connecting line/gradient between steps for visual flow
- Increase card size, add subtle hover glow effect

#### 3. Features — Full Visual Impact
- Increase feature image opacity from 0.18-0.25 to 0.4-0.5, or use them as card backgrounds with dark overlay
- Remove developer-facing tags (#Vision, #AI) — replace with benefit-oriented microcopy
- Remove "Explore →" dead-end CTAs
- Add staggered entrance animations per card
- For the 2-col-span cards, use a larger hero-style layout with image on one side

#### 4. AppPreview — Elevated Mock
- Fix dark mode: replace hardcoded `hsl(30 40% 95%)` with theme-aware colors
- Add more realistic dashboard content: a mini outfit grid with actual clothing thumbnails
- Add subtle floating animation to the container scroll card

#### 5. BrandMarquee — Separate Brands from Social Proof
- Keep brand marquee, increase logo size slightly
- Move review cards to their own dedicated section OR remove entirely (the proof screenshots section already serves this purpose better)
- Reduce section to brands-only with tighter spacing

#### 6. IntegrationHero — Contextualize or Remove
- Replace external CDN icons with local SVG fashion platform icons
- Reduce from full section to a compact strip/banner
- OR merge into Features as a sub-feature

#### 7. Testimonials (Proof Slider) — Polish
- Already strong. Minor refinements:
  - Tighten padding on mobile
  - Smoother image loading (add skeleton/blur placeholder)

#### 8. Pricing — Remove Duplicate Header
- Remove the section-level header since CreativePricing already has its own
- Keep GoldDivider for visual separation

#### 9. Section Rhythm and Spacing
- Vary padding: Hero (100vh) → HowItWorks (py-24) → Features (py-32) → AppPreview (auto) → Brands (py-16) → Proof (py-28) → Pricing (py-32)
- Alternate background treatments: transparent → subtle gradient → transparent → dark accent → transparent
- Add a full-width dark accent band around the Proof/Testimonials section for contrast

#### 10. Motion System Upgrades
- Add `will-change: transform` to animated elements for GPU acceleration
- Stagger section entrance: title first, then subtitle (200ms delay), then content (400ms)
- Add parallax depth layers to section backgrounds (subtle, 0.05-0.1x scroll speed)
- Hover states: all interactive cards get a 2px border-color transition to primary/30

#### 11. Mobile-Specific
- Hero: stack CTA center, reduce font size clamp
- Features: single column, full-width cards
- HowItWorks: horizontal scroll carousel with snap points
- Proof slider: reduce card height, tighter padding
- Pricing: vertical stack with popular tier first

### Files to Modify
- `src/components/landing/HowItWorks.tsx` — strip charts, rebuild as timeline
- `src/components/landing/Features.tsx` — increase image impact, remove tags
- `src/components/landing/AppPreview.tsx` — fix dark mode, enrich mock
- `src/components/landing/BrandMarquee.tsx` — strip reviews, brands-only
- `src/components/landing/IntegrationHero.tsx` — compact or merge
- `src/components/landing/Testimonials.tsx` — minor polish
- `src/components/landing/Pricing.tsx` — remove duplicate header
- `src/components/ui/lumina-interactive-list.tsx` — mobile CTA positioning
- `src/components/ui/lumina-slider.css` — mobile responsive fixes
- `src/pages/Index.tsx` — vary section spacing, add background treatments

### Execution Order
1. HowItWorks rebuild (highest impact, currently weakest)
2. Features visual upgrade
3. AppPreview dark mode fix + content enrichment
4. BrandMarquee simplification
5. IntegrationHero compaction
6. Index.tsx section rhythm + backgrounds
7. Hero mobile CTA + badges
8. Pricing dedup
9. Testimonials polish

