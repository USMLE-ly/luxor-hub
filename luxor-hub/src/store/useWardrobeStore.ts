import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useSyncExternalStore } from "react";
import type { OccasionResult, OccasionId } from "@/lib/occasionEngine";

// ── Types ──────────────────────────────────────────────────
export type Category = "top" | "bottom" | "accessory";

export interface ClothingItem {
  id: string;
  name: string;
  src: string; // blob: URL, file path (/models/...), or data URL
  category: Category;
  // Extended fields for richer UI (Closet page)
  color?: string;
  fit?: string;
  fabric?: string;
  imageUrl?: string;
}

interface WardrobeState {
  gender: "male" | "female";
  selected: Record<Category, string | null>;
  catalogItems: ClothingItem[];
  // Occasion engine state
  activeOccasion: OccasionId | null;
  occasionResult: OccasionResult | null;
  isCalculatingOccasion: boolean;
  setGender: (gender: "male" | "female") => void;
  toggleClothing: (category: Category, id: string) => void;
  clearOutfit: () => void;
  addCustomClothing: (item: ClothingItem) => void;
  removeClothing: (id: string) => void;
  updateClothingSrc: (id: string, src: string) => void;
  setActiveOccasion: (occasion: OccasionId | null) => void;
  setOccasionResult: (result: OccasionResult | null) => void;
  setIsCalculatingOccasion: (loading: boolean) => void;
  resetClosetData: () => void;
}

// ── Store ──────────────────────────────────────────────────
export const useWardrobeStore = create<WardrobeState>()(
  persist(
    (set, get) => ({
      gender: "male",
      selected: { top: null, bottom: null, accessory: null },
      catalogItems: [],
      activeOccasion: null,
      occasionResult: null,
      isCalculatingOccasion: false,

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
        set((state) => {
          const exists = state.catalogItems.some((c) => c.id === item.id);
          if (exists) {
            return {
              catalogItems: state.catalogItems.map((c) =>
                c.id === item.id ? { ...c, ...item } : c
              ),
            };
          }
          return { catalogItems: [...state.catalogItems, item] };
        }),

      removeClothing: (id) =>
        set((state) => ({
          catalogItems: state.catalogItems.filter((c) => c.id !== id),
          selected: {
            ...state.selected,
            top: state.selected.top === id ? null : state.selected.top,
            bottom: state.selected.bottom === id ? null : state.selected.bottom,
            accessory: state.selected.accessory === id ? null : state.selected.accessory,
          },
        })),

      updateClothingSrc: (id, src) =>
        set((state) => ({
          catalogItems: state.catalogItems.map((item) =>
            item.id === id ? { ...item, src } : item
          ),
        })),

      setActiveOccasion: (occasion) => set({ activeOccasion: occasion }),
      setOccasionResult: (result) => set({ occasionResult: result }),
      setIsCalculatingOccasion: (loading) => set({ isCalculatingOccasion: loading }),

      resetClosetData: () => {
        set({
          catalogItems: [],
          selected: { top: null, bottom: null, accessory: null },
        });
        localStorage.removeItem("luxor-wardrobe");
      },
    }),
    {
      name: "luxor-wardrobe",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        gender: state.gender,
        selected: state.selected,
        catalogItems: state.catalogItems.map(({ id, name, category, color, fit, fabric, imageUrl }) => ({
          id, name, category, color, fit, fabric, imageUrl,
        })),
      }),
      merge: (persistedState, currentState) => {
        const merged = {
          ...currentState,
          ...(persistedState as Partial<WardrobeState>),
        };
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

// ── IndexedDB helpers ──────────────────────────────────────
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
    console.log(`[STORAGE] Restored ${restored} clothing items from IndexedDB`);
  }
}

// ── Hydration hook ─────────────────────────────────────────
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
