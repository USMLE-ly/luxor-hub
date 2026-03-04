/**
 * Professional body shape illustrations matching Style DNA reference.
 * Shows a body outline silhouette with the specific shape geometry
 * overlaid using a peach fill and orange outline.
 */

interface BodyShapeSvgProps {
  shape: string;
  gender: "female" | "male";
  size?: number;
  className?: string;
}

// Female body outline path (full body, front view)
const femaleBodyOutline = `
  M50,8 C53,8 55,10 55,13 C55,16 53,18 50,18 C47,18 45,16 45,13 C45,10 47,8 50,8
  M50,18 L50,20
  M42,22 C44,20 48,19 50,20 C52,19 56,20 58,22
  L60,30 L58,44 L56,48 L58,52 L60,60 L58,66
  L56,70 L54,80 L52,92
  L48,92 L46,80 L44,70 L42,66
  L40,60 L42,52 L44,48 L42,44 L40,30 Z
  M42,22 L36,30 L34,38 L32,44 L34,46
  M58,22 L64,30 L66,38 L68,44 L66,46
`;

// Male body outline path (torso + upper body, front view)
const maleBodyOutline = `
  M50,6 C53.5,6 56,8.5 56,12 C56,15.5 53.5,18 50,18 C46.5,18 44,15.5 44,12 C44,8.5 46.5,6 50,6
  M50,18 L50,20
  M38,24 C41,20 46,19 50,20 C54,19 59,20 62,24
  L65,32 L63,48 L60,52 L62,56 L64,64 L61,70
  L58,76 L55,88 L53,96
  L47,96 L45,88 L42,76 L39,70
  L36,64 L38,56 L40,52 L37,48 L35,32 Z
  M38,24 L30,32 L27,42 L25,50 L28,52
  M62,24 L70,32 L73,42 L75,50 L72,52
`;

// Shape overlay geometries for female
const femaleShapeOverlays: Record<string, { path: string; label: string }> = {
  Hourglass: {
    path: "M42,26 L58,26 L60,30 L56,42 L44,42 L40,30 Z M44,50 L56,50 L60,62 L58,68 L42,68 L40,62 Z",
    label: "Hourglass",
  },
  Triangle: {
    path: "M46,28 L54,28 L55,32 L53,40 L47,40 L45,32 Z M44,48 L56,48 L62,66 L60,70 L40,70 L38,66 Z",
    label: "Triangle",
  },
  "Inverted triangle": {
    path: "M38,26 L62,26 L64,30 L58,44 L42,44 L36,30 Z M46,50 L54,50 L56,66 L54,70 L46,70 L44,66 Z",
    label: "Inverted triangle",
  },
  Rectangle: {
    path: "M43,26 L57,26 L58,30 L58,42 L58,50 L58,62 L57,68 L43,68 L42,62 L42,50 L42,42 L42,30 Z",
    label: "Rectangle",
  },
  Round: {
    path: "M44,28 L56,28 L58,34 Q62,48 60,58 Q58,66 56,70 L44,70 Q42,66 40,58 Q38,48 42,34 Z",
    label: "Round",
  },
};

// Shape overlay geometries for male
const maleShapeOverlays: Record<string, { path: string; label: string }> = {
  Rectangle: {
    path: "M40,28 L60,28 L61,34 L61,48 L61,56 L61,66 L60,72 L40,72 L39,66 L39,56 L39,48 L39,34 Z",
    label: "Rectangle",
  },
  Triangle: {
    path: "M44,28 L56,28 L57,34 L55,44 L53,48 L54,54 L58,64 L62,72 L38,72 L42,64 L46,54 L47,48 L45,44 L43,34 Z",
    label: "Triangle",
  },
  "Inverted triangle": {
    path: "M34,28 L66,28 L64,34 L60,44 L58,50 L56,56 L54,64 L56,72 L44,72 L46,64 L44,56 L42,50 L40,44 L36,34 Z",
    label: "Inverted triangle",
  },
  Oval: {
    path: "M42,30 L58,30 L60,36 Q64,50 62,60 Q60,68 58,74 L42,74 Q40,68 38,60 Q36,50 40,36 Z",
    label: "Oval",
  },
  Trapezoid: {
    path: "M36,28 L64,28 L63,34 L60,44 L58,50 L58,56 L58,64 L58,72 L42,72 L42,64 L42,56 L42,50 L40,44 L37,34 Z",
    label: "Trapezoid",
  },
};

const BodyShapeSvg = ({ shape, gender, size = 80, className = "" }: BodyShapeSvgProps) => {
  const overlays = gender === "female" ? femaleShapeOverlays : maleShapeOverlays;
  const bodyOutline = gender === "female" ? femaleBodyOutline : maleBodyOutline;
  const overlay = overlays[shape];

  return (
    <div className={className}>
      <svg
        width={size}
        height={size * 1.3}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Body outline - thin dark strokes */}
        <path
          d={bodyOutline}
          stroke="hsl(0, 0%, 30%)"
          strokeWidth="0.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Shape overlay - peach fill with orange outline */}
        {overlay && (
          <path
            d={overlay.path}
            fill="hsl(25, 70%, 88%)"
            fillOpacity="0.7"
            stroke="hsl(20, 80%, 60%)"
            strokeWidth="1.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* Subtle dashed measurement lines on the shape overlay */}
        {overlay && (
          <>
            <line
              x1="30" y1="28" x2="70" y2="28"
              stroke="hsl(0, 0%, 40%)"
              strokeWidth="0.3"
              strokeDasharray="2,2"
              opacity="0.4"
            />
            <line
              x1="30" y1="48" x2="70" y2="48"
              stroke="hsl(0, 0%, 40%)"
              strokeWidth="0.3"
              strokeDasharray="2,2"
              opacity="0.4"
            />
            <line
              x1="30" y1="68" x2="70" y2="68"
              stroke="hsl(0, 0%, 40%)"
              strokeWidth="0.3"
              strokeDasharray="2,2"
              opacity="0.4"
            />
          </>
        )}
      </svg>
    </div>
  );
};

export default BodyShapeSvg;
