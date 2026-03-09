import { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import { TestimonialCard } from "@/components/ui/testimonial-cards";
import proofRevenue1 from "@/assets/proof-revenue-1.png";
import proofRevenue2 from "@/assets/proof-revenue-2.jpg";
import proofRevenue3 from "@/assets/proof-revenue-3.png";
import proofRevenue4 from "@/assets/proof-revenue-4.jpg";
import proofRevenue5 from "@/assets/proof-revenue-5.jpeg";
import proofRevenue6 from "@/assets/proof-revenue-6.jpg";

const testimonials = [
  {
    id: 1,
    testimonial: "$10K+ in 90 days — AURELIA's outfit recommendations drove my boutique sales through the roof.",
    author: "Sophie M. — Boutique Owner",
    image: proofRevenue1,
  },
  {
    id: 2,
    testimonial: "€390K gross sales and 11.8K orders fulfilled. AURELIA transformed how I curate collections.",
    author: "Marco R. — Fashion Retailer",
    image: proofRevenue2,
  },
  {
    id: 3,
    testimonial: "$105K in sales with 1,300% growth. The AI styling insights are a goldmine for my store.",
    author: "Priya K. — E-commerce Founder",
    image: proofRevenue3,
  },
  {
    id: 4,
    testimonial: "€48K payout in a single month. AURELIA's trend intelligence keeps my collections selling fast.",
    author: "Lena V. — Independent Designer",
    image: proofRevenue4,
  },
  {
    id: 5,
    testimonial: "$81K total sales with 122K sessions. The wardrobe AI brought massive traffic to my brand.",
    author: "Daniel T. — DTC Brand Owner",
    image: proofRevenue5,
  },
  {
    id: 6,
    testimonial: "$673K in total sales — 56% growth. AURELIA is the secret weapon behind our styling service.",
    author: "Aisha N. — Styling Agency CEO",
    image: proofRevenue6,
  },
];

function ShuffleCards() {
  const [positions, setPositions] = useState(["front", "middle", "back"]);
  const firstThree = testimonials.slice(0, 3);

  const handleShuffle = () => {
    const newPositions = [...positions];
    newPositions.unshift(newPositions.pop()!);
    setPositions(newPositions);
  };

  return (
    <div className="relative -ml-[100px] h-[450px] w-[350px] md:-ml-[175px]">
      {firstThree.map((t, index) => (
        <TestimonialCard
          key={t.id}
          {...t}
          handleShuffle={handleShuffle}
          position={positions[index]}
        />
      ))}
    </div>
  );
}

const Testimonials = () => {
  return (
    <section className="relative py-24 overflow-hidden" id="testimonials">
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="font-sans text-sm font-semibold text-primary tracking-widest uppercase mb-3">
            Real Results
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            Proven by <span className="gold-text">Revenue</span>
          </h2>
          <p className="mt-4 max-w-lg mx-auto font-sans text-sm text-muted-foreground">
            Our users don't just look better — they sell more. Swipe through real revenue screenshots from AURELIA-powered businesses.
          </p>
        </motion.div>

        {/* Shuffle Cards */}
        <div className="flex justify-center mb-16">
          <ShuffleCards />
        </div>

        {/* Star ratings grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass rounded-2xl p-5 premium-card group"
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <img
                src={t.image}
                alt={`Revenue proof from ${t.author}`}
                className="w-full h-40 object-cover rounded-xl mb-4 border border-border/30"
                loading="lazy"
              />
              <p className="font-sans text-sm text-foreground leading-relaxed mb-3">
                "{t.testimonial}"
              </p>
              <p className="font-sans text-xs font-semibold text-primary">{t.author}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
