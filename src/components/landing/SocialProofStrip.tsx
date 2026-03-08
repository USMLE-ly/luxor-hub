import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Zap, Star, Users, Heart } from "lucide-react";
import NumberTicker from "@/components/ui/number-ticker";

const stats = [
  { icon: Zap, value: 50000, suffix: "+", label: "Outfits Generated", format: (n: number) => `${Math.round(n / 1000)}K` },
  { icon: Star, value: 49, suffix: "", label: "App Rating", format: (n: number) => (n / 10).toFixed(1) },
  { icon: Users, value: 12000, suffix: "+", label: "Active Users", format: (n: number) => `${Math.round(n / 1000)}K` },
  { icon: Heart, value: 98, suffix: "%", label: "Satisfaction", format: (n: number) => `${n}` },
];

const SocialProofStrip = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section ref={ref} className="relative py-20 overflow-hidden">
      {/* Grain texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/[0.03] to-transparent" />

      <div className="relative max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="relative group"
            >
              {/* Glassmorphic card */}
              <div className="flex flex-col items-center text-center gap-2 p-6 rounded-2xl bg-card/40 backdrop-blur-md border border-border/50 hover:border-primary/30 transition-all duration-500">
                {/* Gold top accent line */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-12 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent transition-all duration-500" />
                
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                  <stat.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="font-display text-3xl md:text-4xl font-bold gold-shimmer-text">
                  <NumberTicker value={stat.value} format={stat.format} suffix={stat.suffix} />
                </span>
                <span className="text-xs font-sans text-muted-foreground tracking-wide uppercase">
                  {stat.label}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofStrip;
