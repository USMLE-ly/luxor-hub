

## Diagnosis

The screenshot shows the hero rendering as just gold text on a plain background with no WebGL slider images visible. The core issues:

1. **Cleanup leak**: The `useEffect` calls `loadScripts()` which calls `initApplication()`, but the cleanup function returned by `initApplication` is never captured or returned from the `useEffect`. This means on React hot-reload / re-mount, old renderers pile up and new ones may fail.

2. **No fallback**: If THREE.js scripts load but textures fail (CORS, slow network), the canvas stays blank with no visible fallback.

3. **Multiple Three.js instances**: Console shows "Multiple instances of Three.js being imported" — the project already has `three` as an npm dependency, and the hero loads a CDN copy. This conflict can cause `instanceof` checks to fail silently.

## Plan

### 1. Fix the broken hero — use bundled Three.js instead of CDN
- Import `three` from the npm package (already installed) instead of loading via CDN script tag. This eliminates the "multiple instances" conflict.
- Keep GSAP as a CDN load (no npm dep), but guard it properly.
- Restructure the `useEffect` so the cleanup function is actually returned.
- Add a CSS fallback background image on the `<section>` so it's never blank.

### 2. Add Ken Burns zoom effect
- After each slide transition completes and the new texture is set, apply a slow CSS `transform: scale(1) → scale(1.08)` on the canvas element over the slide duration using GSAP. This creates the cinematic zoom.
- Reset scale to 1 instantly on each transition start.

### 3. Add touch/swipe gesture support
- Track `touchstart` and `touchend` X coordinates on the hero section.
- If horizontal swipe distance > 50px threshold, navigate to prev/next slide.
- Prevent vertical scroll interference by only acting on predominantly horizontal swipes.

### 4. Summary of file changes

**`src/components/landing/Hero.tsx`** — single file, full rewrite of the logic:
- Replace CDN Three.js with `import * as THREE from 'three'`
- Fix `useEffect` cleanup chain
- Add fallback `backgroundImage` on section element
- Add Ken Burns scale animation via GSAP on canvas after each transition
- Add `touchstart`/`touchend` listeners for swipe navigation
- Keep all existing: keyboard nav, arrow buttons, slide nav bar, gold styling, CTA buttons

