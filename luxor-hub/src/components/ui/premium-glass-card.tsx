import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PremiumGlassCardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  glowColor?: "gold" | "emerald" | "none";
}

export function PremiumGlassCard({
  children,
  className,
  hoverable = true,
  glowColor = "gold",
}: PremiumGlassCardProps) {
  return (
    <div className={cn("relative group", className)}>
      {/* Outer glow ring */}
      {glowColor !== "none" && (
        <div
          className={cn(
            "absolute -inset-[1px] rounded-2xl opacity-0 transition-opacity duration-500",
            hoverable && "group-hover:opacity-100"
          )}
          style={{
            background:
              glowColor === "gold"
                ? "linear-gradient(135deg, hsl(var(--gold) / 0.2), transparent 50%, hsl(var(--gold) / 0.1))"
                : "linear-gradient(135deg, hsl(var(--emerald) / 0.3), transparent 50%)",
          }}
        />
      )}

      {/* Double-bezel nested card */}
      <div className="relative rounded-2xl border border-white/10 bg-card/70 backdrop-blur-xl shadow-lg overflow-hidden">
        {/* Inner highlight */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-white/8 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}

export function GoldBadge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-gold/20 bg-gold/8 px-3 py-1 text-[10px] font-sans font-medium uppercase tracking-[0.15em] text-gold",
        className
      )}
    >
      {children}
    </span>
  );
}

export function GoldShimmerText({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "bg-gradient-to-r from-foreground via-gold to-foreground bg-[length:200%_100%] animate-[shimmer_3s_ease-in-out_infinite] bg-clip-text text-transparent",
        className
      )}
    >
      {children}
    </span>
  );
}
