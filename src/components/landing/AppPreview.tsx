import { useNavigate } from "react-router-dom";
import { ContainerScroll } from "@/components/ui/container-scroll";
import { GradientButton } from "@/components/ui/gradient-button";
import { motion } from "framer-motion";
import { Diamond, TrendingUp, Palette, Calendar, ShoppingBag, BarChart3, MessageSquare } from "lucide-react";

const outfitThumbs = [
  { label: "Casual Friday", gradient: "from-amber-700 via-stone-300 to-blue-900" },
  { label: "Date Night", gradient: "from-zinc-900 via-rose-800 to-stone-500" },
  { label: "Business", gradient: "from-slate-700 via-white to-amber-600" },
];

const AppPreview = () => {
  const navigate = useNavigate();
  return (
    <section className="relative overflow-hidden bg-background">
      <ContainerScroll
        titleComponent={
          <div className="flex flex-col items-center gap-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-sans font-medium tracking-wide">
              <Sparkles className="w-4 h-4" /> App Preview
            </span>
            <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight">
              Your Style Command Center
            </h2>
            <p className="text-muted-foreground font-sans text-lg max-w-2xl">
              Everything you need to master your personal style — powered by AI, designed for you.
            </p>
            <GradientButton onClick={() => navigate("/auth")} className="mt-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Try It Free
            </GradientButton>
          </div>
        }
      >
        {/* Mock Dashboard UI */}
        <div className="h-full w-full p-4 md:p-6 overflow-hidden bg-background rounded-xl relative">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-sans text-muted-foreground uppercase tracking-widest">Welcome back</p>
              <h3 className="font-display text-xl font-bold text-foreground">Your Style DNA</h3>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
          </div>

          {/* Style Formula Card */}
          <div className="rounded-2xl p-4 mb-4 bg-muted/50 border border-border">
            <p className="text-xs font-sans font-semibold uppercase tracking-widest text-muted-foreground mb-3">Style Formula</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Palette, label: "Color Type", value: "Warm Autumn" },
                { icon: TrendingUp, label: "Style Type", value: "Modern Classic" },
                { icon: BarChart3, label: "Body Type", value: "Inverted Triangle" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-card/80 border border-border/50">
                  <item.icon className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-sans text-muted-foreground">{item.label}</span>
                  <span className="text-xs font-sans font-semibold text-foreground text-center">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Outfit suggestions with gradient swatches */}
          <div className="mb-4">
            <p className="text-xs font-sans font-semibold uppercase tracking-widest text-muted-foreground mb-2">Today's Outfits</p>
            <div className="grid grid-cols-3 gap-2">
              {outfitThumbs.map((outfit, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-3 flex flex-col gap-2">
                  <div className={`h-8 rounded-lg bg-gradient-to-r ${outfit.gradient}`} />
                  <span className="text-[10px] font-sans font-medium text-foreground">{outfit.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Chat widget with typing indicator */}
          <div className="rounded-xl border border-border bg-card p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-sans font-semibold text-foreground">AI Stylist</span>
            </div>
            <div className="flex items-center gap-1.5 pl-1">
              <motion.div className="w-1.5 h-1.5 rounded-full bg-primary/60" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
              <motion.div className="w-1.5 h-1.5 rounded-full bg-primary/60" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
              <motion.div className="w-1.5 h-1.5 rounded-full bg-primary/60" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
              <span className="text-[10px] text-muted-foreground ml-1">Typing...</span>
            </div>
          </div>

          {/* Analytics chart placeholder with animated line */}
          <div className="rounded-xl border border-border bg-card p-3 mb-4">
            <p className="text-[10px] font-sans font-semibold text-muted-foreground mb-2">Style Score Trend</p>
            <svg viewBox="0 0 200 40" className="w-full h-10">
              <motion.path
                d="M0,35 Q25,30 50,25 T100,15 T150,20 T200,5"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
              <motion.path
                d="M0,35 Q25,30 50,25 T100,15 T150,20 T200,5 L200,40 L0,40 Z"
                fill="hsl(var(--primary) / 0.1)"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 1 }}
              />
            </svg>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Calendar, label: "Calendar", count: "3 events" },
              { icon: ShoppingBag, label: "Closet", count: "48 items" },
              { icon: TrendingUp, label: "Style Score", count: "100/100" },
              { icon: BarChart3, label: "Analytics", count: "View" },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-3 flex flex-col items-center gap-2 hover-lift cursor-default">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs font-sans font-semibold text-foreground">{item.label}</span>
                <span className="text-[10px] font-sans text-muted-foreground">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </ContainerScroll>
    </section>
  );
};

export default AppPreview;
