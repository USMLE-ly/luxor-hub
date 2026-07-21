import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useMemo, useState, useEffect } from "react";

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
    <div className={`relative w-full min-h-screen overflow-hidden ${className}`} style={{ background: "linear-gradient(180deg, #060f0d 0%, #0c2420 35%, #10352a 55%, #0a1f1a 80%, #060f0d 100%)" }}>
      <div className="absolute inset-0 bg-gradient-to-b from-forest via-emerald/20 to-forest/90" />
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(var(--gold) / 0.06), transparent 70%)",
        }}
      />
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
    const t1 = setTimeout(() => setPhase("wordmark"), 300);
    const t2 = setTimeout(() => setPhase("tagline"), 700);
    const t3 = setTimeout(() => setPhase("complete"), 1200);
    const t4 = setTimeout(() => {
      setExit(true);
      onComplete?.();
    }, 3200);
    const forceExit = setTimeout(() => {
      setExit(true);
    }, 2500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(forceExit);
    };
  }, []);

  return (
    <AnimatePresence>
      {!exit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[99999] pointer-events-none"
        >
          <LuxurySplashVisual>


            {/* Wordmark */}
            <AnimatePresence mode="wait">
              {phase !== "logo" && (
                <motion.h1
                  key="wordmark"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="font-display text-6xl sm:text-7xl md:text-8xl font-light tracking-[0.3em] text-white/90 mt-8 flex items-start justify-center" style={{ textShadow: "0 0 40px rgba(232,200,122,0.08)" }}
                >
                  LUXOR<span className="inline-block align-super text-[0.45em] leading-none -ml-[0.1em] text-gold/60">®</span>
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
                  className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.45em] mt-5 font-light" style={{ color: "rgba(232,200,122,0.3)" }}
                >
                  {tagline}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Gold loading bar */}
            <div className="w-48 h-[1px] rounded-full overflow-hidden mt-12" style={{ background: "rgba(232,200,122,0.08)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full" style={{ background: "linear-gradient(90deg, rgba(232,200,122,0.2), rgba(232,200,122,0.7), rgba(232,200,122,0.2))" }}
              />
            </div>

            {/* Bottom decorative line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 w-24 h-px origin-center"
              style={{ background: "linear-gradient(90deg, transparent, rgba(232,200,122,0.15), transparent)" }}
            />
          </LuxurySplashVisual>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
