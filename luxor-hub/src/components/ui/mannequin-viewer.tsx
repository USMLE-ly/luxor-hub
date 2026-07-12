import React, { useState,
  createContext,
  useContext,
  useRef,
  useEffect,
  useMemo,
  Suspense,
  useCallback,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useGLTF,
  useAnimations,
  ContactShadows,
  OrbitControls,
} from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import {
  useWardrobeStore,
  useWardrobeHydrated,
  type Category,
} from "@/store/useWardrobeStore";

// ── Mannequin Context ──────────────────────────────────────
interface MannequinCtx {
  rootGroup: THREE.Group | null;
  skeleton: THREE.Skeleton | null;
  hipsBone: THREE.Bone | null;
}

const MannequinContext = createContext<MannequinCtx>({
  rootGroup: null,
  skeleton: null,
  hipsBone: null,
});

// ── Resolve Hips Bone ──────────────────────────────────────
function resolveHipsBone(skeleton: THREE.Skeleton): THREE.Bone {
  const targets = ["hips", "mixamorig:hips", "root", "pelvis"];
  for (const bone of skeleton.bones) {
    const name = bone.name.toLowerCase();
    if (targets.some((t) => name.includes(t))) return bone;
  }
  return skeleton.bones[0];
}

// ── Matte White Material Override ───────────────────────────
function applyMatteWhite(object: THREE.Object3D) {
  const matteMat = new THREE.MeshStandardMaterial({
    color: "#f2f2f2",
    roughness: 0.45,
    metalness: 0.05,
  });
  object.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      (child as THREE.Mesh).material = matteMat;
    }
  });
}

// ── Mannequin Model ────────────────────────────────────────
function MannequinModel() {
  const group = useRef<THREE.Group>(null);
  const gender = useWardrobeStore((s) => s.gender);
  const { scene, animations } = useGLTF(
    `/models/mannequin_${gender === "male" ? "m" : "f"}.glb`
  );
  const { actions } = useAnimations(animations, group);

  const [ctx, setCtx] = useState<MannequinCtx>({
    rootGroup: null,
    skeleton: null,
    hipsBone: null,
  });

  useEffect(() => {
    if (!group.current) return;

    // Clone scene to avoid mutating the cached GLTF
    const cloned = scene.clone(true);
    applyMatteWhite(cloned);
    group.current.add(cloned);

    // Find skeleton
    let skeleton: THREE.Skeleton | null = null;
    cloned.traverse((child) => {
      if ((child as THREE.SkinnedMesh).isSkinnedMesh && !skeleton) {
        skeleton = (child as THREE.SkinnedMesh).skeleton;
      }
    });

    const hipsBone = skeleton ? resolveHipsBone(skeleton) : null;

    setCtx({ rootGroup: group.current, skeleton, hipsBone });

    // Play idle
    Object.values(actions).forEach((a) => a?.stop());
    if (actions["idle"]) actions["idle"].play();

    return () => {
      // Cleanup cloned scene
      cloned.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          if (
            mesh.material &&
            typeof (mesh.material as THREE.Material).dispose === "function"
          ) {
            (mesh.material as THREE.Material).dispose();
          }
        }
      });
      group.current?.remove(cloned);
    };
  }, [scene, actions, gender]);

  return (
    <MannequinContext.Provider value={ctx}>
      <group ref={group} />
    </MannequinContext.Provider>
  );
}

// ── Clothing Layer ──────────────────────────────────────────
const BONE_REMAP: Record<string, string> = {
  mixamorig: "",
};

function ClothingSlot({ category, itemId }: { category: Category; itemId: string }) {
  const catalogItems = useWardrobeStore((s) => s.catalogItems);
  const item = catalogItems.find((i) => i.id === itemId);
  const { rootGroup, skeleton, hipsBone } = useContext(MannequinContext);

  const gltf = useLoader(GLTFLoader, item?.src || "");
  const clonedRef = useRef<THREE.Object3D | null>(null);

  useEffect(() => {
    if (!item || !rootGroup || !gltf) return;

    const cloned = gltf.scene.clone(true);
    clonedRef.current = cloned;

    // Check if clothing is skinned and compatible
    let isSkinned = false;
    cloned.traverse((child) => {
      if ((child as THREE.SkinnedMesh).isSkinnedMesh && skeleton && !isSkinned) {
        const mesh = child as THREE.SkinnedMesh;
        const clothBoneNames = new Set(
          mesh.skeleton.bones.map((b) => b.name.toLowerCase().replace("mixamorig:", ""))
        );
        const mannequinBoneNames = new Set(
          skeleton.bones.map((b) => b.name.toLowerCase().replace("mixamorig:", ""))
        );
        let overlap = 0;
        clothBoneNames.forEach((name) => {
          if (mannequinBoneNames.has(name)) overlap++;
        });
        const ratio = clothBoneNames.size > 0 ? overlap / clothBoneNames.size : 0;

        if (ratio >= 0.6) {
          // Skinned path: reassign skeleton
          mesh.skeleton = skeleton;
          mesh.bind(skeleton);
          isSkinned = true;
        }
      }
    });

    if (!isSkinned && hipsBone) {
      // Static-fitted path: center on hips using Box3
      hipsBone.add(cloned);
      cloned.position.set(0, 0, 0);
      cloned.rotation.set(0, 0, 0);
      cloned.scale.set(1, 1, 1);

      const box = new THREE.Box3().setFromObject(cloned);
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      box.getCenter(center);
      box.getSize(size);

      // Center X/Z, level Y to hips
      cloned.position.x -= center.x;
      cloned.position.z -= center.z;
      cloned.position.y -= center.y;
    } else if (isSkinned) {
      rootGroup.add(cloned);
    }

    return () => {
      // Cleanup
      if (clonedRef.current) {
        const obj = clonedRef.current;
        obj.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.geometry) mesh.geometry.dispose();
            if (
              mesh.material &&
              typeof (mesh.material as THREE.Material).dispose === "function"
            ) {
              // Only dispose if it's a clone, not the original cached material
              if (
                (mesh.material as THREE.Material).uuid !==
                (gltf.scene.children[0] as THREE.Mesh)?.material?.uuid
              ) {
                (mesh.material as THREE.Material).dispose();
              }
            }
          }
        });
        obj.parent?.remove(obj);
        clonedRef.current = null;
      }
    };
  }, [item, rootGroup, skeleton, hipsBone, gltf]);

  return null;
}

function ClothingLayer() {
  const selected = useWardrobeStore((s) => s.selected);
  const entries = Object.entries(selected).filter(
    ([, v]) => v !== null
  ) as [Category, string][];

  return (
    <>
      {entries.map(([cat, id]) => (
        <Suspense key={`${cat}-${id}`} fallback={null}>
          <ClothingSlot category={cat} itemId={id} />
        </Suspense>
      ))}
    </>
  );
}

// ── Error Boundary ──────────────────────────────────────────
class MannequinErrorBoundary extends React.Component<
  { children: React.ReactNode; gender: string },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-30">
          <div className="text-center p-6">
            <p className="text-sm font-sans text-muted-foreground mb-2">
              Mannequin model not found.
            </p>
            <p className="text-xs font-sans text-muted-foreground/60">
              Upload mannequin_{this.props.gender === "male" ? "m" : "f"}.glb to
              public/models/
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Loading Fallback ────────────────────────────────────────
function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

// ── Main Export ─────────────────────────────────────────────
export function MannequinViewer({ className }: { className?: string }) {
  const gender = useWardrobeStore((s) => s.gender);
  const hydrated = useWardrobeHydrated();

  if (!hydrated) return <LoadingFallback />;

  return (
    <div className={`w-full h-full relative ${className || ""}`}>
      <MannequinErrorBoundary gender={gender}>
        <Suspense fallback={<LoadingFallback />}>
          <Canvas shadows camera={{ position: [0, 1.1, 3.2], fov: 32 }}>
            <ambientLight intensity={0.5} />
            <directionalLight
              position={[3, 5, 4]}
              intensity={0.8}
              castShadow
            />
            <directionalLight position={[-2, 3, -2]} intensity={0.3} />
            <pointLight
              position={[0, 3, 3]}
              intensity={0.2}
              color="#E8D5B7"
            />

            <MannequinModel />
            <ClothingLayer />

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
      </MannequinErrorBoundary>
    </div>
  );
}

// Preload both gender models
useGLTF.preload("/models/mannequin_m.glb");
useGLTF.preload("/models/mannequin_f.glb");
