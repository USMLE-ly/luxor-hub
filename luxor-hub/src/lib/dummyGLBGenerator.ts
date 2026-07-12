/**
 * Dummy GLB Generator — creates basic 3D clothing shapes in-browser.
 * Used for testing the 3D Asset Bridge without requiring external .glb files.
 */
import * as THREE from "three";

/**
 * Generate a simple T-shirt shaped geometry as a GLB blob URL.
 * Creates a recognizable T-shirt silhouette using merged box geometries.
 */
export async function generateDummyShirtGLB(): Promise<string> {
  const { GLTFExporter } = await import("three/examples/jsm/exporters/GLTFExporter.js");

  const scene = new THREE.Scene();
  const group = new THREE.Group();

  const fabricColor = new THREE.Color("#4a90d9");
  const fabricMat = new THREE.MeshPhysicalMaterial({
    color: fabricColor,
    roughness: 0.65,
    metalness: 0.0,
    clearcoat: 0.1,
    clearcoatRoughness: 0.4,
  });

  // Torso — main body (wider at shoulders, narrower at waist)
  const torsoGeo = new THREE.BoxGeometry(0.38, 0.45, 0.14);
  const torso = new THREE.Mesh(torsoGeo, fabricMat);
  torso.position.set(0, 0, 0);
  torso.name = "torso";
  group.add(torso);

  // Left sleeve
  const sleeveGeo = new THREE.BoxGeometry(0.14, 0.18, 0.12);
  const leftSleeve = new THREE.Mesh(sleeveGeo, fabricMat.clone());
  leftSleeve.position.set(-0.26, 0.1, 0);
  leftSleeve.rotation.z = -0.15;
  leftSleeve.name = "leftSleeve";
  group.add(leftSleeve);

  // Right sleeve
  const rightSleeve = new THREE.Mesh(sleeveGeo.clone(), fabricMat.clone());
  rightSleeve.position.set(0.26, 0.1, 0);
  rightSleeve.rotation.z = 0.15;
  rightSleeve.name = "rightSleeve";
  group.add(rightSleeve);

  // Neckline — a small torus
  const neckGeo = new THREE.TorusGeometry(0.07, 0.012, 8, 16);
  const neckMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#3a7bc8"),
    roughness: 0.6,
    metalness: 0.0,
  });
  const neck = new THREE.Mesh(neckGeo, neckMat);
  neck.position.set(0, 0.26, 0);
  neck.rotation.x = Math.PI / 2;
  neck.name = "neckline";
  group.add(neck);

  // Bottom hem — slightly wider strip
  const hemGeo = new THREE.BoxGeometry(0.40, 0.02, 0.15);
  const hem = new THREE.Mesh(hemGeo, fabricMat.clone());
  hem.position.set(0, -0.24, 0);
  hem.name = "hem";
  group.add(hem);

  group.name = "dummyShirt";
  scene.add(group);

  const exporter = new GLTFExporter();
  return new Promise<string>((resolve, reject) => {
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
  });
}

/**
 * Generate a simple pants/bottoms shaped geometry as a GLB blob URL.
 */
export async function generateDummyPantsGLB(): Promise<string> {
  const { GLTFExporter } = await import("three/examples/jsm/exporters/GLTFExporter.js");

  const scene = new THREE.Scene();
  const group = new THREE.Group();

  const fabricColor = new THREE.Color("#2c3e50");
  const fabricMat = new THREE.MeshPhysicalMaterial({
    color: fabricColor,
    roughness: 0.75,
    metalness: 0.0,
    clearcoat: 0.05,
  });

  // Waistband
  const waistGeo = new THREE.BoxGeometry(0.34, 0.06, 0.14);
  const waist = new THREE.Mesh(waistGeo, fabricMat);
  waist.position.set(0, 0.28, 0);
  waist.name = "waistband";
  group.add(waist);

  // Left leg
  const legGeo = new THREE.BoxGeometry(0.13, 0.48, 0.11);
  const leftLeg = new THREE.Mesh(legGeo, fabricMat.clone());
  leftLeg.position.set(-0.095, -0.02, 0);
  leftLeg.name = "leftLeg";
  group.add(leftLeg);

  // Right leg
  const rightLeg = new THREE.Mesh(legGeo.clone(), fabricMat.clone());
  rightLeg.position.set(0.095, -0.02, 0);
  rightLeg.name = "rightLeg";
  group.add(rightLeg);

  // Crotch bridge
  const crotchGeo = new THREE.BoxGeometry(0.06, 0.08, 0.12);
  const crotch = new THREE.Mesh(crotchGeo, fabricMat.clone());
  crotch.position.set(0, 0.22, 0);
  crotch.name = "crotch";
  group.add(crotch);

  group.name = "dummyPants";
  scene.add(group);

  const exporter = new GLTFExporter();
  return new Promise<string>((resolve, reject) => {
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
  });
}

/**
 * Generate a simple shoes geometry as a GLB blob URL.
 */
export async function generateDummyShoesGLB(): Promise<string> {
  const { GLTFExporter } = await import("three/examples/jsm/exporters/GLTFExporter.js");

  const scene = new THREE.Scene();
  const group = new THREE.Group();

  const shoeMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#8b4513"),
    roughness: 0.55,
    metalness: 0.1,
    clearcoat: 0.15,
  });

  // Left shoe — elongated box
  const leftGeo = new THREE.BoxGeometry(0.09, 0.06, 0.18);
  const left = new THREE.Mesh(leftGeo, shoeMat);
  left.position.set(-0.075, 0, 0.02);
  left.name = "leftShoe";
  group.add(left);

  // Left sole
  const soleGeo = new THREE.BoxGeometry(0.10, 0.02, 0.19);
  const soleMat = new THREE.MeshStandardMaterial({ color: new THREE.Color("#1a1a1a"), roughness: 0.9 });
  const leftSole = new THREE.Mesh(soleGeo, soleMat);
  leftSole.position.set(-0.075, -0.04, 0.02);
  leftSole.name = "leftSole";
  group.add(leftSole);

  // Right shoe
  const right = new THREE.Mesh(leftGeo.clone(), shoeMat.clone());
  right.position.set(0.075, 0, 0.02);
  right.name = "rightShoe";
  group.add(right);

  // Right sole
  const rightSole = new THREE.Mesh(soleGeo.clone(), soleMat.clone());
  rightSole.position.set(0.075, -0.04, 0.02);
  rightSole.name = "rightSole";
  group.add(rightSole);

  group.name = "dummyShoes";
  scene.add(group);

  const exporter = new GLTFExporter();
  return new Promise<string>((resolve, reject) => {
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
  });
}
