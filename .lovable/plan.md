
# Fix Visual Issues + Pull-to-Refresh + Design Polish

## Issues Identified from Screenshots

1. **StyleDNA page**: Still uses the old warm beige gradient card with orange orb — doesn't match the dark glassmorphic redesign already applied to Dashboard
2. **Calibration progress page**: Uses `bg-[hsl(120,30%,94%)]` (light green) background, completely off-brand for a dark-themed app. Trophy SVG is crude.
3. **Dashboard Style Formula card**: Rendering correctly per the new design, but the circular progress ring + progress bar below is redundant (showing calibration % twice)
4. **Chat ?prefill=**: Already implemented and working — no changes needed
5. **Gender-separated calibration**: Already implemented — `maleCalibrationSteps` and `femaleCalibrationSteps` are loaded based on gender from style profile

## Changes

### 1. `src/pages/StyleDNA.tsx` — Align with Dashboard's dark glassmorphic design
- Replace the warm beige gradient hero card (lines 174-270) with the same dark glassmorphic treatment used on Dashboard: `bg-card/60 backdrop-blur-xl border border-border/60`
- Replace the orange orb (lines 228-233) with the SVG circular progress ring from Dashboard
- Use the same green-to-primary gradient progress bar styling
- Use GradientButton for the "Start" CTA instead of the plain dark button

### 2. `src/pages/Calibration.tsx` — Fix progress phase off-brand design
- Replace `bg-[hsl(120,30%,94%)]` (line 516, 587) with `bg-background` to match dark theme
- Replace the crude trophy SVG (lines 522-533) with a clean animated checkmark using Framer Motion
- Fix the bottom button area background to match `bg-background`
- Style the progress bar to match the Dashboard's green-to-primary gradient

### 3. `src/pages/Dashboard.tsx` — Pull-to-refresh + cleanup
- Add touch-based pull-to-refresh gesture: track `touchstart`/`touchmove`/`touchend` at the top of the scroll container. When pulled down >60px, trigger a refresh of shop products + outfit data
- Show a spinning indicator during refresh
- Remove the redundant double-display of calibration % (keep the progress bar, simplify the ring)

### 4. `src/pages/StyleDNA.tsx` — Remove redundancy
- Remove calibration % from both ring and bar — keep only the progress bar with percentage label inside it (matching Dashboard pattern)

## Files Modified
- `src/pages/StyleDNA.tsx` — Dark glassmorphic hero card, progress ring, GradientButton
- `src/pages/Calibration.tsx` — Dark theme progress page, clean animation
- `src/pages/Dashboard.tsx` — Pull-to-refresh gesture, cleanup redundant % display
