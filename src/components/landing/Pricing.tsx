import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with basic styling",
    features: ["5 outfit suggestions / week", "Closet scanner (20 items)", "Basic color analysis", "Community access"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/month",
    description: "Unlock your full style potential",
    features: [
      "Unlimited outfit suggestions",
      "Unlimited closet items",
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
    price: "$29",
    period: "/month",
    description: "For the fashion-obsessed",
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

  return (
    <section id="pricing" className="py-24 bg-muted/20">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="font-sans text-sm font-semibold text-primary tracking-widest uppercase mb-3">Pricing</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            Invest in Your <span className="gold-text">Best Self</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className={`relative rounded-2xl p-8 premium-card ${
                tier.highlighted
                  ? "glass-strong border-primary/30 shadow-[0_0_30px_-8px_hsl(var(--primary)/0.2)]"
                  : "glass"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gold-gradient text-xs font-bold text-primary-foreground font-sans flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Most Popular
                </div>
              )}
              <h3 className="font-display text-xl font-bold text-foreground">{tier.name}</h3>
              <p className="font-sans text-sm text-muted-foreground mt-1 mb-4">{tier.description}</p>
              <p className="font-display text-4xl font-bold text-foreground mb-1">
                {tier.price}
                <span className="text-base font-sans font-normal text-muted-foreground">{tier.period}</span>
              </p>
              <ul className="my-6 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm font-sans text-foreground">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate("/auth")}
                className={`w-full h-11 rounded-xl font-sans font-semibold text-sm tracking-wide transition-opacity hover:opacity-90 ${
                  tier.highlighted
                    ? "gold-gradient text-primary-foreground gold-glow"
                    : "border border-border text-foreground hover:border-primary/30"
                }`}
              >
                {tier.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
