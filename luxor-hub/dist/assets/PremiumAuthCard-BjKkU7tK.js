import { j as jsxRuntimeExports } from "./index-CHmOPdwM.js";
import { m as motion } from "./proxy-PXi4GB5x.js";
const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: -10 - Math.random() * 20,
  size: Math.random() * 3 + 1.5,
  duration: Math.random() * 10 + 12,
  delay: Math.random() * 8
}));
function GoldParticles() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: particles.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      className: "absolute rounded-full",
      style: {
        left: `${p.x}%`,
        top: `${p.y}%`,
        width: p.size,
        height: p.size,
        background: "radial-gradient(circle, hsl(0 0% 85% / 0.7), hsl(0 0% 65% / 0.2))"
      },
      animate: {
        y: [0, 120, 250],
        x: [0, Math.random() * 30 - 15, Math.random() * 20 - 10],
        opacity: [0, 0.6, 0],
        scale: [0.8, 1.3, 1, 1.2, 0.9, 1.1, 0.8]
      },
      transition: {
        duration: p.duration,
        delay: p.delay,
        repeat: Infinity,
        ease: "linear"
      }
    },
    p.id
  )) });
}
function GoldDivider() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-px w-24 mx-auto my-4 overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(43,80%,58%)] to-transparent opacity-40" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        className: "absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-[hsl(43,80%,68%)] to-transparent",
        animate: { x: ["-3rem", "6rem"] },
        transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
      }
    )
  ] });
}
function PremiumCardWrapper({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute -inset-px rounded-2xl overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-[hsl(43,80%,58%,0.15)] via-transparent to-[hsl(43,80%,58%,0.08)]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          className: "absolute inset-0",
          style: {
            background: "conic-gradient(from 0deg, transparent, hsl(43 80% 58% / 0.3), transparent, transparent)"
          },
          animate: { rotate: 360 },
          transition: { duration: 8, repeat: Infinity, ease: "linear" }
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative glass rounded-2xl p-8 backdrop-blur-xl bg-background/60", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-[hsl(43,80%,58%,0.06)] rounded-full blur-2xl pointer-events-none" }),
      children
    ] })
  ] });
}
function GoldShimmerButton({ children, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        className: "absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12",
        animate: { x: ["-100%", "200%"] },
        transition: { duration: 3, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }
      }
    ),
    children
  ] });
}
export {
  GoldParticles as G,
  PremiumCardWrapper as P,
  GoldDivider as a,
  GoldShimmerButton as b
};
