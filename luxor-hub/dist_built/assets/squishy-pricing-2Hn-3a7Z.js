import { d as createLucideIcon } from "./AppContent-h4IlOpH8.js";
import { r as reactExports, j as jsxRuntimeExports } from "./index-CqA86RF3.js";
import { L as Lock } from "./lock-81NW8mrd.js";
import { L as LoaderCircle } from "./loader-circle-CEY9nmQc.js";
import { m as motion } from "./proxy-ShtysCL3.js";
import { C as Crown } from "./crown-Ggxwvs-L.js";
import { C as Check } from "./check-DTG3tuFV.js";
import { X } from "./x-BJDvVtyz.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Shield = createLucideIcon("Shield", [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ]
]);
const PAYPAL_CLIENT_ID = "ARa9CFxEtURh2bL23KEBSHEjQ7JJA39Dxl-Jn4JCR7fsRx6AaUEe7IXKl97AaApUq0pwXDUMe97sgco-";
const PLAN_IDS = {
  starter: "P-6KB46929KR388530GNG6YDAA",
  pro: "P-3TT76167R1560735XNG6X7TQ",
  elite: "P-6KB46929KR388530GNG6YDAA"
};
let sdkPromise = null;
let sdkFailed = false;
function loadPayPalSDK() {
  if (window.paypal) return Promise.resolve();
  if (sdkFailed) return Promise.reject(new Error("PayPal SDK previously failed to load"));
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
    script.dataset.sdkIntegrationSource = "button-factory";
    script.async = true;
    script.onload = () => {
      console.log("PayPal SDK loaded successfully");
      resolve();
    };
    script.onerror = () => {
      sdkFailed = true;
      sdkPromise = null;
      reject(new Error("PayPal SDK failed to load"));
    };
    document.head.appendChild(script);
  });
  return sdkPromise;
}
const PayPalButton = ({ tier, onApprove }) => {
  const containerRef = reactExports.useRef(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  const onApproveRef = reactExports.useRef(onApprove);
  onApproveRef.current = onApprove;
  reactExports.useEffect(() => {
    let cancelled = false;
    const render = async () => {
      setLoading(true);
      setError(null);
      try {
        await loadPayPalSDK();
        if (cancelled || !containerRef.current) return;
        containerRef.current.innerHTML = "";
        const paypal = window.paypal;
        if (!paypal) {
          throw new Error("PayPal object not available after SDK load");
        }
        await paypal.Buttons({
          style: {
            shape: "pill",
            color: "white",
            layout: "vertical",
            label: "subscribe",
            height: 40,
            tagline: false
          },
          createSubscription: (_data, actions) => {
            return actions.subscription.create({
              plan_id: PLAN_IDS[tier]
            });
          },
          onApprove: (data) => {
            onApproveRef.current(data.subscriptionID);
          }
        }).render(containerRef.current);
      } catch (err) {
        console.error("PayPal render error:", err);
        if (!cancelled) {
          setError((err == null ? void 0 : err.message) || "Failed to load PayPal. Please try on the published site.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    render();
    return () => {
      cancelled = true;
    };
  }, [tier]);
  if (error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-md border border-white/[0.08] p-5 text-center shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.08] mx-auto mb-3 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-4 h-4 text-white/40" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[12px] text-white/50 font-sans leading-relaxed", children: "PayPal loads on the published site." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[12px] text-white/80 font-sans font-medium mt-1", children: "Publish to test payments." })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full", children: [
    loading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center py-4 rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-md border border-white/[0.08] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin text-white/60" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-[11px] text-white/50 font-sans tracking-wide", children: "Preparing checkout…" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref: containerRef,
        className: "w-full min-h-[40px] rounded-2xl overflow-hidden [&_iframe]:rounded-2xl border border-white/[0.08] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]",
        style: { background: "linear-gradient(to bottom, #111, #0a0a0a)" }
      }
    ),
    !loading && !error && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-center text-[10px] text-white/30 font-sans flex items-center justify-center gap-1.5 tracking-wide", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-3 h-3" }),
      "Secured by PayPal"
    ] })
  ] });
};
const SquishyPricingCard = ({
  label,
  monthlyPrice,
  description,
  features,
  cta,
  background,
  BGComponent,
  onCtaClick,
  footer,
  popular
}) => {
  const hasFeatures = features && features.length > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      whileHover: "hover",
      transition: { duration: 1, ease: "backInOut" },
      variants: { hover: { scale: 1.05 } },
      className: `group relative ${hasFeatures ? "h-auto min-h-[30rem] sm:min-h-[34rem]" : "h-[22rem] sm:h-96"} w-full shrink-0 overflow-hidden rounded-3xl p-6 sm:p-8 ${background} transition-all duration-500 flex flex-col ${popular ? "shadow-[0_0_60px_-12px_rgba(255,255,255,0.15),0_0_0_1px_rgba(255,255,255,0.15)] scale-[1.02]" : "shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.08)]"}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 z-[1] rounded-3xl bg-gradient-to-b from-white/[0.15] via-transparent to-black/[0.25] pointer-events-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 z-[1] rounded-3xl bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 left-0 right-0 h-px z-[2] bg-gradient-to-r from-transparent via-white/40 to-transparent" }),
        popular && /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { y: -20, opacity: 0 },
            animate: { y: 0, opacity: 1 },
            transition: { delay: 0.3 },
            className: "absolute -top-px left-1/2 -translate-x-1/2 z-10",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 py-1.5 rounded-b-xl bg-gradient-to-r from-[hsl(43,90%,65%)] via-[hsl(40,95%,72%)] to-[hsl(43,90%,65%)] shadow-[0_4px_16px_-2px_hsl(43,74%,49%,0.5)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-900 font-sans flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "w-3 h-3" }),
              "Most Popular"
            ] }) })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 text-white", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-4 block w-fit rounded-full bg-black/30 backdrop-blur-md px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90 border border-white/15 font-sans", children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { scale: 0.85 },
              variants: { hover: { scale: 1 } },
              transition: { duration: 1, ease: "backInOut" },
              className: "my-3 origin-top-left",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-0.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[1rem] font-sans text-white/50 font-light self-start mt-2", children: "$" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-[3.5rem] sm:text-[4rem] font-extralight leading-none tracking-tighter text-white", children: monthlyPrice })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-sans text-white/50 uppercase tracking-[0.15em] mt-1 block", children: "per month" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] sm:text-xs text-white/70 mt-2 font-sans leading-relaxed", children: description })
        ] }),
        hasFeatures && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative z-10 my-5 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "relative z-10 space-y-3 flex-1", children: features.map((f, i) => {
            const isObj = typeof f === "object";
            const text = isObj ? f.text : f;
            const included = isObj ? f.included : true;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: `flex items-center gap-3 ${included ? "text-white" : "text-white/35"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center ${included ? "bg-white/10 border border-white/15" : "bg-white/5 border border-white/8"}`, children: included ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-3 h-3 text-white/90", strokeWidth: 2.5 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3 h-3 text-white/30", strokeWidth: 2 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[11px] font-sans leading-snug tracking-wide ${included ? "text-white/85" : "text-white/35 line-through decoration-white/20"}`, children: text })
            ] }, i);
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `${hasFeatures ? "relative mt-6" : "absolute bottom-4 left-4 right-4"} z-20`, children: footer ? footer : cta ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: onCtaClick,
            className: "w-full rounded-2xl border border-white/20 bg-white/95 py-3 text-center text-xs font-semibold uppercase tracking-[0.12em] text-neutral-900 backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-[0_4px_24px_rgba(255,255,255,0.25)] focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-[0.97] font-sans",
            children: cta
          }
        ) : null }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(BGComponent, {})
      ]
    }
  );
};
const BGComponent1 = () => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  motion.svg,
  {
    width: "320",
    height: "384",
    viewBox: "0 0 320 384",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    variants: { hover: { scale: 1.5 } },
    transition: { duration: 1, ease: "backInOut" },
    className: "absolute inset-0 z-0",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.circle,
        {
          variants: { hover: { scaleY: 0.5, y: -25 } },
          transition: { duration: 1, ease: "backInOut", delay: 0.2 },
          cx: "160.5",
          cy: "114.5",
          r: "101.5",
          fill: "rgba(0, 0, 0, 0.15)"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.ellipse,
        {
          variants: { hover: { scaleY: 2.25, y: -25 } },
          transition: { duration: 1, ease: "backInOut", delay: 0.2 },
          cx: "160.5",
          cy: "265.5",
          rx: "101.5",
          ry: "43.5",
          fill: "rgba(0, 0, 0, 0.15)"
        }
      )
    ]
  }
);
const BGComponent2 = () => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  motion.svg,
  {
    width: "320",
    height: "384",
    viewBox: "0 0 320 384",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    variants: { hover: { scale: 1.05 } },
    transition: { duration: 1, ease: "backInOut" },
    className: "absolute inset-0 z-0",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.rect,
        {
          x: "14",
          width: "153",
          height: "153",
          rx: "15",
          fill: "rgba(0, 0, 0, 0.15)",
          variants: { hover: { y: 219, rotate: "90deg", scaleX: 2 } },
          style: { y: 12 },
          transition: { delay: 0.2, duration: 1, ease: "backInOut" }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.rect,
        {
          x: "155",
          width: "153",
          height: "153",
          rx: "15",
          fill: "rgba(0, 0, 0, 0.15)",
          variants: { hover: { y: 12, rotate: "90deg", scaleX: 2 } },
          style: { y: 219 },
          transition: { delay: 0.2, duration: 1, ease: "backInOut" }
        }
      )
    ]
  }
);
const BGComponent3 = () => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  motion.svg,
  {
    width: "320",
    height: "384",
    viewBox: "0 0 320 384",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    variants: { hover: { scale: 1.25 } },
    transition: { duration: 1, ease: "backInOut" },
    className: "absolute inset-0 z-0",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.path,
        {
          variants: { hover: { y: -50 } },
          transition: { delay: 0.3, duration: 1, ease: "backInOut" },
          d: "M148.893 157.531C154.751 151.673 164.249 151.673 170.107 157.531L267.393 254.818C273.251 260.676 273.251 270.173 267.393 276.031L218.75 324.674C186.027 357.397 132.973 357.397 100.25 324.674L51.6068 276.031C45.7489 270.173 45.7489 260.676 51.6068 254.818L148.893 157.531Z",
          fill: "rgba(0, 0, 0, 0.15)"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.path,
        {
          variants: { hover: { y: -50 } },
          transition: { delay: 0.2, duration: 1, ease: "backInOut" },
          d: "M148.893 99.069C154.751 93.2111 164.249 93.2111 170.107 99.069L267.393 196.356C273.251 202.213 273.251 211.711 267.393 217.569L218.75 266.212C186.027 298.935 132.973 298.935 100.25 266.212L51.6068 217.569C45.7489 211.711 45.7489 202.213 51.6068 196.356L148.893 99.069Z",
          fill: "rgba(0, 0, 0, 0.15)"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.path,
        {
          variants: { hover: { y: -50 } },
          transition: { delay: 0.1, duration: 1, ease: "backInOut" },
          d: "M148.893 40.6066C154.751 34.7487 164.249 34.7487 170.107 40.6066L267.393 137.893C273.251 143.751 273.251 153.249 267.393 159.106L218.75 207.75C186.027 240.473 132.973 240.473 100.25 207.75L51.6068 159.106C45.7489 153.249 45.7489 143.751 51.6068 137.893L148.893 40.6066Z",
          fill: "rgba(0, 0, 0, 0.15)"
        }
      )
    ]
  }
);
export {
  BGComponent1 as B,
  PayPalButton as P,
  SquishyPricingCard as S,
  Shield as a,
  BGComponent2 as b,
  BGComponent3 as c
};
