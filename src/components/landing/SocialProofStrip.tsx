import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useInView } from "framer-motion";

interface AnimatedCounterProps {
  target: number;
  suffix: string;
  duration?: number;
}

const AnimatedCounter = ({ target, suffix, duration = 2000 }: AnimatedCounterProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(Math.floor(current * 10) / 10);
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [isInView, target, duration]);

  const displayValue = target % 1 !== 0
    ? count.toFixed(1)
    : Math.floor(count).toLocaleString();

  return (
    <span ref={ref} className="tabular-nums">
      {displayValue}
      <span className="text-primary">{suffix}</span>
    </span>
  );
};

const mediaBadges = ["Vogue", "GQ", "Forbes", "Elle"];

const stats = [
  { value: 12, suffix: "K+", label: "Stopped Wasting Money on Wrong Clothes" },
  { value: 2.4, suffix: "M", label: "Saved on Impulse Buys" },
  { value: 98, suffix: "%", label: "Would Never Go Back" },
  { value: 45, suffix: "s", label: "Morning Decision Time" },
];

const SocialProofStrip = () => (
  <section className="py-16 border-y border-border bg-muted/30">
    <div className="max-w-5xl mx-auto px-4">
      {/* As Featured In — text badges */}
      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-10">
        <span className="font-sans text-[10px] text-muted-foreground tracking-widest uppercase">As Featured In</span>
        {mediaBadges.map((name, i) => (
          <span key={name} className="flex items-center gap-4 md:gap-8">
            <span className="font-display text-lg md:text-xl font-bold text-muted-foreground/50 tracking-[0.2em] uppercase select-none">
              {name}
            </span>
            {i < mediaBadges.length - 1 && (
              <span className="hidden md:block w-px h-5 bg-border" />
            )}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: i * 0.1 }}
            className="text-center relative"
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-8 bg-primary/40 rounded-full hidden md:block" />
            <p className="font-display text-4xl md:text-5xl font-bold text-foreground">
              {stat.value === 2.4 ? "$" : ""}
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
            </p>
            {/* Gold underline accent */}
            <div className="mx-auto mt-2 w-8 h-0.5 rounded-full bg-primary/30" />
            <p className="font-sans text-sm text-muted-foreground mt-2">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default SocialProofStrip;
