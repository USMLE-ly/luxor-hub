

# Shrine Pro-Inspired Minimalist Overhaul — Black & White

## What's Changing

Convert the entire landing page color system from gold/warm tones to a strict black-and-white palette. Simplify every section to match the Shrine Pro wireframe aesthetic: clean whitespace, flat backgrounds, minimal decoration, editorial restraint.

---

## 1. CSS Color System Overhaul (`src/index.css`)

### Dark mode (`.dark`) — the landing page theme:
- `--background`: `0 0% 4%` (near-black)
- `--foreground`: `0 0% 95%` (off-white)
- `--card`: `0 0% 7%`
- `--primary`: `0 0% 95%` (white — used for buttons/accents)
- `--primary-foreground`: `0 0% 4%` (black text on white buttons)
- `--accent`: `0 0% 15%`
- `--muted`: `0 0% 12%`
- `--muted-foreground`: `0 0% 50%`
- `--border`: `0 0% 15%`
- `--input`: `0 0% 15%`
- `--ring`: `0 0% 30%`
- `--gold/gold-light/gold-dark`: all → grayscale (`0 0% 80%`, `0 0% 90%`, `0 0% 65%`)
- `--glass`: `0 0% 7%`
- `--glass-border`: `0 0% 18%`
- All sidebar vars → neutral grayscale

### Light mode (`:root`):
- `--background`: `0 0% 100%`
- `--primary`: `0 0% 10%`
- `--gold/gold-light/gold-dark`: → grayscale equivalents

### Utility classes updated:
- `.gold-gradient` → white-to-gray gradient
- `.gold-text` → white gradient text (dark mode) / black gradient text (light)
- `.gold-glow` → subtle white glow
- `.gold-shimmer`, `.gold-shimmer-text` → grayscale shimmer
- `.gradient-button` → solid white bg, black text, no gold border-bottom; hover lifts with white glow
- `.gradient-button-variant` → white/gray outline
- `.premium-card:hover` → subtle white/gray glow
- `.slide-progress-fill` → white instead of gold

## 2. Navbar Cleanup (`src/components/landing/Navbar.tsx`)

- Remove `RainbowButton` — replace with a clean white-bordered button
- Remove `MagneticCursor` wrapper
- Remove green pulse dot
- Keep: LEXOR® logo, nav links, Try Free ghost button, Get Started (white outline)

## 3. Hero Minimal Touch (`src/components/landing/Hero.tsx`)

- "Try Free" button: simple white outline, no gold
- Keep WebGL slider (colors change via CSS vars automatically)

## 4. SocialProofStrip Cleanup (`src/components/landing/SocialProofStrip.tsx`)

- Remove radial gradient overlay
- Increase text opacity from `text-muted-foreground/20` to `text-muted-foreground/30`
- Remove `backdrop-blur-sm`

## 5. Pricing — Free Tier + Comparison Table (`src/components/landing/Pricing.tsx`)

- Free card: dashed border (`border-dashed border-white/20`), "FREE" badge
- Add collapsible "Compare All Features" section below cards using `Collapsible` from radix
- Comparison table: 4 columns (Free/Starter/Pro/Elite), checkmarks/dashes, grouped rows

## 6. FAQ Cleanup (`src/components/landing/FAQ.tsx`)

- Remove `premium-card` class from accordion items
- Simple `border-b border-border` instead of glass cards

## 7. CTABanner Simplification (`src/components/landing/CTABanner.tsx`)

- Remove `AnimatedGradientBackground` — flat `bg-muted/20` background
- Button becomes solid white with black text

## 8. StickyPricingBar (`src/components/landing/StickyPricingBar.tsx`)

- Remove gold shadow → simple `shadow-lg`
- Button: white bg, black text

## 9. AnnouncementBanner (`src/components/landing/AnnouncementBanner.tsx`)

- Remove gold shimmer sweep
- `gold-text` on "Early Access" will auto-convert via CSS vars

## 10. Footer (`src/components/landing/Footer.tsx`)

- Newsletter submit button: white bg instead of `gold-gradient`

---

## Files Modified

1. **`src/index.css`** — Full color variable conversion + utility class updates
2. **`src/components/landing/Navbar.tsx`** — Remove RainbowButton, MagneticCursor, pulse dot
3. **`src/components/landing/Hero.tsx`** — Clean button styling
4. **`src/components/landing/SocialProofStrip.tsx`** — Remove radial gradient, increase opacity
5. **`src/components/landing/Pricing.tsx`** — Free tier dashed border + badge, collapsible comparison table
6. **`src/components/landing/FAQ.tsx`** — Remove premium-card, use border-bottom
7. **`src/components/landing/CTABanner.tsx`** — Remove animated background, flat dark bg
8. **`src/components/landing/StickyPricingBar.tsx`** — Remove gold shadow
9. **`src/components/landing/AnnouncementBanner.tsx`** — Remove shimmer animation
10. **`src/components/landing/Footer.tsx`** — White newsletter button

## Technical Notes

- All color changes propagate through CSS variables — most components auto-update
- Collapsible comparison table uses existing `@radix-ui/react-collapsible`
- No new dependencies
- No database changes
- The app pages (dashboard, etc.) will also shift to grayscale via the CSS vars — this is intentional for consistency

