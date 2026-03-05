

## Plan: Googolplex-Level Mannequin Clothing System + Hero Restoration

This plan addresses four major areas: fixing the item-to-mannequin flow, adding skirt/dress geometries, adding wrinkle normal maps, adding an outfit scheduling section below the mannequin, and restoring the hero to its previous quality level.

---

### 1. Fix "Can't Add Items to Mannequin"

**Root cause**: The closet panel works correctly in code — items fetch from `clothing_items`, clicking opens the fit/fabric selector, and "Add to Mannequin" calls `confirmAddItem`. The issue is likely that the user has no items in their closet (the empty state shows "No items in your closet yet"), OR the `category` values in the DB (e.g., "tops", "dresses") don't map to valid garment subtypes, causing `resolveSubtype` to fall through to `generic-top` for everything including dresses and skirts.

**Fix**:
- Add "dress" and "skirt" to the `resolveSubtype` function in `GarmentGeometry.ts` so they map to new dress/skirt subtypes instead of falling through
- Add `isDressCat` and `isSkirtCat` detection in `Mannequin3D.tsx` to render dress/skirt geometries
- Add a "Quick Add" section below the 3D scene that lets users add demo items (Top, Bottom, Dress, Shoes) without needing closet items — this ensures the mannequin is always testable

---

### 2. Add Skirt and Dress Geometry Types

New subtypes in `GarmentGeometry.ts`:
- `skirt-mini`, `skirt-midi`, `skirt-maxi`, `skirt-pencil`, `skirt-aline`
- `dress-mini`, `dress-midi`, `dress-maxi`

**Skirt geometry**: `createSkirtGeometry()` — LatheGeometry bells starting at waist height, varying in flare (pencil = tight taper, A-line = wide flare) and length (mini stops at mid-thigh, maxi extends to ankles).

**Dress geometry**: `createDressGeometry()` — Combined torso shell + skirt continuation as a single LatheGeometry profile. The top portion follows shoulder/chest/waist contours, then flares into the skirt section below the waist.

Update `resolveSubtype` to detect "dress", "skirt" categories and map to appropriate subtypes based on name keywords.

---

### 3. Add Wrinkle Normal Maps (Procedural)

In `FabricMaterials.ts`:
- Create `generateWrinkleNormalMap()` using an offscreen canvas (256x256)
- Draw sine-wave displacement patterns at configurable frequency/amplitude to simulate fabric creases
- Different patterns per zone: horizontal waves for waist area, diagonal for elbows, vertical for knee area
- Return as `THREE.CanvasTexture` applied as `normalMap` with low intensity (0.15-0.3)
- Integrate into `createFabricMaterial` — automatically attach wrinkle normal map based on fabric type (cotton/wool get more wrinkles, leather/silk get fewer)

---

### 4. Outfit Action Section Below Mannequin

Add a "Dress & Schedule" section between the 3D scene and the clothing strip in `MannequinView.tsx`:
- **Quick-add buttons**: Row of category buttons (Top, Bottom, Dress, Skirt, Shoes, Hat) that open the closet panel pre-filtered to that category, OR add a demo item directly
- **"Schedule This Outfit" button**: Prominent gold CTA that opens the calendar modal (currently only accessible from the tiny header icon)
- **Outfit summary**: Show currently worn items with thumbnails and names

---

### 5. Restore Hero Quality

The current hero is a text-only section with typewriter effect. The user wants it restored to the previous high-impact level. Based on the memory notes, the hero uses ScrollExpandMedia expansion pattern.

**Restore**:
- Re-add the aurora/nebula glow effects (gold and purple radial gradients) behind the text
- Add floating geometric shapes using the `ElegantShape` component from `shape-landing-hero.tsx` adapted with gold/primary brand colors
- Add a subtle parallax floating animation layer behind the CTA area
- Ensure the gold-shimmer text animation is applied to the headline

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/app/GarmentGeometry.ts` | Add skirt/dress subtypes, `createSkirtGeometry()`, `createDressGeometry()`, update `resolveSubtype` |
| `src/components/app/FabricMaterials.ts` | Add `generateWrinkleNormalMap()`, integrate into `createFabricMaterial` |
| `src/components/app/Mannequin3D.tsx` | Add `isSkirtCat`, `isDressCat` detection, render skirt/dress geometries, apply wrinkle normals |
| `src/pages/MannequinView.tsx` | Add quick-add section, schedule CTA, outfit summary below 3D scene |
| `src/components/landing/Hero.tsx` | Add aurora glow effects, floating geometric shapes, gold-shimmer headline |

