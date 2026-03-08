import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Camera, User, Wand2, TrendingUp } from "lucide-react";
import { useRef } from "react";
import { TextReveal } from "@/components/ui/animated-text-reveal";

const steps = [
  { icon: Camera, title: "Scan Closet", desc: "Upload photos and let AI catalog every item in seconds.", num: "01" },
  { icon: User, title: "Style DNA", desc: "We build a unique profile of your taste, lifestyle, and goals.", num: "02" },
  { icon: Wand2, title: "AI Outfits", desc: "Get context-aware outfits generated from your own wardrobe.", num: "03" },
  { icon: TrendingUp, title: "Optimize", desc: "Track insights, improve your score, and refine your look.", num: "04" },
];

const GoldDivider = () => (
  <div className="flex items-center gap-4 my-10 max-w-xs mx-auto">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/40" />
    <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/40" />
  </div>
);

function TimelineNode({ step, index }: { step: typeof steps[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className="absolute left-1/2 -translate-x-1/2 z-10">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: index * 0.15, type: "spring", stiffness: 300 }}
        className="relative"
      >
        <div className="w-14 h-14 rounded-full bg-card border-2 border-primary/40 flex items-center justify-center shadow-[0_0_20px_hsl(var(--primary)/0.15)] transition-shadow">
          <motion.div
            initial={{ rotate: -30, scale: 0.8 }}
            animate={isInView ? { rotate: 0, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: index * 0.15 + 0.2 }}
          >
            <step.icon className="w-6 h-6 text-primary" />
          </motion.div>
        </div>
        {/* Gold pulse ring on reveal */}
        {isInView && (
          <motion.div
            className="absolute inset-0 rounded-full border border-primary/40"
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 1.2, delay: index * 0.15 + 0.1 }}
          />
        )}
      </motion.div>
    </div>
  );
}

const HowItWorks = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  // Animated line that draws as user scrolls
  const lineHeight = useTransform(scrollYProgress, [0.15, 0.75], ["0%", "100%"]);

  return (
    <section ref={sectionRef} className="relative py-24 px-4 overflow-hidden" id="how-it-works">
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: `url('/patterns/linear-texture.svg')`, backgroundSize: "400px 400px", backgroundRepeat: "repeat" }}
      />
      <div className="relative max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <p className="text-primary font-sans font-semibold text-sm tracking-widest uppercase mb-4">How It Works</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            Four Steps to <span className="gold-text">Effortless Style</span>
          </h2>
        </motion.div>

        <GoldDivider />

        {/* Vertical Timeline — Desktop */}
        <div className="hidden md:block relative mt-16">
          {/* Background line (dim) */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-border" />
          {/* Animated drawing line */}
          <motion.div
            className="absolute left-1/2 top-0 w-px -translate-x-1/2 bg-gradient-to-b from-primary/60 via-primary/40 to-primary/20 origin-top"
            style={{ height: lineHeight }}
          />

          <div className="flex flex-col gap-0">
            {steps.map((step, i) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: i * 0.12 }}
                  className="relative flex items-center"
                  style={{ minHeight: "180px" }}
                >
                  <TimelineNode step={step} index={i} />

                  <div className={`w-[calc(50%-3.5rem)] ${isLeft ? "mr-auto pr-8" : "ml-auto pl-8"}`}>
                    <motion.div
                      className="group glass rounded-2xl p-6 border border-border hover:border-primary/30 transition-all duration-300 cursor-default"
                      whileHover={{ y: -4, boxShadow: "0 12px 40px -12px hsl(var(--primary) / 0.15)" }}
                    >
                      <span className="font-display text-5xl font-light text-primary/15 leading-none select-none block mb-2">
                        {step.num}
                      </span>
                      <h3 className="font-display text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Horizontal Scroll — Mobile */}
        <div className="md:hidden mt-10 -mx-4 px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 snap-x snap-mandatory pb-4" style={{ minWidth: "min-content" }}>
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="snap-center shrink-0 w-[280px]"
              >
                <div className="glass rounded-2xl p-6 border border-border h-full flex flex-col items-center text-center">
                  <span className="font-display text-4xl font-light text-primary/20 leading-none mb-3 select-none">
                    {step.num}
                  </span>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <step.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display text-base font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          {/* Snap indicators */}
          <div className="flex justify-center gap-1.5 mt-4">
            {steps.map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/30" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
