import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import { useState } from "react";
import { TestimonialCard } from "@/components/ui/testimonial-cards";

import statsMain from "@/assets/revenue/stats-main.png";
import sales10k from "@/assets/revenue/sales-10k.png";
import grossSales390k from "@/assets/revenue/gross-sales-390k.jpg";
import sales105k from "@/assets/revenue/sales-105k.png";
import stripePayout from "@/assets/revenue/stripe-payout.jpg";
import sales81k from "@/assets/revenue/sales-81k.jpeg";
import sales673k from "@/assets/revenue/sales-673k.jpg";

const shuffleScreenshots = [
  { id: 1, image: sales673k, testimonial: "$673,912 total sales with 56% growth over 90 days.", author: "Shopify Dashboard" },
  { id: 2, image: sales105k, testimonial: "$105,525 generated with 1,300% increase and 3.35K orders.", author: "Shopify Analytics" },
  { id: 3, image: grossSales390k, testimonial: "€390,033 gross sales, 11,880 orders fulfilled, 391K sessions.", author: "Store Overview" },
  { id: 4, image: sales81k, testimonial: "$81,452 in total sales across 1.01K orders over 5 months.", author: "Sales Report" },
  { id: 5, image: sales10k, testimonial: "$10,349 in early-stage revenue with 330 orders at 1.88% conversion.", author: "Early Growth" },
  { id: 6, image: stripePayout, testimonial: "€48,579.84 Stripe payout confirmed and on its way.", author: "Stripe Payout" },
];

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
    <div className="relative -ml-[70px] h-[380px] w-[260px] md:-ml-[175px] md:h-[520px] md:w-[350px]">
      {visible.map((s, index) => (
        <TestimonialCard
          key={s.id}
          {...s}
          handleShuffle={handleShuffle}
          position={positions[index]}
        />
      ))}
    </div>
  );
};

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
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
          Real Results. <span className="gold-text">Real Revenue.</span>
        </h2>
        <p className="mt-4 max-w-lg mx-auto font-sans text-sm text-muted-foreground leading-relaxed">
          Unedited screenshots from our dashboards — no inflated numbers, no fake metrics. See the actual data.
        </p>
      </motion.div>

      {/* Hero screenshot */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="mb-12"
      >
        <div className="glass rounded-2xl overflow-hidden border border-white/[0.08] hover:border-primary/20 transition-all duration-500">
          <div className="relative">
            <img
              src={statsMain}
              alt="LEXOR® revenue dashboard showing real earnings across multiple platforms"
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

      {/* Shuffle cards */}
      <div className="grid place-content-center overflow-hidden px-4 py-8">
        <ShuffleSection />
      </div>
      <p className="text-center mt-4 text-xs text-muted-foreground/60 font-sans">
        Swipe left to see more →
      </p>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="text-center mt-8 text-[11px] text-muted-foreground/50 font-sans"
      >
        All screenshots are unedited. Revenue figures from live dashboards.
      </motion.p>
    </div>
  </section>
);

export default Testimonials;
