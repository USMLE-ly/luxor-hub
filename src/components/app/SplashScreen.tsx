import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LETTERS = "LUXOR".split("");
const TAGLINE = "Your AI Style Intelligence";

const GoldParticle = ({ index }: { index: number }) => {
  const x = 20 + Math.random() * 60; // % position
  const delay = Math.random() * 2;
  const duration = 2.5 + Math.random() * 2;
  const size = 2 + Math.random() * 3;

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: `${x}%`,
        bottom: "20%",
        width: size,
        height: size,
        background: `hsl(43, 74%, ${50 + Math.random() * 20}%)`,
      }}
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: [0, 0.7, 0], y: [-20, -120 - Math.random() * 80] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeOut" }}
    />
  );
};

const SplashScreen = () => {
  const [show, setShow] = useState(false);
  const [taglineText, setTaglineText] = useState("");

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;

    if (isStandalone && !sessionStorage.getItem("luxor_splash_shown")) {
      setShow(true);
      sessionStorage.setItem("luxor_splash_shown", "1");
      setTimeout(() => setShow(false), 3200);
    }
  }, []);

  // Typewriter effect for tagline
  useEffect(() => {
    if (!show) return;
    const startDelay = 1200; // after logo + letters animate
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setTaglineText(TAGLINE.slice(0, i));
        if (i >= TAGLINE.length) clearInterval(interval);
      }, 35);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[99999] bg-background flex flex-col items-center justify-center"
        >
          {/* Ambient glow */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.4, opacity: 0.25 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary blur-[120px]"
            />
          </div>

          {/* Gold floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <GoldParticle key={i} index={i} />
            ))}
          </div>

          {/* Logo mark */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0, rotateY: -90 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 mb-8"
          >
            <div className="w-22 h-22 rounded-2xl gold-gradient flex items-center justify-center shadow-[0_0_40px_-8px_hsl(43,74%,49%,0.5)]">
              <span className="font-display text-4xl font-bold text-primary-foreground p-4">A</span>
            </div>
          </motion.div>

          {/* Dual-ring spinner */}
          <div className="relative z-10 mb-8">
            <motion.div
              className="absolute -inset-6 rounded-full border-2 border-transparent"
              style={{
                borderTopColor: "hsl(43, 74%, 49%)",
                borderRightColor: "hsl(43, 74%, 49%)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute -inset-10 rounded-full border border-transparent"
              style={{
                borderBottomColor: "hsl(43, 74%, 60%)",
                borderLeftColor: "hsl(43, 74%, 60%)",
              }}
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </div>

          {/* Staggered letter reveal */}
          <div className="relative z-10 flex gap-0.5 mb-3">
            {LETTERS.map((letter, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-4xl font-bold gold-text tracking-wider"
              >
                {letter}
              </motion.span>
            ))}
          </div>

          {/* Typewriter tagline */}
          <div className="relative z-10 h-6">
            <span className="text-sm text-muted-foreground font-sans">
              {taglineText}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-[2px] h-4 bg-primary ml-0.5 align-middle"
              />
            </span>
          </div>

          {/* Version */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 2.5 }}
            className="absolute bottom-8 text-[10px] text-muted-foreground font-sans tracking-widest z-10"
          >
            v2.0
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
