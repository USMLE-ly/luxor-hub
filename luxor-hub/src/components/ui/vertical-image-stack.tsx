import { useWardrobeStore, type Category } from "@/store/useWardrobeStore";
import { useState, useMemo, useCallback } from "react";

interface Slot {
  category: Category;
  label: string;
  emoji: string;
}

const SLOTS: Slot[] = [
  { category: "top", label: "Top", emoji: "👕" },
  { category: "bottom", label: "Bottom", emoji: "👖" },
  { category: "accessory", label: "Shoes", emoji: "👟" },
];

export function VerticalImageStack() {
  const catalogItems = useWardrobeStore((s) => s.catalogItems);
  const selected = useWardrobeStore((s) => s.selected);
  const toggleClothing = useWardrobeStore((s) => s.toggleClothing);

  // Track which index each category is on (for cycling)
  const [indices, setIndices] = useState<Record<Category, number>>({
    top: 0,
    bottom: 0,
    accessory: 0,
  });

  // Group items by category
  const itemsByCategory = useMemo(() => {
    const grouped: Record<Category, typeof catalogItems> = {
      top: [],
      bottom: [],
      accessory: [],
    };
    for (const item of catalogItems) {
      const cat = item.category as Category;
      if (grouped[cat]) grouped[cat].push(item);
    }
    return grouped;
  }, [catalogItems]);

  // Cycle through items in a category
  const cycleCategory = useCallback(
    (category: Category) => {
      const items = itemsByCategory[category];
      if (items.length === 0) return;

      const nextIndex = (indices[category] + 1) % items.length;
      setIndices((prev) => ({ ...prev, [category]: nextIndex }));

      // Auto-select this item in Zustand
      const nextItem = items[nextIndex];
      if (nextItem) {
        toggleClothing(category, nextItem.id);
      }
    },
    [itemsByCategory, indices, toggleClothing]
  );

  // Get the current item for each slot
  const currentItems = useMemo(() => {
    return SLOTS.map((slot) => {
      const items = itemsByCategory[slot.category];
      const idx = indices[slot.category] % Math.max(items.length, 1);
      return {
        ...slot,
        item: items.length > 0 ? items[idx] : null,
        count: items.length,
        currentIndex: items.length > 0 ? idx : 0,
      };
    });
  }, [itemsByCategory, indices]);

  const totalItems = catalogItems.length;
  const selectedCount = Object.values(selected).filter(Boolean).length;

  return (
    <div className="relative w-full h-full bg-zinc-950 overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent pt-3 pb-6 px-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] font-sans font-semibold text-white/90 uppercase tracking-wider">
            Build Outfit
          </p>
          {selectedCount > 0 && (
            <span className="text-[9px] font-sans font-bold text-[#E8C87A] bg-[#E8C87A]/15 px-2 py-0.5 rounded-full">
              {selectedCount}/3
            </span>
          )}
        </div>
      </div>

      {/* Vertical outfit stack — fills the phone */}
      <div className="absolute inset-0 flex flex-col pt-10 pb-12">
        {currentItems.map((slot, slotIdx) => (
          <div
            key={slot.category}
            className="flex-1 relative cursor-pointer min-h-0"
            onClick={() => cycleCategory(slot.category)}
          >
            {slot.item ? (
              <>
                {/* Item image */}
                <img
                  src={
                    slot.item.imageUrl ||
                    slot.item.src ||
                    "/placeholder.svg"
                  }
                  alt={slot.item.name || slot.label}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
                {/* Category label */}
                <div className="absolute top-1 left-2 z-10 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
                  <span className="text-[9px] font-sans font-semibold text-white">
                    {slot.emoji} {slot.label}
                  </span>
                </div>
                {/* Item name */}
                <div className="absolute bottom-1 left-2 right-2 z-10 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
                  <p className="text-[9px] font-sans text-white/80 truncate">
                    {slot.item.name || "Unnamed"}
                  </p>
                </div>
                {/* Tap hint */}
                {slot.count > 1 && (
                  <div className="absolute top-1 right-2 z-10 bg-black/40 rounded-full px-1.5 py-0.5">
                    <span className="text-[8px] text-white/50">
                      {slot.currentIndex + 1}/{slot.count} tap →
                    </span>
                  </div>
                )}
              </>
            ) : (
              /* Empty slot */
              <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/50 border border-dashed border-zinc-700">
                <span className="text-2xl mb-1">{slot.emoji}</span>
                <p className="text-[10px] text-zinc-500">
                  {slot.count === 0
                    ? `No ${slot.label.toLowerCase()}s in closet`
                    : "Tap to select"}
                </p>
              </div>
            )}
            {/* Divider between slots */}
            {slotIdx < SLOTS.length - 1 && (
              <div className="absolute bottom-0 left-4 right-4 h-px bg-white/10" />
            )}
          </div>
        ))}
      </div>

      {/* Bottom instruction */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent pt-6 pb-2 px-3">
        <p className="text-[9px] text-white/40 text-center">
          {totalItems === 0
            ? "Add clothing in the Closet page"
            : "Tap each layer to cycle through items"}
        </p>
      </div>
    </div>
  );
}
