

# Plan: Stylebook-Style Visual Calendar with Outfit Pictures in Day Cells

## What Changes

**File: `src/pages/OutfitCalendar.tsx`** — Lines 518-601 (the day cell rendering)

The current day cells are `min-h-[76px]` with tiny 16×20px thumbnails stacked vertically. The reference images show each day cell as a taller cell where clothing items are arranged as a styled flat-lay composition filling most of the cell space.

### Changes to the day cell:

1. **Increase cell height**: Change `min-h-[76px]` → `min-h-[100px]` to give more room for outfit visuals
2. **Replace tiny thumbnail stack with a proper flat-lay composition**:
   - If mannequin image exists: show it as a nearly-full-cell image (centered, ~80% of cell height)
   - If individual item photos exist: arrange them in a **vertical flat-lay stack** — top garment at top, bottoms in middle, shoes at bottom — each item sized ~28×32px with `object-contain`, `mix-blend-mode: multiply`, on a white/cream micro-background, overlapping slightly for the editorial look from the reference images
   - Items positioned with slight negative margins to create the "styled on a surface" look
3. **Move the date number**: Keep it small in the top-left corner, weather icon top-right (same as now)
4. **Remove text fallback prominence**: Text labels become a tiny dot indicator instead of a colored pill, since the visual emphasis is on pictures
5. **White/light cell background** for cells with outfits to make the `mix-blend-mode: multiply` work like the reference (items float on white)

### Visual Details (matching reference):
- Each item photo uses `object-fit: contain` so garment shape is preserved
- Items stack vertically: top → bottom → shoes → accessories
- Slight overlap between items (negative margin -4px) for compact editorial feel
- Cell background stays white/neutral for the multiply blend to work cleanly

### No other files change — this is purely a visual layout update to the calendar grid cells.

