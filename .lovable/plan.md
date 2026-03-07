

# Upgrade Outfit Analysis to Premium

## Overview
Elevate the analysis results page to match the dark luxury aesthetic shown in the reference screenshots, with richer visual polish, gold accents, and more editorial presentation.

## Changes to `src/pages/OutfitAnalysis.tsx`

### 1. Premium Score Ring
- Replace the plain `hsl(var(--primary))` circle stroke with a gold gradient using SVG `linearGradient` (gold → gold-light)
- Add a subtle gold glow shadow behind the score ring
- Add a gold shimmer sweep overlay on the overall score card (reuse the `gold-shimmer-sweep` animation)

### 2. Better Color Palette Section
- Make color swatches larger (taller aspect ratio, like the reference screenshots)
- Add hex code labels beneath each swatch on hover
- Give the harmony and rating badges gold-tinted styling

### 3. Elevated Card Styling
- Add gold border glow on hover to all result cards (like the chat bubbles): `hover:shadow-[0_0_15px_-3px_hsl(var(--gold)/0.3)]` and `hover:border-[hsl(var(--gold)/0.3)]`
- Add smooth transitions on all cards

### 4. Strengths Section Upgrade
- Replace small badge chips with full-width list items with green accent borders (matching reference screenshot style)
- Each strength gets its own row with a checkmark icon

### 5. Improvements Section Upgrade
- Give each improvement its own card-like row with better spacing
- Show priority as a colored dot with label
- More prominent suggestion text with the reason as subtle subtext

### 6. Layout Refinement
- Change the bottom grid from 3-column to 2-column: Detected Items + Strengths side by side, then Improvements full width below (matching the reference layout)
- Add a Body Type & Silhouette section as a final card

### 7. Analyzing State
- Add a premium skeleton/shimmer loading state while analyzing instead of just the button spinner
- Show progress steps: "Uploading... → Analyzing style... → Generating insights..."

### 8. Section Headers
- Add subtle gold accent line before each section header icon

## Changes to `src/index.css`
- Add a `@keyframes gold-pulse` for the score ring glow animation

## No new files or dependencies needed

