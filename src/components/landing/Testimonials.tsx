import { motion } from "framer-motion";
import { ShieldCheck, TrendingUp, BadgeCheck, Star } from "lucide-react";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import { useRef, useState, useEffect } from "react";
import { useInView } from "framer-motion";
import { TestimonialCard } from "@/components/ui/testimonial-cards";

const AnimatedStat = ({ value }: { value: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [visible, setVisible] = useState(false);
  useEffect(() => { if (isInView) setVisible(true); }, [isInView]);
  return (
    <span ref={ref} className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
      {value}
    </span>
  );
};

const heroTestimonial = {
  stat: "4.9 ★",
  label: "Average Rating",
  caption: "I used to spend 30 minutes every morning staring at my closet. Now LUXOR picks my outfit in seconds and I get compliments daily. It genuinely changed how I show up.",
  author: "Mariana L. — Elite Member",
};

const shuffleTestimonials = [
  {
    id: 1,
    testimonial: "My wardrobe is half the size it used to be but I look twice as good. LUXOR taught me what actually works for my body and coloring.",
    author: "Aiden K. — Pro Member",
  },
  {
    id: 2,
    testimonial: "I bought fewer clothes this year than ever before — and got more compliments than the last three years combined. The AI styling is unreal.",
    author: "Sophie T. — Elite Member",
  },
  {
    id: 3,
    testimonial: "My husband asked if I hired a personal stylist. No. I just subscribed to LUXOR. The outfit suggestions are scary accurate.",
    author: "Rachel M. — Pro Member",
  },
  {
    id: 4,
    testimonial: "As a guy who knows nothing about fashion, this app is a lifesaver. I finally look put-together without thinking about it.",
    author: "Derek W. — Starter Member",
  },
  {
    id: 5,
    testimonial: "The virtual try-on alone is worth the subscription. I stopped buying clothes that end up sitting unworn. Every purchase hits now.",
    author: "Priya N. — Elite Member",
  },
];
const ShuffleSection = () => {
  const [positions, setPositions] = useState(["front", "middle", "back"]);
  const [startIdx, setStartIdx] = useState(0);

  const handleShuffle = () => {
    setPositions((prev) => {
      const newPositions = [...prev];
      newPositions.unshift(newPositions.pop()!);
      return newPositions;
    });
    setStartIdx((prev) => (prev + 1) % shuffleTestimonials.length);
  };

  const visible = [0, 1, 2].map((offset) => shuffleTestimonials[(startIdx + offset) % shuffleTestimonials.length]);

  return (
    <div className="relative h-[520px] w-[350px] mx-auto md:mx-0">
      {visible.map((t, index) => (
        <TestimonialCard
          key={t.id}
          {...t}
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
          <Star className="w-4 h-4 text-primary" />
          <span className="font-sans text-xs font-semibold text-primary tracking-wider uppercase">What Members Say</span>
        </div>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
          Real People. Real <span className="gold-text">Style.</span>
        </h2>
        <p className="mt-4 max-w-lg mx-auto font-sans text-sm text-muted-foreground">
          LUXOR members who stopped guessing and started dressing with confidence every single day.
        </p>
      </motion.div>

      {/* Hero testimonial card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="glass rounded-2xl overflow-hidden premium-card group transition-transform duration-300 hover:rotate-[0.5deg] mb-12"
      >
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-primary fill-primary" />
            ))}
          </div>
          <p className="font-sans text-base md:text-lg text-foreground/90 leading-relaxed mb-6 italic">
            "{heroTestimonial.caption}"
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
              <span className="font-display text-sm font-bold text-primary">ML</span>
            </div>
            <div>
              <span className="block font-sans text-sm font-semibold text-foreground">{heroTestimonial.author}</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <BadgeCheck className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-semibold text-primary font-sans">Verified Member</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Shuffle cards */}
      <div className="flex justify-center md:justify-start pl-0 md:pl-12">
        <ShuffleSection />
      </div>
      <p className="text-center md:text-left md:pl-12 mt-6 text-xs text-muted-foreground/60 font-sans">
        Swipe to see more →
      </p>
    </div>
  </section>
);

export default Testimonials;
