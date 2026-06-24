import { e as useNavigate, j as jsxRuntimeExports } from "./index-BJjnbSuc.js";
import { B as Button } from "./AppContent-4cFLEqQ4.js";
import { u as usePlanTier } from "./usePlanTier-Dnd9Vx1Q.js";
import { h as hasTierAccess } from "./planRestrictions-__Vqe2nr.js";
import { m as motion } from "./proxy-DPNpeU0t.js";
import { L as Lock } from "./lock-KX049Fqg.js";
import { A as ArrowRight } from "./arrow-right-tIMF6hRe.js";
const TIER_LABELS = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  elite: "Elite"
};
const TierGate = ({ requiredTier, featureName, children }) => {
  const { tier, isLoading } = usePlanTier();
  const navigate = useNavigate();
  if (isLoading) return null;
  if (hasTierAccess(tier, requiredTier)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      className: "flex flex-col items-center justify-center min-h-[60vh] px-6 text-center",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-7 h-7 text-muted-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-bold text-foreground mb-2", children: featureName }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-sm mb-6 max-w-xs", children: [
          "This feature requires the ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-semibold", children: TIER_LABELS[requiredTier] }),
          " plan or higher. Upgrade to unlock it."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => navigate("/paywall"), className: "gap-2", children: [
          "Upgrade Now ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-4 h-4" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground/60 text-xs mt-3", children: [
          "You're currently on the ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: TIER_LABELS[tier] }),
          " plan"
        ] })
      ]
    }
  );
};
const TierGate$1 = TierGate;
export {
  TierGate$1 as T
};
