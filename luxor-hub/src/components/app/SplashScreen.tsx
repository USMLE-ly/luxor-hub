import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SplashScreen = () => {
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState<"logo" | "tagline" | "done">("logo");

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;

    if (isStandalone && !sessionStorage.getItem("luxor_splash_shown")) {
      setShow(true);
      sessionStorage.setItem("luxor_splash_shown", "1");
      
      // Animation sequence
      setTimeout(() => setPhase("tagline"), 600);
      setTimeout(() => setPhase("done"), 2200);
      setTimeout(() => setShow(false), 2800);
    }
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[99999] bg-forest flex flex-col items-center justify-center"
        >
          {/* Ambient gold glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-gold/5 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[200px] h-[200px] rounded-full bg-gold/3 blur-[80px] pointer-events-none" />
          
          {/* Gold border divider */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-12 h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
          
          <div className="flex flex-col items-center gap-8 relative z-10">
            {/* Logo icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
              }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-gold">
                <rect x="4" y="4" width="40" height="40" rx="12" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
                <path d="M16 28L20 18L24 24L28 18L32 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 32H34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </motion.div>

            {/* LEXOR wordmark */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={phase !== "logo" ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-4xl font-bold tracking-[0.15em] text-foreground"
            >
              LEXOR
            </motion.h1>

            {/* Tagline */}
            <AnimatePresence mode="wait">
              {phase === "tagline" && (
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="font-sans text-[11px] uppercase tracking-[0.25em] text-gold/70"
                >
                  Your Personal Fashion Intelligence
                </motion.p>
              )}
            </AnimatePresence>

            {/* Gold loading bar */}
            <div className="w-24 h-[2px] rounded-full bg-emerald/40 overflow-hidden mt-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-gold/60 via-gold to-gold/60" 
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
