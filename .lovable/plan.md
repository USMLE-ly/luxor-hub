

# Fix Generating Step Illustration + Add Animations

## Problem (from screenshot)
The clothes rack SVG on the "Hold tight, we're generating your Style Formula!" screen is static, crude, and not gender-differentiated. It doesn't match the premium dark glassmorphic design system.

## Changes

### 1. `src/components/onboarding/StepRenderer.tsx` — Animated Gender-Specific Generating Illustration

**Replace the static SVG** (lines 581-594) with an animated, gender-aware illustration:

- **Female path**: Animated dress forms on a rack — flowing dresses, skirts, and blouses silhouettes swaying gently with staggered Framer Motion animations (rotate ±3°, translateY ±2px)
- **Male path**: Animated suit/jacket forms — structured blazers, shirts, and trousers with subtle sway animations
- Add a **scanning beam** moving across the rack (horizontal gradient line, left-to-right loop)
- Add **sparkle particles** that float up from the clothes as they're "analyzed"
- Each garment fades in sequentially (stagger 0.3s) synced with the progress bars below
- The rack bar gets a subtle **shimmer sweep** matching the Dashboard's glassmorphic design

**Pass `gender` prop** to `GeneratingStep` — currently it only receives `step`. Update the component signature and the call site to include `gender`.

### 2. Gender-Specific Garment Shapes

**Female garments** (5 items): flowing dress, wrap top, A-line skirt, blouse, wide-leg trousers — organic curves, softer silhouettes

**Male garments** (5 items): blazer, dress shirt, chinos, polo, overcoat — structured angles, sharper lines

Each garment uses the brand color palette (warm golds, soft pinks for female; deep blues, charcoal for male) and has:
- Entry animation: scale from 0 → 1 with spring easing
- Idle animation: gentle pendulum sway (rotation keyframes)
- Glow effect: subtle drop shadow pulse synced with the corresponding progress bar reaching 100%

### 3. Progress Bar Sync

When each progress bar hits 100%, the corresponding garment on the rack gets a brief **flash highlight** (white overlay fade) to create a visual connection between the progress and the illustration.

## Files Modified
- `src/components/onboarding/StepRenderer.tsx` — Animated gender-specific GeneratingStep + pass gender prop

