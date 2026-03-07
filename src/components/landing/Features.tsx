import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Shirt, Brain, MessageSquare, BarChart3, ShoppingBag, Palette } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import featureCloset from "@/assets/feature-closet-scanner.jpg";
import featureDna from "@/assets/feature-style-dna.jpg";
import featureOutfit from "@/assets/feature-outfit-gen.jpg";
import featureChat from "@/assets/feature-ai-chat.jpg";
import featureAnalytics from "@/assets/feature-analytics.jpg";
import featureShopping from "@/assets/feature-shopping.jpg";

interface FeatureItem {
  title: string;
  meta: string;
  description: string;
  icon: React.ReactNode;
  image: string;
  colSpan?: number;
}

const featureItems: FeatureItem[] = [
  {
    title: "AI Closet Scanner",
    meta: "Auto-categorize every item",
    description: "Upload photos and let AI auto-detect category, color, style, season, and occasion for every item.",
    icon: <Shirt className="w-4 h-4 text-primary" />,
    image: featureCloset,
    colSpan: 2,
  },
  {
    title: "Style DNA Engine",
    meta: "Your unique style profile",
    description: "Our AI builds your unique style profile — understanding your preferences, lifestyle, and fashion goals.",
    icon: <Brain className="w-4 h-4 text-primary" />,
    image: featureDna,
  },
  {
    title: "Smart Outfit Generator",
    meta: "Weather & mood-aware",
    description: "Context-aware outfits generated from YOUR closet, considering weather, events, and your mood.",
    icon: <Palette className="w-4 h-4 text-primary" />,
    image: featureOutfit,
    colSpan: 2,
  },
  {
    title: "AI Stylist Chat",
    meta: "24/7 personal stylist",
    description: "Ask your personal AI stylist anything. It knows your closet, body, and style DNA intimately.",
    icon: <MessageSquare className="w-4 h-4 text-primary" />,
    image: featureChat,
  },
  {
    title: "Wardrobe Analytics",
    meta: "Cost-per-wear insights",
    description: "Cost per wear tracking, underused item alerts, category breakdowns, and sustainability scores.",
    icon: <BarChart3 className="w-4 h-4 text-primary" />,
    image: featureAnalytics,
    colSpan: 2,
  },
  {
    title: "Smart Shopping",
    meta: "Fill wardrobe gaps",
    description: "AI identifies gaps in your wardrobe and recommends the perfect pieces to complete your style.",
    icon: <ShoppingBag className="w-4 h-4 text-primary" />,
    image: featureShopping,
  },
];

function FeatureCard({ item, index }: { item: FeatureItem; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });
  const illustrationY = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const cardY = useTransform(scrollYProgress, [0, 0.5, 1], [15, 0, -15]);

  return (
    <motion.div
      ref={cardRef}
      style={{ y: cardY }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={`relative list-none min-h-[14rem] ${item.colSpan === 2 ? "md:col-span-2" : "col-span-1"}`}
    >
      <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-border p-2 md:rounded-[1.5rem] md:p-3">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={3}
        />
        <div className="relative flex h-full flex-col justify-between gap-4 overflow-hidden rounded-xl border-[0.75px] border-border bg-background p-6 shadow-sm group">
          {/* Feature image — high visibility */}
          <motion.div
            style={{ y: illustrationY }}
            className="absolute -top-4 -right-4 w-44 h-44 md:w-56 md:h-56 opacity-[0.45] dark:opacity-[0.3] pointer-events-none will-change-transform"
          >
            <img
              src={item.image}
              alt=""
              className="w-full h-full object-cover rounded-tr-xl rounded-bl-3xl"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-transparent to-background/70" />
          </motion.div>

          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary/10 group-hover:bg-primary/20 transition-all duration-300">
              {item.icon}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-display text-base font-semibold text-foreground tracking-tight">
              {item.title}
            </h3>
            <p className="text-xs font-sans font-medium text-primary/80">{item.meta}</p>
            <p className="text-sm text-muted-foreground leading-snug">
              {item.description}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const GoldDivider = () => (
  <div className="flex items-center gap-4 my-10 max-w-xs mx-auto">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/40" />
    <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/40" />
  </div>
);

const Features = () => {
  return (
    <section className="relative py-32 px-4 overflow-hidden" id="features">
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url('/patterns/linear-texture.svg')`,
          backgroundSize: "400px 400px",
          backgroundRepeat: "repeat",
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <p className="text-primary font-sans font-semibold text-sm tracking-widest uppercase mb-4">Capabilities</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            Everything You Need to <span className="gold-text">Look Incredible</span>
          </h2>
        </motion.div>

        <GoldDivider />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 max-w-7xl mx-auto [&_.glowing-effect]:hidden [&_.glowing-effect]:md:block">
          {featureItems.map((item, index) => (
            <FeatureCard key={index} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
