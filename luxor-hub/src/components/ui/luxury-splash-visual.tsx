import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useMemo, useState, useEffect } from "react";

/* ───────────────────────────────────────────────────────────────
   Floating geometric accent
   ─────────────────────────────────────────────────────────────── */
function FloatingAccent({
  shape = "circle",
  size = 60,
  top = "10%",
  left = "10%",
  delay = 0,
  duration = 8,
  opacity = 0.06,
  borderColor = "hsl(var(--gold) / 0.15)",
}: {
  shape?: "circle" | "square" | "diamond";
  size?: number;
  top?: string;
  left?: string;
  delay?: number;
  duration?: number;
  opacity?: number;
  borderColor?: string;
}) {
  const rotate = shape === "diamond" ? 45 : 0;
  const borderRadius = shape === "circle" ? "50%" : shape === "diamond" ? "4px" : "12px";

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ top, left, width: size, height: size, borderRadius, rotate }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{
        opacity: [0, opacity, opacity, 0],
        scale: [0.6, 1, 1, 0.6],
        y: [0, -20, 20, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <div
        className="w-full h-full"
        style={{
          border: `1px solid ${borderColor}`,
          borderRadius,
          background: `radial-gradient(circle at 30% 30%, ${borderColor.replace("0.15", "0.04")}, transparent)`,
        }}
      />
    </motion.div>
  );
}

/* ───────────────────────────────────────────────────────────────
   Gold shimmer line
   ─────────────────────────────────────────────────────────────── */
function GoldShimmerLine({ delay = 0, top = "50%", width = 120 }: { delay?: number; top?: string; width?: number }) {
  return (
    <motion.div
      className="absolute h-px pointer-events-none"
      style={{ top, left: "50%", marginLeft: -width / 2, width }}
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: [0, 1, 1, 0], opacity: [0, 0.4, 0.4, 0] }}
      transition={{ duration: 6, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <div
        className="w-full h-full"
        style={{
          background: "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.3), hsl(var(--gold) / 0.5), hsl(var(--gold) / 0.3), transparent)",
        }}
      />
    </motion.div>
  );
}

/* ───────────────────────────────────────────────────────────────
   Main Luxury Splash Visual
   ─────────────────────────────────────────────────────────────── */
export function LuxurySplashVisual({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative w-full min-h-screen bg-forest overflow-hidden ${className}`}>
      {/* Base gradient depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-forest via-emerald/20 to-forest/90" />

      {/* Soft gold radial glow - top */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(var(--gold) / 0.06), transparent 70%)",
        }}
      />

      {/* Gold radial glow - bottom */}
      <div
        className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(var(--gold) / 0.04), transparent 70%)",
        }}
      />

      {/* Ambient light leak - top right */}
      <div
        className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(var(--emerald) / 0.08), transparent 70%)",
        }}
      />

      {/* Floating geometric accents */}
      <FloatingAccent shape="circle" size={80} top="15%" left="8%" delay={0} duration={10} />
      <FloatingAccent shape="square" size={50} top="60%" left="85%" delay={1.5} duration={12} borderColor="hsl(var(--gold) / 0.1)" />
      <FloatingAccent shape="diamond" size={40} top="30%" left="80%" delay={3} duration={9} borderColor="hsl(var(--gold) / 0.08)" />
      <FloatingAccent shape="circle" size={30} top="75%" left="12%" delay={2} duration={11} />
      <FloatingAccent shape="square" size={60} top="45%" left="5%" delay={4} duration={13} borderColor="hsl(var(--emerald) / 0.15)" />

      {/* Shimmering gold lines */}
      <GoldShimmerLine delay={0} top="20%" width={160} />
      <GoldShimmerLine delay={2} top="35%" width={100} />
      <GoldShimmerLine delay={4} top="65%" width={140} />
      <GoldShimmerLine delay={6} top="80%" width={90} />

      {/* Animated corner accents */}
      <div className="absolute top-8 left-8 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="w-16 h-px bg-gradient-to-r from-gold/40 to-transparent"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="w-px h-16 bg-gradient-to-b from-gold/40 to-transparent mt-2"
        />
      </div>
      <div className="absolute top-8 right-8 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="w-16 h-px bg-gradient-to-l from-gold/40 to-transparent ml-auto"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="w-px h-16 bg-gradient-to-t from-gold/40 to-transparent ml-auto mt-2"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        {children}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────
   Luxury hero text reveal
   ─────────────────────────────────────────────────────────────── */
export function LuxuryHeroText({
  lines,
  className = "",
}: {
  lines: { text: string; highlight?: boolean }[];
  className?: string;
}) {
  return (
    <div className={`text-center ${className}`}>
      {lines.map((line, i) => (
        <motion.div
          key={i}
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.9,
            delay: 0.8 + i * 0.3,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="overflow-hidden"
        >
          <motion.p
            className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-[0.02em] leading-[1.1] ${
              line.highlight ? "text-gold" : "text-foreground"
            }`}
          >
            {line.text}
          </motion.p>
        </motion.div>
      ))}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────
   Luxury splash screen (standalone, for loading state)
   ─────────────────────────────────────────────────────────────── */
export function LuxurySplashScreen({
  tagline = "Your Personal Fashion Intelligence",
  onComplete,
}: {
  tagline?: string;
  onComplete?: () => void;
}) {
  const [phase, setPhase] = useState<"logo" | "wordmark" | "tagline" | "complete">("logo");
  const [exit, setExit] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("wordmark"), 600);
    const t2 = setTimeout(() => setPhase("tagline"), 1500);
    const t3 = setTimeout(() => setPhase("complete"), 2600);
    const t4 = setTimeout(() => {
      setExit(true);
      onComplete?.();
    }, 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!exit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[99999]"
        >
          <LuxurySplashVisual>
            {/* Logo Icon */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className="text-gold">
                <rect x="5" y="5" width="46" height="46" rx="14" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.3" />
                <path d="M18 32L23 20L28 28L33 20L38 32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 37H41" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </motion.div>

            {/* Wordmark */}
            <AnimatePresence mode="wait">
              {phase !== "logo" && (
                <motion.h1
                  key="wordmark"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="font-display text-5xl sm:text-6xl font-bold tracking-[0.18em] text-foreground mt-6"
                >
                  LEXOR
                </motion.h1>
              )}
            </AnimatePresence>

            {/* Tagline */}
            <AnimatePresence mode="wait">
              {phase === "tagline" && (
                <motion.p
                  key="tagline"
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -15, opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="font-sans text-xs sm:text-sm uppercase tracking-[0.3em] text-gold/60 mt-4"
                >
                  {tagline}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Gold loading bar */}
            <div className="w-32 h-[2px] rounded-full bg-emerald/40 overflow-hidden mt-10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.6, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-gold/40 via-gold to-gold/40"
              />
            </div>

            {/* Bottom decorative line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 w-24 h-px origin-center"
              style={{ background: "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.2), transparent)" }}
            />
          </LuxurySplashVisual>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
