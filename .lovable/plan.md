

# AURELIA Landing Page — Elite Redesign Plan

## Audit Summary

**Current state**: Good foundation with gold-luxury design system, WebGL hero slider, glassmorphic cards, brand marquee, vertical timeline, container-scroll app preview, and creative pricing. However, several sections feel templated rather than bespoke. Specific weaknesses:

- **Navbar**: Generic glass blur — no brand presence or scroll-state differentiation
- **Hero**: Strong WebGL slider but CTAs and badges compete visually; no clear value hierarchy
- **How It Works**: Timeline is clean but static — no progressive reveal or visual weight
- **Features**: Bento grid with parallax images is good but cards lack interactive depth; all cards feel equal weight
- **App Preview**: ContainerScroll is nice but the mock dashboard inside is flat/basic
- **Brand Marquee**: Standard horizontal scroll — no visual drama
- **Integration Hero**: Too minimal — feels like an afterthought
- **Testimonials**: Revenue screenshots are powerful content but the carousel is basic
- **Pricing**: Creative neo-brutalist style clashes with the luxury aesthetic
- **Footer**: Functional but no signature moment
- **Missing**: No social proof counter strip, no FAQ/objection handling, no animated number reveals on scroll, no magnetic cursor effects

---

## Implementation Plan

### 1. Navbar Upgrade — Authority & Brand Presence
**File**: `src/components/landing/Navbar.tsx`

- Add animated gold underline on active nav link (the link closest to current scroll position)
- On scroll: compress navbar height, fade in a subtle gold bottom-border line
- Replace plain "AURELIA" text with a subtle letter-spacing animation on hover
- Add a notification dot on "Get Started" button that pulses

### 2. Hero Section — Tighten Hierarchy
**File**: `src/components/ui/lumina-interactive-list.tsx`, `src/components/ui/lumina-slider.css`

- Add a floating "Trusted by 50,000+ style-conscious users" social proof bar above CTAs with small avatar stack (CSS circles)
- Add magnetic hover effect to CTA buttons (cursor proximity distortion)
- Improve badge strip: add subtle entrance stagger animation and separator dots
- Add a scroll-indicator chevron at bottom that bounces and fades on scroll

### 3. Social Proof Counter Strip — NEW SECTION
**File**: `src/components/landing/SocialProofStrip.tsx` (new)

Insert between Hero and HowItWorks. A full-width dark band with 4 animated counters:
- "50K+ Outfits Generated" | "4.9★ Rating" | "12K+ Active Users" | "98% Satisfaction"
- Numbers animate on scroll-into-view using intersection observer
- Gold accent numbers, muted labels, subtle grain texture background

### 4. How It Works — Progressive Reveal Upgrade
**File**: `src/components/landing/HowItWorks.tsx`

- Desktop: Add animated connecting line that draws as user scrolls (SVG path with stroke-dashoffset)
- Each node pulses gold when it enters viewport
- Add a subtle icon animation (rotate/scale) on each step when revealed
- Mobile: Add auto-play horizontal scroll with snap indicators

### 5. Features — Interactive Depth
**File**: `src/components/landing/Features.tsx`

- Hero feature card (first item, col-span-2): Add a hover-activated video/animation preview
- Add a "hover spotlight" effect — radial gradient follows cursor position on each card
- Stagger card entrance with alternating left/right slide-in on desktop
- Add category filter pills above grid: "AI Engine", "Wardrobe", "Social" (filters with animation)

### 6. App Preview — Premium Mock Dashboard
**File**: `src/components/landing/AppPreview.tsx`

- Replace flat color circles with actual mini outfit thumbnails or gradient swatches
- Add animated chart line in the analytics widget (SVG path animation)
- Add a typing indicator in the "AI Chat" widget
- Add subtle floating particles inside the preview container

### 7. Testimonials — Authority Overhaul
**File**: `src/components/landing/Testimonials.tsx`

- Add a stacked card effect (3 cards visible, center one elevated)
- Add user avatar + name + role below each revenue card
- Add a running total counter at top: "Total verified revenue: $X.XX M+" that increments
- Add keyboard/swipe navigation indicators

### 8. Pricing — Luxury Realignment
**File**: `src/components/ui/creative-pricing.tsx`

- Remove neo-brutalist rotation/shadow style — replace with glassmorphic cards matching site aesthetic
- Popular tier gets a gold gradient border glow
- Add monthly/yearly toggle with savings badge
- Feature comparison with animated checkmarks on hover
- CTA buttons use the established gold-gradient style

### 9. FAQ Section — NEW
**File**: `src/components/landing/FAQ.tsx` (new)

Insert between Pricing and Footer. Accordion-based FAQ with:
- 6-8 common objection-handling questions
- Smooth expand animation with gold accent on active item
- "Still have questions?" CTA at bottom

### 10. Footer — Signature Finish
**File**: `src/components/landing/Footer.tsx`

- Add a large "Ready to transform your style?" CTA band above the footer
- Newsletter input: add success animation (checkmark morph)
- Add "Made with ♥ and AI" tagline with shimmer
- Add back-to-top integrated into footer

### 11. Global Motion System Upgrades
**File**: `src/index.css`, `tailwind.config.ts`

- Add cursor spotlight effect (radial gradient follows mouse on dark sections)
- Add section reveal animations: each major section fades + slides from alternating sides
- Add smooth scroll-snap behavior for mobile
- Add `prefers-reduced-motion` media query respect for all animations

### 12. Index Page — Section Orchestration
**File**: `src/pages/Index.tsx`

- Insert SocialProofStrip after Hero
- Insert FAQ after Pricing
- Add section dividers between major sections (animated gold lines)
- Wrap each section in a scroll-triggered reveal container

---

## Execution Order
1. Pricing realignment (fixes visual clash — highest impact)
2. Social proof strip (new section, conversion driver)
3. Navbar upgrade (first impression)
4. Hero tightening (hierarchy)
5. Features interactive depth
6. Testimonials authority overhaul
7. How It Works progressive reveal
8. FAQ section
9. App Preview polish
10. Footer signature
11. Global motion upgrades
12. Index orchestration

## Technical Notes
- All animations use `framer-motion` (already installed) with `viewport={{ once: true }}`
- Counter animations use IntersectionObserver pattern already established in `useCountUp`
- Pricing cards switch from neo-brutalist to glassmorphic using existing `glass` utility
- New components follow established patterns: motion variants, gold-text utility, GoldDivider
- No new dependencies required — everything builds on existing stack

