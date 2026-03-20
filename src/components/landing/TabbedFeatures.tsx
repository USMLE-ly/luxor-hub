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
    headline: "Imagine Never Second-Guessing an Outfit Again",
    description: "AURELIA learns your body, your taste, and your schedule. Then it does the hard part for you.",
    features: [
      { icon: Brain, title: "Style DNA Analysis", detail: "Upload a selfie. The AI maps your proportions, coloring, and aesthetic preferences into a profile that gets sharper every day." },
      { icon: Wand2Icon, title: "AI Outfit Generator", detail: "Open the app, see today's outfit. It already factored in the rain, your 2 PM meeting, and the shirt you wore yesterday." },
      { icon: Palette, title: "Color Intelligence", detail: "Computer vision tells you the 12 shades that make your skin glow. That mauve top you keep reaching for? There's a reason." },
      { icon: Wand2, title: "Virtual Try-On", detail: "See how a new jacket looks on your actual body type before you spend a dime. Powered by generative AI." },
    ],
  },
  {
    id: "wardrobe",
    label: "Wardrobe",
    icon: Shirt,
    headline: "Stop Buying Clothes You'll Never Wear",
    description: "Most people use 20% of their closet. AURELIA puts the other 80% back to work.",
    features: [
      { icon: Scan, title: "Closet Scanner", detail: "Photograph your clothes. AI tags the color, brand, fabric, and occasion in seconds. Your entire wardrobe, digitized." },
      { icon: Calendar, title: "Outfit Calendar", detail: "Plan Monday through Friday on Sunday night. Track repeats. End the morning scramble." },
      { icon: Shirt, title: "Capsule Builder", detail: "Traveling for a week? The AI packs 5 outfits from 8 pieces. All from clothes you already own." },
      { icon: BarChart3, title: "Wardrobe Analytics", detail: "See your cost-per-wear, spot underused pieces, and find category gaps before your next shopping trip." },
    ],
  },
  {
    id: "shopping",
    label: "Shopping",
    icon: ShoppingBag,
    headline: "Every Purchase Becomes Your Best Purchase",
    description: "No more impulse buys that sit in the closet with tags on. Every recommendation fills a real gap.",
    features: [
      { icon: ShoppingBag, title: "Gap Analysis", detail: "AURELIA scans your wardrobe and tells you exactly what's missing. That's the only thing worth buying next." },
      { icon: TrendingUp, title: "Trend Radar", detail: "Live trends filtered through your style profile and budget. You see what matters. Everything else is noise." },
      { icon: Zap, title: "Price Alerts", detail: "Wishlist a piece and forget about it. AURELIA pings you the moment it drops in price at any partnered retailer." },
      { icon: Users, title: "Style Community", detail: "Browse real outfits from people with your body type and taste. Inspiration that actually applies to you." },
    ],
  },
];

const TabbedFeatures = () => {
  const [activeTab, setActiveTab] = useState("ai");
  const shouldReduceMotion = useReducedMotion();
  const active = tabs.find((t) => t.id === activeTab)!;

  // Listen for tab-switch events from feature cards
  useEffect(() => {
    const handler = (e: Event) => {
      const tabId = (e as CustomEvent).detail;
      if (tabs.some((t) => t.id === tabId)) setActiveTab(tabId);
    };
    window.addEventListener("aurelia:switch-tab", handler);
    return () => window.removeEventListener("aurelia:switch-tab", handler);
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
            Three Ways AURELIA Changes <span className="gold-text">Your Morning</span>
          </h2>
          <p className="text-muted-foreground mt-4 text-sm tracking-wide text-balance">
            AI styling, a smarter closet, and shopping that actually makes sense. Pick a tab and see what changes.
          </p>
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

            {/* Feature grid — dashed border grid cards */}
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
