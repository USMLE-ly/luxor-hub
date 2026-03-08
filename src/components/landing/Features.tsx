import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useCallback } from "react";
import { TextReveal } from "@/components/ui/animated-text-reveal";
import { Shirt, Brain, MessageSquare, BarChart3, ShoppingBag, Palette, Calendar, Sparkles, Camera } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";
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
  category: string;
}

const featureItems: FeatureItem[] = [
  { title: "AI Closet Scanner", meta: "Auto-categorize every item", description: "Upload photos and let AI auto-detect category, color, style, season, and occasion for every item.", icon: <Shirt className="w-4 h-4 text-primary" />, image: featureCloset, colSpan: 2, category: "AI Engine" },
  { title: "Style DNA Engine", meta: "Your unique style profile", description: "Our AI builds your unique style profile — understanding your preferences, body shape, face shape, and fashion goals.", icon: <Brain className="w-4 h-4 text-primary" />, image: featureDna, category: "AI Engine" },
  { title: "Smart Outfit Generator", meta: "Weather & mood-aware", description: "Context-aware outfits generated from YOUR closet, considering weather, events, and your mood.", icon: <Palette className="w-4 h-4 text-primary" />, image: featureOutfit, colSpan: 2, category: "Wardrobe" },
  { title: "AI Stylist Chat", meta: "24/7 personal stylist", description: "Ask your AI stylist anything with streaming animated responses, vanishing input effects, and smart placeholders.", icon: <MessageSquare className="w-4 h-4 text-primary" />, image: featureChat, category: "AI Engine" },
  { title: "Wardrobe Analytics", meta: "Cost-per-wear insights", description: "Cost per wear tracking, underused item alerts, category breakdowns, and sustainability scores.", icon: <BarChart3 className="w-4 h-4 text-primary" />, image: featureAnalytics, colSpan: 2, category: "Wardrobe" },
  { title: "Smart Shopping", meta: "Fill wardrobe gaps", description: "AI identifies gaps in your wardrobe and recommends the perfect pieces to complete your style.", icon: <ShoppingBag className="w-4 h-4 text-primary" />, image: featureShopping, category: "Social" },
  { title: "Virtual Try-On", meta: "See before you buy", description: "Upload a selfie and virtually try on outfits before committing. AI-powered visualization for confident decisions.", icon: <Camera className="w-4 h-4 text-primary" />, image: featureOutfit, category: "AI Engine" },
  { title: "Outfit Calendar", meta: "Plan your week", description: "Schedule outfits for upcoming events, meetings, and occasions. Never repeat a look unintentionally.", icon: <Calendar className="w-4 h-4 text-primary" />, image: featureAnalytics, colSpan: 2, category: "Wardrobe" },
  { title: "Fashion Designer AI", meta: "Create custom designs", description: "Dream up unique garments with AI-powered fashion design. Generate original clothing concepts from text prompts.", icon: <Sparkles className="w-4 h-4 text-primary" />, image: featureShopping, category: "Social" },
];

const categories = ["All", "AI Engine", "Wardrobe", "Social"];

function FeatureCard({ item, index }: { item: FeatureItem; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll({ target: cardRef, offset: ["start end", "end start"] });
  const illustrationY = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const cardY = useTransform(scrollYProgress, [0, 0.5, 1], [15, 0, -15]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
    <motion.div
      ref={cardRef}
      style={{ y: cardY }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className={`relative list-none min-h-[14rem] ${item.colSpan === 2 ? "md:col-span-2" : "col-span-1"}`}
    >
      <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-border p-2 md:rounded-[1.5rem] md:p-3">
        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
        <div
          className="relative flex h-full flex-col justify-between gap-4 overflow-hidden rounded-xl border-[0.75px] border-border bg-background p-6 shadow-sm group"
          onMouseMove={handleMouseMove}
        >
          {/* Spotlight effect */}
          <div
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, hsl(var(--primary) / 0.06), transparent 70%)`,
            }}
          />

          {/* Feature image */}
          <motion.div
            style={{ y: illustrationY }}
            className="absolute -top-4 -right-4 w-44 h-44 md:w-56 md:h-56 opacity-[0.45] dark:opacity-[0.3] pointer-events-none will-change-transform"
          >
            <img src={item.image} alt="" className="w-full h-full object-cover rounded-tr-xl rounded-bl-3xl" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-transparent to-background/70" />
          </motion.div>

          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
              {item.icon}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-display text-base font-semibold text-foreground tracking-tight">{item.title}</h3>
            <p className="text-xs font-sans font-medium text-primary/80">{item.meta}</p>
            <p className="text-sm text-muted-foreground leading-snug">{item.description}</p>
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
  const [activeFilter, setActiveFilter] = useState("All");
  const filtered = activeFilter === "All" ? featureItems : featureItems.filter((f) => f.category === activeFilter);

  return (
    <section className="relative py-32 px-4 overflow-hidden" id="features">
      <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url('/patterns/linear-texture.svg')`, backgroundSize: "400px 400px", backgroundRepeat: "repeat" }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} className="text-center mb-6">
          <p className="text-primary font-sans font-semibold text-sm tracking-widest uppercase mb-4">Capabilities</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            <TextReveal mode="word" as="span">Everything You Need to</TextReveal>{" "}
            <TextReveal mode="blur" as="span" delay={5} className="gold-text">Look Incredible</TextReveal>
          </h2>
        </motion.div>

        <GoldDivider />

        {/* Filter pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-2 mb-8"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-sans font-medium tracking-wide transition-all duration-300 border",
                activeFilter === cat
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-transparent border-border text-muted-foreground hover:border-primary/20 hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        <motion.div layout className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 max-w-7xl mx-auto [&_.glowing-effect]:hidden [&_.glowing-effect]:md:block">
          {filtered.map((item, index) => (
            <FeatureCard key={item.title} item={item} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
