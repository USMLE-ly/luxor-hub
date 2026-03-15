import { motion, useReducedMotion } from "framer-motion";
import { Brain, Palette, ShoppingBag, Calendar, TrendingUp, Wand2 } from "lucide-react";
import FeatureShaderCards from "@/components/ui/feature-shader-cards";

const features = [
  {
    icon: <Brain className="size-10" strokeWidth={1.2} />,
    title: "Style DNA Analysis",
    description: "AI learns your unique aesthetic from selfies, preferences, and wardrobe data.",
    tab: "ai",
  },
  {
    icon: <Wand2 className="size-10" strokeWidth={1.2} />,
    title: "AI Outfit Generator",
    description: "Get daily outfit ideas tailored to weather, occasion, and your mood.",
    tab: "ai",
  },
  {
    icon: <Palette className="size-10" strokeWidth={1.2} />,
    title: "Color Intelligence",
    description: "Discover your perfect color palette based on skin tone analysis.",
    tab: "ai",
  },
  {
    icon: <ShoppingBag className="size-10" strokeWidth={1.2} />,
    title: "Smart Shopping",
    description: "Get recommendations for pieces that fill gaps in your wardrobe.",
    tab: "shopping",
  },
  {
    icon: <Calendar className="size-10" strokeWidth={1.2} />,
    title: "Outfit Calendar",
    description: "Plan your looks ahead and never repeat outfits unintentionally.",
    tab: "wardrobe",
  },
  {
    icon: <TrendingUp className="size-10" strokeWidth={1.2} />,
    title: "Trend Radar",
    description: "Stay ahead with real-time trend intelligence matched to your style.",
    tab: "shopping",
  },
];

const scrollToTab = (tabId: string) => {
  const section = document.getElementById("tabbed-features");
  if (!section) return;
  section.scrollIntoView({ behavior: "smooth" });
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent("aurelia:switch-tab", { detail: tabId }));
  }, 600);
};

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
    <div className="mx-auto w-full max-w-6xl space-y-10 px-4">
      <AnimatedContainer className="mx-auto max-w-xl text-center">
        <p className="font-sans text-sm font-semibold text-primary tracking-widest uppercase mb-3">Features</p>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground tracking-wide text-balance">
          Everything You Need to <span className="gold-text">Look Your Best</span>
        </h2>
        <p className="text-muted-foreground mt-4 text-sm tracking-wide text-balance">
          Six AI-powered tools that transform how you dress, shop, and express yourself.
        </p>
      </AnimatedContainer>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ delay: 0.2, duration: 0.7 }}
      >
        <FeatureShaderCards features={features} onLearnMore={scrollToTab} />
      </motion.div>
    </div>
  </section>
);

export default Features;
