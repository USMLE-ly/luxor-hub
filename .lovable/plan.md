

## Plan: Chart-Based Analysis Results, Parallax Effects & Landing Page Verification

### Context
The user wants four changes:
1. Replace the text-heavy Outfit Analysis results with chart-based visualizations inspired by the uploaded PDF (which shows radial gauges, donut charts, bar charts, and compact stat cards from a health dashboard)
2. Verify the landing page scroll-to-expand effect works end-to-end on desktop
3. Verify the landing page on mobile (390px) with video hero and typewriter animation
4. Add parallax scroll effects to Features section illustrations

### Analysis of Current State
The `OutfitAnalysis.tsx` results section (lines 684-865, the `AnalysisResults` component) currently renders:
- **Overall Score**: Already has an SVG ring chart (good, keep)
- **Occasion Suitability**: Text-heavy — each occasion has a name, percentage, Progress bar, AND a full sentence `reason` description
- **Detected Items**: List with text descriptions (reasonable, keep compact)
- **Color Analysis**: Color swatches + text harmony/rating + `bodyTypeNotes` paragraph
- **Strengths**: Bullet list of full sentences
- **Improvements**: Each has a priority badge, suggestion text, AND a reason paragraph

The PDF reference shows compact, visual dashboards with radial gauges, bar/area charts, and minimal text. The user specifically says "too much words, normal people will not interested."

### Technical Approach

#### Task 1: Chart-Based Analysis Redesign
Replace the `AnalysisResults` component with visual chart equivalents using Recharts (already installed):

1. **Occasion Suitability** — Replace text+Progress with a **RadarChart** (spider/radar chart) showing all occasions at once. Remove the `reason` text entirely. Each axis = occasion, value = score percentage.

2. **Color Analysis** — Keep the color swatches (already visual). Remove the long `bodyTypeNotes` paragraph. Show harmony/rating as compact badges instead of text rows.

3. **Strengths** — Replace bullet text with a compact **visual scorecard**: show as short keyword chips/badges (extract key phrases, max 4-5 words each) instead of full sentences.

4. **Improvements** — Replace text blocks with a **horizontal BarChart** showing priority levels visually. Each suggestion becomes a single-line label with a colored priority indicator bar. Remove the `reason` paragraphs.

5. **Overall layout** — Consolidate into fewer, more visual cards. Combine Occasion + Color into a single dashboard row. Keep the existing score ring.

#### Task 2 & 3: Landing Page Verification
Navigate to the landing page on both desktop (1920px) and mobile (390px) viewports to visually verify:
- Scroll-to-expand video effect
- Typewriter animation
- All sections render after expansion
- Mobile stacking and responsiveness

#### Task 4: Parallax Scroll on Features Illustrations
In `Features.tsx`, add a scroll-driven parallax transform to the feature illustration images using Framer Motion's `useScroll` and `useTransform`:
- Each illustration gets a subtle vertical translate (e.g., `translateY` from 20px to -20px) as the card scrolls through the viewport
- Uses `useInView` or `useScroll` with `offset` targeting each card's scroll position

### Files to Modify
- `src/pages/OutfitAnalysis.tsx` — Rewrite the `AnalysisResults` component (lines 684-865) to use Recharts `RadarChart` for occasions, compact badges for strengths, and visual bars for improvements
- `src/components/landing/Features.tsx` — Add parallax transforms to feature illustration images using Framer Motion scroll utilities

### Implementation Details

**Occasion Suitability — RadarChart:**
```text
+---------------------------+
|   Occasion Suitability    |
|                           |
|      Casual (95%)         |
|       /        \          |
|  Brunch ---- Work         |
|       \        /          |
|     Date -- Evening       |
|                           |
|   (Recharts RadarChart)   |
+---------------------------+
```

**Strengths — Keyword Chips:**
```text
+---------------------------+
|  ✓ Strengths              |
|  [Texture Mix] [Balance]  |
|  [Denim Combo] [Tuck]    |
+---------------------------+
```

**Improvements — Visual Priority Bars:**
```text
+---------------------------+
|  ⚠ Improvements          |
|  ██████░░ Off-white tee   |
|  ████░░░░ Silver hoops    |
|  ██████░░ Pop of color    |
+---------------------------+
```

**Parallax on Features:**
- Wrap each illustration `img` in a `motion.div` with `useScroll({ target, offset })` → `useTransform(scrollYProgress, [0,1], [30, -30])` applied as `y` style.

