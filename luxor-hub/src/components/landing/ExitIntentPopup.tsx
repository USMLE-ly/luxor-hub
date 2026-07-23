import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, ArrowRight } from "@phosphor-icons/react";
import { trackEvent } from "@/lib/fbPixel";

const STORAGE_KEY = "luxor_exit_popup_shown";
const COOLDOWN_HOURS = 24;

const ExitIntentPopup = () => {
  const [submitted, setSubmitted] = useState(false);
  const [visible, setVisible] = useState(false);

  const navigate = useNavigate();

  const shouldShow = useCallback(() => {
    try {
      const lastShown = localStorage.getItem(STORAGE_KEY);
      if (lastShown) {
        const hoursSince = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60);
        if (hoursSince < COOLDOWN_HOURS) return false;
      }
    } catch {}
    return true;
  }, []);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && shouldShow() && !visible) {
        setVisible(true);
        try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch {}
        trackEvent("PageView", { content_name: "Exit Intent Popup" });
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [shouldShow, visible]);

  const handleCTA = () => {
    trackEvent("InitiateCheckout", { content_name: "Exit Intent Popup CTA" });
    setSubmitted(true);
    setTimeout(() => navigate("/auth"), 1500);
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={() => setVisible(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl border border-white/10 bg-gradient-to-b from-[#0c2420] to-[#060f0d] p-8 shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={() => setVisible(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
              aria-label="Close popup"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>

            {/* Gold glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-[hsl(43,80%,50%,0.08)] rounded-full blur-3xl pointer-events-none" />

            {!submitted ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-[hsl(43,80%,50%,0.15)] flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✨</span>
                  </div>
                  <h2 className="font-display text-2xl font-bold text-white mb-2">
                    Wait — try LUXOR® free
                  </h2>
                  <p className="text-sm text-white/60 font-sans">
                    No credit card needed. Get 3 AI outfit suggestions today.
                  </p>
                </div>

                <button
                  onClick={handleCTA}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-sans font-semibold border border-[hsl(43,80%,50%,0.3)] text-[hsl(43,80%,50%)] bg-[hsl(43,80%,50%,0.05)] hover:bg-[hsl(43,80%,50%,0.1)] transition-colors"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-center text-[10px] text-white/30 font-sans mt-3">
                  30-day money-back guarantee on all paid plans
                </p>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-white font-sans font-medium">Check your email! ✨</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExitIntentPopup;
