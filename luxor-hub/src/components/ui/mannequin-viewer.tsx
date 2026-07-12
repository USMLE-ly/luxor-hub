import React, {
  useState,
  createContext,
  useContext,
  useRef,
  useEffect,
  useMemo,
  Suspense,
} from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, ContactShadows, OrbitControls } from "@react-three/drei";
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
  mannequinHeight: number;
}

const MannequinContext = createContext<MannequinCtx>({
  rootGroup: null,
  skeleton: null,
  hipsBone: null,
  mannequinHeight: 1.8,
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
const MATTE_WHITE = new THREE.MeshStandardMaterial({
  color: "#f2f2f2",
  roughness: 0.45,
  metalness: 0.05,
});

function applyMatteWhite(object: THREE.Object3D) {
  object.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      (child as THREE.Mesh).material = MATTE_WHITE;
    }
  });
}

// ── Mannequin Model ────────────────────────────────────────
function MannequinModel() {
  const group = useRef<THREE.Group>(null);
  const gender = useWardrobeStore((s) => s.gender);
  const { scene } = useGLTF(
    `/models/mannequin_${gender === "male" ? "m" : "f"}.glb`
  );

  const [ctx, setCtx] = useState<MannequinCtx>({
    rootGroup: null,
    skeleton: null,
    hipsBone: null,
    mannequinHeight: 1.8,
  });

  useEffect(() => {
    if (!group.current) return;

    // Clone to avoid mutating the cache
    const cloned = scene.clone(true);
    applyMatteWhite(cloned);

    // Compute bounding box to center the model at origin
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    // Shift model so feet are at y=0 and centered on x/z
    cloned.position.set(-center.x, -box.min.y, -center.z);

    group.current.add(cloned);

    // Find skeleton
    let skeleton: THREE.Skeleton | null = null;
    cloned.traverse((child) => {
      if ((child as THREE.SkinnedMesh).isSkinnedMesh && !skeleton) {
        skeleton = (child as THREE.SkinnedMesh).skeleton;
      }
    });

    const hipsBone = skeleton ? resolveHipsBone(skeleton) : null;
    const mannequinHeight = size.y || 1.8;

    setCtx({ rootGroup: group.current, skeleton, hipsBone, mannequinHeight });

    return () => {
      cloned.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          const mat = mesh.material as THREE.Material;
          if (mat && mat !== MATTE_WHITE && typeof mat.dispose === "function") {
            mat.dispose();
          }
        }
      });
      group.current?.remove(cloned);
    };
  }, [scene, gender]);

  return (
    <MannequinContext.Provider value={ctx}>
      <group ref={group} />
    </MannequinContext.Provider>
  );
}

// ── Single Clothing Slot ───────────────────────────────────
// Each slot gets its own component so useGLTF is called unconditionally
// (no hooks inside conditionals or try/catch)
function SingleClothingSlot({
  src,
  category,
  itemKey,
}: {
  src: string;
  category: Category;
  itemKey: string;
}) {
  const { rootGroup, skeleton, hipsBone, mannequinHeight } =
    useContext(MannequinContext);
  const loadedKeyRef = useRef<string | null>(null);

  // useGLTF is always called — no try/catch, no conditional
  const { scene: clothScene } = useGLTF(src);

  useEffect(() => {
    if (!clothScene || !rootGroup) return;

    // Skip if already loaded this exact item
    if (loadedKeyRef.current === itemKey) return;
    loadedKeyRef.current = itemKey;

    const cloned = clothScene.clone(true);

    // ── Try skinned path ──
    let isSkinned = false;
    if (skeleton) {
      cloned.traverse((child) => {
        if ((child as THREE.SkinnedMesh).isSkinnedMesh && !isSkinned) {
          const mesh = child as THREE.SkinnedMesh;
          if (mesh.skeleton?.bones) {
            const clothBoneNames = new Set(
              mesh.skeleton.bones.map((b) =>
                b.name.toLowerCase().replace("mixamorig:", "")
              )
            );
            const mannequinBoneNames = new Set(
              skeleton.bones.map((b) =>
                b.name.toLowerCase().replace("mixamorig:", "")
              )
            );

            let overlap = 0;
            for (const bn of clothBoneNames) {
              if (mannequinBoneNames.has(bn)) overlap++;
            }

            const ratio =
              clothBoneNames.size > 0 ? overlap / clothBoneNames.size : 0;

            if (ratio >= 0.6) {
              mesh.skeleton = skeleton;
              mesh.bind(skeleton);
              isSkinned = true;
            }
          }
        }
      });
    }

    if (isSkinned) {
      rootGroup.add(cloned);
    } else if (hipsBone) {
      // ── Static-fitted path ──
      hipsBone.add(cloned);
      cloned.position.set(0, 0, 0);
      cloned.rotation.set(0, 0, 0);
      cloned.scale.set(1, 1, 1);

      // Compute bounding box AFTER adding to scene graph
      const box = new THREE.Box3().setFromObject(cloned);
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      box.getCenter(center);
      box.getSize(size);

      // Center X/Z on the hips pivot
      cloned.position.x -= center.x;
      cloned.position.z -= center.z;
      // Level Y so the visual center of the clothing sits at hips
      cloned.position.y -= center.y;

      // Auto-scale clothing to fit the mannequin
      const torsoHeight = mannequinHeight * 0.35;
      if (size.y > 0) {
        const targetHeight =
          category === "top"
            ? torsoHeight
            : category === "bottom"
              ? mannequinHeight * 0.45
              : torsoHeight * 0.5;

        const scaleFactor = targetHeight / size.y;
        // Only scale if clothing is way off (0.1x to 10x)
        if (scaleFactor > 0.1 && scaleFactor < 10) {
          cloned.scale.setScalar(scaleFactor);
        }
      }
    }

    return () => {
      cloned.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          const mat = mesh.material as THREE.Material;
          if (mat && typeof mat.dispose === "function") mat.dispose();
        }
      });
      cloned.parent?.remove(cloned);
    };
  }, [clothScene, rootGroup, hipsBone, skeleton, mannequinHeight, itemKey, category]);

  return null;
}

// ── Clothing Layer ──────────────────────────────────────────
function ClothingLayer() {
  const selected = useWardrobeStore((s) => s.selected);
  const catalogItems = useWardrobeStore((s) => s.catalogItems);

  const activeSlots = useMemo(() => {
    return Object.entries(selected)
      .filter(([, v]) => v !== null)
      .map(([cat, id]) => {
        const item = catalogItems.find((i) => i.id === id);
        return {
          category: cat as Category,
          itemId: id as string,
          src: item?.src ?? null,
        };
      })
      .filter((s) => s.src !== null);
  }, [selected, catalogItems]);

  return (
    <>
      {activeSlots.map(({ category, itemId, src }) => (
        <SingleClothingSlot
          key={`${category}-${itemId}`}
          src={src!}
          category={category}
          itemKey={`${category}-${itemId}`}
        />
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
              Upload mannequin_{this.props.gender === "male" ? "m" : "f"}.glb
              to public/models/
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
              position={[0, 0, 0]}
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
if (typeof window !== "undefined") {
  useGLTF.preload("/models/mannequin_m.glb");
  useGLTF.preload("/models/mannequin_f.glb");
}
