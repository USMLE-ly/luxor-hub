import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations, ContactShadows, OrbitControls } from "@react-three/drei";
import { useRef, useEffect, Suspense } from "react";
import * as THREE from "three";

interface MannequinViewerProps {
  className?: string;
}

function Model() {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/mannequin.glb");
  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    // Stop all animations first
    Object.values(actions).forEach((a) => a?.stop());
    // Play the idle animation (standing pose)
    if (actions["idle"]) {
      actions["idle"].play();
    }
  }, [actions]);

  return <primitive ref={group} object={scene} />;
}

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

export function MannequinViewer({ className }: MannequinViewerProps) {
  return (
    <div className={`w-full h-full relative ${className || ""}`}>
      <Suspense fallback={<LoadingFallback />}>
        <Canvas shadows camera={{ position: [0, 1, 3.5], fov: 35 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[3, 5, 4]} intensity={0.8} castShadow />
          <directionalLight position={[-2, 3, -2]} intensity={0.3} />
          <pointLight position={[0, 3, 3]} intensity={0.2} color="#E8D5B7" />

          <Model />

          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.4}
            scale={3}
            blur={2.5}
            far={4}
          />

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 1.3}
            minDistance={2}
            maxDistance={6}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}

useGLTF.preload("/models/mannequin.glb");
