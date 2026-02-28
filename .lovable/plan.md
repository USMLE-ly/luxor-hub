

## Plan: Replace Hero with Lumina Interactive Slider + Aurora Glow

### What changes

The current hero uses a `ScrollExpandMedia` video container that intercepts all wheel events, preventing normal scrolling. This will be replaced with the Lumina interactive image slider as a full-screen hero section, and all content sections below will scroll normally.

### Implementation steps

1. **Create `src/components/ui/lumina-interactive-list.tsx`**
   - Adapt the provided component to fit the fashion/styling brand
   - Replace slide titles and descriptions with fashion-themed content (e.g., "Effortless Style", "Curated Looks", "AI-Powered Fashion")
   - Keep the external portrait images (or swap for fashion-relevant ones if available)
   - Add the companion CSS as `src/components/ui/lumina-slider.css`
   - Style the slider to match the dark luxury gold aesthetic (gold accent `#d4af37` mapped to `--color-accent`)

2. **Add lumina slider CSS to `src/index.css`**
   - Add the required CSS custom properties (`--font-mono`, `--font-display`, `--color-accent`, etc.) to the existing `:root` block
   - Add slider-specific styles (`.slider-wrapper`, `.webgl-canvas`, `.slide-content`, `.slides-navigation`, progress bar styles)

3. **Update `src/pages/Index.tsx`**
   - Remove `ScrollExpandMedia` and the hero video import
   - Render the Lumina slider as the hero (full viewport height)
   - Render `HowItWorks`, `Features`, `Testimonials`, `Pricing`, `Footer` as normal scrollable sections below — this fixes the scroll-interception issue entirely

4. **Add aurora/nebula glow to the hero area**
   - Add a CSS radial gradient overlay behind the slider text content — a soft gold/purple nebula glow using `hsl(43 74% 49% / 0.1)` and `hsl(270 50% 30% / 0.15)` positioned at the center of the viewport

5. **Update `src/components/landing/Hero.tsx`**
   - Since the Lumina slider replaces the Hero as the top section, the existing Hero component content (CTA buttons, tagline, social proof badges) will be integrated into the Lumina slider overlay — or the Hero component will be removed from the Index page layout

### Technical details

- GSAP and Three.js are loaded dynamically via CDN `<script>` tags (as in the provided code) — no npm install needed
- The project already has `three@0.160.1` installed but the lumina component uses its own CDN version (`r128`) to avoid conflicts with the shader material setup
- The `ScrollExpandMedia` component and `hero-video.mp4` import will no longer be used on the Index page (files kept for potential reuse elsewhere)
- The slider uses `requestAnimationFrame` for rendering — performance is acceptable since it only runs on the landing page and uses a single full-screen quad

