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
      <div className="flex h-full w-full items-center justify-center bg-zinc-900/50 rounded-xl">
        <p className="text-zinc-500 text-xs text-center px-4">Select items from the gallery below to build your stack.</p>
      </div>
    );
  }

  return (
    <div className="relative flex w-full h-full items-center justify-center overflow-hidden">
      {images.map((image, index) => {
        let diff = index - currentIndex;
        const total = images.length;
        if (diff > total / 2) diff -= total;
        if (diff < -total / 2) diff += total;

        const y = diff === 0 ? 0 : diff === -1 ? -80 : diff === 1 ? 80 : diff < 0 ? -160 : 160;
        const scale = diff === 0 ? 1 : Math.abs(diff) === 1 ? 0.9 : 0.8;
        const opacity = diff === 0 ? 1 : Math.abs(diff) === 1 ? 0.85 : 0.5;
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
            <div className="relative w-[180px] aspect-[3/4] overflow-hidden rounded-xl bg-zinc-800 shadow-2xl ring-1 ring-white/10">
              <img
                src={image.src || "/placeholder.svg"}
                alt={image.name || "Clothing item"}
                className="absolute inset-0 w-full h-full object-contain p-2"
                draggable={false}
              />
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                <p className="text-white text-[10px] font-medium truncate">{image.name}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
