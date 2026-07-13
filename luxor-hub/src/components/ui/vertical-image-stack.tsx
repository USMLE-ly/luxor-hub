import { useWardrobeStore } from "@/store/useWardrobeStore";
import { useState } from "react";

export function VerticalImageStack() {
  const catalogItems = useWardrobeStore((state) => state.catalogItems);
  const selected = useWardrobeStore((state) => state.selected);
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = catalogItems
    .filter((item) => item.imageUrl || item.src)
    .map((item) => ({
      id: item.id,
      src: item.imageUrl || "/placeholder.svg",
      alt: item.name,
    }));

  const activeIndex = currentIndex % Math.max(images.length, 1);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-zinc-500">
          <span className="text-4xl mb-2">👕</span>
          <p className="text-sm">No items in catalog</p>
          <p className="text-xs text-zinc-600 mt-1">Upload clothing to see them here</p>
        </div>
      ) : (
        <div className="relative w-full max-w-[200px] aspect-[3/4]">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="absolute inset-0 transition-all duration-500 ease-in-out cursor-pointer"
              style={{
                transform:
                  index === activeIndex
                    ? "translateY(0) scale(1)"
                    : index < activeIndex
                      ? "translateY(-100%) scale(0.8) rotate(-5deg)"
                      : "translateY(100%) scale(0.8) rotate(5deg)",
                opacity: index === activeIndex ? 1 : 0,
                zIndex: images.length - Math.abs(index - activeIndex),
              }}
              onClick={() => setCurrentIndex((index + 1) % images.length)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                draggable={false}
              />
            </div>
          ))}
          {/* Navigation dots */}
          <div className="absolute -bottom-6 left-0 right-0 flex justify-center gap-1">
            {images.slice(0, Math.min(images.length, 5)).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === activeIndex ? "bg-zinc-300 w-3" : "bg-zinc-600"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
