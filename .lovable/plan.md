

# Fix Item Photo Backgrounds & Upgrade Selected Date Panel

## Problem
1. **White photo backgrounds visible**: Item photos have white backgrounds that show as ugly white rectangles on the dark theme. The reference images show clean cutout-style items floating seamlessly.
2. **Selected date panel thumbnails**: Don't resolve string item names via `closetMap` (same bug as the grid cells had), and the card layout is basic.

## Changes — `src/pages/OutfitCalendar.tsx`

### 1. Remove white backgrounds from day cell item photos (lines 588-609)
- Add `bg-white rounded-md` to each item image container and apply `mix-blend-mode: multiply` — this makes the white photo background disappear into the white container, then the container blends into the dark cell
- Actually simpler: wrap the flat-lay stack in a `bg-white/90 rounded-lg` container so the multiply blend mode works cleanly (white × white = white, dark clothing stays dark), matching the Stylebook reference where items float on a light surface

### 2. Fix selected date panel thumbnail resolution (lines 733-778)
- Same as the grid fix: resolve string item names through `closetMap` to get photo URLs
- Currently it only checks `item?.photo_url` on string values, which returns nothing

### 3. Upgrade selected date panel card design (lines 682-780)
- Replace the simple `Shirt` icon placeholder with a **mini flat-lay preview** showing actual item photos (resolved from closetMap)
- Use a glassmorphic card with subtle gold-gradient left border accent
- Item thumbnails: larger (`w-16 h-16`), `bg-white rounded-lg` with `mix-blend-mode: multiply`, horizontal scroll strip
- Add mannequin image as a bigger hero preview if available
- Occasion badge gets a gold-tinted pill style

### 4. Day cell flat-lay container styling
- Change `bg-secondary/20` to `bg-white/95 dark:bg-white/90` so multiply blend works
- This gives the "items floating on a clean surface" look from the reference
- Add `rounded-lg overflow-hidden` for clean edges

### Technical summary
- Lines ~588-609: wrap item images in white container, add `mixBlendMode: "multiply"` to images
- Lines ~733-778: resolve string names via closetMap, apply same white-bg + multiply treatment
- Lines ~691-696: replace Shirt icon with mini photo preview from resolved items
- All changes in one file only

