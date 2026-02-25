

## Plan: Fix Landing Page Issues + Shader Background + HowItWorks Charts + Analysis Animations

### Problems Identified

1. **Video takes too long to appear**: The `ScrollExpandMedia` starts at 300px wide — the video is tiny and barely visible on initial load. Need to increase starting size.
2. **"Get Started" button unreadable**: The `RainbowButton` in the Navbar uses `text-primary-foreground` which in dark mode is `hsl(240 10% 6%)` (near-black) on a dark background gradient — invisible.
3. **Background looks bad**: Plain dark background with no visual interest. User wants the WebGL shader background (animated grid lines + plasma waves).
4. **"How It Works" section looks unprofessional**: Text-heavy step cards. User wants charts instead.
5. **OutfitAnalysis charts need entrance animations and animated counter tooltips on RadarChart.**

### Changes

#### 1. WebGL Shader Background Component
**New file**: `src/components/ui/shader-background.tsx`
- Port the user-provided WebGL shader (plasma grid lines with animated circles) to a React component
- Replace `next/image` references with standard HTML canvas
- Renders a fixed fullscreen `<canvas>` behind all content (`fixed inset-0 -z-10`)
- Uses `requestAnimationFrame` for smooth animation, `resize` listener for responsiveness

#### 2. Apply Shader Background Globally
**File**: `src/pages/Index.tsx`
- Import and render `ShaderBackground` as the first child inside the landing page wrapper
- Remove `bg-background` from the wrapper since the shader provides the background

**File**: `src/App.tsx`
- Add `ShaderBackground` at the app root level so ALL pages get the animated background (user said "every other page looks bad")

#### 3. Fix Video Appearing Slowly
**File**: `src/components/ui/scroll-expand-media.tsx`
- Increase starting `mediaWidth` from `300` to `500` and `mediaHeight` from `400` to `500` so the video frame is visible immediately on load
- Add `preload="auto"` attribute (already present) and add a loading state that shows the video frame immediately

#### 4. Fix "Get Started" Button Readability
**File**: `src/components/landing/Navbar.tsx`
- Replace the `RainbowButton` with a styled `Button` using solid gold gradient background and clear dark text, or fix the RainbowButton colors
- Apply `className="h-9 px-4 text-sm font-semibold text-white dark:text-black"` to ensure contrast

**File**: `src/components/landing/Hero.tsx`
- Same fix for the "Start Free" `RainbowButton` inside `MagneticButton`

#### 5. Replace "How It Works" Text Cards with Charts
**File**: `src/components/landing/HowItWorks.tsx`
- Replace the 4 text-heavy step cards with a visual "process flow" using Recharts
- Use a **horizontal BarChart** or **AreaChart** showing the 4 steps as a visual progression (step 1→4 with increasing "Style Score" values)
- Each step becomes a data point with a concise label, removing the long description paragraphs
- Add a small Recharts `RadialBarChart` (donut/gauge) for each step showing completion percentage
- Layout: a single wide chart card with step markers, replacing the 4-column grid

#### 6. OutfitAnalysis Chart Animations
**File**: `src/pages/OutfitAnalysis.tsx`
- Wrap each chart card (`Occasion Suitability`, `Strengths`, `Improvements`) in a `motion.div` with `initial={{ opacity: 0, y: 20 }}` and `whileInView={{ opacity: 1, y: 0 }}`
- Add a custom `<Tooltip>` to the RadarChart that shows an animated counter (counting up from 0 to the score value) when hovering over a data point
- Add staggered entrance delays for each chart section

### Files to Create
- `src/components/ui/shader-background.tsx` — WebGL shader canvas component

### Files to Modify
- `src/App.tsx` — Add ShaderBackground at root level
- `src/pages/Index.tsx` — Remove `bg-background`, adjust wrapper
- `src/components/ui/scroll-expand-media.tsx` — Increase initial media dimensions
- `src/components/landing/Navbar.tsx` — Fix Get Started button contrast
- `src/components/landing/Hero.tsx` — Fix Start Free button contrast
- `src/components/landing/HowItWorks.tsx` — Replace text cards with chart-based visual flow
- `src/pages/OutfitAnalysis.tsx` — Add entrance animations and animated RadarChart tooltips

### Technical Details

**Shader Background**: The user-provided GLSL fragment shader creates animated plasma grid lines with circles. It uses `iResolution` and `iTime` uniforms. The component initializes WebGL context, compiles vertex + fragment shaders, creates a fullscreen quad, and renders via `requestAnimationFrame`. Canvas is `position: fixed; z-index: -10` so it sits behind all page content.

**Button Fix**: The `RainbowButton` dark mode variant uses `bg-[linear-gradient(#fff,#fff)...]` making the button white — but the text is also `text-primary-foreground` which is near-white in some contexts. Fix by explicitly setting text color: `text-foreground` or `text-black dark:text-white` depending on background.

**HowItWorks Chart Redesign**: Replace the 4 step cards with a single horizontal flow visualization:
- An `AreaChart` with 4 data points showing style optimization progression (scores: 25→50→80→95)
- Below the chart, 4 compact labels with icons (no long descriptions)
- This communicates the "journey" visually rather than with walls of text

