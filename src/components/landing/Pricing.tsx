import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Shield, ChevronDown, Check, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { trackEvent } from "@/lib/fbPixel";
import PayPalButton from "@/components/app/PayPalButton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCallback } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
      { text: "Personal concierge", included: false },
    ],
    bg: "bg-muted/20",
    BG: BGComponent1,
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
      { text: "Personal concierge", included: false },
    ],
    bg: "bg-muted/30",
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
    bg: "bg-foreground/5",
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
    bg: "bg-foreground/10",
    BG: BGComponent3,
  },
];

// Comparison table data
const comparisonCategories = [
  {
    name: "AI Styling",
    features: [
      { label: "AI outfit suggestions", free: "3/day", starter: "10/day", pro: "Unlimited", elite: "Unlimited" },
      { label: "Style DNA analysis", free: "Basic", starter: "Basic", pro: "Full", elite: "Full" },
      { label: "Color analysis", free: false, starter: true, pro: true, elite: true },
      { label: "AI stylist chat", free: false, starter: false, pro: "Priority", elite: "Priority" },
    ],
  },
  {
    name: "Wardrobe",
    features: [
      { label: "Closet items", free: "15", starter: "50", pro: "Unlimited", elite: "Unlimited" },
      { label: "Capsule wardrobes", free: false, starter: false, pro: true, elite: true },
      { label: "Outfit calendar", free: false, starter: false, pro: true, elite: true },
      { label: "Wardrobe gap analysis", free: false, starter: false, pro: false, elite: true },
    ],
  },
  {
    name: "Premium",
    features: [
      { label: "Virtual try-on", free: false, starter: false, pro: false, elite: true },
      { label: "Personal concierge", free: false, starter: false, pro: false, elite: true },
      { label: "Trend intelligence", free: false, starter: false, pro: false, elite: true },
      { label: "Shopping recommendations", free: false, starter: false, pro: false, elite: true },
      { label: "Monthly style report", free: false, starter: false, pro: false, elite: true },
    ],
  },
  {
    name: "Support",
    features: [
      { label: "Priority support", free: false, starter: false, pro: false, elite: true },
    ],
  },
];

const CellValue = ({ value }: { value: boolean | string }) => {
  if (value === true) return <Check className="w-4 h-4 text-foreground mx-auto" />;
  if (value === false) return <Minus className="w-4 h-4 text-muted-foreground/40 mx-auto" />;
  return <span className="text-xs font-sans text-foreground">{value}</span>;
};

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [compareOpen, setCompareOpen] = useState(false);

  const grantAccess = useCallback(() => {
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
        localStorage.setItem("luxor_paid", "true");
        grantAccess();
        toast.success("Welcome to Lexor! Your style journey begins now.");
        navigate("/dashboard");
      } catch {
        toast.error("Something went wrong saving your subscription.");
      }
    },
    [user, navigate, grantAccess]
  );

  return (
    <section id="pricing" className="py-20 md:py-32 bg-background">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-16"
        >
          <p className="font-sans text-sm font-semibold text-muted-foreground tracking-widest uppercase mb-3">Pricing</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            Choose Your Plan
          </h2>
          <p className="mt-4 max-w-lg mx-auto font-sans text-sm text-muted-foreground">
            Pays for itself in the first month.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 justify-center items-stretch">
          {tiers.map((t) => (
            <div key={t.key} className={t.isFree ? "relative" : ""}>
              {t.isFree && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="px-3 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest border border-dashed border-foreground/20 bg-background text-muted-foreground">
                    FREE
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
                        onClick={() => navigate("/auth")}
                        className="w-full h-10 rounded-lg border border-foreground/20 text-foreground font-sans font-semibold text-sm hover:bg-foreground/5 transition-colors"
                      >
                        Start Free
                      </button>
                    ) : (
                      <div className="w-full">
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
        </div>

        {/* Compare All Features */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ delay: 0.2 }}
          className="mt-12"
        >
          <Collapsible open={compareOpen} onOpenChange={setCompareOpen}>
            <CollapsibleTrigger className="mx-auto flex items-center gap-2 text-sm font-sans font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <span>Compare All Features</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${compareOpen ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-8 overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm font-sans">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium w-[200px]">Feature</th>
                      <th className="text-center py-3 px-2 text-muted-foreground font-medium">Free</th>
                      <th className="text-center py-3 px-2 text-muted-foreground font-medium">Starter</th>
                      <th className="text-center py-3 px-2 font-semibold text-foreground">Pro</th>
                      <th className="text-center py-3 px-2 text-muted-foreground font-medium">Elite</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonCategories.map((cat) => (
                      <>
                        <tr key={cat.name}>
                          <td colSpan={5} className="pt-5 pb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                            {cat.name}
                          </td>
                        </tr>
                        {cat.features.map((f) => (
                          <tr key={f.label} className="border-b border-border/50">
                            <td className="py-2.5 px-2 text-foreground">{f.label}</td>
                            <td className="py-2.5 px-2 text-center"><CellValue value={f.free} /></td>
                            <td className="py-2.5 px-2 text-center"><CellValue value={f.starter} /></td>
                            <td className="py-2.5 px-2 text-center"><CellValue value={f.pro} /></td>
                            <td className="py-2.5 px-2 text-center"><CellValue value={f.elite} /></td>
                          </tr>
                        ))}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </motion.div>

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
          <p className="text-xs font-sans text-muted-foreground">
            Cancel anytime. No hidden fees.
          </p>
          <div className="flex items-center gap-2 text-xs font-sans text-muted-foreground">
            <Shield className="w-4 h-4 text-foreground" />
            <span>30-day money-back guarantee</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
