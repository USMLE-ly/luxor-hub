/**
 * Image-to-GLB Converter v2 — maps a 2D image onto 3D cylindrical garment shapes.
 *
 * Improvements over v1:
 * - Procedural fabric normal map generation (simulates weave/fold depth)
 * - Better texture cloning (deep copy to prevent shared corruption)
 * - Enhanced PBR material settings for realistic fabric appearance
 * - Sine-wave vertex displacement for fabric folds
 */
import * as THREE from "three";

// ── Texture loader ─────────────────────────────────────────

function loadTextureFromFile(
  file: File
): Promise<{ texture: THREE.Texture; url: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    new THREE.TextureLoader().load(
      url,
      (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
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

// ── Procedural fabric normal map ───────────────────────────

/**
 * Creates a subtle fabric weave normal map to add 3D depth to flat textures.
 * This simulates the look of real fabric without external AI tools.
 */
function createFabricNormalMap(width = 256, height = 256): THREE.DataTexture {
  const size = width * height;
  const data = new Uint8Array(4 * size);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      // Fabric weave pattern: alternating horizontal and vertical threads
      const weaveX = Math.sin(x * 0.8) * 0.3 + 0.5;
      const weaveY = Math.sin(y * 0.8) * 0.3 + 0.5;
      // Add subtle randomness for organic feel
      const noise = (Math.random() - 0.5) * 0.05;
      // Normal map: RGB where R=right, G=up, B=surface
      data[i] = Math.floor((weaveX + noise) * 255);     // R: horizontal normal
      data[i + 1] = Math.floor((weaveY + noise) * 255); // G: vertical normal
      data[i + 2] = Math.floor(0.85 * 255);              // B: surface normal (mostly up)
      data[i + 3] = 255;                                   // A: opaque
    }
  }

  const texture = new THREE.DataTexture(data, width, height);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

// ── Fabric material from texture ───────────────────────────

function fabricMatFromTexture(
  texture: THREE.Texture
): THREE.MeshPhysicalMaterial {
  // Deep clone the texture to prevent shared reference corruption
  const clonedTexture = texture.clone();
  clonedTexture.needsUpdate = true;

  const normalMap = createFabricNormalMap();

  return new THREE.MeshPhysicalMaterial({
    map: clonedTexture,
    normalMap: normalMap,
    normalScale: new THREE.Vector2(0.15, 0.15),
    roughness: 0.62,
    metalness: 0.0,
    clearcoat: 0.05,
    clearcoatRoughness: 0.4,
    sheen: 0.3,
    sheenRoughness: 0.4,
    sheenColor: new THREE.Color("#ffffff"),
    side: THREE.DoubleSide,
  });
}

// ── Apply fabric fold displacement to a cylinder ───────────

function applyFabricFolds(
  geometry: THREE.BufferGeometry,
  amplitude = 0.004
) {
  const pos = geometry.attributes.position;
  if (!pos) return;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const r = Math.sqrt(x * x + z * z);
    if (r > 0.01) {
      const angle = Math.atan2(z, x);
      // Multi-frequency sine waves for natural fabric drape
      const fold1 = Math.sin(y * 14 + angle * 6) * amplitude;
      const fold2 = Math.sin(y * 8 + angle * 3) * amplitude * 0.5;
      const fold3 = Math.cos(y * 20 + angle * 10) * amplitude * 0.2;
      const totalFold = fold1 + fold2 + fold3;
      pos.setX(i, x + (x / r) * totalFold);
      pos.setZ(i, z + (z / r) * totalFold);
    }
  }
  pos.needsUpdate = true;
  geometry.computeVertexNormals();
}

// ── Build a T-shirt / Polo from a texture ──────────────────

function buildTop(texture: THREE.Texture): THREE.Group {
  const group = new THREE.Group();
  const mat = fabricMatFromTexture(texture);

  // Main torso — open-ended tapered cylinder
  const torsoGeo = new THREE.CylinderGeometry(0.17, 0.14, 0.42, 24, 4, true);
  applyFabricFolds(torsoGeo, 0.006);
  const torso = new THREE.Mesh(torsoGeo, mat);
  torso.name = "torso";
  group.add(torso);

  // Shoulders ring
  const shoulderRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.17, 0.015, 10, 24),
    mat.clone()
  );
  shoulderRing.position.y = 0.21;
  shoulderRing.rotation.x = Math.PI / 2;
  shoulderRing.name = "shoulderRing";
  group.add(shoulderRing);

  // Left sleeve — slightly tapered for realism
  const leftSleeveGeo = new THREE.CylinderGeometry(0.05, 0.065, 0.14, 12);
  applyFabricFolds(leftSleeveGeo, 0.003);
  const leftSleeve = new THREE.Mesh(leftSleeveGeo, mat.clone());
  leftSleeve.position.set(-0.22, 0.14, 0);
  leftSleeve.rotation.z = -0.45;
  leftSleeve.name = "leftSleeve";
  group.add(leftSleeve);

  // Right sleeve
  const rightSleeveGeo = new THREE.CylinderGeometry(0.05, 0.065, 0.14, 12);
  applyFabricFolds(rightSleeveGeo, 0.003);
  const rightSleeve = new THREE.Mesh(rightSleeveGeo, mat.clone());
  rightSleeve.position.set(0.22, 0.14, 0);
  rightSleeve.rotation.z = 0.45;
  rightSleeve.name = "rightSleeve";
  group.add(rightSleeve);

  // Collar ring — slightly darker than body
  const collarColor = mat.color.clone().multiplyScalar(0.85);
  const collarMat = new THREE.MeshPhysicalMaterial({
    color: collarColor,
    roughness: 0.55,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });
  const collar = new THREE.Mesh(
    new THREE.TorusGeometry(0.07, 0.012, 10, 20),
    collarMat
  );
  collar.position.y = 0.22;
  collar.rotation.x = Math.PI / 2;
  collar.name = "collar";
  group.add(collar);

  // Bottom hem ring
  const hem = new THREE.Mesh(
    new THREE.TorusGeometry(0.14, 0.01, 10, 24),
    mat.clone()
  );
  hem.position.y = -0.21;
  hem.rotation.x = Math.PI / 2;
  hem.name = "hem";
  group.add(hem);

  return group;
}

// ── Build pants from a texture ─────────────────────────────

function buildBottom(texture: THREE.Texture): THREE.Group {
  const group = new THREE.Group();
  const mat = fabricMatFromTexture(texture);

  // Waistband ring
  const waist = new THREE.Mesh(
    new THREE.TorusGeometry(0.15, 0.018, 10, 24),
    mat.clone()
  );
  waist.position.y = 0.26;
  waist.rotation.x = Math.PI / 2;
  waist.name = "waistband";
  group.add(waist);

  // Left leg — higher segment count for smoother look
  const leftGeo = new THREE.CylinderGeometry(0.055, 0.05, 0.46, 16, 4);
  applyFabricFolds(leftGeo, 0.004);
  const leftLeg = new THREE.Mesh(leftGeo, mat.clone());
  leftLeg.position.set(-0.08, -0.02, 0);
  leftLeg.name = "leftLeg";
  group.add(leftLeg);

  // Right leg
  const rightGeo = new THREE.CylinderGeometry(0.055, 0.05, 0.46, 16, 4);
  applyFabricFolds(rightGeo, 0.004);
  const rightLeg = new THREE.Mesh(rightGeo, mat.clone());
  rightLeg.position.set(0.08, -0.02, 0);
  rightLeg.name = "rightLeg";
  group.add(rightLeg);

  // Crotch bridge — smoother transition
  const bridge = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.10, 0.10),
    mat.clone()
  );
  bridge.position.set(0, 0.20, 0);
  bridge.name = "crotchBridge";
  group.add(bridge);

  return group;
}

// ── Build accessory from a texture ─────────────────────────

function buildAccessory(texture: THREE.Texture): THREE.Group {
  const group = new THREE.Group();
  const mat = fabricMatFromTexture(texture);

  // Simple sphere for bags / hats — higher segment count
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 16, 12),
    mat
  );
  sphere.name = "accessorySphere";
  group.add(sphere);

  return group;
}

// ── Main export ────────────────────────────────────────────

export async function generateClothingFromImage(
  file: File,
  category: string
): Promise<string> {
  const { GLTFExporter } = await import(
    "three/examples/jsm/exporters/GLTFExporter.js"
  );

  // 1. Load image as texture
  const { texture, url: textureUrl } = await loadTextureFromFile(file);

  // 2. Build category-specific garment group
  let garment: THREE.Group;
  switch (category) {
    case "bottom":
      garment = buildBottom(texture);
      break;
    case "accessory":
      garment = buildAccessory(texture);
      break;
    default:
      garment = buildTop(texture);
  }
  garment.name = "imageClothing";

  // 3. Wrap in a scene and export
  const scene = new THREE.Scene();
  scene.add(garment);

  const exporter = new GLTFExporter();
  const glbBlob = await new Promise<Blob>((resolve, reject) => {
    exporter.parse(
      scene,
      (result) => {
        resolve(
          new Blob([result as ArrayBuffer], { type: "model/gltf-binary" })
        );
      },
      (error) => reject(error),
      { binary: true }
    );
  });

  // 4. Cleanup — revoke the object URL
  URL.revokeObjectURL(textureUrl);

  return URL.createObjectURL(glbBlob);
}
