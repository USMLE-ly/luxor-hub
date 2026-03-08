import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

const platforms = [
  { name: "Instagram", logo: "/logos/instagram.png" },
  { name: "Pinterest", logo: "/logos/pinterest.png" },
  { name: "Shopify", logo: "/logos/shopify.svg" },
  { name: "TikTok", logo: "/logos/tiktok.svg" },
  { name: "ASOS", textLogo: true },
  { name: "Zara", logo: "/logos/zara.png" },
];

export default function IntegrationHero() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [rotationAngle, setRotationAngle] = useState(0);
  const [activeNode, setActiveNode] = useState<number | null>(null);

  useEffect(() => {
    if (!isInView) return;
    const timer = setInterval(() => {
      if (activeNode === null) {
        setRotationAngle((prev) => (prev + 0.25) % 360);
      }
    }, 50);
    return () => clearInterval(timer);
  }, [isInView, activeNode]);

  const getNodePosition = (index: number, total: number, radius: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radian = (angle * Math.PI) / 180;
    const x = Math.cos(radian) * radius;
    const y = Math.sin(radian) * radius;
    const opacity = Math.max(0.5, Math.min(1, 0.5 + 0.5 * ((1 + Math.sin(radian)) / 2)));
    const scale = 0.8 + 0.2 * ((1 + Math.sin(radian)) / 2);
    const zIndex = Math.round(10 + 5 * Math.cos(radian));
    return { x, y, opacity, scale, zIndex };
  };

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

        {/* Orbital System */}
        <div className="flex items-center justify-center">
          <div
            className="relative w-[320px] h-[320px] md:w-[440px] md:h-[440px]"
            onClick={() => setActiveNode(null)}
          >
            {/* Orbit rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute w-[260px] h-[260px] md:w-[360px] md:h-[360px] rounded-full border border-border/30" />
              <div className="absolute w-[200px] h-[200px] md:w-[280px] md:h-[280px] rounded-full border border-border/15" />
            </div>

            {/* Center pulsing node */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
            >
              <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-primary via-primary/80 to-accent flex items-center justify-center">
                {/* Ping rings */}
                <div className="absolute w-[72px] h-[72px] md:w-[80px] md:h-[80px] rounded-full border border-primary/20 animate-ping opacity-60" />
                <div
                  className="absolute w-[88px] h-[88px] md:w-[96px] md:h-[96px] rounded-full border border-primary/10 animate-ping opacity-40"
                  style={{ animationDelay: "0.5s" }}
                />
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary-foreground/80 backdrop-blur-md flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
              </div>
            </motion.div>

            {/* Connection lines SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
              {platforms.map((_, i) => {
                const pos = getNodePosition(i, platforms.length, window.innerWidth >= 768 ? 180 : 130);
                const cx = (window.innerWidth >= 768 ? 220 : 160);
                const cy = cx;
                return (
                  <motion.line
                    key={`line-${i}`}
                    x1={cx}
                    y1={cy}
                    x2={cx + pos.x}
                    y2={cy + pos.y}
                    stroke="hsl(var(--primary))"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    opacity={pos.opacity * 0.3}
                  />
                );
              })}
            </svg>

            {/* Platform nodes */}
            {platforms.map((p, i) => {
              const radius = typeof window !== "undefined" && window.innerWidth >= 768 ? 180 : 130;
              const pos = getNodePosition(i, platforms.length, radius);
              const isActive = activeNode === i;

              return (
                <motion.div
                  key={p.name}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={
                    isInView
                      ? {
                          scale: isActive ? 1.3 : pos.scale,
                          opacity: pos.opacity,
                          x: pos.x,
                          y: pos.y,
                        }
                      : { scale: 0, opacity: 0 }
                  }
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute top-1/2 left-1/2 -ml-[26px] -mt-[26px] md:-ml-[30px] md:-mt-[30px] cursor-pointer"
                  style={{ zIndex: isActive ? 50 : pos.zIndex }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveNode(isActive ? null : i);
                  }}
                >
                  {/* Energy glow */}
                  <div
                    className="absolute rounded-full"
                    style={{
                      background: `radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)`,
                      width: "70px",
                      height: "70px",
                      left: "-9px",
                      top: "-9px",
                    }}
                  />

                  <div
                    className={`
                      w-[52px] h-[52px] md:w-[60px] md:h-[60px] rounded-full flex items-center justify-center
                      border-2 transition-all duration-300
                      ${
                        isActive
                          ? "bg-card border-primary shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                          : "bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/40"
                      }
                    `}
                  >
                    {"textLogo" in p && p.textLogo ? (
                      <span className="text-[10px] md:text-xs font-bold text-muted-foreground tracking-wider">
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
                  <div
                    className={`
                      absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap
                      text-[10px] font-sans font-semibold tracking-wider uppercase
                      transition-all duration-300
                      ${isActive ? "text-primary" : "text-muted-foreground/70"}
                    `}
                  >
                    {p.name}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
