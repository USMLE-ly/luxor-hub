

## Premium Landing Page Overhaul Plan

### Analysis Summary

After auditing every section, here are the key weaknesses and the upgrades:

**Critical Issues Found:**
- Slide descriptions appear/disappear abruptly — no typewriter effect
- Hero has no parallax depth when scrolling past — feels flat and static
- Navbar lacks mobile hamburger menu — desktop-only nav links
- Footer newsletter has no backend — form does nothing
- No scroll-progress indicator for the full page
- Section transitions lack rhythm — all use identical `py-32` with no variation
- No "back to top" mechanism
- Light mode: Lumina slider text uses hardcoded white — unreadable on light backgrounds

### Implementation Steps

**1. Add parallax scroll effect to Lumina hero**
- Wrap the `lumina-hero-container` with a Framer Motion scroll listener in `Index.tsx`
- Apply `translateY` transform (0 → 150px) as the user scrolls past, creating a cinematic "push-back" depth effect
- Apply subtle opacity fade (1 → 0.6) so the hero dims naturally into the next section

**2. Add typing animation to slide descriptions**
- In `lumina-interactive-list.tsx`, replace the instant `descEl.textContent = ...` with a character-by-character typewriter using GSAP's `stagger` on individual `<span>` characters
- Add a blinking gold cursor (`|`) at the end that fades out after typing completes
- Each slide transition clears and retypes the new description

**3. Add mobile hamburger menu to Navbar**
- Add a `Sheet` (drawer) component triggered by a hamburger icon on screens < `md`
- Include all nav links (Features, How It Works, Pricing) plus the Log In and Get Started CTAs
- Glass background with gold accent dividers

**4. Add scroll-progress indicator**
- Fixed thin gold gradient bar at the very top of the viewport (above navbar, z-50+)
- Width scales from 0% to 100% based on `window.scrollY / maxScroll`
- Provides spatial awareness across the full page

**5. Add section rhythm variation**
- Alternate section padding: `py-32` → `py-24` → `py-32` to create visual breathing
- Add a subtle top/bottom gold divider between hero and HowItWorks for editorial separation

**6. Fix light mode slider text readability**
- Add `color-scheme` awareness to `.slide-title` and `.slide-description` — keep white text since the slider images are always dark/photographic backgrounds
- Ensure `.lumina-bottom-gradient` is always dark regardless of theme

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/ui/lumina-interactive-list.tsx` | Typewriter description animation via GSAP character splitting + blinking cursor |
| `src/pages/Index.tsx` | Wrap LuminaSlider in Framer Motion parallax container; add scroll progress bar |
| `src/components/landing/Navbar.tsx` | Add mobile hamburger menu with Sheet component |
| `src/components/ui/lumina-slider.css` | Add `.slide-description-cursor` blinking animation; parallax container styles |

### Technical Details

- Parallax uses Framer Motion's `useScroll` + `useTransform` on the hero wrapper — no extra dependencies
- Typewriter uses GSAP's existing CDN instance already loaded by the slider — splits description into `<span>` elements and staggers opacity with 30ms delay per character
- Mobile menu uses the existing `Sheet` component from `@/components/ui/sheet`
- Scroll progress bar is a lightweight `useEffect` + `requestAnimationFrame` listener — no library needed

