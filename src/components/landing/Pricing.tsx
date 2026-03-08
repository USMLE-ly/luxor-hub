import { motion } from "framer-motion";
import { Crown, Sparkles, Star } from "lucide-react";
import { CreativePricing, type PricingTier } from "@/components/ui/creative-pricing";

const tiers: PricingTier[] = [
  {
    name: "Starter",
    icon: <Star className="w-5 h-5" />,
    price: 9,
    yearlyPrice: 86,
    description: "Essential AI styling tools",
    color: "amber",
    features: ["200 closet items", "5 daily AI outfits", "Style DNA profile", "Community access", "Basic wardrobe analytics"],
  },
  {
    name: "Pro",
    icon: <Crown className="w-5 h-5" />,
    price: 29,
    yearlyPrice: 278,
    description: "For the style-conscious",
    color: "blue",
    features: ["Unlimited closet items", "Unlimited AI outfits", "Full Style DNA profile", "AI Stylist Chat", "Advanced wardrobe analytics", "Smart shopping AI", "Virtual Try-On", "Outfit calendar"],
    popular: true,
  },
  {
    name: "Elite",
    icon: <Sparkles className="w-5 h-5" />,
    price: 99,
    yearlyPrice: 950,
    description: "The ultimate style experience",
    color: "purple",
    features: ["Everything in Pro", "Priority AI processing", "Human stylist overlay", "Fashion Designer AI", "Luxury brand partnerships", "Exclusive style reports", "VIP support"],
  },
];

const Pricing = () => {
  return (
    <section className="relative py-32 px-4 overflow-hidden" id="pricing">
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url('/patterns/linear-texture.svg')`,
          backgroundSize: "400px 400px",
          backgroundRepeat: "repeat",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
      >
        <CreativePricing
          tag="Invest in Style"
          title="Choose Your Plan"
          description="From essential styling to elite personal service"
          tiers={tiers}
        />
      </motion.div>
    </section>
  );
};

export default Pricing;
