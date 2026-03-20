/**
 * Premium body shape illustrations with anatomical detail, gradient shading, and highlight accents.
 */

interface BodyShapeSvgProps {
  shape: string;
  gender: "female" | "male";
  size?: number;
  className?: string;
}

// Female body outline — refined with smoother curves
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

const femaleShapeOverlays: Record<string, string> = {
  Hourglass: `M38,25 L62,25 L64,30 L62,34 L58,38 L54,44 L52,48 L54,52 L58,56 L62,60 L64,66 L62,70 L38,70 L36,66 L38,60 L42,56 L46,52 L48,48 L46,44 L42,38 L38,34 L36,30 Z`,
  Triangle: `M45,25 L55,25 L56,30 L55,36 L54,42 L53,48 L54,52 L57,56 L62,62 L66,68 L64,70 L36,70 L34,68 L38,62 L43,56 L46,52 L47,48 L46,42 L45,36 L44,30 Z`,
  "Inverted triangle": `M32,25 L68,25 L67,30 L64,36 L60,42 L57,48 L56,52 L54,56 L53,62 L52,68 L52,70 L48,70 L48,68 L47,62 L46,56 L44,52 L43,48 L40,42 L36,36 L33,30 Z`,
  Rectangle: `M42,25 L58,25 L59,30 L59,36 L59,42 L59,48 L59,52 L59,56 L59,62 L59,68 L58,70 L42,70 L41,68 L41,62 L41,56 L41,52 L41,48 L41,42 L41,36 L41,30 Z`,
  Round: `M44,25 L56,25 L58,30 L60,36 Q66,46 66,52 Q66,58 62,64 L58,68 L56,70 L44,70 L42,68 L38,64 Q34,58 34,52 Q34,46 40,36 L42,30 Z`,
};

const maleShapeOverlays: Record<string, string> = {
  Rectangle: `M40,27 L60,27 L61,32 L61,40 L61,48 L61,52 L61,58 L61,64 L61,70 L60,74 L40,74 L39,70 L39,64 L39,58 L39,52 L39,48 L39,40 L39,32 Z`,
  Triangle: `M44,27 L56,27 L57,32 L56,40 L55,48 L55,52 L57,58 L61,64 L66,70 L65,74 L35,74 L34,70 L39,64 L43,58 L45,52 L45,48 L44,40 L43,32 Z`,
  "Inverted triangle": `M28,27 L72,27 L70,32 L66,40 L62,48 L59,52 L57,58 L55,64 L54,70 L54,74 L46,74 L46,70 L45,64 L43,58 L41,52 L38,48 L34,40 L30,32 Z`,
  Oval: `M43,27 L57,27 L60,32 L63,40 Q70,52 66,62 Q62,70 58,74 L42,74 Q38,70 34,62 Q30,52 37,40 L40,32 Z`,
  Trapezoid: `M32,27 L68,27 L67,32 L64,40 L62,48 L61,52 L61,58 L61,64 L60,70 L59,74 L41,74 L40,70 L39,64 L39,58 L39,52 L38,48 L36,40 L33,32 Z`,
};

const BodyShapeSvg = ({ shape, gender, size = 80, className = "" }: BodyShapeSvgProps) => {
  const overlays = gender === "female" ? femaleShapeOverlays : maleShapeOverlays;
  const bodyOutline = gender === "female" ? femaleBodyOutline : maleBodyOutline;
  const overlayPath = overlays[shape];
  const gradId = `body-grad-${shape.replace(/\s/g, "")}`;
  const highlightId = `body-hl-${shape.replace(/\s/g, "")}`;
  const shadowId = `body-sh-${shape.replace(/\s/g, "")}`;

  return (
    <div className={className}>
      <svg
        width={size}
        height={size * 1.4}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Skin gradient */}
          <linearGradient id={gradId} x1="30%" y1="0%" x2="70%" y2="100%">
            <stop offset="0%" stopColor="hsl(25, 70%, 88%)" />
            <stop offset="50%" stopColor="hsl(20, 65%, 82%)" />
            <stop offset="100%" stopColor="hsl(15, 55%, 76%)" />
          </linearGradient>
          {/* Highlight edge */}
          <linearGradient id={highlightId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(30, 80%, 92%)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(20, 60%, 80%)" stopOpacity="0" />
          </linearGradient>
          {/* Shadow filter */}
          <filter id={shadowId} x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="hsl(15, 40%, 30%)" floodOpacity="0.15" />
          </filter>
          {/* Stroke gradient */}
          <linearGradient id={`${gradId}-stroke`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(20, 50%, 65%)" />
            <stop offset="100%" stopColor="hsl(15, 40%, 55%)" />
          </linearGradient>
        </defs>

        {/* Shape overlay with gradient fill and shadow */}
        {overlayPath && (
          <path
            d={overlayPath}
            fill={`url(#${gradId})`}
            stroke={`url(#${gradId}-stroke)`}
            strokeWidth="0.8"
            strokeLinejoin="round"
            strokeLinecap="round"
            filter={`url(#${shadowId})`}
          />
        )}

        {/* Highlight layer for depth */}
        {overlayPath && (
          <path
            d={overlayPath}
            fill={`url(#${highlightId})`}
            stroke="none"
          />
        )}

        {/* Body outline */}
        <path
          d={bodyOutline}
          stroke="hsl(0, 0%, 30%)"
          strokeWidth="0.6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.7"
        />

        {/* Measurement lines with dots */}
        {overlayPath && (
          <g opacity="0.25">
            <line x1="26" y1="27" x2="74" y2="27" stroke="hsl(var(--primary))" strokeWidth="0.4" strokeDasharray="1.5,1.5" />
            <line x1="26" y1="48" x2="74" y2="48" stroke="hsl(var(--primary))" strokeWidth="0.4" strokeDasharray="1.5,1.5" />
            <line x1="26" y1="68" x2="74" y2="68" stroke="hsl(var(--primary))" strokeWidth="0.4" strokeDasharray="1.5,1.5" />
            <circle cx="26" cy="27" r="1" fill="hsl(var(--primary))" />
            <circle cx="74" cy="27" r="1" fill="hsl(var(--primary))" />
            <circle cx="26" cy="48" r="1" fill="hsl(var(--primary))" />
            <circle cx="74" cy="48" r="1" fill="hsl(var(--primary))" />
            <circle cx="26" cy="68" r="1" fill="hsl(var(--primary))" />
            <circle cx="74" cy="68" r="1" fill="hsl(var(--primary))" />
          </g>
        )}
      </svg>
    </div>
  );
};

export default BodyShapeSvg;
