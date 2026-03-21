import { motion, useReducedMotion } from "framer-motion";
import {
  Brain, Palette, ShoppingBag, Calendar, TrendingUp, Wand2,
} from "lucide-react";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";

const timelineData = [
  {
    id: 1,
    title: "Style DNA",
    date: "AI Core",
    content: "One selfie. AI maps your proportions, color season, and best cuts in seconds.",
    category: "AI Styling",
    icon: Brain,
    relatedIds: [2, 3],
    status: "completed" as const,
    energy: 95,
  },
  {
    id: 2,
    title: "Outfit Generator",
    date: "Daily AI",
    content: "A fresh outfit every morning. Weather-checked, calendar-aware, from your closet.",
    category: "AI Styling",
    icon: Wand2,
    relatedIds: [1, 5],
    status: "completed" as const,
    energy: 90,
  },
  {
    id: 3,
    title: "Color Intelligence",
    date: "Analysis",
    content: "AI scans your skin tone and reveals the exact shades that make you glow.",
    category: "AI Styling",
    icon: Palette,
    relatedIds: [1, 4],
    status: "in-progress" as const,
    energy: 80,
  },
  {
    id: 4,
    title: "Smart Shopping",
    date: "Commerce",
    content: "AI finds the gaps in your wardrobe. Every recommendation has a reason.",
    category: "Shopping",
    icon: ShoppingBag,
    relatedIds: [3, 6],
    status: "in-progress" as const,
    energy: 70,
  },
  {
    id: 5,
    title: "Outfit Calendar",
    date: "Planning",
    content: "Plan your week's looks on Sunday. End the morning panic.",
    category: "Wardrobe",
    icon: Calendar,
    relatedIds: [2, 6],
    status: "completed" as const,
    energy: 85,
  },
  {
    id: 6,
    title: "Trend Radar",
    date: "Real-time",
    content: "Live trends filtered to your style and budget. Only what matters.",
    category: "Shopping",
    icon: TrendingUp,
    relatedIds: [4, 5],
    status: "pending" as const,
    energy: 60,
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
  <section id="features" className="relative bg-muted/20 overflow-hidden">
    <div className="mx-auto w-full max-w-6xl px-4 pt-16 md:pt-24">
      <AnimatedContainer className="mx-auto max-w-xl text-center">
        <p className="font-sans text-sm font-semibold text-primary tracking-widest uppercase mb-3">Features</p>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground tracking-wide text-balance">
          AI That Understands <span className="gold-text">Your Body</span>
        </h2>
        <p className="text-muted-foreground mt-4 text-sm tracking-wide text-balance">
          Six tools. Zero guesswork.
        </p>
      </AnimatedContainer>
    </div>

    <div className="h-[600px] md:h-[700px]">
      <RadialOrbitalTimeline timelineData={timelineData} />
    </div>
  </section>
);

export default Features;
