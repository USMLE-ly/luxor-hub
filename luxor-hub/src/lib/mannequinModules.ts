/**
 * Cached lazy loader for heavy 3D modules.
 * Loads all mannequin-related code in one dynamic import and caches it.
 * Closet.tsx imports this instead of the raw modules, keeping the 3D code
 * out of the initial bundle until the mannequin panel is opened.
 */

type AssetResolver = typeof import("./assetResolver");
type DummyGLB = typeof import("./dummyGLBGenerator");
type ImageToGLB = typeof import("./imageToGLBConverter");
type GarmentGeo = typeof import("@/components/app/GarmentGeometry");
type FabricMat = typeof import("@/components/app/FabricMaterials");

let cached: {
  assetResolver: AssetResolver;
  dummyGLB: DummyGLB;
  imageToGLB: ImageToGLB;
  garmentGeometry: GarmentGeo;
  fabricMaterials: FabricMat;
} | null = null;

let loading: Promise<typeof cached> | null = null;

export async function loadMannequinModules() {
  if (cached) return cached;
  if (loading) return loading;

  loading = Promise.all([
    import("./assetResolver"),
    import("./dummyGLBGenerator"),
    import("./imageToGLBConverter"),
    import("@/components/app/GarmentGeometry"),
    import("@/components/app/FabricMaterials"),
  ]).then(([assetResolver, dummyGLB, imageToGLB, garmentGeometry, fabricMaterials]) => {
    cached = { assetResolver, dummyGLB, imageToGLB, garmentGeometry, fabricMaterials };
    return cached;
  });

  return loading;
}
