import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, Brain, Palette, ShoppingBag, Calendar, TrendingUp, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Style DNA Analysis",
    description: "AI learns your unique aesthetic from selfies, preferences, and wardrobe data.",
  },
  {
    icon: Sparkles,
    title: "AI Outfit Generator",
    description: "Get daily outfit ideas tailored to weather, occasion, and your mood.",
  },
  {
    icon: Palette,
    title: "Color Intelligence",
    description: "Discover your perfect color palette based on skin tone analysis.",
  },
  {
    icon: ShoppingBag,
    title: "Smart Shopping",
    description: "Get recommendations for pieces that fill gaps in your wardrobe.",
  },
  {
    icon: Calendar,
    title: "Outfit Calendar",
    description: "Plan your looks ahead and never repeat outfits unintentionally.",
  },
  {
    icon: TrendingUp,
    title: "Trend Radar",
    description: "Stay ahead with real-time trend intelligence matched to your style.",
  },
];

function AnimatedContainer({ className, delay = 0.1, children }: { delay?: number; className?: string; children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) return <>{children}</>;

  return (
    <motion.div
      initial={{ filter: "blur(4px)", translateY: -8, opacity: 0 }}
      whileInView={{ filter: "blur(0px)", translateY: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const Features = () => (
  <section id="features" className="py-16 md:py-24 bg-muted/20">
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4">
      <AnimatedContainer className="mx-auto max-w-xl text-center">
        <p className="font-sans text-sm font-semibold text-primary tracking-widest uppercase mb-3">Features</p>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground tracking-wide text-balance">
          Everything You Need to <span className="gold-text">Look Your Best</span>
        </h2>
        <p className="text-muted-foreground mt-4 text-sm tracking-wide text-balance">
          Six AI-powered tools that transform how you dress, shop, and express yourself.
        </p>
      </AnimatedContainer>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.2 + i * 0.05, duration: 0.6 }}
            className="group glass rounded-2xl p-6 premium-card hover-lift will-change-transform"
          >
            <feature.icon
              className="text-foreground/75 size-6 transition-transform duration-300 group-hover:scale-110"
              strokeWidth={1}
              aria-hidden
            />
            <h3 className="mt-6 text-sm md:text-base font-semibold text-foreground">{feature.title}</h3>
            <p className="text-muted-foreground relative z-20 mt-2 text-xs font-light leading-relaxed">{feature.description}</p>
            <button
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              Learn more <ArrowRight className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
