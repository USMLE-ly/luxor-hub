

# Next Feature Sprint: Weather-Smart Dashboard + Closet Value Intelligence

The B&W overhaul and tier restrictions are fully shipped. Here are the two highest-impact features to build next.

---

## Feature 1: Weather-Smart Outfit on Dashboard

The `get-weather` edge function and `useUserLocation` hook exist but the Dashboard doesn't use them. The outfit generator mentions "weather-checked" but doesn't actually factor it in visually.

### What changes

**Dashboard (`src/pages/Dashboard.tsx`)**:
- Add a weather widget card at the top of the dashboard grid
- Shows current temp, condition icon, and a one-line styling tip (e.g. "Layer up — 8°C and overcast")
- The existing "Morning Routine" card gets a weather context line injected
- Uses `useUserLocation` to get lat/lon, calls `get-weather` edge function

**New component: `src/components/app/WeatherOutfitCard.tsx`**:
- Compact card: weather icon + temp + condition on the left, styling tip on the right
- Styling tips are mapped from weather codes (rain → "waterproof layers", hot → "breathable fabrics", cold → "warm layers")
- Tier-gated: Free tier sees weather only, Starter+ sees the outfit tip

---

## Feature 2: Closet Value Dashboard

Cost-per-wear data already exists in Analytics and WardrobeIntelligence but there's no dedicated "wardrobe value" view. This is a high-retention feature for paid users.

### What changes

**New page: `src/pages/WardrobeValue.tsx`** (route: `/wardrobe-value`, Pro+ tier gate):
- **Summary row**: Total wardrobe value (sum of all item prices), average cost-per-wear, total items
- **Best & worst value items**: Top 5 lowest cost-per-wear vs. top 5 highest (items worn least relative to price)
- **Dead inventory alert**: Items not worn in 60+ days with price > $20, shown as a dismissible list with "Donate" or "Restyle" action buttons
- **Category breakdown**: Pie/bar showing spend by category (tops, bottoms, shoes, accessories)
- Data comes from existing `clothing_items` table (`price`, `wear_count`, `last_worn`, `category` columns)

**Sidebar (`src/components/app/AppSidebar.tsx`)**:
- Add "Wardrobe Value" nav item under the Analytics section with a `DollarSign` icon

**Route (`src/App.tsx`)**:
- Add `/wardrobe-value` route wrapped in `PaywallGate` + `TierGate` requiring "pro"

---

## Files Changed

| File | Action |
|------|--------|
| `src/components/app/WeatherOutfitCard.tsx` | Create — weather + styling tip card |
| `src/pages/Dashboard.tsx` | Modify — add WeatherOutfitCard to grid |
| `src/pages/WardrobeValue.tsx` | Create — closet value analytics page |
| `src/components/app/AppSidebar.tsx` | Modify — add Wardrobe Value nav item |
| `src/App.tsx` | Modify — add /wardrobe-value route |

No database changes. No new dependencies. Uses existing edge functions and hooks.

