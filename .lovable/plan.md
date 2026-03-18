

# Plan: Update `.lovable/plan.md` with Googolplex Flat-Lay Upgrade + Weather Location

Add two new sections to the roadmap between the existing P1 and P2 sections:

1. **Googolplex Flat-Lay Upgrade** — covering all 8 items (calendar visual thumbnails, background-removed display, one-tap add to closet, outfit generator clean backgrounds, remove-bg edge function, closet flat-lay view, calendar stats bar, flat-lay in calendar event cards)

2. **Location-Based Weather** — shared `useUserLocation` hook, updated `get-weather` edge function with reverse geocoding, wired into MorningRoutineCard and OutfitCalendar with city name display

### What changes in the file

**File: `.lovable/plan.md`**

Insert after line 67 (end of P1 section), before P2:

```markdown
---

## Googolplex — Flat-Lay & Visual Upgrade

### Upgrades to Existing Features

- [ ] Calendar day cells: mini flat-lay thumbnail stacks (2-3 items) replacing text labels
- [ ] Calendar selected date panel: `mix-blend-mode: multiply` for floating item display
- [ ] OutfitAnalysis flat-lay items: one-tap "Add to Closet" button per detected item
- [ ] Outfits.tsx flat-lay dialog: clean background treatment with cream/linen backdrop

### New Features

- [ ] Edge function `remove-bg`: AI background removal via Gemini for clothing photos
- [ ] Closet page: flat-lay view toggle with magazine-style grid layout
- [ ] Calendar stats bar: outfits planned, day streak, most worn category
- [ ] Calendar event cards: Layers button → flat-lay composition dialog

### Files

| Action | File |
|--------|------|
| Create | `supabase/functions/remove-bg/index.ts` |
| Modify | `src/pages/OutfitAnalysis.tsx` |
| Modify | `src/pages/OutfitCalendar.tsx` |
| Modify | `src/pages/Outfits.tsx` |
| Modify | `src/pages/Closet.tsx` |

---

## Googolplex — Location-Based Weather

- [ ] Create shared `useUserLocation` hook (geolocation + localStorage cache + IP fallback)
- [ ] Update `get-weather` edge function: accept lat/lon, reverse geocode to city name
- [ ] MorningRoutineCard: use location hook, pass real coords, display city name
- [ ] OutfitCalendar: replace inline geolocation with shared hook, show city in forecast strip
- [ ] Auto-Fill Week: AI suggestions based on actual local weather

### Files

| Action | File |
|--------|------|
| Create | `src/hooks/useUserLocation.ts` |
| Modify | `supabase/functions/get-weather/index.ts` |
| Modify | `src/components/app/MorningRoutineCard.tsx` |
| Modify | `src/pages/OutfitCalendar.tsx` |
```

No other files change. This is a plan file update only.

