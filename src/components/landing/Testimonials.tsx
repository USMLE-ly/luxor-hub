import { motion } from "framer-motion";
import { ShieldCheck, TrendingUp, BadgeCheck } from "lucide-react";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import { useRef, useState, useEffect } from "react";
import { useInView } from "framer-motion";
import { TestimonialCard } from "@/components/ui/testimonial-cards";
import proofRevenue1 from "@/assets/proof-revenue-1.png";
import proofRevenue2 from "@/assets/proof-revenue-2.jpg";
import proofRevenue3 from "@/assets/proof-revenue-3.png";
import proofRevenue4 from "@/assets/proof-revenue-4.jpg";
import proofRevenue5 from "@/assets/proof-revenue-5.jpeg";
import proofRevenue6 from "@/assets/proof-revenue-6.jpg";

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

const heroProof = {
  image: proofRevenue6,
  stat: "$673,912",
  label: "Total Sales",
  caption: "A styling agency went from plateauing at $400K to clearing $673K in one year. The only change was AURELIA.",
};

const shuffleProofs = [
  {
    id: 1,
    image: proofRevenue1,
    testimonial: "She launched a boutique with zero fashion background. 90 days later, AURELIA's recommendations drove $10K in sales.",
    author: "$10,349 · 90-Day Revenue",
  },
  {
    id: 2,
    image: proofRevenue2,
    testimonial: "11,880 orders fulfilled. This retailer used AURELIA's curation engine to stock exactly what customers wanted.",
    author: "€390,033 · Gross Sales",
  },
  {
    id: 3,
    image: proofRevenue3,
    testimonial: "1,300% growth. The owner credits AURELIA's trend intelligence for turning a dead Shopify store into a top seller.",
    author: "$105,525 · Total Sales",
  },
  {
    id: 4,
    image: proofRevenue4,
    testimonial: "One Stripe payout. One month. An independent designer who let AURELIA handle the product strategy.",
    author: "€48,579 · Single Payout",
  },
  {
    id: 5,
    image: proofRevenue5,
    testimonial: "122K sessions and $81K in sales. All organic traffic. AURELIA's wardrobe AI turned browsers into buyers.",
    author: "$81,452 · Total Revenue",
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
    setStartIdx((prev) => (prev + 1) % shuffleProofs.length);
  };

  const visibleProofs = [0, 1, 2].map((offset) => shuffleProofs[(startIdx + offset) % shuffleProofs.length]);

  return (
    <div className="relative h-[450px] w-[350px] mx-auto md:mx-0">
      {visibleProofs.map((proof, index) => (
        <TestimonialCard
          key={proof.id}
          {...proof}
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
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span className="font-sans text-xs font-semibold text-primary tracking-wider uppercase">Verified Results</span>
        </div>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
          They Didn't Believe It <span className="gold-text">Either</span>
        </h2>
        <p className="mt-4 max-w-lg mx-auto font-sans text-sm text-muted-foreground">
          Unedited screenshots. Real numbers. Actual businesses that switched to AURELIA and watched the revenue follow.
        </p>
      </motion.div>

      {/* Hero $673,912 card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="glass rounded-2xl overflow-hidden premium-card group transition-transform duration-300 hover:rotate-[0.5deg] mb-12"
      >
        <div className="relative">
          <img
            src={heroProof.image}
            alt={`Revenue proof: ${heroProof.stat}`}
            className="w-full object-cover object-top h-72 md:h-80"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-background to-transparent h-16" />
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/15 backdrop-blur-sm border border-green-500/20">
            <BadgeCheck className="w-3 h-3 text-green-400" />
            <span className="text-[10px] font-semibold text-green-400 font-sans">Verified</span>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="font-display text-xl font-bold text-primary">
              <AnimatedStat value={heroProof.stat} />
            </span>
            <span className="font-sans text-xs text-muted-foreground">· {heroProof.label}</span>
          </div>
          <div className="w-12 h-0.5 rounded-full bg-primary/40 mb-3" />
          <p className="font-sans text-sm text-muted-foreground leading-relaxed">{heroProof.caption}</p>
        </div>
      </motion.div>

      {/* Shuffle cards for remaining proofs */}
      <div className="flex justify-center md:justify-start pl-0 md:pl-12">
        <ShuffleSection />
      </div>
      <p className="text-center md:text-left md:pl-12 mt-6 text-xs text-muted-foreground/60 font-sans">
        Swipe to see more results →
      </p>
    </div>
  </section>
);

export default Testimonials;
