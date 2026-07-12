import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useSyncExternalStore } from "react";

// ── Types ──────────────────────────────────────────────────
export type Category = "top" | "bottom" | "accessory";

export interface ClothingItem {
  id: string;
  name: string;
  src: string; // File path or blob URL
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
    }),
    {
      name: "luxor-wardrobe",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        gender: state.gender,
        catalogItems: state.catalogItems,
      }),
    }
  )
);

// ── Hydration hook ─────────────────────────────────────────
// Prevents UI flash by tracking when zustand/persist has hydrated from localStorage
const emptySubscribe = () => () => {};
const emptySnapshot = () => false;

export function useWardrobeHydrated(): boolean {
  return useSyncExternalStore(
    (callback) => {
      const unsub = useWardrobeStore.persist.onFinishHydration(callback);
      // Also fire immediately if already hydrated
      if (useWardrobeStore.persist.hasHydrated()) callback();
      return unsub;
    },
    () => useWardrobeStore.persist.hasHydrated(),
    () => false
  );
}
