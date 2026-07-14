import * as THREE from "three";

// ── Types ──
export type GarmentSubtype = string;
export type PosePreset = "neutral" | "fashion" | "walking";

// ── Default DNA ──
export const DEFAULT_DNA = { height: 0.5, shoulder: 0.5, waist: 0.5, hips: 0.5, legLength: 0.5 };

// ── Premium PBR Materials (LUXOR Signature) ──
export const ceramicMat = new THREE.MeshPhysicalMaterial({
  color: "#F0E4D0", roughness: 0.65, metalness: 0, clearcoat: 0.18,
  clearcoatRoughness: 0.2, sheen: 0.35, sheenColor: new THREE.Color("#E8D5B7"),
  envMapIntensity: 0.6,
});
export const warmMapleMat = new THREE.MeshPhysicalMaterial({
  color: "#C4A882", roughness: 0.55, metalness: 0, clearcoat: 0.05,
  sheen: 0.15, sheenColor: new THREE.Color("#D8C5A7"),
  envMapIntensity: 0.4,
});
export const ivoryPolymerMat = new THREE.MeshPhysicalMaterial({
  color: "#E8DCC8", roughness: 0.7, metalness: 0, clearcoat: 0.12,
  sheen: 0.25, sheenColor: new THREE.Color("#F0E4D0"),
  envMapIntensity: 0.5,
});
export const darkAccentMat = new THREE.MeshPhysicalMaterial({
  color: "#8B7355", roughness: 0.75, metalness: 0.05, clearcoat: 0.08,
  envMapIntensity: 0.3,
});

// ── Lathe Profile Builder ──
export function createBodyProfile(points: [number, number][], segments = 48): THREE.LatheGeometry {
  const curve = new THREE.CatmullRomCurve3(
    points.map(([x, y]) => new THREE.Vector3(x, y, 0)),
    false, "catmullrom", 0.5
  );
  const sampledPoints = curve.getPoints(80);
  const vec2Points = sampledPoints.map((p) => new THREE.Vector2(Math.max(p.x, 0.001), p.y));
  return new THREE.LatheGeometry(vec2Points, segments);
}

// ── Editorial Pose Rotations ──
export const POSES: Record<PosePreset, Record<string, [number, number, number]>> = {
  neutral: {
    leftUpperArm: [-0.05, 0.02, 0.18], rightUpperArm: [0.05, -0.02, -0.15],
    leftForearm: [-0.08, 0, 0.05], rightForearm: [-0.06, 0, 0.03],
    leftThigh: [0.02, 0, -0.03], rightThigh: [-0.06, 0, 0.02],
    leftCalf: [0.01, 0, 0], rightCalf: [0.02, 0, 0],
    torso: [0.02, 0, 0], hipShift: -0.03, weightShift: 0.04,
  },
  fashion: {
    leftUpperArm: [0.05, 0.08, 0.45], rightUpperArm: [0.15, -0.1, -0.7],
    leftForearm: [-0.4, 0.05, 0.15], rightForearm: [-0.9, -0.05, -0.2],
    leftThigh: [0.03, 0, -0.02], rightThigh: [-0.2, 0, 0.04],
    leftCalf: [0.02, 0, 0], rightCalf: [0.25, 0, 0.02],
    torso: [0.03, 0.08, -0.02], hipShift: -0.05, weightShift: 0.06,
  },
  walking: {
    leftUpperArm: [0.35, 0.02, 0.12], rightUpperArm: [-0.35, -0.02, -0.12],
    leftForearm: [-0.25, 0, 0.05], rightForearm: [-0.2, 0, -0.03],
    leftThigh: [-0.3, 0, 0.02], rightThigh: [0.3, 0, -0.02],
    leftCalf: [0.2, 0, 0.01], rightCalf: [-0.2, 0, -0.01],
    torso: [0.01, 0.04, 0], hipShift: -0.04, weightShift: 0.05,
  },
};

// ── Category Detection Helpers ──
export const isTopCat = (s: GarmentSubtype) =>
  s.includes("tshirt") || s.includes("shirt") || s.includes("sweater") || s.includes("hoodie") || s === "generic-top";
export const isBottomCat = (s: GarmentSubtype) =>
  s.includes("jeans") || s.includes("trousers") || s === "generic-bottom";
export const isSkirtCat = (s: GarmentSubtype) =>
  s.includes("skirt") || s === "generic-skirt";
export const isDressCat = (s: GarmentSubtype) =>
  s.includes("dress") || s === "generic-dress";
export const isOuterCat = (s: GarmentSubtype) =>
  s.includes("jacket") || s.includes("coat") || s === "generic-outerwear";
export const isShoeCat = (s: GarmentSubtype) =>
  s.includes("sneakers") || s.includes("boots") || s.includes("loafers") || s.includes("derby") || s === "generic-shoe";
export const isHatCat = (s: GarmentSubtype) =>
  s.includes("cap") || s.includes("beanie") || s.includes("fedora") || s === "generic-hat";
export const isBagCat = (s: GarmentSubtype) =>
  s.includes("bag-") || s === "generic-bag";
