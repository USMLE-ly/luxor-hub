"use client";

import React from "react";
import { cn } from "@/lib/utils";

export const BoxesCore = ({ className, ...rest }: { className?: string }) => {
  return (
    <div
      className={cn(
        "absolute inset-0 w-full h-full z-0 overflow-hidden",
        className
      )}
      {...rest}
    >
      {/* Lightweight CSS grid pattern instead of 15,000 motion divs */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--primary) / 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--primary) / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      {/* Diagonal accent lines */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 80px,
            hsl(var(--primary) / 0.2) 80px,
            hsl(var(--primary) / 0.2) 81px
          )`,
        }}
      />
      {/* Corner crosses using pure CSS */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid-crosses" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M30 25v10M25 30h10" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-primary" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-crosses)" />
      </svg>
    </div>
  );
};

export const Boxes = React.memo(BoxesCore);
