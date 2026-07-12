# 3D Clothing Models

Place `.glb` files in this directory to use them as 3D clothing on the mannequin.

## Requirements
- Format: `.glb` (binary GLTF)
- Should contain a mesh with reasonable geometry (box, cylinder, or custom)
- For skinned clothing: must share bone names with the mannequin (Hips, Spine, etc.)
- For static clothing: the Box3 auto-centering will fit it to the mannequin automatically

## Supported Categories
- `top` — T-shirts, shirts, jackets
- `bottom` — Pants, shorts, skirts  
- `accessory` — Hats, bags, jewelry

## Auto-Detection
The system automatically detects clothing by file name and maps it to the correct body position.
