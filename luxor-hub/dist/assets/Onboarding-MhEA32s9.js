import { j as jsxRuntimeExports, r as reactExports, e as useNavigate } from "./index-BJjnbSuc.js";
import { d as createLucideIcon, e as useAuth, s as supabase, B as Button } from "./AppContent-4cFLEqQ4.js";
import { t as toast } from "./index-DqqhH6-L.js";
import { o as invariant, t as animateVisualElement, w as setTarget, u as useConstant, h as useIsomorphicLayoutEffect, m as motion } from "./proxy-DPNpeU0t.js";
import { C as Check } from "./check-H0qDKe8z.js";
import { F as FaceShapeIllustration, G as Glasses, a as Gem, B as BodyShapeIllustration } from "./BodyShapeIllustration-qq9zkC4J.js";
import { C as Camera } from "./camera-BOBAbzeF.js";
import { S as Smartphone } from "./smartphone-y52ANk04.js";
import { A as AnimatePresence } from "./index-CWYjAC1K.js";
import { U as User } from "./user-5K2EfAuQ.js";
import { S as Shirt } from "./shirt-GoHrHLkp.js";
import { S as Scissors } from "./scissors-DL0PT7Wd.js";
import { W as Watch } from "./watch-Ffblnd_3.js";
import { u as useGyroTilt, S as SwipeParticles } from "./useGyroTilt-CMkjK3bx.js";
import { t as trackEvent } from "./fbPixel-CTUEdhYl.js";
import { A as ArrowLeft } from "./arrow-left-Di9ks3uY.js";
import { A as ArrowRight } from "./arrow-right-tIMF6hRe.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const FlipHorizontal = createLucideIcon("FlipHorizontal", [
  ["path", { d: "M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3", key: "1i73f7" }],
  ["path", { d: "M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3", key: "saxlbk" }],
  ["path", { d: "M12 20v2", key: "1lh1kg" }],
  ["path", { d: "M12 14v2", key: "8jcxud" }],
  ["path", { d: "M12 8v2", key: "1woqiv" }],
  ["path", { d: "M12 2v2", key: "tus03m" }]
]);
function stopAnimation(visualElement) {
  visualElement.values.forEach((value) => value.stop());
}
function setVariants(visualElement, variantLabels) {
  const reversedLabels = [...variantLabels].reverse();
  reversedLabels.forEach((key) => {
    const variant = visualElement.getVariant(key);
    variant && setTarget(visualElement, variant);
    if (visualElement.variantChildren) {
      visualElement.variantChildren.forEach((child) => {
        setVariants(child, variantLabels);
      });
    }
  });
}
function setValues(visualElement, definition) {
  if (Array.isArray(definition)) {
    return setVariants(visualElement, definition);
  } else if (typeof definition === "string") {
    return setVariants(visualElement, [definition]);
  } else {
    setTarget(visualElement, definition);
  }
}
function animationControls() {
  let hasMounted = false;
  const subscribers = /* @__PURE__ */ new Set();
  const controls = {
    subscribe(visualElement) {
      subscribers.add(visualElement);
      return () => void subscribers.delete(visualElement);
    },
    start(definition, transitionOverride) {
      invariant(hasMounted, "controls.start() should only be called after a component has mounted. Consider calling within a useEffect hook.");
      const animations = [];
      subscribers.forEach((visualElement) => {
        animations.push(animateVisualElement(visualElement, definition, {
          transitionOverride
        }));
      });
      return Promise.all(animations);
    },
    set(definition) {
      invariant(hasMounted, "controls.set() should only be called after a component has mounted. Consider calling within a useEffect hook.");
      return subscribers.forEach((visualElement) => {
        setValues(visualElement, definition);
      });
    },
    stop() {
      subscribers.forEach((visualElement) => {
        stopAnimation(visualElement);
      });
    },
    mount() {
      hasMounted = true;
      return () => {
        hasMounted = false;
        controls.stop();
      };
    }
  };
  return controls;
}
function useAnimationControls() {
  const controls = useConstant(animationControls);
  useIsomorphicLayoutEffect(controls.mount, []);
  return controls;
}
const useAnimation = useAnimationControls;
const femaleImg = "/assets/onboarding-female-MjwJF_KC.jpg";
const maleImg = "/assets/onboarding-male-CeAJXJWr.jpg";
const GenderStep = ({ selected, onSelect }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl lg:text-3xl font-bold text-foreground text-center mb-8", children: "Which department do you prefer to shop in?" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-4", children: [
    { value: "female", label: "Female", img: femaleImg },
    { value: "male", label: "Male", img: maleImg }
  ].map(({ value, label, img }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.button,
    {
      whileTap: { scale: 0.97 },
      onClick: () => onSelect(value),
      className: `rounded-2xl overflow-hidden transition-all ${selected === value ? "shadow-[0_0_0_3px_hsl(43,74%,49%),0_0_24px_-4px_hsl(43,74%,49%,0.4)]" : "border-2 border-border bg-secondary/30 hover:border-muted-foreground/40"}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "aspect-square overflow-hidden bg-muted relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: img, alt: label, className: "w-full h-full object-cover" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 via-black/20 to-transparent backdrop-blur-[2px]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute bottom-3 left-0 right-0 text-center text-white font-sans font-semibold text-sm tracking-wide", children: label })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-3 justify-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selected === value ? "border-primary bg-primary" : "border-muted-foreground/40"}`, children: selected === value && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5 text-primary-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-sans font-medium text-foreground", children: label })
        ] })
      ]
    },
    value
  )) })
] });
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
const femaleShapeOverlays = {
  Hourglass: `M38,26 Q44,26 50,27 Q56,26 62,26 L64,31 Q62,35 58,39 Q54,44 52,49 Q54,53 58,57 Q62,61 64,67 L62,71 Q56,71 50,72 Q44,71 38,71 L36,67 Q38,61 42,57 Q46,53 48,49 Q46,44 42,39 Q38,35 36,31 Z`,
  Triangle: `M45,26 Q47.5,26 50,27 Q52.5,26 55,26 L56,31 Q55,37 54,43 Q53,49 54,53 Q57,57 62,63 Q66,68 64,71 L36,71 Q34,68 38,63 Q43,57 46,53 Q47,49 46,43 Q45,37 44,31 Z`,
  "Inverted triangle": `M32,26 Q41,26 50,27 Q59,26 68,26 L67,31 Q64,37 60,43 Q57,49 56,53 Q54,57 53,63 Q52,68 52,71 L48,71 Q48,68 47,63 Q46,57 44,53 Q43,49 40,43 Q36,37 33,31 Z`,
  Rectangle: `M42,26 Q46,26 50,27 Q54,26 58,26 L59,31 L59,37 L59,43 L59,49 L59,53 L59,57 L59,63 L59,68 L58,71 L42,71 L41,68 L41,63 L41,57 L41,53 L41,49 L41,43 L41,37 L41,31 Z`,
  Round: `M44,26 Q47,26 50,27 Q53,26 56,26 L58,31 Q60,37 64,43 Q68,50 68,55 Q68,61 64,67 L58,71 Q54,71 50,72 Q46,71 42,71 L36,67 Q32,61 32,55 Q32,50 36,43 Q40,37 42,31 Z`
};
const maleShapeOverlays = {
  Rectangle: `M40,28 Q45,28 50,29 Q55,28 60,28 L61,33 L61,41 L61,49 L61,53 L61,59 L61,65 L61,71 L60,75 L40,75 L39,71 L39,65 L39,59 L39,53 L39,49 L39,41 L39,33 Z`,
  Triangle: `M44,28 Q47,28 50,29 Q53,28 56,28 L57,33 Q56,41 55,49 Q55,53 57,59 Q61,65 66,71 L65,75 L35,75 L34,71 Q39,65 43,59 Q45,53 45,49 Q44,41 43,33 Z`,
  "Inverted triangle": `M28,28 Q39,28 50,29 Q61,28 72,28 L70,33 Q66,41 62,49 Q59,53 57,59 Q55,65 54,71 L54,75 L46,75 L46,71 Q45,65 43,59 Q41,53 38,49 Q34,41 30,33 Z`,
  Oval: `M43,28 Q46.5,28 50,29 Q53.5,28 57,28 L60,33 Q63,41 68,49 Q72,55 68,63 Q64,71 60,75 L40,75 Q36,71 32,63 Q28,55 32,49 Q37,41 40,33 Z`,
  Trapezoid: `M32,28 Q41,28 50,29 Q59,28 68,28 L67,33 Q64,41 62,49 Q61,53 61,59 L61,65 L60,71 L59,75 L41,75 L40,71 L39,65 L39,59 Q39,53 38,49 Q36,41 33,33 Z`
};
const BodyShapeSvg = ({ shape, gender, size = 80, className = "" }) => {
  const overlays = gender === "female" ? femaleShapeOverlays : maleShapeOverlays;
  const bodyOutline = gender === "female" ? femaleBodyOutline : maleBodyOutline;
  const overlayPath = overlays[shape];
  const uid = `bs-${shape.replace(/\s/g, "")}-${gender}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      width: size,
      height: size * 1.3,
      viewBox: "0 0 100 100",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("defs", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: `${uid}-skin`, x1: "25%", y1: "0%", x2: "75%", y2: "100%", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "hsl(28, 72%, 90%)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "30%", stopColor: "hsl(22, 68%, 84%)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "60%", stopColor: "hsl(18, 62%, 78%)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "hsl(14, 55%, 72%)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: `${uid}-hl`, x1: "0%", y1: "15%", x2: "100%", y2: "85%", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "hsl(35, 85%, 95%)", stopOpacity: "0.7" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "40%", stopColor: "hsl(25, 70%, 88%)", stopOpacity: "0.15" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "transparent", stopOpacity: "0" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: `${uid}-ish`, x1: "100%", y1: "0%", x2: "0%", y2: "100%", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "hsl(12, 45%, 50%)", stopOpacity: "0.12" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "transparent", stopOpacity: "0" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("radialGradient", { id: `${uid}-spec`, cx: "40%", cy: "30%", r: "35%", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "white", stopOpacity: "0.15" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "transparent", stopOpacity: "0" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: `${uid}-stroke`, x1: "0%", y1: "0%", x2: "100%", y2: "100%", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "hsl(var(--primary) / 0.5)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "50%", stopColor: "hsl(var(--primary) / 0.7)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "hsl(var(--primary) / 0.4)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("filter", { id: `${uid}-drop`, x: "-12%", y: "-8%", width: "124%", height: "120%", children: /* @__PURE__ */ jsxRuntimeExports.jsx("feDropShadow", { dx: "0", dy: "1.5", stdDeviation: "2", floodColor: "hsl(15, 40%, 22%)", floodOpacity: "0.16" }) })
        ] }),
        overlayPath && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: overlayPath, fill: `url(#${uid}-skin)`, stroke: `url(#${uid}-stroke)`, strokeWidth: "0.7", strokeLinejoin: "round", strokeLinecap: "round", filter: `url(#${uid}-drop)` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: overlayPath, fill: `url(#${uid}-hl)`, stroke: "none" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: overlayPath, fill: `url(#${uid}-ish)`, stroke: "none" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: overlayPath, fill: `url(#${uid}-spec)`, stroke: "none" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "path",
          {
            d: bodyOutline,
            stroke: "hsl(0, 0%, 35%)",
            strokeWidth: "0.5",
            fill: "none",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            opacity: "0.5"
          }
        ),
        overlayPath && /* @__PURE__ */ jsxRuntimeExports.jsx("g", { opacity: "0.3", children: [
          { y: gender === "female" ? 27 : 28, label: "S" },
          { y: gender === "female" ? 49 : 49, label: "W" },
          { y: gender === "female" ? 68 : 69, label: "H" }
        ].map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "22", y1: m.y, x2: "78", y2: m.y, stroke: "hsl(var(--primary))", strokeWidth: "0.35", strokeDasharray: "1.5,2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "22", cy: m.y, r: "1", fill: "hsl(var(--primary))", opacity: "0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "78", cy: m.y, r: "1", fill: "hsl(var(--primary))", opacity: "0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("text", { x: "80", y: m.y + 1.5, fontSize: "4", fill: "hsl(var(--primary))", opacity: "0.5", fontFamily: "sans-serif", fontWeight: "600", children: m.label })
        ] }, m.label)) })
      ]
    }
  ) });
};
const faceFeatures = `
  M40,42 C40,40 43,39 44,41
  M56,41 C57,39 60,40 60,42
  M47,52 Q50,54 53,52
  M45,60 Q50,64 55,60
`;
const faceShapePaths = {
  Oval: {
    outline: `M50,10 C70,10 82,30 82,46 C82,64 72,82 62,88 C57,91 43,91 38,88 C28,82 18,64 18,46 C18,30 30,10 50,10 Z`,
    overlay: `M50,13 C68,13 79,31 79,46 C79,63 70,80 61,86 C56,89 44,89 39,86 C30,80 21,63 21,46 C21,31 32,13 50,13 Z`
  },
  Round: {
    outline: `M50,12 C74,12 88,28 88,50 C88,72 74,88 50,88 C26,88 12,72 12,50 C12,28 26,12 50,12 Z`,
    overlay: `M50,15 C72,15 85,30 85,50 C85,70 72,85 50,85 C28,85 15,70 15,50 C15,30 28,15 50,15 Z`
  },
  Square: {
    outline: `M20,14 L80,14 C82,14 84,16 84,18 L86,56 C86,70 76,86 64,90 C58,92 42,92 36,90 C24,86 14,70 14,56 L16,18 C16,16 18,14 20,14 Z`,
    overlay: `M23,17 L77,17 C79,17 81,19 81,21 L83,55 C83,68 74,83 63,87 C57,89 43,89 37,87 C26,83 17,68 17,55 L19,21 C19,19 21,17 23,17 Z`
  },
  Heart: {
    outline: `M50,10 C68,10 88,18 90,36 C92,50 84,66 72,78 C64,86 56,94 50,98 C44,94 36,86 28,78 C16,66 8,50 10,36 C12,18 32,10 50,10 Z`,
    overlay: `M50,13 C66,13 85,20 87,37 C89,49 82,64 71,76 C63,84 55,92 50,95 C45,92 37,84 29,76 C18,64 11,49 13,37 C15,20 34,13 50,13 Z`
  },
  Oblong: {
    outline: `M50,2 C62,2 70,14 70,26 L72,50 C72,68 66,86 58,92 C55,94 45,94 42,92 C34,86 28,68 28,50 L30,26 C30,14 38,2 50,2 Z`,
    overlay: `M50,5 C60,5 67,16 67,27 L69,49 C69,66 64,84 57,90 C54,92 46,92 43,90 C36,84 31,66 31,49 L33,27 C33,16 40,5 50,5 Z`
  },
  Diamond: {
    outline: `M50,6 C54,6 58,16 78,40 C90,54 90,58 78,70 C62,84 56,94 50,94 C44,94 38,84 22,70 C10,58 10,54 22,40 C42,16 46,6 50,6 Z`,
    overlay: `M50,10 C53,10 56,18 76,41 C87,54 87,57 76,68 C61,82 55,91 50,91 C45,91 39,82 24,68 C13,57 13,54 24,41 C44,18 47,10 50,10 Z`
  }
};
const FaceShapeSvg = ({ shape, size = 60, className = "" }) => {
  const shapeDef = faceShapePaths[shape];
  if (!shapeDef) return null;
  const gradId = `face-g-${shape}`;
  const hlId = `face-hl-${shape}`;
  const shId = `face-sh-${shape}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      width: size,
      height: size * 1.2,
      viewBox: "0 0 100 100",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("defs", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: gradId, x1: "30%", y1: "0%", x2: "70%", y2: "100%", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "hsl(25, 70%, 88%)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "50%", stopColor: "hsl(20, 65%, 82%)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "hsl(15, 55%, 76%)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: hlId, x1: "20%", y1: "0%", x2: "80%", y2: "100%", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "hsl(30, 80%, 93%)", stopOpacity: "0.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "transparent", stopOpacity: "0" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("filter", { id: shId, x: "-10%", y: "-10%", width: "120%", height: "120%", children: /* @__PURE__ */ jsxRuntimeExports.jsx("feDropShadow", { dx: "0", dy: "1", stdDeviation: "1.5", floodColor: "hsl(15, 40%, 30%)", floodOpacity: "0.12" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: `${gradId}-stroke`, x1: "0%", y1: "0%", x2: "100%", y2: "100%", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "hsl(20, 50%, 65%)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "hsl(15, 40%, 55%)" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "path",
          {
            d: shapeDef.overlay,
            fill: `url(#${gradId})`,
            stroke: `url(#${gradId}-stroke)`,
            strokeWidth: "0.8",
            strokeLinejoin: "round",
            filter: `url(#${shId})`
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "path",
          {
            d: shapeDef.overlay,
            fill: `url(#${hlId})`,
            stroke: "none"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "path",
          {
            d: shapeDef.outline,
            stroke: "hsl(0, 0%, 30%)",
            strokeWidth: "0.5",
            fill: "none",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            opacity: "0.6"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "path",
          {
            d: faceFeatures,
            stroke: "hsl(0, 0%, 40%)",
            strokeWidth: "0.6",
            fill: "none",
            strokeLinecap: "round",
            opacity: "0.35"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { opacity: "0.15", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "50", y1: "4", x2: "50", y2: "96", stroke: "hsl(var(--primary))", strokeWidth: "0.3", strokeDasharray: "2,2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "10", y1: "50", x2: "90", y2: "50", stroke: "hsl(var(--primary))", strokeWidth: "0.3", strokeDasharray: "2,2" })
        ] })
      ]
    }
  ) });
};
const brandZara = "/assets/brand-zara-BVonxgdW.jpg";
const brandHm = "/assets/brand-hm-pBuR1slZ.jpg";
const brandGap = "/assets/brand-gap-BDOOCj3y.jpg";
const brandMango = "/assets/brand-mango-DUzXTJ1-.jpg";
const brandCos = "/assets/brand-cos-BT2oZreL.jpg";
const brandGanni = "/assets/brand-ganni-DBy8s1iL.jpg";
const brandIsabelmarant = "/assets/brand-isabelmarant-DVybYpZj.jpg";
const brandReformation = "/assets/brand-reformation-BWZcOj_i.jpg";
const brandGucci = "/assets/brand-gucci-DHxnp7s5.jpg";
const brandFendi = "/assets/brand-fendi-CLG0UFc4.jpg";
const brandValentino = "/assets/brand-valentino-CdLKo-YZ.jpg";
const brandChanel = "/assets/brand-chanel-CQrzTvV_.jpg";
const selfieIntroImg = "/assets/selfie-intro-DV8LqcWO.jpg";
const selfieIntroMaleImg = "/assets/selfie-intro-male-BJocyQh8.jpg";
const selfieStep1Img = "/assets/selfie-step1-BYYkUcLQ.jpg";
const selfieStep2Img = "/assets/selfie-step2-BHWIabk5.jpg";
const selfieStep3Img = "/assets/selfie-step3-jEpSdgMX.jpg";
const selfieStep4Img = "/assets/selfie-step4-_xHznhaU.jpg";
const selfieStep5Img = "/assets/selfie-step5-CLFtH0hm.jpg";
const selfieStep1MaleImg = "/assets/selfie-step1-male-CyghQP52.jpg";
const selfieStep2MaleImg = "/assets/selfie-step2-male-BWCfO1Mq.jpg";
const selfieStep3MaleImg = "/assets/selfie-step3-male-cTeP9oaV.jpg";
const selfieStep4MaleImg = "/assets/selfie-step4-male-cCp1btf3.jpg";
const selfieStep5MaleImg = "/assets/selfie-step5-male-CEsR562T.jpg";
const selectionHaptic = () => {
  if (navigator.vibrate) navigator.vibrate(8);
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain).connect(ctx.destination);
    osc.frequency.value = 2200;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(1e-3, ctx.currentTime + 0.04);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.04);
    setTimeout(() => ctx.close(), 80);
  } catch {
  }
};
const SelectionFlip = ({
  children,
  isActive,
  onClick,
  className,
  index = 0
}) => {
  const controls = useAnimation();
  const prevActive = reactExports.useRef(isActive);
  reactExports.useEffect(() => {
    if (isActive && !prevActive.current) {
      selectionHaptic();
      controls.start({
        rotateY: [0, 12, -4, 0],
        scale: [1, 1.03, 0.98, 1],
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
      });
    } else if (!isActive && prevActive.current) {
      controls.start({
        rotateY: [0, -6, 0],
        scale: [1, 0.97, 1],
        transition: { duration: 0.3, ease: "easeOut" }
      });
    }
    prevActive.current = isActive;
  }, [isActive, controls]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.button,
    {
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.35, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] },
      onClick,
      className,
      style: { perspective: 600, transformStyle: "preserve-3d" },
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          animate: controls,
          style: { transformStyle: "preserve-3d" },
          className: "flex items-center w-full",
          children
        }
      )
    }
  );
};
const brandLogoMap = {
  "brand-zara": brandZara,
  "brand-hm": brandHm,
  "brand-gap": brandGap,
  "brand-mango": brandMango,
  "brand-cos": brandCos,
  "brand-ganni": brandGanni,
  "brand-isabelmarant": brandIsabelmarant,
  "brand-reformation": brandReformation,
  "brand-gucci": brandGucci,
  "brand-fendi": brandFendi,
  "brand-valentino": brandValentino,
  "brand-chanel": brandChanel
};
const selfieStepImages = {
  female: { 1: selfieStep1Img, 2: selfieStep2Img, 3: selfieStep3Img, 4: selfieStep4Img, 5: selfieStep5Img },
  male: { 1: selfieStep1MaleImg, 2: selfieStep2MaleImg, 3: selfieStep3MaleImg, 4: selfieStep4MaleImg, 5: selfieStep5MaleImg }
};
const selfieIntroImages = {
  female: selfieIntroImg,
  male: selfieIntroMaleImg
};
const HeightStep = ({ answers, onSelect }) => {
  var _a, _b, _c, _d;
  const [unit, setUnit] = reactExports.useState(((_a = answers.heightUnit) == null ? void 0 : _a[0]) === "cm" ? "cm" : "inch");
  const ft = ((_b = answers.heightFt) == null ? void 0 : _b[0]) || "";
  const inches = ((_c = answers.heightIn) == null ? void 0 : _c[0]) || "";
  const cm = ((_d = answers.heightCm) == null ? void 0 : _d[0]) || "";
  const handleUnitChange = (newUnit) => {
    setUnit(newUnit);
    onSelect("heightUnit", newUnit, true);
  };
  const handleFtChange = (val) => {
    const num = parseInt(val);
    if (val === "" || num >= 0 && num <= 8) onSelect("heightFt", val, true);
  };
  const handleInChange = (val) => {
    const num = parseInt(val);
    if (val === "" || num >= 0 && num <= 11) onSelect("heightIn", val, true);
  };
  const handleCmChange = (val) => {
    const num = parseInt(val);
    if (val === "" || num >= 0 && num <= 250) onSelect("heightCm", val, true);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl lg:text-3xl font-bold text-foreground text-center mb-6", children: "Your height" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex bg-secondary/60 rounded-full p-1 gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => handleUnitChange("inch"),
          className: `px-6 py-2 rounded-full text-sm font-sans font-semibold transition-all duration-300 ${unit === "inch" ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "text-muted-foreground hover:text-foreground"}`,
          children: "INCH"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => handleUnitChange("cm"),
          className: `px-6 py-2 rounded-full text-sm font-sans font-semibold transition-all duration-300 ${unit === "cm" ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "text-muted-foreground hover:text-foreground"}`,
          children: "CM"
        }
      )
    ] }) }),
    unit === "inch" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 max-w-xs mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-sans text-muted-foreground uppercase tracking-wider mb-2 block text-center", children: "Feet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-xl bg-secondary/50 border border-border/40 focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 transition-all", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              inputMode: "numeric",
              placeholder: "5",
              min: 0,
              max: 8,
              value: ft,
              onChange: (e) => handleFtChange(e.target.value),
              className: "w-full bg-transparent text-foreground text-2xl font-display font-bold text-center py-4 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-sans", children: "ft" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-sans text-muted-foreground uppercase tracking-wider mb-2 block text-center", children: "Inches" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-xl bg-secondary/50 border border-border/40 focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 transition-all", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              inputMode: "numeric",
              placeholder: "8",
              min: 0,
              max: 11,
              value: inches,
              onChange: (e) => handleInChange(e.target.value),
              className: "w-full bg-transparent text-foreground text-2xl font-display font-bold text-center py-4 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-sans", children: "in" })
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-xs mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-sans text-muted-foreground uppercase tracking-wider mb-2 block text-center", children: "Centimeters" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-xl bg-secondary/50 border border-border/40 focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 transition-all", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "number",
            inputMode: "numeric",
            placeholder: "172",
            min: 0,
            max: 250,
            value: cm,
            onChange: (e) => handleCmChange(e.target.value),
            className: "w-full bg-transparent text-foreground text-2xl font-display font-bold text-center py-4 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-sans", children: "cm" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-xs text-muted-foreground/50 font-sans mt-4", children: unit === "inch" ? "Average: 5′7″ (female) · 5′10″ (male)" : "Average: 170 cm (female) · 178 cm (male)" })
  ] });
};
const NotificationStep = ({ step }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center text-center pt-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl lg:text-3xl font-bold text-foreground mb-3", children: step.question }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans mb-12", children: step.description }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-2xl p-6 max-w-xs w-full shadow-sm bg-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-sans font-semibold text-foreground text-sm mb-1", children: '"Style DNA" Would Like to Send You Notifications' }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs font-sans mb-4", children: "Notifications may include alerts, sounds and icon badges. These can be configured in Settings." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex border-t border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "flex-1 py-2 text-sm font-sans text-blue-500 border-r border-border", children: "Don't Allow" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "flex-1 py-2 text-sm font-sans text-blue-500 font-semibold", children: "Allow" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-[hsl(0,70%,68%)] text-2xl", children: "↗" })
  ] });
};
const SelfieIntroStep = ({ step, gender }) => {
  const introImg = selfieIntroImages[gender || "female"];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center text-center pt-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        className: "w-48 h-48 mb-8 flex items-center justify-center",
        initial: { opacity: 0, scale: 0.8, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.img,
          {
            src: introImg,
            alt: "Style analysis",
            className: "w-full h-full object-contain rounded-2xl",
            animate: { y: [0, -6, 0] },
            transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.h2,
      {
        className: "font-display text-2xl lg:text-3xl font-bold text-foreground mb-3",
        initial: { opacity: 0, y: 15 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, delay: 0.2 },
        children: step.question
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.p,
      {
        className: "text-muted-foreground font-sans",
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.5, delay: 0.4 },
        children: step.description
      }
    )
  ] });
};
const selfieStepTips = {
  1: "💡 Stand at arm's length from the camera, face centered",
  2: "💡 Keep your chin level — don't tilt up or down",
  3: "💡 Remove glasses and pull hair away from your face",
  4: "💡 Stand in natural daylight, facing a window if possible",
  5: "💡 Stand straight with arms relaxed at your sides, feet shoulder-width apart"
};
const SelfieGuideStep = ({ step, gender }) => {
  const images = selfieStepImages[gender || "female"];
  const stepImg = step.stepNumber ? images[step.stepNumber] : null;
  const tip = step.stepNumber ? selfieStepTips[step.stepNumber] : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        className: "w-full aspect-[3/4] rounded-2xl bg-secondary/50 mb-6 flex items-center justify-center overflow-hidden relative",
        initial: { opacity: 0, scale: 0.85, rotateX: 8 },
        animate: { opacity: 1, scale: 1, rotateX: 0 },
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
        children: [
          stepImg ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.img,
            {
              src: stepImg,
              alt: step.question,
              className: "w-full h-full object-contain",
              initial: { scale: 1.1, opacity: 0 },
              animate: { scale: 1, opacity: 1 },
              transition: { duration: 0.8, delay: 0.15, ease: "easeOut" }
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "w-12 h-12 text-muted-foreground mx-auto mb-3" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "w-8 h-8 text-muted-foreground mx-auto" })
          ] }),
          step.stepNumber === 5 && /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              className: "absolute inset-0 flex items-center justify-center pointer-events-none",
              initial: { opacity: 0, scale: 0.8 },
              animate: { opacity: 1, scale: 1 },
              transition: { duration: 0.6, delay: 0.4 },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 224 288", className: "w-56 h-72", fill: "none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.ellipse,
                {
                  cx: "112",
                  cy: "144",
                  rx: "100",
                  ry: "130",
                  stroke: "hsl(120, 60%, 55%)",
                  strokeWidth: "4",
                  strokeDasharray: "8 6",
                  fill: "none",
                  initial: { pathLength: 0 },
                  animate: { pathLength: 1 },
                  transition: { duration: 1.2, delay: 0.5, ease: "easeInOut" }
                }
              ) })
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        className: "text-center",
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, delay: 0.3 },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[hsl(0,70%,68%)] font-sans text-sm mb-2", children: [
            "Step ",
            step.stepNumber
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-bold text-foreground mb-2", children: step.question }),
          tip && /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.p,
            {
              className: "text-xs font-sans text-muted-foreground bg-secondary/80 rounded-full px-4 py-1.5 inline-block",
              initial: { opacity: 0, y: 5 },
              animate: { opacity: 1, y: 0 },
              transition: { delay: 0.5 },
              children: tip
            }
          )
        ]
      }
    )
  ] });
};
const LightingIndicator = () => {
  const [level, setLevel] = reactExports.useState(0.5);
  reactExports.useEffect(() => {
    const interval = setInterval(() => {
      setLevel(0.4 + Math.random() * 0.4);
    }, 1200);
    return () => clearInterval(interval);
  }, []);
  const quality = level > 0.6 ? "Good" : level > 0.4 ? "Fair" : "Low";
  const color = level > 0.6 ? "hsl(120,60%,55%)" : level > 0.4 ? "hsl(40,90%,55%)" : "hsl(0,70%,55%)";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-4 right-4 z-10 pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2 h-2 rounded-full animate-pulse", style: { backgroundColor: color } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-white/90 text-[10px] font-sans font-medium tracking-wider uppercase", children: [
      quality,
      " light"
    ] })
  ] }) });
};
const faceLandmarks = [
  // Forehead
  { x: 50, y: 28 },
  // Eyebrows
  { x: 36, y: 36 },
  { x: 44, y: 34 },
  { x: 56, y: 34 },
  { x: 64, y: 36 },
  // Eyes
  { x: 38, y: 42 },
  { x: 42, y: 41 },
  { x: 58, y: 41 },
  { x: 62, y: 42 },
  // Nose
  { x: 50, y: 46 },
  { x: 48, y: 52 },
  { x: 50, y: 54 },
  { x: 52, y: 52 },
  // Mouth
  { x: 43, y: 62 },
  { x: 47, y: 64 },
  { x: 50, y: 65 },
  { x: 53, y: 64 },
  { x: 57, y: 62 },
  // Jaw
  { x: 32, y: 48 },
  { x: 34, y: 58 },
  { x: 38, y: 68 },
  { x: 44, y: 73 },
  { x: 50, y: 75 },
  { x: 56, y: 73 },
  { x: 62, y: 68 },
  { x: 66, y: 58 },
  { x: 68, y: 48 }
];
const bodyLandmarks = [
  // Head
  { x: 50, y: 8 },
  // Shoulders
  { x: 35, y: 20 },
  { x: 65, y: 20 },
  // Elbows
  { x: 28, y: 38 },
  { x: 72, y: 38 },
  // Wrists
  { x: 25, y: 52 },
  { x: 75, y: 52 },
  // Torso
  { x: 42, y: 28 },
  { x: 58, y: 28 },
  { x: 44, y: 42 },
  { x: 56, y: 42 },
  // Hips
  { x: 40, y: 50 },
  { x: 60, y: 50 },
  // Knees
  { x: 42, y: 68 },
  { x: 58, y: 68 },
  // Ankles
  { x: 42, y: 85 },
  { x: 58, y: 85 }
];
const AnalyzingOverlay = ({ isSelfie }) => {
  const landmarks = isSelfie ? faceLandmarks : bodyLandmarks;
  const [visibleCount, setVisibleCount] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const interval = setInterval(() => {
      setVisibleCount((prev) => Math.min(prev + 1, landmarks.length));
    }, 80);
    return () => clearInterval(interval);
  }, [landmarks.length]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 z-10 pointer-events-none", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        className: "absolute left-0 right-0 h-[2px]",
        style: { background: "linear-gradient(90deg, transparent, hsl(120,60%,55%), transparent)" },
        initial: { top: "10%" },
        animate: { top: ["10%", "85%", "10%"] },
        transition: { duration: 3, repeat: Infinity, ease: "linear" }
      }
    ),
    landmarks.slice(0, visibleCount).map((pt, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        className: "absolute w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.8)]",
        style: { left: `${pt.x}%`, top: `${pt.y}%` },
        initial: { opacity: 0, scale: 0 },
        animate: { opacity: [0.6, 1, 0.6], scale: 1 },
        transition: { duration: 1.5, repeat: Infinity, delay: i * 0.05 }
      },
      i
    )),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-4 left-0 right-0 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white font-sans text-sm font-semibold tracking-wide", children: "Analyzing..." }) })
  ] });
};
const CameraCaptureStep = ({ step, answers, onSelect }) => {
  var _a;
  const videoRef = reactExports.useRef(null);
  const canvasRef = reactExports.useRef(null);
  const [stream, setStream] = reactExports.useState(null);
  const [capturedImage, setCapturedImage] = reactExports.useState(((_a = answers[step.key]) == null ? void 0 : _a[0]) || null);
  const [cameraError, setCameraError] = reactExports.useState(null);
  const [isAnalyzing, setIsAnalyzing] = reactExports.useState(false);
  const [countdown, setCountdown] = reactExports.useState(null);
  const [showFlash, setShowFlash] = reactExports.useState(false);
  const [facingMode, setFacingMode] = reactExports.useState(
    step.cameraMode === "selfie" ? "user" : "environment"
  );
  const startCamera = reactExports.useCallback(async () => {
    try {
      setCameraError(null);
      const constraints = {
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 1920 }
        }
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setCameraError("Camera access denied. Please enable camera permissions.");
    }
  }, [facingMode]);
  reactExports.useEffect(() => {
    if (!capturedImage) {
      startCamera();
    }
    return () => {
      stream == null ? void 0 : stream.getTracks().forEach((t) => t.stop());
    };
  }, [facingMode]);
  const doCapture = reactExports.useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 200);
    try {
      const actx = new (window.AudioContext || window.webkitAudioContext)();
      const osc1 = actx.createOscillator();
      const gain1 = actx.createGain();
      osc1.connect(gain1).connect(actx.destination);
      osc1.frequency.value = 6e3;
      osc1.type = "square";
      gain1.gain.setValueAtTime(0.12, actx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(1e-3, actx.currentTime + 0.03);
      osc1.start(actx.currentTime);
      osc1.stop(actx.currentTime + 0.03);
      const osc2 = actx.createOscillator();
      const gain2 = actx.createGain();
      osc2.connect(gain2).connect(actx.destination);
      osc2.frequency.value = 800;
      osc2.type = "triangle";
      gain2.gain.setValueAtTime(0.08, actx.currentTime + 0.02);
      gain2.gain.exponentialRampToValueAtTime(1e-3, actx.currentTime + 0.06);
      osc2.start(actx.currentTime + 0.02);
      osc2.stop(actx.currentTime + 0.06);
      const osc3 = actx.createOscillator();
      const gain3 = actx.createGain();
      osc3.connect(gain3).connect(actx.destination);
      osc3.frequency.value = 5200;
      osc3.type = "square";
      gain3.gain.setValueAtTime(0.09, actx.currentTime + 0.07);
      gain3.gain.exponentialRampToValueAtTime(1e-3, actx.currentTime + 0.1);
      osc3.start(actx.currentTime + 0.07);
      osc3.stop(actx.currentTime + 0.1);
      setTimeout(() => actx.close(), 200);
    } catch {
    }
    if (navigator.vibrate) navigator.vibrate([12, 25, 8, 35, 10]);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(dataUrl);
    setIsAnalyzing(true);
    stream == null ? void 0 : stream.getTracks().forEach((t) => t.stop());
    setTimeout(() => {
      setIsAnalyzing(false);
      onSelect(step.key, dataUrl, true);
    }, 3e3);
  }, [facingMode, stream, step.key, onSelect]);
  const handleCapture = () => {
    setCountdown(3);
    if (navigator.vibrate) navigator.vibrate([15, 40, 15]);
    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
        const intensity = count === 2 ? [20, 30, 20] : [30, 20, 30, 20, 30];
        if (navigator.vibrate) navigator.vibrate(intensity);
      } else {
        clearInterval(interval);
        setCountdown(null);
        if (navigator.vibrate) navigator.vibrate([50, 30, 80]);
        doCapture();
      }
    }, 800);
  };
  const handleRetake = () => {
    setCapturedImage(null);
    setIsAnalyzing(false);
    onSelect(step.key, "", true);
    startCamera();
  };
  const toggleCamera = () => {
    stream == null ? void 0 : stream.getTracks().forEach((t) => t.stop());
    setFacingMode((prev) => prev === "user" ? "environment" : "user");
  };
  const isSelfie = step.cameraMode === "selfie";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-bold text-foreground text-center mb-2", children: step.question }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans text-sm text-center mb-4", children: step.description }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full rounded-2xl overflow-hidden bg-black", style: { aspectRatio: isSelfie ? "3/4" : "9/16" }, children: [
      cameraError ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "w-12 h-12 mb-4 opacity-50" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm opacity-80", children: cameraError }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: startCamera,
            className: "mt-4 px-4 py-2 rounded-full bg-white/20 text-sm",
            children: "Try Again"
          }
        )
      ] }) : capturedImage ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: capturedImage, alt: "Captured", className: "w-full h-full object-cover" }),
        isAnalyzing && /* @__PURE__ */ jsxRuntimeExports.jsx(AnalyzingOverlay, { isSelfie })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "video",
          {
            ref: videoRef,
            autoPlay: true,
            playsInline: true,
            muted: true,
            className: `w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(LightingIndicator, {}),
        isSelfie && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 flex items-center justify-center pointer-events-none", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-56 h-72", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/70 rounded-tl-2xl" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/70 rounded-tr-2xl" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/70 rounded-bl-2xl" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/70 rounded-br-2xl" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 224 288", className: "w-full h-full", fill: "none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("ellipse", { cx: "112", cy: "144", rx: "90", ry: "120", stroke: "white", strokeWidth: "1", strokeDasharray: "6 4", opacity: "0.35" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-[1px] bg-white/40" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-[1px] h-4 bg-white/40 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-6 left-0 right-0 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/80 text-xs font-sans tracking-wide bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full", children: "Position your face within the frame" }) })
        ] }),
        !isSelfie && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 flex items-center justify-center pointer-events-none", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-44 h-[22rem]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-white/70 rounded-tl-xl" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-white/70 rounded-tr-xl" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-white/70 rounded-bl-xl" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-white/70 rounded-br-xl" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 176 352", className: "w-full h-full", fill: "none", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M88,30 C88,30 70,30 70,50 C70,65 75,70 65,100 C55,130 50,140 50,170 C50,200 55,220 55,250 C55,280 50,310 50,330 M88,30 C88,30 106,30 106,50 C106,65 101,70 111,100 C121,130 126,140 126,170 C126,200 121,220 121,250 C121,280 126,310 126,330", stroke: "white", strokeWidth: "1", strokeDasharray: "6 4", opacity: "0.25" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "88", cy: "18", r: "12", stroke: "white", strokeWidth: "1", strokeDasharray: "4 3", opacity: "0.25" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-6 left-0 right-0 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/80 text-xs font-sans tracking-wide bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full", children: "Stand back and fit your full body" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: countdown !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          className: "absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.span,
            {
              initial: { scale: 2.5, opacity: 0 },
              animate: { scale: [1, 1.15, 1], opacity: 1 },
              exit: { scale: 0.3, opacity: 0 },
              transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], scale: { times: [0, 0.6, 1] } },
              className: "font-display text-8xl font-bold text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.6)] relative",
              children: [
                countdown,
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.span,
                  {
                    className: "absolute inset-0 flex items-center justify-center pointer-events-none",
                    initial: { scale: 0.8, opacity: 0.8 },
                    animate: { scale: 2.5, opacity: 0 },
                    transition: { duration: 0.7, ease: "easeOut" },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-24 h-24 rounded-full border-2 border-white/60" })
                  }
                )
              ]
            },
            countdown
          ) })
        },
        "countdown"
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showFlash && /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { opacity: 1 },
          animate: { opacity: 0 },
          transition: { duration: 0.2 },
          className: "absolute inset-0 z-30 bg-white"
        },
        "flash"
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("canvas", { ref: canvasRef, className: "hidden" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-4 mt-6", children: capturedImage && !isAnalyzing ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: handleRetake,
        className: "px-6 py-3 rounded-full bg-secondary text-foreground font-sans font-semibold text-sm",
        children: "Retake"
      }
    ) : !capturedImage && countdown === null ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: toggleCamera,
          className: "w-12 h-12 rounded-full bg-secondary flex items-center justify-center",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(FlipHorizontal, { className: "w-5 h-5 text-foreground" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: handleCapture,
          className: "w-16 h-16 rounded-full border-4 border-foreground/30 bg-white flex items-center justify-center",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-full bg-[hsl(0,70%,68%)]" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12" })
    ] }) : null })
  ] });
};
const femaleGarments = [
  {
    d: "M60,24 L57,26 Q54,30 52,36 Q49,45 46,58 Q44,68 43,78 Q42,83 46,84 L50,84 L54,84 Q55,78 57,70 L60,60 L63,70 Q65,78 66,84 L70,84 L74,84 Q78,83 77,78 Q76,68 73,58 Q70,45 68,36 Q66,30 63,26 Z",
    fill: "hsl(43,74%,49%)",
    label: "Dress"
  },
  {
    d: "M80,24 L76,27 Q74,30 73,35 Q72,40 72,48 L72,56 L74,56 Q75,48 76,42 Q77,36 78,32 L80,28 L82,32 Q83,36 84,42 Q85,48 86,56 L88,56 L88,48 Q88,40 87,35 Q86,30 84,27 Z M76,56 Q75,60 74,64 L86,64 Q85,60 84,56 Z",
    fill: "hsl(350,55%,68%)",
    label: "Blouse"
  },
  {
    d: "M100,24 L96,27 Q93,32 91,40 Q88,52 85,66 Q84,74 83,82 Q82,86 86,86 L100,86 L114,86 Q118,86 117,82 Q116,74 113,66 Q110,52 108,40 Q106,32 104,27 Z",
    fill: "hsl(280,25%,72%)",
    label: "A-Line"
  },
  {
    d: "M120,24 L117,27 Q115,30 114,35 Q113,40 113,47 L113,55 L115,55 Q116,47 117,42 Q118,36 119,32 L120,28 L121,32 Q122,36 123,42 Q124,47 125,55 L127,55 L127,47 Q127,40 126,35 Q125,30 123,27 Z",
    fill: "hsl(0,0%,93%)",
    label: "Tank"
  },
  {
    d: "M140,24 L138,27 Q136,32 135,40 L135,52 L133,52 Q132,60 131,70 Q130,78 130,84 L134,84 Q135,78 136,70 L137,60 L140,52 L143,60 L144,70 Q145,78 146,84 L150,84 Q150,78 149,70 Q148,60 147,52 L145,52 L145,40 Q144,32 142,27 Z",
    fill: "hsl(210,30%,62%)",
    label: "Palazzo"
  }
];
const maleGarments = [
  {
    d: "M60,24 L55,27 Q52,32 50,40 L49,50 L50,60 Q51,70 51,80 L55,80 Q56,70 57,60 L58,45 L60,30 L62,45 L63,60 Q64,70 65,80 L69,80 Q69,70 70,60 L71,50 Q70,40 68,32 Q66,27 65,24 Z",
    fill: "hsl(220,30%,30%)",
    label: "Blazer"
  },
  {
    d: "M80,24 L77,27 Q76,30 75,35 Q74,40 74,48 L74,58 L76,58 Q77,50 78,44 Q79,38 80,32 L80,28 L80,32 Q81,38 82,44 Q83,50 84,58 L86,58 L86,48 Q86,40 85,35 Q84,30 83,27 Z",
    fill: "hsl(0,0%,96%)",
    label: "Shirt"
  },
  {
    d: "M100,24 L98,27 Q96,32 95,40 L95,52 L93,52 Q92,62 92,74 Q92,80 92,84 L96,84 Q97,78 98,68 L99,58 L100,52 L101,58 L102,68 Q103,78 104,84 L108,84 Q108,80 108,74 Q108,62 107,52 L105,52 L105,40 Q104,32 102,27 Z",
    fill: "hsl(30,22%,52%)",
    label: "Chinos"
  },
  {
    d: "M120,24 L117,27 Q115,30 114,36 Q113,42 113,50 L113,58 L115,58 Q116,50 117,44 Q118,38 119,33 L120,28 L121,33 Q122,38 123,44 Q124,50 125,58 L127,58 L127,50 Q127,42 126,36 Q125,30 123,27 Z",
    fill: "hsl(160,28%,50%)",
    label: "Polo"
  },
  {
    d: "M140,24 L135,27 Q132,32 130,42 L129,55 L130,68 Q131,76 131,84 L135,84 Q136,76 137,66 L138,50 L140,32 L142,50 L143,66 Q144,76 145,84 L149,84 Q149,76 150,68 L151,55 Q150,42 148,32 Q146,27 145,24 Z",
    fill: "hsl(0,0%,20%)",
    label: "Overcoat"
  }
];
const SparkleParticles = ({ progress, garmentCount = 5 }) => {
  const bursts = Array.from({ length: garmentCount }, (_, gi) => {
    const cx = 60 + gi * 20;
    return Array.from({ length: 6 }, (_2, pi) => {
      const angle = pi / 6 * Math.PI * 2 + Math.random() * 0.5;
      const dist = 8 + Math.random() * 14;
      return {
        gi,
        cx,
        tx: cx + Math.cos(angle) * dist,
        ty: 45 - Math.sin(angle) * dist + Math.random() * 10,
        delay: pi * 0.08,
        size: 0.8 + Math.random() * 0.8
      };
    });
  }).flat();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    bursts.map((p, i) => {
      const done = progress && progress[p.gi] >= 100;
      if (!done) return null;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.circle,
        {
          cx: p.cx,
          cy: 55,
          r: p.size,
          fill: "hsl(43,74%,70%)",
          initial: { opacity: 0, cx: p.cx, cy: 55 },
          animate: { opacity: [0, 1, 0], cx: p.tx, cy: p.ty, r: [p.size, p.size * 0.3, 0] },
          transition: { duration: 0.8, delay: p.delay, ease: "easeOut" }
        },
        i
      );
    }),
    Array.from({ length: 8 }, (_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.circle,
      {
        cx: 40 + Math.random() * 120,
        cy: 90,
        r: 0.8,
        fill: "hsl(43,74%,65%)",
        initial: { opacity: 0, cy: 90 },
        animate: { opacity: [0, 0.6, 0], cy: [90, 30 + Math.random() * 30, 10] },
        transition: { duration: 2.5 + Math.random() * 2, delay: Math.random() * 3, repeat: Infinity, ease: "easeOut" }
      },
      `ambient-${i}`
    ))
  ] });
};
const GeneratingStep = ({ step, gender }) => {
  const [progress, setProgress] = reactExports.useState([0, 0, 0, 0, 0]);
  const [allDone, setAllDone] = reactExports.useState(false);
  const canvasRef = reactExports.useRef(null);
  const garments = gender === "male" ? maleGarments : femaleGarments;
  const labels = [
    "Building your Color Palette",
    "Crafting your Style Guide",
    "Analyzing your preferences",
    "Finding the best matches",
    "Generating personal outfits"
  ];
  reactExports.useEffect(() => {
    let currentStep = 0;
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = [...prev];
        if (currentStep < 5) {
          next[currentStep] = Math.min(next[currentStep] + Math.random() * 15 + 5, 100);
          if (next[currentStep] >= 100) {
            next[currentStep] = 100;
            currentStep++;
          }
        }
        if (currentStep >= 5 && !allDone) setAllDone(true);
        return next;
      });
      if (currentStep >= 5) clearInterval(interval);
    }, 200);
    return () => clearInterval(interval);
  }, []);
  reactExports.useEffect(() => {
    if (!allDone || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    const colors = ["hsl(43,74%,49%)", "hsl(350,70%,65%)", "hsl(30,90%,60%)", "hsl(0,0%,100%)", "hsl(280,30%,75%)"];
    const particles = Array.from({ length: 80 }, () => ({
      x: W / 2 + (Math.random() - 0.5) * 60,
      y: H * 0.3,
      vx: (Math.random() - 0.5) * 8,
      vy: -Math.random() * 6 - 2,
      w: 4 + Math.random() * 4,
      h: 3 + Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 12,
      opacity: 1
    }));
    let frame;
    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.vy += 0.15;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.opacity = Math.max(0, p.opacity - 5e-3);
        if (p.opacity <= 0) continue;
        alive = true;
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (alive) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    if (navigator.vibrate) navigator.vibrate([15, 50, 25]);
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const playNote = (freq, start, dur, vol, type = "sine") => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, audioCtx.currentTime + start);
        gain.gain.setValueAtTime(vol, audioCtx.currentTime + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(1e-3, audioCtx.currentTime + start + dur);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + start);
        osc.stop(audioCtx.currentTime + start + dur);
      };
      playNote(784, 0, 0.15, 0.18, "triangle");
      playNote(1047, 0.07, 0.18, 0.2, "triangle");
      playNote(1319, 0.14, 0.22, 0.22, "sine");
      playNote(1568, 0.2, 0.3, 0.2, "sine");
      playNote(2093, 0.28, 0.6, 0.15, "sine");
      playNote(130, 0, 0.3, 0.12, "sine");
      playNote(3136, 0.3, 0.8, 0.04, "sine");
    } catch (_) {
    }
    return () => cancelAnimationFrame(frame);
  }, [allDone]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center pt-8 relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "canvas",
      {
        ref: canvasRef,
        className: "absolute inset-0 w-full h-full pointer-events-none z-10",
        style: { opacity: allDone ? 1 : 0 }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-56 h-52 mb-4 flex flex-col items-center justify-center relative", children: [
      !allDone && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "w-40 h-32 rounded-full opacity-40",
          style: {
            background: "radial-gradient(ellipse at center, hsl(43,74%,49%) 0%, hsl(43,74%,49%,0.3) 40%, transparent 70%)",
            animation: "pulseGlow 2.5s ease-in-out infinite",
            filter: "blur(18px)"
          }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 200 100", className: "w-full flex-1 relative z-[1]", fill: "none", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("defs", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "rackShimmer", x1: "0%", y1: "0%", x2: "100%", y2: "0%", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "hsl(var(--foreground))", stopOpacity: "0.6" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "50%", stopColor: "hsl(43,74%,49%)", stopOpacity: "0.9" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "hsl(var(--foreground))", stopOpacity: "0.6" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("animateTransform", { attributeName: "gradientTransform", type: "translate", values: "-1 0;1 0;-1 0", dur: "3s", repeatCount: "indefinite" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "scanBeam", x1: "0%", y1: "0%", x2: "100%", y2: "0%", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "transparent" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "45%", stopColor: "hsl(43,74%,49%)", stopOpacity: "0.4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "55%", stopColor: "hsl(43,74%,49%)", stopOpacity: "0.4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "transparent" })
          ] }),
          garments.map((g, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: `garment-${i}`, x1: "30%", y1: "0%", x2: "70%", y2: "100%", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: g.fill, stopOpacity: "1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: g.fill, stopOpacity: "0.7" })
          ] }, `gg-${i}`)),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "garmentHl", x1: "0%", y1: "0%", x2: "100%", y2: "100%", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "white", stopOpacity: "0.25" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "white", stopOpacity: "0" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("filter", { id: "garmentShadow", x: "-10%", y: "-5%", width: "120%", height: "115%", children: /* @__PURE__ */ jsxRuntimeExports.jsx("feDropShadow", { dx: "0", dy: "1", stdDeviation: "1.5", floodColor: "hsl(0,0%,0%)", floodOpacity: "0.2" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "40", y1: "18", x2: "40", y2: "95", stroke: "hsl(var(--foreground))", strokeWidth: "1.5", opacity: "0.35" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "160", y1: "18", x2: "160", y2: "95", stroke: "hsl(var(--foreground))", strokeWidth: "1.5", opacity: "0.35" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "32", y1: "95", x2: "48", y2: "95", stroke: "hsl(var(--foreground))", strokeWidth: "1.2", opacity: "0.25", strokeLinecap: "round" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "152", y1: "95", x2: "168", y2: "95", stroke: "hsl(var(--foreground))", strokeWidth: "1.2", opacity: "0.25", strokeLinecap: "round" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "35", y1: "18", x2: "165", y2: "18", stroke: "url(#rackShimmer)", strokeWidth: "2.5", strokeLinecap: "round" }),
        !allDone && /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.rect,
          {
            x: "35",
            y: "20",
            width: "130",
            height: "2",
            fill: "url(#scanBeam)",
            initial: { y: 20 },
            animate: { y: [20, 85, 20] },
            transition: { duration: 2.5, repeat: Infinity, ease: "linear" },
            rx: "1"
          }
        ),
        garments.map((g, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.g, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.path,
            {
              d: `M${60 + i * 20},18 L${60 + i * 20},21 Q${60 + i * 20 - 4},22 ${60 + i * 20 - 5},24 L${60 + i * 20 + 5},24 Q${60 + i * 20 + 4},22 ${60 + i * 20},21`,
              stroke: "hsl(var(--foreground))",
              strokeWidth: "0.8",
              fill: "none",
              opacity: "0.5",
              initial: { opacity: 0 },
              animate: { opacity: 0.5 },
              transition: { delay: i * 0.3 }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.path,
            {
              d: g.d,
              fill: `url(#garment-${i})`,
              opacity: "0.9",
              filter: "url(#garmentShadow)",
              initial: { scale: 0, opacity: 0 },
              animate: { scale: 1, opacity: 0.9, rotate: [0, -1.5, 1.5, -0.8, 0], y: [0, -1, 1, -0.5, 0] },
              transition: {
                scale: { delay: i * 0.3, duration: 0.5, type: "spring", stiffness: 200 },
                opacity: { delay: i * 0.3, duration: 0.4 },
                rotate: { delay: i * 0.3 + 0.5, duration: 4, repeat: Infinity, ease: "easeInOut" },
                y: { delay: i * 0.3 + 0.5, duration: 3, repeat: Infinity, ease: "easeInOut" }
              },
              style: { transformOrigin: `${60 + i * 20}px 24px` }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.path,
            {
              d: g.d,
              fill: "url(#garmentHl)",
              opacity: "0.6",
              initial: { scale: 0, opacity: 0 },
              animate: { scale: 1, opacity: 0.6 },
              transition: { delay: i * 0.3 + 0.2, duration: 0.5 },
              style: { transformOrigin: `${60 + i * 20}px 24px` }
            }
          ),
          progress[i] >= 100 && /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.path,
            {
              d: g.d,
              fill: "white",
              initial: { opacity: 0.5 },
              animate: { opacity: 0 },
              transition: { duration: 0.8 },
              style: { transformOrigin: `${60 + i * 20}px 24px` }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.text,
            {
              x: 60 + i * 20,
              y: 94,
              textAnchor: "middle",
              fill: "hsl(var(--foreground))",
              fontSize: "5",
              fontFamily: "sans-serif",
              fontWeight: "500",
              opacity: "0.5",
              initial: { opacity: 0, y: 98 },
              animate: { opacity: 0.5, y: 94 },
              transition: { delay: i * 0.3 + 0.6 },
              children: g.label
            }
          )
        ] }, i)),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SparkleParticles, { progress, garmentCount: garments.length })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: allDone && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        className: "flex items-center gap-2 mb-4",
        initial: { opacity: 0, scale: 0.5 },
        animate: { opacity: 1, scale: 1 },
        transition: { type: "spring", stiffness: 300, damping: 20 },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-full bg-primary flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-5 h-5 text-primary-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-sans text-sm font-semibold text-primary", children: "Style Formula Ready!" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-bold text-foreground text-center mb-8", children: allDone ? "Your Style Formula is ready!" : step.question }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full space-y-4", children: labels.map((label, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between mb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-sans text-sm ${progress[i] >= 100 ? "text-primary font-bold" : progress[i] > 0 ? "font-bold text-foreground" : "text-muted-foreground"}`, children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-sans text-sm text-muted-foreground", children: [
          Math.round(progress[i]),
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-2 rounded-full bg-secondary/60 overflow-hidden relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "h-full rounded-full transition-all duration-200 relative overflow-hidden",
            style: {
              width: `${progress[i]}%`,
              background: progress[i] > 0 ? "linear-gradient(90deg, hsl(38,72%,42%), hsl(43,74%,49%), hsl(48,80%,58%), hsl(43,74%,49%), hsl(38,72%,42%))" : void 0,
              backgroundSize: "200% 100%",
              animation: progress[i] > 0 && progress[i] < 100 ? "shimmer 2s linear infinite" : void 0
            }
          }
        ),
        progress[i] >= 100 && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute inset-0 rounded-full",
            style: {
              background: "linear-gradient(90deg, transparent, hsla(43,74%,70%,0.4), transparent)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2.5s linear infinite"
            }
          }
        )
      ] })
    ] }, label)) })
  ] });
};
const faceRecommendations = {
  Oval: { necklines: ["V-neck", "Scoop", "Off-shoulder"], glasses: ["Any frame shape"], earrings: ["Drop earrings", "Studs"], hairstyles: ["Side part", "Loose waves"] },
  Round: { necklines: ["V-neck", "Deep scoop", "Asymmetric"], glasses: ["Angular frames", "Cat-eye"], earrings: ["Long drops", "Angular shapes"], hairstyles: ["Side-swept bangs", "Layers"] },
  Square: { necklines: ["Round neck", "Cowl neck", "Off-shoulder"], glasses: ["Round frames", "Oval"], earrings: ["Hoops", "Round drops"], hairstyles: ["Soft layers", "Side part"] },
  Heart: { necklines: ["Boat neck", "Sweetheart", "Scoop"], glasses: ["Bottom-heavy frames", "Aviator"], earrings: ["Chandelier", "Teardrop"], hairstyles: ["Chin-length bob", "Side bangs"] },
  Oblong: { necklines: ["Boat neck", "Square neck", "Turtleneck"], glasses: ["Wide frames", "Aviator"], earrings: ["Wide studs", "Button earrings"], hairstyles: ["Bangs", "Volume at sides"] },
  Diamond: { necklines: ["Scoop", "V-neck", "Halter"], glasses: ["Oval frames", "Cat-eye"], earrings: ["Linear drops", "Studs"], hairstyles: ["Side-swept", "Chin-length layers"] }
};
const bodyRecommendations = {
  Hourglass: { silhouettes: ["Fitted & belted", "Wrap styles"], dresses: ["Wrap dress", "Bodycon", "Fit & flare"], trousers: ["High-waisted", "Bootcut"], jackets: ["Cropped blazer", "Belted coat"] },
  Triangle: { silhouettes: ["A-line", "Empire waist"], dresses: ["A-line dress", "Fit & flare"], trousers: ["Wide leg", "Bootcut"], jackets: ["Structured blazer", "Peplum top"] },
  "Inverted triangle": { silhouettes: ["V-neck tops", "A-line skirts"], dresses: ["V-neck dress", "A-line"], trousers: ["Wide leg", "Cargo"], jackets: ["Unstructured blazer", "Waterfall jacket"] },
  "Inverted Triangle": { silhouettes: ["V-neck tops", "A-line skirts"], dresses: ["V-neck dress", "A-line"], trousers: ["Wide leg", "Cargo"], jackets: ["Unstructured blazer", "Waterfall jacket"] },
  Rectangle: { silhouettes: ["Belted styles", "Peplum"], dresses: ["Wrap dress", "Peplum dress"], trousers: ["Tapered", "Pleated"], jackets: ["Belted trench", "Cropped jacket"] },
  Round: { silhouettes: ["Empire waist", "Vertical lines"], dresses: ["Empire dress", "Shift dress"], trousers: ["Straight leg", "Bootcut"], jackets: ["Longline blazer", "Open-front cardigan"] },
  Oval: { silhouettes: ["Empire waist", "Vertical lines"], dresses: ["Empire dress", "Shift dress"], trousers: ["Straight leg", "Flat-front"], jackets: ["Structured blazer", "Single-breasted coat"] },
  Trapezoid: { silhouettes: ["Relaxed fit", "Layered looks"], dresses: ["Relaxed shirt dress", "Henley"], trousers: ["Straight leg", "Chinos"], jackets: ["Bomber", "Harrington jacket"] }
};
const faceShapes = [
  { shape: "Oval", icon: "⬮", description: "Balanced proportions with a gently rounded jawline" },
  { shape: "Round", icon: "⬤", description: "Equal width and length with soft angles" },
  { shape: "Square", icon: "⬜", description: "Strong jawline with equal width forehead" },
  { shape: "Heart", icon: "♡", description: "Wider forehead tapering to a narrow chin" },
  { shape: "Oblong", icon: "⏐", description: "Longer than wide with a straight cheek line" },
  { shape: "Diamond", icon: "◇", description: "Narrow forehead and jaw, wide cheekbones" }
];
const bodyShapeResults = {
  female: [
    { label: "Hourglass", traits: ["Balanced shoulders & hips", "Defined waist", "Curvy silhouette"] },
    { label: "Triangle", traits: ["Narrower shoulders", "Wider hips", "Defined lower body"] },
    { label: "Inverted Triangle", traits: ["Broader shoulders", "Narrower hips", "Athletic upper body"] },
    { label: "Rectangle", traits: ["Balanced proportions", "Straight silhouette", "Even distribution"] },
    { label: "Round", traits: ["Fuller midsection", "Proportionate limbs", "Soft curves"] }
  ],
  male: [
    { label: "Rectangle", traits: ["Even proportions", "Straight torso", "Balanced build"] },
    { label: "Triangle", traits: ["Narrower shoulders", "Wider waist", "Solid lower body"] },
    { label: "Inverted Triangle", traits: ["Broad shoulders", "Narrow waist", "V-shaped torso"] },
    { label: "Oval", traits: ["Fuller midsection", "Rounded torso", "Proportionate limbs"] },
    { label: "Trapezoid", traits: ["Wide shoulders", "Slightly narrow waist", "Athletic build"] }
  ]
};
const DetectionResultStep = ({ step, answers, gender, aiResults }) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
  const isFace = step.detectionMode === "face";
  const [revealed, setRevealed] = reactExports.useState(false);
  const isLoading = isFace ? !(aiResults == null ? void 0 : aiResults.face) : !(aiResults == null ? void 0 : aiResults.body);
  reactExports.useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setRevealed(true);
        if (navigator.vibrate) navigator.vibrate([15, 50, 25]);
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const playTone = (freq, start, dur) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.12, ctx.currentTime + start);
            gain.gain.exponentialRampToValueAtTime(1e-3, ctx.currentTime + start + dur);
            osc.connect(gain).connect(ctx.destination);
            osc.start(ctx.currentTime + start);
            osc.stop(ctx.currentTime + start + dur);
          };
          playTone(880, 0, 0.15);
          playTone(1320, 0.1, 0.2);
        } catch (_) {
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);
  const faceAI = aiResults == null ? void 0 : aiResults.face;
  const bodyAI = aiResults == null ? void 0 : aiResults.body;
  const detectedFaceShape = faceAI ? faceShapes.find((f) => f.shape === faceAI.faceShape) || { shape: faceAI.faceShape, icon: "◎", description: faceAI.description || "" } : faceShapes[Math.abs((((_b = (_a = answers.ageRange) == null ? void 0 : _a[0]) == null ? void 0 : _b.charCodeAt(0)) || 0) + (((_d = (_c = answers.styleGoal) == null ? void 0 : _c[0]) == null ? void 0 : _d.length) || 0)) % faceShapes.length];
  const faceDescription = (faceAI == null ? void 0 : faceAI.description) || detectedFaceShape.description;
  const genderKey = gender || "female";
  const bodyShapes = bodyShapeResults[genderKey];
  const detectedBodyShape = bodyAI ? { label: bodyAI.bodyShape, traits: bodyAI.traits || [] } : bodyShapes[Math.abs((((_f = (_e = answers.budget) == null ? void 0 : _e[0]) == null ? void 0 : _f.charCodeAt(0)) || 0) + (((_h = (_g = answers.styleChallenge) == null ? void 0 : _g[0]) == null ? void 0 : _h.length) || 0)) % bodyShapes.length];
  const capturedImage = isFace ? (_i = answers.selfieCapture) == null ? void 0 : _i[0] : (_j = answers.fullBodyCapture) == null ? void 0 : _j[0];
  if (isFace) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.h2,
        {
          className: "font-display text-2xl lg:text-3xl font-bold text-foreground text-center mb-2",
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5 },
          children: isLoading ? "Analyzing your face..." : step.question
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.p,
        {
          className: "text-muted-foreground font-sans text-sm text-center mb-6",
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { delay: 0.3 },
          children: isLoading ? "Our AI is studying your facial proportions" : step.description
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          className: "relative w-40 h-40 rounded-full overflow-hidden mb-6 ring-4 ring-primary/30",
          initial: { scale: 0.8, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
          children: [
            capturedImage ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: capturedImage, alt: "Your selfie", className: "w-full h-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full bg-secondary flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-16 h-16 text-muted-foreground" }) }),
            isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/30 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" }) })
          ]
        }
      ),
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(FaceShapeIllustration, { shape: "oval", size: 80, morphing: true, className: "mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: revealed && !isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          className: "flex flex-col items-center gap-2 mb-4",
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FaceShapeIllustration, { shape: detectedFaceShape.shape, size: 90, className: "mb-2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground font-sans uppercase tracking-wider", children: [
              detectedFaceShape.shape,
              " face"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans text-sm text-center max-w-xs", children: faceDescription })
          ]
        }
      ) }),
      revealed && !isLoading && (() => {
        const recs = faceRecommendations[detectedFaceShape.shape] || faceRecommendations.Oval;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            className: "w-full space-y-3 mb-6",
            initial: { opacity: 0, y: 15 },
            animate: { opacity: 1, y: 0 },
            transition: { delay: 0.4 },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-display text-lg font-bold text-foreground text-center", children: "Best For You" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-xl bg-secondary/50 space-y-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Shirt, { className: "w-4 h-4 text-primary" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-foreground font-sans", children: "Necklines" })
                  ] }),
                  recs.necklines.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground font-sans", children: [
                    "• ",
                    n
                  ] }, n))
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-xl bg-secondary/50 space-y-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Glasses, { className: "w-4 h-4 text-primary" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-foreground font-sans", children: "Glasses" })
                  ] }),
                  recs.glasses.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground font-sans", children: [
                    "• ",
                    n
                  ] }, n))
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-xl bg-secondary/50 space-y-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Gem, { className: "w-4 h-4 text-primary" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-foreground font-sans", children: "Earrings" })
                  ] }),
                  recs.earrings.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground font-sans", children: [
                    "• ",
                    n
                  ] }, n))
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-xl bg-secondary/50 space-y-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Scissors, { className: "w-4 h-4 text-primary" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-foreground font-sans", children: "Hairstyles" })
                  ] }),
                  recs.hairstyles.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground font-sans", children: [
                    "• ",
                    n
                  ] }, n))
                ] })
              ] })
            ]
          }
        );
      })(),
      !isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          className: "w-full",
          initial: { opacity: 0 },
          animate: { opacity: revealed ? 1 : 0 },
          transition: { delay: 0.3 },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans text-xs text-center mb-3 uppercase tracking-wider", children: "Face shape guide" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: faceShapes.map((fs) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: `flex flex-col items-center p-3 rounded-xl transition-all ${fs.shape === detectedFaceShape.shape ? "bg-foreground text-background" : "bg-secondary/60 text-muted-foreground"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg mb-1", children: fs.icon }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-sans text-xs font-medium", children: fs.shape })
                ]
              },
              fs.shape
            )) })
          ]
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.h2,
      {
        className: "font-display text-2xl lg:text-3xl font-bold text-foreground text-center mb-2",
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 },
        children: isLoading ? "Analyzing your body shape..." : step.question
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.p,
      {
        className: "text-muted-foreground font-sans text-sm text-center mb-6",
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { delay: 0.3 },
        children: isLoading ? "Our AI is studying your body proportions" : step.description
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        className: "relative w-full mb-8",
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
        children: isLoading ? (
          /* Loading: centered photo with scan overlay */
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-36 h-56 rounded-2xl overflow-hidden ring-2 ring-primary/20 shadow-xl shadow-primary/5", children: [
            capturedImage ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: capturedImage, alt: "Your body", className: "w-full h-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full bg-secondary flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-12 h-12 text-muted-foreground" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/20" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                className: "absolute left-0 right-0 h-[2px]",
                style: { background: "linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)" },
                animate: { top: ["8%", "92%", "8%"] },
                transition: { duration: 2, repeat: Infinity, ease: "linear" }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" }) })
          ] }) })
        ) : revealed ? (
          /* Revealed: side-by-side with elegant connector */
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.div,
              {
                className: "relative w-28 h-44 rounded-2xl overflow-hidden shadow-xl border border-border/30",
                initial: { x: -20, opacity: 0 },
                animate: { x: 0, opacity: 1 },
                transition: { delay: 0.1, duration: 0.5 },
                children: [
                  capturedImage ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: capturedImage, alt: "Your body", className: "w-full h-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full bg-secondary flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-10 h-10 text-muted-foreground" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/60 to-transparent" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute bottom-1.5 left-0 right-0 text-center text-[9px] font-sans text-white/70 uppercase tracking-widest", children: "You" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.div,
              {
                initial: { opacity: 0, scale: 0.5 },
                animate: { opacity: 1, scale: 1 },
                transition: { delay: 0.3, type: "spring", stiffness: 200 },
                className: "flex flex-col items-center gap-1",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "hsl(var(--primary))", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "opacity-60", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M5 12h14M12 5l7 7-7 7" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.div,
              {
                initial: { x: 20, opacity: 0 },
                animate: { x: 0, opacity: 1 },
                transition: { delay: 0.2, duration: 0.5 },
                className: "relative flex items-center justify-center w-32 h-44 rounded-2xl bg-secondary/30 border border-primary/15 shadow-xl overflow-hidden",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BodyShapeIllustration, { shape: detectedBodyShape.label, size: 140 }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background/80 to-transparent" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute bottom-1.5 left-0 right-0 text-center text-[9px] font-sans text-primary/70 uppercase tracking-widest font-semibold", children: "Match" })
                ]
              }
            )
          ] })
        ) : (
          /* Pre-reveal: just the photo */
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-36 h-56 rounded-2xl overflow-hidden ring-2 ring-primary/20 shadow-xl", children: capturedImage ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: capturedImage, alt: "Your body", className: "w-full h-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full bg-secondary flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-12 h-12 text-muted-foreground" }) }) }) })
        )
      }
    ),
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(BodyShapeIllustration, { shape: "rectangle", size: 130, morphing: true, className: "mb-4" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: revealed && !isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        className: "flex flex-col items-center gap-3 mb-6 w-full",
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -inset-2 bg-primary/10 rounded-full blur-lg" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative px-6 py-2 rounded-full bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-display font-bold text-foreground tracking-wider uppercase", children: [
              detectedBodyShape.label,
              " shape"
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap justify-center gap-2 mt-2", children: detectedBodyShape.traits.map((trait, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.span,
            {
              className: "px-3 py-1.5 rounded-full bg-secondary/80 border border-border/50 text-foreground font-sans text-xs font-medium shadow-sm",
              initial: { opacity: 0, scale: 0.8, y: 10 },
              animate: { opacity: 1, scale: 1, y: 0 },
              transition: { delay: 0.6 + i * 0.12, type: "spring", stiffness: 200 },
              children: trait
            },
            trait
          )) })
        ]
      }
    ) }),
    revealed && !isLoading && (() => {
      const recs = bodyRecommendations[detectedBodyShape.label] || bodyRecommendations.Rectangle;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          className: "w-full space-y-3 mb-6",
          initial: { opacity: 0, y: 15 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.4 },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-display text-lg font-bold text-foreground text-center", children: "Best For You" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: [
              { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Shirt, { className: "w-4 h-4 text-primary" }), label: "Silhouettes", items: recs.silhouettes },
              { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Scissors, { className: "w-4 h-4 text-primary" }), label: "Dresses", items: recs.dresses },
              { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Watch, { className: "w-4 h-4 text-primary" }), label: "Trousers", items: recs.trousers },
              { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Gem, { className: "w-4 h-4 text-primary" }), label: "Jackets", items: recs.jackets }
            ].map((cat, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.div,
              {
                className: "p-3 rounded-xl bg-secondary/50 border border-border/30 space-y-1",
                initial: { opacity: 0, y: 10 },
                animate: { opacity: 1, y: 0 },
                transition: { delay: 0.5 + idx * 0.1 },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                    cat.icon,
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-foreground font-sans", children: cat.label })
                  ] }),
                  cat.items.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground font-sans", children: [
                    "• ",
                    n
                  ] }, n))
                ]
              },
              cat.label
            )) })
          ]
        }
      );
    })(),
    !isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        className: "w-full",
        initial: { opacity: 0 },
        animate: { opacity: revealed ? 1 : 0 },
        transition: { delay: 0.3 },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans text-xs text-center mb-3 uppercase tracking-wider", children: "Body shape guide" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-2", children: bodyShapes.map((bs) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              className: `flex items-center justify-between p-3 rounded-xl transition-all ${bs.label === detectedBodyShape.label ? "bg-primary/10 border border-primary/30 text-foreground" : "bg-secondary/60 text-muted-foreground"}`,
              whileHover: { scale: 1.01 },
              whileTap: { scale: 0.99 },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-sans text-sm font-medium", children: bs.label }),
                bs.label === detectedBodyShape.label && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-sans text-primary font-semibold", children: "Your Shape" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 text-primary" })
                ] })
              ]
            },
            bs.label
          )) })
        ]
      }
    )
  ] });
};
const StepRenderer = ({ step, answers, onSelect, gender, aiResults }) => {
  const selected = answers[step.key] || [];
  const isSingle = step.type === "radio";
  if (step.type === "height") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(HeightStep, { answers, onSelect });
  }
  if (step.type === "notification") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationStep, { step });
  }
  if (step.type === "selfieIntro") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(SelfieIntroStep, { step, gender });
  }
  if (step.type === "selfieGuide") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(SelfieGuideStep, { step, gender });
  }
  if (step.type === "cameraCapture") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(CameraCaptureStep, { step, answers, onSelect });
  }
  if (step.type === "generating") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(GeneratingStep, { step, gender });
  }
  if (step.type === "detectionResult") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(DetectionResultStep, { step, answers, gender, aiResults });
  }
  if (step.type === "sizeGrid" && step.subGroups) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl lg:text-3xl font-bold text-foreground text-center mb-6", children: step.question }),
      step.subGroups.map((group) => {
        const groupKey = `${step.key}_${group.label.toLowerCase()}`;
        const groupSelected = answers[groupKey] || [];
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-sans font-semibold text-foreground text-center mb-3", children: group.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-5 gap-2", children: group.options.map((size, sizeIdx) => {
            const isActive = groupSelected.includes(size);
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.button,
              {
                initial: { opacity: 0, scale: 0.85 },
                animate: { opacity: 1, scale: 1 },
                transition: { duration: 0.25, delay: sizeIdx * 0.02, ease: [0.22, 1, 0.36, 1] },
                onClick: () => onSelect(groupKey, size, false),
                className: `py-3 px-1 rounded-xl text-sm font-sans font-medium transition-all active:scale-95 ${isActive ? "bg-foreground text-background shadow-md" : "bg-secondary text-foreground hover:bg-secondary/80"}`,
                children: size
              },
              size
            );
          }) })
        ] }, group.label);
      })
    ] });
  }
  const bodyShapeDescriptions = {
    female: {
      Hourglass: "Balanced shoulders & hips with a defined, narrow waist",
      Triangle: "Narrower shoulders with wider hips and a fuller lower body",
      "Inverted triangle": "Broader shoulders tapering to narrower hips",
      Rectangle: "Even proportions with a straight, balanced silhouette",
      Round: "Fuller midsection with soft, proportionate curves"
    },
    male: {
      Rectangle: "Even proportions with a straight, balanced torso",
      Triangle: "Narrower shoulders with a wider waist and solid lower body",
      "Inverted triangle": "Broad shoulders tapering to a narrow waist — V-shaped",
      Oval: "Fuller midsection with a rounded torso and proportionate limbs",
      Trapezoid: "Wide shoulders with a slightly narrower waist — athletic build"
    }
  };
  const faceShapeDescriptions = {
    Oval: "Balanced proportions with a gently rounded jawline",
    Round: "Equal width and length with soft, curved angles",
    Square: "Strong, angular jawline with an equally wide forehead",
    Heart: "Wider forehead tapering to a narrow, pointed chin",
    Oblong: "Longer than wide with a straight, elongated cheek line",
    Diamond: "Narrow forehead and jaw with prominent, wide cheekbones"
  };
  if (step.type === "bodyShape") {
    const genderKey = gender || "female";
    const descriptions = bodyShapeDescriptions[genderKey] || {};
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl lg:text-3xl font-bold text-foreground text-center mb-2", children: step.question }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans text-xs text-center mb-6", children: "Tap the shape closest to yours" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-3", children: step.options.map((option, index) => {
        const isActive = selected.includes(option);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          SelectionFlip,
          {
            isActive,
            onClick: () => onSelect(step.key, option, true),
            index,
            className: `w-full rounded-2xl transition-all text-left active:scale-[0.98] overflow-hidden ${isActive ? "ring-2 ring-primary shadow-lg shadow-primary/10" : "ring-1 ring-border/40 hover:ring-border/60"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 w-full p-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-16 h-20 flex items-center justify-center flex-shrink-0 rounded-xl overflow-hidden", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-white/95 to-white/80 dark:from-white/90 dark:to-white/75" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BodyShapeSvg, { shape: option, gender: genderKey, size: 52 }) }),
                  isActive && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    motion.div,
                    {
                      className: "absolute inset-0 bg-primary/5",
                      initial: { opacity: 0 },
                      animate: { opacity: 1 },
                      transition: { duration: 0.3 }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-sans font-semibold block transition-colors ${isActive ? "text-primary" : "text-foreground"}`, children: option }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-sans text-xs text-muted-foreground leading-relaxed block mt-0.5", children: descriptions[option] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isActive ? "bg-primary shadow-md shadow-primary/30" : "border-2 border-muted-foreground/20 bg-transparent"}`, children: isActive && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    initial: { scale: 0 },
                    animate: { scale: 1 },
                    transition: { type: "spring", stiffness: 400, damping: 15 },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5 text-primary-foreground" })
                  }
                ) })
              ] }),
              isActive && /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  className: "h-[2px] w-full bg-gradient-to-r from-transparent via-primary to-transparent",
                  initial: { scaleX: 0 },
                  animate: { scaleX: 1 },
                  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
                }
              )
            ]
          },
          option
        );
      }) })
    ] });
  }
  if (step.type === "faceShape") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl lg:text-3xl font-bold text-foreground text-center mb-2", children: step.question }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans text-xs text-center mb-6", children: "Tap the shape closest to yours" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-3", children: step.options.map((option, index) => {
        const isActive = selected.includes(option);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          SelectionFlip,
          {
            isActive,
            onClick: () => onSelect(step.key, option, true),
            index,
            className: `w-full rounded-2xl transition-all text-left active:scale-[0.98] overflow-hidden ${isActive ? "ring-2 ring-primary shadow-lg shadow-primary/10" : "ring-1 ring-border/40 hover:ring-border/60"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 w-full p-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-14 h-16 flex items-center justify-center flex-shrink-0 rounded-xl overflow-hidden", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-white/95 to-white/80 dark:from-white/90 dark:to-white/75" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FaceShapeSvg, { shape: option, size: 44 }) }),
                  isActive && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    motion.div,
                    {
                      className: "absolute inset-0 bg-primary/5",
                      initial: { opacity: 0 },
                      animate: { opacity: 1 },
                      transition: { duration: 0.3 }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-sans font-semibold block transition-colors ${isActive ? "text-primary" : "text-foreground"}`, children: option }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-sans text-xs text-muted-foreground leading-relaxed block mt-0.5", children: faceShapeDescriptions[option] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isActive ? "bg-primary shadow-md shadow-primary/30" : "border-2 border-muted-foreground/20 bg-transparent"}`, children: isActive && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    initial: { scale: 0 },
                    animate: { scale: 1 },
                    transition: { type: "spring", stiffness: 400, damping: 15 },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5 text-primary-foreground" })
                  }
                ) })
              ] }),
              isActive && /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  className: "h-[2px] w-full bg-gradient-to-r from-transparent via-primary to-transparent",
                  initial: { scaleX: 0 },
                  animate: { scaleX: 1 },
                  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
                }
              )
            ]
          },
          option
        );
      }) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    step.subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans text-sm text-center mb-1", children: step.subtitle }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl lg:text-3xl font-bold text-foreground text-center mb-6", children: step.question }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-3", children: step.options.map((option, index) => {
      var _a, _b;
      const isActive = selected.includes(option);
      const logos = (_a = step.brandLogos) == null ? void 0 : _a[option];
      const brands = (_b = step.brandLabels) == null ? void 0 : _b[option];
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        SelectionFlip,
        {
          isActive,
          onClick: () => onSelect(step.key, option, isSingle),
          index,
          className: `w-full p-4 rounded-2xl transition-all text-left active:scale-[0.98] ${isActive ? "bg-secondary ring-2 ring-foreground" : "bg-secondary/50"}`,
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between w-full", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 pr-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-sans text-sm text-foreground", children: option }),
              logos ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-4 mt-2", children: logos.map((logo) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: brandLogoMap[logo.image],
                  alt: logo.name,
                  className: "h-10 w-auto object-contain rounded-md bg-background border border-border shadow-sm transition-transform duration-200 hover:scale-110 active:scale-95"
                },
                logo.name
              )) }) : brands ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-3 mt-1.5", children: brands.map((brand) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold tracking-wider text-muted-foreground uppercase", children: brand }, brand)) }) : null
            ] }),
            isSingle ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isActive ? "border-foreground bg-foreground" : "border-muted-foreground/30 bg-background"}`, children: isActive && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5 text-background" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-5 h-5 rounded-[4px] border-2 flex items-center justify-center flex-shrink-0 transition-all ${isActive ? "border-foreground bg-foreground" : "border-muted-foreground/30 bg-background"}`, children: isActive && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3 w-3 text-background" }) })
          ] })
        },
        option
      );
    }) })
  ] });
};
const sizes = ["3XS", "XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL", "6XL", "7XL", "8XL", "9XL"];
const sharedSteps = [
  {
    question: "What's your biggest style challenge?",
    key: "styleChallenge",
    type: "checkbox",
    options: [
      "Knowing what looks good on me",
      "Shopping taking forever",
      "Wearing the same outfits on repeat",
      "Wasting money on clothes I never wear"
    ]
  },
  {
    question: "What's your main style goal?",
    key: "styleGoal",
    type: "checkbox",
    options: [
      "Learning how to complement my natural features",
      "Looking chic and fashionable",
      "Standing out from the crowd",
      "Shopping smart and buying less"
    ]
  },
  {
    question: "How do you want Style DNA to elevate your style?",
    key: "elevateStyle",
    type: "radio",
    options: [
      "Create a color palette and personalized style guide",
      "Tell me whether or not an item suits me before I buy it",
      "Mix and match items I already own to create brand-new looks",
      "Create new and unique looks from brands I love to improve my personal style"
    ]
  },
  {
    question: "Tell us about your shopping experience",
    key: "shoppingExperience",
    type: "radio",
    options: [
      "I generally feel pleased with most of my purchases",
      "I return most items",
      "I spend a lot of time trying to find clothes I feel confident and comfortable in",
      "I don't buy clothes very often because I believe nothing suits me"
    ]
  },
  {
    question: "Which brands do you want to see recommendations from?",
    key: "brands",
    type: "radio",
    options: [
      "Fast fashion",
      "Premium brands",
      "Luxury labels",
      "A mix of fast fashion and designer brands"
    ],
    brandLabels: {
      "Fast fashion": ["ZARA", "H&M", "GAP", "MANGO"],
      "Premium brands": ["COS", "GANNI", "ISABEL MARANT", "Reformation"],
      "Luxury labels": ["GUCCI", "FENDI", "VALENTINO", "CHANEL"]
    },
    brandLogos: {
      "Fast fashion": [
        { name: "ZARA", image: "brand-zara" },
        { name: "H&M", image: "brand-hm" },
        { name: "GAP", image: "brand-gap" },
        { name: "MANGO", image: "brand-mango" }
      ],
      "Premium brands": [
        { name: "COS", image: "brand-cos" },
        { name: "GANNI", image: "brand-ganni" },
        { name: "ISABEL MARANT", image: "brand-isabelmarant" },
        { name: "Reformation", image: "brand-reformation" }
      ],
      "Luxury labels": [
        { name: "GUCCI", image: "brand-gucci" },
        { name: "FENDI", image: "brand-fendi" },
        { name: "VALENTINO", image: "brand-valentino" },
        { name: "CHANEL", image: "brand-chanel" }
      ]
    }
  },
  {
    question: "What sizes do you typically wear?",
    key: "sizes",
    type: "sizeGrid",
    options: [],
    subGroups: [
      { label: "Tops", options: sizes },
      { label: "Bottoms", options: sizes }
    ]
  },
  {
    question: "How well do you know your style?",
    key: "styleKnowledge",
    type: "checkbox",
    options: [
      "I know what colors suit my skin tone",
      "I know which prints and silhouettes suit my body type",
      "I'm not entirely sure... but I can't wait to find out!",
      "I'm a professional stylist"
    ]
  },
  {
    question: "Do you have clothes in your Closet that you don't know how to style?",
    key: "unstyledClothes",
    type: "radio",
    options: ["Totally", "Not really"]
  },
  {
    question: "Roughly how much do you spend on clothes per year?",
    key: "budget",
    type: "radio",
    subtitle: "Your wardrobe is an investment",
    options: ["$0 – $500", "$501 – $1,500", "$1,501 – $2,500", "$2,501 – $5,000", "Over $5,000"]
  },
  // --- Psychographic steps ---
  {
    question: "What best describes your lifestyle?",
    key: "lifestyle",
    type: "radio",
    subtitle: "Your daily life shapes your style",
    options: [
      "Corporate / Office-based",
      "Creative / Freelance",
      "Active / On-the-go",
      "Social / Events & Nightlife",
      "Relaxed / Work from home"
    ]
  },
  {
    question: "What's your profession or field?",
    key: "profession",
    type: "radio",
    subtitle: "We'll tailor recommendations to your world",
    options: [
      "Business / Finance",
      "Tech / Engineering",
      "Creative / Design / Media",
      "Healthcare / Science",
      "Education / Academia",
      "Hospitality / Retail",
      "Student",
      "Other"
    ]
  },
  {
    question: "How do you want your style to make you feel?",
    key: "styleMood",
    type: "checkbox",
    subtitle: "Pick up to 3 that resonate most",
    options: [
      "Confident & powerful",
      "Relaxed & effortless",
      "Creative & expressive",
      "Elegant & refined",
      "Bold & attention-grabbing",
      "Approachable & friendly"
    ]
  },
  // --- gender-specific steps inserted here via getStepsForGender ---
  {
    question: "Your height",
    key: "height",
    type: "height",
    options: []
  },
  {
    question: "What's your age range?",
    key: "ageRange",
    type: "radio",
    options: ["18-24", "25-34", "35-44", "45-54", "55-64", "65-74", "75+"]
  },
  {
    question: "Stay in the loop with your latest arrivals and closet updates.",
    key: "notifications",
    type: "notification",
    options: [],
    description: "Be the first to know about exclusive offers."
  },
  {
    question: "Let's discover your unique Color and Style Type",
    key: "selfieIntro",
    type: "selfieIntro",
    options: [],
    description: "We'll do this by analyzing your complexion and facial features"
  },
  {
    question: "Clean your camera lens",
    key: "selfieStep1",
    type: "selfieGuide",
    options: [],
    stepNumber: 1
  },
  {
    question: "Remove glasses and hair accessories",
    key: "selfieStep2",
    type: "selfieGuide",
    options: [],
    stepNumber: 2
  },
  {
    question: "Use natural light, facing a window. Avoid direct sunlight and open spaces",
    key: "selfieStep3",
    type: "selfieGuide",
    options: [],
    stepNumber: 3
  },
  {
    question: "Keep a neutral expression",
    key: "selfieStep4",
    type: "selfieGuide",
    options: [],
    stepNumber: 4
  },
  {
    question: "Look directly at the camera",
    key: "selfieStep5",
    type: "selfieGuide",
    options: [],
    stepNumber: 5
  },
  {
    question: "Take your selfie",
    key: "selfieCapture",
    type: "cameraCapture",
    options: [],
    cameraMode: "selfie",
    description: "Position your face within the frame and tap capture"
  },
  {
    question: "Your Best Accessory Matches",
    key: "faceResult",
    type: "detectionResult",
    options: [],
    detectionMode: "face",
    description: "Based on your facial proportions, here are the accessories and necklines that suit you best"
  },
  {
    question: "Now let's capture your full body",
    key: "fullBodyCapture",
    type: "cameraCapture",
    options: [],
    cameraMode: "fullBody",
    description: "Stand back and capture your full outfit for AI analysis"
  },
  {
    question: "Your Best Clothing Matches",
    key: "bodyResult",
    type: "detectionResult",
    options: [],
    detectionMode: "body",
    description: "Based on your body proportions, here are the silhouettes and cuts that flatter you most"
  },
  {
    question: "Hold tight, we're generating your Style Formula!",
    key: "generating",
    type: "generating",
    options: []
  }
];
const femaleSteps = [
  {
    question: "Which shape best describes your body?",
    key: "bodyShape",
    type: "bodyShape",
    options: ["Hourglass", "Triangle", "Inverted triangle", "Rectangle", "Round"],
    forGender: "female"
  },
  {
    question: "Which shape best describes your face?",
    key: "faceShape",
    type: "faceShape",
    options: ["Oval", "Round", "Square", "Heart", "Oblong", "Diamond"],
    forGender: "female"
  },
  {
    question: "Which size range best describes you?",
    key: "sizeRange",
    type: "radio",
    options: ["Regular", "Curvy", "Petite"],
    forGender: "female"
  }
];
const maleSteps = [
  {
    question: "Which shape best describes your body?",
    key: "bodyShape",
    type: "bodyShape",
    options: ["Rectangle", "Triangle", "Inverted triangle", "Oval", "Trapezoid"],
    forGender: "male"
  },
  {
    question: "Which shape best describes your face?",
    key: "faceShape",
    type: "faceShape",
    options: ["Oval", "Round", "Square", "Heart", "Oblong", "Diamond"],
    forGender: "male"
  },
  {
    question: "Which build best describes you?",
    key: "sizeRange",
    type: "radio",
    options: ["Slim", "Regular", "Athletic", "Big & Tall"],
    forGender: "male"
  }
];
function getStepsForGender(gender) {
  return [
    ...sharedSteps.slice(0, 9),
    // challenge, goal, elevate, shopping, brands, sizes, styleKnowledge, unstyledClothes, budget
    ...sharedSteps.slice(9, 12),
    // lifestyle, profession, styleMood (psychographic)
    ...gender === "female" ? femaleSteps : maleSteps,
    // bodyShape, faceShape, sizeRange/build
    ...sharedSteps.slice(12)
    // height, age, notifications, selfie steps, camera captures
  ];
}
const triggerHaptic = () => {
  if (navigator.vibrate) {
    navigator.vibrate(12);
  }
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 1800;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(1e-3, ctx.currentTime + 0.06);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.06);
    setTimeout(() => ctx.close(), 100);
  } catch {
  }
};
const PHASES = [
  { name: "Preferences", icon: "✦" },
  { name: "Profile", icon: "◆" },
  { name: "Analysis", icon: "◎" },
  { name: "Style DNA", icon: "★" }
];
const PHASE_MESSAGES = {
  1: "Great choices! Now let's build your profile.",
  2: "Almost there! Time for the fun part.",
  3: "Let's discover your unique Style DNA."
};
function getPhaseForStep(stepIndex, totalSteps) {
  if (stepIndex <= 0) return 0;
  const ratio = (stepIndex - 1) / Math.max(totalSteps - 2, 1);
  if (ratio < 0.3) return 0;
  if (ratio < 0.55) return 1;
  if (ratio < 0.8) return 2;
  return 3;
}
function getCtaText(step, progress) {
  if (!step) return "NEXT";
  if (step.type === "selfieIntro" || step.type === "selfieGuide") return "CONTINUE";
  if (step.type === "cameraCapture") return "NEXT";
  if (step.type === "detectionResult") return "CONTINUE";
  if (step.type === "generating") return "GENERATING...";
  if (progress > 90) return "GENERATE";
  if (progress > 60) return "ANALYZE";
  return "NEXT";
}
function getStepCategory(step) {
  if (!step) return null;
  const t = step.type;
  if (["checkbox", "radio", "psychographic"].includes(t)) {
    if (["styleChallenge", "styleGoal", "elevateStyle", "shoppingExperience", "brands", "styleKnowledge", "unstyledClothes", "budget"].includes(step.key)) return "Style Preferences";
    if (["lifestyle", "profession", "styleMood"].includes(step.key)) return "Lifestyle";
    if (["bodyShape", "faceShape", "sizeRange", "ageRange"].includes(step.key)) return "Body Profile";
  }
  if (t === "height" || t === "sizeGrid") return "Body Profile";
  if (t === "selfieIntro" || t === "selfieGuide" || t === "cameraCapture") return "Photo Analysis";
  if (t === "detectionResult") return "AI Results";
  if (t === "notification") return "Notifications";
  return null;
}
const Onboarding = () => {
  var _a, _b, _c, _d, _e, _f, _g;
  const [gender, setGender] = reactExports.useState(null);
  const [currentStep, setCurrentStep] = reactExports.useState(0);
  const [answers, setAnswers] = reactExports.useState({});
  const [loading, setLoading] = reactExports.useState(false);
  const [aiResults, setAiResults] = reactExports.useState({});
  const [swipeDir, setSwipeDir] = reactExports.useState(1);
  const [swipeVelocity, setSwipeVelocity] = reactExports.useState({ x: 0, y: 0 });
  const [swipeTrigger, setSwipeTrigger] = reactExports.useState(0);
  const [showInterstitial, setShowInterstitial] = reactExports.useState(false);
  const [interstitialMessage, setInterstitialMessage] = reactExports.useState("");
  const prevPhaseRef = reactExports.useRef(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const tilt = useGyroTilt(6);
  const steps = gender ? getStepsForGender(gender) : [];
  const totalSteps = steps.length + 1;
  const isGenderStep = currentStep === 0;
  const stepIndex = currentStep - 1;
  const currentStepData = !isGenderStep ? steps[stepIndex] : null;
  const isGenerating = (currentStepData == null ? void 0 : currentStepData.type) === "generating";
  const progress = currentStep / (totalSteps - 1) * 100;
  const currentPhase = getPhaseForStep(currentStep, totalSteps);
  const category = getStepCategory(currentStepData);
  const ctaText = getCtaText(currentStepData, progress);
  const canProceed = isGenderStep ? !!gender : currentStepData ? currentStepData.type === "notification" || currentStepData.type === "selfieIntro" || currentStepData.type === "selfieGuide" || currentStepData.type === "detectionResult" ? true : currentStepData.type === "cameraCapture" ? !!((_a = answers[currentStepData.key]) == null ? void 0 : _a[0]) : currentStepData.type === "height" ? !!(((_b = answers.heightFt) == null ? void 0 : _b[0]) || ((_c = answers.heightCm) == null ? void 0 : _c[0])) : currentStepData.type === "generating" ? false : currentStepData.type === "sizeGrid" ? ((_d = currentStepData.subGroups) == null ? void 0 : _d.some((g) => (answers[`${currentStepData.key}_${g.label.toLowerCase()}`] || []).length > 0)) ?? false : (answers[currentStepData.key] || []).length > 0 : false;
  reactExports.useEffect(() => {
    if (currentPhase !== prevPhaseRef.current && currentPhase > 0 && PHASE_MESSAGES[currentPhase]) {
      setInterstitialMessage(PHASE_MESSAGES[currentPhase]);
      setShowInterstitial(true);
      const timer = setTimeout(() => setShowInterstitial(false), 1500);
      prevPhaseRef.current = currentPhase;
      return () => clearTimeout(timer);
    }
    prevPhaseRef.current = currentPhase;
  }, [currentPhase]);
  reactExports.useEffect(() => {
    if (isGenerating) {
      const timer = setTimeout(() => {
        handleComplete();
      }, 6e3);
      return () => clearTimeout(timer);
    }
  }, [isGenerating]);
  reactExports.useEffect(() => {
    if (!currentStepData || currentStepData.type !== "detectionResult") return;
    const mode = currentStepData.detectionMode;
    if (!mode) return;
    if (aiResults[mode]) return;
    const runAnalysis = async () => {
      var _a2, _b2;
      try {
        if (mode === "face") {
          const selfieImage = (_a2 = answers.selfieCapture) == null ? void 0 : _a2[0];
          if (!selfieImage) return;
          const { data, error } = await supabase.functions.invoke("analyze-style-dna", {
            body: { selfieImage, mode: "face" }
          });
          if (!error && data && !data.error) {
            setAiResults((prev) => ({ ...prev, face: data }));
          }
        } else if (mode === "body") {
          const fullBodyImage = (_b2 = answers.fullBodyCapture) == null ? void 0 : _b2[0];
          if (!fullBodyImage) return;
          const { data, error } = await supabase.functions.invoke("analyze-style-dna", {
            body: { fullBodyImage, preferences: { gender }, mode: "body" }
          });
          if (!error && data && !data.error) {
            setAiResults((prev) => ({ ...prev, body: data }));
          }
        }
      } catch (err) {
        console.warn(`AI ${mode} analysis failed:`, err);
      }
    };
    runAnalysis();
  }, [currentStep, currentStepData == null ? void 0 : currentStepData.type, currentStepData == null ? void 0 : currentStepData.detectionMode]);
  const handleSelect = (key, option, singleSelect) => {
    setAnswers((prev) => {
      const current = prev[key] || [];
      if (singleSelect) return { ...prev, [key]: [option] };
      if (current.includes(option)) return { ...prev, [key]: current.filter((o) => o !== option) };
      return { ...prev, [key]: [...current, option] };
    });
  };
  const handleComplete = async () => {
    var _a2, _b2, _c2;
    if (!user || !gender) return;
    setLoading(true);
    try {
      const selfieImage = ((_a2 = answers.selfieCapture) == null ? void 0 : _a2[0]) || null;
      const fullBodyImage = ((_b2 = answers.fullBodyCapture) == null ? void 0 : _b2[0]) || null;
      const prefsForAI = { ...answers, gender };
      const { selfieCapture, fullBodyCapture, ...cleanPrefs } = prefsForAI;
      const faceShapeData = aiResults.face ? {
        faceShape: aiResults.face.faceShape,
        faceShapeDescription: aiResults.face.faceShapeDescription
      } : {};
      const bodyShapeData = aiResults.body ? {
        bodyShape: aiResults.body.bodyShape,
        bodyShapeTraits: aiResults.body.bodyShapeTraits
      } : {};
      let archetype = `${(((_c2 = answers.styleGoal) == null ? void 0 : _c2[0]) || "Stylish").split(" ").slice(0, 3).join(" ")} ${gender === "female" ? "Femme" : "Masc"} Profile`;
      let styleScore = 25;
      let aiAnalysis = null;
      if (selfieImage || fullBodyImage) {
        try {
          const { data: fnData, error: fnError } = await supabase.functions.invoke("analyze-style-dna", {
            body: { selfieImage, fullBodyImage, preferences: cleanPrefs }
          });
          if (!fnError && fnData && !fnData.error) {
            aiAnalysis = fnData;
            archetype = fnData.archetype || archetype;
            styleScore = fnData.styleScore || styleScore;
          }
        } catch (aiErr) {
          console.warn("AI analysis failed, continuing with defaults:", aiErr);
        }
      }
      const { error } = await supabase.from("style_profiles").update({
        preferences: { ...cleanPrefs, ...faceShapeData, ...bodyShapeData, aiAnalysis },
        archetype,
        onboarding_completed: true,
        style_score: styleScore
      }).eq("user_id", user.id);
      if (error) throw error;
      trackEvent("Lead", { content_name: "Onboarding Complete" });
      toast.success("Your Style DNA has been created!");
      navigate("/paywall");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  const pageVariants = {
    enter: (dir) => ({
      opacity: 0,
      x: dir * 60,
      scale: 0.96,
      filter: "blur(4px)"
    }),
    center: {
      opacity: 1,
      x: 0,
      scale: 1,
      filter: "blur(0px)"
    },
    exit: (dir) => ({
      opacity: 0,
      x: dir * -60,
      scale: 0.96,
      filter: "blur(4px)"
    })
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background flex flex-col overflow-hidden relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SwipeParticles, { swipeVelocity, swipeTrigger }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 pointer-events-none z-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        className: "absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-[0.04]",
        style: { background: "radial-gradient(circle, hsl(var(--primary)), transparent 70%)" },
        animate: { scale: [1, 1.15, 1], opacity: [0.04, 0.07, 0.04] },
        transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showInterstitial && /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        className: "fixed inset-0 z-50 bg-background/90 backdrop-blur-xl flex items-center justify-center",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { scale: 0.8, opacity: 0, y: 20 },
            animate: { scale: 1, opacity: 1, y: 0 },
            exit: { scale: 0.9, opacity: 0, y: -10 },
            className: "text-center px-8",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  className: "w-12 h-12 rounded-full gold-gradient flex items-center justify-center mx-auto mb-4",
                  animate: { scale: [1, 1.1, 1] },
                  transition: { duration: 1, repeat: Infinity },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary-foreground text-lg", children: (_e = PHASES[currentPhase]) == null ? void 0 : _e.icon })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-xl font-bold text-foreground mb-2", children: interstitialMessage }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground font-sans", children: [
                "Phase ",
                currentPhase + 1,
                " of ",
                PHASES.length,
                " — ",
                (_f = PHASES[currentPhase]) == null ? void 0 : _f.name
              ] })
            ]
          }
        )
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky top-0 z-20 bg-background/80 backdrop-blur-xl px-5 pt-5 pb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: currentStep > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.button,
          {
            initial: { opacity: 0, x: -10 },
            animate: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: -10 },
            transition: { duration: 0.2 },
            onClick: () => {
              triggerHaptic();
              setSwipeDir(-1);
              setCurrentStep((s) => s - 1);
            },
            className: "p-1.5 rounded-full hover:bg-secondary/60 transition-colors",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-5 w-5 text-foreground" })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.span,
          {
            initial: { opacity: 0, y: -8 },
            animate: { opacity: 1, y: 0 },
            className: "text-[10px] font-sans text-primary font-semibold tracking-widest uppercase",
            children: (_g = PHASES[currentPhase]) == null ? void 0 : _g.name
          },
          currentPhase
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-sans text-muted-foreground", children: [
          Math.round(progress),
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1.5", children: PHASES.map((phase, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 h-1 rounded-full bg-muted/50 overflow-hidden relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            className: "absolute inset-y-0 left-0 rounded-full",
            style: { background: i <= currentPhase ? "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))" : "transparent" },
            initial: false,
            animate: {
              width: i < currentPhase ? "100%" : i === currentPhase ? `${Math.min(100, (currentStep - i * (totalSteps / 4)) / (totalSteps / 4) * 100)}%` : "0%"
            },
            transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
          }
        ),
        i === currentPhase && /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            className: "absolute inset-y-0 w-8 rounded-full",
            style: { background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)" },
            animate: { left: ["-10%", "110%"] },
            transition: { duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }
          }
        )
      ] }, i)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 flex items-start justify-center px-5 pt-6 pb-24 overflow-y-auto relative z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: currentStep === 0 && gender && /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          className: "fixed bottom-24 left-0 right-0 flex justify-center z-30 pointer-events-none",
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 10 },
          transition: { delay: 0.8, duration: 0.4 },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              className: "flex items-center gap-2 bg-foreground/90 backdrop-blur-sm text-background px-4 py-2 rounded-full shadow-lg",
              animate: { x: [0, -8, 8, 0] },
              transition: { duration: 1.8, repeat: 2, repeatDelay: 1, ease: "easeInOut" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: "←" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-sans font-medium", children: "Swipe to navigate" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: "→" })
              ]
            }
          )
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", custom: swipeDir, initial: false, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          custom: swipeDir,
          variants: pageVariants,
          initial: "enter",
          animate: "center",
          exit: "exit",
          transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
            filter: { duration: 0.3 }
          },
          onPanEnd: (_, info) => {
            if (currentStep === 0) return;
            setSwipeVelocity({ x: info.velocity.x, y: info.velocity.y });
            setSwipeTrigger((t) => t + 1);
            const threshold = 50;
            if (info.offset.x < -threshold && canProceed && !isGenerating) {
              triggerHaptic();
              setSwipeDir(1);
              setCurrentStep((s) => s + 1);
            } else if (info.offset.x > threshold && currentStep > 0) {
              triggerHaptic();
              setSwipeDir(-1);
              setCurrentStep((s) => s - 1);
            }
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              style: {
                transform: `perspective(800px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`
              },
              children: [
                category && !isGenderStep && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    initial: { opacity: 0, y: -5 },
                    animate: { opacity: 1, y: 0 },
                    className: "flex justify-center mb-3",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-sans font-semibold tracking-widest uppercase text-primary bg-primary/10 px-3 py-1 rounded-full", children: category })
                  }
                ),
                isGenderStep ? /* @__PURE__ */ jsxRuntimeExports.jsx(GenderStep, { selected: gender, onSelect: setGender }) : currentStepData ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                  StepRenderer,
                  {
                    step: currentStepData,
                    answers,
                    onSelect: handleSelect,
                    gender,
                    aiResults
                  }
                ) : null
              ]
            }
          )
        },
        currentStep
      ) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: !isGenerating && /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 },
        transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
        className: "sticky bottom-0 z-20 bg-gradient-to-t from-background via-background/95 to-transparent p-4 pt-8",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            whileTap: { scale: 0.97 },
            transition: { type: "spring", stiffness: 400, damping: 25 },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: () => {
                  triggerHaptic();
                  setSwipeDir(1);
                  setCurrentStep((s) => s + 1);
                },
                disabled: !canProceed || loading,
                className: `w-full h-14 rounded-xl font-semibold font-sans text-base transition-all duration-300 ${canProceed ? currentStepData && ["notification", "selfieIntro", "selfieGuide"].includes(currentStepData.type) ? "bg-primary text-primary-foreground shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.5)]" : "bg-foreground text-background shadow-[0_4px_20px_-4px_hsl(var(--foreground)/0.3)]" : "bg-muted text-muted-foreground"}`,
                variant: "ghost",
                children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
                  ctaText,
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    motion.span,
                    {
                      animate: canProceed ? { x: [0, 4, 0] } : {},
                      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" })
                    }
                  )
                ] })
              }
            )
          }
        )
      }
    ) })
  ] });
};
export {
  Onboarding as default
};
