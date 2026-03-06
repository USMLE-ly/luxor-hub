

# Dashboard & App-Wide Design Overhaul + Outfit Analysis Nav

## 1. Add Outfit Analysis to Bottom Nav

**`src/components/app/BottomNav.tsx`**: Insert a 5th tab "Analysis" with `ScanEye` icon at position 3 (after "My Shop", before "AI Stylist"). Update active state logic to include `/outfit-analysis` path.

```text
DNA | My Shop | Analysis | AI Stylist | Closet
```

Reduce icon/text sizes slightly to fit 5 tabs cleanly on mobile.

---

## 2. Style Formula Card — Premium Redesign

**Problem**: The card looks flat and generic. The warm beige gradient doesn't match the dark luxury brand. The orb animation is decorative but lacks informational value.

**Fix in `src/pages/Dashboard.tsx`**:
- Replace beige gradient with a dark glassmorphic card: `bg-card/60 backdrop-blur-xl border border-white/5`
- Redesign the 3-column style attributes as premium pill badges with subtle glow on each icon
- Replace the generic spinning orb with a circular progress ring (SVG) showing calibration % with the Sparkles icon centered
- Add a subtle shimmer sweep animation across the card on mount
- Make the "Start" CTA use the existing `GradientButton` with 3D press effect instead of flat black
- Tighten vertical spacing — current card is too tall for its content density

---

## 3. Shop Similar Section — Authority Upgrade

**Problem**: Product cards show placeholder icons instead of images. Match score badges lack the color-coded system already built in Inspiration. No visual hierarchy between high and low matches.

**Fix in `src/pages/Dashboard.tsx`**:
- Apply the same `getScoreColor()` logic from Inspiration: green (>85%), gold (70-85%), gray (<70%)
- Add a subtle colored bottom border on each card matching the score tier
- Replace `ShoppingBag` placeholder with a more premium empty state: gradient background with category icon
- Add horizontal scroll snap (`scroll-snap-type: x mandatory`) for smoother mobile swiping
- Add "View All" link pointing to `/inspiration`

---

## 4. All My Outfits Section — Interaction Polish

**Fix in `src/pages/Dashboard.tsx`**:
- Add scroll snap to the horizontal outfit cards
- Make occasion tabs actually filter the outfit list (currently decorative)
- Add a subtle entrance stagger (0.05s per card) for the horizontal scroll items
- "Generate" CTA: swap to `GradientButton` with sparkle icon for consistency

---

## 5. Chat with AI Stylist Section — Conversion Boost

**Fix in `src/pages/Dashboard.tsx`**:
- Add an icon to each prompt card (e.g., `TrendingUp`, `Snowflake`, `Dumbbell`)
- Add a subtle gradient left-border on each card for visual anchoring
- Pass the actual prompt text to `/chat?prefill=` so tapping pre-fills the message

---

## 6. Bottom Nav — Premium Micro-interactions

**Fix in `src/components/app/BottomNav.tsx`**:
- Add a subtle scale-up animation on the active icon (`scale-110`)
- Add a 2px colored dot indicator below the active tab instead of just color change
- Add `safe-area-inset-bottom` padding for notched devices
- Use `backdrop-blur-lg` on the nav bar for depth

---

## 7. Global Scroll & Motion Refinements

**Fix in `src/pages/Dashboard.tsx`**:
- Replace individual `motion.div` with staggered children using `staggerChildren: 0.08`
- Add `will-change: transform` to scrollable containers for GPU acceleration
- Ensure all horizontal scrolls use `-webkit-overflow-scrolling: touch` and `scrollbar-none`

---

## Files Modified
- `src/components/app/BottomNav.tsx` — 5th tab + glassmorphic bar + micro-interactions
- `src/pages/Dashboard.tsx` — All section redesigns (formula card, shop, outfits, chat prompts)

## No New Dependencies Required
All changes use existing Framer Motion, Tailwind, and Lucide icons.

