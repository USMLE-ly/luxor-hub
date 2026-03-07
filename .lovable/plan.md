

# AI Style Enhancement Suite -- Implementation Plan

All 8 features, organized into 4 implementation batches to keep changes manageable.

---

## Batch 1: Item Compatibility Checker + Style Formula Dashboard

### Item Compatibility Checker
- **`src/pages/Chat.tsx`**: Add image upload button (camera icon) next to the text input. Convert uploaded image to base64, send alongside messages to the edge function. Add a quick prompt: "📸 Check if this item matches me".
- **`supabase/functions/ai-chat/index.ts`**: Accept optional `image` field in the request body. When present, construct a multimodal message with the image + system prompt instructing AURELIA to evaluate the item against the user's color season, body type, style archetype, and existing closet. Return a compatibility verdict with percentage score and reasoning.
- **`src/pages/Inspiration.tsx`**: Add a "Check Compatibility" action on each product card that navigates to `/chat` with pre-filled context about that product.

### Style Formula Dashboard
- **`src/pages/StyleDNA.tsx`**: Add three new expandable sections below the existing hero card:
  - **Recommended Prints & Fabrics**: AI-generated list of patterns, textures, materials suited to their archetype
  - **Flattering Silhouettes**: Specific garment cuts, necklines, skirt lengths with icons
  - **Complete Color Palette**: Enhanced view with "best for" labels on each swatch (e.g., "great for tops", "accent only")
- **`supabase/functions/analyze-style-dna/index.ts`**: Extend the tool call schema to include `recommendedPrints`, `recommendedFabrics`, `flatteringSilhouettes` arrays. Store in existing `preferences` JSONB field.
- **DB Migration**: Add `style_formula` JSONB column to `style_profiles` to cache the expanded formula separately.

---

## Batch 2: Wardrobe Gap Analysis + Shopping Match Score

### Wardrobe Gap Analysis
- **New edge function `supabase/functions/wardrobe-gap/index.ts`**: Accepts the user's closet items list + style profile. Uses Gemini to analyze completeness across categories (basics, statement pieces, occasion wear, seasonal gaps) and returns a prioritized list of missing items with category, description, priority (high/medium/low), and estimated price range.
- **`src/pages/Analytics.tsx`**: Add a "Wardrobe Gaps" section with a "Run AI Analysis" button. Display results as cards with missing item type, why it matters, and a "Shop This" CTA linking to Inspiration with pre-filtered category.

### Shopping Match Score
- **`supabase/functions/shop-products/index.ts`**: Replace the random score logic. Accept user's `colorSeason`, `bodyShape`, `archetype`, and `closetCategories` as query params. Calculate a deterministic match score based on: color compatibility with season (40%), style archetype fit (30%), wardrobe gap fill potential (30%).
- **`src/pages/Inspiration.tsx`**: Color-code the match score badge (green >85%, gold 70-85%, gray <70%). Add a "Sort by Match" toggle button. Pass user profile data when fetching products.

---

## Batch 3: Outfit Calendar Planner + Wear History Timeline

### Outfit Calendar Planner
- **New page `src/pages/OutfitCalendar.tsx`**: Month view calendar using existing `calendar_events` table. Each day cell shows outfit thumbnail or "+" to add. Tapping a day opens a sheet to select from saved outfits or type a quick description. Week/month toggle. Weather indicator per day (uses existing `get-weather` function).
- **`src/App.tsx`**: Add route `/outfit-calendar`.
- **`src/components/app/AppSidebar.tsx`**: Add "Outfit Calendar" nav item with `CalendarDays` icon.
- **`src/components/app/BottomNav.tsx`**: No change (keep 4 tabs compact).

### Wear History Timeline
- **`src/pages/Analytics.tsx`**: Add a "Wear History" tab/section. Vertical timeline showing date, item name, category badge, and occasion. Data from `wear_logs` joined with `clothing_items`. Group by week/month with collapsible sections.
- **`src/pages/Closet.tsx`**: Make the existing "Log Wear" action more prominent -- add a date picker so users can log past wears, not just today.

---

## Batch 4: Color Palette from Photo + Visual Mood Board

### Color Palette from Photo
- **New edge function `supabase/functions/extract-palette/index.ts`**: Accepts a base64 image. Uses Gemini Vision to extract 6-8 dominant colors with hex values and names. Cross-references against the user's color season palette to mark each as "Match" or "Avoid".
- **`src/pages/ColorType.tsx`**: Add an "Extract from Photo" section with upload area. Display extracted colors as swatches with match/avoid indicators and a summary like "5 of 7 colors match your season".

### Visual Mood Board Builder
- **DB Migration**: Create `mood_boards` (id, user_id, name, created_at) and `mood_board_items` (id, board_id, type enum [image/color/text/link], content JSONB, position_x float, position_y float, width float, height float) tables with RLS policies scoped to `auth.uid() = user_id`.
- **New page `src/pages/MoodBoard.tsx`**: Free-form canvas editor. Users can add images (upload/URL), color swatches (pick from palette or custom hex), text notes, and website links. Items are draggable and resizable. Multiple boards with a board selector sidebar. Save/load via the database.
- **`src/App.tsx`**: Add route `/mood-board`.
- **`src/components/app/AppSidebar.tsx`**: Add "Mood Board" nav item with `LayoutGrid` icon.

---

## Database Migrations Summary
1. Add `style_formula JSONB DEFAULT '{}'` to `style_profiles`
2. Create `mood_boards` table + RLS
3. Create `mood_board_items` table + RLS

## New Edge Functions
1. `wardrobe-gap/index.ts` -- AI closet gap analysis
2. `extract-palette/index.ts` -- Color extraction from photos

## New Pages
1. `/outfit-calendar` -- Calendar planner
2. `/mood-board` -- Visual mood board builder

## Modified Files
- `src/pages/Chat.tsx` -- Image upload for compatibility checking
- `src/pages/StyleDNA.tsx` -- Expanded style formula sections
- `src/pages/Analytics.tsx` -- Gap analysis + wear history
- `src/pages/Inspiration.tsx` -- Match score coloring + sort + compatibility CTA
- `src/pages/ColorType.tsx` -- Photo palette extraction
- `src/pages/Closet.tsx` -- Enhanced wear logging
- `src/components/app/AppSidebar.tsx` -- New nav items
- `supabase/functions/ai-chat/index.ts` -- Multimodal image support
- `supabase/functions/analyze-style-dna/index.ts` -- Extended formula output
- `supabase/functions/shop-products/index.ts` -- Deterministic match scoring

