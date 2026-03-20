import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Check, Shield, Clock, RotateCcw } from "lucide-react";
import { PricingInteraction } from "@/components/ui/pricing-interaction";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [activating, setActivating] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const handleGetStarted = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setActivating(true);
    try {
      // For now, mark the user as "paid" by setting a flag in style_profiles
      const { error } = await supabase
        .from("style_profiles")
        .update({ style_score: 1 } as any)
        .eq("user_id", user.id);

      if (error) throw error;

      // Store paid status locally for immediate gate check
      localStorage.setItem("luxor_paid", "true");
      toast.success("Welcome to Luxor! Your style journey begins now.");
      navigate("/dashboard");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setActivating(false);
    }
  };

  const handleRestore = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setRestoring(true);
    try {
      // Check if user previously had a paid status
      const { data } = await supabase
        .from("style_profiles")
        .select("style_score")
        .eq("user_id", user.id)
        .single();

      if (data?.style_score && data.style_score >= 1) {
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
        <h1 className="font-display font-bold text-foreground text-lg tracking-wide gold-text">
          LUXOR
        </h1>
      </div>

      <div className="flex-1 px-5 pb-10 overflow-y-auto">
        {/* Hero */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center pt-8 pb-6"
        >
          <div className="w-16 h-16 rounded-2xl gold-gradient mx-auto mb-4 flex items-center justify-center">
            <Crown className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            Your Style Awaits
          </h2>
          <p className="text-muted-foreground font-sans text-sm leading-relaxed max-w-xs mx-auto">
            Choose a plan to unlock the full Luxor experience. AI-powered styling, just for you.
          </p>
        </motion.div>

        {/* Pricing Card */}
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex justify-center mb-8"
        >
          <PricingInteraction
            starterMonth={9}
            starterAnnual={7}
            proMonth={29}
            proAnnual={23}
            eliteMonth={99}
            eliteAnnual={79}
            onGetStarted={handleGetStarted}
          />
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
          className="flex items-center justify-center gap-3 mb-4"
        >
          {[
            { src: "/payments/visa.svg", alt: "Visa" },
            { src: "/payments/mastercard.svg", alt: "Mastercard" },
            { src: "/payments/amex.svg", alt: "Amex" },
            { src: "/payments/discover.svg", alt: "Discover" },
          ].map((icon) => (
            <img key={icon.alt} src={icon.src} alt={icon.alt} className="h-7 w-auto rounded" />
          ))}
        </motion.div>

        <p className="text-center text-[10px] text-muted-foreground/60 font-sans mb-4">
          Secure payment processing. Your data is encrypted.
        </p>

        {/* Restore Purchase */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="flex justify-center"
        >
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
