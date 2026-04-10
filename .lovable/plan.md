

# iPhone Mockup Feature Video + Testimonial Fixes + Brand Asset Overlays

## Overview

Four changes: (1) create the iPhone mockup component and integrate it into the Features section with the auto-playing video inside the phone frame, (2) fix the "Scroll to reveal more" card stack so it actually works, (3) add subtle brand asset overlays to Pricing, FAQ, and How It Works sections, (4) verify all sections render correctly.

---

## 1. iPhone Mockup Component + Features Integration

**Create** `src/components/ui/iphone-mockup.tsx` — adapted from the provided component, removing `next/image` references and converting to standard React/Vite patterns.

**Update** `src/components/landing/Features.tsx`:
- Remove the `SidePanelVideo` / `NativeVideo` approach and the open/close button
- Replace with an `IPhoneMockup` (model `15-pro`, color `space-black`) containing the `featureDemo` video
- Video auto-plays inside the phone frame (autoPlay, loop, muted, playsInline)
- The mockup scales responsively: `scale={0.55}` on mobile, `scale={0.75}` on desktop
- Wrap in a motion.div with a fade+scale entrance animation
- Keep the section header text as-is

---

## 2. Fix "Scroll to Reveal More" Card Stack

**Update** `src/components/landing/Testimonials.tsx`:
- The `CardStackScroll` section currently uses `bg-accent` which may blend into the background. Change to a contrasting dark gradient background
- Remove `overflow-visible` (which can cause layout issues) — the sticky container handles its own overflow
- Ensure the sticky div uses `overflow: visible` while the section itself clips properly
- Reduce `h-[200vh]` to `h-[180vh]` for snappier scroll
- Add a subtle top border or gradient divider between the grid section and the card stack section

---

## 3. Brand Asset Overlays

Add subtle background overlays (opacity 3-5%) to three sections:

- **Pricing** (`src/components/landing/Pricing.tsx`): Import `brutalist-lines.png`, add as absolute background overlay at `opacity-[0.03]`
- **FAQ** (`src/components/landing/FAQ.tsx`): Import `ombra.png`, add as absolute background overlay at `opacity-[0.04]`
- **HowItWorks** (`src/components/landing/HowItWorks.tsx`): Import `transparency.png`, add as absolute background overlay at `opacity-[0.03]`

Each overlay: `<img src={asset} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-[0.03] pointer-events-none select-none" />`

---

## 4. Verification

- Scroll through the entire landing page on desktop and mobile viewports
- Confirm the iPhone mockup with video renders in the Features section
- Confirm the card stack animates on scroll
- Confirm brand overlays are subtle and don't interfere with readability

---

## Technical Notes

- No new npm dependencies needed — the iPhone mockup is pure React + inline styles
- The `featureDemo.mp4` asset is already in the project at `src/assets/feature-demo.mp4`
- Brand assets are already extracted in `src/assets/brand/`

