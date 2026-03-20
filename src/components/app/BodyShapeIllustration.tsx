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
  neckWidth: number;
}

const shapeProportions: Record<string, ShapeSvgData> = {
  hourglass:  { shoulders: 38, bust: 36, waist: 22, hips: 38, neckWidth: 6 },
  pear:       { shoulders: 28, bust: 27, waist: 24, hips: 40, neckWidth: 5.5 },
  triangle:   { shoulders: 28, bust: 27, waist: 24, hips: 40, neckWidth: 5.5 },
  inverted:   { shoulders: 44, bust: 40, waist: 28, hips: 28, neckWidth: 7 },
  trapezoid:  { shoulders: 42, bust: 38, waist: 30, hips: 32, neckWidth: 7 },
  rectangle:  { shoulders: 34, bust: 32, waist: 30, hips: 34, neckWidth: 6 },
  athletic:   { shoulders: 38, bust: 34, waist: 28, hips: 32, neckWidth: 6.5 },
  round:      { shoulders: 32, bust: 36, waist: 40, hips: 36, neckWidth: 6 },
  oval:       { shoulders: 32, bust: 36, waist: 40, hips: 36, neckWidth: 6 },
  apple:      { shoulders: 34, bust: 38, waist: 40, hips: 32, neckWidth: 6 },
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
  const sH = p.shoulders / 2;
  const bH = p.bust / 2;
  const wH = p.waist / 2;
  const hH = p.hips / 2;
  const nH = p.neckWidth / 2;

  // More anatomical path with smooth curves
  return `
    M${cx},14
    C${cx + 3},14 ${cx + nH},16 ${cx + nH},18
    L${cx + nH + 1},22
    Q${cx + sH * 0.6},23 ${cx + sH},28
    C${cx + sH + 1},30 ${cx + bH + 1},33 ${cx + bH},36
    Q${cx + bH - 1},40 ${cx + wH},46
    C${cx + wH},50 ${cx + wH + 1},52 ${cx + hH},58
    Q${cx + hH + 1},62 ${cx + hH},66
    L${cx + hH - 1},74
    Q${cx + hH - 2},78 ${cx + hH - 1},80
    L${cx + 7},90
    Q${cx + 6},92 ${cx + 4},92
    L${cx + 5},82
    Q${cx + 2},68 ${cx + 1.5},64
    L${cx},60
    L${cx - 1.5},64
    Q${cx - 2},68 ${cx - 5},82
    L${cx - 4},92
    Q${cx - 6},92 ${cx - 7},90
    L${cx - hH + 1},80
    Q${cx - hH + 2},78 ${cx - hH + 1},74
    L${cx - hH},66
    Q${cx - hH - 1},62 ${cx - hH},58
    C${cx - wH - 1},52 ${cx - wH},50 ${cx - wH},46
    Q${cx - bH + 1},40 ${cx - bH},36
    C${cx - bH - 1},33 ${cx - sH - 1},30 ${cx - sH},28
    Q${cx - sH * 0.6},23 ${cx - nH - 1},22
    L${cx - nH},18
    C${cx - nH},16 ${cx - 3},14 ${cx},14Z
  `;
}

// Arms path
function buildArms(p: ShapeSvgData): string {
  const cx = 50;
  const sH = p.shoulders / 2;
  return `
    M${cx + sH},28 Q${cx + sH + 6},32 ${cx + sH + 8},42 Q${cx + sH + 9},48 ${cx + sH + 7},52
    M${cx - sH},28 Q${cx - sH - 6},32 ${cx - sH - 8},42 Q${cx - sH - 9},48 ${cx - sH - 7},52
  `;
}

const BodyShapeIllustration = ({ shape, size = 160, className = "", morphing = false }: Props) => {
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

  const path = useMemo(() => buildPath(p), [p]);
  const armsPath = useMemo(() => buildArms(p), [p]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      <svg width={size * 0.75} height={size} viewBox="0 0 100 100" fill="none">
        <defs>
          {/* Rich skin gradient with multiple stops */}
          <linearGradient id="bi-skin" x1="25%" y1="0%" x2="75%" y2="100%">
            <stop offset="0%" stopColor="hsl(28, 72%, 90%)" />
            <stop offset="30%" stopColor="hsl(22, 68%, 84%)" />
            <stop offset="60%" stopColor="hsl(18, 62%, 78%)" />
            <stop offset="100%" stopColor="hsl(14, 55%, 72%)" />
          </linearGradient>
          {/* Left-edge highlight for 3D */}
          <linearGradient id="bi-highlight" x1="0%" y1="20%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="hsl(35, 85%, 94%)" stopOpacity="0.7" />
            <stop offset="40%" stopColor="hsl(25, 70%, 88%)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
          {/* Right shadow for depth */}
          <linearGradient id="bi-inner-shadow" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(12, 45%, 55%)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
          {/* Premium stroke */}
          <linearGradient id="bi-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary) / 0.5)" />
            <stop offset="50%" stopColor="hsl(var(--primary) / 0.7)" />
            <stop offset="100%" stopColor="hsl(var(--primary) / 0.4)" />
          </linearGradient>
          {/* Outer glow */}
          <filter id="bi-glow" x="-20%" y="-10%" width="140%" height="130%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feColorMatrix values="0 0 0 0 0.7  0 0 0 0 0.55  0 0 0 0 0.3  0 0 0 0.12 0" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Soft drop shadow */}
          <filter id="bi-drop" x="-10%" y="-10%" width="120%" height="125%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="hsl(15, 40%, 20%)" floodOpacity="0.18" />
          </filter>
          {/* Center light for specular highlight */}
          <radialGradient id="bi-specular" cx="42%" cy="35%" r="40%">
            <stop offset="0%" stopColor="white" stopOpacity="0.18" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient glow behind body */}
        <ellipse cx={cx} cy="52" rx="28" ry="38" fill="hsl(var(--primary))" opacity="0.04" />

        {/* Head */}
        <circle cx={cx} cy="9" r="7" fill="url(#bi-skin)" stroke="url(#bi-stroke)" strokeWidth="0.8" filter="url(#bi-drop)" />
        <circle cx={cx} cy="9" r="7" fill="url(#bi-highlight)" />
        <circle cx={cx} cy="9" r="7" fill="url(#bi-specular)" />
        {/* Hair hint */}
        <path d={`M${cx - 5},6 Q${cx - 3},3 ${cx},2.5 Q${cx + 3},3 ${cx + 5},6`} stroke="hsl(15, 30%, 40%)" strokeWidth="0.6" fill="none" opacity="0.3" />

        {/* Arms */}
        <motion.path
          d={armsPath}
          stroke="url(#bi-stroke)"
          strokeWidth="0.7"
          fill="none"
          strokeLinecap="round"
          opacity="0.5"
          animate={{ d: armsPath }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Body silhouette — main fill */}
        <motion.path
          d={path}
          fill="url(#bi-skin)"
          stroke="url(#bi-stroke)"
          strokeWidth="0.9"
          strokeLinejoin="round"
          filter="url(#bi-drop)"
          animate={{ d: path }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* Highlight overlay */}
        <motion.path
          d={path}
          fill="url(#bi-highlight)"
          stroke="none"
          animate={{ d: path }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* Inner shadow for depth */}
        <motion.path
          d={path}
          fill="url(#bi-inner-shadow)"
          stroke="none"
          animate={{ d: path }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* Specular center highlight */}
        <motion.path
          d={path}
          fill="url(#bi-specular)"
          stroke="none"
          animate={{ d: path }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Measurement guides */}
        {!morphing && [
          { y: 28, w: p.shoulders, label: "S" },
          { y: 46, w: p.waist, label: "W" },
          { y: 62, w: p.hips, label: "H" },
        ].map((m, i) => (
          <motion.g key={m.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.15 }}>
            {/* Guide line */}
            <line
              x1={cx - m.w / 2 - 6} y1={m.y} x2={cx + m.w / 2 + 6} y2={m.y}
              stroke="hsl(var(--primary))" strokeWidth="0.35" strokeDasharray="1.5,2" opacity="0.35"
            />
            {/* End dots */}
            <circle cx={cx - m.w / 2 - 6} cy={m.y} r="1.2" fill="hsl(var(--primary))" opacity="0.4" />
            <circle cx={cx + m.w / 2 + 6} cy={m.y} r="1.2" fill="hsl(var(--primary))" opacity="0.4" />
            {/* Label */}
            <text
              x={cx + m.w / 2 + 9} y={m.y + 1.5}
              fontSize="4" fill="hsl(var(--primary))" opacity="0.4" fontFamily="sans-serif" fontWeight="600"
            >
              {m.label}
            </text>
          </motion.g>
        ))}

        {/* Scanning line when morphing */}
        {morphing && (
          <motion.line
            x1="12" x2="88"
            stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.35"
            animate={{ y1: [15, 85, 15], y2: [15, 85, 15] }}
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
