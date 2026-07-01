import { r as reactExports, j as jsxRuntimeExports, e as useNavigate } from "./index-UvNQFckZ.js";
import { A as AppLayout } from "./AppLayout-C2fJ8nQA.js";
import { d as createLucideIcon, e as useAuth, s as supabase, B as Button, T as TriangleAlert, R as RefreshCw } from "./AppContent-9kIwMzo7.js";
import { C as Card, a as CardContent } from "./card-BPQNt8Zy.js";
import { B as Badge } from "./badge-DLtZ_P3B.js";
import { t as toast } from "./index-CXhnqnHQ.js";
import { G as GlowingEffect } from "./glowing-effect-D_W-Xryh.js";
import { m as motion } from "./proxy-DuKBf0zJ.js";
import { C as Camera } from "./camera-kUHluzGe.js";
import { A as AnimatePresence } from "./index-CI22_94N.js";
import { L as LoaderCircle } from "./loader-circle-BUsfaJ2b.js";
import { L as Layers } from "./BottomNav-DDKq4ZnH.js";
import { U as Upload } from "./upload-Dt7j8EuY.js";
import { T as Twitter } from "./twitter-79RtTQNZ.js";
import { E as ExternalLink } from "./external-link-CMyMeEIw.js";
import "./index-CXACtV8R.js";
import "./shirt-iptwcFqR.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Instagram = createLucideIcon("Instagram", [
  ["rect", { width: "20", height: "20", x: "2", y: "2", rx: "5", ry: "5", key: "2e1cvw" }],
  ["path", { d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z", key: "9exkf1" }],
  ["line", { x1: "17.5", x2: "17.51", y1: "6.5", y2: "6.5", key: "r4j83e" }]
]);
const ImageSwiper = ({
  images,
  cardWidth = 256,
  cardHeight = 352,
  className = ""
}) => {
  const cardStackRef = reactExports.useRef(null);
  const isSwiping = reactExports.useRef(false);
  const startX = reactExports.useRef(0);
  const currentX = reactExports.useRef(0);
  const animationFrameId = reactExports.useRef(null);
  const imageList = images.split(",").map((img) => img.trim()).filter((img) => img);
  const [cardOrder, setCardOrder] = reactExports.useState(
    () => Array.from({ length: imageList.length }, (_, i) => i)
  );
  const getDurationFromCSS = reactExports.useCallback((variableName, element) => {
    var _a, _b;
    const targetElement = element || document.documentElement;
    const value = (_b = (_a = getComputedStyle(targetElement)) == null ? void 0 : _a.getPropertyValue(variableName)) == null ? void 0 : _b.trim();
    if (!value) return 0;
    if (value.endsWith("ms")) return parseFloat(value);
    if (value.endsWith("s")) return parseFloat(value) * 1e3;
    return parseFloat(value) || 0;
  }, []);
  const getCards = reactExports.useCallback(() => {
    if (!cardStackRef.current) return [];
    return [...cardStackRef.current.querySelectorAll(".image-card")];
  }, []);
  const getActiveCard = reactExports.useCallback(() => {
    const cards = getCards();
    return cards[0] || null;
  }, [getCards]);
  const applySwipeStyles = reactExports.useCallback((deltaX) => {
    const card = getActiveCard();
    if (!card) return;
    card.style.setProperty("--swipe-x", `${deltaX}px`);
    card.style.setProperty("--swipe-rotate", `${deltaX * 0.2}deg`);
    card.style.opacity = (1 - Math.min(Math.abs(deltaX) / 100, 1) * 0.75).toString();
  }, [getActiveCard]);
  const handleStart = reactExports.useCallback((clientX) => {
    if (isSwiping.current) return;
    isSwiping.current = true;
    startX.current = clientX;
    currentX.current = clientX;
    const card = getActiveCard();
    if (card) card.style.transition = "none";
  }, [getActiveCard]);
  const handleEnd = reactExports.useCallback(() => {
    if (!isSwiping.current) return;
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    const deltaX = currentX.current - startX.current;
    const threshold = 50;
    const duration = getDurationFromCSS("--card-swap-duration", cardStackRef.current);
    const card = getActiveCard();
    if (card) {
      card.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`;
      if (Math.abs(deltaX) > threshold) {
        const direction = Math.sign(deltaX);
        card.style.setProperty("--swipe-x", `${direction * 300}px`);
        card.style.setProperty("--swipe-rotate", `${direction * 20}deg`);
        setTimeout(() => {
          setCardOrder((prev) => prev.length === 0 ? [] : [...prev.slice(1), prev[0]]);
        }, duration);
      } else {
        applySwipeStyles(0);
      }
    }
    isSwiping.current = false;
    startX.current = 0;
    currentX.current = 0;
  }, [getDurationFromCSS, getActiveCard, applySwipeStyles]);
  const handleMove = reactExports.useCallback((clientX) => {
    if (!isSwiping.current) return;
    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    animationFrameId.current = requestAnimationFrame(() => {
      currentX.current = clientX;
      const deltaX = currentX.current - startX.current;
      applySwipeStyles(deltaX);
      if (Math.abs(deltaX) > 50) handleEnd();
    });
  }, [applySwipeStyles, handleEnd]);
  reactExports.useEffect(() => {
    const el = cardStackRef.current;
    if (!el) return;
    const onDown = (e) => handleStart(e.clientX);
    const onMove = (e) => handleMove(e.clientX);
    const onUp = () => handleEnd();
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [handleStart, handleMove, handleEnd]);
  reactExports.useEffect(() => {
    const cards = getCards();
    cards.forEach((card, i) => {
      card.style.setProperty("--i", (i + 1).toString());
      card.style.setProperty("--swipe-x", "0px");
      card.style.setProperty("--swipe-rotate", "0deg");
      card.style.opacity = "1";
    });
  }, [cardOrder, getCards]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "section",
    {
      ref: cardStackRef,
      className: `relative grid place-content-center select-none ${className}`,
      style: {
        width: cardWidth + 32,
        height: cardHeight + 32,
        touchAction: "none",
        "--card-perspective": "700px",
        "--card-z-offset": "12px",
        "--card-y-offset": "7px",
        "--card-max-z-index": imageList.length.toString(),
        "--card-swap-duration": "0.3s"
      },
      children: cardOrder.map((originalIndex, displayIndex) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "article",
        {
          className: "image-card absolute cursor-grab active:cursor-grabbing place-self-center border border-slate-400 rounded-xl shadow-md overflow-hidden will-change-transform",
          style: {
            zIndex: imageList.length - displayIndex,
            width: cardWidth,
            height: cardHeight,
            transform: `perspective(var(--card-perspective)) translateZ(calc(-1 * var(--card-z-offset) * ${displayIndex + 1})) translateY(calc(var(--card-y-offset) * ${displayIndex + 1})) translateX(var(--swipe-x, 0px)) rotateY(var(--swipe-rotate, 0deg))`
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: imageList[originalIndex],
              alt: `Swiper ${originalIndex + 1}`,
              className: "w-full h-full object-cover select-none pointer-events-none",
              draggable: false
            }
          )
        },
        originalIndex
      ))
    }
  );
};
function AnimatedGradient({
  colors = ["#7c3aed", "#3b82f6", "#06b6d4"],
  speed = 0.08,
  blur = "medium",
  className = ""
}) {
  const canvasRef = reactExports.useRef(null);
  const [loaded, setLoaded] = reactExports.useState(false);
  const animationRef = reactExports.useRef(0);
  const timeRef = reactExports.useRef(0);
  const blurMap = { light: "40px", medium: "80px", heavy: "120px" };
  reactExports.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);
    setLoaded(true);
    const animate = (timestamp) => {
      timeRef.current = timestamp * speed * 1e-3;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.sqrt(w * w + h * h) / 2;
      colors.forEach((color, i) => {
        const angle = timeRef.current + i * Math.PI * 2 / colors.length;
        const ox = Math.cos(angle) * w * 0.2;
        const oy = Math.sin(angle) * h * 0.2;
        const grad = ctx.createRadialGradient(
          cx + ox,
          cy + oy,
          0,
          cx + ox,
          cy + oy,
          maxR
        );
        grad.addColorStop(0, color);
        grad.addColorStop(0.5, color + "80");
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [colors, speed]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `absolute inset-0 overflow-hidden ${className}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    "canvas",
    {
      ref: canvasRef,
      className: "w-full h-full",
      style: {
        filter: `blur(${blurMap[blur]})`,
        opacity: loaded ? 1 : 0,
        transition: "opacity 0.5s ease"
      }
    }
  ) });
}
function MarkerHighlight({
  before = "",
  highlight = "",
  after = "",
  markerColor = "#facc15",
  baseColor = "#ffffff",
  highlightedTextColor = "#171717",
  fontSize = 56,
  fontWeight = 700,
  speed = 1.2,
  className = ""
}) {
  const duration = 1.2 / speed;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `relative inline-flex items-baseline gap-0 ${className}`, children: [
    before && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        style: { color: baseColor, fontSize, fontWeight, lineHeight: 1 },
        className: "relative z-10",
        children: before
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative inline-block", style: { lineHeight: 1 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          style: {
            color: highlightedTextColor,
            fontSize,
            fontWeight,
            lineHeight: 1
          },
          className: "relative z-10 px-1",
          children: highlight
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.span,
        {
          className: "absolute left-0 bottom-0 right-0 h-[0.35em] -z-0 rounded-sm",
          style: { backgroundColor: markerColor },
          initial: { scaleX: 0, transformOrigin: "left" },
          animate: { scaleX: 1 },
          transition: { duration, ease: [0.25, 0.1, 0.25, 1], delay: 0.3 }
        }
      )
    ] }),
    after && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        style: { color: baseColor, fontSize, fontWeight, lineHeight: 1 },
        className: "relative z-10",
        children: after
      }
    )
  ] });
}
function ShimmerBgText({
  children,
  className = "",
  shimmerColor = "rgba(255,255,255,0.4)",
  duration = 2.5
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "span",
    {
      className: `relative inline-block group ${className}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative z-10 transition-all duration-300 group-hover:brightness-110", children }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "absolute inset-0 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            style: {
              background: `linear-gradient(
            120deg,
            transparent 0%,
            transparent 30%,
            ${shimmerColor} 50%,
            transparent 70%,
            transparent 100%
          )`,
              backgroundSize: "200% 100%",
              animation: `shimmer-slide ${duration}s ease-in-out infinite`
            }
          }
        )
      ]
    }
  );
}
function extractHighlightItem(text) {
  if (!text) return { start: "Consider adding a ", item: "structured blazer", end: " for a more polished look." };
  const addMatch = text.match(/(?:Add|adding)\s+(?:a\s+)?(?:simple\s+)?(?:delicate\s+)?(?:thin\s+)?(?:layered\s+)?([a-zA-Z\s-]+?)\s+(?:to|for|and|if|or)/i);
  const tryMatch = text.match(/Try\s+(?:a\s+)?(?:adding\s+)?(?:a\s+)?(?:simple\s+)?(?:delicate\s+)?(?:thin\s+)?([a-zA-Z\s-]+?)\s+(?:to|for|and|if|or)/i);
  const swapMatch = text.match(/Swap\s+(?:the\s+)?([a-zA-Z\s]+?)\s+(?:for|with)/i);
  const match = addMatch || tryMatch || swapMatch;
  if (match) {
    const item = match[1].trim();
    const idx = text.toLowerCase().indexOf(item.toLowerCase());
    const start = text.substring(0, idx);
    const end = text.substring(idx + item.length);
    return { start, item, end };
  }
  return { start: text, item: "", end: "" };
}
const colorSwatchMap = {
  "Pink": "bg-pink-500",
  "Red": "bg-red-500",
  "Blue": "bg-blue-500",
  "Black": "bg-gray-900",
  "White": "bg-white border border-zinc-600",
  "Cream": "bg-yellow-100",
  "Green": "bg-green-500",
  "Brown": "bg-amber-800",
  "Gold": "bg-yellow-500",
  "Silver": "bg-gray-300",
  "Navy": "bg-blue-900",
  "Tan": "bg-amber-200",
  "Beige": "bg-amber-100",
  "Yellow": "bg-yellow-400",
  "Grey": "bg-gray-400",
  "Orange": "bg-orange-500",
  "Teal": "bg-teal-500",
  "Burgundy": "bg-red-900",
  "Blush": "bg-pink-200",
  "Khaki": "bg-amber-200",
  "Olive": "bg-green-700",
  "Purple": "bg-purple-600",
  "Maroon": "bg-red-800"
};
const vibeEmojis = {
  "Casual": "👕",
  "Formal": "🤵",
  "Business": "💼",
  "Sporty": "🏃",
  "Date Night": "🌹",
  "Party": "🎉",
  "Bohemian": "🌸",
  "Streetwear": "🧢",
  "Minimalist": "⬜",
  "Vintage": "📻"
};
function FashionHero({
  styleName = "Your Style",
  styleScore,
  strengths = [],
  improvements = [],
  itemsDetected = [],
  actualColors = [],
  audit = "",
  tweakPlan = "",
  tweakImageUrl,
  imageUrl,
  generatedImageUrl,
  vibeType,
  topType = "",
  bottomType = "",
  footwear = "",
  accessories = ""
}) {
  const isNA = styleScore === null || styleScore === void 0 || styleScore === 0;
  const showMindMap = !imageUrl && vibeType;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container mx-auto px-2 py-6 md:py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-6 relative overflow-x-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:order-2 relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -z-10 w-72 h-72 rounded-full bg-purple-500/20 blur-3xl opacity-30 -top-10 -left-10" }),
      imageUrl ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: imageUrl,
            alt: "Uploaded outfit",
            className: "w-full h-auto max-h-[75vh] md:max-h-[85vh] object-contain rounded-2xl shadow-2xl"
          }
        ),
        !isNA && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2 right-2 z-10 drop-shadow-lg bg-black/20 backdrop-blur-sm rounded-full p-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-20 h-20 md:w-24 md:h-24", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "100%", height: "100%", viewBox: "0 0 100 100", className: "-rotate-90", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "50", cy: "50", r: "42", fill: "none", stroke: "rgba(255,255,255,0.3)", strokeWidth: "6" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.circle,
              {
                cx: "50",
                cy: "50",
                r: "42",
                fill: "none",
                stroke: "url(#goldArcOverlay)",
                strokeWidth: "6",
                strokeLinecap: "round",
                strokeDasharray: 264,
                initial: { strokeDashoffset: 264 },
                animate: { strokeDashoffset: 264 - styleScore / 100 * 264 },
                transition: { duration: 1.5, ease: "easeOut" }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "goldArcOverlay", x1: "0%", y1: "0%", x2: "100%", y2: "100%", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "#C6A55C" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "#E8D5A3" })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl md:text-2xl font-bold gold-text", children: styleScore }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[8px] text-white/80", children: "/ 100" })
          ] })
        ] }) })
      ] }) : showMindMap ? (
        /* ---- Style Mind Map & Vibe ---- */
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-xl p-6 h-full min-h-[300px] flex flex-col gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl", children: "🧠" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-foreground text-sm uppercase tracking-wider", children: "Style Mind Map" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 bg-zinc-800/40 rounded-xl p-4 border border-zinc-700/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-3xl", children: vibeEmojis[vibeType] || "✨" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wider", children: "Vibe Classification" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold gold-text", children: vibeType })
            ] })
          ] }),
          !isNA && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 bg-zinc-800/40 rounded-xl p-4 border border-zinc-700/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-16 h-16 flex-shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "64", height: "64", viewBox: "0 0 64 64", className: "-rotate-90", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "32", cy: "32", r: "26", fill: "none", stroke: "hsl(var(--muted))", strokeWidth: "4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.circle,
                  {
                    cx: "32",
                    cy: "32",
                    r: "26",
                    fill: "none",
                    stroke: "url(#goldArcMind)",
                    strokeWidth: "4",
                    strokeLinecap: "round",
                    strokeDasharray: 163.36,
                    initial: { strokeDashoffset: 163.36 },
                    animate: { strokeDashoffset: 163.36 - styleScore / 100 * 163.36 },
                    transition: { duration: 1.5, ease: "easeOut" }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "goldArcMind", x1: "0%", y1: "0%", x2: "100%", y2: "100%", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "#C6A55C" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "#E8D5A3" })
                ] }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold gold-text", children: styleScore }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wider", children: "Style Score" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/80", children: styleName })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 bg-zinc-800/40 rounded-xl p-4 border border-zinc-700/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wider mb-2", children: "Breakdown" }),
            audit && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-foreground/70 leading-relaxed mb-3", children: [
              "“",
              audit,
              "”"
            ] }),
            tweakPlan && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 text-sm text-purple-400/80", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-purple-400 mt-0.5", children: "💡" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "italic", children: tweakPlan })
            ] }),
            tweakPlan && generatedImageUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-full max-h-[250px] overflow-hidden rounded-xl border border-white/10 mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: generatedImageUrl,
                alt: "Tweak Visualization",
                className: "w-full h-full object-cover object-center rounded-xl",
                onError: (e) => {
                  e.target.style.display = "none";
                }
              }
            ) })
          ] })
        ] })
      ) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:order-1 flex flex-col justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        className: "relative flex-1 flex flex-col gap-3 h-full w-full bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-3 overflow-hidden",
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, delay: 0.2 },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-full flex items-center justify-start py-3 overflow-hidden rounded-xl border border-white/10 flex-shrink-0 bg-gradient-to-r from-purple-900/50 via-blue-900/50 to-cyan-900/50 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl md:text-4xl lg:text-5xl italic tracking-tight drop-shadow-lg leading-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            MarkerHighlight,
            {
              before: "",
              highlight: styleName || "Modern Classic",
              after: "",
              markerColor: "#facc15",
              baseColor: "#ffffff",
              highlightedTextColor: "#ffffff",
              fontSize: 48,
              fontWeight: 700,
              speed: 1.2,
              className: "inline-block"
            }
          ) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full overflow-hidden rounded-xl border border-white/10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedGradient, { colors: ["#0ea5e9", "#38bdf8", "#bae6fd"], speed: 0.05, blur: "medium" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 p-4 backdrop-blur-sm h-auto w-full", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs uppercase tracking-[0.15em] text-white/60 mb-3 font-semibold", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShimmerBgText, { children: "ITEMS" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2.5 pb-2", children: topType && topType !== "None" || bottomType && bottomType !== "None" || footwear && footwear !== "None" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                topType && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-sm md:text-base font-medium text-white bg-transparent", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-2 h-2 rounded-full ${colorSwatchMap[topType.split(" ")[0]] || "bg-white/80"} shadow-[0_0_8px_rgba(255,255,255,0.5)] flex-shrink-0` }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ShimmerBgText, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize tracking-wide leading-tight", children: topType }) })
                ] }),
                bottomType && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-sm md:text-base font-medium text-white bg-transparent", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-2 h-2 rounded-full ${colorSwatchMap[bottomType.split(" ")[0]] || "bg-white/80"} shadow-[0_0_8px_rgba(255,255,255,0.5)] flex-shrink-0` }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ShimmerBgText, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize tracking-wide leading-tight", children: bottomType }) })
                ] }),
                footwear && footwear !== "None" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-sm md:text-base font-medium text-white bg-transparent", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-2 h-2 rounded-full ${colorSwatchMap[footwear.split(" ")[0]] || "bg-white/80"} shadow-[0_0_8px_rgba(255,255,255,0.5)] flex-shrink-0` }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ShimmerBgText, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize tracking-wide leading-tight", children: footwear }) })
                ] }),
                accessories && accessories !== "None" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-sm md:text-base font-medium text-white bg-transparent", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-2 h-2 rounded-full ${colorSwatchMap[accessories.split(" ")[0]] || "bg-white/80"} shadow-[0_0_8px_rgba(255,255,255,0.5)] flex-shrink-0` }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ShimmerBgText, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize tracking-wide leading-tight", children: accessories }) })
                ] })
              ] }) : itemsDetected.length > 0 ? itemsDetected.filter((item) => item && item !== "None").map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-sm md:text-base font-medium text-white bg-transparent", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.5)] flex-shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ShimmerBgText, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize tracking-wide leading-tight", children: item }) })
              ] }, i)) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/40", children: "No items detected" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full overflow-hidden rounded-xl border border-white/10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedGradient, { colors: ["#ec4899", "#f472b6", "#fbcfe8"], speed: 0.06, blur: "medium" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 p-4 backdrop-blur-sm h-auto w-full", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs uppercase tracking-[0.15em] text-white/60 mb-3 font-semibold", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShimmerBgText, { children: "STRENGTHS" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 pb-2", children: strengths.length > 0 ? strengths.map((s, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2.5 text-sm text-white/90 leading-relaxed", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] mt-1.5 flex-shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ShimmerBgText, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tracking-wide", children: s }) })
              ] }, idx)) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/40", children: "No strengths detected" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full overflow-hidden rounded-xl border border-white/10 flex-shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedGradient, { colors: ["#8b5cf6", "#a78bfa", "#c4b5fd"], speed: 0.07, blur: "medium" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 p-4 backdrop-blur-sm h-auto w-full", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs uppercase tracking-[0.15em] text-white/60 mb-1.5 font-semibold", children: "TWEAK" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row gap-4 items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 w-full", children: (() => {
                  const text = tweakPlan || "Consider adding a structured blazer for a more polished look.";
                  const { start, item, end } = extractHighlightItem(text);
                  if (item) {
                    return /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm italic text-white/90 leading-relaxed tracking-wide", children: [
                      start,
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        MarkerHighlight,
                        {
                          highlight: item,
                          markerColor: "#facc15",
                          baseColor: "#ffffff",
                          highlightedTextColor: "#171717",
                          speed: 1.2,
                          fontSize: 18,
                          fontWeight: 500,
                          className: "inline-block align-middle"
                        }
                      ),
                      end
                    ] });
                  }
                  return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm italic text-white/90 leading-relaxed tracking-wide", children: text });
                })() }),
                tweakImageUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-full md:w-[45%] lg:w-[40%] h-auto max-h-[180px] overflow-hidden rounded-lg border border-white/20 bg-black/20 flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "img",
                  {
                    src: tweakImageUrl,
                    alt: "Tweak Visualization",
                    className: "w-full h-full object-cover object-center rounded-lg",
                    onError: (e) => {
                      e.target.style.display = "none";
                    }
                  }
                ) })
              ] })
            ] })
          ] }),
          improvements.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-full overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-950/30 via-red-950/20 to-amber-950/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 p-4 backdrop-blur-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-xs uppercase tracking-[0.15em] text-amber-400/80 mb-3 font-semibold flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "\\u26A0" }),
              " HONEST FEEDBACK"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: improvements.map((imp, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: imp.priority === "high" ? "text-red-400" : imp.priority === "medium" ? "text-amber-400" : "text-blue-400", children: imp.priority === "high" ? "🔴" : imp.priority === "medium" ? "🟡" : "🔵" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-white/90 leading-relaxed", children: imp.issue }),
                imp.suggestion && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-300/70 mt-0.5", children: [
                  "\\u2192 ",
                  imp.suggestion
                ] })
              ] })
            ] }, idx)) })
          ] }) }),
          audit && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative min-h-[45px] overflow-hidden rounded-xl border border-white/10 bg-gradient-to-r from-black/60 via-zinc-900/60 to-black/60 flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative z-10 p-3 backdrop-blur-sm h-full w-full flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/50 leading-relaxed tracking-wide", children: audit }) }) })
        ]
      }
    ) })
  ] }) }) });
}
function Footer() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "relative mt-12 mb-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 -top-6 h-px bg-gradient-to-r from-transparent via-border to-transparent backdrop-blur-sm" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/60", children: "© 2026 LUXOR® — AI Fashion Style" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-4", children: [
        { icon: Instagram, href: "#" },
        { icon: Twitter, href: "#" },
        { icon: ExternalLink, href: "#" }
      ].map(({ icon: Icon, href }, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.a,
        {
          href,
          whileHover: { scale: 1.15, y: -2 },
          whileTap: { scale: 0.9 },
          className: "w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-4 h-4" })
        },
        i
      )) })
    ] })
  ] });
}
function Analysis() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = reactExports.useState(null);
  const [imageFile, setImageFile] = reactExports.useState(null);
  const [data, setData] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(false);
  const [savedId, setSavedId] = reactExports.useState(null);
  const [analysisFailed, setAnalysisFailed] = reactExports.useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = reactExports.useState(null);
  const [saving, setSaving] = reactExports.useState(false);
  const [userProfile, setUserProfile] = reactExports.useState(null);
  const [history, setHistory] = reactExports.useState([]);
  const fileRef = reactExports.useRef(null);
  const analyzeRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    analyzeRef.current = analyzeOutfit;
  });
  reactExports.useEffect(() => {
    if (imageFile && analyzeRef.current) {
      analyzeRef.current(imageFile);
    }
  }, [imageFile]);
  reactExports.useEffect(() => {
    const pending = sessionStorage.getItem("pendingUpload");
    if (pending) {
      sessionStorage.removeItem("pendingUpload");
      const byteString = atob(pending.split(",")[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      const blob = new Blob([ab], { type: "image/jpeg" });
      const file = new File([blob], "upload.jpg", { type: "image/jpeg" });
      setImagePreview(pending);
      setImageFile(file);
    }
  }, []);
  reactExports.useEffect(() => {
    if (!user) return;
    supabase.from("style_profiles").select("preferences").eq("user_id", user.id).single().then(({ data: data2 }) => {
      if (data2 == null ? void 0 : data2.preferences) setUserProfile(data2.preferences);
    }).catch(() => {
    });
  }, [user]);
  reactExports.useEffect(() => {
    if (!user) return;
    supabase.from("outfit_analyses").select("id,image_url,overall_style,style_score,summary,detected_items,color_palette,strengths,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data: d }) => setHistory(d || []));
  }, [user]);
  const handleFile = (f) => {
    if (!f) return;
    setImagePreview(URL.createObjectURL(f));
    setImageFile(f);
    setData(null);
    setSavedId(null);
    setGeneratedImageUrl(null);
  };
  const compressImage = (file, maxDim = 1024, quality = 0.7) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round(height * maxDim / width);
          width = maxDim;
        } else {
          width = Math.round(width * maxDim / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality).split(",")[1]);
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
  const analyzeOutfit = async (file) => {
    setAnalysisFailed(false);
    setLoading(true);
    try {
      const b64 = await compressImage(file);
      const apiUrl = "https://nice-useful-plot--al-bosify.replit.app";
      let fnData = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt > 0) {
          await new Promise((r) => setTimeout(r, 2e3 * attempt));
        }
        const controller = new AbortController();
        const abortTimer = setTimeout(() => controller.abort(), 12e4);
        try {
          const response = await fetch(apiUrl + "/api/v1/analyze-outfit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image_b64: b64 }),
            signal: controller.signal
          });
          clearTimeout(abortTimer);
          if (!response.ok) throw new Error("Server returned " + response.status);
          fnData = await response.json();
          if (!fnData || !fnData.success) throw new Error("Analysis failed");
          break;
        } catch (fetchErr) {
          clearTimeout(abortTimer);
          if (fetchErr.name === "AbortError") {
            throw new Error("Request timed out after 60s");
          }
          continue;
        }
      }
      if (!fnData || !fnData.success) {
        setData(null);
        setAnalysisFailed(true);
        toast.error("Analysis timed out. Tap Retry to try again.");
        return;
      }
      const o = {
        style_name: fnData.style_name || "",
        actual_colors: fnData.actual_colors || [],
        items_detected: fnData.items_detected || [],
        strengths: fnData.strengths || [],
        audit: fnData.audit || "",
        tweak_plan: fnData.tweak_plan || "",
        tweak_image_url: fnData.tweak_image_url || "",
        generation_prompt: fnData.generation_prompt || "",
        vibe_type: fnData.vibe_type || "",
        top_type: fnData.top_type || "",
        bottom_type: fnData.bottom_type || "",
        footwear: fnData.footwear || "",
        accessories: fnData.accessories || "",
        style_score: fnData.style_score || 0,
        seasonalFit: fnData.seasonalFit || ""
      };
      setData(o);
      const tweakPrompt = fnData.tweak_plan || fnData.generation_prompt || "";
      if (tweakPrompt) {
        const safe = encodeURIComponent(tweakPrompt + ", high fashion editorial, photorealistic");
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${safe}?width=1024&height=1024&nologin=true&seed=`;
        setGeneratedImageUrl(pollinationsUrl + Date.now());
      }
      setSavedId(null);
      toast.success("Outfit analyzed! ✨");
    } catch (e) {
      setAnalysisFailed(true);
      setData(null);
      toast.error(e.message || "Analysis failed");
      if (e.message && e.message.includes("Cipher Vision") && file) {
        const retryFile = file;
        setTimeout(() => {
          toast(
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Click to retry analysis" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => analyzeOutfit(retryFile), children: "Retry" })
            ] }),
            { duration: 8e3 }
          );
        }, 500);
      }
    } finally {
      setLoading(false);
    }
  };
  const determineVersatility = reactExports.useCallback((items, vibe, style) => {
    let scores = {
      Casual: 10,
      Business: 10,
      "Date Night": 10,
      Party: 10,
      Sporty: 10,
      Relaxed: 10
    };
    items.forEach((item) => {
      const lower = item.toLowerCase();
      if (/t.?shirt|jeans|sneakers|shorts|joggers|hoodie|sandals|tank\s*top|polo|sweatpants|denim|flip.?flop|sweatshirt/.test(lower)) scores.Casual += 30;
      if (/blazer|trousers|pumps|tie|suit|button.?down|oxfords|loafers|blouse|pencil skirt|briefcase/.test(lower)) scores.Business += 35;
      if (/dress|heels|necklace|clutch|earrings|bracelet|evening|silk|satin|lace|bodycon|strappy|gown/.test(lower)) scores["Date Night"] += 30;
      if (/glitter|sequin|mini|bold|metallic|leather|party|night out|clubbing|crop top/.test(lower)) scores.Party += 30;
      if (/sneakers|cap|athletic|joggers|gym|running|sport|performance|trainers|track\s*pants/.test(lower)) scores.Sporty += 30;
      if (/cardigan|sweater|oversized|loungewear|hoodie|sweatpants|fleece|cozy|cotton|linen/.test(lower)) scores.Relaxed += 30;
    });
    const v = (vibe || "").toLowerCase();
    if (/casual|everyday|weekend|street/.test(v)) scores.Casual += 25;
    if (/formal|business|office|corporate|executive|professional/.test(v)) scores.Business += 30;
    if (/party|night|club|celebrat/.test(v)) scores.Party += 25;
    if (/date|romantic|evening|dinner|glam/.test(v)) scores["Date Night"] += 25;
    if (/sport|athletic|gym|active|fitness/.test(v)) scores.Sporty += 25;
    if (/relaxed|comfort|lounge|chill|cozy/.test(v)) scores.Relaxed += 25;
    const s = (style || "").toLowerCase();
    if (/chic|elegant|sophisticated|glam|polished|couture/.test(s)) scores["Date Night"] += 20;
    if (/street|urban|edgy|bold|modern|trendy/.test(s)) scores.Casual += 20;
    if (/formal|executive|power|sharp|pro|corporate|tailored/.test(s)) scores.Business += 20;
    if (/sport|athleisure|active|fitness|performance/.test(s)) scores.Sporty += 20;
    if (/cozy|soft|relaxed|comfy|easy|bohemian/.test(s)) scores.Relaxed += 20;
    if (/party|festive|celebratory|night|daring/.test(s)) scores.Party += 20;
    const COLOR_MAP = {
      Casual: "#3b82f6",
      Business: "#8b5cf6",
      "Date Night": "#ec4899",
      Party: "#f59e0b",
      Sporty: "#06b6d4",
      Relaxed: "#22c55e"
    };
    return Object.entries(scores).filter(([_, v2]) => v2 >= 20).sort((a, b) => b[1] - a[1]).map(([label, score]) => ({
      label,
      score: Math.min(100, Math.max(0, Math.round(score))),
      color: COLOR_MAP[label] || "#666666"
    }));
  }, []);
  const handleSave = async () => {
    if (!data || !user || !imagePreview) return;
    setSaving(true);
    try {
      let publicUrl = imagePreview;
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("clothing-photos").upload(path, imageFile);
        if (!upErr) {
          const { data: pub } = supabase.storage.from("clothing-photos").getPublicUrl(path);
          publicUrl = pub.publicUrl;
        }
      }
      const { data: ins, error } = await supabase.from("outfit_analyses").insert({
        user_id: user.id,
        image_url: publicUrl,
        overall_style: data.style_name,
        style_score: data.style_score || 0,
        summary: data.audit,
        detected_items: data.items_detected.map((n) => ({ name: n, category: "Item", color: "N/A", style: "N/A" })),
        color_palette: { colors: data.actual_colors, harmony: "Balanced", rating: "Good" },
        strengths: data.strengths,
        improvements: [{ suggestion: data.tweak_plan, reason: "AI suggestion", priority: "medium" }],
        seasonal_fit: data.seasonalFit || "",
        body_type_notes: ""
      }).select("id").single();
      if (error) throw error;
      setSavedId(ins.id);
      toast.success("Analysis saved!");
    } catch (e) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };
  const loadSaved = (s) => {
    var _a, _b;
    setImagePreview(s.image_url);
    setImageFile(null);
    setData({
      vibe_type: ((_a = s.detected_items) == null ? void 0 : _a.vibe_type) || "",
      style_name: s.overall_style || "",
      actual_colors: ((_b = s.color_palette) == null ? void 0 : _b.colors) || [],
      items_detected: (s.detected_items || []).map((i) => i.name || ""),
      strengths: s.strengths || [],
      audit: s.summary || "",
      tweak_plan: "",
      tweak_image_url: "",
      generation_prompt: "",
      style_score: s.style_score || 0
    });
    setSavedId(s.id);
  };
  const timeAgo = (d) => {
    const m = Math.floor((Date.now() - new Date(d).getTime()) / 6e4);
    return m < 60 ? `${m}m ago` : `${Math.floor(m / 60)}h ago`;
  };
  const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-8 mx-auto max-w-7xl space-y-8 overflow-x-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, className: "relative hidden md:block", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-[60px]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-4xl font-bold text-foreground relative", children: [
        "See What the World ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gold-text", children: "Sees" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-2 text-lg", children: "Upload your outfit. The AI scores it, finds the strengths, and tells you exactly what to fix." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row gap-6 w-full max-w-7xl mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { opacity: 0, x: -20 },
          animate: { opacity: 1, x: 0 },
          className: "w-full md:w-[35%] lg:w-[30%] flex-shrink-0 relative",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-[1.5rem] border-[0.75px] border-border p-3 sticky top-24", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(GlowingEffect, { spread: 40, glow: true, proximity: 56, inactiveZone: 0.01, borderWidth: 3 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "glass-card border-0 shadow-none overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  onClick: () => {
                    var _a;
                    return (_a = fileRef.current) == null ? void 0 : _a.click();
                  },
                  className: "relative aspect-[3/4] cursor-pointer overflow-hidden bg-muted/20 group",
                  children: [
                    imagePreview ? /* @__PURE__ */ jsxRuntimeExports.jsx(ImageSwiper, { images: imagePreview, cardWidth: 400, cardHeight: 600, className: "w-full max-h-[55vh] md:max-h-[85vh]" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        motion.div,
                        {
                          animate: { y: [0, -6, 0] },
                          transition: { duration: 2.5, repeat: Infinity },
                          className: "w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center",
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "w-10 h-10 text-primary" })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-sm", children: "Tap to upload your outfit" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px]", children: "JPG or PNG, max 10 MB" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        ref: fileRef,
                        type: "file",
                        accept: "image/*",
                        className: "hidden",
                        onChange: (e) => {
                          var _a;
                          const f = (_a = e.target.files) == null ? void 0 : _a[0];
                          if (f) handleFile(f);
                        }
                      }
                    )
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: loading && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                motion.div,
                {
                  initial: { opacity: 0 },
                  animate: { opacity: 1 },
                  exit: { opacity: 0 },
                  className: "absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-primary" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-sm", children: "Analyzing your outfit…" })
                  ]
                }
              ) })
            ] }) })
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          className: "w-full md:flex-1 flex flex-col gap-4 space-y-6",
          variants: containerVariants,
          initial: "hidden",
          animate: "show",
          children: [
            data ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              userProfile && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: childVariants, className: "mb-4 p-3 rounded-xl bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-cyan-900/30 border border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 text-xs text-white/70", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/40 uppercase tracking-wider mr-1", children: "Profile" }),
                userProfile.bodyShape && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-1 rounded bg-white/5 border border-white/10", children: userProfile.bodyShape }),
                userProfile.height && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-1 rounded bg-white/5 border border-white/10", children: userProfile.height }),
                userProfile.budget && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 py-1 rounded bg-white/5 border border-white/10", children: [
                  "$",
                  userProfile.budget
                ] }),
                userProfile.styleGoal && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-1 rounded bg-white/5 border border-white/10", children: userProfile.styleGoal }),
                userProfile.lifestyle && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-1 rounded bg-white/5 border border-white/10", children: userProfile.lifestyle }),
                userProfile.profession && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-1 rounded bg-white/5 border border-white/10", children: userProfile.profession })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: childVariants, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                FashionHero,
                {
                  styleName: data.style_name,
                  styleScore: data.style_score || null,
                  strengths: data.strengths,
                  improvements: data.improvements || [],
                  itemsDetected: data.items_detected,
                  actualColors: data.actual_colors,
                  audit: data.audit,
                  tweakPlan: data.tweak_plan,
                  imageUrl: imagePreview,
                  generatedImageUrl,
                  tweakImageUrl: data == null ? void 0 : data.tweak_image_url,
                  vibeType: data.vibe_type,
                  topType: data.top_type,
                  bottomType: data.bottom_type,
                  footwear: data.footwear,
                  accessories: data.accessories
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: childVariants, children: (() => {
                const versatilityScores = determineVersatility((data == null ? void 0 : data.items_detected) || [], (data == null ? void 0 : data.vibe_type) || "", (data == null ? void 0 : data.style_name) || "");
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full p-5 rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs uppercase tracking-[0.15em] text-white/60 mb-1 font-semibold", children: "Outfit Versatility" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-white/40 mb-4", children: "How well this outfit adapts to different occasions." }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: versatilityScores.map((v, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between mb-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-white/80", children: v.label }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium text-white/60", children: [
                        v.score,
                        "%"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 w-full rounded-full bg-white/10 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      motion.div,
                      {
                        className: "h-full rounded-full",
                        style: { background: `linear-gradient(90deg, ${v.color}, ${v.color}dd)` },
                        initial: { width: 0 },
                        animate: { width: `${v.score}%` },
                        transition: { duration: 0.8, ease: "easeOut", delay: 0.1 * (i + 1) }
                      }
                    ) })
                  ] }, v.label)) })
                ] });
              })() }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { variants: childVariants, className: "flex items-center gap-3 justify-end", children: [
                !savedId ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleSave, disabled: saving, variant: "outline", className: "border-primary/30 hover:bg-primary/10", whileTap: { scale: 0.95 }, children: [
                  saving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 mr-2 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "w-4 h-4 mr-2" }),
                  "Save Analysis"
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-500/15 text-green-500 border-green-500/30", children: "✓ Saved to Dressing Room" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    onClick: () => navigate("/dressing-room"),
                    variant: "outline",
                    className: "border-primary/30 hover:bg-primary/10",
                    whileTap: { scale: 0.95 },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "w-4 h-4 mr-2" }),
                      " Open Dressing Room"
                    ]
                  }
                )
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: analysisFailed && imagePreview ? /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { variants: childVariants, className: "text-center py-12", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-16 w-16 text-amber-500/70 mx-auto mb-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-xl text-foreground mb-2", children: "Analysis timed out" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm max-w-sm mx-auto mb-6", children: "The AI took too long to respond. You can retry with a longer timeout, or upload a different photo." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
                  if (imageFile) analyzeOutfit(imageFile);
                }, disabled: loading, variant: "default", className: "gap-2", children: [
                  loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4" }),
                  loading ? "Analyzing..." : "🔄 Retry Analysis"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
                  setImagePreview(null);
                  setImageFile(null);
                  setAnalysisFailed(false);
                }, variant: "outline", className: "gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-4 h-4" }),
                  " Upload new photo"
                ] })
              ] })
            ] }) : (
              /* ---- Empty state ---- */
              /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { variants: childVariants, className: "text-center py-12", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-16 w-16 text-muted-foreground mx-auto mb-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-xl text-foreground mb-2", children: "Upload an outfit to begin" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm max-w-sm mx-auto", children: "Tap the camera area on the left to upload a photo. The AI will analyze your style, colors, and fit." })
              ] })
            ) }),
            history.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { variants: childVariants, className: "pt-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-display text-lg text-foreground mb-4 flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "w-5 h-5 text-primary" }),
                " Previous Analyses"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3", children: history.slice(0, 6).map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                motion.button,
                {
                  whileHover: { scale: 1.03, y: -2 },
                  whileTap: { scale: 0.95 },
                  onClick: () => loadSaved(h),
                  className: "relative rounded-xl overflow-hidden border border-border/50 group text-left",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-[3/4] bg-muted/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: h.image_url, alt: "", className: "w-full h-full object-cover", loading: "lazy" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-background/90 to-transparent", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold text-foreground truncate", children: h.overall_style }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[8px] text-muted-foreground", children: [
                        h.style_score,
                        "/100 · ",
                        timeAgo(h.created_at)
                      ] })
                    ] })
                  ]
                },
                h.id
              )) })
            ] })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] }) });
}
export {
  Analysis as default
};
