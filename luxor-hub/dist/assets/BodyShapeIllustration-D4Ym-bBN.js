import { d as createLucideIcon } from "./AppContent-9kIwMzo7.js";
import { r as reactExports, j as jsxRuntimeExports } from "./index-UvNQFckZ.js";
import { m as motion } from "./proxy-DuKBf0zJ.js";
import { A as AnimatePresence } from "./index-CI22_94N.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Gem = createLucideIcon("Gem", [
  ["path", { d: "M6 3h12l4 6-10 13L2 9Z", key: "1pcd5k" }],
  ["path", { d: "M11 3 8 9l4 13 4-13-3-6", key: "1fcu3u" }],
  ["path", { d: "M2 9h20", key: "16fsjt" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Glasses = createLucideIcon("Glasses", [
  ["circle", { cx: "6", cy: "15", r: "4", key: "vux9w4" }],
  ["circle", { cx: "18", cy: "15", r: "4", key: "18o8ve" }],
  ["path", { d: "M14 15a2 2 0 0 0-2-2 2 2 0 0 0-2 2", key: "1ag4bs" }],
  ["path", { d: "M2.5 13 5 7c.7-1.3 1.4-2 3-2", key: "1hm1gs" }],
  ["path", { d: "M21.5 13 19 7c-.7-1.3-1.5-2-3-2", key: "1r31ai" }]
]);
const shapeOutlines = {
  oval: "M50,8 C72,8 88,25 88,42 C88,62 78,82 65,90 C58,95 42,95 35,90 C22,82 12,62 12,42 C12,25 28,8 50,8Z",
  round: "M50,10 C75,10 90,28 90,50 C90,72 75,90 50,90 C25,90 10,72 10,50 C10,28 25,10 50,10Z",
  square: "M18,15 C18,12 22,10 30,10 L70,10 C78,10 82,12 82,15 L85,60 C85,72 78,88 65,92 C58,95 42,95 35,92 C22,88 15,72 15,60Z",
  heart: "M50,10 C68,10 85,18 88,35 C90,48 82,68 70,82 C62,90 55,94 50,96 C45,94 38,90 30,82 C18,68 10,48 12,35 C15,18 32,10 50,10Z",
  oblong: "M50,5 C68,5 82,18 82,30 L84,60 C84,75 74,92 60,96 C55,97 45,97 40,96 C26,92 16,75 16,60 L18,30 C18,18 32,5 50,5Z",
  diamond: "M50,8 C55,8 68,28 78,48 C82,55 82,58 78,65 C68,80 58,92 50,92 C42,92 32,80 22,65 C18,58 18,55 22,48 C32,28 45,8 50,8Z",
  rectangle: "M22,10 L78,10 C80,10 82,12 82,14 L84,65 C84,78 74,90 60,94 C55,95 45,95 40,94 C26,90 16,78 16,65 L18,14 C18,12 20,10 22,10Z"
};
const shapeKeys = Object.keys(shapeOutlines);
function getShapeKey(shape) {
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
const FaceShapeIllustration = ({ shape, size = 120, className = "", morphing = false }) => {
  const finalKey = getShapeKey(shape);
  const [morphIndex, setMorphIndex] = reactExports.useState(0);
  reactExports.useEffect(() => {
    if (!morphing) return;
    const interval = setInterval(() => {
      setMorphIndex((prev) => (prev + 1) % shapeKeys.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [morphing]);
  const activeKey = morphing ? shapeKeys[morphIndex] : finalKey;
  const activePath = shapeOutlines[activeKey];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.5, ease: "easeOut" },
      className,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: size, height: size, viewBox: "0 0 100 100", fill: "none", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("defs", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: `face-fill-${activeKey}`, x1: "0%", y1: "0%", x2: "100%", y2: "100%", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "hsl(25, 60%, 88%)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "hsl(15, 50%, 80%)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: `face-stroke-${activeKey}`, x1: "0%", y1: "0%", x2: "100%", y2: "100%", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "hsl(200, 50%, 60%)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "hsl(270, 40%, 65%)" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.path,
            {
              d: activePath,
              fill: `url(#face-fill-${activeKey})`,
              stroke: `url(#face-stroke-${activeKey})`,
              strokeWidth: "2",
              animate: { d: activePath },
              transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "38", cy: "40", r: "2.5", fill: "hsl(0, 0%, 35%)", opacity: "0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "62", cy: "40", r: "2.5", fill: "hsl(0, 0%, 35%)", opacity: "0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M45,58 Q50,64 55,58", stroke: "hsl(0, 0%, 45%)", strokeWidth: "1.5", fill: "none", opacity: "0.4", strokeLinecap: "round" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M44,50 Q50,53 56,50", stroke: "hsl(0, 0%, 50%)", strokeWidth: "1", fill: "none", opacity: "0.3", strokeLinecap: "round" }),
          !morphing && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.line,
              {
                x1: "8",
                y1: "45",
                x2: "92",
                y2: "45",
                stroke: "hsl(200, 50%, 60%)",
                strokeWidth: "0.5",
                strokeDasharray: "3,3",
                opacity: "0.3",
                initial: { pathLength: 0 },
                animate: { pathLength: 1 },
                transition: { delay: 0.5, duration: 0.8 }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.line,
              {
                x1: "50",
                y1: "4",
                x2: "50",
                y2: "96",
                stroke: "hsl(200, 50%, 60%)",
                strokeWidth: "0.5",
                strokeDasharray: "3,3",
                opacity: "0.3",
                initial: { pathLength: 0 },
                animate: { pathLength: 1 },
                transition: { delay: 0.7, duration: 0.8 }
              }
            )
          ] }),
          morphing && /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.line,
            {
              x1: "5",
              x2: "95",
              stroke: "hsl(200, 50%, 60%)",
              strokeWidth: "1",
              opacity: "0.5",
              animate: { y1: [15, 85, 15], y2: [15, 85, 15] },
              transition: { duration: 2.5, repeat: Infinity, ease: "linear" }
            }
          )
        ] }),
        morphing && /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.p,
          {
            className: "text-xs font-sans text-muted-foreground text-center mt-1 capitalize",
            initial: { opacity: 0, y: 4 },
            animate: { opacity: 0.6, y: 0 },
            exit: { opacity: 0, y: -4 },
            transition: { duration: 0.3 },
            children: [
              activeKey,
              "?"
            ]
          },
          activeKey
        ) })
      ]
    }
  );
};
const shapeProportions = {
  hourglass: { shoulders: 38, bust: 36, waist: 22, hips: 38, neckWidth: 6 },
  pear: { shoulders: 28, bust: 27, waist: 24, hips: 40, neckWidth: 5.5 },
  triangle: { shoulders: 28, bust: 27, waist: 24, hips: 40, neckWidth: 5.5 },
  inverted: { shoulders: 44, bust: 40, waist: 28, hips: 28, neckWidth: 7 },
  trapezoid: { shoulders: 42, bust: 38, waist: 30, hips: 32, neckWidth: 7 },
  rectangle: { shoulders: 34, bust: 32, waist: 30, hips: 34, neckWidth: 6 },
  athletic: { shoulders: 38, bust: 34, waist: 28, hips: 32, neckWidth: 6.5 },
  round: { shoulders: 32, bust: 36, waist: 40, hips: 36, neckWidth: 6 },
  oval: { shoulders: 32, bust: 36, waist: 40, hips: 36, neckWidth: 6 },
  apple: { shoulders: 34, bust: 38, waist: 40, hips: 32, neckWidth: 6 }
};
const morphKeys = ["rectangle", "hourglass", "pear", "inverted", "round", "trapezoid"];
function getProportions(shape) {
  const s = shape.toLowerCase();
  for (const [key, val] of Object.entries(shapeProportions)) {
    if (s.includes(key)) return val;
  }
  return shapeProportions.rectangle;
}
function buildPath(p) {
  const cx = 50;
  const sH = p.shoulders / 2;
  const bH = p.bust / 2;
  const wH = p.waist / 2;
  const hH = p.hips / 2;
  const nH = p.neckWidth / 2;
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
function buildArms(p) {
  const cx = 50;
  const sH = p.shoulders / 2;
  return `
    M${cx + sH},28 Q${cx + sH + 6},32 ${cx + sH + 8},42 Q${cx + sH + 9},48 ${cx + sH + 7},52
    M${cx - sH},28 Q${cx - sH - 6},32 ${cx - sH - 8},42 Q${cx - sH - 9},48 ${cx - sH - 7},52
  `;
}
const BodyShapeIllustration = ({ shape, size = 160, className = "", morphing = false }) => {
  const cx = 50;
  const [morphIndex, setMorphIndex] = reactExports.useState(0);
  reactExports.useEffect(() => {
    if (!morphing) return;
    const interval = setInterval(() => {
      setMorphIndex((prev) => (prev + 1) % morphKeys.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [morphing]);
  const activeKey = morphing ? morphKeys[morphIndex] : null;
  const p = morphing ? shapeProportions[activeKey] || shapeProportions.rectangle : getProportions(shape);
  const path = reactExports.useMemo(() => buildPath(p), [p]);
  const armsPath = reactExports.useMemo(() => buildArms(p), [p]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.5, ease: "easeOut" },
      className,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: size * 0.75, height: size, viewBox: "0 0 100 100", fill: "none", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("defs", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "bi-skin", x1: "25%", y1: "0%", x2: "75%", y2: "100%", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "hsl(28, 72%, 90%)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "30%", stopColor: "hsl(22, 68%, 84%)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "60%", stopColor: "hsl(18, 62%, 78%)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "hsl(14, 55%, 72%)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "bi-highlight", x1: "0%", y1: "20%", x2: "100%", y2: "80%", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "hsl(35, 85%, 94%)", stopOpacity: "0.7" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "40%", stopColor: "hsl(25, 70%, 88%)", stopOpacity: "0.2" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "transparent", stopOpacity: "0" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "bi-inner-shadow", x1: "100%", y1: "0%", x2: "0%", y2: "100%", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "hsl(12, 45%, 55%)", stopOpacity: "0.15" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "transparent", stopOpacity: "0" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "bi-stroke", x1: "0%", y1: "0%", x2: "100%", y2: "100%", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "hsl(var(--primary) / 0.5)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "50%", stopColor: "hsl(var(--primary) / 0.7)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "hsl(var(--primary) / 0.4)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("filter", { id: "bi-glow", x: "-20%", y: "-10%", width: "140%", height: "130%", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("feGaussianBlur", { in: "SourceAlpha", stdDeviation: "3" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("feColorMatrix", { values: "0 0 0 0 0.7  0 0 0 0 0.55  0 0 0 0 0.3  0 0 0 0.12 0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("feMerge", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("feMergeNode", {}),
                /* @__PURE__ */ jsxRuntimeExports.jsx("feMergeNode", { in: "SourceGraphic" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("filter", { id: "bi-drop", x: "-10%", y: "-10%", width: "120%", height: "125%", children: /* @__PURE__ */ jsxRuntimeExports.jsx("feDropShadow", { dx: "0", dy: "2", stdDeviation: "2.5", floodColor: "hsl(15, 40%, 20%)", floodOpacity: "0.18" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("radialGradient", { id: "bi-specular", cx: "42%", cy: "35%", r: "40%", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "white", stopOpacity: "0.18" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "transparent", stopOpacity: "0" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ellipse", { cx, cy: "52", rx: "28", ry: "38", fill: "hsl(var(--primary))", opacity: "0.04" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx, cy: "9", r: "7", fill: "url(#bi-skin)", stroke: "url(#bi-stroke)", strokeWidth: "0.8", filter: "url(#bi-drop)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx, cy: "9", r: "7", fill: "url(#bi-highlight)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx, cy: "9", r: "7", fill: "url(#bi-specular)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: `M${cx - 5},6 Q${cx - 3},3 ${cx},2.5 Q${cx + 3},3 ${cx + 5},6`, stroke: "hsl(15, 30%, 40%)", strokeWidth: "0.6", fill: "none", opacity: "0.3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.path,
            {
              d: armsPath,
              stroke: "url(#bi-stroke)",
              strokeWidth: "0.7",
              fill: "none",
              strokeLinecap: "round",
              opacity: "0.5",
              animate: { d: armsPath },
              transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.path,
            {
              d: path,
              fill: "url(#bi-skin)",
              stroke: "url(#bi-stroke)",
              strokeWidth: "0.9",
              strokeLinejoin: "round",
              filter: "url(#bi-drop)",
              animate: { d: path },
              transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.path,
            {
              d: path,
              fill: "url(#bi-highlight)",
              stroke: "none",
              animate: { d: path },
              transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.path,
            {
              d: path,
              fill: "url(#bi-inner-shadow)",
              stroke: "none",
              animate: { d: path },
              transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.path,
            {
              d: path,
              fill: "url(#bi-specular)",
              stroke: "none",
              animate: { d: path },
              transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
            }
          ),
          !morphing && [
            { y: 28, w: p.shoulders, label: "S" },
            { y: 46, w: p.waist, label: "W" },
            { y: 62, w: p.hips, label: "H" }
          ].map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.g, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.5 + i * 0.15 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "line",
              {
                x1: cx - m.w / 2 - 6,
                y1: m.y,
                x2: cx + m.w / 2 + 6,
                y2: m.y,
                stroke: "hsl(var(--primary))",
                strokeWidth: "0.35",
                strokeDasharray: "1.5,2",
                opacity: "0.35"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: cx - m.w / 2 - 6, cy: m.y, r: "1.2", fill: "hsl(var(--primary))", opacity: "0.4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: cx + m.w / 2 + 6, cy: m.y, r: "1.2", fill: "hsl(var(--primary))", opacity: "0.4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "text",
              {
                x: cx + m.w / 2 + 9,
                y: m.y + 1.5,
                fontSize: "4",
                fill: "hsl(var(--primary))",
                opacity: "0.4",
                fontFamily: "sans-serif",
                fontWeight: "600",
                children: m.label
              }
            )
          ] }, m.label)),
          morphing && /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.line,
            {
              x1: "12",
              x2: "88",
              stroke: "hsl(var(--primary))",
              strokeWidth: "1",
              opacity: "0.35",
              animate: { y1: [15, 85, 15], y2: [15, 85, 15] },
              transition: { duration: 2.5, repeat: Infinity, ease: "linear" }
            }
          )
        ] }),
        morphing && /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.p,
          {
            className: "text-xs font-sans text-muted-foreground text-center mt-1 capitalize",
            initial: { opacity: 0, y: 4 },
            animate: { opacity: 0.6, y: 0 },
            exit: { opacity: 0, y: -4 },
            transition: { duration: 0.3 },
            children: [
              activeKey,
              "?"
            ]
          },
          activeKey
        ) })
      ]
    }
  );
};
export {
  BodyShapeIllustration as B,
  FaceShapeIllustration as F,
  Glasses as G,
  Gem as a
};
