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
  wrinkleIntensity: number; // 0-1 how much wrinkle to apply
}

const FABRIC_PRESETS: Record<FabricType, FabricPreset> = {
  cotton:    { roughness: 0.95, metalness: 0,    opacity: 0.88, wrinkleIntensity: 0.7 },
  denim:     { roughness: 0.92, metalness: 0,    opacity: 0.9,  wrinkleIntensity: 0.5 },
  leather:   { roughness: 0.45, metalness: 0.08, opacity: 0.92, envMapIntensity: 0.6, wrinkleIntensity: 0.15 },
  synthetic: { roughness: 0.6,  metalness: 0.02, opacity: 0.88, wrinkleIntensity: 0.3 },
  wool:      { roughness: 0.98, metalness: 0,    opacity: 0.9,  wrinkleIntensity: 0.65 },
  silk:      { roughness: 0.3,  metalness: 0.04, opacity: 0.85, envMapIntensity: 0.8, wrinkleIntensity: 0.2 },
  canvas:    { roughness: 0.9,  metalness: 0,    opacity: 0.9,  wrinkleIntensity: 0.55 },
  suede:     { roughness: 0.98, metalness: 0,    opacity: 0.92, wrinkleIntensity: 0.25 },
  knit:      { roughness: 0.96, metalness: 0,    opacity: 0.88, wrinkleIntensity: 0.6 },
  default:   { roughness: 0.85, metalness: 0,    opacity: 0.85, wrinkleIntensity: 0.4 },
};

// --- Color resolution ---
const COLOR_MAP: Record<string, string> = {
  black: "#1a1a1a", white: "#f0f0f0", navy: "#1e3a5f", blue: "#3b5998",
  red: "#c0392b", green: "#27ae60", brown: "#8B6914", beige: "#d4b896",
  gray: "#7f8c8d", grey: "#7f8c8d", cream: "#f5f0e1", olive: "#556b2f",
  burgundy: "#800020", pink: "#e07090", orange: "#e67e22", yellow: "#f1c40f",
  purple: "#8e44ad", tan: "#d2b48c", khaki: "#c3b091", charcoal: "#36454f",
  indigo: "#3f51b5", maroon: "#800000", teal: "#008080", coral: "#ff7f50",
};

export function resolveColor(color?: string): string {
  if (!color) return "#6b7b8d";
  const lower = color.toLowerCase().trim();
  if (lower.startsWith("#") || lower.startsWith("rgb")) return color;
  return COLOR_MAP[lower] || "#6b7b8d";
}

// --- Fabric type guessing ---
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

// =============================================
// PROCEDURAL WRINKLE NORMAL MAP
// =============================================
const wrinkleMapCache = new Map<string, THREE.CanvasTexture>();

function generateWrinkleNormalMap(
  intensity: number = 0.5,
  pattern: "horizontal" | "diagonal" | "vertical" | "mixed" = "mixed",
  size: number = 256,
): THREE.CanvasTexture {
  const cacheKey = `${intensity}-${pattern}-${size}`;
  if (wrinkleMapCache.has(cacheKey)) return wrinkleMapCache.get(cacheKey)!;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Fill with neutral normal (128, 128, 255) = flat surface
  ctx.fillStyle = "rgb(128, 128, 255)";
  ctx.fillRect(0, 0, size, size);

  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;

  const amp = intensity * 40; // max displacement in color units

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      let dx = 0;
      let dy = 0;

      // Layer multiple frequencies for natural look
      const freqs = [3, 7, 13, 21];
      const weights = [1.0, 0.5, 0.25, 0.12];

      for (let f = 0; f < freqs.length; f++) {
        const freq = freqs[f];
        const w = weights[f];

        if (pattern === "horizontal" || pattern === "mixed") {
          dy += Math.sin((y / size) * freq * Math.PI * 2 + x * 0.02) * w;
        }
        if (pattern === "vertical" || pattern === "mixed") {
          dx += Math.sin((x / size) * freq * Math.PI * 2 + y * 0.02) * w;
        }
        if (pattern === "diagonal" || pattern === "mixed") {
          const diag = (x + y) / size;
          dx += Math.sin(diag * freq * Math.PI * 2) * w * 0.5;
          dy += Math.cos(diag * freq * Math.PI * 2) * w * 0.5;
        }
      }

      // Add subtle noise
      const noise = (Math.random() - 0.5) * 0.15;
      dx += noise;
      dy += noise;

      data[idx]     = Math.max(0, Math.min(255, 128 + dx * amp)); // R = X normal
      data[idx + 1] = Math.max(0, Math.min(255, 128 + dy * amp)); // G = Y normal
      // B stays at 255 (Z pointing out)
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);

  wrinkleMapCache.set(cacheKey, texture);
  return texture;
}

// --- Wrinkle pattern selection by garment zone ---
function getWrinklePattern(zone?: string): "horizontal" | "diagonal" | "vertical" | "mixed" {
  if (!zone) return "mixed";
  if (zone === "waist" || zone === "torso") return "horizontal";
  if (zone === "elbow" || zone === "sleeve") return "diagonal";
  if (zone === "knee" || zone === "leg") return "vertical";
  return "mixed";
}

// --- Create material with wrinkle normal map ---
export function createFabricMaterial(
  color: string,
  fabric: FabricType,
  zone?: string,
): THREE.MeshStandardMaterial {
  const preset = FABRIC_PRESETS[fabric] || FABRIC_PRESETS.default;
  const resolvedColor = resolveColor(color);

  const mat = new THREE.MeshStandardMaterial({
    color: resolvedColor,
    roughness: preset.roughness,
    metalness: preset.metalness,
    transparent: true,
    opacity: preset.opacity,
    envMapIntensity: preset.envMapIntensity ?? 1.0,
    side: THREE.DoubleSide,
  });

  // Apply wrinkle normal map if fabric warrants it
  if (preset.wrinkleIntensity > 0.1) {
    const pattern = getWrinklePattern(zone);
    const normalMap = generateWrinkleNormalMap(preset.wrinkleIntensity, pattern);
    mat.normalMap = normalMap;
    mat.normalScale = new THREE.Vector2(
      preset.wrinkleIntensity * 0.3,
      preset.wrinkleIntensity * 0.3
    );
  }

  return mat;
}

// --- Create material with photo texture ---
const textureLoader = new THREE.TextureLoader();

export function createTexturedMaterial(
  imageUrl: string,
  fabric: FabricType,
  fallbackColor: string,
  zone?: string,
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

  // Apply wrinkle normal map
  if (preset.wrinkleIntensity > 0.1) {
    const pattern = getWrinklePattern(zone);
    const normalMap = generateWrinkleNormalMap(preset.wrinkleIntensity, pattern);
    mat.normalMap = normalMap;
    mat.normalScale = new THREE.Vector2(
      preset.wrinkleIntensity * 0.25,
      preset.wrinkleIntensity * 0.25
    );
  }

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
    () => {}
  );

  return mat;
}
