import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import { useState } from "react";
import { TestimonialCard } from "@/components/ui/testimonial-cards";
import {
  CardStackScroll,
  CardsContainer,
  CardTransformed,
  ReviewStars,
} from "@/components/ui/animated-cards-stack";

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

const TESTIMONIALS = [
  {
    id: "testimonial-1",
    name: "Sarah K.",
    profession: "Shopify Store Owner",
    rating: 5,
    description:
      "LEXOR completely transformed how I run my store. Revenue jumped 340% in the first quarter. The AI recommendations are scarily accurate.",
  },
  {
    id: "testimonial-2",
    name: "Marcus T.",
    profession: "E-commerce Entrepreneur",
    rating: 4.5,
    description:
      "I was skeptical at first, but the results speak for themselves. Went from $2K to $18K monthly within 90 days. Best investment I've made.",
  },
  {
    id: "testimonial-3",
    name: "Amelia R.",
    profession: "Fashion Brand Founder",
    rating: 5,
    description:
      "The platform pays for itself ten times over. My conversion rate tripled and customer retention is at an all-time high.",
  },
  {
    id: "testimonial-4",
    name: "David L.",
    profession: "Dropshipping Expert",
    rating: 5,
    description:
      "Finally a tool that actually delivers on its promises. The analytics alone saved me hours every week. Revenue is up 200%.",
  },
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

    {/* Animated card stack testimonials */}
    <div className="relative z-10 mt-20 md:mt-32 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h3 className="font-display text-2xl md:text-4xl font-bold text-foreground">
          What Our <span className="gold-text">Clients Say</span>
        </h3>
        <p className="mt-3 max-w-md mx-auto font-sans text-sm text-muted-foreground leading-relaxed">
          Scroll to reveal real feedback from real businesses.
        </p>
      </motion.div>

      <CardStackScroll className="container h-[200vh]">
        <div className="sticky left-0 top-0 h-svh w-full py-12">
          <CardsContainer className="mx-auto size-full h-[450px] w-[350px]">
            {TESTIMONIALS.map((testimonial, index) => (
              <CardTransformed
                arrayLength={TESTIMONIALS.length}
                key={testimonial.id}
                variant="dark"
                index={index + 2}
                role="article"
                aria-labelledby={`card-${testimonial.id}-title`}
                aria-describedby={`card-${testimonial.id}-content`}
              >
                <div className="flex flex-col items-center space-y-4 text-center">
                  <ReviewStars
                    className="text-primary"
                    rating={testimonial.rating}
                  />
                  <div className="mx-auto w-4/5 text-lg text-primary-foreground">
                    <blockquote>"{testimonial.description}"</blockquote>
                  </div>
                </div>
                <div className="text-center">
                  <span className="block text-lg font-semibold tracking-tight text-foreground md:text-xl">
                    {testimonial.name}
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    {testimonial.profession}
                  </span>
                </div>
              </CardTransformed>
            ))}
          </CardsContainer>
        </div>
      </CardStackScroll>
    </div>
  </section>
);

export default Testimonials;
