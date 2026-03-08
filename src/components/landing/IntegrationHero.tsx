import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Sparkles } from "lucide-react";

const platforms = [
  { name: "Instagram", logo: "/logos/instagram.png" },
  { name: "Pinterest", logo: "/logos/pinterest.png" },
  { name: "Shopify", logo: "/logos/shopify.svg" },
  { name: "TikTok", logo: "/logos/tiktok.svg" },
  { name: "ASOS", textLogo: true },
  { name: "Zara", logo: "/logos/zara.png" },
];

/* SVG line from center to each platform node */
function ConnectionLine({ angle, delay }: { angle: number; delay: number }) {
  const r = 140;
  const x2 = 170 + Math.cos((angle * Math.PI) / 180) * r;
  const y2 = 170 + Math.sin((angle * Math.PI) / 180) * r;

  return (
    <motion.line
      x1="170" y1="170"
      x2={x2} y2={y2}
      stroke="hsl(var(--primary))"
      strokeWidth="1"
      strokeDasharray="6 4"
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 0.3 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
    />
  );
}

export default function IntegrationHero() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section ref={ref} className="relative py-20 md:py-28 overflow-hidden">
      <div className="relative max-w-5xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h3 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-3">
            Connects to your <span className="gold-text">favorite platforms</span>
          </h3>
          <p className="text-sm md:text-base text-muted-foreground font-sans max-w-md mx-auto">
            Sync your style across Instagram, Pinterest, Shopify, and more.
          </p>
        </motion.div>

        {/* Orbital Desktop */}
        <div className="hidden md:flex items-center justify-center">
          <div className="relative w-[340px] h-[340px]">
            {/* SVG connection lines */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 340 340">
              {platforms.map((_, i) => (
                <ConnectionLine
                  key={i}
                  angle={i * 60 - 90}
                  delay={0.2 + i * 0.08}
                />
              ))}
            </svg>

            {/* Center node */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-card border-2 border-primary/40 flex items-center justify-center shadow-[0_0_30px_hsl(var(--primary)/0.2)] z-10"
            >
              <Sparkles className="w-6 h-6 text-primary" />
            </motion.div>

            {/* Platform nodes in circle */}
            {platforms.map((p, i) => {
              const angle = (i * 60 - 90) * (Math.PI / 180);
              const r = 140;
              const x = 170 + Math.cos(angle) * r - 30;
              const y = 170 + Math.sin(angle) * r - 30;

              return (
                <motion.div
                  key={p.name}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={isInView ? { scale: 1, opacity: 1 } : {}}
                  transition={{ delay: 0.3 + i * 0.08, type: "spring", stiffness: 250, damping: 20 }}
                  whileHover={{ scale: 1.25, zIndex: 20 }}
                  className="absolute group"
                  style={{ left: x, top: y }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center group-hover:border-primary/40 group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)] transition-all duration-300 p-2.5">
                    {'textLogo' in p && p.textLogo ? (
                      <span className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors duration-300 tracking-wider">
                        ASOS
                      </span>
                    ) : (
                      <img src={p.logo} alt={p.name} className="w-full h-full object-contain" loading="lazy" />
                    )}
                  </div>
                  {/* Name tooltip */}
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="text-[10px] font-sans font-medium text-primary whitespace-nowrap">{p.name}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="md:hidden -mx-4 px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 snap-x snap-mandatory pb-4" style={{ minWidth: "min-content" }}>
            {platforms.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
                className="snap-center shrink-0 flex flex-col items-center gap-1.5"
              >
                <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center p-2.5">
                  {'textLogo' in p && p.textLogo ? (
                    <span className="text-sm font-bold text-muted-foreground tracking-wider">ASOS</span>
                  ) : (
                    <img src={p.logo} alt={p.name} className="w-full h-full object-contain" loading="lazy" />
                  )}
                </div>
                <span className="text-[10px] font-sans font-medium text-muted-foreground">{p.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
