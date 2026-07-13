import { useState, useRef, useCallback } from "react";
import { motion, type PanInfo } from "framer-motion";

interface StackImage {
  id: string;
  src: string;
  name: string;
}

export function VerticalImageStack({ images = [] }: { images: StackImage[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const lastNavTime = useRef(0);

  const navigate = useCallback((dir: number) => {
    const now = Date.now();
    if (now - lastNavTime.current < 400) return;
    lastNavTime.current = now;
    setCurrentIndex((prev) => {
      if (dir > 0) return prev >= images.length - 1 ? 0 : prev + 1;
      return prev <= 0 ? images.length - 1 : prev - 1;
    });
  }, [images.length]);

  const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
    if (info.offset.y < -50) navigate(1);
    else if (info.offset.y > 50) navigate(-1);
  }, [navigate]);

  if (!images || images.length === 0) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700">
        <div className="text-center">
          <span className="text-4xl block mb-2">👗</span>
          <p className="text-zinc-400 text-sm">Select items from the closet sidebar to build an outfit.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex w-full h-[450px] items-center justify-center overflow-hidden">
      {images.map((image, index) => {
        let diff = index - currentIndex;
        const total = images.length;
        if (diff > total / 2) diff -= total;
        if (diff < -total / 2) diff += total;

        const y = diff === 0 ? 0 : diff === -1 ? -120 : diff === 1 ? 120 : diff < 0 ? -220 : 220;
        const scale = diff === 0 ? 1 : Math.abs(diff) === 1 ? 0.9 : 0.8;
        const opacity = diff === 0 ? 1 : Math.abs(diff) === 1 ? 0.7 : 0;
        const zIndex = diff === 0 ? 5 : Math.abs(diff) === 1 ? 4 : 3;

        return (
          <motion.div
            key={image.id}
            className="absolute cursor-grab active:cursor-grabbing"
            animate={{ y, scale, opacity, zIndex }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag={diff === 0 ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            <div className="relative h-[380px] w-[260px] overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl ring-1 ring-zinc-200/50 dark:ring-zinc-800/50">
              <img
                src={image.src || "/placeholder.svg"}
                alt={image.name || "Clothing item"}
                className="absolute inset-0 w-full h-full object-contain p-4"
                draggable={false}
              />
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-white text-xs font-medium truncate">{image.name}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 z-10">
          <span className="text-[10px] text-white/70">
            {currentIndex + 1} / {images.length} · Swipe
          </span>
        </div>
      )}
    </div>
  );
}
