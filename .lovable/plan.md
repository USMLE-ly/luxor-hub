

## Plan: Match Reference App Design, Fix Analyze-Item Bug, Add Mannequin Measurements

This addresses the core issues: the analyze-item blob URL crash, bottom nav alignment with the reference, and upgrading key pages to match the Style DNA reference screenshots.

---

### 1. Fix analyze-item Edge Function (Critical Bug)

**Root cause**: The client sends a `blob:` URL from `URL.createObjectURL()` to the edge function. The AI gateway cannot access blob URLs — they're local to the browser. Error: `"Invalid URL format: blob:https://..."`.

**Fix in `src/pages/Closet.tsx`**: Convert the selected file to a base64 data URL before sending it to the edge function, instead of sending the blob URL.

```typescript
// Instead of: body: JSON.stringify({ imageUrl: previewUrl, ... })
// Convert file to base64 first:
const reader = new FileReader();
reader.readAsDataURL(selectedFile);
const base64 = await new Promise(resolve => { reader.onload = () => resolve(reader.result); });
body: JSON.stringify({ imageUrl: base64, itemName: newItem.name })
```

Also fix `src/pages/OutfitAnalysis.tsx` if it has the same blob URL issue.

---

### 2. Restore Bottom Nav to Match Reference

The reference shows: **DNA, My Shop, AI Stylist, Closet**. Our current nav has "Analysis" instead of "My Shop".

**Fix `src/components/app/BottomNav.tsx`**: Change the Analysis tab back to "My Shop" pointing to `/inspiration`. Keep outfit analysis accessible from the dashboard/DNA page instead.

---

### 3. Upgrade Dashboard to Match Reference

The reference DNA page shows:
- "My Style Formula" card with decorative egg image and calibration progress bar (orange-to-pink gradient, 53%, gift icon)
- "All My Outfits" horizontal scroll with occasion-tagged outfit cards (Party, Work, Everyday) with "View items →" and "✨ Try it on" buttons
- "Chat with AI Stylist" prompt cards
- "Shop My Style Formula" product grid with category pills

**Changes to `src/pages/Dashboard.tsx`**:
- Keep existing structure but polish to match reference styling more closely
- Add outfit analysis button as a card within the dashboard instead of bottom nav

---

### 4. Upgrade My Shop / Inspiration Page

The reference "My Shop" page shows:
- "Check if item is a Match" scanner card with CTA
- "Browse Matches online" with brand logo circles (Amazon, Zara, H&M, etc.)
- "Shop My Style Formula" section with store logos and category pills
- Product grid with heart buttons, prices, and brand names

**Changes to `src/pages/Inspiration.tsx`**:
- Add "Check Item" scanner card at top (links to outfit-analysis)
- Add "Browse Matches online" brand row with circular logos
- Add "Stores" row with brand circles
- Keep existing product grid but add crossed-out original prices (sale styling)

---

### 5. Upgrade Closet Page

The reference closet shows:
- "My Closet" header with item counter ("0 / 7 ITEMS UPLOADED")
- "ADD ITEM →" dark CTA button
- Progress bars for Tops (0/4) and Bottoms (0/3)
- "My Closet Outfits" with occasion tabs (Everyday, Weekend, Work, Party) with colored icons
- Outfit preview cards with hanger placeholder
- Category sections (Upper Body, Lower Body, Shoes, Accessories) with subcategory pill filters
- Each section has "New Item" card, existing items, and "Upload your own items" placeholder

**Changes to `src/pages/Closet.tsx`**:
- Add item upload progress tracker at top
- Add "My Closet Outfits" section with occasion tabs
- Add "Upload your own items" placeholder cards in each category grid
- Add subcategory filter pills per section (Upper Body: Jackets, Tops, Dresses, Coats, Blouses, Jumpsuits)

---

### 6. Add Mannequin Measurement Overlays

**Changes to `src/components/app/Mannequin3D.tsx`**:
- Add optional `showMeasurements` prop
- Render HTML overlay lines using CSS positioned elements showing:
  - Shoulder width line with label
  - Waist line with label
  - Hip line with label
  - Inseam line with label
- Lines scale based on Body DNA slider values
- Toggle via a "Measurements" button in the MannequinView toolbar

**Changes to `src/pages/MannequinView.tsx`**:
- Add "Measurements" toggle to the bottom toolbar
- Pass `showMeasurements` prop to Mannequin3D

---

### Summary of Changes

| Action | File | Description |
|--------|------|-------------|
| Edit | `src/pages/Closet.tsx` | Fix blob URL → base64 conversion, add reference-matching UI |
| Edit | `supabase/functions/analyze-item/index.ts` | No change needed (client-side fix) |
| Edit | `src/components/app/BottomNav.tsx` | Restore "My Shop" tab |
| Edit | `src/pages/Dashboard.tsx` | Add outfit analysis card, polish to match reference |
| Edit | `src/pages/Inspiration.tsx` | Add scanner card, brand logos, store section |
| Edit | `src/components/app/Mannequin3D.tsx` | Add measurement overlay lines |
| Edit | `src/pages/MannequinView.tsx` | Add measurements toggle |
| Edit | `src/pages/OutfitAnalysis.tsx` | Fix blob URL if applicable |

