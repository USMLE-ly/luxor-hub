import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  shape: string;
  size?: number;
  className?: string;
  morphing?: boolean;
}

const shapeOutlines: Record<string, string> = {
  oval: "M50,8 C72,8 88,25 88,42 C88,62 78,82 65,90 C58,95 42,95 35,90 C22,82 12,62 12,42 C12,25 28,8 50,8Z",
  round: "M50,10 C75,10 90,28 90,50 C90,72 75,90 50,90 C25,90 10,72 10,50 C10,28 25,10 50,10Z",
  square: "M18,15 C18,12 22,10 30,10 L70,10 C78,10 82,12 82,15 L85,60 C85,72 78,88 65,92 C58,95 42,95 35,92 C22,88 15,72 15,60Z",
  heart: "M50,10 C68,10 85,18 88,35 C90,48 82,68 70,82 C62,90 55,94 50,96 C45,94 38,90 30,82 C18,68 10,48 12,35 C15,18 32,10 50,10Z",
  oblong: "M50,5 C68,5 82,18 82,30 L84,60 C84,75 74,92 60,96 C55,97 45,97 40,96 C26,92 16,75 16,60 L18,30 C18,18 32,5 50,5Z",
  diamond: "M50,8 C55,8 68,28 78,48 C82,55 82,58 78,65 C68,80 58,92 50,92 C42,92 32,80 22,65 C18,58 18,55 22,48 C32,28 45,8 50,8Z",
  rectangle: "M22,10 L78,10 C80,10 82,12 82,14 L84,65 C84,78 74,90 60,94 C55,95 45,95 40,94 C26,90 16,78 16,65 L18,14 C18,12 20,10 22,10Z",
};

const shapeKeys = Object.keys(shapeOutlines);

function getShapeKey(shape: string): string {
  const s = shape.toLowerCase();
  if (s.includes("oval")) return "oval";
  if (s.includes("round") || s.includes("circle")) return "round";
  if (s.includes("square")) return "square";
  if (s.includes("heart") || s.includes("inverted triangle")) return "heart";
  if (s.includes("oblong") || s.includes("long")) return "oblong";
  if (s.includes("diamond")) return "diamond";
  if (s.includes("rectangle")) return "rectangle";
  return "oval";
}

const FaceShapeIllustration = ({ shape, size = 120, className = "", morphing = false }: Props) => {
  const finalKey = getShapeKey(shape);
  const [morphIndex, setMorphIndex] = useState(0);

  useEffect(() => {
    if (!morphing) return;
    const interval = setInterval(() => {
      setMorphIndex((prev) => (prev + 1) % shapeKeys.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [morphing]);

  const activeKey = morphing ? shapeKeys[morphIndex] : finalKey;
  const activePath = shapeOutlines[activeKey];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id={`face-fill-${activeKey}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(25, 60%, 88%)" />
            <stop offset="100%" stopColor="hsl(15, 50%, 80%)" />
          </linearGradient>
          <linearGradient id={`face-stroke-${activeKey}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(200, 50%, 60%)" />
            <stop offset="100%" stopColor="hsl(270, 40%, 65%)" />
          </linearGradient>
        </defs>
        {/* Face outline with morphing */}
        <motion.path
          d={activePath}
          fill={`url(#face-fill-${activeKey})`}
          stroke={`url(#face-stroke-${activeKey})`}
          strokeWidth="2"
          animate={{ d: activePath }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* Subtle features */}
        <circle cx="38" cy="40" r="2.5" fill="hsl(0, 0%, 35%)" opacity="0.5" />
        <circle cx="62" cy="40" r="2.5" fill="hsl(0, 0%, 35%)" opacity="0.5" />
        <path d="M45,58 Q50,64 55,58" stroke="hsl(0, 0%, 45%)" strokeWidth="1.5" fill="none" opacity="0.4" strokeLinecap="round" />
        <path d="M44,50 Q50,53 56,50" stroke="hsl(0, 0%, 50%)" strokeWidth="1" fill="none" opacity="0.3" strokeLinecap="round" />
        {/* Measurement lines */}
        {!morphing && (
          <>
            <motion.line
              x1="8" y1="45" x2="92" y2="45"
              stroke="hsl(200, 50%, 60%)" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.3"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.8 }}
            />
            <motion.line
              x1="50" y1="4" x2="50" y2="96"
              stroke="hsl(200, 50%, 60%)" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.3"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.7, duration: 0.8 }}
            />
          </>
        )}
        {/* Scanning line when morphing */}
        {morphing && (
          <motion.line
            x1="5" x2="95"
            stroke="hsl(200, 50%, 60%)" strokeWidth="1" opacity="0.5"
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

export default FaceShapeIllustration;
