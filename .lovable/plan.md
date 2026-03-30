

## Plan: Add Two Scroll Animation Components

### What we're building
Two new UI components in `src/components/ui/`:
1. **images-scrolling-animation.tsx** — Sticky card stack that scales down as you scroll
2. **parallax-scrolling-effect.tsx** — Fixed background image with parallax zoom/blur/fade

### Steps

1. **Install `lenis` dependency** — `framer-motion` is already installed; only `lenis` needs to be added.

2. **Create `src/components/ui/images-scrolling-animation.tsx`** — Copy the provided component, adapting `"use client"` directive removal (not needed in Vite/React). Exports `ImagesScrollingAnimation` and `StickyCard_001`.

3. **Create `src/components/ui/parallax-scrolling-effect.tsx`** — Copy the provided parallax component as-is. Default export `ParallaxPage`.

Both components will be available for import but won't be wired into any existing page unless you specify where to use them.

