

# Plan: Closet Flat-Lay View, Outfits Clean BG, Calendar Layers Button & Council Upgrade

## 1. Closet Flat-Lay View Toggle

**File: `src/pages/Closet.tsx`**

Add a `flatLayView` boolean state. Place a `Layers` toggle button next to the category filter pills (line ~647). When active:
- Replace the 3-column grid with a 2-column magazine-style layout
- Each item card: larger aspect-ratio (3:4), cream/warm background (`bg-[#faf7f2]`), `mix-blend-mode: multiply` on photos, `object-fit: contain`
- Category section dividers: elegant thin line with category name centered
- Items without photos show the standard Shirt icon placeholder

## 2. Outfits.tsx Flat-Lay Dialog — Clean Background Treatment

**File: `src/pages/Outfits.tsx`** (lines 310-358)

Update the flat-lay dialog grid items:
- Wrap each item thumbnail in a cream background div (`bg-[#faf7f2]`)
- Add `mix-blend-mode: multiply` and `object-fit: contain` to the `<img>` tags (line 335)
- Add subtle drop shadow for "floating" effect
- Slight padding around images so garments don't touch edges

## 3. Calendar Event Cards — Layers Button → Flat-Lay Dialog

**File: `src/pages/OutfitCalendar.tsx`** (lines 655-746)

Add a `Layers` icon button in each event card's action buttons (next to Edit/Delete). On tap:
- Set a new `flatLayEvent` state with the event data
- Open a Dialog/Sheet showing the outfit items in a flat-lay composition grid
- Same cream background + `mix-blend-mode: multiply` treatment
- If event has `mannequin_image_url`, show it large; otherwise show individual item thumbnails in a 2×2 or 3-col grid

New state: `flatLayEvent: CalendarEvent | null`

## 4. Council "Googolplex" Upgrade

**File: `src/pages/Council.tsx`**

Currently the Council is a 3-model deliberation chat. A "Googolplex-dollar" upgrade would add:

- **Visual Wardrobe Context Panel**: Show a collapsible sidebar/strip at the top with the user's closet summary as visual thumbnail chips (not just text), so council models see what you own
- **Outfit Visualization in Responses**: When council synthesis mentions specific items, render them as mini visual cards (photo + name) inline, matched from closet data
- **Council Memory Indicator**: Show a small badge "Memory: 12 past analyses" so users know the council remembers their history
- **Quick Action Buttons on Synthesis**: After each council response, add action buttons: "Save as Outfit", "Add to Calendar", "Share" — executing directly from the synthesis
- **Mood-Responsive UI**: When a mood is selected, tint the council header/background to match (warm tones for confident, cool for relaxed, etc.)

**File: `supabase/functions/council-chat/index.ts`**
- Add structured output parsing: when synthesis mentions closet items, return them as structured `mentionedItems[]` alongside the text
- Add `actionSuggestions[]` field to synthesis response for quick action buttons

## Files Summary

| Action | File | What |
|--------|------|------|
| Modify | `src/pages/Closet.tsx` | Flat-lay view toggle with magazine grid |
| Modify | `src/pages/Outfits.tsx` | Cream bg + mix-blend-mode on flat-lay dialog |
| Modify | `src/pages/OutfitCalendar.tsx` | Layers button on event cards + flat-lay dialog |
| Modify | `src/pages/Council.tsx` | Visual wardrobe context, inline item cards, quick actions, mood tint |
| Modify | `supabase/functions/council-chat/index.ts` | Structured mentioned items + action suggestions |

