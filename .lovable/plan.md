

# Outfit Flat-Lay Breakdown — Full Implementation Plan

## Overview

Build a premium "Flat-Lay Breakdown" feature that takes an outfit photo (person wearing clothes) and uses AI to:
1. **Generate a flat-lay image** — separates each clothing item and renders them laid out on a clean background, magazine-style (matching the reference photos)
2. **Identify each item** — returns structured data (name, category, color, estimated brand/style)
3. **Display in a luxurious split-view UI** — original photo vs flat-lay breakdown with item cards

---

## 1. New Edge Function: `outfit-flat-lay`

**File**: `supabase/functions/outfit-flat-lay/index.ts`

- Accepts `{ imageUrl: string }`
- **Two AI calls** via Lovable AI gateway:
  - **Image generation** (`google/gemini-3-pro-image-preview`): Prompt sends the outfit photo and asks for a flat-lay recreation — each garment/accessory separated and arranged artfully on a cream linen background, styled like fashion editorial flat-lay photography
  - **Item extraction** (`google/gemini-2.5-flash`): Analyzes the same image to return a structured JSON array of detected items with `name`, `category`, `color`, `style`, and `confidence`
- Returns `{ flatLayImage: string (base64), items: [{name, category, color, style, confidence}] }`

---

## 2. UI: New "Flat-Lay" Tab in OutfitAnalysis Page

**File**: `src/pages/OutfitAnalysis.tsx`

Add a 4th tab "Flat-Lay" alongside Analyze / History / Compare:

- **Trigger**: User uploads a photo (reuses existing upload), then taps a premium "Generate Flat-Lay" button with Sparkles icon
- **Loading state**: Skeleton shimmer with "Separating garments..." animated text
- **Result display**:
  - **Split view**: Original photo (left) ↔ AI flat-lay image (right), swipeable on mobile
  - **Item cards grid**: Below the images — each detected item as a card with color swatch dot, category badge, and item name
  - **Actions**: Save flat-lay to storage, download as image, share to feed
- Gold accent styling consistent with AURELIA premium aesthetic

---

## 3. Integration with Outfit Generator

**File**: `src/pages/Outfits.tsx`

- Add a "Flat-Lay View" button on each generated outfit card (alongside Heart, Calendar, Share)
- When tapped: composes matched closet item images into a CSS grid flat-lay layout (no AI call needed since items already have photos in closet)
- Opens in a dialog with the arranged items on a styled background

---

## Files Summary

| Action | File |
|--------|------|
| Create | `supabase/functions/outfit-flat-lay/index.ts` |
| Modify | `src/pages/OutfitAnalysis.tsx` — add Flat-Lay tab + UI |
| Modify | `src/pages/Outfits.tsx` — add flat-lay view button on outfit cards |

