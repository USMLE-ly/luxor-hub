/**
 * Image-to-GLB Converter — maps a 2D image onto a 3D clothing primitive.
 *
 * Takes a JPG/PNG image file and category, generates a textured 3D mesh
 * exported as a GLB blob URL. The resulting shape is a recognizable garment
 * form (not just a flat plane) with the user's image as the fabric texture.
 *
 * Limitations: This produces a texture-mapped primitive, not a true 3D scan.
 * For realistic folds and draping, use external AI models (CAPE, cloth2tex)
 * to generate a proper .glb and upload it manually.
 */
import * as THREE from "three";

/** Geometry dimensions per category (width × height × depth in meters) */
const CATEGORY_GEOMETRY: Record<string, { width: number; height: number; depth: number }> = {
  top:      { width: 0.38, height: 0.45, depth: 0.14 },
  bottom:   { width: 0.30, height: 0.55, depth: 0.13 },
  accessory:{ width: 0.12, height: 0.12, depth: 0.12 },
  shoes:    { width: 0.10, height: 0.08, depth: 0.20 },
};

/**
 * Load an image File into a THREE.Texture.
 */
function loadTextureFromFile(file: File): Promise<{ texture: THREE.Texture; url: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const loader = new THREE.TextureLoader();
    loader.load(
      url,
      (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.colorSpace = THREE.SRGBColorSpace;
        resolve({ texture, url });
      },
      undefined,
      (err) => {
        URL.revokeObjectURL(url);
        reject(err);
      }
    );
  });
}

/**
 * Apply subtle sine-wave vertex displacement to simulate fabric folds.
 */
function applyFabricFolds(geometry: THREE.BufferGeometry, amplitude: number = 0.008) {
  const positions = geometry.attributes.position;
  if (!positions) return;

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);

    // Only displace the front face (z > 0) to simulate draping
    if (z > 0) {
      const foldX = Math.sin(x * 12 + y * 8) * amplitude;
      const foldY = Math.sin(y * 10 + x * 6) * amplitude * 0.5;
      positions.setZ(i, z + foldX + foldY);
    }
  }
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
}

/**
 * Generate a 3D clothing GLB from a 2D image.
 *
 * @param file - The image file (JPG/PNG)
 * @param category - One of 'top', 'bottom', 'accessory'
 * @returns A blob: URL pointing to the generated .glb
 */
export async function generateClothingFromImage(
  file: File,
  category: string
): Promise<string> {
  const { GLTFExporter } = await import("three/examples/jsm/exporters/GLTFExporter.js");

  // 1. Load the image as a texture
  const { texture, url: textureUrl } = await loadTextureFromFile(file);

  // 2. Get category-appropriate dimensions
  const dims = CATEGORY_GEOMETRY[category] || CATEGORY_GEOMETRY.top;

  // 3. Create the 3D geometry — a box with slight thickness for fabric feel
  const geometry = new THREE.BoxGeometry(dims.width, dims.height, dims.depth, 4, 4, 1);

  // 4. Apply fabric fold displacement to the front vertices
  applyFabricFolds(geometry, 0.006);

  // 5. Create PBR material with the image as texture
  const material = new THREE.MeshPhysicalMaterial({
    map: texture,
    roughness: 0.7,
    metalness: 0.0,
    clearcoat: 0.1,
    clearcoatRoughness: 0.4,
    sheen: 0.3,
    sheenColor: new THREE.Color("#ffffff"),
    side: THREE.DoubleSide,
  });

  // 6. Build the scene
  const scene = new THREE.Scene();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "imageClothing";
  scene.add(mesh);

  // 7. Export to GLB
  const exporter = new GLTFExporter();
  const glbBlob = await new Promise<Blob>((resolve, reject) => {
    exporter.parse(
      scene,
      (result) => {
        const blob = new Blob([result as ArrayBuffer], {
          type: "model/gltf-binary",
        });
        resolve(blob);
      },
      (error) => reject(error),
      { binary: true }
    );
  });

  // 8. Clean up — revoke texture URL and dispose resources
  URL.revokeObjectURL(textureUrl);
  geometry.dispose();
  material.dispose();
  texture.dispose();

  // 9. Return as blob URL
  return URL.createObjectURL(glbBlob);
}
