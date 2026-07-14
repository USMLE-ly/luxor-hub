/**
 * 3D Asset Resolver — maps 2D closet items to their 3D GLB files.
 *
 * Users can upload .glb files to public/models/clothing/ and map them
 * to specific closet items. The mapping is persisted in localStorage.
 *
 * Flow:
 *   Closet "Try On" → resolve3DAsset(name) → finds GLB path → loads on mannequin
 *   "Assign 3D Model" button → user picks .glb → mapping stored → next time it works
 */

const STORAGE_KEY = "luxor-3d-asset-mapping";

// Built-in mappings for known user items (user can add more via the UI)
const BUILTIN_MAPPINGS: Record<string, string> = {};

export interface AssetMapping {
  itemName: string;   // normalized lowercase item name
  glbPath: string;    // e.g. /models/clothing/my-shirt.glb
}

function loadMappings(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* localStorage unavailable */ }
  return {};
}

function saveMappings(mappings: Record<string, string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
  } catch {}
}

/**
 * Resolve the GLB path for a given closet item name.
 * Checks: user-assigned mappings (localStorage) > built-in mappings > file system scan.
 */
export function resolve3DAsset(
  itemName: string,
  category: string
): string | null {
  const key = itemName.toLowerCase().trim();

  // 1. Check user-assigned mappings (persisted in localStorage)
  const userMappings = loadMappings();
  if (userMappings[key]) return userMappings[key];

  // 2. Check built-in mappings
  if (BUILTIN_MAPPINGS[key]) return BUILTIN_MAPPINGS[key];

  return null;
}

/**
 * Assign a GLB path to a closet item. Persisted across sessions.
 */
export function assign3DAsset(
  itemName: string,
  glbPath: string
): void {
  const key = itemName.toLowerCase().trim();
  const mappings = loadMappings();
  mappings[key] = glbPath;
  saveMappings(mappings);
}

/**
 * Store a user-uploaded GLB file, return its server path.
 * The file is saved to localStorage as base64 for session use,
 * and the user is instructed to put the .glb in public/models/clothing/.
 */
export async function uploadAndAssignGLB(
  itemName: string,
  file: File
): Promise<string> {
  // Create blob URL for immediate session rendering
  const blobUrl = URL.createObjectURL(file);

  // Store the blob URL as the mapping (for this session)
  const key = itemName.toLowerCase().trim();
  const mappings = loadMappings();
  mappings[key] = blobUrl;
  saveMappings(mappings);

  // Also persist binary to IndexedDB for reload
  try {
    const { set: idbSet } = await import("idb-keyval");
    const buffer = await file.arrayBuffer();
    await idbSet(`luxor-clothing-mapping-${key}`, buffer);
  } catch {}

  return blobUrl;
}

/**
 * Restore blob URLs for all user-mapped items from IndexedDB.
 */
export async function restoreAssetMappings(): Promise<void> {
  const { get: idbGet, keys: idbKeys } = await import("idb-keyval");
  const mappings = loadMappings();
  const allKeys = await idbKeys();
  
  let restored = 0;
  for (const k of allKeys) {
    if (typeof k === "string" && k.startsWith("luxor-clothing-mapping-")) {
      const itemKey = k.slice("luxor-clothing-mapping-".length);
      // If mapping references this item and is a blob URL that expired
      if (mappings[itemKey]?.startsWith("blob:")) {
        try {
          const buffer = await idbGet<ArrayBuffer>(k);
          if (buffer) {
            const blob = new Blob([buffer], { type: "model/gltf-binary" });
            const blobUrl = URL.createObjectURL(blob);
            mappings[itemKey] = blobUrl;
            restored++;
          }
        } catch {}
      }
    }
  }

  if (restored > 0) {
    saveMappings(mappings);
  }
}

/**
 * Get all known 3D models from the public models directory.
 * Scans the known GLB files the user has placed.
 */
export function getKnownModels(): string[] {
  // The user places .glb files in public/models/clothing/
  // This function returns known paths (scans aren't possible from client-side,
  // so we maintain a registry)
  const paths: string[] = [];
  try {
    const raw = localStorage.getItem("luxor-known-models");
    if (raw) return JSON.parse(raw);
  } catch {}
  return paths;
}

export function registerKnownModel(glbPath: string): void {
  try {
    const paths = getKnownModels();
    if (!paths.includes(glbPath)) {
      paths.push(glbPath);
      localStorage.setItem("luxor-known-models", JSON.stringify(paths));
    }
  } catch {}
}
