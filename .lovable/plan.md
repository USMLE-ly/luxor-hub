

# Color Type Functionality + Scanner Reframing + Confetti + Haptic Feedback

## 1. Color Type Palette — Add Color Detail Functionality

**Problem**: The "View colors" buttons and palette swatches are non-interactive. Tapping them does nothing.

**Fix in `src/pages/ColorType.tsx`**:
- Add an expandable detail view: tapping a palette section's "View colors" toggles showing ALL colors (not just 7+overflow) in a full grid with hex labels and color names
- Tapping an individual color swatch shows a tooltip/modal with: hex code, color name, and which clothing categories it works best for (e.g., "Great for tops and accessories")
- Add a copy-to-clipboard on hex code tap with toast confirmation

## 2. Reframe Face & Body Scanner — "Best Clothes Match" Instead of Shape Detection

**Problem**: The current detection result says "Face Shape Detected" / "Body Shape Detected" and shows shape labels. User wants it reframed as clothing compatibility.

**Fix in `src/components/onboarding/onboardingSteps.ts`**:
- Change `faceResult` question from "Face Shape Detected" to "Your Best Accessory Matches"
- Change description to "Based on your facial proportions, here are the accessories and necklines that suit you best"
- Change `bodyResult` question from "Body Shape Detected" to "Your Best Clothing Matches"
- Change description to "Based on your body proportions, here are the silhouettes and cuts that flatter you most"

**Fix in `src/components/onboarding/StepRenderer.tsx`**:
- After revealing the detected face shape, add a "Best For You" section showing: recommended necklines, glasses frames, earring styles, and hairstyles mapped to the detected face shape
- After revealing the detected body shape, add a "Best For You" section showing: recommended silhouettes, dress cuts, trouser styles, and jacket fits mapped to the detected body shape
- Keep the shape name as a secondary label but lead with the clothing recommendations
- Add clothing-specific icons (Shirt, Scissors, etc.) to each recommendation

## 3. Confetti Animation on Calibration 73% Progress Screen

**Fix in `src/pages/Calibration.tsx`**:
- Add a canvas-based confetti burst that triggers when the progress bar animation completes (after ~1.8s delay = 0.6 delay + 1.2 duration)
- Use a simple particle system: 80 confetti pieces in gold/primary/white colors, falling with gravity and rotation
- Confetti fires from center-top, spreads across viewport, fades out over 3 seconds
- No new dependencies — implement with a small canvas-based function inline

## 4. Haptic Feedback on Pull-to-Refresh

**Fix in `src/pages/Dashboard.tsx`**:
- In `handleTouchEnd`, before calling `refreshData()`, trigger `navigator.vibrate(15)` for a subtle haptic tap
- Add a second vibrate pattern `navigator.vibrate([10, 30, 10])` when refresh completes (in the `finally` block of `refreshData`)

## Files Modified
- `src/pages/ColorType.tsx` — Interactive palettes with expand/detail/copy
- `src/components/onboarding/onboardingSteps.ts` — Reframe detection result text
- `src/components/onboarding/StepRenderer.tsx` — Add clothing recommendations to detection results
- `src/pages/Calibration.tsx` — Confetti particle animation
- `src/pages/Dashboard.tsx` — Haptic vibrate on pull-to-refresh

