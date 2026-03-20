import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Shield, Clock, RotateCcw } from "lucide-react";
import { PricingCard, PricingCardProps } from "@/components/ui/animated-glassy-pricing";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PayPalButton from "@/components/app/PayPalButton";

const tiers: (PricingCardProps & { tierKey: "starter" | "pro" | "elite" })[] = [
  {
    tierKey: "starter",
    planName: "Starter",
    description: "Essential AI styling tools",
    price: "9",
    features: ["200 closet items", "Daily outfit suggestions", "Basic color analysis", "Closet scanner"],
    buttonText: "Subscribe",
    buttonVariant: "secondary",
  },
  {
    tierKey: "pro",
    planName: "Pro",
    description: "Unlock your full style potential",
    price: "29",
    features: ["Unlimited closet items", "AI Stylist Chat", "Advanced Style DNA", "Shopping recs", "Outfit calendar"],
    buttonText: "Subscribe",
    isPopular: true,
    buttonVariant: "primary",
  },
  {
    tierKey: "elite",
    planName: "Elite",
    description: "Full concierge-level styling",
    price: "99",
    features: ["Everything in Pro", "Virtual try-on", "Trend intelligence", "Fashion design studio", "1-on-1 AI"],
    buttonText: "Subscribe",
    buttonVariant: "primary",
  },
];

const Paywall = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [restoring, setRestoring] = useState(false);

  const handlePayPalApprove = useCallback(async (subscriptionId: string, tier: string) => {
    if (!user) { navigate("/auth"); return; }
    try {
      const { error } = await supabase.from("subscriptions").insert({
        user_id: user.id,
        paypal_subscription_id: subscriptionId,
        plan_tier: tier,
        status: "active",
      });
      if (error) throw error;
      localStorage.setItem("luxor_paid", "true");
      toast.success("Welcome to Luxor! Your style journey begins now.");
      navigate("/dashboard");
    } catch {
      toast.error("Something went wrong saving your subscription.");
    }
  }, [user, navigate]);

  const handleRestore = async () => {
    if (!user) { navigate("/auth"); return; }
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

  return (
    <div className="min-h-screen bg-background dark flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg px-4 py-3 flex items-center justify-center border-b border-border/50">
        <h1 className="font-display font-bold text-foreground text-lg tracking-wide gold-text">LUXOR</h1>
      </div>

      <div className="flex-1 px-4 pb-10 overflow-y-auto">
        {/* Hero */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center pt-8 pb-6">
          <div className="w-16 h-16 rounded-2xl gold-gradient mx-auto mb-4 flex items-center justify-center">
            <Crown className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Your Style Awaits</h2>
          <p className="text-muted-foreground font-sans text-sm leading-relaxed max-w-xs mx-auto">
            Choose a plan to unlock the full Luxor experience.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col md:flex-row gap-6 justify-center items-center md:items-stretch mb-8"
        >
          {tiers.map((tier) => (
            <PricingCard
              key={tier.tierKey}
              {...tier}
              footer={
                <div className="w-full mt-4">
                  <PayPalButton tier={tier.tierKey} onApprove={(subId) => handlePayPalApprove(subId, tier.tierKey)} />
                </div>
              }
            />
          ))}
        </motion.div>

        {/* Trust badges */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="flex items-center justify-center gap-6 text-muted-foreground mb-6">
          <div className="flex items-center gap-1.5 text-xs font-sans">
            <Shield className="w-3.5 h-3.5 text-primary" /> 30-day money-back
          </div>
          <div className="flex items-center gap-1.5 text-xs font-sans">
            <Clock className="w-3.5 h-3.5 text-primary" /> Cancel anytime
          </div>
        </motion.div>

        {/* Payment icons */}
        <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.45 }} className="flex items-center justify-center gap-2 flex-wrap mb-4">
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
          <button onClick={handleRestore} disabled={restoring} className="flex items-center gap-1.5 text-xs font-sans text-muted-foreground hover:text-primary transition-colors active:scale-95">
            <RotateCcw className={`w-3.5 h-3.5 ${restoring ? "animate-spin" : ""}`} />
            Restore previous purchase
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Paywall;
