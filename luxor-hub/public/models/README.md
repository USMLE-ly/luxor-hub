# LUXOR 3D Models

## Mannequin Models

Place your mannequin GLB files here:

- `mannequin_m.glb` — Male mannequin (faceless dome head, mechanical joints)
- `mannequin_f.glb` — Female mannequin (faceless dome head, mechanical joints)

### Requirements

- **Bone naming:** Must contain a bone named `Hips`, `mixamorig:Hips`, `root`, or `pelvis` (case-insensitive). The viewer resolves this automatically.
- **Format:** Binary GLTF (`.glb`) with embedded textures.
- **Scale:** Models are loaded at their native scale. Adjust in Spline/Blender if needed.

## Clothing Models

Place clothing GLB files in `public/models/clothing/` for permanent catalog items.

### Rigged Clothing (recommended)

If your clothing GLB is rigged to the same skeleton as the mannequin (e.g., Mixamo rig), the viewer will automatically reassign the skeleton for proper skin deformation.

### Unrigged Clothing (auto-fit)

If your clothing is unrigged or uses a different skeleton, the viewer applies **Box3 centering**:

1. Calculates the bounding box of the clothing mesh
2. Centers X/Z to the mannequin's hips pivot
3. Levels Y so the clothing sits at the correct height

This means you don't need perfect pivot points when exporting clothes — the system handles alignment automatically.

## Session-Only Uploads

Clothing uploaded via the UI (file picker) creates a blob URL that exists only for the current browser session. To make uploads permanent, copy the `.glb` files into `public/models/clothing/`.
