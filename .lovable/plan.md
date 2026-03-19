

# Fix: Calendar Day Cells Showing White Boxes Instead of Clothes

## Problem
The `outfit_items` in calendar events are stored as **string arrays** (e.g., `["Turbo Love Graphic T-Shirt", "Blue Carpenter Jeans"]`), not objects with photo URLs. The current code tries to access `item?.photo_url` on these strings, finds nothing, and falls through to the dot fallback. The white boxes come from `bg-[#fefdfb]` applied to event cells — they stand out against the dark theme with no actual images inside.

## Fix — `src/pages/OutfitCalendar.tsx`

1. **Fetch the user's `clothing_items`** from the database (just `name` and `photo_url` columns) alongside existing data fetches. Store in a `closetMap` — a `Map<string, string>` mapping lowercased item name → photo_url.

2. **Update the day cell rendering** (lines 546-584): Instead of treating `outfit_items` as objects, treat them as strings and look up each name in `closetMap` to get the photo URL.

3. **Only apply white background** (`bg-[#fefdfb]`) when at least one photo is actually found — otherwise keep the default cell background so there are no empty white boxes.

4. **Keep dot fallback** for items with no matching photos, but style them with the item's occasion color instead of plain primary.

### Technical Detail

```
// New state alongside existing ones
const [closetMap, setClosetMap] = useState<Map<string, string>>(new Map());

// Fetch in the existing useEffect or a new one
const { data: clothingData } = await supabase
  .from("clothing_items")
  .select("name, photo_url")
  .eq("user_id", user.id)
  .not("photo_url", "is", null);

// Build lookup map (lowercase for fuzzy matching)
const map = new Map();
clothingData?.forEach(item => map.set(item.name.toLowerCase(), item.photo_url));

// In day cell: resolve photos from string names
const allPhotos = [];
items.forEach((itemName: string) => {
  const url = closetMap.get(itemName.toLowerCase());
  if (url) allPhotos.push(url);
});
```

Cell background conditional: `${allPhotos.length > 0 ? "bg-[#fefdfb]" : ""}` instead of checking `dayEvents.length`.

