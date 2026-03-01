import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlanOption {
  id: string;
  label: string;
  sublabel: string;
  price: string;
  perWeek: string;
  badge?: string;
  popular?: boolean;
}

const plans: PlanOption[] = [
  {
    id: "12-weeks",
    label: "12 weeks",
    sublabel: "Try it out",
    price: "€9.99/week",
    perWeek: "€9.99",
  },
  {
    id: "welcome",
    label: "Welcome offer",
    sublabel: "Best value",
    price: "€6.99/week",
    perWeek: "€6.99",
    badge: "-30%",
    popular: true,
  },
  {
    id: "annual",
    label: "Annual",
    sublabel: "Most savings",
    price: "€4.99/week",
    perWeek: "€4.99",
    badge: "-50%",
  },
];

const features = [
  "Unlimited AI outfit suggestions",
  "Full color palette & analysis",
  "Personalized style calibration",
  "Closet digitization & management",
  "Weekly style challenges",
  "Priority AI stylist chat",
];

const Paywall = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("welcome");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="font-sans font-semibold text-foreground text-sm">Choose your plan</h1>
        <button onClick={() => navigate(-1)}>
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <div className="px-5 pb-10 space-y-6">
        {/* Hero */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center pt-2 pb-2"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 mx-auto mb-4 flex items-center justify-center">
            <Star className="w-8 h-8 text-primary" fill="currentColor" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Unlock Your Full Style Potential
          </h2>
          <p className="text-muted-foreground font-sans text-sm leading-relaxed max-w-xs mx-auto">
            Get personalized recommendations, unlimited AI styling, and a complete wardrobe experience.
          </p>
        </motion.div>

        {/* Plan Options */}
        <div className="space-y-3">
          {plans.map((plan, i) => (
            <motion.button
              key={plan.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelected(plan.id)}
              className={`w-full rounded-2xl border-2 p-4 text-left transition-all relative ${
                selected === plan.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Radio */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selected === plan.id
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    }`}
                  >
                    {selected === plan.id && (
                      <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-sans font-semibold text-foreground">{plan.label}</span>
                      {plan.badge && (
                        <span className="text-[10px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground font-sans">{plan.sublabel}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-sans font-bold text-foreground">{plan.perWeek}</span>
                  <span className="text-xs text-muted-foreground font-sans block">per week</span>
                </div>
              </div>
              {plan.popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-0.5 rounded-full">
                  MOST POPULAR
                </div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Features */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-card border border-border p-5 space-y-3"
        >
          <h3 className="font-sans font-semibold text-foreground text-sm">What's included</h3>
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span className="text-sm text-foreground font-sans">{feature}</span>
            </div>
          ))}
        </motion.div>

        {/* Testimonial */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-card border border-border p-5"
        >
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-4 h-4 text-primary" fill="currentColor" />
            ))}
          </div>
          <p className="text-sm text-foreground font-sans leading-relaxed mb-3">
            "Style DNA completely transformed how I dress. The color analysis was spot on and the AI 
            suggestions save me so much time every morning. Worth every cent!"
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">SC</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground font-sans">Sarah C.</p>
              <p className="text-xs text-muted-foreground font-sans">Member since 2025</p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <Button
            className="w-full h-14 rounded-2xl text-base font-sans font-semibold gold-gradient text-primary-foreground"
            onClick={() => navigate("/dashboard")}
          >
            Start Free Trial
          </Button>
          <p className="text-center text-xs text-muted-foreground font-sans">
            Cancel anytime. No commitment required.
          </p>
        </motion.div>

        {/* Rating Bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-2 pt-2"
        >
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-3.5 h-3.5 text-primary" fill="currentColor" />
            ))}
          </div>
          <span className="text-xs text-muted-foreground font-sans">
            4.9 · 12,400+ reviews
          </span>
        </motion.div>
      </div>
    </div>
  );
};

export default Paywall;
