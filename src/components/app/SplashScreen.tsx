import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GoldParticle = ({ index }: { index: number }) => {
  const x = 20 + Math.random() * 60;
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

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;

    if (isStandalone && !sessionStorage.getItem("luxor_splash_shown")) {
      setShow(true);
      sessionStorage.setItem("luxor_splash_shown", "1");
      setTimeout(() => setShow(false), 2500);
    }
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[99999] bg-background flex flex-col items-center justify-center"
        >
          {/* Ambient glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.4, opacity: 0.2 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full"
              style={{ background: "radial-gradient(circle, hsl(43,74%,49%,0.3), transparent)" }}
            />
          </div>

          {/* Gold floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 15 }).map((_, i) => (
              <GoldParticle key={i} index={i} />
            ))}
          </div>

          {/* LUXOR® Logo — matching landing page style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 text-center"
          >
            <h1 
              className="font-display text-5xl font-bold tracking-wider"
              style={{
                background: 'linear-gradient(135deg, #C8A951 0%, #DAA520 50%, #B8860B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              LUXOR®
            </h1>
          </motion.div>

          {/* Loading spinner */}
          <div className="relative z-10 mt-12">
            <motion.div
              className="w-8 h-8 border-2 border-transparent rounded-full"
              style={{
                borderTopColor: "hsl(43, 74%, 49%)",
                borderRightColor: "hsl(43, 74%, 49%)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            />
          </div>

          {/* Version */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 text-[10px] text-muted-foreground font-sans tracking-widest z-10"
          >
            v2.1.5
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
