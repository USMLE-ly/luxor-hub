

## Plan: Professional Calibration, 3D Mannequin, Shop Similar Dashboard, and DNA Page Redesign

This is a large, multi-feature request. Here is the breakdown of what will be built and how.

---

### 1. Professional Calibration Flow

**Current issues**: Images may not all be clean front-facing product shots; no "Casual" / "Formal" label below items.

**Changes to `src/pages/Calibration.tsx`**:
- Add a `style` field ("Casual" or "Formal") to each calibration option and render it as a label beneath each product image card
- Add a "Preview on me" button that transitions to the 3D mannequin view with the selected item overlaid
- Integrate the CalendarWidget as a step or section within the calibration completion screen so users can plan outfits alongside their preferences

---

### 2. 3D Mannequin System

**New files**:
- `src/components/app/Mannequin3D.tsx` — A React Three Fiber scene rendering a stylized wooden mannequin (male or female based on user's onboarding gender selection). Built with primitive Three.js geometries (capsules, cylinders, spheres) to create a mannequin silhouette since we cannot load external GLB files without hosting them.
- `src/components/app/MannequinOutfitOverlay.tsx` — Overlay system that maps selected clothing items (from closet or calibration) onto the mannequin using positioned 2D image planes or colored mesh regions on the 3D body.
- `src/pages/MannequinView.tsx` — Full-page view for interacting with the mannequin: rotate, add/remove clothing items from closet, and save the look.

**Technical approach**:
- Use `@react-three/fiber` (already installed v8) and `three` (already installed v0.160) to render the mannequin
- Build the mannequin from Three.js primitives (CapsuleGeometry for torso/limbs, SphereGeometry for head, CylinderGeometry for neck) to approximate the wooden mannequin look from the reference images
- Apply a wood-grain MeshStandardMaterial with brown tones to match the reference
- Gender selection determines proportions (broader shoulders for male, wider hips for female)
- Clothing is represented as colored/textured mesh shells slightly offset from body parts (e.g., a shirt = slightly larger torso capsule with clothing texture)

**Calendar integration**:
- From the MannequinView, users can "Post to Calendar" — this saves the mannequin screenshot + selected clothing items to a calendar event
- Extend the `calendar_events` table with an `outfit_snapshot` JSONB column and `mannequin_image_url` text column

---

### 3. Shop Similar on Dashboard

**Changes to `src/pages/Dashboard.tsx`**:
- Add a "Shop Similar" section after the outfits carousel
- Fetch the user's most recent outfit analysis from `outfit_analyses` table
- Use the detected items to call the existing `shop-products` edge function with the user's color season
- Display 4-6 product cards in a horizontal scroll with match scores, prices, and "Shop" links

---

### 4. Style DNA Page Redesign

**Changes to `src/pages/StyleDNA.tsx`**:
- Redesign to match the reference app's DNA page structure:
  - Top section: "My Style Formula" header with summary cards (Color Type, Style Preferences, Body Type) — similar to dashboard but as the main content
  - Calibration progress bar widget
  - Color season badge with palette preview (clickable to /color-type)
  - Style archetype card with score visualization
  - AI recommendations as actionable cards
- Use `AppLayout` wrapper for consistent bottom nav instead of manually rendering `BottomNav`

---

### 5. Database Migration

New column needed on `calendar_events`:
```sql
ALTER TABLE public.calendar_events 
ADD COLUMN IF NOT EXISTS outfit_items JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS mannequin_image_url TEXT;
```

---

### Technical Details

**3D Mannequin geometry approach** (using Three.js primitives):
```text
        ○         ← SphereGeometry (head)
        |
    ┌───┼───┐     ← CapsuleGeometry (torso)  
    │   │   │
    ├───┤   │     ← CylinderGeometry (arms)
    │       │
    └───┬───┘
        │
    ┌───┴───┐     ← CapsuleGeometry (hips)
    │       │
    ├───┐   ├─    ← CylinderGeometry (legs)
    │   │   │
```

- Wood material: `MeshStandardMaterial({ color: '#8B6914', roughness: 0.7, metalness: 0.1 })`
- Clothing overlay: Semi-transparent mesh shells offset 0.02 units from body surface
- OrbitControls for rotation, limited vertical angle

**Dependencies**: No new packages needed — `@react-three/fiber` and `three` are already installed. Will need `@react-three/drei` for OrbitControls (v9.122.0 per constraints).

---

### Summary of files to create/edit

| Action | File |
|--------|------|
| Create | `src/components/app/Mannequin3D.tsx` |
| Create | `src/pages/MannequinView.tsx` |
| Edit | `src/pages/Calibration.tsx` |
| Edit | `src/pages/Dashboard.tsx` |
| Edit | `src/pages/StyleDNA.tsx` |
| Edit | `src/components/app/BottomNav.tsx` |
| Edit | `src/App.tsx` (add /mannequin route) |
| Migration | Add outfit columns to calendar_events |

