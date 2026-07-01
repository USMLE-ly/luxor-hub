import { e as useNavigate, r as reactExports, j as jsxRuntimeExports } from "./index-DFKWyX4C.js";
import { e as useAuth, f as useQueryClient, s as supabase } from "./AppContent-bHL5AEXz.js";
import { t as toast } from "./index-Dz_RoOUd.js";
import { t as trackEvent } from "./fbPixel-CTUEdhYl.js";
import { B as BGComponent1, a as BGComponent2, b as BGComponent3, S as SquishyPricingCard, P as PayPalButton, c as Shield } from "./squishy-pricing-UE931BJ2.js";
import { m as motion } from "./proxy-B0zWGJQh.js";
import { C as Crown } from "./crown-DBZraos2.js";
import { C as Clock } from "./clock-BaUvpEpF.js";
import { R as RotateCcw } from "./rotate-ccw-4CklANh9.js";
import "./lock-BP_1IJoh.js";
import "./loader-circle-F4mLE20_.js";
import "./check-CC6X78GU.js";
import "./x-Brxpjx9f.js";
const tiers = [
  {
    key: "free",
    label: "Free",
    price: "0",
    desc: "Explore the basics — no credit card needed",
    isFree: true,
    features: [
      "AI outfit suggestions — 3 per day",
      "Closet digitization — up to 15 items",
      "Basic Style DNA snapshot",
      { text: "Color analysis", included: false },
      { text: "Capsule wardrobes", included: false },
      { text: "Virtual try-on", included: false },
      { text: "Personal concierge", included: false }
    ],
    bg: "bg-muted/20",
    BG: BGComponent1
  },
  {
    key: "starter",
    label: "Starter",
    price: "9",
    desc: "The essentials to start dressing smarter",
    features: [
      "AI outfit suggestions — 10 per day",
      "Basic color analysis",
      "Closet digitization — up to 50 items",
      "Daily outfit of the day",
      { text: "Style DNA deep analysis", included: false },
      { text: "Weekly capsule wardrobes", included: false },
      { text: "Virtual try-on", included: false },
      { text: "Personal concierge", included: false }
    ],
    bg: "bg-muted/30",
    BG: BGComponent1
  },
  {
    key: "pro",
    label: "Pro",
    price: "29",
    desc: "Full AI styling arsenal — no limits on your closet",
    features: [
      "Unlimited AI outfit suggestions",
      "Full color & style DNA analysis",
      "Unlimited closet items",
      "Weekly capsule wardrobes",
      "Priority AI stylist chat",
      "Outfit calendar & planning",
      { text: "Virtual try-on", included: false },
      { text: "Personal concierge", included: false }
    ],
    bg: "bg-foreground/5",
    BG: BGComponent2
  },
  {
    key: "elite",
    label: "Elite",
    price: "99",
    desc: "White-glove styling — your AI concierge handles everything",
    features: [
      "Everything in Pro, plus:",
      "Virtual try-on technology",
      "Personal style concierge",
      "Trend intelligence reports",
      "Shopping recommendations",
      "Wardrobe gap analysis",
      "Monthly style report",
      "Priority support"
    ],
    bg: "bg-foreground/10",
    BG: BGComponent3
  }
];
const Paywall = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTier, setSelectedTier] = reactExports.useState("pro");
  const [restoring, setRestoring] = reactExports.useState(false);
  reactExports.useState(() => {
    trackEvent("InitiateCheckout", { content_name: "LEXOR® Paywall View" });
  });
  const grantAccess = reactExports.useCallback((tier) => {
    if (user) {
      queryClient.setQueryData(["subscription-check", user.id], true);
    }
  }, [user, queryClient]);
  const handlePayPalApprove = reactExports.useCallback(
    async (subscriptionId, tier) => {
      if (!user) {
        navigate("/auth");
        return;
      }
      try {
        const { error } = await supabase.from("subscriptions").insert({
          user_id: user.id,
          paypal_subscription_id: subscriptionId,
          plan_tier: tier,
          status: "active"
        });
        if (error) throw error;
        const eventParams = { value: tier === "starter" ? 9 : tier === "pro" ? 29 : 99, currency: "USD", content_name: `LEXOR® ${tier}`, content_ids: [`lexor_${tier}`], content_type: "product", num_items: 1 };
        trackEvent("Subscribe", eventParams);
        trackEvent("Purchase", eventParams);
        localStorage.setItem("luxor_paid", tier);
        grantAccess(tier);
        toast.success("Welcome to Lexor! Your style journey begins now.");
        navigate("/dashboard");
      } catch {
        toast.error("Something went wrong saving your subscription.");
      }
    },
    [user, navigate, grantAccess]
  );
  const handleRestore = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setRestoring(true);
    try {
      const { data } = await supabase.from("subscriptions").select("id").eq("user_id", user.id).eq("status", "active").limit(1).maybeSingle();
      if (data) {
        const { data: subData } = await supabase.from("subscriptions").select("plan_tier").eq("user_id", user.id).eq("status", "active").limit(1).maybeSingle();
        const restoredTier = (subData == null ? void 0 : subData.plan_tier) || "starter";
        localStorage.setItem("luxor_paid", restoredTier);
        grantAccess(restoredTier);
        toast.success("Purchase restored! Welcome back to Lexor.");
        navigate("/dashboard");
      } else {
        toast.info("No previous purchase found for this account.");
      }
    } catch {
      toast.error("Could not verify purchase. Please try again.");
    } finally {
      setRestoring(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background dark flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky top-0 z-20 bg-background/80 backdrop-blur-lg px-4 py-3 flex items-center justify-center border-b border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display font-bold text-foreground text-lg tracking-wide gold-text", children: "LEXOR®" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 px-5 pb-10 overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, className: "text-center pt-8 pb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-2xl gold-gradient mx-auto mb-4 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "w-8 h-8 text-primary-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl md:text-3xl font-bold text-foreground mb-2", children: "Your Style Awaits" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans text-sm leading-relaxed max-w-xs mx-auto", children: "Choose a plan to unlock the full Lexor experience." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { y: 24, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { delay: 0.15 },
          className: "flex flex-col items-center gap-6 mb-8",
          children: tiers.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: t.isFree ? "relative" : "", children: [
            t.isFree && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-3 left-1/2 -translate-x-1/2 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-3 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest border border-dashed border-foreground/20 bg-background text-muted-foreground", children: "FREE" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: t.isFree ? "border border-dashed border-foreground/15 rounded-2xl" : "", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              SquishyPricingCard,
              {
                label: t.label,
                monthlyPrice: t.price,
                description: t.desc,
                features: t.features,
                background: t.bg,
                popular: t.key === "pro",
                BGComponent: t.BG,
                footer: t.isFree ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => {
                      localStorage.setItem("luxor_paid", "free");
                      grantAccess("free");
                      navigate("/dashboard");
                    },
                    className: "w-full h-10 rounded-lg border border-foreground/20 text-foreground font-sans font-semibold text-sm hover:bg-foreground/5 transition-colors",
                    children: "Start Free"
                  }
                ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "w-full",
                    onClick: () => {
                      setSelectedTier(t.key);
                      trackEvent("AddToCart", { content_name: `LEXOR® ${t.label}`, content_ids: [`lexor_${t.key}`], content_type: "product", value: parseFloat(t.price), currency: "USD" });
                    },
                    onFocus: () => setSelectedTier(t.key),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      PayPalButton,
                      {
                        tier: t.key,
                        onApprove: (subId) => handlePayPalApprove(subId, t.key)
                      }
                    )
                  }
                )
              }
            ) })
          ] }, t.key))
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { y: 20, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { delay: 0.3 },
          className: "flex items-center justify-center gap-6 text-muted-foreground mb-6",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs font-sans", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-3.5 h-3.5 text-primary" }),
              "30-day money-back"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs font-sans", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3.5 h-3.5 text-primary" }),
              "Cancel anytime"
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { y: 16, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { delay: 0.4 },
          className: "flex items-center justify-center gap-2 flex-wrap mb-4",
          children: [
            { src: "/payments/card1.svg", alt: "Visa" },
            { src: "/payments/card2.svg", alt: "Mastercard" },
            { src: "/payments/card3.svg", alt: "Amex" },
            { src: "/payments/card4.svg", alt: "Discover" },
            { src: "/payments/wallet1.svg", alt: "Apple Pay" },
            { src: "/payments/wallet2.svg", alt: "Google Pay" },
            { src: "/payments/wallet3.svg", alt: "PayPal" }
          ].map((icon) => /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: icon.src, alt: icon.alt, className: "h-7 w-auto" }, icon.alt))
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-[10px] text-muted-foreground/60 font-sans mb-4", children: "Secure payment processing via PayPal. Your data is encrypted." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.5 }, className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: handleRestore,
          disabled: restoring,
          className: "flex items-center gap-1.5 text-xs font-sans text-muted-foreground hover:text-primary transition-colors active:scale-95",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: `w-3.5 h-3.5 ${restoring ? "animate-spin" : ""}` }),
            "Restore previous purchase"
          ]
        }
      ) })
    ] })
  ] });
};
export {
  Paywall as default
};
