import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PricingInteraction } from "@/components/ui/pricing-interaction";
import { useState } from "react";

const tiers = [
  {
    name: "Starter",
    price: "$9",
    period: "/month",
    description: "Essential AI styling tools",
    features: ["200 closet items", "Daily outfit suggestions", "Basic color analysis", "Closet scanner", "Community access"],
    cta: "Start Now",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "Unlock your full style potential",
    features: [
      "Unlimited closet items",
      "AI Stylist Chat",
      "Advanced Style DNA",
      "Shopping recommendations",
      "Outfit calendar",
      "Priority AI processing",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Elite",
    price: "$99",
    period: "/month",
    description: "Full concierge-level styling",
    features: [
      "Everything in Pro",
      "Virtual try-on",
      "Trend intelligence",
      "Fashion design studio",
      "Personal style reports",
      "1-on-1 AI consultations",
    ],
    cta: "Go Elite",
    highlighted: false,
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const [hoveredTier, setHoveredTier] = useState<number | null>(null);

  return (
    <section id="pricing" className="py-16 md:py-24 bg-muted/20">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-16"
        >
          <p className="font-sans text-sm font-semibold text-primary tracking-widest uppercase mb-3">Pricing</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            Invest in Your <span className="gold-text">Best Self</span>
          </h2>
          <p className="mt-4 max-w-lg mx-auto font-sans text-sm text-muted-foreground">
            Choose the plan that fits your style journey. No free tier — because your style deserves real investment.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="flex justify-center"
          >
            <PricingInteraction
              starterMonth={9}
              starterAnnual={7}
              proMonth={29}
              proAnnual={23}
              eliteMonth={99}
              eliteAnnual={79}
              onGetStarted={() => navigate("/auth")}
            />
          </motion.div>

          <div className="grid gap-6">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.12 }}
                className={`relative rounded-2xl p-6 premium-card transition-opacity duration-300 ${
                  tier.highlighted
                    ? "glass-strong border-primary/30 shadow-[0_0_30px_-8px_hsl(var(--primary)/0.2)]"
                    : "glass"
                } ${hoveredTier !== null && hoveredTier !== i ? "opacity-60" : "opacity-100"}`}
                onMouseEnter={() => setHoveredTier(i)}
                onMouseLeave={() => setHoveredTier(null)}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-6 px-4 py-1 rounded-full gold-gradient text-xs font-bold text-primary-foreground font-sans flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Most Popular
                  </div>
                )}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground">{tier.name}</h3>
                    <p className="font-sans text-xs text-muted-foreground">{tier.description}</p>
                  </div>
                  <p className="font-display text-2xl font-bold text-foreground">
                    {tier.price}
                    <span className="text-sm font-sans font-normal text-muted-foreground">{tier.period}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tier.features.map((f) => (
                    <span key={f} className="inline-flex items-center gap-1 text-xs font-sans text-foreground bg-muted/50 px-2 py-1 rounded-full">
                      <Check className="w-3 h-3 text-primary shrink-0" />
                      {f}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
