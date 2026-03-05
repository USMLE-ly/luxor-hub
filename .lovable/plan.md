

## Enhanced 3D Garment Fitting System

This is a large, multi-faceted enhancement to the existing mannequin clothing system. The current system already has solid foundations: LatheGeometry-based garment shells, fabric materials with wrinkle normal maps, category-based subtype resolution, and fit variants. The request asks for improvements across 15 areas. I will scope this into practical, high-impact changes.

### What Already Works
- Category-based garment geometry (tops, bottoms, skirts, dresses, outerwear, shoes, hats)
- Fabric material system with 9 presets + wrinkle normal maps
- Fit variants (slim/regular/oversized)
- Body DNA sliders affecting mannequin proportions
- Pose presets (neutral, fashion, walking)
- Tracing mode, measurements overlay
- Outfit saving/loading/favorites

### Implementation Plan

#### 1. Garment Layer & Replacement System (`Mannequin3D.tsx`)
- Add a `LAYER_ORDER` map: `{ underwear: 0, tops: 1, sweater: 2, outerwear: 3, bottoms: 4, skirts: 4, dress: 5, shoes: 6, hat: 7, accessory: 8 }`
- Sort `garmentData` by layer order before rendering, applying small radial offsets per layer (e.g., outerwear shell is 1.06x the top shell) to prevent z-fighting
- Implement **same-category replacement**: when adding a garment, check if one in the same slot already exists and replace it. Dresses replace tops+bottoms. Tops don't replace outerwear.

#### 2. Improved Garment Positioning & Scaling (`GarmentGeometry.ts`, `Mannequin3D.tsx`)
- Refine anchor positions: pass `dna` values into garment position calculations so garments track body morphs
- Fix sleeve attachment to follow arm pose rotations (currently static)
- Add body-relative offsets: shirts offset +0.005 from torso, jackets +0.01, ensuring no mesh intersection
- Pants waistband position tied to `dna.waist` value
- Shoes snap to foot positions using `legScale` and `hipScale`

#### 3. Garment Entry Animation (`Mannequin3D.tsx`)
- Wrap each garment group in an animated `<group>` using `useFrame` or spring-based animation
- On mount: fade opacity 0→1 over 0.4s + slight Y-translate (shirt drops onto torso, pants rise from feet)
- Add a subtle auto-rotate (±15deg over 1.5s) when a new garment is added

#### 4. Per-Item Remove Buttons & Worn Items UI (`Closet.tsx`)
- Below the 3D canvas, show a "Currently Wearing" list with item name, category icon, and an (×) remove button
- Clicking remove filters that item from `mannequinClothing` state
- Each item card shows category color dot

#### 5. Enhanced Lighting & Shadows (`Mannequin3D.tsx`)
- Replace current lighting with: `ambientLight(0.4)` + `directionalLight(0.8, castShadow)` + `spotLight` from above
- Enable `receiveShadow` on the stand, `castShadow` on body and clothing meshes
- Add `<ContactShadows>` from drei for soft ground shadows
- Subtle `envMap` using drei's `Environment` preset for realistic reflections on leather/silk

#### 6. Idle Rotation (`Mannequin3D.tsx`)
- Add optional `autoRotate` prop; use `useFrame` to gently oscillate the root group ±10deg on Y axis

#### 7. Outfit State Memory (`Closet.tsx`)
- Persist `mannequinClothing` to `localStorage` keyed by user ID
- On page mount, restore from localStorage before any fetch

#### 8. Alignment Auto-Correction (`Mannequin3D.tsx`)
- Ensure all garment meshes are centered (geometry.center() after creation)
- Validate rotation is identity for standard garments

### Files to Modify
1. **`src/components/app/Mannequin3D.tsx`** -- Layer system, positioning fixes, animations, lighting, idle rotation, shadows
2. **`src/components/app/GarmentGeometry.ts`** -- Body-relative offset constants, geometry centering
3. **`src/pages/Closet.tsx`** -- Replacement logic, worn items UI with remove buttons, localStorage persistence, entry animation trigger

### Technical Notes
- Using `@react-three/drei` ContactShadows and Environment for visual quality (already installed)
- Garment animations via `useFrame` interpolation rather than adding framer-motion inside R3F canvas
- Layer offsets are multiplicative on the garment radii (1.0 base, +0.005 per layer) to avoid z-fighting without visible gaps
- Same-category replacement uses a slot-based map to determine conflicts

