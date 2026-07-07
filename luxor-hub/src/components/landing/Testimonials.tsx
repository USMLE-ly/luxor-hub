import { motion } from "framer-motion";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal";
import {ArrowUpRight} from "@phosphor-icons/react";
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
  { id: 1, image: sales673k, testimonial: "$673,912 total sales — 56% growth in 90 days.", author: "Shopify Dashboard" },
  { id: 2, image: sales105k, testimonial: "$105,525 revenue — 1,300% increase, 3.35K orders.", author: "Shopify Analytics" },
  { id: 3, image: grossSales390k, testimonial: "€390,033 gross sales, 11,880 orders, 391K sessions.", author: "Store Overview" },
  { id: 4, image: sales81k, testimonial: "$81,452 across 1.01K orders over 5 months.", author: "Sales Report" },
  { id: 5, image: sales10k, testimonial: "$10,349 early-stage — 330 orders, 1.88% conversion.", author: "Early Growth" },
  { id: 6, image: stripePayout, testimonial: "€48,579.84 Stripe payout confirmed.", author: "Stripe Payout" },
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
  <section className="relative py-20 md:py-32" id="proof">
    <AnimatedGradientBackground
      Breathing={true}
      animationSpeed={0.015}
      breathingRange={8}
      startingGap={130}
      topOffset={20}
      gradientColors={[
        "hsl(0 0% 4%)",
        "hsl(0 0% 8%)",
        "hsl(0 0% 10%)",
        "hsl(0 0% 8%)",
        "hsl(0 0% 6%)",
        "hsl(0 0% 5%)",
        "hsl(0 0% 4%)",
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
          Unedited dashboard screenshots. No inflated numbers. Actual data.
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
        <div className="glass rounded-2xl overflow-hidden border border-border/30 hover:border-primary/20 transition-all duration-500">
          <div className="relative">
            <img
              src={statsMain}
              alt="LEXOR® revenue dashboard showing real earnings across multiple platforms"
              className="w-full h-auto rounded-t-2xl"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-forest/80 to-transparent" />
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
      <TestimonialMarquee />
      </motion.p>
    </div>
  </section>
);

/* ── User Testimonials Marquee ────────────────────────────── */

const userTestimonials = [
  {
    name: "Jessica M.",
    title: "Marketing Director, NYC",
    text: "I've always considered myself someone with decent style, but the sheer mental load of getting dressed every morning was draining in a way I didn't fully realize until it was gone. LEXOR didn't just organize my closet—it completely changed how I think about my clothes. The first time it suggested an outfit, it paired this old navy blazer I'd forgotten I owned with a silk camisole I only ever wore for dates, and suddenly I had a client meeting look that made me feel like I'd just spent $800 at a boutique. It's been four months and I haven't stared blankly into my closet once.",
    initial: "J",
    color: "from-amber-400/20 to-amber-600/10",
  },
  {
    name: "David R.",
    title: "Software Engineer, London",
    text: "I was skeptical. I installed LEXOR because my girlfriend kept suggesting I 'think about what I wear' and I wanted to prove I was fine. Turns out I was not fine. I owned four identical gray t-shirts. The AI pointed out that crew necks were shortening my neck visually, and switching to V-necks would balance my frame. I didn't even know that was a thing. I went from someone who 'didn't care about clothes' to someone who gets stopped by coworkers asking where I bought my jacket. The jacket is from ASOS, 2019. It was buried in my closet. LEXOR just knew.",
    initial: "D",
    color: "from-emerald-400/20 to-emerald-600/10",
  },
  {
    name: "Aisha K.",
    title: "Architect, Dubai",
    text: "Fashion for me has always been about geometry—how things fall, how they frame the body, how light interacts with texture. The body analysis feature was surprisingly accurate. Seeing it visualized on the mannequin—being able to rotate it and see how different silhouettes actually land on my body—that changed how I shop. My husband noticed before I did. He said 'you seem more confident when you walk out the door.' And he's right. Because I'm not guessing anymore.",
    initial: "A",
    color: "from-gold/20 to-amber-500/10",
  },
];

const TestimonialMarquee = () => (
  <div className="mt-24 md:mt-32">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-10"
    >
      <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
        What Our <span className="gold-text">Users Say</span>
      </h2>
      <p className="mt-4 max-w-lg mx-auto font-sans text-sm text-muted-foreground leading-relaxed">
        Real people. Real wardrobes. Real results.
      </p>
    </motion.div>

    <div className="relative flex overflow-hidden marquee-fade-mask">
      <div className="flex shrink-0 animate-marquee items-stretch gap-6 [--duration:45s] [--gap:1.5rem]">
        {[...userTestimonials, ...userTestimonials].map((t, i) => (
          <div
            key={`a-${i}`}
            className="w-[360px] md:w-[420px] shrink-0 rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-6 flex flex-col hover:border-primary/30 transition-all duration-500"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center border border-white/10`}>
                <span className="text-sm font-bold text-foreground">{t.initial}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground font-sans">{t.name}</p>
                <p className="text-[10px] text-muted-foreground font-sans tracking-wide">{t.title}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground/90 leading-relaxed font-sans flex-1 line-clamp-6">
              &ldquo;{t.text}&rdquo;
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Testimonials;
