import { motion } from "framer-motion";
import { Shirt, Brain, MessageSquare, BarChart3, ShoppingBag, Palette } from "lucide-react";
import { BentoGrid, type BentoItem } from "@/components/ui/bento-grid";

const featureItems: BentoItem[] = [
  {
    title: "AI Closet Scanner",
    meta: "Auto-detect",
    description: "Upload photos and let AI auto-detect category, color, style, season, and occasion for every item.",
    icon: <Shirt className="w-4 h-4 text-primary" />,
    status: "Smart",
    tags: ["Vision", "AI"],
    colSpan: 2,
    hasPersistentHover: true,
  },
  {
    title: "Style DNA Engine",
    meta: "Personalized",
    description: "Our AI builds your unique style profile — understanding your preferences, lifestyle, and fashion goals.",
    icon: <Brain className="w-4 h-4 text-primary" />,
    status: "Active",
    tags: ["Profile", "DNA"],
  },
  {
    title: "Smart Outfit Generator",
    meta: "Context-aware",
    description: "Context-aware outfits generated from YOUR closet, considering weather, events, and your mood.",
    icon: <Palette className="w-4 h-4 text-primary" />,
    status: "Live",
    tags: ["Weather", "Mood"],
    colSpan: 2,
  },
  {
    title: "AI Stylist Chat",
    meta: "24/7",
    description: "Ask your personal AI stylist anything. It knows your closet, body, and style DNA intimately.",
    icon: <MessageSquare className="w-4 h-4 text-primary" />,
    status: "New",
    tags: ["Chat", "AI"],
  },
  {
    title: "Wardrobe Analytics",
    meta: "Insights",
    description: "Cost per wear tracking, underused item alerts, category breakdowns, and sustainability scores.",
    icon: <BarChart3 className="w-4 h-4 text-primary" />,
    status: "Pro",
    tags: ["Stats", "Tracking"],
    colSpan: 2,
    hasPersistentHover: true,
  },
  {
    title: "Smart Shopping",
    meta: "Recommendations",
    description: "AI identifies gaps in your wardrobe and recommends the perfect pieces to complete your style.",
    icon: <ShoppingBag className="w-4 h-4 text-primary" />,
    status: "Beta",
    tags: ["Shop", "Gaps"],
  },
];

const Features = () => {
  return (
    <section className="py-32 px-4 relative" id="features">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-primary font-sans font-semibold text-sm tracking-widest uppercase mb-4">Capabilities</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            Everything You Need to <span className="gold-text">Look Incredible</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <BentoGrid items={featureItems} />
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
