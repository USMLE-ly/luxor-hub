

## Audit Summary & Implementation Plan

### 1. Sparkles Icon Purge (Landing Page)

Found in 4 landing files:
- **AnnouncementBanner.tsx** line 91: `<Sparkles>` before "Early Access" — replace with `Diamond` (brand icon)
- **Hero.tsx** line 4: unused import — remove
- **Pricing.tsx** line 113: `<Sparkles>` in "Most Popular" badge — replace with `Crown`
- **TabbedFeatures.tsx** lines 4, 18: used as `AI Outfit Generator` icon — replace with `Wand2`
- **Footer.tsx** line 1: unused import — remove

### 2. Critical Design Weaknesses Identified

**A. Section pacing is monotone** — Every section uses identical `py-16 md:py-24` vertical rhythm. No breathing room variation creates visual fatigue. Fix: alternate between `py-20 md:py-32` (hero-weight sections) and `py-12 md:py-20` (transitional sections like BrandMarquee).

**B. Testimonials 5-star rows are generic** — Star ratings look templated. Replace with a single gold accent bar or remove entirely since "Verified" badges already establish trust.

**C. Social Proof Strip lacks visual weight** — Media badges (Vogue, GQ) are just plain text. Upgrade to letter-spaced, slightly larger type with a subtle separator line between each.

**D. CTA Banner missing urgency** — Has "no credit card required" but no live urgency element. Add a live member count or connect to the announcement banner timer.

**E. Footer has dead social links** — All `href="#"` — these hurt trust. Add `aria-disabled` styling and "Coming Soon" tooltip, or remove.

**F. FAQ section has no visual anchor** — Accordion items float without hierarchy. Add a subtle left gold border on the active item.

**G. Pricing cards lack tier differentiation** — All three cards look identical except the "Most Popular" badge. The Pro card needs stronger visual weight (thicker border, slight scale bump).

**H. Comparison Table mobile UX** — 4-column grid at `grid-cols-4` is cramped on 375px. Feature names get truncated. Needs horizontal scroll or a mobile-specific stacked layout.

### 3. Implementation Scope

Files to modify:
- `AnnouncementBanner.tsx` — swap Sparkles → Diamond
- `Hero.tsx` — remove unused Sparkles import  
- `Pricing.tsx` — swap Sparkles → Crown, enhance Pro card visual weight
- `TabbedFeatures.tsx` — swap Sparkles → Wand2
- `Footer.tsx` — remove unused Sparkles import, style dead links
- `Testimonials.tsx` — remove 5-star rows, replace with gold accent
- `SocialProofStrip.tsx` — enhance media badge typography
- `FAQ.tsx` — add active-item gold border accent
- `ComparisonTable.tsx` — add mobile horizontal scroll wrapper
- `CTABanner.tsx` — add live urgency micro-copy
- `Index.tsx` — vary section spacing rhythm

