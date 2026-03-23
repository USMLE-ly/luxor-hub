

# Landing Page Overhaul — Keep Revenue Section, No Stripe, Add Free Tier

## What's Changing

Streamline the landing page, add a Free tier with limitations, clean up trust-damaging elements. **Keep the Revenue Showcase testimonials**. **No Stripe integration**.

---

## 1. Remove Low-Value Sections from Index.tsx

- Remove `ContainerScroll` "App Preview" section (scroll filler, no conversion lift)
- Remove `ComparisonTable` (redundant with pricing cards)
- **Keep Testimonials (Revenue Showcase)** as-is

New order:
```text
AnnouncementBanner → Navbar → Hero → SocialProofStrip →
Features → TabbedFeatures → HowItWorks →
Testimonials (Revenue Showcase — kept) → Pricing → FAQ →
CTABanner → Footer → StickyPricingBar
```

## 2. Add Free Tier to Pricing

Add a 4th "Free" card (first position, visually muted `bg-muted/20`):

| Feature | Free |
|---------|------|
| AI outfit suggestions | 3/day |
| Closet items | 15 max |
| Style DNA | Basic snapshot |
| Color analysis | ✗ |
| Capsule wardrobes | ✗ |
| Virtual try-on | ✗ |

- CTA: "Start Free" → navigates to `/auth` (no payment, no Stripe)
- No PayPal button on free card
- Remove "237 founding spots" from Pricing (already in sticky bar)

## 3. Add "Try Free" CTAs

- **Navbar**: Ghost "Try Free" button before "View Plans"
- **Hero**: Secondary outline "Try Free" button next to primary CTA

## 4. Clean CTABanner

- Remove duplicate "237 founding spots remaining" text (redundant with sticky bar)

## 5. Clean Footer

- Remove dead social media icons (all show "Coming Soon" tooltips)

---

## Files Modified

1. **`src/pages/Index.tsx`** — Remove ContainerScroll + ComparisonTable; keep Testimonials
2. **`src/components/landing/Pricing.tsx`** — Add Free tier card, remove "237 spots" text
3. **`src/components/landing/Navbar.tsx`** — Add "Try Free" ghost button
4. **`src/components/landing/Hero.tsx`** — Add "Try Free" outline CTA
5. **`src/components/landing/CTABanner.tsx`** — Remove duplicate urgency copy
6. **`src/components/landing/Footer.tsx`** — Remove dead social icons

