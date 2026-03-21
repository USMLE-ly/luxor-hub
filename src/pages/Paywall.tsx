import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Shield, Clock, RotateCcw } from "lucide-react";
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
  key: "starter" | "pro" | "elite";
  label: string;
  price: string;
  desc: string;
  features: (string | PricingFeature)[];
  bg: string;
  BG: React.FC;
};

const tiers: Tier[] = [
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
      { text: "Personal concierge", included: false },
    ],
    bg: "bg-[hsl(43,74%,35%)]",
    BG: BGComponent1,
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
      { text: "Personal concierge", included: false },
    ],
    bg: "bg-[hsl(43,74%,49%)]",
    BG: BGComponent2,
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
      "Priority support",
    ],
    bg: "bg-[hsl(35,80%,42%)]",
    BG: BGComponent3,
  },
];

const Paywall = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = useState<"starter" | "pro" | "elite">("pro");
  const [restoring, setRestoring] = useState(false);

  // Track paywall view
  useState(() => {
    trackEvent("InitiateCheckout", { content_name: "LEXOR® Paywall View" });
  });

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
        const eventParams = { value: tier === "starter" ? 9.00 : tier === "pro" ? 29.00 : 99.00, currency: "USD", content_name: `LEXOR® ${tier}`, content_ids: [`lexor_${tier}`], content_type: "product", num_items: 1 };
        trackEvent("Subscribe", eventParams);
        trackEvent("Purchase", eventParams);
        localStorage.setItem("luxor_paid", "true");
        toast.success("Welcome to Lexor! Your style journey begins now.");
        navigate("/dashboard");
      } catch {
        toast.error("Something went wrong saving your subscription.");
      }
    },
    [user, navigate]
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
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();
      if (data) {
        localStorage.setItem("luxor_paid", "true");
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

  return (
    <div className="min-h-screen bg-background dark flex flex-col">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg px-4 py-3 flex items-center justify-center border-b border-border/50">
        <h1 className="font-display font-bold text-foreground text-lg tracking-wide gold-text">LEXOR®</h1>
      </div>

      <div className="flex-1 px-5 pb-10 overflow-y-auto">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center pt-8 pb-6">
          <div className="w-16 h-16 rounded-2xl gold-gradient mx-auto mb-4 flex items-center justify-center">
            <Crown className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Your Style Awaits</h2>
          <p className="text-muted-foreground font-sans text-sm leading-relaxed max-w-xs mx-auto">
            Choose a plan to unlock the full Lexor experience.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col items-center gap-6 mb-8"
        >
          {tiers.map((t) => (
            <SquishyPricingCard
              key={t.key}
              label={t.label}
              monthlyPrice={t.price}
              description={t.desc}
              features={t.features}
              background={t.bg}
              popular={t.key === "pro"}
              BGComponent={t.BG}
              footer={
                <div
                  className="w-full"
                  onClick={() => {
                    setSelectedTier(t.key);
                    trackEvent("AddToCart", { content_name: `LEXOR® ${t.label}`, content_ids: [`lexor_${t.key}`], content_type: "product", value: parseFloat(t.price), currency: "USD" });
                  }}
                  onFocus={() => setSelectedTier(t.key)}
                >
                  <PayPalButton
                    tier={t.key}
                    onApprove={(subId) => handlePayPalApprove(subId, t.key)}
                  />
                </div>
              }
            />
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
            <RotateCcw className={`w-3.5 h-3.5 ${restoring ? "animate-spin" : ""}`} />
            Restore previous purchase
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Paywall;
