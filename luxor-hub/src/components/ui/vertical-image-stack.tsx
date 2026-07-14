import { useState, useRef, useCallback } from "react";
import { motion, type PanInfo } from "framer-motion";

interface StackImage {
  id: string;
  src: string;
  name: string;
}

function ImageWithFallback({ src, alt }: { src: string; alt: string }) {
  const [errored, setErrored] = useState(false);
  const finalSrc = errored || !src ? "/placeholder.svg" : src;
  return (
    <img
      src={finalSrc}
      alt={alt}
      className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] object-contain rounded-xl bg-white dark:bg-zinc-900"
      draggable={false}
      onError={() => { if (!errored) setErrored(true); }}
    />
  );
}

function getCardStyle(index: number, currentIndex: number, total: number) {
  let diff = index - currentIndex;
  if (diff > total / 2) diff -= total;
  if (diff < -total / 2) diff += total;

  if (diff === 0) {
    return { x: 0, y: 0, scale: 1, opacity: 1, zIndex: 20, rotate: 0 };
  } else if (diff === -1 || diff === 1) {
    return {
      x: diff > 0 ? 25 : -25,
      y: diff > 0 ? 20 : -20,
      scale: 0.85,
      opacity: 0.9,
      zIndex: 10,
      rotate: diff > 0 ? 3 : -3,
    };
  } else if (diff === -2 || diff === 2) {
    return {
      x: diff > 0 ? 45 : -45,
      y: diff > 0 ? 40 : -40,
      scale: 0.7,
      opacity: 0.7,
      zIndex: 5,
      rotate: diff > 0 ? 6 : -6,
    };
  } else {
    return {
      x: diff > 0 ? 60 : -60,
      y: diff > 0 ? 60 : -60,
      scale: 0.5,
      opacity: 0,
      zIndex: 0,
      rotate: diff > 0 ? 10 : -10,
    };
  }
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
        <p className="text-zinc-500 text-xs text-center px-4">
          Select items from the gallery below to build your stack.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex w-full h-full items-center justify-center overflow-hidden">
      {images.map((image, index) => {
        const style = getCardStyle(index, currentIndex, images.length);

        return (
          <motion.div
            key={image.id}
            className="absolute cursor-grab active:cursor-grabbing"
            animate={{
              x: style.x,
              y: style.y,
              scale: style.scale,
              opacity: style.opacity,
              zIndex: style.zIndex,
              rotate: style.rotate,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag={style.zIndex === 20 ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            <div
              className="relative w-[180px] aspect-[3/4] overflow-hidden rounded-2xl bg-white dark:bg-zinc-800 ring-1 ring-white/10"
              style={{ boxShadow: "0 30px 60px -15px rgba(0,0,0,0.5)" }}
            >
              <ImageWithFallback src={image.src} alt={image.name || "Clothing item"} />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white text-[10px] font-medium truncate drop-shadow-lg bg-black/40 px-2 py-1 rounded-md w-fit backdrop-blur-sm">
                  {image.name}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
