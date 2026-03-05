import { useRef, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
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
  resolveSubtype,
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

// --- Materials ---
const clayMaterial = new THREE.MeshStandardMaterial({ color: "#D4B896", roughness: 0.92, metalness: 0 });
const darkClayMaterial = new THREE.MeshStandardMaterial({ color: "#C4A882", roughness: 0.88, metalness: 0 });

// --- Lathe Profile Builder ---
function createBodyProfile(points: [number, number][], segments = 32): THREE.LatheGeometry {
  const curve = new THREE.CatmullRomCurve3(
    points.map(([x, y]) => new THREE.Vector3(x, y, 0)),
    false, "catmullrom", 0.5
  );
  const sampledPoints = curve.getPoints(60);
  const vec2Points = sampledPoints.map((p) => new THREE.Vector2(Math.max(p.x, 0.001), p.y));
  return new THREE.LatheGeometry(vec2Points, segments);
}

// --- Pose rotations ---
const POSES: Record<PosePreset, Record<string, [number, number, number]>> = {
  neutral: {
    leftUpperArm: [0, 0, 0.15], rightUpperArm: [0, 0, -0.15],
    leftForearm: [0, 0, 0], rightForearm: [0, 0, 0],
    leftThigh: [0, 0, 0], rightThigh: [0, 0, 0],
    leftCalf: [0, 0, 0], rightCalf: [0, 0, 0], torso: [0, 0, 0],
  },
  fashion: {
    leftUpperArm: [0, 0, 0.4], rightUpperArm: [0.2, 0, -0.6],
    leftForearm: [-0.3, 0, 0.1], rightForearm: [-0.8, 0, -0.2],
    leftThigh: [0, 0, 0], rightThigh: [-0.15, 0, 0],
    leftCalf: [0, 0, 0], rightCalf: [0.2, 0, 0], torso: [0, 0.05, 0],
  },
  walking: {
    leftUpperArm: [0.3, 0, 0.15], rightUpperArm: [-0.3, 0, -0.15],
    leftForearm: [-0.2, 0, 0], rightForearm: [-0.2, 0, 0],
    leftThigh: [-0.25, 0, 0], rightThigh: [0.25, 0, 0],
    leftCalf: [0.15, 0, 0], rightCalf: [0, 0, 0], torso: [0, 0, 0],
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

// --- Smooth Anatomical Body ---
function SmoothBody({
  gender, dna, pose, clothing,
}: {
  gender: "male" | "female";
  dna: BodyDNA;
  pose: PosePreset;
  clothing: ClothingItem[];
}) {
  const groupRef = useRef<THREE.Group>(null);
  const isMale = gender === "male";

  const heightScale = 0.85 + dna.height * 0.3;
  const shoulderScale = 0.8 + dna.shoulder * 0.4;
  const waistScale = 0.75 + dna.waist * 0.5;
  const hipScale = 0.8 + dna.hips * 0.4;
  const legScale = 0.9 + dna.legLength * 0.2;

  const torsoGeo = useMemo(() => {
    const shoulderR = (isMale ? 0.24 : 0.21) * shoulderScale;
    const waistR = (isMale ? 0.18 : 0.15) * waistScale;
    const hipR = (isMale ? 0.19 : 0.23) * hipScale;
    const chestR = isMale ? 0.22 : 0.20;
    return createBodyProfile([
      [0.001, 0.55], [0.08, 0.52], [shoulderR, 0.45],
      [chestR * shoulderScale, 0.35], [waistR, 0.15],
      [hipR, 0.0], [hipR * 0.95, -0.05], [0.001, -0.08],
    ], 24);
  }, [isMale, shoulderScale, waistScale, hipScale]);

  const headGeo = useMemo(() => createBodyProfile([
    [0.001, 0.22], [0.08, 0.21], [0.12, 0.18], [0.135, 0.12],
    [0.14, 0.05], [0.135, -0.02], [0.12, -0.08], [0.10, -0.12],
    [0.08, -0.14], [0.001, -0.15],
  ], 20), []);

  const neckGeo = useMemo(() => createBodyProfile([
    [0.001, 0.08], [0.055, 0.06], [0.06, 0.0], [0.065, -0.06], [0.001, -0.08],
  ], 16), []);

  const upperArmGeo = useMemo(() => {
    const r = isMale ? 0.065 : 0.055;
    return createBodyProfile([
      [0.001, 0.2], [r * 0.7, 0.18], [r, 0.1], [r * 0.95, 0.0],
      [r * 0.85, -0.1], [r * 0.7, -0.18], [0.001, -0.2],
    ], 12);
  }, [isMale]);

  const forearmGeo = useMemo(() => {
    const r = isMale ? 0.055 : 0.045;
    return createBodyProfile([
      [0.001, 0.18], [r * 0.8, 0.16], [r, 0.08], [r * 0.9, 0.0],
      [r * 0.7, -0.12], [r * 0.5, -0.17], [0.001, -0.18],
    ], 12);
  }, [isMale]);

  const handGeo = useMemo(() => new THREE.SphereGeometry(isMale ? 0.045 : 0.038, 12, 12), [isMale]);

  const thighGeo = useMemo(() => {
    const r = isMale ? 0.1 : 0.105;
    return createBodyProfile([
      [0.001, 0.25], [r * 0.85, 0.22], [r, 0.12], [r * 0.95, 0.0],
      [r * 0.8, -0.12], [r * 0.65, -0.22], [0.001, -0.25],
    ], 14);
  }, [isMale]);

  const calfGeo = useMemo(() => {
    const r = isMale ? 0.07 : 0.065;
    return createBodyProfile([
      [0.001, 0.22], [r * 0.75, 0.2], [r, 0.1], [r * 0.85, 0.0],
      [r * 0.65, -0.12], [r * 0.45, -0.2], [0.001, -0.22],
    ], 12);
  }, [isMale]);

  const footGeo = useMemo(() => new THREE.BoxGeometry(0.1, 0.06, 0.22), []);

  const poseData = POSES[pose];

  // Clothing overlay
  const garmentData = useMemo(() => {
    return clothing.map((item) => {
      const subtype = resolveSubtype(item.category, item.name);
      const fit: GarmentFit = item.fit || "regular";
      const fabric: FabricType = item.fabric || guessFabric(item.category, item.name);

      // Determine zone for wrinkle pattern
      let zone = "torso";
      if (isBottomCat(subtype) || isSkirtCat(subtype)) zone = "leg";
      else if (isShoeCat(subtype)) zone = "leg";

      const mat = item.imageUrl
        ? createTexturedMaterial(item.imageUrl, fabric, item.color || "gray", zone)
        : createFabricMaterial(item.color || "gray", fabric, zone);
      return { ...item, subtype, fit, fabric, mat };
    });
  }, [clothing]);

  return (
    <group ref={groupRef} scale={[heightScale, heightScale, heightScale]}>
      {/* Head */}
      <mesh geometry={headGeo} material={clayMaterial} position={[0, 1.18, 0]} />
      {/* Neck */}
      <mesh geometry={neckGeo} material={darkClayMaterial} position={[0, 0.95, 0]} />
      {/* Torso */}
      <group rotation={poseData.torso.map(v => v) as [number, number, number]}>
        <mesh geometry={torsoGeo} material={clayMaterial} position={[0, 0.45, 0]} />
      </group>

      {/* Left arm */}
      <group position={[-(isMale ? 0.28 : 0.24) * shoulderScale, 0.85, 0]}>
        <group rotation={poseData.leftUpperArm as [number, number, number]}>
          <mesh geometry={upperArmGeo} material={clayMaterial} position={[0, -0.22, 0]} />
          <group position={[0, -0.42, 0]}>
            <group rotation={poseData.leftForearm as [number, number, number]}>
              <mesh geometry={forearmGeo} material={clayMaterial} position={[0, -0.18, 0]} />
              <mesh geometry={handGeo} material={darkClayMaterial} position={[0, -0.38, 0]} />
            </group>
          </group>
        </group>
      </group>

      {/* Right arm */}
      <group position={[(isMale ? 0.28 : 0.24) * shoulderScale, 0.85, 0]}>
        <group rotation={poseData.rightUpperArm as [number, number, number]}>
          <mesh geometry={upperArmGeo} material={clayMaterial} position={[0, -0.22, 0]} />
          <group position={[0, -0.42, 0]}>
            <group rotation={poseData.rightForearm as [number, number, number]}>
              <mesh geometry={forearmGeo} material={clayMaterial} position={[0, -0.18, 0]} />
              <mesh geometry={handGeo} material={darkClayMaterial} position={[0, -0.38, 0]} />
            </group>
          </group>
        </group>
      </group>

      {/* Left leg */}
      <group position={[-0.1 * hipScale, -0.05, 0]}>
        <group rotation={poseData.leftThigh as [number, number, number]}>
          <mesh geometry={thighGeo} material={clayMaterial} position={[0, -0.3 * legScale, 0]} />
          <group position={[0, -0.55 * legScale, 0]}>
            <group rotation={poseData.leftCalf as [number, number, number]}>
              <mesh geometry={calfGeo} material={clayMaterial} position={[0, -0.22 * legScale, 0]} />
              <mesh geometry={footGeo} material={darkClayMaterial} position={[0, -0.46 * legScale, 0.05]} />
            </group>
          </group>
        </group>
      </group>

      {/* Right leg */}
      <group position={[0.1 * hipScale, -0.05, 0]}>
        <group rotation={poseData.rightThigh as [number, number, number]}>
          <mesh geometry={thighGeo} material={clayMaterial} position={[0, -0.3 * legScale, 0]} />
          <group position={[0, -0.55 * legScale, 0]}>
            <group rotation={poseData.rightCalf as [number, number, number]}>
              <mesh geometry={calfGeo} material={clayMaterial} position={[0, -0.22 * legScale, 0]} />
              <mesh geometry={footGeo} material={darkClayMaterial} position={[0, -0.46 * legScale, 0.05]} />
            </group>
          </group>
        </group>
      </group>

      {/* Stand */}
      <mesh material={darkClayMaterial} position={[0, -1.1 * legScale, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.15, 8]} />
      </mesh>
      <mesh material={clayMaterial} position={[0, -1.18 * legScale, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 0.04, 24]} />
      </mesh>

      {/* ====== CLOTHING ====== */}
      {garmentData.map((item, i) => {
        // --- TOPS ---
        if (isTopCat(item.subtype)) {
          const { torso, sleeves } = createTopGeometry(item.subtype, item.fit, shoulderScale, waistScale);
          return (
            <group key={`clothing-${i}`}>
              <mesh geometry={torso} material={item.mat} position={[0, 0.45, 0]} />
              {sleeves && (
                <>
                  <mesh geometry={sleeves.geo} material={item.mat}
                    position={[-(isMale ? 0.28 : 0.24) * shoulderScale, 0.82, 0]}
                    rotation={[0, 0, 0.2]} />
                  <mesh geometry={sleeves.geo} material={item.mat}
                    position={[(isMale ? 0.28 : 0.24) * shoulderScale, 0.82, 0]}
                    rotation={[0, 0, -0.2]} />
                </>
              )}
            </group>
          );
        }

        // --- BOTTOMS ---
        if (isBottomCat(item.subtype)) {
          const legGeo = createPantLegGeometry(item.subtype, item.fit, hipScale, legScale);
          const waistGeo = createWaistbandGeometry(hipScale, item.fit);
          return (
            <group key={`clothing-${i}`}>
              <mesh geometry={waistGeo} material={item.mat} position={[0, 0.0, 0]} />
              <mesh geometry={legGeo} material={item.mat} position={[-0.1 * hipScale, -0.35, 0]} />
              <mesh geometry={legGeo} material={item.mat} position={[0.1 * hipScale, -0.35, 0]} />
            </group>
          );
        }

        // --- SKIRTS ---
        if (isSkirtCat(item.subtype)) {
          const skirtGeo = createSkirtGeometry(item.subtype, item.fit, waistScale, hipScale);
          return (
            <group key={`clothing-${i}`}>
              <mesh geometry={skirtGeo} material={item.mat} position={[0, 0.0, 0]} />
            </group>
          );
        }

        // --- DRESSES ---
        if (isDressCat(item.subtype)) {
          const { body, sleeves } = createDressGeometry(item.subtype, item.fit, shoulderScale, waistScale, hipScale);
          return (
            <group key={`clothing-${i}`}>
              <mesh geometry={body} material={item.mat} position={[0, 0.45, 0]} />
              {sleeves && (
                <>
                  <mesh geometry={sleeves.geo} material={item.mat}
                    position={[-(isMale ? 0.28 : 0.24) * shoulderScale, 0.84, 0]}
                    rotation={[0, 0, 0.2]} />
                  <mesh geometry={sleeves.geo} material={item.mat}
                    position={[(isMale ? 0.28 : 0.24) * shoulderScale, 0.84, 0]}
                    rotation={[0, 0, -0.2]} />
                </>
              )}
            </group>
          );
        }

        // --- OUTERWEAR ---
        if (isOuterCat(item.subtype)) {
          const { torso, collar } = createOuterwearGeometry(item.subtype, item.fit, shoulderScale, waistScale, hipScale);
          return (
            <group key={`clothing-${i}`}>
              <mesh geometry={torso} material={item.mat} position={[0, 0.45, 0]} />
              {collar && <mesh geometry={collar} material={item.mat} position={[0, 0.96, 0]} />}
            </group>
          );
        }

        // --- SHOES ---
        if (isShoeCat(item.subtype)) {
          const shoeGeo = createShoeGeometry(item.subtype);
          return (
            <group key={`clothing-${i}`}>
              <mesh geometry={shoeGeo} material={item.mat} position={[-0.1 * hipScale, -0.95 * legScale, 0.03]} />
              <mesh geometry={shoeGeo} material={item.mat} position={[0.1 * hipScale, -0.95 * legScale, 0.03]} />
            </group>
          );
        }

        // --- HATS ---
        if (isHatCat(item.subtype)) {
          const { crown, brim } = createHatGeometry(item.subtype);
          return (
            <group key={`clothing-${i}`} position={[0, 1.32, 0]}>
              <mesh geometry={crown} material={item.mat} />
              {brim && (
                <mesh geometry={brim} material={item.mat}
                  position={[0, -0.02, 0.04]} rotation={[-Math.PI / 2, 0, 0]} />
              )}
            </group>
          );
        }

        return null;
      })}
    </group>
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
}: Mannequin3DProps) {
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

      <Canvas
        camera={{ position: [0, 0.3, 3.2], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.45} />
        <directionalLight position={[2, 4, 3]} intensity={0.7} castShadow />
        <directionalLight position={[-2, 3, -1]} intensity={0.35} />
        <pointLight position={[0, -1, 2]} intensity={0.2} />
        <SmoothBody gender={gender} dna={dna} pose={pose} clothing={clothing} />
        <OrbitControls
          enablePan={false} enableZoom={true}
          minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 1.3}
          minDistance={2} maxDistance={6}
        />
      </Canvas>
    </div>
  );
}

export type { ClothingItem, BodyDNA, PosePreset };
