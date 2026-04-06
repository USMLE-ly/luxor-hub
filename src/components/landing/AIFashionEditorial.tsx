import { motion, useReducedMotion } from "framer-motion";
import { Camera, Brain, Sun, ShoppingBag, BarChart3 } from "lucide-react";
import { FeatureCard } from "@/components/ui/grid-feature-cards";

const steps = [
  {
    icon: Camera,
    title: "Digitize Your Wardrobe",
    description: "Photograph your clothes. AI identifies each piece in seconds — category, colors, fabric, brand, season. No manual tagging.",
  },
  {
    icon: Brain,
    title: "AI Learns Your Style DNA",
    description: "LEXOR® builds a personal profile from your body, skin tone, lifestyle, and outfits you actually wear. 40+ style dimensions.",
  },
  {
    icon: Sun,
    title: "Wake Up to a Weather-Checked Outfit",
    description: "Each morning, AI checks your closet, weather, and calendar to assemble a complete outfit. Every interaction makes tomorrow smarter.",
  },
  {
    icon: ShoppingBag,
    title: "Shop Smarter With Gap Analysis",
    description: "Instead of impulse buys, see what's actually missing. Users spend 35% less on clothing while wearing 60% more of what they own.",
  },
  {
    icon: BarChart3,
    title: "Track Progress and Build Confidence",
    description: "See cost-per-wear, style scores, outfit variety, and wardrobe utilization. Earn badges. Stop second-guessing.",
  },
];

function AnimatedContainer({
  className,
  delay = 0.1,
  children,
}: {
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) return <>{children}</>;

  return (
    <motion.div
      initial={{ filter: "blur(4px)", translateY: -8, opacity: 0 }}
      whileInView={{ filter: "blur(0px)", translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const AIFashionEditorial = () => (
  <section className="py-16 md:py-32 bg-background" aria-labelledby="ai-fashion-editorial-heading">
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4">
      <AnimatedContainer className="mx-auto max-w-3xl text-center">
        <h2
          id="ai-fashion-editorial-heading"
          className="text-3xl font-bold tracking-wide text-balance md:text-4xl lg:text-5xl xl:font-extrabold text-foreground"
        >
          How AI Fashion Styling Works
        </h2>
        <p className="text-muted-foreground mt-4 text-sm tracking-wide text-balance md:text-base">
          Five steps from cluttered closet to daily outfits that fit your life.
        </p>
      </AnimatedContainer>

      <AnimatedContainer
        delay={0.4}
        className="grid grid-cols-1 divide-x divide-y divide-dashed border border-dashed sm:grid-cols-2 md:grid-cols-3"
      >
        {steps.map((step, i) => (
          <FeatureCard key={i} feature={step} />
        ))}
      </AnimatedContainer>

      <AnimatedContainer delay={0.6} className="mt-14 md:mt-20 border-t border-border/20 pt-10">
        <h3 className="font-display text-xl md:text-2xl font-semibold text-foreground mb-4 tracking-tight">
          Why AI-Powered Fashion Styling Matters
        </h3>
        <div className="space-y-4 text-sm md:text-base text-muted-foreground leading-relaxed">
          <p>
            The average person spends 20 minutes every morning deciding what to wear — 120+ hours a year. AI processes your entire wardrobe, the weather, your schedule, and current trends in under a second.
          </p>
          <p>
            LEXOR® improves with every interaction. The more you use it, the better it reads your taste in fabrics, colors, and occasion-specific dress codes. It's not replacing your style — it's making it sharper.
          </p>
          <p>
            Whether you're a busy professional, a fashion enthusiast with a curated closet, or someone rebuilding confidence through better self-presentation — AI styling adapts to you.
          </p>
        </div>
      </AnimatedContainer>
    </div>
  </section>
);

export default AIFashionEditorial;
