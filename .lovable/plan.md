

# Upgrade Outfit Calendar: Full Closet Picker, Drag Reorder, Mini Preview

## Overview
Three enhancements to the Add/Edit dialog and selected date panel in `src/pages/OutfitCalendar.tsx`.

---

## 1. Organize closet items by proper categories (matching Closet page)

Replace the current flat `clothingCategories` array with the same `categoryMap` used in the Closet page:

```
"Upper Body" → ["top", "outerwear"]
"Lower Body" → ["bottom"]
"Shoes" → ["shoes"]
"Accessories" → ["accessory"]
"Dresses" → ["dress"]
"Other" → ["other"]
```

Update both the Add and Edit dialog pickers to iterate over this map, showing section headers matching the Closet page. Show all items per section (not just the old `tops/bottoms/shoes/outerwear/accessories/other` flat list).

## 2. Mini outfit preview thumbnail in Add/Edit dialogs

Below the clos