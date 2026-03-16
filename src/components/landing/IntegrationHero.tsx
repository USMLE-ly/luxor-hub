import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect, useMemo } from "react";
import { Diamond } from "lucide-react";

const platforms = [
  { name: "Instagram", logo: "/logos/instagram.png" },
  { name: "Pinterest", logo: "/logos/pinterest.png" },
  { name: "Shopify", logo: "/logos/shopify.svg" },
  { name: "TikTok", logo: "/logos/tiktok.svg" },
  { name: "ASOS", textLogo: true },
  { name: "Zara", logo: "/logos/zara.png" },
];

/* Floating particles around center — pure CSS driven */
function CenterParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => {
        const angle = (i / 10) * 360;
        const rad = (angle * Math.PI) / 180;
        const dist = 34 + Math.random() * 24;
        return {
          id: i,
          x: Math.cos(rad) * dist,
          y: Math.sin(rad) * dist,
          size: 2 + Math.random() * 2,
          duration: 3 + Math.random() * 3,
          delay: Math.random() * 2,
        };
      }),
    []
  );

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute top-1/2 left-1/2 rounded-full bg-primary/50"
          style={{ width: p.size, height: p.size }}
          animate={{
            x: [p.x, p.x * 1.4, p.x],
            y: [p.y, p.y * 1.4, p.y],
            opacity: [0, 0.7, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
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
          className="text-center mb-12 md:mb-16"
        >
          <h3 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-3">
            Connects to your <span className="gold-text">favorite platforms</span>
          </h3>
          <p className="text-sm md:text-base text-muted-foreground font-sans max-w-md mx-auto">
            Sync your style across Instagram, Pinterest, Shopify, and more.
          </p>
        </motion.div>

        {/* Orbital System — CSS rotation, no JS interval */}
        <div className="flex items-center justify-center">
          <div className="relative w-[320px] h-[320px] md:w-[440px] md:h-[440px]">
            {/* Orbit rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute w-[280px] h-[280px] md:w-[380px] md:h-[380px] rounded-full border border-border/30" />
              <div className="absolute w-[200px] h-[200px] md:w-[280px] md:h-[280px] rounded-full border border-border/20" />
            </div>

            {/* Center pulsing node + particles */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
            >
              <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-primary via-primary/80 to-accent flex items-center justify-center">
                <div className="absolute w-[72px] h-[72px] md:w-[80px] md:h-[80px] rounded-full border border-primary/20 animate-ping opacity-60" />
                <div
                  className="absolute w-[88px] h-[88px] md:w-[96px] md:h-[96px] rounded-full border border-primary/10 animate-ping opacity-40"
                  style={{ animationDelay: "0.5s" }}
                />
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary-foreground/80 backdrop-blur-md flex items-center justify-center">
                  <Diamond className="w-4 h-4 text-primary" />
                </div>
              </div>
              <CenterParticles />
            </motion.div>

            {/* Rotating orbit container — pure CSS animation */}
            <div
              className="absolute inset-0"
              style={{ animation: "spin 60s linear infinite" }}
            >
              {/* SVG connection lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {platforms.map((_, i) => {
                  const angle = (i / platforms.length) * 360 - 90;
                  const rad = (angle * Math.PI) / 180;
                  // Use percentages based on viewbox
                  const cx = "50%";
                  const cy = "50%";
                  const r = 44; // percent
                  const x2 = 50 + Math.cos(rad) * r;
                  const y2 = 50 + Math.sin(rad) * r;
                  return (
                    <line
                      key={`line-${i}`}
                      x1="50%"
                      y1="50%"
                      x2={`${x2}%`}
                      y2={`${y2}%`}
                      stroke="hsl(var(--primary))"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      opacity="0.25"
                    />
                  );
                })}
              </svg>

              {/* Platform nodes positioned in circle */}
              {platforms.map((p, i) => {
                const angle = (i / platforms.length) * 360 - 90;
                const rad = (angle * Math.PI) / 180;
                const rPercent = 44;
                const left = 50 + Math.cos(rad) * rPercent;
                const top = 50 + Math.sin(rad) * rPercent;

                return (
                  <motion.div
                    key={p.name}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={isInView ? { scale: 1, opacity: 1 } : {}}
                    transition={{ delay: 0.3 + i * 0.1, type: "spring", stiffness: 250, damping: 20 }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group"
                    style={{
                      left: `${left}%`,
                      top: `${top}%`,
                      /* Counter-rotate so logos stay upright */
                      animation: "spin 60s linear infinite reverse",
                    }}
                  >
                    {/* Glow */}
                    <div
                      className="absolute -inset-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, transparent 70%)`,
                      }}
                    />

                    <div className="w-[56px] h-[56px] md:w-[64px] md:h-[64px] rounded-full flex items-center justify-center border-2 border-border/50 bg-card/90 backdrop-blur-sm group-hover:border-primary/40 group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)] transition-all duration-300">
                      {"textLogo" in p && p.textLogo ? (
                        <span className="text-xs font-bold text-muted-foreground tracking-wider">
                          ASOS
                        </span>
                      ) : (
                        <img
                          src={p.logo}
                          alt={p.name}
                          className="w-7 h-7 md:w-8 md:h-8 object-contain"
                          loading="lazy"
                        />
                      )}
                    </div>

                    {/* Name label */}
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-sans font-semibold tracking-wider uppercase text-muted-foreground/70 group-hover:text-primary transition-colors duration-300">
                      {p.name}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
