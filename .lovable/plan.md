

# Upgrade Schedule Calendar to Premium Stylebook-Quality Layout

## Current Issues (from user's screenshot)
- White `bg-[#fefdfb]` cells clash harshly against the dark luxury theme
- Item thumbnails are tiny (32×32px) and cramped
- No visual hierarchy — cells with outfits don't feel premium
- Weather icons crowd the date number row

## Changes — `src/pages/OutfitCalendar.tsx`

### 1. Fix cell background for dark theme
Replace the hard-coded `bg-[#fefdfb]` white with a subtle elevated dark surface: `bg-card/80` with a faint inner glow border, so outfit cells "pop" without the jarring white box.

### 2. Larger, better-spaced item thumbnails
- Increase item images from `w-8 h-8` to `w-10 h-12` (closer to the Stylebook reference proportions)
- Reduce overlap from `-4px` to `-2px` for breathing room
- Cap at 3 items visible + a `+N` badge if more exist
- Use `drop-shadow(0 1px 4px rgba(0,0,0,0.25))` for depth on dark bg (instead of the light-mode 0.08 opacity)

### 3. Mannequin images fill the cell better
- Increase `max-h-[68px]` → `max-h-[80px]` for mannequin images so they dominate the cell like in the reference

### 4. Refined cell styling
- Add a subtle inner rounded container (`rounded-lg bg-secondary/20 p-0.5`) inside cells with outfits, giving a "card within grid" feel matching the premium Stylebook aesthetic
- Weather icon: make smaller (`w-3 h-3`) and more transparent to not compete with outfit visuals
- Today badge: keep gold circle but ensure it sits above the flat-lay

### 5. Cell min-height bump
- `min-h-[100px]` → `min-h-[110px]` to give more vertical room for the flat-lay composition

### No other files change — purely visual refinement to the calendar grid cells.

