"use client";

import React from "react";
import { motion } from "motion/react";

interface MarkerHighlightProps {
  before?: string;
  highlight: string;
  after?: string;
  markerColor?: string;
  baseColor?: string;
  highlightedTextColor?: string;
  fontSize?: number;
  fontWeight?: number;
  speed?: number;
  className?: string;
}

export function MarkerHighlight({
  before = "",
  highlight = "",
  after = "",
  markerColor = "#facc15",
  baseColor = "#ffffff",
  highlightedTextColor = "#171717",
  fontSize = 56,
  fontWeight = 700,
  speed = 1.2,
  className = "",
}: MarkerHighlightProps) {
  const duration = 1.2 / speed;

  return (
    <span className={`relative inline-flex items-baseline gap-0 ${className}`}>
      {/* Before text */}
      {before && (
        <span
          style={{ color: baseColor, fontSize, fontWeight, lineHeight: 1 }}
          className="relative z-10"
        >
          {before}
        </span>
      )}

      {/* Highlighted text with animated marker underline */}
      <span className="relative inline-block" style={{ lineHeight: 1 }}>
        <span
          style={{
            color: highlightedTextColor,
            fontSize,
            fontWeight,
            lineHeight: 1,
          }}
          className="relative z-10 px-1"
        >
          {highlight}
        </span>

        {/* Animated marker underline */}
        <motion.span
          className="absolute left-0 bottom-0 right-0 h-[0.35em] -z-0 rounded-sm"
          style={{ backgroundColor: markerColor }}
          initial={{ scaleX: 0, transformOrigin: "left" }}
          animate={{ scaleX: 1 }}
          transition={{ duration, ease: [0.25, 0.1, 0.25, 1], delay: 0.3 }}
        />
      </span>

      {/* After text */}
      {after && (
        <span
          style={{ color: baseColor, fontSize, fontWeight, lineHeight: 1 }}
          className="relative z-10"
        >
          {after}
        </span>
      )}
    </span>
  );
}
