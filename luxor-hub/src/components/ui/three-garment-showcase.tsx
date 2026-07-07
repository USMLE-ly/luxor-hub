import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial, Environment, ContactShadows, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

/* ── Stylized Garment Geometry ── */
function GarmentMesh() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Create an elegant draped fabric shape using a custom geometry
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    // Create an asymmetric fashion silhouette
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.3, 0.2, 0.5, -0.1, 0.8, 0.3);
    shape.bezierCurveTo(1.0, 0.5, 1.2, 0.8, 1.0, 1.2);
    shape.bezierCurveTo(0.8, 1.5, 0.5, 1.8, 0.2, 1.6);
    shape.bezierCurveTo(-0.1, 1.4, -0.3, 1.0, 0, 0.6);
    shape.bezierCurveTo(0.1, 0.4, -0.1, 0.1, 0, 0);

    const settings: THREE.ExtrudeGeometryOptions = {
      steps: 32,
      depth: 0.15,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.03,
      bevelSegments: 12,
    };

    const geo = new THREE.ExtrudeGeometry(shape, settings);
    geo.center();
    return geo;
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating rotation
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.2;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[0.2, 0, 0]} scale={1.8}>
      <MeshTransmissionMaterial
        backside
        thickness={0.5}
        roughness={0.05}
        metalness={0.1}
        clearcoat={0.8}
        clearcoatRoughness={0.2}
        transmission={0.6}
        ior={1.5}
        chromaticAberration={0.02}
        color="#C9A96E"
        envMapIntensity={2}
      />
    </mesh>
  );
}

/* ── Secondary Floating Rings ── */
function FloatingRings() {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      ringRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.15) * 0.1;
    }
  });

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.5]}>
      <ringGeometry args={[1.8, 2, 64]} />
      <meshBasicMaterial color="#C9A96E" transparent opacity={0.15} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ── Gold Dust Particles ── */
function GoldParticles3D({ count = 50 }) {
  const points = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
      sizes[i] = Math.random() * 0.05 + 0.01;
    }
    return { positions, sizes };
  }, [count]);

  const ref = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.02;
      const positions = ref.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] += Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.001;
      }
      ref.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={points.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={points.sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#C9A96E"
        transparent
        opacity={0.4}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ── Scene ── */
function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} color="#C9A96E" />
      <directionalLight position={[-3, 2, -2]} intensity={0.5} color="#1D3937" />
      <pointLight position={[0, 3, 2]} intensity={0.8} color="#E8D5A3" />

      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
        <GarmentMesh />
      </Float>

      <FloatingRings />
      <GoldParticles3D count={60} />

      <ContactShadows
        position={[0, -1.5, 0]}
        opacity={0.3}
        scale={5}
        blur={2.5}
        far={2}
      />

      <Environment preset="city" />
    </>
  );
}

/* ── Main Export ── */
export function ThreeGarmentShowcase({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 40, near: 0.1, far: 10 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
        dpr={[1, 2]}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
