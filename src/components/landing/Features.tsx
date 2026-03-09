import { motion } from "framer-motion";
import { Sparkles, Brain, Palette, ShoppingBag, Calendar, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Style DNA Analysis",
    description: "AI learns your unique aesthetic from selfies, preferences, and wardrobe data.",
    span: "md:col-span-2",
  },
  {
    icon: Sparkles,
    title: "AI Outfit Generator",
    description: "Get daily outfit ideas tailored to weather, occasion, and your mood.",
    span: "",
  },
  {
    icon: Palette,
    title: "Color Intelligence",
    description: "Discover your perfect color palette based on skin tone analysis.",
    span: "",
  },
  {
    icon: ShoppingBag,
    title: "Smart Shopping",
    description: "Get recommendations for pieces that fill gaps in your wardrobe.",
    span: "md:col-span-2",
  },
  {
    icon: Calendar,
    title: "Outfit Calendar",
    description: "Plan your looks ahead and never repeat outfits unintentionally.",
    span: "",
  },
  {
    icon: TrendingUp,
    title: "Trend Radar",
    description: "Stay ahead with real-time trend intelligence matched to your style.",
    span: "",
  },
];

const Features = () => (
  <section id="features" className="py-24 bg-muted/20">
    <div className="max-w-5xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <p className="font-sans text-sm font-semibold text-primary tracking-widest uppercase mb-3">Features</p>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
          Everything You Need to <span className="gold-text">Look Your Best</span>
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-4 gap-4">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className={`glass rounded-2xl p-6 premium-card hover-lift ${f.span}`}
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <f.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground mb-1">{f.title}</h3>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">{f.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
