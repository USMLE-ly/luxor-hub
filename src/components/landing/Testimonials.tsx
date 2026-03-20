import { motion } from "framer-motion";
import { BarChart3, ArrowUpRight } from "lucide-react";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import { useRef, useState, useEffect } from "react";
import { useInView } from "framer-motion";

import statsMain from "@/assets/revenue/stats-main.png";
import sales10k from "@/assets/revenue/sales-10k.png";
import grossSales390k from "@/assets/revenue/gross-sales-390k.jpg";
import sales105k from "@/assets/revenue/sales-105k.png";
import stripePayout from "@/assets/revenue/stripe-payout.jpg";
import sales81k from "@/assets/revenue/sales-81k.jpeg";
import sales673k from "@/assets/revenue/sales-673k.jpg";

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

const shuffleScreenshots = [
  { id: 1, src: sales673k, label: "$673,912 Total Sales", growth: "+56%" },
  { id: 2, src: sales105k, label: "$105,525 in 90 Days", growth: "+1,300%" },
  { id: 3, src: grossSales390k, label: "€390,033 Gross Sales", growth: "+198K%" },
  { id: 4, src: sales81k, label: "$81,452 in 5 Months", growth: "" },
  { id: 5, src: sales10k, label: "$10,349 Early Stage", growth: "+1.88%" },
  { id: 6, src: stripePayout, label: "€48,579 Stripe Payout", growth: "" },
];

const positionStyles: Record<string, string> = {
  front: "z-30 scale-100 translate-y-0 opacity-100",
  middle: "z-20 scale-[0.95] translate-y-4 opacity-80",
  back: "z-10 scale-[0.90] translate-y-8 opacity-60",
};

const ShuffleCard = ({
  src, label, growth, position, handleShuffle,
}: {
  src: string; label: string; growth: string; position: string; handleShuffle: () => void;
}) => (
  <motion.div
    onClick={handleShuffle}
    className={`absolute inset-0 cursor-pointer transition-all duration-500 ease-out ${positionStyles[position]}`}
    style={{ transformOrigin: "bottom center" }}
    whileTap={{ scale: 0.97 }}
  >
    <div className="glass rounded-2xl overflow-hidden border border-white/[0.08] h-full">
      <div className="relative h-full">
        <img src={src} alt={label} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-3 left-3.5 right-3.5">
          <p className="font-sans text-xs md:text-sm font-semibold text-white">{label}</p>
          {growth && (
            <span className="inline-flex items-center gap-0.5 text-emerald-400 text-[10px] font-bold mt-0.5">
              <ArrowUpRight className="w-2.5 h-2.5" />
              {growth}
            </span>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

const ShuffleSection = () => {
  const [positions, setPositions] = useState(["front", "middle", "back"]);
  const [startIdx, setStartIdx] = useState(0);

  const handleShuffle = () => {
    setPositions((prev) => {
      const n = [...prev];
      n.unshift(n.pop()!);
      return n;
    });
    setStartIdx((prev) => (prev + 1) % shuffleScreenshots.length);
  };

  const visible = [0, 1, 2].map((offset) => shuffleScreenshots[(startIdx + offset) % shuffleScreenshots.length]);

  return (
    <div className="relative h-[360px] w-[300px] md:h-[420px] md:w-[350px] mx-auto">
      {visible.map((s, i) => (
        <ShuffleCard key={s.id} src={s.src} label={s.label} growth={s.growth} position={positions[i]} handleShuffle={handleShuffle} />
      ))}
    </div>
  );
};

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
        className="text-center mb-12"
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
        className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10"
      >
        {milestones.map((m) => (
          <div key={m.label} className="glass rounded-xl p-4 md:p-5 text-center border border-white/[0.06] hover:border-primary/20 transition-colors duration-300">
            <div className="font-display text-2xl md:text-3xl font-bold text-foreground">
              <AnimatedCounter target={m.value} prefix={m.prefix} suffix={m.suffix} />
            </div>
            <div className="font-sans text-[10px] md:text-xs text-muted-foreground mt-1 tracking-wide uppercase">{m.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Hero screenshot */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="mb-10"
      >
        <div className="glass rounded-2xl overflow-hidden border border-white/[0.08] hover:border-primary/20 transition-all duration-500">
          <div className="relative">
            <img
              src={statsMain}
              alt="LUXOR revenue dashboard showing €758K total sales, $689K total sales, campaign performance, and conversion summary"
              className="w-full h-auto rounded-t-2xl"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
              <div>
                <p className="font-display text-lg md:text-xl font-bold text-white">Revenue Overview</p>
                <p className="font-sans text-xs text-white/60 mt-0.5">Multi-platform earnings across all channels</p>
              </div>
              <span className="inline-flex items-center gap-1 bg-emerald-500/20 backdrop-blur-sm text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-500/20">
                <ArrowUpRight className="w-3 h-3" />
                Live
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Shuffle stack */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <ShuffleSection />
        <p className="text-center mt-6 text-xs text-muted-foreground/60 font-sans">
          Tap to see more screenshots →
        </p>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="text-center mt-8 text-[11px] text-muted-foreground/50 font-sans"
      >
        Revenue figures from internal analytics. Updated monthly.
      </motion.p>
    </div>
  </section>
);

export default Testimonials;
