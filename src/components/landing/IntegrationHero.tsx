import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Sparkles } from "lucide-react";

const platforms = [
  { name: "Instagram", logo: "/logos/instagram.png" },
  { name: "Pinterest", logo: "/logos/pinterest.png" },
  { name: "Shopify", logo: "/logos/shopify.svg" },
  { name: "TikTok", logo: "/logos/tiktok.svg" },
  { name: "ASOS", textLogo: true },
  { name: "Zara", logo: "/logos/zara.png" },
];

/* ── Tiny floating particles around center ── */
const PARTICLE_COUNT = 12;
function CenterParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        angle: (i / PARTICLE_COUNT) * 360,
        distance: 36 + Math.random() * 28,
        size: 2 + Math.random() * 2.5,
        duration: 3 + Math.random() * 4,
        delay: Math.random() * 3,
      })),
    []
  );

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const x = Math.cos(rad) * p.distance;
        const y = Math.sin(rad) * p.distance;
        return (
          <motion.div
            key={p.id}
            className="absolute top-1/2 left-1/2 rounded-full bg-primary/60"
            style={{ width: p.size, height: p.size }}
            initial={{ x, y, opacity: 0, scale: 0 }}
            animate={{
              x: [x, x * 1.3, x],
              y: [y, y * 1.3, y],
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}

function useIsMd() {
  const [isMd, setIsMd] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 768 : true
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent) => setIsMd(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMd;
}

export default function IntegrationHero() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [rotationAngle, setRotationAngle] = useState(0);
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const isMd = useIsMd();

  const radius = isMd ? 180 : 140;
  const containerSize = isMd ? 440 : 340;
  const center = containerSize / 2;

  useEffect(() => {
    if (!isInView) return;
    const timer = setInterval(() => {
      if (activeNode === null) {
        setRotationAngle((prev) => (prev + 0.25) % 360);
      }
    }, 50);
    return () => clearInterval(timer);
  }, [isInView, activeNode]);

  const getNodePosition = useCallback(
    (index: number, total: number) => {
      const angle = ((index / total) * 360 + rotationAngle) % 360;
      const radian = (angle * Math.PI) / 180;
      const x = Math.cos(radian) * radius;
      const y = Math.sin(radian) * radius;
      const opacity = Math.max(0.5, Math.min(1, 0.5 + 0.5 * ((1 + Math.sin(radian)) / 2)));
      const scale = 0.85 + 0.15 * ((1 + Math.sin(radian)) / 2);
      const zIndex = Math.round(10 + 5 * Math.cos(radian));
      return { x, y, opacity, scale, zIndex };
    },
    [rotationAngle, radius]
  );

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
            className="relative"
            style={{ width: containerSize, height: containerSize }}
            onClick={() => setActiveNode(null)}
          >
            {/* Orbit rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="absolute rounded-full border border-border/30"
                style={{ width: radius * 2, height: radius * 2 }}
              />
              <div
                className="absolute rounded-full border border-border/15"
                style={{ width: radius * 1.45, height: radius * 1.45 }}
              />
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
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
              </div>
              {/* Particles */}
              <CenterParticles />
            </motion.div>

            {/* Connection lines SVG */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox={`0 0 ${containerSize} ${containerSize}`}
            >
              {platforms.map((_, i) => {
                const pos = getNodePosition(i, platforms.length);
                return (
                  <line
                    key={`line-${i}`}
                    x1={center}
                    y1={center}
                    x2={center + pos.x}
                    y2={center + pos.y}
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
              const pos = getNodePosition(i, platforms.length);
              const isActive = activeNode === i;
              const nodeSize = isMd ? 60 : 56;
              const halfNode = nodeSize / 2;

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
                  className="absolute cursor-pointer"
                  style={{
                    top: center - halfNode,
                    left: center - halfNode,
                    zIndex: isActive ? 50 : pos.zIndex,
                  }}
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
                      width: nodeSize + 16,
                      height: nodeSize + 16,
                      left: -8,
                      top: -8,
                    }}
                  />

                  <div
                    className="rounded-full flex items-center justify-center border-2 transition-all duration-300"
                    style={{ width: nodeSize, height: nodeSize }}
                  >
                    <div
                      className={`
                        w-full h-full rounded-full flex items-center justify-center
                        border-2 transition-all duration-300
                        ${
                          isActive
                            ? "bg-card border-primary shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                            : "bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/40"
                        }
                      `}
                    >
                      {"textLogo" in p && p.textLogo ? (
                        <span className="text-xs font-bold text-muted-foreground tracking-wider">
                          ASOS
                        </span>
                      ) : (
                        <img
                          src={p.logo}
                          alt={p.name}
                          className="w-8 h-8 object-contain"
                          loading="lazy"
                        />
                      )}
                    </div>
                  </div>

                  {/* Name label */}
                  <div
                    className={`
                      absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap
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
