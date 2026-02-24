import { motion } from "framer-motion";
import { Shirt, Brain, MessageSquare, BarChart3, ShoppingBag, Palette } from "lucide-react";
import { BentoGrid, type BentoItem } from "@/components/ui/bento-grid";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import featureCloset from "@/assets/feature-closet-scanner.jpg";
import featureDna from "@/assets/feature-style-dna.jpg";
import featureOutfit from "@/assets/feature-outfit-gen.jpg";
import featureChat from "@/assets/feature-ai-chat.jpg";
import featureAnalytics from "@/assets/feature-analytics.jpg";
import featureShopping from "@/assets/feature-shopping.jpg";

const featureImages: Record<string, string> = {
  "AI Closet Scanner": featureCloset,
  "Style DNA Engine": featureDna,
  "Smart Outfit Generator": featureOutfit,
  "AI Stylist Chat": featureChat,
  "Wardrobe Analytics": featureAnalytics,
  "Smart Shopping": featureShopping,
};

const featureItems: BentoItem[] = [
  {
    title: "AI Closet Scanner",
    meta: "Auto-detect",
    description: "Upload photos and let AI auto-detect category, color, style, season, and occasion for every item.",
    icon: <Shirt className="w-4 h-4 text-primary" />,
    status: "Smart",
    tags: ["Vision", "AI"],
    colSpan: 2,
    hasPersistentHover: true,
  },
  {
    title: "Style DNA Engine",
    meta: "Personalized",
    description: "Our AI builds your unique style profile — understanding your preferences, lifestyle, and fashion goals.",
    icon: <Brain className="w-4 h-4 text-primary" />,
    status: "Active",
    tags: ["Profile", "DNA"],
  },
  {
    title: "Smart Outfit Generator",
    meta: "Context-aware",
    description: "Context-aware outfits generated from YOUR closet, considering weather, events, and your mood.",
    icon: <Palette className="w-4 h-4 text-primary" />,
    status: "Live",
    tags: ["Weather", "Mood"],
    colSpan: 2,
  },
  {
    title: "AI Stylist Chat",
    meta: "24/7",
    description: "Ask your personal AI stylist anything. It knows your closet, body, and style DNA intimately.",
    icon: <MessageSquare className="w-4 h-4 text-primary" />,
    status: "New",
    tags: ["Chat", "AI"],
  },
  {
    title: "Wardrobe Analytics",
    meta: "Insights",
    description: "Cost per wear tracking, underused item alerts, category breakdowns, and sustainability scores.",
    icon: <BarChart3 className="w-4 h-4 text-primary" />,
    status: "Pro",
    tags: ["Stats", "Tracking"],
    colSpan: 2,
    hasPersistentHover: true,
  },
  {
    title: "Smart Shopping",
    meta: "Recommendations",
    description: "AI identifies gaps in your wardrobe and recommends the perfect pieces to complete your style.",
    icon: <ShoppingBag className="w-4 h-4 text-primary" />,
    status: "Beta",
    tags: ["Shop", "Gaps"],
  },
];

const Features = () => {
  return (
    <section className="relative py-32 px-4 overflow-hidden" id="features">
      {/* SVG pattern background */}
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
          className="text-center mb-12"
        >
          <p className="text-primary font-sans font-semibold text-sm tracking-widest uppercase mb-4">Capabilities</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            Everything You Need to <span className="gold-text">Look Incredible</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 max-w-7xl mx-auto [&_.glowing-effect]:hidden [&_.glowing-effect]:md:block">
            {featureItems.map((item, index) => (
              <div
                key={index}
                className={`relative list-none min-h-[12rem] ${item.colSpan === 2 ? "md:col-span-2" : "col-span-1"}`}
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
                   <div className="relative flex h-full flex-col justify-between gap-4 overflow-hidden rounded-xl border-[0.75px] border-border bg-background p-6 shadow-sm">
                     {/* Feature illustration */}
                     {featureImages[item.title] && (
                       <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.12] pointer-events-none">
                         <img
                           src={featureImages[item.title]}
                           alt=""
                           className="w-full h-full object-cover rounded-tr-xl"
                           loading="lazy"
                         />
                       </div>
                     )}
                     <div className="flex items-center justify-between">
                       <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted group-hover:bg-primary/10 transition-all duration-300">
                         {item.icon}
                       </div>
                       <span className="text-xs font-medium px-2 py-1 rounded-lg backdrop-blur-sm bg-muted text-muted-foreground">
                         {item.status || "Active"}
                       </span>
                     </div>

                    <div className="space-y-2">
                      <h3 className="font-medium text-foreground tracking-tight text-[15px]">
                        {item.title}
                        <span className="ml-2 text-xs text-muted-foreground font-normal">
                          {item.meta}
                        </span>
                      </h3>
                      <p className="text-sm text-muted-foreground leading-snug">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        {item.tags?.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 rounded-md bg-muted backdrop-blur-sm"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {item.cta || "Explore →"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
