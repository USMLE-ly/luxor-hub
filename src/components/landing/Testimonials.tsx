import { motion } from "framer-motion";
import { ShieldCheck, TrendingUp, BadgeCheck } from "lucide-react";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import { useRef, useState, useEffect } from "react";
import { useInView } from "framer-motion";
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

const proofs = [
  {
    image: proofRevenue6,
    stat: "$673,912",
    label: "Total Sales",
    caption: "A styling agency went from plateauing at $400K to clearing $673K in one year. The only change was AURELIA.",
    hero: true,
  },
  {
    image: proofRevenue1,
    stat: "$10,349",
    label: "90-Day Revenue",
    caption: "She launched a boutique with zero fashion background. 90 days later, AURELIA's recommendations drove $10K in sales.",
  },
  {
    image: proofRevenue2,
    stat: "€390,033",
    label: "Gross Sales",
    caption: "11,880 orders fulfilled. This retailer used AURELIA's curation engine to stock exactly what customers wanted.",
  },
  {
    image: proofRevenue3,
    stat: "$105,525",
    label: "Total Sales",
    caption: "1,300% growth. The owner credits AURELIA's trend intelligence for turning a dead Shopify store into a top seller.",
  },
  {
    image: proofRevenue4,
    stat: "€48,579",
    label: "Single Payout",
    caption: "One Stripe payout. One month. An independent designer who let AURELIA handle the product strategy.",
  },
  {
    image: proofRevenue5,
    stat: "$81,452",
    label: "Total Revenue",
    caption: "122K sessions and $81K in sales. All organic traffic. AURELIA's wardrobe AI turned browsers into buyers.",
  },
];

const ProofCard = ({ p, i, isHero }: { p: typeof proofs[0]; i: number; isHero?: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ delay: i * 0.08, duration: 0.5 }}
    className={`glass rounded-2xl overflow-hidden premium-card group transition-transform duration-300 hover:rotate-[0.5deg] ${isHero ? "md:col-span-2 lg:col-span-3" : "snap-center shrink-0 w-[85vw] sm:w-auto"}`}
  >
    <div className="relative">
      <img
        src={p.image}
        alt={`Revenue proof: ${p.stat}`}
        className={`w-full object-cover object-top ${isHero ? "h-72 md:h-80" : "h-52"}`}
        loading="lazy"
      />
      {/* Gold gradient overlay on hero card */}
      {isHero && (
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
      )}
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
          <AnimatedStat value={p.stat} />
        </span>
        <span className="font-sans text-xs text-muted-foreground">· {p.label}</span>
      </div>
      <div className="w-12 h-0.5 rounded-full bg-primary/40 mb-3" />
      <p className="font-sans text-sm text-muted-foreground leading-relaxed">{p.caption}</p>
    </div>
  </motion.div>
);

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

      {/* Hero proof card */}
      <ProofCard p={proofs[0]} i={0} isHero />

      {/* Remaining cards — horizontal scroll on mobile */}
      <div className="flex gap-6 mt-6 overflow-x-auto snap-x snap-mandatory pb-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible md:snap-none md:pb-0 scrollbar-hide">
        {proofs.slice(1).map((p, i) => (
          <ProofCard key={i} p={p} i={i + 1} />
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
