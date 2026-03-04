

## Understanding Your Request

You've shared a detailed specification for implementing realistic 3D clothing rendering on the mannequin system. This is a significant feature request that involves making clothes look realistic with proper draping, textures, wrinkles, and fit behavior.

## Current State

The existing mannequin system uses **primitive Three.js geometries** (capsules, boxes, spheres) with flat color materials for clothing overlays. There is no fabric simulation, no texture mapping, no wrinkle/crease rendering, and no realistic fit behavior. The clothing is essentially colored geometric shapes placed on the body.

## What's Feasible vs. What's Not

This project runs in a **browser-based React + Three.js** environment. The script you've shared describes professional 3D clothing rendering at a level typically achieved with tools like CLO 3D, Marvelous Designer, or Blender -- dedicated 3D software with GPU cloth simulation engines.

Here's the honest breakdown:

### Not feasible in this environment
- Real-time cloth physics simulation (draping, gravity, movement response)
- Realistic fabric wrinkles/creases that adapt to poses
- Material-accurate fabric rendering (weave patterns, stretch behavior)
- Automatic fitting from uploaded photos to 3D garments

### What we CAN build (meaningful improvements)
1. **Better clothing geometry** -- Replace primitive capsules/boxes with proper LatheGeometry clothing shells that follow the mannequin's body contours (shaped T-shirt torso, tapered pant legs, shoe forms)
2. **Texture mapping** -- Apply uploaded clothing photos as textures onto the garment meshes using UV mapping
3. **Category-specific garment shapes** -- Different silhouettes for slim-fit vs. wide-leg, crewneck vs. V-neck, sneakers vs. boots, etc.
4. **Color and pattern accuracy** -- Better material definitions with roughness/metalness for different fabric types (cotton matte, leather glossy, denim rough)
5. **Hat rendering** -- A head-fitting cap/hat mesh
6. **Pre-baked wrinkle normal maps** -- Subtle wrinkle effects using normal map textures (not physics-based, but visually convincing)

## Proposed Plan

### 1. Upgrade clothing geometry system
Replace the current primitive overlays in `Mannequin3D.tsx` with category-specific LatheGeometry garments:
- **Tops**: T-shirt, shirt, sweater shells with neckline variants and sleeve lengths
- **Bottoms**: Pant legs with fit variants (slim, straight, wide)
- **Shoes**: Proper foot-shaped meshes instead of boxes
- **Hats**: Hemisphere + brim geometry
- **Outerwear**: Layered torso shells with collar geometry

### 2. Add fabric material system
Create a material library mapping fabric types to Three.js material properties:
- Cotton: high roughness, zero metalness, matte
- Leather: medium roughness, slight metalness, glossy
- Denim: high roughness, textured feel
- Synthetic: low roughness, slight sheen

### 3. Photo-to-texture mapping
Allow users to apply their uploaded clothing photos as textures on garment meshes using `THREE.TextureLoader` and UV coordinates.

### 4. Garment fit variants
Add a `fit` property to `ClothingItem` (slim, regular, oversized) that adjusts the garment geometry scale relative to the body DNA.

### Technical Details

Files to modify:
- `src/components/app/Mannequin3D.tsx` -- New garment geometry functions, material system, texture loading
- `src/pages/MannequinView.tsx` -- UI for selecting fit/fabric type when adding items

New files:
- `src/components/app/GarmentGeometry.ts` -- Garment shape definitions per category/fit
- `src/components/app/FabricMaterials.ts` -- Material presets for different fabric types

This is a large feature. I recommend implementing it in phases, starting with improved geometry and materials, then adding texture mapping.

