/**
 * Face shape SVG illustrations for onboarding selection.
 * Shows a face outline with the specific shape geometry overlay
 * using peach fill + orange outline, matching body shape style.
 */

interface FaceShapeSvgProps {
  shape: string;
  size?: number;
  className?: string;
}

// Base face outline — eyes, nose, mouth hints
const faceFeatures = `
  M40,42 C40,40 43,39 44,41
  M56,41 C57,39 60,40 60,42
  M47,52 Q50,54 53,52
  M45,60 Q50,64 55,60
`;

// Face shape outlines with specific geometry
const faceShapePaths: Record<string, { outline: string; overlay: string }> = {
  Oval: {
    outline: `M50,12 C68,12 80,28 80,44 C80,62 70,80 60,86 C56,88 44,88 40,86 C30,80 20,62 20,44 C20,28 32,12 50,12 Z`,
    overlay: `M50,14 C66,14 78,29 78,44 C78,61 69,78 59,84 C55,86 45,86 41,84 C31,78 22,61 22,44 C22,29 34,14 50,14 Z`,
  },
  Round: {
    outline: `M50,14 C72,14 84,30 84,50 C84,70 72,86 50,86 C28,86 16,70 16,50 C16,30 28,14 50,14 Z`,
    overlay: `M50,16 C70,16 82,31 82,50 C82,69 70,84 50,84 C30,84 18,69 18,50 C18,31 30,16 50,16 Z`,
  },
  Square: {
    outline: `M24,16 L76,16 C78,16 80,18 80,20 L82,58 C82,70 74,84 62,88 C56,90 44,90 38,88 C26,84 18,70 18,58 L20,20 C20,18 22,16 24,16 Z`,
    overlay: `M26,18 L74,18 C76,18 78,20 78,22 L80,57 C80,69 73,82 61,86 C56,88 44,88 39,86 C27,82 20,69 20,57 L22,22 C22,20 24,18 26,18 Z`,
  },
  Heart: {
    outline: `M50,14 C64,14 78,20 82,34 C84,46 78,64 68,76 C62,84 56,88 50,90 C44,88 38,84 32,76 C22,64 16,46 18,34 C22,20 36,14 50,14 Z`,
    overlay: `M50,16 C63,16 76,22 80,35 C82,46 76,63 67,74 C61,82 55,86 50,88 C45,86 39,82 33,74 C24,63 18,46 20,35 C24,22 37,16 50,16 Z`,
  },
  Oblong: {
    outline: `M50,8 C66,8 78,20 78,32 L80,56 C80,70 72,86 60,90 C56,92 44,92 40,90 C28,86 20,70 20,56 L22,32 C22,20 34,8 50,8 Z`,
    overlay: `M50,10 C64,10 76,21 76,33 L78,55 C78,69 71,84 59,88 C55,90 45,90 41,88 C29,84 22,69 22,55 L24,33 C24,21 36,10 50,10 Z`,
  },
  Diamond: {
    outline: `M50,12 C56,12 66,28 76,46 C80,52 80,56 76,62 C66,78 58,88 50,88 C42,88 34,78 24,62 C20,56 20,52 24,46 C34,28 44,12 50,12 Z`,
    overlay: `M50,14 C55,14 64,30 74,47 C78,53 78,56 74,61 C65,76 57,86 50,86 C43,86 35,76 26,61 C22,56 22,53 26,47 C36,30 45,14 50,14 Z`,
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

        {/* Dashed vertical/horizontal guides */}
        <line x1="50" y1="8" x2="50" y2="92" stroke="hsl(0,0%,40%)" strokeWidth="0.3" strokeDasharray="2,2" opacity="0.2" />
        <line x1="16" y1="50" x2="84" y2="50" stroke="hsl(0,0%,40%)" strokeWidth="0.3" strokeDasharray="2,2" opacity="0.2" />
      </svg>
    </div>
  );
};

export default FaceShapeSvg;
