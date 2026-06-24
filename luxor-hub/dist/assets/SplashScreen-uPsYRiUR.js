import { r as reactExports, j as jsxRuntimeExports } from "./index-BJjnbSuc.js";
import { A as AnimatePresence } from "./index-CWYjAC1K.js";
import { m as motion } from "./proxy-DPNpeU0t.js";
const LETTERS = "LEXOR®".split("");
const TAGLINE = "Your AI Style Intelligence";
const GoldParticle = ({ index }) => {
  const x = 20 + Math.random() * 60;
  const delay = Math.random() * 2;
  const duration = 2.5 + Math.random() * 2;
  const size = 2 + Math.random() * 3;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      className: "absolute rounded-full",
      style: {
        left: `${x}%`,
        bottom: "20%",
        width: size,
        height: size,
        background: `hsl(43, 74%, ${50 + Math.random() * 20}%)`
      },
      initial: { opacity: 0, y: 0 },
      animate: { opacity: [0, 0.7, 0], y: [-20, -120 - Math.random() * 80] },
      transition: { duration, delay, repeat: Infinity, ease: "easeOut" }
    }
  );
};
const SplashScreen = () => {
  const [show, setShow] = reactExports.useState(false);
  const [taglineText, setTaglineText] = reactExports.useState("");
  reactExports.useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
    if (isStandalone && !sessionStorage.getItem("luxor_splash_shown")) {
      setShow(true);
      sessionStorage.setItem("luxor_splash_shown", "1");
      setTimeout(() => setShow(false), 3200);
    }
  }, []);
  reactExports.useEffect(() => {
    if (!show) return;
    const startDelay = 1200;
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setTaglineText(TAGLINE.slice(0, i));
        if (i >= TAGLINE.length) clearInterval(interval);
      }, 35);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [show]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: show && /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.6 },
      className: "fixed inset-0 z-[99999] bg-background flex flex-col items-center justify-center",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { scale: 0, opacity: 0 },
            animate: { scale: 1.4, opacity: 0.25 },
            transition: { duration: 2, ease: "easeOut" },
            className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary blur-[120px]"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: Array.from({ length: 20 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(GoldParticle, { index: i }, i)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { scale: 0.3, opacity: 0, rotateY: -90 },
            animate: { scale: 1, opacity: 1, rotateY: 0 },
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
            className: "relative z-10 mb-8",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-22 h-22 rounded-2xl gold-gradient flex items-center justify-center shadow-[0_0_40px_-8px_hsl(43,74%,49%,0.5)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-4xl font-bold text-primary-foreground p-4", children: "A" }) })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              className: "absolute -inset-6 rounded-full border-2 border-transparent",
              style: {
                borderTopColor: "hsl(43, 74%, 49%)",
                borderRightColor: "hsl(43, 74%, 49%)"
              },
              animate: { rotate: 360 },
              transition: { duration: 2, repeat: Infinity, ease: "linear" }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              className: "absolute -inset-10 rounded-full border border-transparent",
              style: {
                borderBottomColor: "hsl(43, 74%, 60%)",
                borderLeftColor: "hsl(43, 74%, 60%)"
              },
              animate: { rotate: -360 },
              transition: { duration: 3, repeat: Infinity, ease: "linear" }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative z-10 flex gap-0.5 mb-3", children: LETTERS.map((letter, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.span,
          {
            initial: { opacity: 0, y: 12 },
            animate: { opacity: 1, y: 0 },
            transition: { delay: 0.4 + i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
            className: "font-display text-4xl font-bold gold-text tracking-wider",
            children: letter
          },
          i
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative z-10 h-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground font-sans", children: [
          taglineText,
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.span,
            {
              animate: { opacity: [1, 0] },
              transition: { duration: 0.5, repeat: Infinity },
              className: "inline-block w-[2px] h-4 bg-primary ml-0.5 align-middle"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.p,
          {
            initial: { opacity: 0 },
            animate: { opacity: 0.3 },
            transition: { delay: 2.5 },
            className: "absolute bottom-8 text-[10px] text-muted-foreground font-sans tracking-widest z-10",
            children: "v2.0"
          }
        )
      ]
    },
    "splash"
  ) });
};
export {
  SplashScreen as default
};
