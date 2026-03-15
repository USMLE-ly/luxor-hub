import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Brain, Sparkles, Palette, ShoppingBag, Calendar, TrendingUp,
  Scan, Shirt, Wand2, BarChart3, Users, Zap,
  Check
} from "lucide-react";

const tabs = [
  {
    id: "ai",
    label: "AI Styling",
    icon: Brain,
    headline: "Your Personal AI Stylist",
    description: "Advanced machine learning that understands your body, preferences, and lifestyle to deliver hyper-personalized style guidance.",
    features: [
      { icon: Brain, title: "Style DNA Analysis", detail: "Deep learning maps your unique aesthetic from selfies, wardrobe data, and quiz responses into a multi-dimensional style profile." },
      { icon: Sparkles, title: "AI Outfit Generator", detail: "Generates daily outfit combinations factoring in weather, calendar events, mood, and pieces you haven't worn recently." },
      { icon: Palette, title: "Color Intelligence", detail: "Skin-tone analysis using computer vision determines your ideal color palette across all four seasons." },
      { icon: Wand2, title: "Virtual Try-On", detail: "See how new pieces look on your body type before buying, powered by generative AI." },
    ],
  },
  {
    id: "wardrobe",
    label: "Wardrobe",
    icon: Shirt,
    headline: "Your Digital Closet",
    description: "A smart, organized wardrobe that tracks everything you own and helps you make the most of every piece.",
    features: [
      { icon: Scan, title: "Closet Scanner", detail: "Photograph your clothes and our AI categorizes, tags colors, brands, and occasions automatically." },
      { icon: Calendar, title: "Outfit Calendar", detail: "Plan looks ahead, track what you've worn, and never repeat outfits unintentionally." },
      { icon: Shirt, title: "Capsule Builder", detail: "Generate minimal capsule wardrobes for travel or seasonal transitions from your existing clothes." },
      { icon: BarChart3, title: "Wardrobe Analytics", detail: "Cost-per-wear tracking, category gaps, and utilization insights to shop smarter." },
    ],
  },
  {
    id: "shopping",
    label: "Shopping",
    icon: ShoppingBag,
    headline: "Shop Smarter, Not More",
    description: "AI-powered recommendations that fill real gaps in your wardrobe — no impulse buys, no regrets.",
    features: [
      { icon: ShoppingBag, title: "Gap Analysis", detail: "Identifies missing pieces in your wardrobe based on your style profile and lifestyle needs." },
      { icon: TrendingUp, title: "Trend Radar", detail: "Real-time trend intelligence matched to your personal style, filtered by your budget range." },
      { icon: Zap, title: "Price Alerts", detail: "Get notified when wishlist items drop in price or go on sale at partnered retailers." },
      { icon: Users, title: "Style Community", detail: "Browse looks from users with similar body types and style profiles for real-world inspiration." },
    ],
  },
];

const TabbedFeatures = () => {
  const [activeTab, setActiveTab] = useState("ai");
  const shouldReduceMotion = useReducedMotion();
  const active = tabs.find((t) => t.id === activeTab)!;

  return (
    <section className="py-16 md:py-24 bg-background">
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
            Explore Every <span className="gold-text">Capability</span>
          </h2>
          <p className="text-muted-foreground mt-4 text-sm tracking-wide text-balance">
            Three pillars of intelligent fashion — each packed with features that work together seamlessly.
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

            {/* Feature grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {active.features.map((feat, i) => (
                <motion.div
                  key={feat.title}
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="group glass rounded-2xl p-5 premium-card hover-lift will-change-transform"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <feat.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        {feat.title}
                        <Check className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h4>
                      <p className="text-muted-foreground text-xs leading-relaxed mt-1.5">{feat.detail}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default TabbedFeatures;
