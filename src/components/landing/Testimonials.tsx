import { motion } from "framer-motion";
import { DollarSign, TrendingUp, ArrowUpRight, Wallet, BarChart3, Zap } from "lucide-react";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import { useRef, useState, useEffect } from "react";
import { useInView } from "framer-motion";

const AnimatedCounter = ({ target, prefix = "", suffix = "" }: { target: number; prefix?: string; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

const revenueStories = [
  {
    id: 1,
    month: "March 2026",
    revenue: "$47,832",
    growth: "+214%",
    source: "Subscription Revenue",
    description: "Our Pro and Elite plans drove a 214% increase in recurring revenue. Members who upgraded from Starter stayed 3.2× longer.",
    icon: Wallet,
    accent: "from-primary/20 to-primary/5",
  },
  {
    id: 2,
    month: "February 2026",
    revenue: "$31,450",
    growth: "+178%",
    source: "Elite Tier Upsells",
    description: "Virtual Try-On and Trend Intelligence became the top reasons members upgraded to Elite. Average revenue per user hit $34.",
    icon: TrendingUp,
    accent: "from-emerald-500/15 to-emerald-500/5",
  },
  {
    id: 3,
    month: "January 2026",
    revenue: "$22,190",
    growth: "+96%",
    source: "New Member Signups",
    description: "Holiday campaign brought 847 new paid members in 30 days. Zero free trials — identity-based selling converted at 12.3%.",
    icon: Zap,
    accent: "from-amber-400/15 to-amber-400/5",
  },
];

const milestones = [
  { label: "Total Revenue", value: 673912, prefix: "$", suffix: "" },
  { label: "Paid Members", value: 4218, prefix: "", suffix: "+" },
  { label: "Avg. MRR Growth", value: 186, prefix: "", suffix: "%" },
  { label: "Retention Rate", value: 94, prefix: "", suffix: "%" },
];

const Testimonials = () => (
  <section className="relative py-20 md:py-32 overflow-hidden" id="proof">
    <AnimatedGradientBackground
      Breathing={true}
      animationSpeed={0.015}
      breathingRange={8}
      startingGap={130}
      topOffset={20}
      gradientColors={[
        "hsl(240 10% 6%)",
        "hsl(43 74% 15%)",
        "hsl(43 60% 20%)",
        "hsl(30 40% 12%)",
        "hsl(43 74% 10%)",
        "hsl(240 10% 8%)",
        "hsl(240 10% 6%)",
      ]}
      gradientStops={[0, 30, 45, 55, 70, 85, 100]}
      containerClassName="rounded-none"
    />

    <div className="relative z-10 max-w-6xl mx-auto px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
          <BarChart3 className="w-4 h-4 text-primary" />
          <span className="font-sans text-xs font-semibold text-primary tracking-wider uppercase">Our Revenue</span>
        </div>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
          How We Built <span className="gold-text">$673K+</span>
        </h2>
        <p className="mt-4 max-w-lg mx-auto font-sans text-sm text-muted-foreground leading-relaxed">
          No venture capital. No free trials. Just a product people pay for because it makes them look and feel incredible.
        </p>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-12"
      >
        {milestones.map((m) => (
          <div
            key={m.label}
            className="glass rounded-xl p-4 md:p-5 text-center border border-white/[0.06] hover:border-primary/20 transition-colors duration-300"
          >
            <div className="font-display text-2xl md:text-3xl font-bold text-foreground">
              <AnimatedCounter target={m.value} prefix={m.prefix} suffix={m.suffix} />
            </div>
            <div className="font-sans text-[10px] md:text-xs text-muted-foreground mt-1 tracking-wide uppercase">{m.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Revenue story cards */}
      <div className="space-y-4">
        {revenueStories.map((story, i) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="glass rounded-2xl overflow-hidden border border-white/[0.06] hover:border-primary/15 transition-all duration-300 group"
          >
            <div className="p-5 md:p-7 flex flex-col md:flex-row md:items-center gap-5">
              {/* Left: Icon + Revenue */}
              <div className="flex items-center gap-4 md:min-w-[240px]">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${story.accent} border border-white/[0.08] flex items-center justify-center shrink-0`}>
                  <story.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-tight">{story.revenue}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-sans text-[10px] text-muted-foreground uppercase tracking-wider">{story.month}</span>
                    <span className="inline-flex items-center gap-0.5 bg-emerald-500/15 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      <ArrowUpRight className="w-2.5 h-2.5" />
                      {story.growth}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Description */}
              <div className="flex-1">
                <div className="font-sans text-xs font-semibold text-primary/80 uppercase tracking-wider mb-1.5">{story.source}</div>
                <p className="font-sans text-sm text-muted-foreground leading-relaxed">{story.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom note */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="text-center mt-8 text-[11px] text-muted-foreground/50 font-sans"
      >
        Revenue figures are from LUXOR's internal analytics. Updated monthly.
      </motion.p>
    </div>
  </section>
);

export default Testimonials;
