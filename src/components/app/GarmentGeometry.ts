import * as THREE from "three";

// --- Types ---
export type GarmentFit = "slim" | "regular" | "oversized";
export type GarmentSubtype =
  // Tops
  | "tshirt-crew" | "tshirt-vneck" | "shirt-classic" | "shirt-oxford" | "sweater" | "hoodie"
  // Bottoms
  | "jeans-slim" | "jeans-straight" | "jeans-wide" | "trousers-tailored" | "trousers-wide"
  // Skirts
  | "skirt-mini" | "skirt-midi" | "skirt-maxi" | "skirt-pencil" | "skirt-aline"
  // Dresses
  | "dress-mini" | "dress-midi" | "dress-maxi"
  // Outerwear
  | "jacket-bomber" | "jacket-biker" | "coat-trench" | "coat-overcoat"
  // Shoes
  | "sneakers" | "boots" | "loafers" | "derby"
  // Hats
  | "cap" | "beanie" | "fedora"
  // Bags
  | "bag-handbag" | "bag-tote" | "bag-clutch"
  // Generic fallbacks
  | "generic-top" | "generic-bottom" | "generic-outerwear" | "generic-shoe" | "generic-hat"
  | "generic-skirt" | "generic-dress" | "generic-bag";

// =============================================
// LAYER SYSTEM — controls rendering order & radial offsets
// =============================================
export const LAYER_ORDER: Record<string, number> = {
  underwear: 0,
  tops: 1,
  sweater: 2,
  outerwear: 3,
  bottoms: 4,
  skirts: 4,
  dress: 5,
  shoes: 6,
  hat: 7,
  bag: 8,
  accessory: 9,
};

// Radial multiplier per layer to prevent z-fighting
export const LAYER_RADIAL_OFFSET: Record<number, number> = {
  0: 1.0,
  1: 1.005,
  2: 1.015,
  3: 1.03,
  4: 1.005,
  5: 1.005,
  6: 1.0,
  7: 1.0,
  8: 1.0,
};

// Slot-based replacement map: categories that conflict with each other
export const SLOT_MAP: Record<string, string[]> = {
  tops: ["tops"],
  sweater: ["tops", "sweater"],
  outerwear: ["outerwear"],
  bottoms: ["bottoms"],
  skirts: ["skirts", "bottoms"],
  dress: ["dress", "tops", "bottoms", "skirts"],
  shoes: ["shoes"],
  hat: ["hat"],
  accessory: ["accessory"],
};

// Categories that get replaced when a dress is added
export const DRESS_REPLACES = ["tops", "bottoms", "skirts"];

// --- Lathe profile helper ---
function createGarmentProfile(points: [number, number][], segments = 24): THREE.LatheGeometry {
  const curve = new THREE.CatmullRomCurve3(
    points.map(([x, y]) => new THREE.Vector3(x, y, 0)),
    false, "catmullrom", 0.5
  );
  const sampledPoints = curve.getPoints(48);
  const vec2Points = sampledPoints.map(p => new THREE.Vector2(Math.max(p.x, 0.001), p.y));
  const geo = new THREE.LatheGeometry(vec2Points, segments);
  geo.computeVertexNormals();
  return geo;
}

// --- Fit multiplier ---
function fitScale(fit: GarmentFit): number {
  return fit === "slim" ? 0.95 : fit === "oversized" ? 1.12 : 1.0;
}

// =============================================
// TOP GEOMETRIES
// =============================================
function createTopGeometry(
  subtype: GarmentSubtype,
  fit: GarmentFit,
  shoulderScale: number,
  waistScale: number,
  layerOffset = 1.0,
): { torso: THREE.LatheGeometry; sleeves?: { geo: THREE.LatheGeometry; length: number } } {
  const f = fitScale(fit) * layerOffset;
  const shoulderR = 0.23 * shoulderScale * f;
  const waistR = 0.17 * waistScale * f;
  const chestR = 0.215 * shoulderScale * f;

  const neckR = subtype === "tshirt-vneck" ? 0.06 : 0.04;
  const neckY = subtype === "tshirt-vneck" ? 0.5 : 0.52;
  const hemY = subtype.includes("sweater") || subtype.includes("hoodie") ? 0.08 : 0.12;

  const torso = createGarmentProfile([
    [0.001, 0.56],
    [neckR, neckY],
    [shoulderR, 0.46],
    [chestR, 0.36],
    [chestR * 0.98, 0.28],
    [waistR * 1.02, 0.18],
    [waistR, hemY],
    [waistR * 0.98, hemY - 0.01],
    [0.001, hemY - 0.02],
  ], 24);

  const sleeveBaseR = shoulderR * 0.35;
  const isShort = subtype.includes("tshirt") || subtype === "generic-top";
  const sleeveLen = isShort ? 0.15 : 0.32;

  const sleeves = {
    geo: createGarmentProfile([
      [0.001, sleeveLen],
      [sleeveBaseR * 0.7, sleeveLen * 0.9],
      [sleeveBaseR, sleeveLen * 0.5],
      [sleeveBaseR * 0.95, sleeveLen * 0.2],
      [sleeveBaseR * (isShort ? 0.85 : 0.7), 0],
      [sleeveBaseR * (isShort ? 0.8 : 0.6), -0.01],
      [0.001, -0.02],
    ], 12),
    length: sleeveLen,
  };

  return { torso, sleeves };
}

// =============================================
// BOTTOM GEOMETRIES (single pant leg)
// =============================================
function createPantLegGeometry(
  subtype: GarmentSubtype,
  fit: GarmentFit,
  hipScale: number,
  legScale: number,
  layerOffset = 1.0,
): THREE.LatheGeometry {
  const f = fitScale(fit) * layerOffset;
  const isWide = subtype.includes("wide");
  const isSlim = subtype.includes("slim") || subtype.includes("skinny");

  const thighR = (isWide ? 0.12 : isSlim ? 0.08 : 0.10) * hipScale * f;
  const kneeR = (isWide ? 0.10 : isSlim ? 0.065 : 0.08) * f;
  const ankleR = (isWide ? 0.095 : isSlim ? 0.05 : 0.065) * f;
  const len = 0.5 * legScale;

  return createGarmentProfile([
    [0.001, len + 0.02],
    [thighR * 0.85, len],
    [thighR, len * 0.8],
    [thighR * 0.98, len * 0.6],
    [kneeR, len * 0.4],
    [kneeR * 0.95, len * 0.25],
    [ankleR, len * 0.08],
    [ankleR * 0.95, 0],
    [0.001, -0.01],
  ], 14);
}

// Waistband
function createWaistbandGeometry(hipScale: number, fit: GarmentFit, layerOffset = 1.0): THREE.LatheGeometry {
  const f = fitScale(fit) * layerOffset;
  const r = 0.19 * hipScale * f;
  return createGarmentProfile([
    [0.001, 0.04],
    [r, 0.03],
    [r * 1.02, 0.0],
    [r, -0.03],
    [0.001, -0.04],
  ], 20);
}

// =============================================
// SKIRT GEOMETRIES
// =============================================
function createSkirtGeometry(
  subtype: GarmentSubtype,
  fit: GarmentFit,
  waistScale: number,
  hipScale: number,
  layerOffset = 1.0,
): THREE.LatheGeometry {
  const f = fitScale(fit) * layerOffset;
  const waistR = 0.17 * waistScale * f;
  const hipR = 0.22 * hipScale * f;

  let hemY: number;
  let hemFlare: number;

  switch (subtype) {
    case "skirt-mini":
      hemY = -0.15; hemFlare = 1.3; break;
    case "skirt-midi":
      hemY = -0.32; hemFlare = 1.4; break;
    case "skirt-maxi":
      hemY = -0.52; hemFlare = 1.5; break;
    case "skirt-pencil":
      hemY = -0.30; hemFlare = 0.85; break;
    case "skirt-aline":
      hemY = -0.28; hemFlare = 1.8; break;
    default:
      hemY = -0.25; hemFlare = 1.3; break;
  }

  const hemR = hipR * hemFlare;

  return createGarmentProfile([
    [0.001, 0.06],
    [waistR, 0.04],
    [waistR * 1.02, 0.02],
    [hipR, -0.02],
    [hipR * 1.05, -0.06],
    [hemR * 0.85, hemY * 0.5],
    [hemR * 0.95, hemY * 0.75],
    [hemR, hemY],
    [hemR * 0.98, hemY - 0.01],
    [0.001, hemY - 0.02],
  ], 28);
}

// =============================================
// DRESS GEOMETRIES (torso + skirt combined)
// =============================================
function createDressGeometry(
  subtype: GarmentSubtype,
  fit: GarmentFit,
  shoulderScale: number,
  waistScale: number,
  hipScale: number,
  layerOffset = 1.0,
): { body: THREE.LatheGeometry; sleeves?: { geo: THREE.LatheGeometry; length: number } } {
  const f = fitScale(fit) * layerOffset;
  const shoulderR = 0.23 * shoulderScale * f;
  const chestR = 0.215 * shoulderScale * f;
  const waistR = 0.17 * waistScale * f;
  const hipR = 0.22 * hipScale * f;

  let hemY: number;
  let hemFlare: number;

  switch (subtype) {
    case "dress-mini":
      hemY = -0.12; hemFlare = 1.2; break;
    case "dress-midi":
      hemY = -0.32; hemFlare = 1.35; break;
    case "dress-maxi":
      hemY = -0.52; hemFlare = 1.5; break;
    default:
      hemY = -0.20; hemFlare = 1.25; break;
  }

  const hemR = hipR * hemFlare;

  const body = createGarmentProfile([
    [0.001, 0.56],
    [0.04, 0.52],
    [shoulderR, 0.46],
    [chestR, 0.36],
    [chestR * 0.98, 0.28],
    [waistR * 1.02, 0.18],
    [waistR, 0.12],
    [hipR * 0.95, 0.02],
    [hipR, -0.02],
    [hipR * 1.05, -0.06],
    [hemR * 0.8, hemY * 0.4],
    [hemR * 0.9, hemY * 0.65],
    [hemR * 0.98, hemY * 0.85],
    [hemR, hemY],
    [hemR * 0.98, hemY - 0.01],
    [0.001, hemY - 0.02],
  ], 28);

  const sleeveBaseR = shoulderR * 0.3;
  const sleeves = {
    geo: createGarmentProfile([
      [0.001, 0.10],
      [sleeveBaseR * 0.6, 0.09],
      [sleeveBaseR, 0.05],
      [sleeveBaseR * 0.9, 0.01],
      [sleeveBaseR * 0.75, -0.02],
      [0.001, -0.03],
    ], 10),
    length: 0.10,
  };

  return { body, sleeves };
}

// =============================================
// OUTERWEAR GEOMETRIES
// =============================================
function createOuterwearGeometry(
  subtype: GarmentSubtype,
  fit: GarmentFit,
  shoulderScale: number,
  waistScale: number,
  hipScale: number,
  layerOffset = 1.0,
): { torso: THREE.LatheGeometry; collar?: THREE.LatheGeometry } {
  const f = fitScale(fit) * 1.06 * layerOffset;
  const shoulderR = 0.26 * shoulderScale * f;
  const chestR = 0.24 * shoulderScale * f;
  const waistR = 0.20 * waistScale * f;
  const hipR = 0.22 * hipScale * f;

  const isLong = subtype.includes("coat") || subtype.includes("trench") || subtype.includes("overcoat");
  const hemY = isLong ? -0.10 : 0.08;

  const torso = createGarmentProfile([
    [0.001, 0.58],
    [0.07, 0.55],
    [shoulderR, 0.47],
    [chestR, 0.37],
    [waistR, 0.2],
    [hipR, 0.02],
    [hipR * 0.98, hemY],
    [hipR * 0.95, hemY - 0.01],
    [0.001, hemY - 0.02],
  ], 24);

  const collar = createGarmentProfile([
    [0.001, 0.06],
    [0.08, 0.05],
    [0.10, 0.02],
    [0.09, -0.02],
    [0.07, -0.04],
    [0.001, -0.05],
  ], 16);

  return { torso, collar };
}

// =============================================
// SHOE GEOMETRIES
// =============================================
function createShoeGeometry(subtype: GarmentSubtype): THREE.BufferGeometry {
  const isBoot = subtype === "boots";
  const isSneaker = subtype === "sneakers" || subtype === "generic-shoe";

  if (isBoot) {
    return createGarmentProfile([
      [0.001, 0.14],
      [0.04, 0.13],
      [0.055, 0.1],
      [0.06, 0.06],
      [0.06, 0.02],
      [0.065, -0.01],
      [0.07, -0.03],
      [0.065, -0.04],
      [0.001, -0.045],
    ], 12);
  }

  const height = isSneaker ? 0.06 : 0.05;
  return createGarmentProfile([
    [0.001, height + 0.02],
    [0.04, height],
    [0.055, height * 0.6],
    [0.06, 0.02],
    [0.065, -0.01],
    [0.07, -0.025],
    [0.065, -0.03],
    [0.001, -0.035],
  ], 12);
}

// =============================================
// HAT GEOMETRIES
// =============================================
function createHatGeometry(subtype: GarmentSubtype): {
  crown: THREE.BufferGeometry;
  brim?: THREE.BufferGeometry;
} {
  if (subtype === "beanie") {
    const crown = createGarmentProfile([
      [0.001, 0.12], [0.06, 0.11], [0.12, 0.08], [0.145, 0.04],
      [0.15, 0.0], [0.148, -0.02], [0.14, -0.04], [0.001, -0.045],
    ], 16);
    return { crown };
  }

  if (subtype === "fedora") {
    const crown = createGarmentProfile([
      [0.001, 0.1], [0.08, 0.09], [0.11, 0.06], [0.12, 0.02],
      [0.13, 0.0], [0.13, -0.02], [0.001, -0.03],
    ], 16);
    const brim = new THREE.RingGeometry(0.12, 0.22, 24);
    return { crown, brim };
  }

  // Default: baseball cap
  const crown = createGarmentProfile([
    [0.001, 0.09], [0.06, 0.085], [0.11, 0.06], [0.135, 0.03],
    [0.14, 0.0], [0.14, -0.02], [0.001, -0.025],
  ], 16);

  const brimShape = new THREE.Shape();
  brimShape.absarc(0, 0, 0.18, 0, Math.PI, false);
  brimShape.absarc(0, 0, 0.13, Math.PI, 0, true);
  const brim = new THREE.ShapeGeometry(brimShape);

  return { crown, brim };
}

// =============================================
// RESOLVE SUBTYPE FROM CATEGORY STRING
// =============================================
export function resolveSubtype(category: string, name?: string): GarmentSubtype {
  const cat = (category || "").toLowerCase();
  const nm = (name || "").toLowerCase();

  if (["shoes", "footwear", "shoe"].some(k => cat.includes(k))) {
    if (nm.includes("boot")) return "boots";
    if (nm.includes("loafer")) return "loafers";
    if (nm.includes("derby") || nm.includes("oxford")) return "derby";
    return "sneakers";
  }
  if (["hat", "cap", "headwear"].some(k => cat.includes(k))) {
    if (nm.includes("beanie")) return "beanie";
    if (nm.includes("fedora")) return "fedora";
    return "cap";
  }
  if (["outerwear", "coat", "jacket"].some(k => cat.includes(k))) {
    if (nm.includes("trench")) return "coat-trench";
    if (nm.includes("overcoat")) return "coat-overcoat";
    if (nm.includes("biker") || nm.includes("leather")) return "jacket-biker";
    return "jacket-bomber";
  }
  if (["dress", "dresses", "gown"].some(k => cat.includes(k))) {
    if (nm.includes("mini")) return "dress-mini";
    if (nm.includes("maxi")) return "dress-maxi";
    if (nm.includes("midi")) return "dress-midi";
    return "dress-midi";
  }
  if (["skirt", "skirts"].some(k => cat.includes(k))) {
    if (nm.includes("mini")) return "skirt-mini";
    if (nm.includes("maxi")) return "skirt-maxi";
    if (nm.includes("pencil")) return "skirt-pencil";
    if (nm.includes("a-line") || nm.includes("aline")) return "skirt-aline";
    if (nm.includes("midi")) return "skirt-midi";
    return "skirt-midi";
  }
  if (["bottoms", "trousers", "jeans", "pants", "bottom", "shorts"].some(k => cat.includes(k))) {
    if (nm.includes("wide")) return "jeans-wide";
    if (nm.includes("slim") || nm.includes("skinny")) return "jeans-slim";
    if (nm.includes("tailored")) return "trousers-tailored";
    if (nm.includes("straight")) return "jeans-straight";
    return "jeans-straight";
  }
  if (["tops", "shirt", "t-shirt", "tshirt", "top", "sweater", "hoodie", "blouse"].some(k => cat.includes(k))) {
    if (nm.includes("vneck") || nm.includes("v-neck")) return "tshirt-vneck";
    if (nm.includes("sweater") || nm.includes("knit")) return "sweater";
    if (nm.includes("hoodie")) return "hoodie";
    if (nm.includes("oxford")) return "shirt-oxford";
    if (nm.includes("shirt") && !nm.includes("tshirt") && !nm.includes("t-shirt")) return "shirt-classic";
    return "tshirt-crew";
  }

  return "generic-top";
}

// =============================================
// PUBLIC API
// =============================================
export {
  createTopGeometry,
  createPantLegGeometry,
  createWaistbandGeometry,
  createSkirtGeometry,
  createDressGeometry,
  createOuterwearGeometry,
  createShoeGeometry,
  createHatGeometry,
};
