/**
 * IndexedDB persistence for clothing GLB files.
 *
 * localStorage cannot handle large files (5-10MB limit).
 * Blob URLs are session-only. IndexedDB stores the actual binary
 * data so clothing survives page reloads.
 *
 * Flow:
 *   Upload → store blob URL in Zustand (immediate render)
 *          → store binary in IndexedDB (persistence)
 *   Reload → read metadata from Zustand
 *          → read binary from IndexedDB
 *          → recreate blob URL
 *          → update Zustand src field
 */
import { get, set, del, keys } from "idb-keyval";

const PREFIX = "luxor-clothing-";

export async function storeClothingFile(
  id: string,
  file: File
): Promise<void> {
  const arrayBuffer = await file.arrayBuffer();
  await set(`${PREFIX}${id}`, arrayBuffer);
}

export async function loadClothingFile(
  id: string
): Promise<ArrayBuffer | undefined> {
  return get(`${PREFIX}${id}`);
}

export async function removeClothingFile(id: string): Promise<void> {
  await del(`${PREFIX}${id}`);
}

export async function listClothingIds(): Promise<string[]> {
  const allKeys = await keys();
  return allKeys
    .filter((k): k is string => typeof k === "string" && k.startsWith(PREFIX))
    .map((k) => k.slice(PREFIX.length));
}
