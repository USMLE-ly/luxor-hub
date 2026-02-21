import { motion } from "framer-motion";
import { Shirt, Brain, MessageSquare, BarChart3, ShoppingBag, Palette } from "lucide-react";

const features = [
  {
    icon: Shirt,
    title: "AI Closet Scanner",
    description: "Upload photos and let AI auto-detect category, color, style, season, and occasion for every item.",
  },
  {
    icon: Brain,
    title: "Style DNA Engine",
    description: "Our AI builds your unique style profile — understanding your preferences, lifestyle, and fashion goals.",
  },
  {
    icon: Palette,
    title: "Smart Outfit Generator",
    description: "Context-aware outfits generated from YOUR closet, considering weather, events, and your mood.",
  },
  {
    icon: MessageSquare,
    title: "AI Stylist Chat",
    description: "Ask your personal AI stylist anything. It knows your closet, body, and style DNA intimately.",
  },
  {
    icon: BarChart3,
    title: "Wardrobe Analytics",
    description: "Cost per wear tracking, underused item alerts, category breakdowns, and sustainability scores.",
  },
  {
    icon: ShoppingBag,
    title: "Smart Shopping",
    description: "AI identifies gaps in your wardrobe and recommends the perfect pieces to complete your style.",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" as const } },
};

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
          className="text-center mb-20"
        >
          <p className="text-primary font-sans font-semibold text-sm tracking-widest uppercase mb-4">Capabilities</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            Everything You Need to <span className="gold-text">Look Incredible</span>
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="glass rounded-2xl p-8 group hover:border-primary/30 transition-all duration-500 hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground font-sans leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
