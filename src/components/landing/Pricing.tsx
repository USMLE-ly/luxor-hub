import { motion } from "framer-motion";
import { Crown, Sparkles, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CreativePricing, type PricingTier } from "@/components/ui/creative-pricing";

const tiers: PricingTier[] = [
  {
    name: "Free",
    icon: <Star className="w-6 h-6" />,
    price: 0,
    description: "Get started with AI styling",
    color: "amber",
    features: ["50 closet items", "1 daily outfit", "Basic style quiz", "Community access"],
  },
  {
    name: "Pro",
    icon: <Crown className="w-6 h-6" />,
    price: 19,
    description: "For the style-conscious",
    color: "blue",
    features: ["Unlimited closet items", "Unlimited AI outfits", "Full Style DNA profile", "AI Stylist Chat", "Wardrobe analytics", "Smart shopping AI"],
    popular: true,
  },
  {
    name: "Elite",
    icon: <Sparkles className="w-6 h-6" />,
    price: 99,
    description: "The ultimate style experience",
    color: "purple",
    features: ["Everything in Pro", "Priority AI processing", "Human stylist overlay", "Luxury brand partnerships", "Exclusive style reports", "VIP support"],
  },
];

const Pricing = () => {
  return (
    <section className="relative py-32 px-4 overflow-hidden" id="pricing">
      {/* SVG pattern background */}
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url('/patterns/linear-texture.svg')`,
          backgroundSize: "400px 400px",
          backgroundRepeat: "repeat",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
      >
        <CreativePricing
          tag="Invest in Style"
          title="Choose Your Plan"
          description="From free styling to elite personal service"
          tiers={tiers}
        />
      </motion.div>
    </section>
  );
};

export default Pricing;
