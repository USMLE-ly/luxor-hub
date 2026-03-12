

## Premium Upgrade: Facebook Pixel + Onboarding + Splash Screen

### 1. Facebook Pixel Integration

Add the Meta Pixel to `index.html` via the standard `<script>` snippet in `<head>`. Then create a reusable `src/lib/fbPixel.ts` utility that exposes `trackEvent(eventName, params?)` for calling `fbq('track', ...)` safely. Fire standard events:
- **PageView**: on every route change (add to `App.tsx` via a `useEffect` in a `<RouteTracker>` component inside `<BrowserRouter>`)
- **CompleteRegistration**: in `Auth.tsx` after successful signup
- **Lead**: in `Onboarding.tsx` after completing onboarding (`handleComplete`)
- **InitiateCheckout**: in `Pricing.tsx` when user clicks a plan CTA
- **ViewContent**: on landing page load

User will need to provide their Pixel ID — I'll use a placeholder `YOUR_PIXEL_ID` that they replace, or store it as a secret.

### 2. Splash Screen — Premium Rebuild

Current splash is functional but minimal. Upgrades:

- **Dual-ring gold spinner** replacing the flat loading bar — two concentric rotating rings with opposing rotation directions and gold gradient strokes
- **Staggered letter reveal** for "AURELIA" — each letter fades in with 50ms delay and slight Y offset
- **Particle field** — 20 small gold dots floating upward behind the logo with varying speeds and opacities
- **Tagline typewriter effect** — characters appear one at a time after logo animation completes
- **Extend duration** slightly to 3s for the full animation sequence to breathe
- **Add version number** micro-text at bottom: "v2.0" in muted text

### 3. Onboarding Page — Top 1% Execution

Current onboarding is strong but has these weaknesses:
- Progress bar lacks step labels/milestones
- Gender step cards lack premium depth
- No section grouping — 30+ steps feel like an endless stream
- Bottom CTA button is generic across all step types
- No motivational micro-copy between sections

Upgrades:

**A. Progress System Overhaul**
- Replace linear progress bar with a **segmented progress** showing phase names: "Preferences" → "Profile" → "Analysis" → "Style DNA"
- Add phase label above progress: e.g., "Phase 1 of 4 — Preferences"
- Animate phase transitions with a gold pulse when entering a new phase

**B. Gender Step Premium Treatment**
- Add a frosted glass overlay on each image with the label
- Add subtle parallax shift on the images based on gyro tilt
- Gold ring border on selected card instead of plain border

**C. Step Transitions & Micro-copy**
- Add motivational interstitial cards between phases: "Great choices! Now let's learn about you." (appears for 1.5s between phase transitions)
- Add step category chips below the question title: e.g., "Style Preferences", "Body Profile"

**D. Bottom CTA Contextual Upgrade**
- Change button text dynamically: "NEXT" → "CONTINUE" → "ANALYZE" → "GENERATE" based on step type
- Add subtle progress percentage next to button text
- Pulse animation on the button when `canProceed` becomes true

**E. Camera Steps Polish**
- Add countdown timer (3, 2, 1) before capture with animated numbers
- Add shutter flash effect (white overlay flash) on capture

### Files to Modify

1. **`index.html`** — Add Meta Pixel base script
2. **`src/lib/fbPixel.ts`** — New: pixel utility functions
3. **`src/App.tsx`** — Add RouteTracker component for PageView events
4. **`src/pages/Auth.tsx`** — Fire CompleteRegistration on signup
5. **`src/pages/Onboarding.tsx`** — Fire Lead on complete; progress system overhaul; contextual CTA; phase interstitials
6. **`src/components/app/SplashScreen.tsx`** — Premium rebuild with dual-ring spinner, letter reveal, particles, typewriter tagline
7. **`src/components/onboarding/GenderStep.tsx`** — Gold ring selection, frosted overlay
8. **`src/components/onboarding/StepRenderer.tsx`** — Camera countdown + shutter flash; step category chips
9. **`src/components/landing/Pricing.tsx`** — Fire InitiateCheckout pixel event

