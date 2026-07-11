import React, { useRef, useMemo, useState, useEffect } from "react";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import {
  createTopGeometry,
  createPantLegGeometry,
  createWaistbandGeometry,
  createSkirtGeometry,
  createDressGeometry,
  createOuterwearGeometry,
  createShoeGeometry,
  createHatGeometry,
  createBagGeometry,
  resolveSubtype,
  LAYER_ORDER,
  LAYER_RADIAL_OFFSET,
  type GarmentFit,
  type GarmentSubtype,
} from "./GarmentGeometry";
import {
  createFabricMaterial,
  createTexturedMaterial,
  guessFabric,
  type FabricType,
} from "./FabricMaterials";

interface ClothingItem {
  category: string;
  color: string;
  name: string;
  imageUrl?: string;
  fit?: GarmentFit;
  fabric?: FabricType;
}

interface BodyDNA {
  height: number;
  shoulder: number;
  waist: number;
  hips: number;
  legLength: number;
}

type PosePreset = "neutral" | "fashion" | "walking";

const DEFAULT_DNA: BodyDNA = { height: 0.5, shoulder: 0.5, waist: 0.5, hips: 0.5, legLength: 0.5 };

// --- Premium PBR Materials (LUXOR Signature) ---
const ceramicMat = new THREE.MeshPhysicalMaterial({
  color: "#F0E4D0", roughness: 0.65, metalness: 0, clearcoat: 0.18,
  clearcoatRoughness: 0.2, sheen: 0.35, sheenColor: new THREE.Color("#E8D5B7"),
  envMapIntensity: 0.6,
});
const warmMapleMat = new THREE.MeshPhysicalMaterial({
  color: "#C4A882", roughness: 0.55, metalness: 0, clearcoat: 0.05,
  sheen: 0.15, sheenColor: new THREE.Color("#D8C5A7"),
  envMapIntensity: 0.4,
});
const ivoryPolymerMat = new THREE.MeshPhysicalMaterial({
  color: "#E8DCC8", roughness: 0.7, metalness: 0, clearcoat: 0.12,
  sheen: 0.25, sheenColor: new THREE.Color("#F0E4D0"),
  envMapIntensity: 0.5,
});
const darkAccentMat = new THREE.MeshPhysicalMaterial({
  color: "#8B7355", roughness: 0.75, metalness: 0.05, clearcoat: 0.08,
  envMapIntensity: 0.3,
});

// --- Smoother Lathe Profile Builder (48 segments for elegance) ---
function createBodyProfile(points: [number, number][], segments = 48): THREE.LatheGeometry {
  const curve = new THREE.CatmullRomCurve3(
    points.map(([x, y]) => new THREE.Vector3(x, y, 0)),
    false, "catmullrom", 0.5
  );
  const sampledPoints = curve.getPoints(80);
  const vec2Points = sampledPoints.map((p) => new THREE.Vector2(Math.max(p.x, 0.001), p.y));
  return new THREE.LatheGeometry(vec2Points, segments);
}

// --- Editorial Pose Rotations (luxury fashion silhouettes) ---
const POSES: Record<PosePreset, Record<string, [number, number, number]>> = {
  neutral: {
    leftUpperArm: [-0.05, 0.02, 0.18], rightUpperArm: [0.05, -0.02, -0.15],
    leftForearm: [-0.08, 0, 0.05], rightForearm: [-0.06, 0, 0.03],
    leftThigh: [0.02, 0, -0.03], rightThigh: [-0.06, 0, 0.02],
    leftCalf: [0.01, 0, 0], rightCalf: [0.02, 0, 0],
    torso: [0.02, 0, 0],
    hipShift: -0.03,
    weightShift: 0.04,
  },
  fashion: {
    leftUpperArm: [0.05, 0.08, 0.45], rightUpperArm: [0.15, -0.1, -0.7],
    leftForearm: [-0.4, 0.05, 0.15], rightForearm: [-0.9, -0.05, -0.2],
    leftThigh: [0.03, 0, -0.02], rightThigh: [-0.2, 0, 0.04],
    leftCalf: [0.02, 0, 0], rightCalf: [0.25, 0, 0.02],
    torso: [0.03, 0.08, -0.02],
    hipShift: -0.05,
    weightShift: 0.06,
  },
  walking: {
    leftUpperArm: [0.35, 0.02, 0.12], rightUpperArm: [-0.35, -0.02, -0.12],
    leftForearm: [-0.25, 0, 0.05], rightForearm: [-0.2, 0, -0.03],
    leftThigh: [-0.3, 0, 0.02], rightThigh: [0.3, 0, -0.02],
    leftCalf: [0.2, 0, 0.01], rightCalf: [-0.2, 0, -0.01],
    torso: [0.01, 0.04, 0],
    hipShift: -0.04,
    weightShift: 0.05,
  },
};

// --- Category detection helpers ---
const isTopCat = (s: GarmentSubtype) =>
  s.includes("tshirt") || s.includes("shirt") || s.includes("sweater") || s.includes("hoodie") || s === "generic-top";
const isBottomCat = (s: GarmentSubtype) =>
  s.includes("jeans") || s.includes("trousers") || s === "generic-bottom";
const isSkirtCat = (s: GarmentSubtype) =>
  s.includes("skirt") || s === "generic-skirt";
const isDressCat = (s: GarmentSubtype) =>
  s.includes("dress") || s === "generic-dress";
const isOuterCat = (s: GarmentSubtype) =>
  s.includes("jacket") || s.includes("coat") || s === "generic-outerwear";
const isShoeCat = (s: GarmentSubtype) =>
  s.includes("sneakers") || s.includes("boots") || s.includes("loafers") || s.includes("derby") || s === "generic-shoe";
const isHatCat = (s: GarmentSubtype) =>
  s.includes("cap") || s.includes("beanie") || s.includes("fedora") || s === "generic-hat";
const isBagCat = (s: GarmentSubtype) =>
  s.includes("bag-") || s === "generic-bag";

// --- Animated Garment Wrapper ---
function AnimatedGarment({ children, category }: { children: React.ReactNode; category: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const [progress, setProgress] = useState(0);

  // Determine entry animation direction
  const isBottom = ["bottoms", "skirts", "shoes"].some(c => category.includes(c));
  const startY = isBottom ? -0.3 : 0.3;

  useFrame((_, delta) => {
    if (progress < 1) {
      const next = Math.min(progress + delta * 2.5, 1);
      setProgress(next);
      if (groupRef.current) {
        const ease = 1 - Math.pow(1 - next, 3); // easeOutCubic
        groupRef.current.position.y = startY * (1 - ease);
        // Set opacity on all mesh children
        groupRef.current.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
            if (mat && mat.transparent !== undefined) {
              mat.transparent = true;
              mat.opacity = ease;
            }
          }
        });
      }
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

// --- Idle Rotation Component ---
function IdleRotation({ children, enabled }: { children: React.ReactNode; enabled: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (enabled && groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.17; // ±10deg
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

// --- Premium Editorial Mannequin (LUXOR Signature) ---
function SmoothBody({
  gender, dna, pose, clothing, autoRotate,
}: {
  gender: "male" | "female";
  dna: BodyDNA;
  pose: PosePreset;
  clothing: ClothingItem[];
  autoRotate: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const isMale = gender === "male";

  const heightScale = 0.85 + dna.height * 0.3;
  const shoulderScale = 0.8 + dna.shoulder * 0.4;
  const waistScale = 0.75 + dna.waist * 0.5;
  const hipScale = 0.8 + dna.hips * 0.4;
  const legScale = 0.9 + dna.legLength * 0.2;

  // === FASHION PROPORTIONS (8-head, elongated legs, refined extremities) ===

  // Torso: elegant hourglass (female) / V-taper (male) with reduced waist, refined pelvis
  const torsoGeo = useMemo(() => {
    const neckBaseR = (isMale ? 0.12 : 0.10) * shoulderScale;
    const shoulderR = (isMale ? 0.26 : 0.22) * shoulderScale;  // Wider, more elegant
    const chestR = (isMale ? 0.22 * shoulderScale : 0.19 * shoulderScale);
    const waistR = (isMale ? 0.16 : 0.13) * waistScale;        // Narrower waist
    const hipR = (isMale ? 0.18 : 0.20) * hipScale;            // Reduced pelvis
    return createBodyProfile([
      [neckBaseR, 0.60], [neckBaseR * 1.2, 0.55],
      [shoulderR, 0.47], [chestR, 0.38],
      [waistR, 0.18], [hipR, 0.02],
      [hipR * 0.92, -0.03], [hipR * 0.7, -0.06], [0.001, -0.08],
    ], 48);
  }, [isMale, shoulderScale, waistScale, hipScale]);

  // Head: elegant oval, slightly smaller, refined chin
  const headGeo = useMemo(() => createBodyProfile([
    [0.001, 0.24], [0.06, 0.23], [0.10, 0.21], [0.12, 0.18],
    [0.13, 0.14], [0.133, 0.08], [0.13, 0.02],
    [0.125, -0.04], [0.11, -0.08], [0.09, -0.12],
    [0.06, -0.14], [0.03, -0.145], [0.001, -0.15],
  ], 24), []);

  // Neck: longer, elegant tapering
  const neckGeo = useMemo(() => createBodyProfile([
    [0.001, 0.14], [0.04, 0.13], [0.06, 0.10], [0.065, 0.05],
    [0.068, 0.0], [0.065, -0.05], [0.06, -0.10],
    [0.045, -0.13], [0.001, -0.14],
  ], 20), []);

  // Upper Arm: refined, elegant taper
  const upperArmGeo = useMemo(() => {
    const r = isMale ? 0.06 : 0.05;
    return createBodyProfile([
      [0.001, 0.22], [r * 0.65, 0.20], [r, 0.14], [r * 0.95, 0.06],
      [r * 0.85, -0.04], [r * 0.7, -0.14], [r * 0.5, -0.20], [0.001, -0.22],
    ], 16);
  }, [isMale]);

  // Forearm: slender, with subtle muscle definition
  const forearmGeo = useMemo(() => {
    const r = isMale ? 0.048 : 0.038;
    return createBodyProfile([
      [0.001, 0.20], [r * 0.7, 0.18], [r * 0.95, 0.12], [r, 0.05],
      [r * 0.85, -0.04], [r * 0.65, -0.12], [r * 0.4, -0.18], [0.001, -0.20],
    ], 16);
  }, [isMale]);

  // Hand: refined sphere with elegant proportions
  const handGeo = useMemo(() => new THREE.SphereGeometry(isMale ? 0.055 : 0.048, 16, 16), [isMale]);

  // Thigh: elongated, graceful taper
  const thighGeo = useMemo(() => {
    const r = isMale ? 0.09 : 0.085;
    return createBodyProfile([
      [0.001, 0.28], [r * 0.75, 0.25], [r * 0.95, 0.18], [r, 0.08],
      [r * 0.9, -0.04], [r * 0.75, -0.14], [r * 0.55, -0.22], [0.001, -0.28],
    ], 18);
  }, [isMale]);

  // Calf: elegant shape, slim ankle
  const calfGeo = useMemo(() => {
    const r = isMale ? 0.06 : 0.052;
    const ankleR = isMale ? 0.032 : 0.028;
    return createBodyProfile([
      [0.001, 0.24], [r * 0.7, 0.22], [r * 0.9, 0.16], [r * 0.95, 0.08],
      [r * 0.8, 0.0], [r * 0.65, -0.08], [ankleR, -0.16],
      [ankleR * 0.85, -0.20], [0.001, -0.24],
    ], 18);
  }, [isMale]);

  // Foot: slim, elegant wedge
  const footGeo = useMemo(() => {
    const w = isMale ? 0.045 : 0.038;
    const d = isMale ? 0.14 : 0.12;
    return new THREE.BoxGeometry(w, 0.04, d);
  }, [isMale]);

  const poseData = POSES[pose];

  // Clothing overlay - sorted by layer order with radial offsets
  const garmentData = useMemo(() => {
    return clothing
      .map((item) => {
        const subtype = resolveSubtype(item.category, item.name);
        const fit: GarmentFit = item.fit || "regular";
        const fabric: FabricType = item.fabric || guessFabric(item.category, item.name);
        const layerIdx = LAYER_ORDER[item.category] ?? 1;
        const layerOffset = LAYER_RADIAL_OFFSET[layerIdx] ?? 1.0;

        let zone = "torso";
        if (isBottomCat(subtype) || isSkirtCat(subtype)) zone = "leg";
        else if (isShoeCat(subtype)) zone = "leg";

        const mat = item.imageUrl
          ? createTexturedMaterial(item.imageUrl, fabric, item.color || "gray", zone)
          : createFabricMaterial(item.color || "gray", fabric, zone);
        return { ...item, subtype, fit, fabric, mat, layerIdx, layerOffset };
      })
      .sort((a, b) => a.layerIdx - b.layerIdx);
  }, [clothing]);

  // Body-relative anchor positions (matched to torso shoulder geometry)
  const shoulderWidth = (isMale ? 0.26 : 0.22) * shoulderScale;
  const armX = shoulderWidth; // arms attach at the shoulder edge
  const armY = 0.48 + 0.47; // torso mesh position + shoulder profile y
  const legX = 0.1 * hipScale;
  const waistY = 0.0;
  const shoeY = -0.95 * legScale;

  const animData = useRef({ phase: 0, breathOffset: Math.random() * Math.PI * 2 }).current;

  // Idle breathing + subtle weight shift animation (runs every frame)
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const breath = Math.sin(t * 1.8 + animData.breathOffset) * 0.004;
    const microWeight = Math.sin(t * 0.6 + animData.breathOffset) * poseData.weightShift * 0.5;

    // Subtle breathing on torso
    groupRef.current.children.forEach((child) => {
      if (child.type === 'Group') {
        child.scale.y = 1 + breath * 0.3;
        child.scale.x = 1 - breath * 0.15;
        child.position.x = microWeight * 0.3;
      }
    });
  });

  return (
    <IdleRotation enabled={autoRotate}>
      <group ref={groupRef} scale={[heightScale, heightScale, heightScale]}>
        {/* Head — elegant oval, ceramic finish */}
        <mesh geometry={headGeo} material={ceramicMat} position={[0, 1.28, 0]} scale={[0.92, 0.95, 0.92]} castShadow />
        {/* Neck — longer, elegant */}
        <mesh geometry={neckGeo} material={ivoryPolymerMat} position={[0, 1.00, 0]} castShadow />

        {/* Torso — refined hourglass/V-taper */}
        <group rotation={poseData.torso as [number, number, number]} position={[poseData.hipShift || 0, 0, 0]}>
          <mesh geometry={torsoGeo} material={ceramicMat} position={[0, 0.48, 0]} castShadow />
        </group>

        {/* Left arm with hidden capsule joints */}
        <group position={[-armX, armY, 0]}>
          <group rotation={poseData.leftUpperArm as [number, number, number]}>
            {/* Shoulder capsule (hidden connector) */}
            <mesh material={darkAccentMat} position={[0, 0, 0]}>
              <sphereGeometry args={[0.03, 12, 12]} />
            </mesh>
            <mesh geometry={upperArmGeo} material={warmMapleMat} position={[0, -0.22, 0]} castShadow />
            {/* Elbow capsule */}
            <mesh material={darkAccentMat} position={[0, -0.44, 0]}>
              <sphereGeometry args={[0.025, 10, 10]} />
            </mesh>
            <group position={[0, -0.44, 0]}>
              <group rotation={poseData.leftForearm as [number, number, number]}>
                <mesh geometry={forearmGeo} material={warmMapleMat} position={[0, -0.18, 0]} castShadow />
                {/* Wrist capsule */}
                <mesh material={darkAccentMat} position={[0, -0.36, 0]}>
                  <sphereGeometry args={[0.02, 8, 8]} />
                </mesh>
                <mesh geometry={handGeo} material={ivoryPolymerMat} position={[0, -0.44, 0]} castShadow />
              </group>
            </group>
          </group>
        </group>

        {/* Right arm with hidden capsule joints */}
        <group position={[armX, armY, 0]}>
          <group rotation={poseData.rightUpperArm as [number, number, number]}>
            {/* Shoulder capsule */}
            <mesh material={darkAccentMat} position={[0, 0, 0]}>
              <sphereGeometry args={[0.03, 12, 12]} />
            </mesh>
            <mesh geometry={upperArmGeo} material={warmMapleMat} position={[0, -0.22, 0]} castShadow />
            {/* Elbow capsule */}
            <mesh material={darkAccentMat} position={[0, -0.44, 0]}>
              <sphereGeometry args={[0.025, 10, 10]} />
            </mesh>
            <group position={[0, -0.44, 0]}>
              <group rotation={poseData.rightForearm as [number, number, number]}>
                <mesh geometry={forearmGeo} material={warmMapleMat} position={[0, -0.18, 0]} castShadow />
                {/* Wrist capsule */}
                <mesh material={darkAccentMat} position={[0, -0.36, 0]}>
                  <sphereGeometry args={[0.02, 8, 8]} />
                </mesh>
                <mesh geometry={handGeo} material={ivoryPolymerMat} position={[0, -0.44, 0]} castShadow />
              </group>
            </group>
          </group>
        </group>

        {/* Left leg — elongated, elegant */}
        <group position={[-legX, -0.05, 0]}>
          <group rotation={poseData.leftThigh as [number, number, number]}>
            <mesh geometry={thighGeo} material={ivoryPolymerMat} position={[0, -0.32 * legScale, 0]} castShadow />
            {/* Knee capsule */}
            <mesh material={darkAccentMat} position={[0, -0.56 * legScale, 0]}>
              <sphereGeometry args={[0.025, 10, 10]} />
            </mesh>
            <group position={[0, -0.56 * legScale, 0]}>
              <group rotation={poseData.leftCalf as [number, number, number]}>
                <mesh geometry={calfGeo} material={ivoryPolymerMat} position={[0, -0.24 * legScale, 0]} castShadow />
                {/* Ankle capsule */}
                <mesh material={darkAccentMat} position={[0, -0.48 * legScale, 0]}>
                  <sphereGeometry args={[0.018, 8, 8]} />
                </mesh>
                <mesh geometry={footGeo} material={darkAccentMat} position={[0, -0.52 * legScale, 0.08]} castShadow />
              </group>
            </group>
          </group>
        </group>

        {/* Right leg — elongated, elegant */}
        <group position={[legX, -0.05, 0]}>
          <group rotation={poseData.rightThigh as [number, number, number]}>
            <mesh geometry={thighGeo} material={ivoryPolymerMat} position={[0, -0.32 * legScale, 0]} castShadow />
            {/* Knee capsule */}
            <mesh material={darkAccentMat} position={[0, -0.56 * legScale, 0]}>
              <sphereGeometry args={[0.025, 10, 10]} />
            </mesh>
            <group position={[0, -0.56 * legScale, 0]}>
              <group rotation={poseData.rightCalf as [number, number, number]}>
                <mesh geometry={calfGeo} material={ivoryPolymerMat} position={[0, -0.24 * legScale, 0]} castShadow />
                {/* Ankle capsule */}
                <mesh material={darkAccentMat} position={[0, -0.48 * legScale, 0]}>
                  <sphereGeometry args={[0.018, 8, 8]} />
                </mesh>
                <mesh geometry={footGeo} material={darkAccentMat} position={[0, -0.52 * legScale, 0.08]} castShadow />
              </group>
            </group>
          </group>
        </group>

        {/* Elegant stand — minimal pedestal */}
        <mesh material={darkAccentMat} position={[0, -1.15 * legScale, 0]} receiveShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.12, 8]} />
        </mesh>
        <mesh material={ceramicMat} position={[0, -1.23 * legScale, 0]} receiveShadow>
          <cylinderGeometry args={[0.25, 0.28, 0.03, 32]} />
        </mesh>

        {/* ====== CLOTHING ====== */}
        {garmentData.map((item, i) => {
          const lo = item.layerOffset;

          // --- TOPS ---
          if (isTopCat(item.subtype)) {
            const { torso, sleeves } = createTopGeometry(item.subtype, item.fit, shoulderScale, waistScale, lo);
            return (
              <AnimatedGarment key={`clothing-${i}`} category={item.category}>
                <mesh geometry={torso} material={item.mat} position={[0, 0.45, 0]} castShadow />
                {sleeves && (
                  <>
                    <group position={[-armX, armY - 0.03, 0]}>
                      <group rotation={poseData.leftUpperArm as [number, number, number]}>
                        <mesh geometry={sleeves.geo} material={item.mat} position={[0, -0.02, 0]} castShadow />
                      </group>
                    </group>
                    <group position={[armX, armY - 0.03, 0]}>
                      <group rotation={poseData.rightUpperArm as [number, number, number]}>
                        <mesh geometry={sleeves.geo} material={item.mat} position={[0, -0.02, 0]} castShadow />
                      </group>
                    </group>
                  </>
                )}
              </AnimatedGarment>
            );
          }

          // --- BOTTOMS ---
          if (isBottomCat(item.subtype)) {
            const legGeo = createPantLegGeometry(item.subtype, item.fit, hipScale, legScale, lo);
            const waistGeo = createWaistbandGeometry(hipScale, item.fit, lo);
            const waistYPos = waistY - (dna.waist - 0.5) * 0.04; // adjust with DNA
            return (
              <AnimatedGarment key={`clothing-${i}`} category={item.category}>
                <mesh geometry={waistGeo} material={item.mat} position={[0, waistYPos, 0]} castShadow />
                <group position={[-legX, -0.05, 0]}>
                  <group rotation={poseData.leftThigh as [number, number, number]}>
                    <mesh geometry={legGeo} material={item.mat} position={[0, -0.3 * legScale, 0]} castShadow />
                  </group>
                </group>
                <group position={[legX, -0.05, 0]}>
                  <group rotation={poseData.rightThigh as [number, number, number]}>
                    <mesh geometry={legGeo} material={item.mat} position={[0, -0.3 * legScale, 0]} castShadow />
                  </group>
                </group>
              </AnimatedGarment>
            );
          }

          // --- SKIRTS ---
          if (isSkirtCat(item.subtype)) {
            const skirtGeo = createSkirtGeometry(item.subtype, item.fit, waistScale, hipScale, lo);
            return (
              <AnimatedGarment key={`clothing-${i}`} category={item.category}>
                <mesh geometry={skirtGeo} material={item.mat} position={[0, waistY, 0]} castShadow />
              </AnimatedGarment>
            );
          }

          // --- DRESSES ---
          if (isDressCat(item.subtype)) {
            const { body, sleeves } = createDressGeometry(item.subtype, item.fit, shoulderScale, waistScale, hipScale, lo);
            return (
              <AnimatedGarment key={`clothing-${i}`} category={item.category}>
                <mesh geometry={body} material={item.mat} position={[0, 0.30, 0]} castShadow />
                {sleeves && (
                  <>
                    <group position={[-armX, armY - 0.03, 0]}>
                      <group rotation={poseData.leftUpperArm as [number, number, number]}>
                        <mesh geometry={sleeves.geo} material={item.mat} position={[0, -0.02, 0]} castShadow />
                      </group>
                    </group>
                    <group position={[armX, armY - 0.03, 0]}>
                      <group rotation={poseData.rightUpperArm as [number, number, number]}>
                        <mesh geometry={sleeves.geo} material={item.mat} position={[0, -0.02, 0]} castShadow />
                      </group>
                    </group>
                  </>
                )}
              </AnimatedGarment>
            );
          }

          // --- OUTERWEAR ---
          if (isOuterCat(item.subtype)) {
            const { torso, collar } = createOuterwearGeometry(item.subtype, item.fit, shoulderScale, waistScale, hipScale, lo);
            return (
              <AnimatedGarment key={`clothing-${i}`} category={item.category}>
                <mesh geometry={torso} material={item.mat} position={[0, 0.45, 0]} castShadow />
                {collar && <mesh geometry={collar} material={item.mat} position={[0, 0.96, 0]} castShadow />}
              </AnimatedGarment>
            );
          }

          // --- SHOES ---
          if (isShoeCat(item.subtype)) {
            const shoeGeo = createShoeGeometry(item.subtype);
            return (
              <AnimatedGarment key={`clothing-${i}`} category={item.category}>
                <group position={[-legX, -0.05, 0]}>
                  <group rotation={poseData.leftThigh as [number, number, number]}>
                    <group position={[0, -0.55 * legScale, 0]}>
                      <group rotation={poseData.leftCalf as [number, number, number]}>
                        <mesh geometry={shoeGeo} material={item.mat} position={[0, -0.46 * legScale, 0.05]} castShadow />
                      </group>
                    </group>
                  </group>
                </group>
                <group position={[legX, -0.05, 0]}>
                  <group rotation={poseData.rightThigh as [number, number, number]}>
                    <group position={[0, -0.55 * legScale, 0]}>
                      <group rotation={poseData.rightCalf as [number, number, number]}>
                        <mesh geometry={shoeGeo} material={item.mat} position={[0, -0.46 * legScale, 0.05]} castShadow />
                      </group>
                    </group>
                  </group>
                </group>
              </AnimatedGarment>
            );
          }

          // --- HATS ---
          if (isHatCat(item.subtype)) {
            const { crown, brim } = createHatGeometry(item.subtype);
            return (
              <AnimatedGarment key={`clothing-${i}`} category={item.category}>
                <group position={[0, 1.32, 0]}>
                  <mesh geometry={crown} material={item.mat} castShadow />
                  {brim && (
                    <mesh geometry={brim} material={item.mat}
                      position={[0, -0.02, 0.04]} rotation={[-Math.PI / 2, 0, 0]} castShadow />
                  )}
                </group>
              </AnimatedGarment>
            );
          }

          // --- BAGS ---
          if (isBagCat(item.subtype)) {
            const { body: bagBody, handle } = createBagGeometry(item.subtype);
            return (
              <AnimatedGarment key={`clothing-${i}`} category={item.category}>
                {/* Position bag at left hand */}
                <group position={[-armX, armY - 0.03, 0]}>
                  <group rotation={poseData.leftUpperArm as [number, number, number]}>
                    <group position={[0, -0.42, 0]}>
                      <group rotation={poseData.leftForearm as [number, number, number]}>
                        <group position={[0, -0.30, 0]}>
                          <mesh geometry={bagBody} material={item.mat} castShadow />
                          <mesh geometry={handle} material={item.mat} position={[0, 0.08, 0]} rotation={[0, 0, 0]} castShadow />
                        </group>
                      </group>
                    </group>
                  </group>
                </group>
              </AnimatedGarment>
            );
          }

          return null;
        })}
      </group>
    </IdleRotation>
  );
}

interface Mannequin3DProps {
  gender?: "male" | "female";
  clothing?: ClothingItem[];
  dna?: BodyDNA;
  pose?: PosePreset;
  className?: string;
  tracingImageUrl?: string;
  tracingOpacity?: number;
  showMeasurements?: boolean;
  autoRotate?: boolean;
}

export default function Mannequin3D({
  gender = "male",
  clothing = [],
  dna = DEFAULT_DNA,
  pose = "neutral",
  className = "",
  tracingImageUrl,
  tracingOpacity = 0.3,
  showMeasurements = false,
  autoRotate = true,
}: Mannequin3DProps) {
  const [webglOk, setWebglOk] = useState<boolean | null>(null);
  const [canvasMounted, setCanvasMounted] = useState(false);
  const [sceneError, setSceneError] = useState<string | null>(null);

  useEffect(() => {
    console.log("[MANNEQUIN3D] Component mounted");
    // Check WebGL support
    try {
      const testCanvas = document.createElement("canvas");
      const gl = testCanvas.getContext("webgl2") || testCanvas.getContext("webgl");
      const supported = !!gl;
      console.log("[MANNEQUIN3D] WebGL supported:", supported);
      if (gl && "getExtension" in gl) {
        const ext = gl.getExtension("WEBGL_debug_renderer_info");
        if (ext) {
          console.log("[MANNEQUIN3D] GPU:", gl.getParameter(ext.UNMASKED_RENDERER_WEBGL));
        }
      }
      setWebglOk(supported);
    } catch (e) {
      console.error("[MANNEQUIN3D] WebGL check failed:", e);
      setWebglOk(false);
    }
    return () => console.log("[MANNEQUIN3D] Component unmounted");
  }, []);

  const isMale = gender === "male";
  const shoulderScale = 0.8 + dna.shoulder * 0.4;
  const waistScale = 0.75 + dna.waist * 0.5;
  const hipScale = 0.8 + dna.hips * 0.4;

  const measurements = {
    shoulder: Math.round((isMale ? 46 : 40) * shoulderScale),
    waist: Math.round((isMale ? 82 : 68) * waistScale),
    hips: Math.round((isMale ? 96 : 100) * hipScale),
    inseam: Math.round((isMale ? 82 : 76) * (0.9 + dna.legLength * 0.2)),
  };

  return (
    <div className={`w-full h-full relative ${className}`}>
      {tracingImageUrl && (
        <img src={tracingImageUrl} alt="Tracing reference"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
          style={{ opacity: tracingOpacity }} />
      )}

      {showMeasurements && (
        <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
          <div className="relative" style={{ width: "60%", height: "80%" }}>
            <div className="absolute flex items-center gap-1" style={{ top: "18%", left: "10%", right: "10%" }}>
              <div className="flex-1 border-t-2 border-dashed border-primary/60" />
              <span className="text-[10px] font-mono bg-background/80 text-primary px-1.5 py-0.5 rounded whitespace-nowrap">
                {measurements.shoulder} cm
              </span>
              <div className="flex-1 border-t-2 border-dashed border-primary/60" />
            </div>
            <div className="absolute flex items-center gap-1" style={{ top: "42%", left: "18%", right: "18%" }}>
              <div className="flex-1 border-t-2 border-dashed border-[hsl(45,80%,55%)]/60" />
              <span className="text-[10px] font-mono bg-background/80 text-[hsl(45,80%,55%)] px-1.5 py-0.5 rounded whitespace-nowrap">
                {measurements.waist} cm
              </span>
              <div className="flex-1 border-t-2 border-dashed border-[hsl(45,80%,55%)]/60" />
            </div>
            <div className="absolute flex items-center gap-1" style={{ top: "52%", left: "14%", right: "14%" }}>
              <div className="flex-1 border-t-2 border-dashed border-[hsl(270,40%,65%)]/60" />
              <span className="text-[10px] font-mono bg-background/80 text-[hsl(270,40%,65%)] px-1.5 py-0.5 rounded whitespace-nowrap">
                {measurements.hips} cm
              </span>
              <div className="flex-1 border-t-2 border-dashed border-[hsl(270,40%,65%)]/60" />
            </div>
            <div className="absolute flex flex-col items-center" style={{ top: "55%", bottom: "10%", left: "46%" }}>
              <div className="flex-1 border-l-2 border-dashed border-[hsl(0,70%,60%)]/60" />
              <span className="text-[10px] font-mono bg-background/80 text-[hsl(0,70%,60%)] px-1.5 py-0.5 rounded whitespace-nowrap mt-1">
                {measurements.inseam} cm
              </span>
            </div>
          </div>
        </div>
      )}

      {/* WebGL not supported fallback */}
      {webglOk === false && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-30">
          <div className="text-center p-6">
            <p className="text-sm font-sans text-muted-foreground mb-2">3D rendering is not available on this device.</p>
            <p className="text-xs font-sans text-muted-foreground/60">Try using Chrome or Firefox on a desktop.</p>
          </div>
        </div>
      )}

      <Canvas
        camera={{ position: [0, 0.3, 3.2], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        shadows
        style={{ background: "transparent" }}
        onCreated={(state) => {
          console.log("[MANNEQUIN3D] Canvas created successfully");
          console.log("[MANNEQUIN3D] Renderer:", state.gl.renderer);
          console.log("[MANNEQUIN3D] Capabilities:", state.gl.capabilities);
          setCanvasMounted(true);
        }}
        onError={(e) => {
          console.error("[MANNEQUIN3D] Canvas error:", e);
          setSceneError(String(e));
        }}
      >
        {/* Fallback — always render a ground plane + pedestal so the scene is never empty */}
        <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[2, 32]} />
          <meshStandardMaterial color="#2A2A2A" roughness={0.9} />
        </mesh>
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[2, 4, 3]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-near={0.1}
          shadow-camera-far={10}
        />
        <directionalLight position={[-2, 3, -1]} intensity={0.3} />
        <pointLight position={[-1, 2, -2]} intensity={0.2} color="#F5E6D3" />
        <spotLight position={[0, 5, 0]} intensity={0.3} angle={0.6} penumbra={0.8} castShadow />
        <pointLight position={[0, -1, 2]} intensity={0.15} />

        <React.Suspense fallback={null}>
          <SmoothBody gender={gender} dna={dna} pose={pose} clothing={clothing} autoRotate={autoRotate} />
        </React.Suspense>

        <ContactShadows
          position={[0, -1.2, 0]}
          opacity={0.5}
          scale={3.5}
          blur={3}
          far={5}
        />
        {/* HDRI-quality studio lighting — premium editorial setup */}
        <hemisphereLight args={["#F0E4D0", "#1A1A2E", 0.5]} />
        {/* Large soft key light from upper-left */}
        <pointLight position={[3, 5, 4]} intensity={0.7} color="#FFFAF0" distance={12} decay={2} />
        {/* Fill light from right, warmer */}
        <pointLight position={[-2, 3, 3]} intensity={0.35} color="#E8D5B7" distance={10} decay={2} />
        {/* Rim light from behind */}
        <pointLight position={[-1, 3, -4]} intensity={0.25} color="#D4E5FF" distance={10} decay={2} />
        {/* Subtle accent from below */}
        <pointLight position={[0, -1, 2]} intensity={0.12} color="#E8D5B7" distance={8} decay={2} />

        <OrbitControls
          enablePan={false} enableZoom={true}
          minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 1.3}
          minDistance={2} maxDistance={6}
        />
      </Canvas>
      {/* Debug overlay — shows mount status */}
      <div className="absolute bottom-1 left-1 z-30 text-[8px] font-mono text-muted-foreground/40 bg-background/50 px-1 rounded pointer-events-none">
        WebGL:{webglOk === null ? "?" : webglOk ? "✓" : "✗"} Canvas:{canvasMounted ? "✓" : "…"}
      </div>
    </div>
  );
}

export type { ClothingItem, BodyDNA, PosePreset };
