import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Shirt, ScanFace, CloudSun, ShieldCheck } from "lucide-react";

const uvps = [
  { icon: Shirt, label: "Uses Your Existing Closet", sub: "No shopping required" },
  { icon: ScanFace, label: "Learns Your Body", sub: "Not a generic mannequin" },
  { icon: CloudSun, label: "Weather-Checked Daily", sub: "Practical value every morning" },
  { icon: ShieldCheck, label: "30-Day Money Back", sub: "Zero risk" },
];

const CountUp = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 1500;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref} className="font-display text-2xl md:text-3xl font-bold text-foreground">
      {count.toLocaleString()}{suffix}
    </span>
  );
};

const stats = [
  { value: 2400, suffix: "+", label: "Members" },
  { value: 98, suffix: "%", label: "Satisfaction" },
  { value: 15, suffix: "min", label: "Avg. saved daily" },
];

const SocialProofStrip = () => (
  <section className="py-10 md:py-14 border-y border-border bg-muted/20">
    <div className="max-w-5xl mx-auto px-4 space-y-10">
      {/* Counter stats */}
      <div className="grid grid-cols-3 gap-4 md:gap-8">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-center text-center gap-1">
            <CountUp target={s.value} suffix={s.suffix} />
            <p className="font-sans text-xs md:text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* UVP icons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {uvps.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center text-center gap-2"
          >
            <item.icon className="w-6 h-6 text-foreground" />
            <p className="font-sans text-sm font-semibold text-foreground leading-tight">{item.label}</p>
            <p className="font-sans text-xs text-muted-foreground">{item.sub}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default SocialProofStrip;
