import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClassicLoader } from "@/components/ui/loader";

const SplashScreen = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;

    if (isStandalone && !sessionStorage.getItem("luxor_splash_shown")) {
      setShow(true);
      sessionStorage.setItem("luxor_splash_shown", "1");
      setTimeout(() => setShow(false), 1500);
    }
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[99999] bg-background flex flex-col items-center justify-center"
        >
          <div className="flex flex-col items-center gap-6">
            {/* Logo text */}
            <span className="font-display text-3xl font-bold gold-text tracking-wider">
              LEXOR
            </span>
            {/* Loader */}
            <ClassicLoader />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
