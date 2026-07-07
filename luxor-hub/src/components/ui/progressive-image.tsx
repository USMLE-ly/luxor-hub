import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  aspectRatio?: string;
  placeholderColor?: string;
}

export function ProgressiveImage({
  src,
  alt,
  className,
  wrapperClassName,
  aspectRatio = "aspect-[4/5]",
  placeholderColor = "hsl(165 30% 22%)",
}: ProgressiveImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [src]);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-emerald/30",
        aspectRatio,
        wrapperClassName,
      )}
      style={{ backgroundColor: placeholderColor }}
    >
      {/* Blur placeholder — shows while loading */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-700",
          loaded ? "opacity-0" : "opacity-100"
        )}
      >
        <div
          className="w-full h-full"
          style={{
            background: `linear-gradient(135deg, ${placeholderColor}, ${placeholderColor}88)`,
            filter: "blur(20px)",
            transform: "scale(1.1)",
          }}
        />
        {/* Shimmer overlay */}
        <div className="absolute inset-0 -skew-x-12 animate-shimmer"
          style={{
            background: "linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.03) 50%, transparent 70%)",
            backgroundSize: "200% 100%",
          }}
        />
      </div>

      {/* Actual image */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-all duration-700",
          loaded
            ? "opacity-100 scale-100 blur-0"
            : "opacity-0 scale-[1.02] blur-[10px]",
          error && "hidden",
          className,
        )}
      />

      {/* Fallback on error */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-emerald/40">
          <div
            className="w-12 h-12 rounded-full opacity-20"
            style={{ background: `radial-gradient(circle, hsl(47 23% 48%), transparent)` }}
          />
        </div>
      )}

      {/* Subtle edge fade */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_30px_rgba(0,0,0,0.15)]" />
    </div>
  );
}
