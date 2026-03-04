import * as THREE from "three";

// --- Fabric Types ---
export type FabricType =
  | "cotton"
  | "denim"
  | "leather"
  | "synthetic"
  | "wool"
  | "silk"
  | "canvas"
  | "suede"
  | "knit"
  | "default";

// --- Material presets ---
interface FabricPreset {
  roughness: number;
  metalness: number;
  opacity: number;
  envMapIntensity?: number;
}

const FABRIC_PRESETS: Record<FabricType, FabricPreset> = {
  cotton: { roughness: 0.95, metalness: 0, opacity: 0.88 },
  denim: { roughness: 0.92, metalness: 0, opacity: 0.9 },
  leather: { roughness: 0.45, metalness: 0.08, opacity: 0.92, envMapIntensity: 0.6 },
  synthetic: { roughness: 0.6, metalness: 0.02, opacity: 0.88 },
  wool: { roughness: 0.98, metalness: 0, opacity: 0.9 },
  silk: { roughness: 0.3, metalness: 0.04, opacity: 0.85, envMapIntensity: 0.8 },
  canvas: { roughness: 0.9, metalness: 0, opacity: 0.9 },
  suede: { roughness: 0.98, metalness: 0, opacity: 0.92 },
  knit: { roughness: 0.96, metalness: 0, opacity: 0.88 },
  default: { roughness: 0.85, metalness: 0, opacity: 0.85 },
};

// --- Color resolution ---
const COLOR_MAP: Record<string, string> = {
  black: "#1a1a1a",
  white: "#f0f0f0",
  navy: "#1e3a5f",
  blue: "#3b5998",
  red: "#c0392b",
  green: "#27ae60",
  brown: "#8B6914",
  beige: "#d4b896",
  gray: "#7f8c8d",
  grey: "#7f8c8d",
  cream: "#f5f0e1",
  olive: "#556b2f",
  burgundy: "#800020",
  pink: "#e07090",
  orange: "#e67e22",
  yellow: "#f1c40f",
  purple: "#8e44ad",
  tan: "#d2b48c",
  khaki: "#c3b091",
  charcoal: "#36454f",
  indigo: "#3f51b5",
  maroon: "#800000",
  teal: "#008080",
  coral: "#ff7f50",
};

export function resolveColor(color?: string): string {
  if (!color) return "#6b7b8d";
  const lower = color.toLowerCase().trim();
  // Check if it's already a hex/rgb value
  if (lower.startsWith("#") || lower.startsWith("rgb")) return color;
  return COLOR_MAP[lower] || "#6b7b8d";
}

// --- Fabric type guessing from category/name ---
export function guessFabric(category?: string, name?: string): FabricType {
  const combined = `${category || ""} ${name || ""}`.toLowerCase();
  if (combined.includes("denim") || combined.includes("jeans")) return "denim";
  if (combined.includes("leather")) return "leather";
  if (combined.includes("suede")) return "suede";
  if (combined.includes("silk") || combined.includes("satin")) return "silk";
  if (combined.includes("wool") || combined.includes("cashmere")) return "wool";
  if (combined.includes("knit") || combined.includes("sweater")) return "knit";
  if (combined.includes("canvas")) return "canvas";
  if (combined.includes("synthetic") || combined.includes("nylon") || combined.includes("polyester")) return "synthetic";
  if (combined.includes("cotton") || combined.includes("tshirt") || combined.includes("t-shirt")) return "cotton";
  return "default";
}

// --- Create material ---
export function createFabricMaterial(color: string, fabric: FabricType): THREE.MeshStandardMaterial {
  const preset = FABRIC_PRESETS[fabric] || FABRIC_PRESETS.default;
  const resolvedColor = resolveColor(color);

  return new THREE.MeshStandardMaterial({
    color: resolvedColor,
    roughness: preset.roughness,
    metalness: preset.metalness,
    transparent: true,
    opacity: preset.opacity,
    envMapIntensity: preset.envMapIntensity ?? 1.0,
    side: THREE.DoubleSide,
  });
}

// --- Create material with photo texture ---
const textureLoader = new THREE.TextureLoader();

export function createTexturedMaterial(
  imageUrl: string,
  fabric: FabricType,
  fallbackColor: string,
): THREE.MeshStandardMaterial {
  const preset = FABRIC_PRESETS[fabric] || FABRIC_PRESETS.default;
  const mat = new THREE.MeshStandardMaterial({
    color: resolveColor(fallbackColor),
    roughness: preset.roughness,
    metalness: preset.metalness,
    transparent: true,
    opacity: preset.opacity,
    side: THREE.DoubleSide,
  });

  // Load texture async
  textureLoader.load(
    imageUrl,
    (texture) => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 1);
      mat.map = texture;
      mat.needsUpdate = true;
    },
    undefined,
    () => {
      // Failed to load — keep fallback color
    }
  );

  return mat;
}
