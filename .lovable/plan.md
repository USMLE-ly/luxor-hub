

## Plan: Enhanced Hero Background with Parallax & Floating Circle Effects

### What Changes

**1. Enhance parallax scroll effect on the video background**
- The hero already has a basic parallax (`videoY` transforms from `0%` to `30%`). We'll increase the range slightly and add a scale transform that grows as user scrolls, creating a more cinematic zoom-out depth effect.

**2. Add floating premium circle elements**
- Add 4-5 animated circular shapes behind the content (similar to the `ElegantShape` pattern in `shape-landing-hero.tsx`) but using circles with soft gradient fills and slow floating animations.
- Circles will have varying sizes (100px–400px), subtle white/gold/primary opacity, blur, and slow `y` oscillation via framer-motion.
- Positioned absolutely within the hero, layered between the video background (z-0) and content (z-10).

### Files Modified

**`src/components/ui/glassmorphism-trust-hero.tsx`**
- Add a `FloatingCircle` component with framer-motion entrance animation (fade + drift down) and continuous float (`y: [0, 15, 0]` over 10-16s).
- Render 5 circles at various positions with gradients using `primary`, `accent`, and white tones at low opacity (0.06–0.12).
- Adjust parallax: add `useTransform` for scale (`[1, 1.1]`) on the video container for depth.

### Technical Details

```text
Layer stack (z-index):
  z-0  — Video + overlays + parallax scale
  z-[1] — Floating gradient circles (new)
  z-10 — Content (unchanged)
```

Each circle: `rounded-full`, `backdrop-blur-[2px]`, `border border-white/[0.08]`, soft radial gradient fill, `pointer-events-none`.

