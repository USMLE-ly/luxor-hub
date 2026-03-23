import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { trackEvent } from "@/lib/fbPixel";
import PayPalButton from "@/components/app/PayPalButton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCallback } from "react";
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
  features: (string | PricingFeature)[];
  bg: string;
  BG: React.FC;
  isFree?: boolean;
};

const tiers: Tier[] = [
  {
    key: "free" as const,
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
      { text: "Personal concierge", included: false },
    ],
    bg: "bg-muted/20",
    BG: BGComponent1,
  },
  {
    key: "starter" as const,
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
    key: "pro" as const,
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
    key: "elite" as const,
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

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
        localStorage.setItem("luxor_paid", "true");
        toast.success("Welcome to Lexor! Your style journey begins now.");
        navigate("/dashboard");
      } catch {
        toast.error("Something went wrong saving your subscription.");
      }
    },
    [user, navigate]
  );

  return (
    <section id="pricing" className="py-20 md:py-32 bg-muted/20">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-16"
        >
          <p className="font-sans text-sm font-semibold text-primary tracking-widest uppercase mb-3">Pricing</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            Choose <span className="gold-text">Your Plan</span>
          </h2>
          <p className="mt-4 max-w-lg mx-auto font-sans text-sm text-muted-foreground">
            Pays for itself in the first month.
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-6 justify-center items-center md:items-stretch">
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
                <div className="w-full">
                  <PayPalButton
                    tier={t.key}
                    onApprove={(subId) => handlePayPalApprove(subId, t.key)}
                  />
                </div>
              }
            />
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ delay: 0.3 }}
          className="mt-12 flex flex-col items-center gap-5"
        >
          <div className="flex items-center gap-3">
            {[
              { src: "/payments/visa.svg", alt: "Visa" },
              { src: "/payments/mastercard.svg", alt: "Mastercard" },
              { src: "/payments/amex.svg", alt: "American Express" },
              { src: "/payments/discover.svg", alt: "Discover" },
              { src: "/payments/klarna.svg", alt: "Klarna" },
              { src: "/payments/wechat.svg", alt: "WeChat Pay" },
              { src: "/payments/venmo.svg", alt: "Venmo" },
            ].map((icon) => (
              <img key={icon.alt} src={icon.src} alt={icon.alt} className="h-8 w-auto rounded-md" />
            ))}
          </div>
          <p className="text-xs font-sans text-muted-foreground flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary urgency-pulse" />
            This price won't last. <span className="font-medium text-foreground">237 founding spots</span> remain.
          </p>
          <div className="flex items-center gap-2 text-xs font-sans text-muted-foreground">
            <Shield className="w-4 h-4 text-primary" />
            <span>30-day money-back guarantee</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
