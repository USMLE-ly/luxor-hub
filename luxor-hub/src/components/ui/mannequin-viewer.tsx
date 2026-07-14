import React, {
  useState,
  createContext,
  useContext,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
} from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
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
  register: (data: Partial<Omit<MannequinCtx, "register">>) => void;
}

const MannequinContext = createContext<MannequinCtx>({
  rootGroup: null,
  skeleton: null,
  hipsBone: null,
  mannequinHeight: 1.8,
  register: () => {},
});

function resolveHipsBone(skeleton: THREE.Skeleton): THREE.Bone {
  const targets = ["hips", "mixamorig:hips", "root", "pelvis"];
  for (const bone of skeleton.bones) {
    const name = bone.name.toLowerCase();
    if (targets.some((t) => name.includes(t))) return bone;
  }
  return skeleton.bones[0];
}

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

// ── Validate if a src string is a loadable 3D model ──
function isValidModelSrc(src: string | null | undefined): boolean {
  if (!src || src.length < 5) return false;
  // Reject data:image URLs (user uploaded an image, not a 3D model)
  if (src.startsWith("data:image")) return false;
  // Accept file paths ending in .glb or .gltf
  if (src.match(/\.(glb|gltf)(\?|$)/i)) return true;
  // Accept blob: URLs (created by our upload handler)
  if (src.startsWith("blob:")) return true;
  // Accept data:application URLs (base64 GLB)
  if (src.startsWith("data:application")) return true;
  return false;
}

// ── Mannequin Provider ─────────────────────────────────────
function MannequinProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Omit<MannequinCtx, "register">>({
    rootGroup: null,
    skeleton: null,
    hipsBone: null,
    mannequinHeight: 1.8,
  });

  const register = useCallback(
    (next: Partial<Omit<MannequinCtx, "register">>) => {
        hasRootGroup: !!next.rootGroup,
        hasSkeleton: !!next.skeleton,
        hasHipsBone: !!next.hipsBone,
        mannequinHeight: next.mannequinHeight,
      });
      setData((prev) => ({ ...prev, ...next }));
    },
    []
  );

  const value = useMemo(
    () => ({ ...data, register }),
    [data, register]
  );

    hasRootGroup: !!data.rootGroup,
    hasSkeleton: !!data.skeleton,
    hasHipsBone: !!data.hipsBone,
    mannequinHeight: data.mannequinHeight,
  });

  return (
    <MannequinContext.Provider value={value}>
      {children}
    </MannequinContext.Provider>
  );
}

// ── Mannequin Model ────────────────────────────────────────
function MannequinModel() {
  const group = useRef<THREE.Group>(null);
  const gender = useWardrobeStore((s) => s.gender);
  const { register } = useContext(MannequinContext);

  const { scene } = useLoader(
    GLTFLoader,
    `/models/mannequin_${gender === "male" ? "m" : "f"}.glb`
  );

  useFrame(() => {
    if (group.current && group.current.position.y !== 0) {
      group.current.position.y = 0;
    }
  });

  useEffect(() => {
    if (!group.current) {
      return;
    }

    const cloned = scene.clone(true);
    applyMatteWhite(cloned);

    cloned.traverse((child) => {
      if ((child as THREE.Bone).isBone) {
        child.position.set(0, 0, 0);
        child.quaternion.set(0, 0, 0, 1);
        child.scale.set(1, 1, 1);
        child.updateMatrix();
        child.updateMatrixWorld(true);
      }
    });

    let skeleton: THREE.Skeleton | null = null;
    cloned.traverse((child) => {
      if ((child as THREE.SkinnedMesh).isSkinnedMesh && !skeleton) {
        skeleton = (child as THREE.SkinnedMesh).skeleton;
      }
    });
    if (skeleton) skeleton.pose();

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

    cloned.position.set(-center.x, -bbox.min.y, -center.z);
    group.current.add(cloned);

    const hipsBone = skeleton ? resolveHipsBone(skeleton) : null;
    const mannequinHeight = size.y || 1.8;

      `[MANNEQUIN] Loaded: height=${mannequinHeight.toFixed(2)}, bones=${
        skeleton?.bones?.length ?? 0
      }`
    );

    register({
      rootGroup: group.current,
      skeleton,
      hipsBone,
      mannequinHeight,
    });

    return () => {
      cloned.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          // MATTE_WHITE is shared — do not dispose
        }
      });
      group.current?.remove(cloned);
    };
  }, [scene, gender, register]);

  return <group ref={group} />;
}

// ── Clothing Slot (router with strict validation) ──
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

    `[CLOTHING] SLOT CHECK: category=${category} itemId=${itemId} item=${item?.name}`
  );

  // Strict validation: reject images, empty strings, and invalid paths
  if (!item?.src || !isValidModelSrc(item.src)) {
      `[CLOTHING] SKIP ${item?.name ?? itemId} — src invalid: "${(
        item?.src || ""
      ).substring(0, 60)}"`
    );
    return null;
  }

    `[CLOTHING] SLOT OK: ${item.name} src=${item.src.substring(0, 60)}...`
  );
  return (
    <ClothingInner
      src={item.src}
      category={category}
      itemKey={`${category}-${itemId}`}
    />
  );
}

function disposeClonedObject(obj: THREE.Object3D) {
  obj.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = mesh.material as THREE.Material | THREE.Material[];
      const mats = Array.isArray(mat) ? mat : [mat];
      mats.forEach((m) => {
        // Only dispose materials we created/flagged; never dispose shared GLTF cache materials
        if (m && (m as any).userData?.luxorOwnMaterial && typeof m.dispose === "function") {
          m.dispose();
        }
      });
    }
  });
}

// ── ClothingInner ──────────────────────────────────────────
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
  const helperRef = useRef<THREE.BoxHelper | null>(null);

  // Last-resort guard: if src somehow passed validation but is still an image, bail
  if (src.startsWith("data:image")) {
    console.error(
      `[CLOTHING] CRITICAL: Image data passed to GLTFLoader for ${itemKey}. Blocking.`
    );
    return null;
  }

  const gltf = useLoader(GLTFLoader, src);

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let helperRemoveTimer: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;
    const MAX_ATTEMPTS = 50; // 10 seconds

    function cleanupCurrent() {
      if (clonedRef.current) {
        disposeClonedObject(clonedRef.current);
        clonedRef.current.parent?.remove(clonedRef.current);
        clonedRef.current = null;
      }
      if (helperRef.current) {
        helperRef.current.geometry?.dispose();
        const mat = (helperRef.current.material as THREE.LineBasicMaterial);
        if (mat && typeof mat.dispose === "function") mat.dispose();
        helperRef.current.parent?.remove(helperRef.current);
        helperRef.current = null;
      }
      if (helperRemoveTimer) {
        clearTimeout(helperRemoveTimer);
        helperRemoveTimer = null;
      }
    }

    function attemptAttach() {
      if (cancelled) {
        return;
      }

      attempts++;

      if (!gltf?.scene) {
        retryTimer = setTimeout(attemptAttach, 200);
        return;
      }

      if (!rootGroup) {
        if (attempts < MAX_ATTEMPTS) {
          retryTimer = setTimeout(attemptAttach, 200);
        } else {
          console.error(`[CLOTHING] ${itemKey} timed out waiting for rootGroup`);
        }
        return;
      }

      if (!skeleton) {
        if (attempts < MAX_ATTEMPTS) {
          retryTimer = setTimeout(attemptAttach, 200);
        } else {
          console.error(`[CLOTHING] ${itemKey} timed out waiting for skeleton`);
        }
        return;
      }

        `[CLOTHING] PROCESSING ${itemKey}: ${gltf.scene.children.length} children, rootGroup children=${rootGroup.children.length}`
      );

      // Cleanup previous instance before attaching a new one
      cleanupCurrent();

      const cloned = gltf.scene.clone(true);
      clonedRef.current = cloned;
      cloned.userData.isClothing = true;
      cloned.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          (child as THREE.Mesh).userData.isClothing = true;
        }
      });

      // Try skinned path
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
                `[CLOTHING] ${itemKey} bone overlap ratio=${ratio.toFixed(2)}`
              );
              if (ratio >= 0.6) {
                mesh.skeleton = skeleton;
                mesh.bind(skeleton);
                isSkinned = true;
              }
            }
          }
        });
      }


      // Add to rootGroup (same space as the mannequin mesh) for predictable positioning
      rootGroup.add(cloned);

      if (!isSkinned) {
        // Use the geometry's own bounding box for local-space sizing
        let localSize = new THREE.Vector3(0.3, 0.4, 0.15);
        cloned.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (mesh.isMesh && mesh.geometry) {
            mesh.geometry.computeBoundingBox();
            if (mesh.geometry.boundingBox) {
              const gb = mesh.geometry.boundingBox.clone();
              gb.applyMatrix4(mesh.matrix);
              const sz = new THREE.Vector3();
              gb.getSize(sz);
              localSize.x = Math.max(localSize.x, sz.x);
              localSize.y = Math.max(localSize.y, sz.y);
              localSize.z = Math.max(localSize.z, sz.z);
            }
          }
        });

        // Scale to fit the mannequin
        const isShoe2 =
          itemKey.toLowerCase().includes("shoe") ||
          itemKey.toLowerCase().includes("sneaker") ||
          itemKey.toLowerCase().includes("boot");
        const targetH =
          category === "top"
            ? mannequinHeight * 0.35
            : category === "bottom"
            ? mannequinHeight * 0.45
            : isShoe2
            ? mannequinHeight * 0.06
            : mannequinHeight * 0.18;
          `[CLOTHING] ${itemKey} localSize=${JSON.stringify(
            localSize.toArray()
          )} targetH=${targetH.toFixed(3)}`
        );
        if (localSize.y > 0.001) {
          const s = targetH / localSize.y;
          if (s > 0.1 && s < 15) {
            cloned.scale.setScalar(s);
          }
        }

        const isShoe =
          itemKey.toLowerCase().includes("shoe") ||
          itemKey.toLowerCase().includes("sneaker") ||
          itemKey.toLowerCase().includes("boot") ||
          itemKey.toLowerCase().includes("footwear");

        // Centering: align clothing center to body landmarks
        const box = new THREE.Box3().setFromObject(cloned);
        const center = box.getCenter(new THREE.Vector3());

        let targetY: number;
        let zOffset: number;
        if (category === "top") {
          targetY = mannequinHeight * 0.67; // chest
          zOffset = 0.05;
        } else if (category === "bottom") {
          targetY = mannequinHeight * 0.5; // hips
          zOffset = 0.03;
        } else if (isShoe) {
          targetY = 0.02; // ground
          zOffset = 0.02;
        } else {
          targetY = mannequinHeight * 0.58; // mid-torso
          zOffset = 0.04;
        }

        cloned.position.set(
          -center.x,
          targetY - center.y,
          -center.z + zOffset
        );
          `[CLOTHING] ${itemKey} positioned at ${JSON.stringify(
            cloned.position.toArray()
          )}`
        );
      }

      // Apply materials
      cloned.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const mat = mesh.material as any;

          // Check for texture: map, normalMap, aoMap, emissiveMap, or any image source
          const hasTexture = !!(
            mat?.map ||
            mat?.normalMap ||
            mat?.aoMap ||
            mat?.emissiveMap ||
            mat?.image ||
            mat?.source?.data instanceof HTMLImageElement ||
            mat?.map?.image instanceof HTMLImageElement
          );

          if (!hasTexture) {
            // No texture — replace with PBR fabric material
            const color = mat?.color ? mat.color.clone() : new THREE.Color("#4a90d9");
            const newMat = new THREE.MeshPhysicalMaterial({
              color,
              roughness: 0.65,
              metalness: 0.0,
              clearcoat: 0.05,
              clearcoatRoughness: 0.4,
              sheen: 0.2,
              sheenColor: new THREE.Color("#ffffff"),
              side: THREE.DoubleSide,
              depthWrite: true,
            });
            (newMat as any).userData = { ...(newMat as any).userData, luxorOwnMaterial: true };
            mesh.material = newMat;
          } else {
            // Has texture — preserve it, enhance with PBR
            mat.side = THREE.DoubleSide;
            mat.roughness = Math.max(mat.roughness || 0, 0.55);
            mat.metalness = Math.min(mat.metalness || 0, 0.05);
            mat.depthWrite = true;
          }
          mesh.renderOrder = 1;
        }
      });

      // Green debug wireframe (BoxHelper) with 10s timeout
      try {
        const helper = new THREE.BoxHelper(cloned, 0x00ff00);
        helperRef.current = helper;
        rootGroup.add(helper);
        helperRemoveTimer = setTimeout(() => {
          if (helperRef.current) {
            helperRef.current.geometry?.dispose();
            const mat = helperRef.current.material as THREE.LineBasicMaterial;
            if (mat && typeof mat.dispose === "function") mat.dispose();
            helperRef.current.parent?.remove(helperRef.current);
            helperRef.current = null;
          }
        }, 10000);
      } catch (e) {
        console.error(`[CLOTHING] ${itemKey} BoxHelper error:`, e);
      }

        `[CLOTHING] ${itemKey} ADDED TO SCENE rootChildren=${rootGroup.children.length}`
      );
    }

    attemptAttach();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      cleanupCurrent();
    };
  }, [
    gltf,
    rootGroup,
    skeleton,
    hipsBone,
    mannequinHeight,
    itemKey,
    category,
    src,
  ]);

  return null;
}

// ── Clothing Layer ──
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
      .filter((s) => s.src !== null && s.src.length > 5);
  }, [selected, catalogItems]);


  return (
    <>
      {activeSlots.map(({ category, itemId, src }) => (
        <ClothingSlot
          key={`${category}-${itemId}-${src}`}
          category={category}
          itemId={itemId}
        />
      ))}
    </>
  );
}

// ── Scene wrapper (Provider lives INSIDE the Canvas) ──
function MannequinScene() {
  return (
    <MannequinProvider>
      <MannequinModel />
      <ClothingLayer />
    </MannequinProvider>
  );
}

// ── Error Boundary ──
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
            <p className="text-xs font-sans text-muted-foreground/60">
              {this.state.errorMsg}
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

// ── Main Export ──
export function MannequinViewer({ className }: { className?: string }) {
  const hydrated = useWardrobeHydrated();

  if (!hydrated) return <LoadingFallback />;

  return (
    <div className={`w-full h-full relative ${className || ""}`}>
      <MannequinErrorBoundary gender={useWardrobeStore.getState().gender}>
        <Suspense fallback={<LoadingFallback />}>
          <Canvas shadows camera={{ position: [0, 1.1, 3.2], fov: 32 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[3, 5, 4]} intensity={0.8} castShadow />
            <directionalLight position={[-2, 3, -2]} intensity={0.3} />
            <pointLight position={[0, 3, 3]} intensity={0.2} color="#E8D5B7" />

            <MannequinScene />

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

if (typeof window !== "undefined") {
  useLoader.preload(GLTFLoader, "/models/mannequin_m.glb");
  useLoader.preload(GLTFLoader, "/models/mannequin_f.glb");
}