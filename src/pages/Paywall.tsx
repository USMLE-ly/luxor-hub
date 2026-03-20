import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Check, Shield, Clock, RotateCcw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PayPalButton from "@/components/app/PayPalButton";
import {
  SquishyPricingCard,
  BGComponent1,
  BGComponent2,
  BGComponent3,
} from "@/components/ui/squishy-pricing";

const features = [
  "Unlimited AI outfit suggestions",
  "Full color & style DNA analysis",
  "Smart closet digitization",
  "Weekly capsule wardrobes",
  "Virtual try-on technology",
  "Priority AI stylist chat",
];

const Paywall = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = useState<"starter" | "pro" | "elite">("pro");
  const [restoring, setRestoring] = useState(false);

  const handlePayPalApprove = useCallback(
    async (subscriptionId: string) => {
      if (!user) {
        navigate("/auth");
        return;
      }
      try {
        const { error } = await supabase.from("subscriptions").insert({
          user_id: user.id,
          paypal_subscription_id: subscriptionId,
          plan_tier: selectedTier,
          status: "active",
        });
        if (error) throw error;
        localStorage.setItem("luxor_paid", "true");
        toast.success("Welcome to Luxor! Your style journey begins now.");
        navigate("/dashboard");
      } catch {
        toast.error("Something went wrong saving your subscription.");
      }
    },
    [user, selectedTier, navigate]
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
        toast.success("Purchase restored! Welcome back to Luxor.");
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

  const tiers: { key: "starter" | "pro" | "elite"; label: string; price: string; desc: string; bg: string; BG: React.FC }[] = [
    { key: "starter", label: "Starter", price: "9", desc: "Essential AI styling tools", bg: "bg-[hsl(43,74%,35%)]", BG: BGComponent1 },
    { key: "pro", label: "Pro", price: "29", desc: "Unlock your full style potential", bg: "bg-[hsl(43,74%,49%)]", BG: BGComponent2 },
    { key: "elite", label: "Elite", price: "99", desc: "Full concierge-level styling", bg: "bg-[hsl(35,80%,42%)]", BG: BGComponent3 },
  ];

  return (
    <div className="min-h-screen bg-background dark flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg px-4 py-3 flex items-center justify-center border-b border-border/50">
        <h1 className="font-display font-bold text-foreground text-lg tracking-wide gold-text">LUXOR</h1>
      </div>

      <div className="flex-1 px-5 pb-10 overflow-y-auto">
        {/* Hero */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center pt-8 pb-6">
          <div className="w-16 h-16 rounded-2xl gold-gradient mx-auto mb-4 flex items-center justify-center">
            <Crown className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Your Style Awaits</h2>
          <p className="text-muted-foreground font-sans text-sm leading-relaxed max-w-xs mx-auto">
            Choose a plan to unlock the full Luxor experience. AI-powered styling, just for you.
          </p>
        </motion.div>

        {/* Squishy Pricing Cards with PayPal */}
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
              cta=""
              background={t.bg}
              BGComponent={t.BG}
              onCtaClick={() => setSelectedTier(t.key)}
              footer={
                <div
                  className="w-full"
                  onClick={() => setSelectedTier(t.key)}
                  onFocus={() => setSelectedTier(t.key)}
                >
                  <PayPalButton tier={t.key} onApprove={handlePayPalApprove} />
                </div>
              }
            />
          ))}
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-card border border-border p-5 space-y-3 mb-6"
        >
          <h3 className="font-sans font-semibold text-foreground text-sm">Every plan includes</h3>
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span className="text-sm text-foreground font-sans">{feature}</span>
            </div>
          ))}
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
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

        {/* Payment icons */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45 }}
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

        {/* Restore Purchase */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="flex justify-center">
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
