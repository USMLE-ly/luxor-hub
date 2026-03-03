import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface ClothingItem {
  category: string;
  color: string;
  name: string;
  imageUrl?: string;
}

interface BodyDNA {
  height: number;      // 0-1 scale
  shoulder: number;    // 0-1
  waist: number;       // 0-1
  hips: number;        // 0-1
  legLength: number;   // 0-1
}

type PosePreset = "neutral" | "fashion" | "walking";

const DEFAULT_DNA: BodyDNA = { height: 0.5, shoulder: 0.5, waist: 0.5, hips: 0.5, legLength: 0.5 };

// --- Materials ---
const clayMaterial = new THREE.MeshStandardMaterial({
  color: "#D4B896",
  roughness: 0.92,
  metalness: 0,
});

const darkClayMaterial = new THREE.MeshStandardMaterial({
  color: "#C4A882",
  roughness: 0.88,
  metalness: 0,
});

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
    leftUpperArm: [0, 0, 0.15],
    rightUpperArm: [0, 0, -0.15],
    leftForearm: [0, 0, 0],
    rightForearm: [0, 0, 0],
    leftThigh: [0, 0, 0],
    rightThigh: [0, 0, 0],
    leftCalf: [0, 0, 0],
    rightCalf: [0, 0, 0],
    torso: [0, 0, 0],
  },
  fashion: {
    leftUpperArm: [0, 0, 0.4],
    rightUpperArm: [0.2, 0, -0.6],
    leftForearm: [-0.3, 0, 0.1],
    rightForearm: [-0.8, 0, -0.2],
    leftThigh: [0, 0, 0],
    rightThigh: [-0.15, 0, 0],
    leftCalf: [0, 0, 0],
    rightCalf: [0.2, 0, 0],
    torso: [0, 0.05, 0],
  },
  walking: {
    leftUpperArm: [0.3, 0, 0.15],
    rightUpperArm: [-0.3, 0, -0.15],
    leftForearm: [-0.2, 0, 0],
    rightForearm: [-0.2, 0, 0],
    leftThigh: [-0.25, 0, 0],
    rightThigh: [0.25, 0, 0],
    leftCalf: [0.15, 0, 0],
    rightCalf: [0, 0, 0],
    torso: [0, 0, 0],
  },
};

// --- Smooth Anatomical Body ---
function SmoothBody({
  gender,
  dna,
  pose,
  clothing,
}: {
  gender: "male" | "female";
  dna: BodyDNA;
  pose: PosePreset;
  clothing: ClothingItem[];
}) {
  const groupRef = useRef<THREE.Group>(null);
  const isMale = gender === "male";

  // DNA-based scaling
  const heightScale = 0.85 + dna.height * 0.3;
  const shoulderScale = 0.8 + dna.shoulder * 0.4;
  const waistScale = 0.75 + dna.waist * 0.5;
  const hipScale = 0.8 + dna.hips * 0.4;
  const legScale = 0.9 + dna.legLength * 0.2;

  // Torso profile
  const torsoGeo = useMemo(() => {
    const shoulderR = (isMale ? 0.24 : 0.21) * shoulderScale;
    const waistR = (isMale ? 0.18 : 0.15) * waistScale;
    const hipR = (isMale ? 0.19 : 0.23) * hipScale;
    const chestR = isMale ? 0.22 : 0.20;
    return createBodyProfile([
      [0.001, 0.55],     // top neck
      [0.08, 0.52],      // neck base
      [shoulderR, 0.45], // shoulders
      [chestR * shoulderScale, 0.35], // chest
      [waistR, 0.15],    // waist
      [hipR, 0.0],       // hips
      [hipR * 0.95, -0.05], // hip bottom
      [0.001, -0.08],    // crotch
    ], 24);
  }, [isMale, shoulderScale, waistScale, hipScale]);

  // Head
  const headGeo = useMemo(() => {
    return createBodyProfile([
      [0.001, 0.22],
      [0.08, 0.21],
      [0.12, 0.18],
      [0.135, 0.12],
      [0.14, 0.05],
      [0.135, -0.02],
      [0.12, -0.08],
      [0.10, -0.12],
      [0.08, -0.14],
      [0.001, -0.15],
    ], 20);
  }, []);

  // Neck
  const neckGeo = useMemo(() => {
    return createBodyProfile([
      [0.001, 0.08],
      [0.055, 0.06],
      [0.06, 0.0],
      [0.065, -0.06],
      [0.001, -0.08],
    ], 16);
  }, []);

  // Upper arm
  const upperArmGeo = useMemo(() => {
    const r = isMale ? 0.065 : 0.055;
    return createBodyProfile([
      [0.001, 0.2],
      [r * 0.7, 0.18],
      [r, 0.1],
      [r * 0.95, 0.0],
      [r * 0.85, -0.1],
      [r * 0.7, -0.18],
      [0.001, -0.2],
    ], 12);
  }, [isMale]);

  // Forearm
  const forearmGeo = useMemo(() => {
    const r = isMale ? 0.055 : 0.045;
    return createBodyProfile([
      [0.001, 0.18],
      [r * 0.8, 0.16],
      [r, 0.08],
      [r * 0.9, 0.0],
      [r * 0.7, -0.12],
      [r * 0.5, -0.17],
      [0.001, -0.18],
    ], 12);
  }, [isMale]);

  // Hand
  const handGeo = useMemo(() => {
    return new THREE.SphereGeometry(isMale ? 0.045 : 0.038, 12, 12);
  }, [isMale]);

  // Thigh
  const thighGeo = useMemo(() => {
    const r = isMale ? 0.1 : 0.105;
    return createBodyProfile([
      [0.001, 0.25],
      [r * 0.85, 0.22],
      [r, 0.12],
      [r * 0.95, 0.0],
      [r * 0.8, -0.12],
      [r * 0.65, -0.22],
      [0.001, -0.25],
    ], 14);
  }, [isMale]);

  // Calf
  const calfGeo = useMemo(() => {
    const r = isMale ? 0.07 : 0.065;
    return createBodyProfile([
      [0.001, 0.22],
      [r * 0.75, 0.2],
      [r, 0.1],
      [r * 0.85, 0.0],
      [r * 0.65, -0.12],
      [r * 0.45, -0.2],
      [0.001, -0.22],
    ], 12);
  }, [isMale]);

  // Foot
  const footGeo = useMemo(() => {
    return new THREE.BoxGeometry(0.1, 0.06, 0.22);
  }, []);

  const poseData = POSES[pose];

  // Clothing overlay helper
  const clothingOverlays = useMemo(() => {
    return clothing.map((item) => {
      const colorMap: Record<string, string> = {
        black: "#1a1a1a", white: "#f0f0f0", navy: "#1e3a5f", blue: "#3b5998",
        red: "#c0392b", green: "#27ae60", brown: "#8B6914", beige: "#d4b896",
        gray: "#7f8c8d", cream: "#f5f0e1", olive: "#556b2f", burgundy: "#800020",
      };
      const color = colorMap[(item.color || "").toLowerCase()] || "#6b7b8d";
      return { ...item, resolvedColor: color };
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

      {/* Clothing overlays */}
      {clothingOverlays.map((item, i) => {
        const mat = new THREE.MeshStandardMaterial({
          color: item.resolvedColor,
          roughness: 0.85,
          metalness: 0,
          transparent: true,
          opacity: 0.82,
        });
        const cat = item.category.toLowerCase();
        if (["tops", "shirt", "t-shirt", "tshirt", "top"].includes(cat)) {
          return (
            <group key={`clothing-${i}`}>
              <mesh position={[0, 0.45, 0]} material={mat}>
                <capsuleGeometry args={[0.25 * shoulderScale, 0.5, 12, 16]} />
              </mesh>
            </group>
          );
        }
        if (["bottoms", "trousers", "jeans", "pants", "bottom"].includes(cat)) {
          return (
            <group key={`clothing-${i}`}>
              <mesh position={[-0.1, -0.3, 0]} material={mat}>
                <capsuleGeometry args={[0.08, 0.45 * legScale, 8, 12]} />
              </mesh>
              <mesh position={[0.1, -0.3, 0]} material={mat}>
                <capsuleGeometry args={[0.08, 0.45 * legScale, 8, 12]} />
              </mesh>
            </group>
          );
        }
        if (["outerwear", "coat", "jacket"].includes(cat)) {
          return (
            <group key={`clothing-${i}`}>
              <mesh position={[0, 0.45, 0]} material={mat}>
                <capsuleGeometry args={[0.28 * shoulderScale, 0.6, 12, 16]} />
              </mesh>
            </group>
          );
        }
        if (["shoes", "footwear"].includes(cat)) {
          return (
            <group key={`clothing-${i}`}>
              <mesh position={[-0.1, -0.95 * legScale, 0.05]} material={mat}>
                <boxGeometry args={[0.12, 0.08, 0.24]} />
              </mesh>
              <mesh position={[0.1, -0.95 * legScale, 0.05]} material={mat}>
                <boxGeometry args={[0.12, 0.08, 0.24]} />
              </mesh>
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

  // Measurement values in cm (approximate)
  const measurements = {
    shoulder: Math.round((isMale ? 46 : 40) * shoulderScale),
    waist: Math.round((isMale ? 82 : 68) * waistScale),
    hips: Math.round((isMale ? 96 : 100) * hipScale),
    inseam: Math.round((isMale ? 82 : 76) * (0.9 + dna.legLength * 0.2)),
  };

  return (
    <div className={`w-full h-full relative ${className}`}>
      {/* Tracing image overlay */}
      {tracingImageUrl && (
        <img
          src={tracingImageUrl}
          alt="Tracing reference"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
          style={{ opacity: tracingOpacity }}
        />
      )}

      {/* Measurement overlays */}
      {showMeasurements && (
        <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
          <div className="relative" style={{ width: "60%", height: "80%" }}>
            {/* Shoulder line */}
            <div className="absolute flex items-center gap-1" style={{ top: "18%", left: "10%", right: "10%" }}>
              <div className="flex-1 border-t-2 border-dashed border-primary/60" />
              <span className="text-[10px] font-mono bg-background/80 text-primary px-1.5 py-0.5 rounded whitespace-nowrap">
                {measurements.shoulder} cm
              </span>
              <div className="flex-1 border-t-2 border-dashed border-primary/60" />
            </div>
            {/* Waist line */}
            <div className="absolute flex items-center gap-1" style={{ top: "42%", left: "18%", right: "18%" }}>
              <div className="flex-1 border-t-2 border-dashed border-[hsl(45,80%,55%)]/60" />
              <span className="text-[10px] font-mono bg-background/80 text-[hsl(45,80%,55%)] px-1.5 py-0.5 rounded whitespace-nowrap">
                {measurements.waist} cm
              </span>
              <div className="flex-1 border-t-2 border-dashed border-[hsl(45,80%,55%)]/60" />
            </div>
            {/* Hip line */}
            <div className="absolute flex items-center gap-1" style={{ top: "52%", left: "14%", right: "14%" }}>
              <div className="flex-1 border-t-2 border-dashed border-[hsl(270,40%,65%)]/60" />
              <span className="text-[10px] font-mono bg-background/80 text-[hsl(270,40%,65%)] px-1.5 py-0.5 rounded whitespace-nowrap">
                {measurements.hips} cm
              </span>
              <div className="flex-1 border-t-2 border-dashed border-[hsl(270,40%,65%)]/60" />
            </div>
            {/* Inseam line */}
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
        {/* Studio 3-point lighting */}
        <ambientLight intensity={0.45} />
        <directionalLight position={[2, 4, 3]} intensity={0.7} castShadow />
        <directionalLight position={[-2, 3, -1]} intensity={0.35} />
        <pointLight position={[0, -1, 2]} intensity={0.2} />
        <SmoothBody gender={gender} dna={dna} pose={pose} clothing={clothing} />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 1.3}
          minDistance={2}
          maxDistance={6}
        />
      </Canvas>
    </div>
  );
}

export type { ClothingItem, BodyDNA, PosePreset };
