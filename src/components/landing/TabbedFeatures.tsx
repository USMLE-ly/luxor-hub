import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Brain, Wand2 as Wand2Icon, Palette, ShoppingBag, Calendar, TrendingUp,
  Scan, Shirt, Wand2, BarChart3, Users, Zap,
} from "lucide-react";
import { FeatureCard } from "@/components/ui/grid-feature-cards";

const tabs = [
  {
    id: "ai",
    label: "AI Styling",
    icon: Brain,
    headline: "Never Second-Guess an Outfit",
    description: "AI learns your body, taste, and schedule — then does the hard part.",
    features: [
      { icon: Brain, title: "Style DNA Analysis", detail: "Maps your proportions, coloring, and preferences. Gets sharper daily." },
      { icon: Wand2Icon, title: "AI Outfit Generator", detail: "Today's outfit, ready. Rain, meetings, and yesterday's shirt — already factored in." },
      { icon: Palette, title: "Color Intelligence", detail: "The 12 shades that make your skin glow. Science, not guesswork." },
      { icon: Wand2, title: "Virtual Try-On", detail: "See how a jacket looks on your body type before you buy." },
    ],
  },
  {
    id: "wardrobe",
    label: "Wardrobe",
    icon: Shirt,
    headline: "Stop Buying Clothes You Never Wear",
    description: "Most people use 20% of their closet. LEXOR® activates the rest.",
    features: [
      { icon: Scan, title: "Closet Scanner", detail: "Photograph clothes. AI tags color, brand, fabric instantly." },
      { icon: Calendar, title: "Outfit Calendar", detail: "Plan Monday–Friday on Sunday. End the morning scramble." },
      { icon: Shirt, title: "Capsule Builder", detail: "5 outfits from 8 pieces. All from what you own." },
      { icon: BarChart3, title: "Wardrobe Analytics", detail: "Cost-per-wear, underused pieces, category gaps — all visible." },
    ],
  },
  {
    id: "shopping",
    label: "Shopping",
    icon: ShoppingBag,
    headline: "Every Purchase Counts",
    description: "No impulse buys. Every recommendation fills a real gap.",
    features: [
      { icon: ShoppingBag, title: "Gap Analysis", detail: "AI tells you what's missing. That's the only thing worth buying." },
      { icon: TrendingUp, title: "Trend Radar", detail: "Live trends filtered to your style and budget." },
      { icon: Zap, title: "Price Alerts", detail: "Wishlist a piece. Get pinged when the price drops." },
      { icon: Users, title: "Style Community", detail: "Real outfits from people with your body type and taste." },
    ],
  },
];

const TabbedFeatures = () => {
  const [activeTab, setActiveTab] = useState("ai");
  const shouldReduceMotion = useReducedMotion();
  const active = tabs.find((t) => t.id === activeTab)!;

  useEffect(() => {
    const handler = (e: Event) => {
      const tabId = (e as CustomEvent).detail;
      if (tabs.some((t) => t.id === tabId)) setActiveTab(tabId);
    };
    window.addEventListener("luxor:switch-tab", handler);
    return () => window.removeEventListener("luxor:switch-tab", handler);
  }, []);

  return (
    <section id="tabbed-features" className="py-12 md:py-20 bg-background">
      <div className="mx-auto w-full max-w-5xl px-4 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-xl mx-auto"
        >
          <p className="font-sans text-sm font-semibold text-primary tracking-widest uppercase mb-3">Deep Dive</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground tracking-wide text-balance">
            Three Ways to Transform <span className="gold-text">Your Morning</span>
          </h2>
        </motion.div>

        {/* Tab triggers */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-muted/50 backdrop-blur-sm border border-border/40">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200
                    ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"}
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="tab-active-bg"
                      className="absolute inset-0 rounded-lg bg-background shadow-sm border border-border/60"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <tab.icon className="w-4 h-4 relative z-10" strokeWidth={1.5} />
                  <span className="relative z-10 hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? {} : { opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h3 className="font-display text-xl md:text-2xl font-bold text-foreground">{active.headline}</h3>
              <p className="text-muted-foreground text-sm mt-2 max-w-lg mx-auto">{active.description}</p>
            </div>

            {/* Feature grid */}
            <div className="grid grid-cols-1 divide-x divide-y divide-dashed border border-dashed sm:grid-cols-2">
              {active.features.map((feat) => (
                <FeatureCard
                  key={feat.title}
                  feature={{ title: feat.title, icon: feat.icon, description: feat.detail }}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default TabbedFeatures;
