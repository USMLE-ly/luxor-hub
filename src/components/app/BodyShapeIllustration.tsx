import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  shape: string;
  gender?: string | null;
  size?: number;
  className?: string;
  morphing?: boolean;
}

interface ShapeSvgData {
  shoulders: number;
  bust: number;
  waist: number;
  hips: number;
}

const shapeProportions: Record<string, ShapeSvgData> = {
  hourglass:  { shoulders: 38, bust: 36, waist: 24, hips: 38 },
  pear:       { shoulders: 30, bust: 28, waist: 25, hips: 40 },
  triangle:   { shoulders: 30, bust: 28, waist: 25, hips: 40 },
  inverted:   { shoulders: 42, bust: 38, waist: 28, hips: 30 },
  trapezoid:  { shoulders: 42, bust: 38, waist: 30, hips: 32 },
  rectangle:  { shoulders: 34, bust: 32, waist: 30, hips: 34 },
  athletic:   { shoulders: 36, bust: 34, waist: 30, hips: 34 },
  round:      { shoulders: 34, bust: 36, waist: 38, hips: 36 },
  oval:       { shoulders: 34, bust: 36, waist: 38, hips: 36 },
  apple:      { shoulders: 34, bust: 36, waist: 38, hips: 34 },
};

const morphKeys = ["rectangle", "hourglass", "pear", "inverted", "round", "trapezoid"];

function getProportions(shape: string): ShapeSvgData {
  const s = shape.toLowerCase();
  for (const [key, val] of Object.entries(shapeProportions)) {
    if (s.includes(key)) return val;
  }
  return shapeProportions.rectangle;
}

function buildPath(p: ShapeSvgData): string {
  const cx = 50;
  return `
    M${cx},12
    C${cx + 4},12 ${cx + 5},14 ${cx + 5},18
    L${cx + 3},22
    C${cx + 3},22 ${cx + p.shoulders / 2},24 ${cx + p.shoulders / 2},28
    L${cx + p.bust / 2},35
    C${cx + p.bust / 2},38 ${cx + p.waist / 2},44 ${cx + p.waist / 2},48
    C${cx + p.waist / 2},52 ${cx + p.hips / 2},56 ${cx + p.hips / 2},62
    L${cx + p.hips / 2 - 2},75
    C${cx + p.hips / 2 - 2},78 ${cx + p.hips / 2 - 1},80 ${cx + p.hips / 2},82
    L${cx + 6},92
    L${cx + 3},92
    L${cx + 4},82
    L${cx + 1},62
    L${cx},58
    L${cx - 1},62
    L${cx - 4},82
    L${cx - 3},92
    L${cx - 6},92
    L${cx - p.hips / 2},82
    C${cx - p.hips / 2 + 1},80 ${cx - p.hips / 2 + 2},78 ${cx - p.hips / 2 + 2},75
    L${cx - p.hips / 2},62
    C${cx - p.hips / 2},56 ${cx - p.waist / 2},52 ${cx - p.waist / 2},48
    C${cx - p.waist / 2},44 ${cx - p.bust / 2},38 ${cx - p.bust / 2},35
    L${cx - p.shoulders / 2},28
    C${cx - p.shoulders / 2},24 ${cx - 3},22 ${cx - 3},22
    L${cx - 5},18
    C${cx - 5},14 ${cx - 4},12 ${cx},12Z
  `;
}

const BodyShapeIllustration = ({ shape, size = 140, className = "", morphing = false }: Props) => {
  const cx = 50;
  const [morphIndex, setMorphIndex] = useState(0);

  useEffect(() => {
    if (!morphing) return;
    const interval = setInterval(() => {
      setMorphIndex((prev) => (prev + 1) % morphKeys.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [morphing]);

  const activeKey = morphing ? morphKeys[morphIndex] : null;
  const p = morphing
    ? shapeProportions[activeKey!] || shapeProportions.rectangle
    : getProportions(shape);

  const path = useMemo(() => buildPath(p), [p.shoulders, p.bust, p.waist, p.hips]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      <svg width={size * 0.7} height={size} viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="body-fill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(25, 55%, 87%)" />
            <stop offset="100%" stopColor="hsl(15, 45%, 78%)" />
          </linearGradient>
          <linearGradient id="body-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(270, 40%, 65%)" />
            <stop offset="100%" stopColor="hsl(340, 40%, 65%)" />
          </linearGradient>
        </defs>
        {/* Head */}
        <circle cx={cx} cy="10" r="6" fill="url(#body-fill)" stroke="url(#body-stroke)" strokeWidth="1.5" />
        {/* Body silhouette with morphing */}
        <motion.path
          d={path}
          fill="url(#body-fill)"
          stroke="url(#body-stroke)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          animate={{ d: path }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* Measurement guides - only when settled */}
        {!morphing && [
          { y: 28, w: p.shoulders, label: "Shoulders" },
          { y: 48, w: p.waist, label: "Waist" },
          { y: 62, w: p.hips, label: "Hips" },
        ].map((m, i) => (
          <motion.g key={m.label} initial={{ opacity: 0 }} animate={{ opacity: 0.35 }} transition={{ delay: 0.6 + i * 0.15 }}>
            <line x1={cx - m.w / 2 - 3} y1={m.y} x2={cx + m.w / 2 + 3} y2={m.y} stroke="hsl(270, 40%, 65%)" strokeWidth="0.5" strokeDasharray="2,2" />
            <circle cx={cx - m.w / 2 - 3} cy={m.y} r="1" fill="hsl(270, 40%, 65%)" />
            <circle cx={cx + m.w / 2 + 3} cy={m.y} r="1" fill="hsl(270, 40%, 65%)" />
          </motion.g>
        ))}
        {/* Scanning line when morphing */}
        {morphing && (
          <motion.line
            x1="15" x2="85"
            stroke="hsl(270, 40%, 65%)" strokeWidth="1" opacity="0.5"
            animate={{ y1: [20, 80, 20], y2: [20, 80, 20] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          />
        )}
      </svg>
      {/* Shape label when morphing */}
      {morphing && (
        <AnimatePresence mode="wait">
          <motion.p
            key={activeKey}
            className="text-xs font-sans text-muted-foreground text-center mt-1 capitalize"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 0.6, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
          >
            {activeKey}?
          </motion.p>
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default BodyShapeIllustration;
