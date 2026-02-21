import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Crown, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const tiers = [
  {
    name: "Free",
    price: "€0",
    period: "forever",
    description: "Get started with AI styling",
    features: ["50 closet items", "1 daily outfit", "Basic style quiz", "Community access"],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "€19",
    period: "/month",
    description: "For the style-conscious",
    features: ["Unlimited closet items", "Unlimited AI outfits", "Full Style DNA profile", "AI Stylist Chat", "Wardrobe analytics", "Smart shopping AI"],
    cta: "Go Pro",
    highlighted: true,
  },
  {
    name: "Elite",
    price: "€99",
    period: "/month",
    description: "The ultimate style experience",
    features: ["Everything in Pro", "Priority AI processing", "Human stylist overlay", "Luxury brand partnerships", "Exclusive style reports", "VIP support"],
    cta: "Join Elite",
    highlighted: false,
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const Pricing = () => {
  const navigate = useNavigate();

  return (
    <section className="py-32 px-4" id="pricing">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-primary font-sans font-semibold text-sm tracking-widest uppercase mb-4">Pricing</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            Invest in <span className="gold-text">Your Style</span>
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {tiers.map((tier) => (
            <motion.div
              key={tier.name}
              variants={itemVariants}
              className={`rounded-2xl p-8 relative hover:-translate-y-1 transition-transform duration-300 ${
                tier.highlighted ? "glass gold-glow border-primary/40" : "glass"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gold-gradient text-xs font-semibold text-primary-foreground flex items-center gap-1">
                  <Crown className="w-3 h-3" /> Most Popular
                </div>
              )}

              <h3 className="font-display text-2xl font-bold mb-1">{tier.name}</h3>
              <p className="text-sm text-muted-foreground font-sans mb-6">{tier.description}</p>

              <div className="mb-8">
                <span className="font-display text-4xl font-bold">{tier.price}</span>
                <span className="text-muted-foreground font-sans text-sm">{tier.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm font-sans">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => navigate("/auth")}
                className={`w-full rounded-xl py-5 font-semibold ${
                  tier.highlighted
                    ? "gold-gradient text-primary-foreground hover:opacity-90"
                    : "bg-secondary hover:bg-secondary/80"
                }`}
              >
                {tier.highlighted && <Sparkles className="w-4 h-4 mr-1" />}
                {tier.cta}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
