import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useSyncExternalStore } from "react";

// ── Types ──────────────────────────────────────────────────
export type Category = "top" | "bottom" | "accessory";

export interface ClothingItem {
  id: string;
  name: string;
  src: string; // blob: URL (session) or file path (/models/...)
  category: Category;
}

interface WardrobeState {
  gender: "male" | "female";
  selected: Record<Category, string | null>;
  catalogItems: ClothingItem[];
  setGender: (gender: "male" | "female") => void;
  toggleClothing: (category: Category, id: string) => void;
  clearOutfit: () => void;
  addCustomClothing: (item: ClothingItem) => void;
  updateClothingSrc: (id: string, src: string) => void;
}

// ── Store ──────────────────────────────────────────────────
export const useWardrobeStore = create<WardrobeState>()(
  persist(
    (set) => ({
      gender: "male",
      selected: { top: null, bottom: null, accessory: null },
      catalogItems: [],

      setGender: (gender) => set({ gender }),

      toggleClothing: (category, id) =>
        set((state) => ({
          selected: {
            ...state.selected,
            [category]: state.selected[category] === id ? null : id,
          },
        })),

      clearOutfit: () =>
        set({ selected: { top: null, bottom: null, accessory: null } }),

      addCustomClothing: (item) =>
        set((state) => ({
          catalogItems: [...state.catalogItems, item],
        })),

      updateClothingSrc: (id, src) =>
        set((state) => ({
          catalogItems: state.catalogItems.map((item) =>
            item.id === id ? { ...item, src } : item
          ),
        })),
    }),
    {
      name: "luxor-wardrobe",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist metadata — blob URLs can't survive serialization
        gender: state.gender,
        selected: state.selected,
        catalogItems: state.catalogItems.map(({ id, name, category }) => ({
          id,
          name,
          category,
        })),
      }),
      merge: (persistedState, currentState) => {
        const merged = {
          ...currentState,
          ...(persistedState as Partial<WardrobeState>),
        };
        // Ensure catalogItems have empty src — will be restored from IndexedDB
        if (merged.catalogItems) {
          merged.catalogItems = merged.catalogItems.map((item: any) => ({
            ...item,
            src: item.src || "",
          }));
        }
        return merged;
      },
    }
  )
);

// ── IndexedDB helpers (called from components, not from store) ──
const IDB_PREFIX = "luxor-clothing-";

export async function persistClothingToIDB(
  id: string,
  file: File
): Promise<void> {
  const { set: idbSet } = await import("idb-keyval");
  const buffer = await file.arrayBuffer();
  await idbSet(`${IDB_PREFIX}${id}`, buffer);
}

export async function restoreClothingFromIDB(): Promise<void> {
  const { get: idbGet } = await import("idb-keyval");
  const state = useWardrobeStore.getState();
  const items = state.catalogItems;
  if (items.length === 0) return;

  let restored = 0;
  for (const item of items) {
    // Skip items that already have a valid src (blob: or /models/...)
    if (item.src && item.src.length > 5) continue;

    try {
      const buffer = await idbGet<ArrayBuffer>(`${IDB_PREFIX}${item.id}`);
      if (buffer) {
        const blob = new Blob([buffer], { type: "model/gltf-binary" });
        const blobUrl = URL.createObjectURL(blob);
        useWardrobeStore.getState().updateClothingSrc(item.id, blobUrl);
        restored++;
      }
    } catch (err) {
      console.error(`[STORAGE] Failed to restore ${item.id}:`, err);
    }
  }

  if (restored > 0) {
    console.log(
      `[STORAGE] Restored ${restored} clothing items from IndexedDB`
    );
  }
}

// ── Hydration hook ─────────────────────────────────────────
const emptySubscribe = () => () => {};
const emptySnapshot = () => false;

export function useWardrobeHydrated(): boolean {
  return useSyncExternalStore(
    (callback) => {
      const unsub = useWardrobeStore.persist.onFinishHydration(callback);
      if (useWardrobeStore.persist.hasHydrated()) callback();
      return unsub;
    },
    () => useWardrobeStore.persist.hasHydrated(),
    () => false
  );
}
