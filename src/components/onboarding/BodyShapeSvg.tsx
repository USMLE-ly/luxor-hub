/**
 * Premium body shape SVG with anatomical detail, multi-layer shading, arms, and measurement labels.
 */

interface BodyShapeSvgProps {
  shape: string;
  gender: "female" | "male";
  size?: number;
  className?: string;
}

// Female body — smooth curves with arms
const femaleBodyOutline = `
  M50,5 C54.5,5 57.5,8 57.5,12.5 C57.5,17 54.5,20 50,20 C45.5,20 42.5,17 42.5,12.5 C42.5,8 45.5,5 50,5
  M50,20 L50,22.5
  M40,26 C43,22.5 47,21.5 50,22.5 C53,21.5 57,22.5 60,26
  L62,29 L61,33 L59,39 L57,45 L56,49 L57,53 L59,57 L60,63 L59,67
  L57,71 L55,79 L53,87 L52,95
  L48,95 L47,87 L45,79 L43,71 L41,67
  L40,63 L41,57 L43,53 L44,49 L43,45 L41,39 L39,33 L38,29 Z
  M40,26 L35,29 L32,35 L30,41 L29,47 L30,49
  M60,26 L65,29 L68,35 L70,41 L71,47 L70,49
`;

const maleBodyOutline = `
  M50,4 C55,4 58.5,7.5 58.5,12.5 C58.5,17.5 55,21 50,21 C45,21 41.5,17.5 41.5,12.5 C41.5,7.5 45,4 50,4
  M50,21 L50,24
  M36,28 C40,24 45,23 50,24 C55,23 60,24 64,28
  L67,32 L66,37 L64,43 L62,49 L61,53 L62,57 L63,63 L62,69
  L60,74 L57,83 L55,91 L54,98
  L46,98 L45,91 L43,83 L40,74 L38,69
  L37,63 L38,57 L39,53 L38,49 L36,43 L34,37 L33,32 Z
  M36,28 L28,32 L25,39 L23,47 L22,53 L24,55
  M64,28 L72,32 L75,39 L77,47 L78,53 L76,55
`;

const femaleShapeOverlays: Record<string, string> = {
  Hourglass: `M38,26 Q44,26 50,27 Q56,26 62,26 L64,31 Q62,35 58,39 Q54,44 52,49 Q54,53 58,57 Q62,61 64,67 L62,71 Q56,71 50,72 Q44,71 38,71 L36,67 Q38,61 42,57 Q46,53 48,49 Q46,44 42,39 Q38,35 36,31 Z`,
  Triangle: `M45,26 Q47.5,26 50,27 Q52.5,26 55,26 L56,31 Q55,37 54,43 Q53,49 54,53 Q57,57 62,63 Q66,68 64,71 L36,71 Q34,68 38,63 Q43,57 46,53 Q47,49 46,43 Q45,37 44,31 Z`,
  "Inverted triangle": `M32,26 Q41,26 50,27 Q59,26 68,26 L67,31 Q64,37 60,43 Q57,49 56,53 Q54,57 53,63 Q52,68 52,71 L48,71 Q48,68 47,63 Q46,57 44,53 Q43,49 40,43 Q36,37 33,31 Z`,
  Rectangle: `M42,26 Q46,26 50,27 Q54,26 58,26 L59,31 L59,37 L59,43 L59,49 L59,53 L59,57 L59,63 L59,68 L58,71 L42,71 L41,68 L41,63 L41,57 L41,53 L41,49 L41,43 L41,37 L41,31 Z`,
  Round: `M44,26 Q47,26 50,27 Q53,26 56,26 L58,31 Q60,37 64,43 Q68,50 68,55 Q68,61 64,67 L58,71 Q54,71 50,72 Q46,71 42,71 L36,67 Q32,61 32,55 Q32,50 36,43 Q40,37 42,31 Z`,
};

const maleShapeOverlays: Record<string, string> = {
  Rectangle: `M40,28 Q45,28 50,29 Q55,28 60,28 L61,33 L61,41 L61,49 L61,53 L61,59 L61,65 L61,71 L60,75 L40,75 L39,71 L39,65 L39,59 L39,53 L39,49 L39,41 L39,33 Z`,
  Triangle: `M44,28 Q47,28 50,29 Q53,28 56,28 L57,33 Q56,41 55,49 Q55,53 57,59 Q61,65 66,71 L65,75 L35,75 L34,71 Q39,65 43,59 Q45,53 45,49 Q44,41 43,33 Z`,
  "Inverted triangle": `M28,28 Q39,28 50,29 Q61,28 72,28 L70,33 Q66,41 62,49 Q59,53 57,59 Q55,65 54,71 L54,75 L46,75 L46,71 Q45,65 43,59 Q41,53 38,49 Q34,41 30,33 Z`,
  Oval: `M43,28 Q46.5,28 50,29 Q53.5,28 57,28 L60,33 Q63,41 68,49 Q72,55 68,63 Q64,71 60,75 L40,75 Q36,71 32,63 Q28,55 32,49 Q37,41 40,33 Z`,
  Trapezoid: `M32,28 Q41,28 50,29 Q59,28 68,28 L67,33 Q64,41 62,49 Q61,53 61,59 L61,65 L60,71 L59,75 L41,75 L40,71 L39,65 L39,59 Q39,53 38,49 Q36,41 33,33 Z`,
};

const BodyShapeSvg = ({ shape, gender, size = 80, className = "" }: BodyShapeSvgProps) => {
  const overlays = gender === "female" ? femaleShapeOverlays : maleShapeOverlays;
  const bodyOutline = gender === "female" ? femaleBodyOutline : maleBodyOutline;
  const overlayPath = overlays[shape];
  const uid = `bs-${shape.replace(/\s/g, "")}-${gender}`;

  return (
    <div className={className}>
      <svg
        width={size}
        height={size * 1.3}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Rich skin gradient */}
          <linearGradient id={`${uid}-skin`} x1="25%" y1="0%" x2="75%" y2="100%">
            <stop offset="0%" stopColor="hsl(28, 72%, 90%)" />
            <stop offset="30%" stopColor="hsl(22, 68%, 84%)" />
            <stop offset="60%" stopColor="hsl(18, 62%, 78%)" />
            <stop offset="100%" stopColor="hsl(14, 55%, 72%)" />
          </linearGradient>
          {/* 3D highlight */}
          <linearGradient id={`${uid}-hl`} x1="0%" y1="15%" x2="100%" y2="85%">
            <stop offset="0%" stopColor="hsl(35, 85%, 95%)" stopOpacity="0.7" />
            <stop offset="40%" stopColor="hsl(25, 70%, 88%)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
          {/* Inner shadow (right side) */}
          <linearGradient id={`${uid}-ish`} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(12, 45%, 50%)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
          {/* Specular */}
          <radialGradient id={`${uid}-spec`} cx="40%" cy="30%" r="35%">
            <stop offset="0%" stopColor="white" stopOpacity="0.15" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          {/* Premium stroke */}
          <linearGradient id={`${uid}-stroke`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary) / 0.5)" />
            <stop offset="50%" stopColor="hsl(var(--primary) / 0.7)" />
            <stop offset="100%" stopColor="hsl(var(--primary) / 0.4)" />
          </linearGradient>
          {/* Drop shadow */}
          <filter id={`${uid}-drop`} x="-12%" y="-8%" width="124%" height="120%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="hsl(15, 40%, 22%)" floodOpacity="0.16" />
          </filter>
        </defs>

        {/* Shape overlay — multi-layer fill */}
        {overlayPath && (
          <>
            <path d={overlayPath} fill={`url(#${uid}-skin)`} stroke={`url(#${uid}-stroke)`} strokeWidth="0.7" strokeLinejoin="round" strokeLinecap="round" filter={`url(#${uid}-drop)`} />
            <path d={overlayPath} fill={`url(#${uid}-hl)`} stroke="none" />
            <path d={overlayPath} fill={`url(#${uid}-ish)`} stroke="none" />
            <path d={overlayPath} fill={`url(#${uid}-spec)`} stroke="none" />
          </>
        )}

        {/* Body outline */}
        <path
          d={bodyOutline}
          stroke="hsl(0, 0%, 35%)"
          strokeWidth="0.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.5"
        />

        {/* Measurement guides with labels */}
        {overlayPath && (
          <g opacity="0.3">
            {[
              { y: gender === "female" ? 27 : 28, label: "S" },
              { y: gender === "female" ? 49 : 49, label: "W" },
              { y: gender === "female" ? 68 : 69, label: "H" },
            ].map((m) => (
              <g key={m.label}>
                <line x1="22" y1={m.y} x2="78" y2={m.y} stroke="hsl(var(--primary))" strokeWidth="0.35" strokeDasharray="1.5,2" />
                <circle cx="22" cy={m.y} r="1" fill="hsl(var(--primary))" opacity="0.5" />
                <circle cx="78" cy={m.y} r="1" fill="hsl(var(--primary))" opacity="0.5" />
                <text x="80" y={m.y + 1.5} fontSize="4" fill="hsl(var(--primary))" opacity="0.5" fontFamily="sans-serif" fontWeight="600">{m.label}</text>
              </g>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
};

export default BodyShapeSvg;
