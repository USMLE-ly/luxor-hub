/**
 * Image-to-GLB Converter — maps a 2D image onto 3D cylindrical garment shapes.
 *
 * Instead of flat BoxGeometry, this uses CylinderGeometry to create garments
 * that visually wrap around the mannequin's volume. The user's uploaded image
 * is mapped as a fabric texture around the curved surface.
 *
 * Categories:
 *   top       → torso cylinder + two short sleeve cylinders + collar ring
 *   bottom    → waistband ring + two leg cylinders
 *   accessory → small sphere / box
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

// ── Fabric material from texture ───────────────────────────

function fabricMatFromTexture(
  texture: THREE.Texture
): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    map: texture.clone(),
    roughness: 0.65,
    metalness: 0.0,
    clearcoat: 0.05,
    clearcoatRoughness: 0.4,
    sheen: 0.2,
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
      const fold = Math.sin(y * 14 + angle * 6) * amplitude;
      pos.setX(i, x + (x / r) * fold);
      pos.setZ(i, z + (z / r) * fold);
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
  const torsoGeo = new THREE.CylinderGeometry(
    0.17, 0.14, 0.42, 20, 1, true
  );
  applyFabricFolds(torsoGeo, 0.005);
  const torso = new THREE.Mesh(torsoGeo, mat);
  torso.name = "torso";
  group.add(torso);

  // Shoulders ring
  const shoulderRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.17, 0.015, 8, 20),
    mat.clone()
  );
  shoulderRing.position.y = 0.21;
  shoulderRing.rotation.x = Math.PI / 2;
  shoulderRing.name = "shoulderRing";
  group.add(shoulderRing);

  // Left sleeve
  const leftSleeve = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.065, 0.14, 10),
    mat.clone()
  );
  leftSleeve.position.set(-0.22, 0.14, 0);
  leftSleeve.rotation.z = -0.45;
  leftSleeve.name = "leftSleeve";
  group.add(leftSleeve);

  // Right sleeve
  const rightSleeve = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.065, 0.14, 10),
    mat.clone()
  );
  rightSleeve.position.set(0.22, 0.14, 0);
  rightSleeve.rotation.z = 0.45;
  rightSleeve.name = "rightSleeve";
  group.add(rightSleeve);

  // Collar ring
  const collarMat = new THREE.MeshStandardMaterial({
    color: mat.color.clone().multiplyScalar(0.85),
    roughness: 0.55,
    metalness: 0.0,
  });
  const collar = new THREE.Mesh(
    new THREE.TorusGeometry(0.07, 0.012, 8, 16),
    collarMat
  );
  collar.position.y = 0.22;
  collar.rotation.x = Math.PI / 2;
  collar.name = "collar";
  group.add(collar);

  // Bottom hem ring
  const hem = new THREE.Mesh(
    new THREE.TorusGeometry(0.14, 0.01, 8, 20),
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
    new THREE.TorusGeometry(0.15, 0.018, 8, 20),
    mat.clone()
  );
  waist.position.y = 0.26;
  waist.rotation.x = Math.PI / 2;
  waist.name = "waistband";
  group.add(waist);

  // Left leg
  const leftGeo = new THREE.CylinderGeometry(0.055, 0.05, 0.46, 12);
  applyFabricFolds(leftGeo, 0.003);
  const leftLeg = new THREE.Mesh(leftGeo, mat.clone());
  leftLeg.position.set(-0.08, -0.02, 0);
  leftLeg.name = "leftLeg";
  group.add(leftLeg);

  // Right leg
  const rightGeo = new THREE.CylinderGeometry(0.055, 0.05, 0.46, 12);
  applyFabricFolds(rightGeo, 0.003);
  const rightLeg = new THREE.Mesh(rightGeo, mat.clone());
  rightLeg.position.set(0.08, -0.02, 0);
  rightLeg.name = "rightLeg";
  group.add(rightLeg);

  // Crotch bridge
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

  // Simple sphere for bags / hats
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 12, 10),
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

  // 4. Cleanup — revoke the object URL but do NOT dispose the texture
  // (the cloned texture in the material may still reference the image data)
  URL.revokeObjectURL(textureUrl);

  return URL.createObjectURL(glbBlob);
}
