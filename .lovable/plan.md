

## Plan: Fix Landing Page Lag + Mobile Check + Progress Bar

### Root Cause Analysis

The landing page runs **3 simultaneous GPU-intensive animation loops** competing for resources:

1. **ShaderBackground** (`src/App.tsx` line 34) — A full-screen WebGL shader with 16 line iterations + 40 particle iterations running at **uncapped ~60fps on every single page**, not just the landing page
2. **AuroraBackground** (`src/components/ui/aurora-background.tsx`) — A Three.js WebGL shader with 18 iterations at ~30fps, rendered behind the hero video
3. **ParticleCanvas** (`src/components/landing/Hero.tsx` line 48) — A Canvas2D animation with up to 80 particles + O(n^2) connection checks at uncapped ~60fps

Additionally, the CSS has a **global `transition` on every element** (`src/index.css` line 111: `* { transition: background-color 0.3s, color 0.2s, border-color 0.3s; }`), which triggers compositor work on scroll.

### Changes (Balanced Visuals)

#### 1. Throttle ShaderBackground to ~24fps and render at half resolution
**File**: `src/components/ui/shader-background.tsx`
- Add `lastTime` tracking and skip frames if <42ms elapsed (same pattern as aurora)
- Set canvas size to `window.innerWidth / 2` and `window.innerHeight / 2`, then scale via CSS `transform: scale(2)` with `transform-origin: top left`
- This cuts GPU pixel fill by 75% and frame rate by ~60%

#### 2. Remove AuroraBackground from ScrollExpandMedia — use CSS gradient instead
**File**: `src/components/ui/scroll-expand-media.tsx`
- Replace `<AuroraBackground />` with a simple CSS radial gradient background (dark with subtle color shifts)
- This eliminates an entire WebGL context and Three.js overhead entirely from the landing page
- The ShaderBackground already provides the animated background effect globally

#### 3. Throttle ParticleCanvas to ~20fps and reduce particle count
**File**: `src/components/ui/particle-canvas.tsx`
- Add frame throttling (skip frames if <50ms elapsed)
- Reduce default maxParticles to 30 (from 80 desktop / 40 mobile)
- Reduce connection distance to 80 (from 110)

#### 4. Remove global wildcard transition
**File**: `src/index.css`
- Remove the `* { transition: ... }` rule from the base layer
- This prevents the browser from recalculating transitions on every element during scroll, which is a major source of scroll jank

#### 5. Testimonials progress bar (already done — verify)
The progress bar with fill animation was added in the previous iteration. No changes needed here. Will verify on mobile.

### Files to Modify
- `src/components/ui/shader-background.tsx` — Throttle to ~24fps, render at half resolution
- `src/components/ui/scroll-expand-media.tsx` — Replace AuroraBackground with CSS gradient
- `src/components/ui/particle-canvas.tsx` — Throttle to ~20fps, reduce particles
- `src/index.css` — Remove wildcard transition rule

### Verification Plan
- Navigate to landing page on desktop (1366px) and scroll through all sections
- Navigate to landing page on mobile (390px) and verify aurora replacement + carousel
- Hover over testimonials carousel to verify progress bar pause/resume

