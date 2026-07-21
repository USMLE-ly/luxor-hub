import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Shield, Clock, ArrowCounterClockwise, Lightning } from "@phosphor-icons/react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { trackEvent } from "@/lib/fbPixel";
import PayPalButton from "@/components/app/PayPalButton";
import {
  SquishyPricingCard,
  BGComponent1,
  BGComponent2,
  BGComponent3,
} from "@/components/ui/squishy-pricing";
import type { PricingFeature } from "@/components/ui/squishy-pricing";

type Tier = {
  key: "free" | "starter" | "pro" | "elite";
  label: string;
  price: string;
  desc: string;
  credits: number;
  estimatedAnalyses: string;
  creditBreakdown: { action: string; cost: number }[];
  features: (string | PricingFeature)[];
  bg: string;
  BG: React.FC;
  isFree?: boolean;
};

const tiers: Tier[] = [
  {
    key: "free",
    label: "Free",
    price: "0",
    desc: "Explore LUXOR with starter credits",
    isFree: true,
    credits: 30,
    estimatedAnalyses: "~6 analyses/mo",
    creditBreakdown: [
      { action: "Outfit analysis", cost: 5 },
      { action: "Style analysis", cost: 3 },
      { action: "Outfit generation", cost: 4 },
    ],
    features: [
      "30 credits every month",
      "Up to 6 AI outfit analyses",
      "Closet digitization — up to 15 items",
      "Basic Style DNA snapshot",
      { text: "Color analysis", included: false },
      { text: "Capsule wardrobes", included: false },
      { text: "Virtual try-on", included: false },
      { text: "Personal concierge", included: false },
    ],
    bg: "bg-muted/20",
    BG: BGComponent1,
  },
  {
    key: "starter",
    label: "Starter",
    price: "9",
    desc: "More credits for smarter daily styling",
    credits: 200,
    estimatedAnalyses: "~40 analyses/mo",
    creditBreakdown: [
      { action: "Outfit analysis", cost: 5 },
      { action: "Style analysis", cost: 3 },
      { action: "Pro tweaks", cost: 8 },
    ],
    features: [
      "200 credits every month",
      "Up to 40 AI analyses",
      "Basic color analysis",
      "Closet digitization — up to 50 items",
      "Daily outfit of the day",
      { text: "Style DNA deep analysis", included: false },
      { text: "Weekly capsule wardrobes", included: false },
      { text: "Virtual try-on", included: false },
    ],
    bg: "bg-muted/30",
    BG: BGComponent1,
  },
  {
    key: "pro",
    label: "Pro",
    price: "29",
    desc: "Full AI styling arsenal with generous credits",
    credits: 1000,
    estimatedAnalyses: "~200 analyses/mo",
    creditBreakdown: [
      { action: "Outfit analysis", cost: 5 },
      { action: "Style analysis", cost: 3 },
      { action: "Outfit generation", cost: 4 },
      { action: "Capsule wardrobes", cost: 3 },
    ],
    features: [
      "1,000 credits every month",
      "Up to 200 AI analyses",
      "Full color & style DNA analysis",
      "Unlimited closet items",
      "Weekly capsule wardrobes",
      "Priority AI stylist chat",
      "Outfit calendar & planning",
      { text: "Virtual try-on", included: false },
    ],
    bg: "bg-foreground/5",
    BG: BGComponent2,
  },
  {
    key: "elite",
    label: "Elite",
    price: "99",
    desc: "Maximum credits — your AI concierge handles everything",
    credits: 5000,
    estimatedAnalyses: "~1,000 analyses/mo",
    creditBreakdown: [
      { action: "Everything in Pro", cost: 0 },
      { action: "Virtual try-on", cost: 0 },
      { action: "Personal concierge", cost: 0 },
    ],
    features: [
      "5,000 credits every month",
      "Up to 1,000 AI analyses",
      "Virtual try-on technology",
      "Personal style concierge",
      "Trend intelligence reports",
      "Shopping recommendations",
      "Wardrobe gap analysis",
      "Monthly style report",
    ],
    bg: "bg-foreground/10",
    BG: BGComponent3,
  },
];

const Paywall = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTier, setSelectedTier] = useState<"free" | "starter" | "pro" | "elite">("pro");
  const [restoring, setRestoring] = useState(false);

  useState(() => {
    trackEvent("InitiateCheckout", { content_name: "LUXOR® Paywall View" });
  });

  const grantAccess = useCallback((tier: string) => {
    if (user) {
      queryClient.setQueryData(["subscription-check", user.id], true);
    }
  }, [user, queryClient]);

  const handlePayPalApprove = useCallback(
    async (subscriptionId: string, tier: string) => {
      if (!user) {
        navigate("/auth");
        return;
      }
      try {
        const { error } = await supabase.from("subscriptions").insert({
          user_id: user.id,
          paypal_subscription_id: subscriptionId,
          plan_tier: tier,
          status: "active",
        });
        if (error) throw error;
        const eventParams = {
          value: tier === "starter" ? 9.00 : tier === "pro" ? 29.00 : 99.00,
          currency: "USD",
          content_name: `LUXOR® ${tier}`,
          content_ids: [`lexor_${tier}`],
          content_type: "product",
          num_items: 1,
        };
        trackEvent("Subscribe", eventParams);
        trackEvent("Purchase", eventParams);
        grantAccess(tier);
        toast.success("Welcome to LUXOR®! Your style journey begins now.");
        navigate("/closet");
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
      const { data } = await supabase
        .from("subscriptions")
        .select("plan_tier, status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();
      if (data) {
        grantAccess(data.plan_tier);
        toast.success("Subscription restored!");
        navigate("/closet");
      } else {
        toast.info("No active subscription found.");
      }
    } catch {
      toast.error("Could not restore subscription.");
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] via-[#0d2218] to-background flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-4">
            <Crown className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-sans font-semibold text-primary tracking-wider uppercase">
              Choose Your Plan
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-white mb-3">
            Unlock Your Style Potential
          </h1>
          <p className="text-muted-foreground font-sans text-sm leading-relaxed max-w-md mx-auto">
            Every AI action costs credits. Pick a plan that matches your styling ambitions.
          </p>
        </motion.div>

        {/* How Credits Work — Mini explainer */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.08 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-8 px-4 py-4 rounded-2xl border border-white/5 bg-white/[0.02]"
        >
          <div className="flex items-center gap-2 text-xs font-sans text-white/50">
            <Lightning className="w-4 h-4 text-primary" />
            <span className="text-white/70 font-semibold">How Credits Work</span>
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-[11px] font-sans text-white/40">
            <span className="px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.03]">
              Outfit analysis = 5 credits
            </span>
            <span className="px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.03]">
              Style analysis = 3 credits
            </span>
            <span className="px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.03]">
              Outfit generation = 4 credits
            </span>
            <span className="px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.03]">
              Pro tweak = 8 credits
            </span>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col items-center gap-6 mb-8"
        >
          {tiers.map((t) => (
            <div key={t.key} className={t.isFree ? "relative" : ""}>
              {t.isFree && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="px-3 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest border border-dashed border-foreground/20 bg-background text-muted-foreground">
                    FREE
                  </span>
                </div>
              )}
              {t.key === "pro" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="px-3 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest border border-primary/40 bg-primary/10 text-primary">
                    MOST POPULAR
                  </span>
                </div>
              )}
              <div className={t.isFree ? "border border-dashed border-foreground/15 rounded-2xl" : ""}>
                <SquishyPricingCard
                  label={t.label}
                  monthlyPrice={t.price}
                  description={t.desc}
                  features={t.features}
                  background={t.bg}
                  popular={t.key === "pro"}
                  BGComponent={t.BG}
                  footer={
                    t.isFree ? (
                      <button
                        onClick={() => {
                          grantAccess("free");
                          navigate("/closet");
                        }}
                        className="w-full h-10 rounded-lg border border-foreground/20 text-foreground font-sans font-semibold text-sm hover:bg-foreground/5 transition-colors"
                      >
                        Start Free
                      </button>
                    ) : (
                      <div
                        className="w-full"
                        onClick={() => {
                          setSelectedTier(t.key);
                          trackEvent("AddToCart", {
                            content_name: `LUXOR® ${t.label}`,
                            content_ids: [`lexor_${t.key}`],
                            content_type: "product",
                            value: parseFloat(t.price),
                            currency: "USD",
                          });
                        }}
                        onFocus={() => setSelectedTier(t.key)}
                      >
                        <PayPalButton
                          tier={t.key as "starter" | "pro" | "elite"}
                          onApprove={(subId) => handlePayPalApprove(subId, t.key)}
                        />
                      </div>
                    )
                  }
                />
              </div>
            </div>
          ))}
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-6 text-muted-foreground mb-6"
        >
          <div className="flex items-center gap-1.5 text-xs font-sans">
            <Shield className="w-3.5 h-3.5 text-primary" />
            30-day money-back
          </div>
          <div className="flex items-center gap-1.5 text-xs font-sans">
            <Clock className="w-3.5 h-3.5 text-primary" />
            Cancel anytime
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-2 flex-wrap mb-4"
        >
          {[
            { src: "/payments/card1.svg", alt: "Visa" },
            { src: "/payments/card2.svg", alt: "Mastercard" },
            { src: "/payments/card3.svg", alt: "Amex" },
            { src: "/payments/card4.svg", alt: "Discover" },
            { src: "/payments/wallet1.svg", alt: "Apple Pay" },
            { src: "/payments/wallet2.svg", alt: "Google Pay" },
            { src: "/payments/wallet3.svg", alt: "PayPal" },
          ].map((icon) => (
            <img key={icon.alt} src={icon.src} alt={icon.alt} className="h-7 w-auto" />
          ))}
        </motion.div>

        <p className="text-center text-[10px] text-muted-foreground/60 font-sans mb-4">
          Secure payment processing via PayPal. Your data is encrypted.
        </p>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex justify-center">
          <button
            onClick={handleRestore}
            disabled={restoring}
            className="flex items-center gap-1.5 text-xs font-sans text-muted-foreground hover:text-primary transition-colors active:scale-95"
          >
            <ArrowCounterClockwise className={`w-3.5 h-3.5 ${restoring ? "animate-spin" : ""}`} />
            Restore previous purchase
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Paywall;
