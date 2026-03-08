import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SplashScreen = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show splash when launched as PWA (standalone mode)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;

    if (isStandalone && !sessionStorage.getItem("aurelia_splash_shown")) {
      setShow(true);
      sessionStorage.setItem("aurelia_splash_shown", "1");
      setTimeout(() => setShow(false), 2400);
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
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 0.3 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-primary blur-[100px]"
            />
          </div>

          {/* Logo mark */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 mb-6"
          >
            <div className="w-20 h-20 rounded-2xl gold-gradient flex items-center justify-center shadow-lg">
              <span className="font-display text-3xl font-bold text-primary-foreground">A</span>
            </div>
          </motion.div>

          {/* Brand name */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="relative z-10 font-display text-4xl font-bold gold-text tracking-wider"
          >
            AURELIA
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="relative z-10 mt-3 text-sm text-muted-foreground font-sans"
          >
            Your AI Style Intelligence
          </motion.p>

          {/* Loading bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="relative z-10 mt-10 w-32 h-0.5 bg-muted rounded-full overflow-hidden"
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ delay: 1, duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0 gold-gradient"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
