

# Landing Page Premium Overhaul

## Audit Summary

**Current weaknesses identified:**
- Too many sections creating scroll fatigue (12+ sections)
- SocialProofStrip uses text-only brand names at 20% opacity — reads as placeholder, not premium
- Testimonials section shows revenue screenshots that are for a different business (e-commerce dashboards) — irrelevant for an AI stylist app and damages trust
- Features section (RadialOrbitalTimeline) is complex but low readability on mobile
- ContainerScroll "App Preview" section adds bulk without conversion value
- Comparison table is dense and low-impact for mobile users
- CTA copy is repetitive ("237 founding spots" appears twice)
- Section headers all follow identical pattern: uppercase label → big title → gold-text span — monotonous rhythm
- Footer has dead social links ("Coming Soon" tooltips) — signals early/unfinished product
- Announcement banner + sticky pricing bar + CTA banner = 3 competing urgency layers

## Plan

### 1. Remove Low-Value Sections
- **Delete ContainerScroll "App Preview"** — adds scroll length without conversion lift
- **Delete ComparisonTable** — too dense, pricing cards already communicate tier differences
- **Delete Testimonials (Revenue Showcase)** — e-commerce revenue screenshots are irrelevant to an AI stylist app and hurt credibility. Replace with a compact social proof format (see step 4)

### 2. Upgrade SocialProofStrip to Premium Marquee
- Replace text-only brand names with properly styled editorial badges
- Increase opacity from 20% → 50% idle, 80% hover
- Add a thin gold separator line above/below
- Make the marquee smoother with doubled content and proper gap
- Change "As Featured In" to a more subtle "Featured In" with letter-spacing

### 3. Restructure Section Flow for Conversion
New order (7 sections instead of 12):
```text
Announcement Banner
Navbar
Hero (4-slide WebGL slider) ← keep
SocialProofStrip (upgraded marquee) ← keep, upgraded
Features (RadialOrbitalTimeline) ← keep
TabbedFeatures (3-tab deep dive) ← keep
HowItWorks (Gallery4) ← keep
Pricing ← keep, refined
FAQ ← keep
CTA Banner ← keep, deduplicated
Footer ← refined
Sticky Pricing Bar ← keep
```

### 4. Replace Revenue Testimonials with User Quotes
- Replace e-commerce dashboard screenshots with 3 concise user testimonial quotes
- Use glassmorphism quote cards with gold accent borders
- Short format: quote + name + context (e.g., "Sarah M., Marketing Director")
- Place between HowItWorks and Pricing for maximum trust before purchase decision

### 5. Refine Pricing Section
- Remove duplicate "237 founding spots" (keep only in sticky bar or CTA, not both)
- Clean up trust badge spacing

### 6. Polish Footer
- Remove dead social media icons (Instagram, Twitter, TikTok, LinkedIn, GitHub all show "Coming Soon")
- Keep only the newsletter signup and quick links
- Add back social icons only when real links exist

### 7. Deduplicate Urgency Signals
- Keep announcement banner countdown
- Keep sticky pricing bar
- Remove "237 founding spots remaining" from CTA banner (redundant with sticky bar)
- CTA banner focuses purely on emotional appeal + single button

## Files Modified
- `src/pages/Index.tsx` — Remove ContainerScroll, ComparisonTable, old Testimonials; add new Testimonials component
- `src/components/landing/SocialProofStrip.tsx` — Premium marquee upgrade
- `src/components/landing/Testimonials.tsx` — Complete rewrite: user quote cards instead of revenue screenshots
- `src/components/landing/CTABanner.tsx` — Remove duplicate urgency copy
- `src/components/landing/Footer.tsx` — Remove dead social icons
- `src/components/landing/Pricing.tsx` — Remove duplicate "237 spots" text

