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
    content: "Upload a selfie and a few wardrobe shots. Within seconds, LUXOR knows your proportions, your color season, and the cuts that flatter you most.",
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
    content: "Every morning, a fresh outfit lands on your screen. It already checked the weather, your calendar, and which pieces have been sitting untouched.",
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
    content: "Computer vision scans your skin tone and tells you the exact shades that make you look alive. No more buying colors that wash you out.",
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
    content: "LUXOR identifies the holes in your wardrobe and finds pieces to fill them. Every recommendation has a reason behind it.",
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
    content: "Plan your week's looks on Sunday night. Track what you wore. Stop the 'I have nothing to wear' panic at 7 AM.",
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
    content: "Live trend data filtered through your style profile and budget. You see only what matters to you, not noise.",
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
          What Happens When AI Understands Your Body <span className="gold-text">Better Than You Do</span>
        </h2>
        <p className="text-muted-foreground mt-4 text-sm tracking-wide text-balance">
          Six tools that eliminate the guesswork from getting dressed, shopping, and building a wardrobe you actually use.
        </p>
      </AnimatedContainer>
    </div>

    <div className="h-[600px] md:h-[700px]">
      <RadialOrbitalTimeline timelineData={timelineData} />
    </div>
  </section>
);

export default Features;
