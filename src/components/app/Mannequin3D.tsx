import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface ClothingItem {
  category: string;
  color: string;
  name: string;
  imageUrl?: string;
}

interface MannequinBodyProps {
  gender: "male" | "female";
  clothing: ClothingItem[];
}

const woodMaterial = new THREE.MeshStandardMaterial({
  color: "#C4953A",
  roughness: 0.65,
  metalness: 0.05,
});

const jointMaterial = new THREE.MeshStandardMaterial({
  color: "#A07828",
  roughness: 0.5,
  metalness: 0.1,
});

function getClothingColor(item: ClothingItem): string {
  const colorMap: Record<string, string> = {
    black: "#1a1a1a", white: "#f0f0f0", navy: "#1e3a5f", blue: "#3b5998",
    red: "#c0392b", green: "#27ae60", brown: "#8B6914", beige: "#d4b896",
    gray: "#7f8c8d", cream: "#f5f0e1", olive: "#556b2f", burgundy: "#800020",
  };
  const lower = (item.color || "").toLowerCase();
  return colorMap[lower] || "#6b7b8d";
}

function ClothingOverlay({ category, color }: { category: string; color: string }) {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color,
    roughness: 0.8,
    metalness: 0,
    transparent: true,
    opacity: 0.85,
  }), [color]);

  switch (category.toLowerCase()) {
    case "tops":
    case "shirt":
    case "t-shirt":
    case "tshirt":
      return (
        <group>
          <mesh position={[0, 0.6, 0]} material={mat}>
            <capsuleGeometry args={[0.42, 0.7, 8, 16]} />
          </mesh>
          {/* Sleeves */}
          <mesh position={[-0.62, 0.75, 0]} rotation={[0, 0, Math.PI / 6]} material={mat}>
            <capsuleGeometry args={[0.13, 0.35, 6, 12]} />
          </mesh>
          <mesh position={[0.62, 0.75, 0]} rotation={[0, 0, -Math.PI / 6]} material={mat}>
            <capsuleGeometry args={[0.13, 0.35, 6, 12]} />
          </mesh>
        </group>
      );
    case "bottoms":
    case "trousers":
    case "jeans":
    case "pants":
      return (
        <group>
          <mesh position={[-0.18, -0.7, 0]} material={mat}>
            <capsuleGeometry args={[0.14, 0.65, 6, 12]} />
          </mesh>
          <mesh position={[0.18, -0.7, 0]} material={mat}>
            <capsuleGeometry args={[0.14, 0.65, 6, 12]} />
          </mesh>
          <mesh position={[0, -0.2, 0]} material={mat}>
            <capsuleGeometry args={[0.32, 0.2, 6, 12]} />
          </mesh>
        </group>
      );
    case "outerwear":
    case "coat":
    case "jacket":
      return (
        <group>
          <mesh position={[0, 0.6, 0]} material={mat}>
            <capsuleGeometry args={[0.46, 0.85, 8, 16]} />
          </mesh>
          <mesh position={[-0.65, 0.7, 0]} rotation={[0, 0, Math.PI / 7]} material={mat}>
            <capsuleGeometry args={[0.15, 0.5, 6, 12]} />
          </mesh>
          <mesh position={[0.65, 0.7, 0]} rotation={[0, 0, -Math.PI / 7]} material={mat}>
            <capsuleGeometry args={[0.15, 0.5, 6, 12]} />
          </mesh>
        </group>
      );
    case "shoes":
    case "footwear":
      return (
        <group>
          <mesh position={[-0.18, -1.35, 0.08]} material={mat}>
            <boxGeometry args={[0.18, 0.1, 0.3]} />
          </mesh>
          <mesh position={[0.18, -1.35, 0.08]} material={mat}>
            <boxGeometry args={[0.18, 0.1, 0.3]} />
          </mesh>
        </group>
      );
    default:
      return null;
  }
}

function MannequinBody({ gender, clothing }: MannequinBodyProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  const isMale = gender === "male";
  const shoulderW = isMale ? 0.4 : 0.35;
  const hipW = isMale ? 0.3 : 0.35;
  const torsoH = isMale ? 0.65 : 0.55;

  return (
    <group ref={groupRef} position={[0, -0.2, 0]}>
      {/* Head */}
      <mesh position={[0, 1.55, 0]} material={woodMaterial}>
        <sphereGeometry args={[0.22, 16, 16]} />
      </mesh>
      
      {/* Neck */}
      <mesh position={[0, 1.28, 0]} material={jointMaterial}>
        <cylinderGeometry args={[0.06, 0.08, 0.12, 12]} />
      </mesh>

      {/* Torso */}
      <mesh position={[0, 0.65, 0]} material={woodMaterial}>
        <capsuleGeometry args={[shoulderW, torsoH, 8, 16]} />
      </mesh>

      {/* Shoulder joints */}
      <mesh position={[-0.5, 1.0, 0]} material={jointMaterial}>
        <sphereGeometry args={[0.07, 12, 12]} />
      </mesh>
      <mesh position={[0.5, 1.0, 0]} material={jointMaterial}>
        <sphereGeometry args={[0.07, 12, 12]} />
      </mesh>

      {/* Upper arms */}
      <mesh position={[-0.58, 0.72, 0]} rotation={[0, 0, Math.PI / 14]} material={woodMaterial}>
        <capsuleGeometry args={[0.08, 0.35, 6, 12]} />
      </mesh>
      <mesh position={[0.58, 0.72, 0]} rotation={[0, 0, -Math.PI / 14]} material={woodMaterial}>
        <capsuleGeometry args={[0.08, 0.35, 6, 12]} />
      </mesh>

      {/* Elbow joints */}
      <mesh position={[-0.62, 0.45, 0]} material={jointMaterial}>
        <sphereGeometry args={[0.06, 12, 12]} />
      </mesh>
      <mesh position={[0.62, 0.45, 0]} material={jointMaterial}>
        <sphereGeometry args={[0.06, 12, 12]} />
      </mesh>

      {/* Forearms */}
      <mesh position={[-0.65, 0.2, 0]} material={woodMaterial}>
        <capsuleGeometry args={[0.065, 0.3, 6, 12]} />
      </mesh>
      <mesh position={[0.65, 0.2, 0]} material={woodMaterial}>
        <capsuleGeometry args={[0.065, 0.3, 6, 12]} />
      </mesh>

      {/* Hands */}
      <mesh position={[-0.67, -0.02, 0]} material={woodMaterial}>
        <sphereGeometry args={[0.06, 10, 10]} />
      </mesh>
      <mesh position={[0.67, -0.02, 0]} material={woodMaterial}>
        <sphereGeometry args={[0.06, 10, 10]} />
      </mesh>

      {/* Hips / Pelvis */}
      <mesh position={[0, -0.05, 0]} material={woodMaterial}>
        <capsuleGeometry args={[hipW, 0.2, 8, 16]} />
      </mesh>

      {/* Hip joint */}
      <mesh position={[0, 0.15, 0]} material={jointMaterial}>
        <cylinderGeometry args={[0.12, 0.15, 0.08, 12]} />
      </mesh>

      {/* Upper legs */}
      <mesh position={[-0.18, -0.5, 0]} material={woodMaterial}>
        <capsuleGeometry args={[0.1, 0.4, 6, 12]} />
      </mesh>
      <mesh position={[0.18, -0.5, 0]} material={woodMaterial}>
        <capsuleGeometry args={[0.1, 0.4, 6, 12]} />
      </mesh>

      {/* Knee joints */}
      <mesh position={[-0.18, -0.82, 0]} material={jointMaterial}>
        <sphereGeometry args={[0.065, 12, 12]} />
      </mesh>
      <mesh position={[0.18, -0.82, 0]} material={jointMaterial}>
        <sphereGeometry args={[0.065, 12, 12]} />
      </mesh>

      {/* Lower legs */}
      <mesh position={[-0.18, -1.1, 0]} material={woodMaterial}>
        <capsuleGeometry args={[0.075, 0.35, 6, 12]} />
      </mesh>
      <mesh position={[0.18, -1.1, 0]} material={woodMaterial}>
        <capsuleGeometry args={[0.075, 0.35, 6, 12]} />
      </mesh>

      {/* Feet */}
      <mesh position={[-0.18, -1.38, 0.06]} material={woodMaterial}>
        <boxGeometry args={[0.14, 0.08, 0.25]} />
      </mesh>
      <mesh position={[0.18, -1.38, 0.06]} material={woodMaterial}>
        <boxGeometry args={[0.14, 0.08, 0.25]} />
      </mesh>

      {/* Stand base */}
      <mesh position={[0, -1.5, 0]} material={jointMaterial}>
        <cylinderGeometry args={[0.02, 0.02, 0.12, 8]} />
      </mesh>
      <mesh position={[0, -1.58, 0]} material={woodMaterial}>
        <cylinderGeometry args={[0.35, 0.4, 0.06, 24]} />
      </mesh>

      {/* Clothing overlays */}
      {clothing.map((item, i) => (
        <ClothingOverlay
          key={`${item.category}-${i}`}
          category={item.category}
          color={getClothingColor(item)}
        />
      ))}
    </group>
  );
}

interface Mannequin3DProps {
  gender?: "male" | "female";
  clothing?: ClothingItem[];
  autoRotate?: boolean;
  className?: string;
}

export default function Mannequin3D({
  gender = "male",
  clothing = [],
  className = "",
}: Mannequin3DProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0.5, 3.5], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 3]} intensity={0.8} />
        <directionalLight position={[-3, 3, -2]} intensity={0.3} />
        <pointLight position={[0, 3, 0]} intensity={0.3} />
        <MannequinBody gender={gender} clothing={clothing} />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
}

export type { ClothingItem };
