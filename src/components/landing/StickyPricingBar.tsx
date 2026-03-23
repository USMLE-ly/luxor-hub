import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { trackEvent } from "@/lib/fbPixel";

const DISMISSED_KEY = "luxor-sticky-bar-dismissed";

export default function StickyPricingBar() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(DISMISSED_KEY) === "1"
  );

  useEffect(() => {
    if (dismissed) return;
    const onScroll = () => {
      const heroEnd = window.innerHeight;
      const pricingEl = document.getElementById("pricing");
      const pricingTop = pricingEl?.getBoundingClientRect().top ?? Infinity;
      const pricingBottom = pricingEl?.getBoundingClientRect().bottom ?? Infinity;
      const pastHero = window.scrollY > heroEnd;
      const pricingInView = pricingTop < window.innerHeight && pricingBottom > 0;
      setVisible(pastHero && !pricingInView);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed]);

  const dismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, "1");
    setDismissed(true);
    setVisible(false);
  };

  const handleCTA = () => {
    trackEvent("InitiateCheckout", { content_name: "Sticky Bar CTA" });
    navigate("/auth");
  };

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 inset-x-0 z-50 px-4 pb-4 pointer-events-none"
        >
          <div className="max-w-2xl mx-auto pointer-events-auto glass-strong rounded-2xl px-5 py-3 flex items-center justify-between gap-4 shadow-lg">
            <div className="flex flex-col min-w-0">
              <span className="font-display text-sm font-bold text-foreground truncate">
                Join LEXOR® Now
              </span>
              <span className="text-[11px] font-sans text-muted-foreground">
                Founding member pricing — limited spots
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCTA}
                className="rounded-full px-5 py-2 text-xs font-sans font-bold flex items-center gap-1.5 bg-foreground text-background hover:bg-foreground/90 transition-colors"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={dismiss}
                className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
