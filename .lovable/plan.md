

# AURELIA Landing Page — Next-Level Premium Upgrade

## Analysis of 21st.dev Component Patterns

Key patterns from the community library worth integrating: **animated text reveals** (character-by-character typing), **magnetic cursor buttons**, **scroll-velocity text marquees**, **glassmorphic dock navigation**, **comparison sliders**, **animated borders/glowing cards**, and **shader backgrounds**. Mapping the strongest patterns against current weaknesses.

## Current Weaknesses Identified

1. **No animated text** — headings appear instantly, no typewriter/word-reveal drama
2. **Brand marquee lacks drama** — simple horizontal scroll, no velocity or interaction
3. **Integration section is weak** — small, minimal, feels like afterthought
4. **No cursor-following effects** — missing the magnetic/spotlight global cursor trend
5. **Social proof strip** — counters work but section feels thin visually
6. **ThemeShowcase** — good concept but static; needs interactive toggle
7. **No announcement banner** — missing urgency/conversion at top of page
8. **Footer CTA** — good but could use animated gradient border
9. **Missing: animated gradient borders** on key sections
10. **Missing: text scramble/reveal effects** on section headings

---

## Implementation Plan (8 Upgrades)

### 1. Animated Text Reveal Component
**New file**: `src/components/ui/animated-text-reveal.tsx`

Create a reusable `TextReveal` component that animates words/characters into view with staggered spring animations. Support modes: `word` (word-by-word fade+slide), `char` (character-by-character), and `blur` (blur-to-sharp). Apply to all major section headings (Features, HowItWorks, Testimonials, Pricing, FAQ, ThemeShowcase).

### 2. Announcement Banner
**New file**: `src/components/landing/AnnouncementBanner.tsx`

Sticky top banner above navbar: "✨ Early Access — 50% off Pro for first 1,000 users" with animated shimmer sweep background, dismissible with X button (stores dismissed state in sessionStorage). Gold gradient text on dark translucent background. Height: 36px. Navbar offset adjusts accordingly.

**Edit**: `src/pages/Index.tsx` — add banner above Navbar.

### 3. Magnetic Cursor Button
**New file**: `src/components/ui/magnetic-cursor.tsx`

A wrapper component that creates magnetic pull effect — element translates toward cursor when within proximity (60px). Apply to: Navbar "Get Started" button, Footer CTA button, and pricing CTA buttons. Uses `mousemove` listener with lerp-based spring positioning.

### 4. Velocity-Based Brand Marquee Upgrade
**Edit**: `src/components/landing/BrandMarquee.tsx`

Replace simple marquee with a dual-row system: Row 1 scrolls left, Row 2 scrolls right. Add scroll-velocity sensitivity — marquee speeds up when user scrolls fast (using `useScroll` velocity from framer-motion). Add a subtle 3D perspective tilt on the section. Brands scale up on hover with a glassmorphic tooltip showing brand name.

### 5. Interactive Theme Comparison Slider
**Edit**: `src/components/landing/ThemeShowcase.tsx`

Replace side-by-side static layout with an interactive **comparison slider** — single dashboard view split by a draggable vertical divider. Left side shows light mode, right shows dark mode. User drags the gold handle to reveal more of either side. Much more engaging than static side-by-side. Add a subtle animated gold border around the comparison container.

### 6. Glowing Animated Border on Key Sections
**New file**: `src/components/ui/animated-border.tsx`

Create a reusable `AnimatedBorder` wrapper that renders a rotating conic-gradient border (gold tones). Apply to: Social Proof Strip container, Pricing popular card (enhance existing glow), and Footer CTA band. Uses CSS `@property` for smooth angle rotation.

### 7. Integration Section Rebuild
**Edit**: `src/components/landing/IntegrationHero.tsx`

Transform from minimal horizontal layout to a full-width **orbital/connected graph** design. Center: AURELIA logo with gold glow. Platform icons orbit around it in a circular arrangement with animated connection lines (SVG paths with dash-offset animation). On hover, the hovered platform enlarges and its connection line glows gold. Mobile: horizontal scroll with snap instead of orbit.

### 8. Index Page Orchestration
**Edit**: `src/pages/Index.tsx`

- Insert `AnnouncementBanner` at top
- Wrap Navbar in a container that accounts for banner height
- Apply `TextReveal` to section headings throughout child components
- Add `MagneticCursor` wrapper to key CTAs

---

## Technical Notes
- All new components use framer-motion (already installed)
- `AnimatedBorder` uses CSS `@property` for `--angle` — supported in all modern browsers
- Magnetic cursor uses `requestAnimationFrame` for smooth 60fps tracking
- Velocity marquee reads from `useScroll` motion values — no extra deps
- Comparison slider uses pointer events + state for divider position
- No new dependencies required

## Execution Order
1. Animated text reveal (used across all sections)
2. Magnetic cursor (used across multiple CTAs)
3. Announcement banner (quick win, high conversion impact)
4. Brand marquee velocity upgrade
5. Theme comparison slider
6. Animated border component
7. Integration section rebuild
8. Index orchestration (wires everything together)

