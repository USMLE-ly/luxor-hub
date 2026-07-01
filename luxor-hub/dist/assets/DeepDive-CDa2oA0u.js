import { r as reactExports, j as jsxRuntimeExports, R as React, e as useNavigate } from "./index-DFKWyX4C.js";
import { c as cn, H as Helmet } from "./AppContent-bHL5AEXz.js";
import { N as Navbar, F as Footer } from "./Footer-BU4herqA.js";
import { C as Camera } from "./camera-CF-kjSuO.js";
import { B as Brain } from "./brain-DCzkwlin.js";
import { S as Sun } from "./sun-FLypDA9t.js";
import { S as ShoppingBag } from "./shopping-bag-DQiRYl-Z.js";
import { C as ChartColumn } from "./chart-column-nsCoe-Bd.js";
import { U as hasReducedMotionListener, W as initPrefersReducedMotion, X as prefersReducedMotion, m as motion } from "./proxy-B0zWGJQh.js";
import { A as ArrowLeft } from "./arrow-left-BqJRXkQQ.js";
import "./index-BDR2T6vv.js";
import "./index-QLZM9ct6.js";
import "./index-C3InLIXl.js";
import "./index-jbxuFzle.js";
import "./index-CtzXj5YV.js";
import "./index-aO-T8yYL.js";
import "./index-BQHV7gEf.js";
import "./index-kbtqucQr.js";
import "./x-Brxpjx9f.js";
import "./use-toast-CK8ADdlD.js";
import "./index-6kPRtehs.js";
import "./check-CC6X78GU.js";
import "./arrow-right-CsSQY48P.js";
import "./arrow-up-CMlYyOW7.js";
function useReducedMotion() {
  !hasReducedMotionListener.current && initPrefersReducedMotion();
  const [shouldReduceMotion] = reactExports.useState(prefersReducedMotion.current);
  return shouldReduceMotion;
}
function FeatureCard({ feature, className, ...props }) {
  const p = genRandomPattern();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("relative overflow-hidden p-6", className), ...props, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 h-full w-full [mask-image:linear-gradient(white,transparent)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "from-foreground/5 to-foreground/1 absolute inset-0 bg-gradient-to-r [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] opacity-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      GridPattern,
      {
        width: 20,
        height: 20,
        x: "-12",
        y: "4",
        squares: p,
        className: "fill-foreground/5 stroke-foreground/25 absolute inset-0 h-full w-full mix-blend-overlay"
      }
    ) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(feature.icon, { className: "text-foreground/75 size-6", strokeWidth: 1, "aria-hidden": true }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-10 text-sm md:text-base font-semibold text-foreground", children: feature.title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground relative z-20 mt-2 text-xs font-light", children: feature.description })
  ] });
}
function GridPattern({
  width,
  height,
  x,
  y,
  squares,
  ...props
}) {
  const patternId = React.useId();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { "aria-hidden": "true", ...props, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("pattern", { id: patternId, width, height, patternUnits: "userSpaceOnUse", x, y, children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: `M.5 ${height}V.5H${width}`, fill: "none" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { width: "100%", height: "100%", strokeWidth: 0, fill: `url(#${patternId})` }),
    squares && /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { x, y, className: "overflow-visible", children: squares.map(([sx, sy], index) => /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { strokeWidth: "0", width: width + 1, height: height + 1, x: sx * width, y: sy * height }, index)) })
  ] });
}
function genRandomPattern(length) {
  length = length ?? 5;
  return Array.from({ length }, () => [
    Math.floor(Math.random() * 4) + 7,
    Math.floor(Math.random() * 6) + 1
  ]);
}
const steps = [
  {
    icon: Camera,
    title: "Digitize Your Wardrobe",
    description: "Photograph your clothes. AI identifies each piece in seconds — category, colors, fabric, brand, season. No manual tagging."
  },
  {
    icon: Brain,
    title: "AI Learns Your Style DNA",
    description: "LEXOR® builds a personal profile from your body, skin tone, lifestyle, and outfits you actually wear. 40+ style dimensions."
  },
  {
    icon: Sun,
    title: "Wake Up to a Weather-Checked Outfit",
    description: "Each morning, AI checks your closet, weather, and calendar to assemble a complete outfit. Every interaction makes tomorrow smarter."
  },
  {
    icon: ShoppingBag,
    title: "Shop Smarter With Gap Analysis",
    description: "Instead of impulse buys, see what's actually missing. Users spend 35% less on clothing while wearing 60% more of what they own."
  },
  {
    icon: ChartColumn,
    title: "Track Progress and Build Confidence",
    description: "See cost-per-wear, style scores, outfit variety, and wardrobe utilization. Earn badges. Stop second-guessing."
  }
];
function AnimatedContainer({
  className,
  delay = 0.1,
  children
}) {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { filter: "blur(4px)", translateY: -8, opacity: 0 },
      whileInView: { filter: "blur(0px)", translateY: 0, opacity: 1 },
      viewport: { once: true },
      transition: { delay, duration: 0.8 },
      className,
      children
    }
  );
}
const AIFashionEditorial = () => /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "py-16 md:py-32 bg-background", "aria-labelledby": "ai-fashion-editorial-heading", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto w-full max-w-5xl space-y-8 px-4", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsxs(AnimatedContainer, { className: "mx-auto max-w-3xl text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "h2",
      {
        id: "ai-fashion-editorial-heading",
        className: "text-3xl font-bold tracking-wide text-balance md:text-4xl lg:text-5xl xl:font-extrabold text-foreground",
        children: "How AI Fashion Styling Works"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-4 text-sm tracking-wide text-balance md:text-base", children: "Five steps from cluttered closet to daily outfits that fit your life." })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(
    AnimatedContainer,
    {
      delay: 0.4,
      className: "grid grid-cols-1 divide-x divide-y divide-dashed border border-dashed sm:grid-cols-2 md:grid-cols-3",
      children: steps.map((step, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureCard, { feature: step }, i))
    }
  ),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(AnimatedContainer, { delay: 0.6, className: "mt-14 md:mt-20 border-t border-border/20 pt-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-xl md:text-2xl font-semibold text-foreground mb-4 tracking-tight", children: "Why AI-Powered Fashion Styling Matters" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 text-sm md:text-base text-muted-foreground leading-relaxed", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "The average person spends 20 minutes every morning deciding what to wear — 120+ hours a year. AI processes your entire wardrobe, the weather, your schedule, and current trends in under a second." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "LEXOR® improves with every interaction. The more you use it, the better it reads your taste in fabrics, colors, and occasion-specific dress codes. It's not replacing your style — it's making it sharper." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Whether you're a busy professional, a fashion enthusiast with a curated closet, or someone rebuilding confidence through better self-presentation — AI styling adapts to you." })
    ] })
  ] })
] }) });
const DeepDive = () => {
  const navigate = useNavigate();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background dark", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Helmet, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("title", { children: "How AI Fashion Styling Works — Deep Dive | LEXOR®" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "meta",
        {
          name: "description",
          content: "Five steps from cluttered closet to daily AI-picked outfits. How LEXOR® digitizes your wardrobe, learns your style, and dresses you for the weather."
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("script", { type: "application/ld+json", children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "How AI Fashion Styling Works — Deep Dive",
        "description": "Five steps from cluttered closet to daily AI-picked outfits. How LEXOR® digitizes your wardrobe, learns your style, and dresses you for the weather.",
        "author": { "@type": "Organization", "name": "LEXOR®", "url": "https://luxor.ly" },
        "publisher": { "@type": "Organization", "name": "LEXOR®", "url": "https://luxor.ly" },
        "mainEntityOfPage": { "@type": "WebPage", "@id": "https://luxor.ly/deep-dive" }
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("link", { rel: "canonical", href: "https://luxor.ly/deep-dive" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("meta", { property: "og:title", content: "How AI Fashion Styling Works — Deep Dive | LEXOR®" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("meta", { property: "og:description", content: "Five steps from cluttered closet to daily AI-picked outfits." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("meta", { property: "og:url", content: "https://luxor.ly/deep-dive" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("meta", { property: "og:type", content: "article" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("meta", { name: "twitter:card", content: "summary_large_image" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("meta", { name: "twitter:title", content: "How AI Fashion Styling Works — Deep Dive | LEXOR®" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Navbar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-24 pb-4 max-w-4xl mx-auto px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => navigate("/"),
        className: "inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-4 h-4" }),
          "Back to Home"
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AIFashionEditorial, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
};
export {
  DeepDive as default
};
