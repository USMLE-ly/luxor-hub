
Goal: stop the landing page “crash/blank” behavior shown in your screenshots and make it stable on mobile + desktop.

What I found
- The hero slider (`LuminaSlider`) can render as a blank block because `.slider-wrapper` starts at `opacity: 0` and only becomes visible when JS marks it as `.loaded`.
- That visibility depends on external CDN script loading (`gsap`, `three`), so on slower/blocked browsers the page looks “crashed” even when React is still running.
- There are additional performance/warning signals (continuous scroll re-rendering + ref warnings) that can worsen perceived instability.

Implementation plan
1) Make hero fail-safe visible by default
- File: `src/components/ui/lumina-slider.css`
- Change strategy:
  - Remove “hidden until loaded” behavior as default.
  - Keep enhancement hooks (`.loaded`) only for visual polish, not core visibility.
- Expected result: no more white/blank first viewport even if external scripts fail.

2) Make slider JS progressive (never blocking UI)
- File: `src/components/ui/lumina-interactive-list.tsx`
- Change strategy:
  - Treat WebGL/GSAP as optional enhancement.
  - If scripts are unavailable/slow, keep static hero content + CTA + fallback background active immediately.
  - Tighten script timeout and avoid long waiting states.
- Expected result: hero always renders; animation upgrades only when available.

3) Reduce crash risk on mobile/tablet
- File: `src/components/ui/lumina-interactive-list.tsx`
- Change strategy:
  - Add a lightweight guard to skip heavy WebGL init on constrained/mobile environments and use fallback mode.
  - Ensure cleanup is always safe (timers, RAF, renderer disposal).
- Expected result: better stability on Kiwi/Android browsers like in your screenshots.

4) Remove ref/warning noise that can destabilize effects over time
- File: `src/components/ui/container-scroll.tsx`
- Change strategy:
  - Fix component/ref compatibility pattern (the warning currently indicates a function component is being passed a ref in the motion tree).
- Expected result: cleaner runtime, fewer layout observer loops and fewer hidden animation side effects.

5) Smooth global scroll performance
- File: `src/pages/Index.tsx`
- Change strategy:
  - Replace per-frame React state updates in `ScrollProgressBar` with a transform/motion-based approach or throttled listener.
- Expected result: less render pressure and fewer “page freezing/crashing” symptoms during scroll.

Validation checklist (after implementation)
- Load homepage on mobile (Kiwi) and desktop: hero must appear instantly (no white blank area).
- Confirm CTA/buttons visible before any 3D effect starts.
- Scroll through “How It Works” and “Connects to your favorite platforms” without freeze.
- Verify console: no recurring ref warnings from `ContainerScroll` path, and no repeated runtime loop errors.
