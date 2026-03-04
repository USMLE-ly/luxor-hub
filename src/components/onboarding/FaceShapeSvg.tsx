/**
 * Face shape SVG illustrations with exaggerated, visually distinct outlines.
 * Each face shape is immediately recognizable at a glance.
 */

interface FaceShapeSvgProps {
  shape: string;
  size?: number;
  className?: string;
}

// Subtle facial features
const faceFeatures = `
  M40,42 C40,40 43,39 44,41
  M56,41 C57,39 60,40 60,42
  M47,52 Q50,54 53,52
  M45,60 Q50,64 55,60
`;

// Exaggerated face shape outlines — very distinct from each other
const faceShapePaths: Record<string, { outline: string; overlay: string }> = {
  // Oval: classic egg shape, narrower at forehead and chin, widest at cheeks
  Oval: {
    outline: `M50,10 C70,10 82,30 82,46 C82,64 72,82 62,88 C57,91 43,91 38,88 C28,82 18,64 18,46 C18,30 30,10 50,10 Z`,
    overlay: `M50,13 C68,13 79,31 79,46 C79,63 70,80 61,86 C56,89 44,89 39,86 C30,80 21,63 21,46 C21,31 32,13 50,13 Z`,
  },
  // Round: perfect circle, equal width and height
  Round: {
    outline: `M50,12 C74,12 88,28 88,50 C88,72 74,88 50,88 C26,88 12,72 12,50 C12,28 26,12 50,12 Z`,
    overlay: `M50,15 C72,15 85,30 85,50 C85,70 72,85 50,85 C28,85 15,70 15,50 C15,30 28,15 50,15 Z`,
  },
  // Square: very angular, strong jaw, flat forehead, boxy
  Square: {
    outline: `M20,14 L80,14 C82,14 84,16 84,18 L86,56 C86,70 76,86 64,90 C58,92 42,92 36,90 C24,86 14,70 14,56 L16,18 C16,16 18,14 20,14 Z`,
    overlay: `M23,17 L77,17 C79,17 81,19 81,21 L83,55 C83,68 74,83 63,87 C57,89 43,89 37,87 C26,83 17,68 17,55 L19,21 C19,19 21,17 23,17 Z`,
  },
  // Heart: very wide forehead, dramatically narrow pointed chin
  Heart: {
    outline: `M50,10 C68,10 88,18 90,36 C92,50 84,66 72,78 C64,86 56,94 50,98 C44,94 36,86 28,78 C16,66 8,50 10,36 C12,18 32,10 50,10 Z`,
    overlay: `M50,13 C66,13 85,20 87,37 C89,49 82,64 71,76 C63,84 55,92 50,95 C45,92 37,84 29,76 C18,64 11,49 13,37 C15,20 34,13 50,13 Z`,
  },
  // Oblong: very elongated and narrow — much taller than wide
  Oblong: {
    outline: `M50,2 C62,2 70,14 70,26 L72,50 C72,68 66,86 58,92 C55,94 45,94 42,92 C34,86 28,68 28,50 L30,26 C30,14 38,2 50,2 Z`,
    overlay: `M50,5 C60,5 67,16 67,27 L69,49 C69,66 64,84 57,90 C54,92 46,92 43,90 C36,84 31,66 31,49 L33,27 C33,16 40,5 50,5 Z`,
  },
  // Diamond: very narrow forehead & chin, extremely wide cheekbones
  Diamond: {
    outline: `M50,6 C54,6 58,16 78,40 C90,54 90,58 78,70 C62,84 56,94 50,94 C44,94 38,84 22,70 C10,58 10,54 22,40 C42,16 46,6 50,6 Z`,
    overlay: `M50,10 C53,10 56,18 76,41 C87,54 87,57 76,68 C61,82 55,91 50,91 C45,91 39,82 24,68 C13,57 13,54 24,41 C44,18 47,10 50,10 Z`,
  },
};

const FaceShapeSvg = ({ shape, size = 60, className = "" }: FaceShapeSvgProps) => {
  const shapeDef = faceShapePaths[shape];
  if (!shapeDef) return null;

  return (
    <div className={className}>
      <svg
        width={size}
        height={size * 1.2}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shape overlay — peach fill with orange outline */}
        <path
          d={shapeDef.overlay}
          fill="hsl(22, 80%, 87%)"
          fillOpacity="0.7"
          stroke="hsl(18, 85%, 58%)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Face outline on top */}
        <path
          d={shapeDef.outline}
          stroke="hsl(0, 0%, 25%)"
          strokeWidth="0.7"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Subtle facial features */}
        <path
          d={faceFeatures}
          stroke="hsl(0, 0%, 35%)"
          strokeWidth="0.6"
          fill="none"
          strokeLinecap="round"
          opacity="0.4"
        />

        {/* Dashed guides */}
        <line x1="50" y1="4" x2="50" y2="96" stroke="hsl(0,0%,40%)" strokeWidth="0.3" strokeDasharray="2,2" opacity="0.2" />
        <line x1="10" y1="50" x2="90" y2="50" stroke="hsl(0,0%,40%)" strokeWidth="0.3" strokeDasharray="2,2" opacity="0.2" />
      </svg>
    </div>
  );
};

export default FaceShapeSvg;
