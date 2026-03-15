

## Shrine Pro Pattern Integration — New Features for AURELIA

### Analysis

Shrine Pro is a high-conversion Shopify theme built around urgency, trust signals, and conversion psychology. After scanning its feature set against AURELIA's existing landing page, these are the **new patterns we don't have** that translate directly to our SaaS context:

1. **Countdown Timer in Announcement Banner** — Shrine's top bar uses a live countdown to create urgency. Our `AnnouncementBanner` has static text only.
2. **Payment Trust Badges on Pricing** — Shrine shows Visa/Mastercard/Apple Pay icons below purchase CTAs. We have none.
3. **Feature Comparison Table** — Shrine has an expandable feature comparison grid by category. We show features as chips on cards but have no side-by-side plan comparison.
4. **Sticky "Add to Cart" / CTA Bar** — Shrine uses a sticky bottom bar that appears on scroll with price + CTA. We have no sticky conversion element.
5. **Urgency Micro-copy** — "Cart reserved for X minutes", "Only X left" patterns. We have none on pricing.
6. **Content Tabs** — Shrine uses tabbed content sections for organizing dense information. We don't have this pattern anywhere on the landing page.

### What to Build (6 files)

#### 1. `src/components/landing/AnnouncementBanner.tsx` — Add Countdown Timer
- Add a live countdown timer next to the "Early Access" text
- Timer counts down from a stored end-time (24h from first visit, persisted in localStorage)
- Display as `HH:MM:SS` with gold text styling
- Add a second info slot: "✦ Join 10K+ Members" rotating with the offer text on mobile

#### 2. `src/components/landing/Pricing.tsx` — Payment Trust Badges + Urgency
- Add a row of payment method SVG icons (Visa, Mastercard, Apple Pay, Google Pay, PayPal) below the PricingInteraction component in grayscale
- Add urgency micro-copy: "🔥 127 stylists signed up this week" with a subtle pulse animation
- Add "30-day money-back guarantee" trust badge with shield icon

#### 3. `src/components/landing/ComparisonTable.tsx` — NEW: Feature Comparison Table
- Create a new section with a side-by-side feature comparison grid
- Three columns: Starter / Pro / Elite
- Rows grouped by category: "AI Features", "Wardrobe Tools", "Shopping", "Support"
- Check/X icons for feature availability, with expandable category rows (accordion)
- Place between Pricing and FAQ in `Index.tsx`

#### 4. `src/components/landing/StickyPricingBar.tsx` — NEW: Sticky Bottom CTA
- A sticky bar that appears after user scrolls past the hero section
- Shows "Start Your Free Trial — 7 Days Free" with a gold CTA button
- Slides up on entry, hides when pricing section is in viewport (no double-CTA)
- Includes a dismiss X button; dismissal persisted per session
- Glass background with blur

#### 5. `src/pages/Index.tsx` — Wire New Sections
- Import and place `ComparisonTable` between Pricing and FAQ
- Import and place `StickyPricingBar` as a fixed overlay
- Import `AnnouncementBanner` above the Navbar (already exists but not rendered on Index)

#### 6. `src/index.css` — Supporting Styles
- Add countdown timer pulse keyframe for the colon separator
- Add grayscale filter utility for payment badges with hover-to-color transition
- Add sticky bar slide-up animation

### Execution Order
1. AnnouncementBanner countdown timer upgrade
2. ComparisonTable (new component)
3. StickyPricingBar (new component)
4. Pricing trust badges + urgency copy
5. Index.tsx wiring
6. CSS additions

