import { motion } from "framer-motion";

interface Props {
  shape: string;
  gender?: string | null;
  size?: number;
  className?: string;
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

function getProportions(shape: string): ShapeSvgData {
  const s = shape.toLowerCase();
  for (const [key, val] of Object.entries(shapeProportions)) {
    if (s.includes(key)) return val;
  }
  return shapeProportions.rectangle;
}

const BodyShapeIllustration = ({ shape, size = 140, className = "" }: Props) => {
  const p = getProportions(shape);
  const cx = 50;

  // Build body silhouette path from proportions
  const path = `
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      <svg width={size * 0.7} height={size} viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id={`body-fill`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(25, 55%, 87%)" />
            <stop offset="100%" stopColor="hsl(15, 45%, 78%)" />
          </linearGradient>
          <linearGradient id={`body-stroke`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(270, 40%, 65%)" />
            <stop offset="100%" stopColor="hsl(340, 40%, 65%)" />
          </linearGradient>
        </defs>
        {/* Head */}
        <circle cx={cx} cy="10" r="6" fill="url(#body-fill)" stroke="url(#body-stroke)" strokeWidth="1.5" />
        {/* Body silhouette */}
        <motion.path
          d={path}
          fill="url(#body-fill)"
          stroke="url(#body-stroke)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        />
        {/* Measurement guides */}
        {[
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
      </svg>
    </motion.div>
  );
};

export default BodyShapeIllustration;
