/**
 * Dummy GLB Generator — creates 3D cylindrical clothing shapes in-browser.
 *
 * Uses CylinderGeometry to produce garments that visually wrap around the
 * mannequin's volume instead of flat boxes. Each shape is a recognisable
 * garment silhouette (torso tube + sleeves + collar for shirts, dual-leg
 * cylinders for pants, etc.) exported as a binary GLB blob URL.
 */
import * as THREE from "three";

// ── Shared helpers ─────────────────────────────────────────

function makeExporter() {
  return import("three/examples/jsm/exporters/GLTFExporter.js").then(
    (m) => new m.GLTFExporter()
  );
}

function exportScene(scene: THREE.Scene): Promise<string> {
  return makeExporter().then(
    (exporter) =>
      new Promise<string>((resolve, reject) => {
        exporter.parse(
          scene,
          (result) => {
            const blob = new Blob([result as ArrayBuffer], {
              type: "model/gltf-binary",
            });
            resolve(URL.createObjectURL(blob));
          },
          (error) => reject(error),
          { binary: true }
        );
      })
  );
}

function fabricMat(color: string, roughness = 0.65): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    roughness,
    metalness: 0.0,
    clearcoat: 0.05,
    clearcoatRoughness: 0.4,
    sheen: 0.2,
    sheenColor: new THREE.Color("#ffffff"),
    side: THREE.DoubleSide,
  });
}

// ── Shirt / Top ────────────────────────────────────────────

export async function generateDummyShirtGLB(): Promise<string> {
  const scene = new THREE.Scene();
  const group = new THREE.Group();

  const mat = fabricMat("#4a90d9");

  // Main torso — tapered cylinder (wider at shoulders, narrower at waist)
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.17, 0.14, 0.42, 20, 1, true),
    mat
  );
  torso.name = "torso";
  group.add(torso);

  // Shoulders — slightly flared ring at the top
  const shoulderMat = mat.clone();
  const shoulderRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.17, 0.018, 8, 20),
    shoulderMat
  );
  shoulderRing.position.y = 0.21;
  shoulderRing.rotation.x = Math.PI / 2;
  shoulderRing.name = "shoulderRing";
  group.add(shoulderRing);

  // Left sleeve — short cylinder angled outward
  const sleeveMat = mat.clone();
  const leftSleeve = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.065, 0.14, 10),
    sleeveMat
  );
  leftSleeve.position.set(-0.22, 0.14, 0);
  leftSleeve.rotation.z = -0.45;
  leftSleeve.name = "leftSleeve";
  group.add(leftSleeve);

  // Right sleeve
  const rightSleeve = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.065, 0.14, 10),
    sleeveMat.clone()
  );
  rightSleeve.position.set(0.22, 0.14, 0);
  rightSleeve.rotation.z = 0.45;
  rightSleeve.name = "rightSleeve";
  group.add(rightSleeve);

  // Collar — torus at neckline
  const collarMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#3a7bc8"),
    roughness: 0.6,
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
  const hemMat = mat.clone();
  const hem = new THREE.Mesh(
    new THREE.TorusGeometry(0.14, 0.01, 8, 20),
    hemMat
  );
  hem.position.y = -0.21;
  hem.rotation.x = Math.PI / 2;
  hem.name = "hem";
  group.add(hem);

  // Front placket (vertical strip for polo style)
  const placketMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#3a7bc8"),
    roughness: 0.55,
    metalness: 0.0,
  });
  const placket = new THREE.Mesh(
    new THREE.BoxGeometry(0.03, 0.12, 0.005),
    placketMat
  );
  placket.position.set(0, 0.12, 0.17);
  placket.name = "placket";
  group.add(placket);

  group.name = "dummyShirt";
  scene.add(group);
  return exportScene(scene);
}

// ── Pants / Bottoms ────────────────────────────────────────

export async function generateDummyPantsGLB(): Promise<string> {
  const scene = new THREE.Scene();
  const group = new THREE.Group();

  const mat = fabricMat("#2c3e50", 0.75);

  // Waistband — ring
  const waist = new THREE.Mesh(
    new THREE.TorusGeometry(0.15, 0.018, 8, 20),
    mat
  );
  waist.position.y = 0.26;
  waist.rotation.x = Math.PI / 2;
  waist.name = "waistband";
  group.add(waist);

  // Left leg — tapered cylinder
  const leftLeg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.05, 0.46, 12),
    mat.clone()
  );
  leftLeg.position.set(-0.08, -0.02, 0);
  leftLeg.name = "leftLeg";
  group.add(leftLeg);

  // Right leg
  const rightLeg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.05, 0.46, 12),
    mat.clone()
  );
  rightLeg.position.set(0.08, -0.02, 0);
  rightLeg.name = "rightLeg";
  group.add(rightLeg);

  // Crotch bridge — small box connecting the legs
  const bridgeMat = mat.clone();
  const bridge = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.10, 0.10),
    bridgeMat
  );
  bridge.position.set(0, 0.20, 0);
  bridge.name = "crotchBridge";
  group.add(bridge);

  // Belt loop detail
  const loopMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#1a2a3a"),
    roughness: 0.8,
    metalness: 0.0,
  });
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const loop = new THREE.Mesh(
      new THREE.BoxGeometry(0.015, 0.035, 0.005),
      loopMat
    );
    loop.position.set(
      Math.sin(angle) * 0.15,
      0.28,
      Math.cos(angle) * 0.15
    );
    loop.lookAt(0, 0.28, 0);
    loop.name = `beltLoop${i}`;
    group.add(loop);
  }

  group.name = "dummyPants";
  scene.add(group);
  return exportScene(scene);
}

// ── Shoes ──────────────────────────────────────────────────

export async function generateDummyShoesGLB(): Promise<string> {
  const scene = new THREE.Scene();
  const group = new THREE.Group();

  const shoeMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#8b4513"),
    roughness: 0.55,
    metalness: 0.1,
    clearcoat: 0.15,
  });

  const soleMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#1a1a1a"),
    roughness: 0.9,
  });

  // Left shoe — rounded box shape
  const leftUpper = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.05, 0.16, 2, 1, 1),
    shoeMat
  );
  leftUpper.position.set(-0.065, 0.01, 0.01);
  leftUpper.name = "leftUpper";
  group.add(leftUpper);

  // Left sole
  const leftSole = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, 0.015, 0.17),
    soleMat
  );
  leftSole.position.set(-0.065, -0.025, 0.01);
  leftSole.name = "leftSole";
  group.add(leftSole);

  // Left toe cap (rounded front)
  const leftToe = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2),
    shoeMat.clone()
  );
  leftToe.position.set(-0.065, 0.01, 0.09);
  leftToe.rotation.x = -Math.PI / 2;
  leftToe.name = "leftToe";
  group.add(leftToe);

  // Right shoe
  const rightUpper = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.05, 0.16, 2, 1, 1),
    shoeMat.clone()
  );
  rightUpper.position.set(0.065, 0.01, 0.01);
  rightUpper.name = "rightUpper";
  group.add(rightUpper);

  const rightSole = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, 0.015, 0.17),
    soleMat.clone()
  );
  rightSole.position.set(0.065, -0.025, 0.01);
  rightSole.name = "rightSole";
  group.add(rightSole);

  const rightToe = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2),
    shoeMat.clone()
  );
  rightToe.position.set(0.065, 0.01, 0.09);
  rightToe.rotation.x = -Math.PI / 2;
  rightToe.name = "rightToe";
  group.add(rightToe);

  group.name = "dummyShoes";
  scene.add(group);
  return exportScene(scene);
}
