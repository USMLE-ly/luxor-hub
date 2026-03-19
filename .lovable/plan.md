

## Plan: Wardrobe Completeness, Smart Shopping, Gender Click Fix, and Calibration UI Upgrade

### 1. Fix Gender Step Click Issue (Screenshot Bug)

**Problem**: The `drag="x"` directive on the `motion.div` wrapping the GenderStep in `Onboarding.tsx` intercepts pointer/click events, making the Female card unclickable. The Male card works because right-side taps are less likely to trigger the drag gesture.

**Fix**: Disable drag on the gender step (`currentStep === 0`). Change `drag="x"` to `drag={currentStep > 0 ? "x" : false}` on line ~416 of `Onboarding.tsx`. This preserves swipe navigation for all other steps while making the gender selection fully tappable.

**File**: `src/pages/Onboarding.tsx`

---

### 2. Upgrade Calibration Page to Match Onboarding Premium UX

Bring the Calibration page up to the same polish level as the Onboarding page:

- **Segmented phase progress bar** with shimmer sweep (replacing the plain thin progress bar)
- **Ambient background glow** (radial gradient pulse, like Onboarding)
- **Swipe-to-navigate** with `drag="x"` gesture + SwipeParticles canvas
- **Gyro/mouse parallax tilt** on option cards via `useGyroTilt`
- **Phase interstitials** between category groups (e.g., "Bottoms done! Let's look at outerwear.")
- **Haptic feedback** on selection and navigation (vibrate + AudioContext tick)
- **Blur/scale page transitions** matching Onboarding's `pageVariants`
- **Contextual CTA text** and animated arrow pulse on the NEXT button

**File**: `src/pages/Calibration.tsx`

---

### 3. Wardrobe Completeness Score on Dashboard

Add a new widget to the Dashboard showing an overall wardrobe readiness percentage:

- Fetch `clothing_items` for the user and compute:
  - **Category coverage**: % of essential categories (tops, bottoms, outerwear, shoes, dresses, accessories) that have >= 3 items
  - **Color diversity**: % of core neutrals + accent colors present
  - **Overall score**: weighted average (60% category, 40% color)
- Display as an animated SVG ring (gold gradient, matching the app's score ring pattern) with the percentage centered
- Below the ring: a compact list of top 2-3 gaps with action buttons linking to `/inspiration`

**File**: `src/pages/Dashboard.tsx` (new widget section)

---

### 4. Smart Shopping Recommendations Linked to Wardrobe Gaps

Enhance the Inspiration/Shop page to surface gap-based recommendations:

- Read the same gap analysis logic (from `WardrobeGapAnalysis`) to identify missing categories and underrepresented colors
- Add a "Recommended for You" section at the top of the Inspiration page that:
  - Shows a banner: "Fill your wardrobe gaps" with specific missing items
  - Filters/boosts products matching the gap categories and colors
  - Tags gap-filling products with a "Fills Gap" badge
- Reuse the existing `shop-products` edge function but pass gap categories as priority filters

**File**: `src/pages/Inspiration.tsx`

---

### Technical Details

| Task | Files Modified | Key Dependencies |
|------|---------------|-----------------|
| Gender click fix | `Onboarding.tsx` | framer-motion drag prop |
| Calibration upgrade | `Calibration.tsx` | SwipeParticles, useGyroTilt, haptics |
| Completeness widget | `Dashboard.tsx` | supabase clothing_items query |
| Smart shopping | `Inspiration.tsx` | WardrobeGapAnalysis logic, shop-products edge fn |

No database migrations needed. No new edge functions required.

