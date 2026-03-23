import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Brain, Wand2 as Wand2Icon, Palette, ShoppingBag, Calendar, TrendingUp,
  Scan, Shirt, Wand2, BarChart3, Users, Zap, Play, X,
} from "lucide-react";
import { FeatureCard } from "@/components/ui/grid-feature-cards";
import { SidePanelVideo, VideoPlayer } from "@/components/ui/side-panel-video";
import { Button } from "@/components/ui/button";

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
  const [videoOpen, setVideoOpen] = useState(false);
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
        {/* Video section */}
        <div className="flex flex-col items-center gap-4">
          <SidePanelVideo
            panelOpen={videoOpen}
            handlePanelOpen={() => setVideoOpen(!videoOpen)}
            renderButton={(toggle) => (
              <div className="flex items-center w-full justify-start pr-4 md:pl-4 py-1 md:py-1">
                <p className="text-xl font-black tracking-tight sm:text-3xl">
                  <span className="bg-gradient-to-t from-muted-foreground to-foreground bg-clip-text font-display text-xl font-bold text-transparent sm:text-5xl">
                    LEXOR®
                  </span>
                </p>
                <Button className="rounded-r-[33px] py-8 ml-2" onClick={toggle} variant="secondary">
                  {videoOpen ? <X className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                  {videoOpen ? "Close" : "Watch"}
                </Button>
              </div>
            )}
          >
            <VideoPlayer videoOpen={videoOpen} url="/videos/lexor-showcase.mp4" />
          </SidePanelVideo>
        </div>



export default TabbedFeatures;
