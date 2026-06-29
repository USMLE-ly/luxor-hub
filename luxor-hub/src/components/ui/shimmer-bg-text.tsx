"use client";

import React from "react";

interface ShimmerBgTextProps {
  children: React.ReactNode;
  className?: string;
  shimmerColor?: string;
  duration?: number;
}

export function ShimmerBgText({
  children,
  className = "",
  shimmerColor = "rgba(255,255,255,0.4)",
  duration = 2.5,
}: ShimmerBgTextProps) {
  return (
    <span
      className={`relative inline-block group ${className}`}
    >
      {/* Base text */}
      <span className="relative z-10 transition-all duration-300 group-hover:brightness-110">
        {children}
      </span>

      {/* Shimmer overlay on hover */}
      <span
        className="absolute inset-0 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(
            120deg,
            transparent 0%,
            transparent 30%,
            ${shimmerColor} 50%,
            transparent 70%,
            transparent 100%
          )`,
          backgroundSize: "200% 100%",
          animation: `shimmer-slide ${duration}s ease-in-out infinite`,
        }}
      />
    </span>
  );
}
