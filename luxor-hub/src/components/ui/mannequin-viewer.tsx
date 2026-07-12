import React, {
  useState,
  createContext,
  useContext,
  useRef,
  useEffect,
  useMemo,
  Suspense,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
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

// ── Matte White Material ───────────────────────────────────
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

  // Every frame, enforce ground contact — prevents floating
  useFrame(() => {
    if (group.current && group.current.position.y !== 0) {
      group.current.position.y = 0;
    }
  });

  useEffect(() => {
    if (!group.current) return;

    // Clone to avoid mutating the cache
    const cloned = scene.clone(true);
    applyMatteWhite(cloned);

    // Force ALL bones to identity as a safety net (the GLB was pre-processed
    // to have identity bone transforms, but this guarantees it at runtime)
    cloned.traverse((child) => {
      if ((child as THREE.Bone).isBone) {
        child.position.set(0, 0, 0);
        child.quaternion.set(0, 0, 0, 1);
        child.scale.set(1, 1, 1);
        child.updateMatrix();
        child.updateMatrixWorld(true);
      }
    });

    // Find skeleton and rebind from the identity-pose bones
    let skeleton: THREE.Skeleton | null = null;
    cloned.traverse((child) => {
      if ((child as THREE.SkinnedMesh).isSkinnedMesh && !skeleton) {
        skeleton = (child as THREE.SkinnedMesh).skeleton;
      }
    });

    if (skeleton) {
      // Recompute inverse bind matrices from the now-identity bone positions
      skeleton.pose();
    }

    // Compute bounding box from geometry to find the model extent
    const bbox = new THREE.Box3();
    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) {
          mesh.geometry.computeBoundingBox();
          if (mesh.geometry.boundingBox) {
            const gb = mesh.geometry.boundingBox.clone();
            gb.applyMatrix4(child.matrixWorld);
            bbox.union(gb);
          }
        }
      }
    });

    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    bbox.getSize(size);
    bbox.getCenter(center);

    // Position so feet (min.y) sit on the ground plane at y=0
    cloned.position.set(-center.x, -bbox.min.y, -center.z);

    group.current.add(cloned);

    const hipsBone = skeleton ? resolveHipsBone(skeleton) : null;
    const mannequinHeight = size.y || 1.8;

    console.log(
      `[MANNEQUIN] Loaded: height=${mannequinHeight.toFixed(2)}, ` +
      `bones=${skeleton?.bones?.length ?? 0}, hipsBone=${hipsBone?.name ?? "none"}`
    );

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

// ── Clothing Slot (router — renders only when src is valid) ──
function ClothingSlot({
  category,
  itemId,
}: {
  category: Category;
  itemId: string;
}) {
  const catalogItems = useWardrobeStore((s) => s.catalogItems);
  const item = useMemo(
    () => catalogItems.find((i) => i.id === itemId),
    [catalogItems, itemId]
  );

  // Only render the inner loader when src is valid — this avoids
  // useLoader being called with an empty/invalid URL
  if (!item?.src) return null;

  return (
    <ClothingInner
      src={item.src}
      category={category}
      itemKey={`${category}-${itemId}`}
    />
  );
}

// ── ClothingInner (hooks called unconditionally) ──────────
// This component is only rendered when src is guaranteed valid,
// so useGLTF is always called with a non-empty string.
function ClothingInner({
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
  const clonedRef = useRef<THREE.Object3D | null>(null);

  // useGLTF is always called unconditionally — valid React hook
  const { scene: clothScene } = useGLTF(src);

  useEffect(() => {
    if (!clothScene || !rootGroup) {
      console.warn(`[CLOTHING] No scene or rootGroup for ${itemKey}`);
      return;
    }

    console.log(
      `[CLOTHING] Processing ${itemKey}: ` +
      `children=${clothScene.children.length}`
    );

    // Remove previous clothing mesh if any
    if (clonedRef.current) {
      clonedRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          const mat = mesh.material as THREE.Material;
          if (mat && typeof mat.dispose === "function") mat.dispose();
        }
      });
      clonedRef.current.parent?.remove(clonedRef.current);
      clonedRef.current = null;
    }

    const cloned = clothScene.clone(true);
    clonedRef.current = cloned;

    // ── Try skinned path (bone-compatible clothing) ──
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
              console.log(`[CLOTHING] Skinned path (${ratio.toFixed(2)} overlap)`);
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

      // Guard against NaN/zero-size geometry
      if (isNaN(size.x) || size.x < 0.001) {
        console.warn(`[CLOTHING] Degenerate geometry for ${itemKey}`);
        size.set(1, 1, 1);
        center.set(0, 0, 0);
      }

      console.log(
        `[CLOTHING] Static fit: ` +
        `size=[${size.x.toFixed(3)}, ${size.y.toFixed(3)}, ${size.z.toFixed(3)}], ` +
        `center=[${center.x.toFixed(3)}, ${center.y.toFixed(3)}, ${center.z.toFixed(3)}]`
      );

      // Center X/Z on the hips pivot
      cloned.position.x -= center.x;
      cloned.position.z -= center.z;
      // Level Y so the center of clothing sits at hips
      cloned.position.y -= center.y;

      // Auto-scale to fit mannequin proportions
      const torsoHeight = mannequinHeight * 0.35;
      if (size.y > 0.001) {
        const targetHeight =
          category === "top"
            ? torsoHeight
            : category === "bottom"
              ? mannequinHeight * 0.45
              : torsoHeight * 0.5;

        const scaleFactor = targetHeight / size.y;
        if (scaleFactor > 0.1 && scaleFactor < 10) {
          console.log(
            `[CLOTHING] Scaling ${itemKey} by ${scaleFactor.toFixed(3)}x`
          );
          cloned.scale.setScalar(scaleFactor);
        }
      }

      // Apply fabric-like PBR material when no textures exist
      cloned.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (mat && !mat.map && !mat.normalMap) {
            mesh.material = new THREE.MeshPhysicalMaterial({
              color: mat.color || new THREE.Color("#e8e8e8"),
              roughness: 0.65,
              metalness: 0.0,
              clearcoat: 0.1,
              clearcoatRoughness: 0.4,
              sheen: 0.3,
              sheenColor: new THREE.Color("#ffffff"),
            });
          }
        }
      });
    }

    return () => {
      if (clonedRef.current) {
        clonedRef.current.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.geometry) mesh.geometry.dispose();
            const mat = mesh.material as THREE.Material;
            if (mat && typeof mat.dispose === "function") mat.dispose();
          }
        });
        clonedRef.current.parent?.remove(clonedRef.current);
        clonedRef.current = null;
      }
    };
  }, [clothScene, rootGroup, hipsBone, skeleton, mannequinHeight, itemKey, category, src]);

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
      {activeSlots.map(({ category, itemId }) => (
        <ClothingSlot
          key={`${category}-${itemId}`}
          category={category}
          itemId={itemId}
        />
      ))}
    </>
  );
}

// ── Error Boundary ──────────────────────────────────────────
class MannequinErrorBoundary extends React.Component<
  { children: React.ReactNode; gender: string },
  { hasError: boolean; errorMsg: string }
> {
  state = { hasError: false, errorMsg: "" };
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMsg: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-30">
          <div className="text-center p-6 max-w-sm">
            <p className="text-sm font-sans text-muted-foreground mb-2">
              3D viewer error
            </p>
            <p className="text-xs font-sans text-muted-foreground/60 mb-2">
              {this.state.errorMsg}
            </p>
            <p className="text-xs font-sans text-muted-foreground/40">
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
