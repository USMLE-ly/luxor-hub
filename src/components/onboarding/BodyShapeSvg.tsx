/**
 * Professional body shape illustrations matching Style DNA reference.
 * Full anatomical body outline with shape-specific overlay geometry
 * using peach fill + orange outline, dashed measurement lines.
 */

interface BodyShapeSvgProps {
  shape: string;
  gender: "female" | "male";
  size?: number;
  className?: string;
}

// Female body outline — head, neck, shoulders, arms, torso curves, legs
const femaleBodyOutline = `
  M50,5 C54,5 57,8 57,12 C57,16 54,19 50,19 C46,19 43,16 43,12 C43,8 46,5 50,5
  M50,19 L50,22
  M40,25 C43,22 47,21 50,22 C53,21 57,22 60,25
  L62,28 L61,32 L59,38 L57,44 L56,48 L57,52 L59,56 L60,62 L59,66
  L57,70 L55,78 L53,86 L52,94
  L48,94 L47,86 L45,78 L43,70 L41,66
  L40,62 L41,56 L43,52 L44,48 L43,44 L41,38 L39,32 L38,28 Z
  M40,25 L35,28 L32,34 L30,40 L29,46 L30,48
  M60,25 L65,28 L68,34 L70,40 L71,46 L70,48
`;

// Male body outline — broader shoulders, straighter torso
const maleBodyOutline = `
  M50,4 C54.5,4 58,7.5 58,12 C58,16.5 54.5,20 50,20 C45.5,20 42,16.5 42,12 C42,7.5 45.5,4 50,4
  M50,20 L50,23
  M36,27 C40,23 45,22 50,23 C55,22 60,23 64,27
  L67,31 L66,36 L64,42 L62,48 L61,52 L62,56 L63,62 L62,68
  L60,73 L57,82 L55,90 L54,97
  L46,97 L45,90 L43,82 L40,73 L38,68
  L37,62 L38,56 L39,52 L38,48 L36,42 L34,36 L33,31 Z
  M36,27 L28,31 L25,38 L23,46 L22,52 L24,54
  M64,27 L72,31 L75,38 L77,46 L78,52 L76,54
`;

// Female shape overlays — shaped to follow the torso contour
const femaleShapeOverlays: Record<string, string> = {
  // Hourglass: wide shoulders, narrow waist, wide hips
  Hourglass: `
    M40,26 L60,26
    L62,30 L60,36 L57,42 L55,46
    L56,50 L58,54 L60,60 L60,66 L58,70
    L42,70 L40,66 L40,60 L42,54 L44,50
    L45,46 L43,42 L40,36 L38,30 Z
  `,
  // Triangle (pear): narrow shoulders, wide hips
  Triangle: `
    M44,26 L56,26
    L57,30 L56,36 L55,42 L54,46
    L55,50 L57,54 L60,60 L62,66 L60,70
    L40,70 L38,66 L40,60 L43,54 L45,50
    L46,46 L45,42 L44,36 L43,30 Z
  `,
  // Inverted triangle: wide shoulders, narrow hips
  "Inverted triangle": `
    M36,26 L64,26
    L65,30 L63,36 L60,42 L58,46
    L57,50 L56,54 L55,60 L54,66 L54,70
    L46,70 L46,66 L45,60 L44,54 L43,50
    L42,46 L40,42 L37,36 L35,30 Z
  `,
  // Rectangle: even proportions throughout
  Rectangle: `
    M42,26 L58,26
    L59,30 L59,36 L58,42 L58,46
    L58,50 L58,54 L59,60 L59,66 L58,70
    L42,70 L41,66 L41,60 L42,54 L42,50
    L42,46 L42,42 L41,36 L41,30 Z
  `,
  // Round: fuller midsection, curved shape
  Round: `
    M44,26 L56,26
    L58,30 L59,36
    Q62,44 62,50
    Q62,56 60,62
    L58,66 L56,70
    L44,70 L42,66 L40,62
    Q38,56 38,50
    Q38,44 41,36
    L42,30 Z
  `,
};

// Male shape overlays
const maleShapeOverlays: Record<string, string> = {
  // Rectangle: even proportions
  Rectangle: `
    M39,28 L61,28
    L62,33 L62,40 L62,48 L62,52
    L62,56 L62,62 L62,68 L61,73
    L39,73 L38,68 L38,62 L38,56
    L38,52 L38,48 L38,40 L38,33 Z
  `,
  // Triangle: narrow shoulders, wider lower
  Triangle: `
    M43,28 L57,28
    L58,33 L57,40 L56,48 L56,52
    L57,56 L59,62 L62,68 L63,73
    L37,73 L38,68 L41,62 L43,56
    L44,52 L44,48 L43,40 L42,33 Z
  `,
  // Inverted triangle: broad shoulders, narrow waist/hips — V-shape
  "Inverted triangle": `
    M32,28 L68,28
    L67,33 L64,40 L61,48 L59,52
    L58,56 L56,62 L55,68 L55,73
    L45,73 L45,68 L44,62 L42,56
    L41,52 L39,48 L36,40 L33,33 Z
  `,
  // Oval: fuller midsection
  Oval: `
    M42,28 L58,28
    L60,33 L62,40
    Q66,50 64,58
    Q62,66 60,70 L58,73
    L42,73 L40,70
    Q38,66 36,58
    Q34,50 38,40
    L40,33 Z
  `,
  // Trapezoid: wide shoulders, slightly narrower waist, athletic
  Trapezoid: `
    M34,28 L66,28
    L65,33 L63,40 L61,48 L60,52
    L60,56 L60,62 L60,68 L59,73
    L41,73 L40,68 L40,62 L40,56
    L40,52 L39,48 L37,40 L35,33 Z
  `,
};

const BodyShapeSvg = ({ shape, gender, size = 80, className = "" }: BodyShapeSvgProps) => {
  const overlays = gender === "female" ? femaleShapeOverlays : maleShapeOverlays;
  const bodyOutline = gender === "female" ? femaleBodyOutline : maleBodyOutline;
  const overlayPath = overlays[shape];

  return (
    <div className={className}>
      <svg
        width={size}
        height={size * 1.4}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shape overlay first (behind outline for visual layering) */}
        {overlayPath && (
          <path
            d={overlayPath}
            fill="hsl(22, 80%, 87%)"
            fillOpacity="0.75"
            stroke="hsl(18, 85%, 58%)"
            strokeWidth="1"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* Body outline - thin dark strokes on top */}
        <path
          d={bodyOutline}
          stroke="hsl(0, 0%, 25%)"
          strokeWidth="0.7"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dashed measurement lines */}
        {overlayPath && (
          <>
            <line x1="28" y1="28" x2="72" y2="28" stroke="hsl(0,0%,40%)" strokeWidth="0.3" strokeDasharray="1.5,1.5" opacity="0.3" />
            <line x1="28" y1="48" x2="72" y2="48" stroke="hsl(0,0%,40%)" strokeWidth="0.3" strokeDasharray="1.5,1.5" opacity="0.3" />
            <line x1="28" y1="68" x2="72" y2="68" stroke="hsl(0,0%,40%)" strokeWidth="0.3" strokeDasharray="1.5,1.5" opacity="0.3" />
          </>
        )}
      </svg>
    </div>
  );
};

export default BodyShapeSvg;
