

# Plan: Replace Pricing UI with Animated Glassy Pricing Component

## Summary
Replace the pricing sections on the landing page and paywall with the new animated glassy glassmorphic pricing cards featuring a WebGL shader background and ripple-effect buttons, while keeping PayPal subscription integration intact.

## Changes

### 1. Create new UI components
- **`src/components/ui/multi-type-ripple-buttons.tsx`** — RippleButton with click ripple animations (4 variants: default, hover, ghost, hoverborder)
- **`src/components/ui/animated-glassy-pricing.tsx`** — ModernPricingPage, PricingCard, ShaderCanvas. Adapted to:
  - Use LUXOR's gold/amber palette instead of cyan
  - Accept `onButtonClick` callback per card for PayPal/navigation
  - Support custom footer content (e.g. PayPal buttons) per card

### 2. Rewrite Landing Pricing (`src/components/landing/Pricing.tsx`)
- Use `ModernPricingPage` with ShaderCanvas background
- 3 tiers: Starter $9, Pro $29, Elite $99 with LUXOR features
- Button click navigates to `/auth`
- Trust badges and payment icons kept below

### 3. Rewrite Paywall (`src/pages/Paywall.tsx`)
- Individual `PricingCard` components, each with a `PayPalButton` underneath
- No ShaderCanvas (performance on mobile)
- Keep restore purchase, trust badges, payment icons

### 4. CSS update (`src/index.css`)
- Add `--button-ripple-color` variable to `:root` and `.dark`

### 5. Post-implementation: Website overview
After completing the code changes, I'll provide a plain-language walkthrough of the entire LUXOR website suitable for someone unfamiliar with it.

## Files
| File | Action |
|------|--------|
| `src/components/ui/multi-type-ripple-buttons.tsx` | Create |
| `src/components/ui/animated-glassy-pricing.tsx` | Create |
| `src/components/landing/Pricing.tsx` | Rewrite |
| `src/pages/Paywall.tsx` | Rewrite |
| `src/index.css` | Add CSS variables |
| `src/components/app/PayPalButton.tsx` | No change |
| `src/components/app/PaywallGate.tsx` | No change |

## Technical Notes
- Tailwind 3 project — CSS vars go in `index.css`, not `@theme`
- `cyan-400` references replaced with `primary` (LUXOR gold)
- ShaderCanvas uses WebGL animated ring — landing only, disabled on paywall
- PayPal Plan IDs: Starter `P-6KB46929KR388530GNG6YDAA`, Pro `P-3TT76167R1560735XNG6X7TQ`, Elite still uses Starter as placeholder

