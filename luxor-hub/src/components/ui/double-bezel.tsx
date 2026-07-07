import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DoubleBezelProps {
  children: ReactNode;
  className?: string;
  outerClassName?: string;
  innerClassName?: string;
  radius?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  glow?: "gold" | "emerald" | "none";
  hoverable?: boolean;
}

const radiusMap = {
  sm: { outer: "rounded-xl", inner: "rounded-[calc(0.75rem-0.25rem)]" },
  md: { outer: "rounded-2xl", inner: "rounded-[calc(1rem-0.375rem)]" },
  lg: { outer: "rounded-3xl", inner: "rounded-[calc(1.5rem-0.375rem)]" },
  xl: { outer: "rounded-[1.75rem]", inner: "rounded-[calc(1.75rem-0.5rem)]" },
  "2xl": { outer: "rounded-[2rem]", inner: "rounded-[calc(2rem-0.5rem)]" },
  "3xl": { outer: "rounded-[2.5rem]", inner: "rounded-[calc(2.5rem-0.625rem)]" },
};

export function DoubleBezel({
  children,
  className,
  outerClassName,
  innerClassName,
  radius = "md",
  glow = "none",
  hoverable = true,
}: DoubleBezelProps) {
  const r = radiusMap[radius];
  const glowStyles = {
    gold: "ring-1 ring-gold/10 group-hover:ring-gold/20",
    emerald: "ring-1 ring-emerald/10 group-hover:ring-emerald/20",
    none: "",
  };

  return (
    <div
      className={cn(
        "group relative",
        "p-[1.5px]",
        r.outer,
        "bg-gradient-to-b from-white/[0.06] to-transparent",
        "shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]",
        glowStyles[glow],
        "transition-all duration-500",
        hoverable && "hover:from-white/[0.08]",
        outerClassName,
        className,
      )}
    >
      {/* Outer shell — Hairline border + subtle background */}
      <div
        className={cn(
          "h-full w-full",
          r.outer,
          "bg-emerald/10 backdrop-blur-sm",
          "border border-white/[0.04]",
          "shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]",
        )}
      >
        {/* Inner core — Main content container */}
        <div
          className={cn(
            "h-full w-full",
            r.inner,
            "bg-card/90",
            "border border-white/[0.03]",
            "shadow-[inset_0_1px_2px_rgba(255,255,255,0.08),0_4px_16px_-8px_rgba(0,0,0,0.3)]",
            "overflow-hidden",
            innerClassName,
          )}
        >
          {/* Top edge highlight */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent pointer-events-none" />

          {children}
        </div>
      </div>
    </div>
  );
}

export function DoubleBezelCard({
  children,
  className,
  ...props
}: DoubleBezelProps) {
  return (
    <DoubleBezel radius="lg" glow="gold" className={cn("h-full", className)} {...props}>
      <div className="p-5 md:p-6 h-full flex flex-col">
        {children}
      </div>
    </DoubleBezel>
  );
}

export function DoubleBezelImage({
  src,
  alt,
  className,
  aspectRatio = "aspect-[4/5]",
}: {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
}) {
  return (
    <DoubleBezel radius="lg" glow="none" hoverable={false} className={cn(aspectRatio, className)}>
      <div className="h-full w-full overflow-hidden">
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
      </div>
    </DoubleBezel>
  );
}
