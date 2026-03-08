import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnimatedBorderProps {
  children: ReactNode;
  className?: string;
  borderRadius?: string;
  borderWidth?: number;
}

export function AnimatedBorder({
  children,
  className,
  borderRadius = "1.5rem",
  borderWidth = 1,
}: AnimatedBorderProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Animated conic gradient border */}
      <div
        className="absolute -inset-px rounded-[var(--br)] animate-[spin_6s_linear_infinite] opacity-60"
        style={{
          "--br": borderRadius,
          background: `conic-gradient(from var(--angle, 0deg), hsl(var(--primary) / 0.05), hsl(var(--primary) / 0.4), hsl(var(--primary) / 0.05), hsl(var(--primary) / 0.2), hsl(var(--primary) / 0.05))`,
          padding: `${borderWidth}px`,
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        } as React.CSSProperties}
      />
      <div className="relative" style={{ borderRadius }}>
        {children}
      </div>
    </div>
  );
}
