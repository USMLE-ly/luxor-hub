import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightning } from "@phosphor-icons/react";
import { useCreditBalance } from "@/hooks/useCreditBalance";
import { CREDIT_COSTS } from "@/lib/planRestrictions";

interface CreditConfirmModalProps {
  isOpen: boolean;
  action: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ACTION_LABELS: Record<string, string> = {
  analyze_outfit: "Outfit Analysis",
  style_analyze: "Style Analysis",
  style_recommendations: "Style Recommendations",
  outfit_review: "Outfit Review",
  generate_outfits: "Outfit Generation",
  pro_tweak: "Pro Tweaks",
  closet_analyze: "Closet Analysis",
  stylist_explore: "Stylist Explore",
  stylist_generate: "Stylist Generate",
};

export function CreditConfirmModal({
  isOpen,
  action,
  onConfirm,
  onCancel,
}: CreditConfirmModalProps) {
  const { data } = useCreditBalance();
  const cost = CREDIT_COSTS[action] ?? 0;
  const remaining = data?.credits_remaining ?? 0;
  const afterAction = remaining - cost;

  // Auto-dismiss after 5 seconds
  const [autoDismiss, setAutoDismiss] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAutoDismiss(false);
      const timer = setTimeout(() => setAutoDismiss(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (autoDismiss && isOpen) {
      onConfirm();
    }
  }, [autoDismiss, isOpen, onConfirm]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-24 sm:pb-0"
          onClick={onCancel}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="w-full max-w-xs rounded-2xl border border-white/10 bg-[#1a2a1f] p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Lightning className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-sans font-semibold text-white">
                  {ACTION_LABELS[action] || action}
                </p>
                <p className="text-[11px] font-sans text-white/40">
                  Confirm credit usage
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-y border-white/[0.06] mb-4">
              <span className="text-xs font-sans text-white/50">Cost</span>
              <span className="text-sm font-sans font-bold text-primary">
                {cost} credits
              </span>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-sans text-white/40">
                Remaining after
              </span>
              <span className="text-xs font-sans text-white/60">
                {afterAction} credits
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="flex-1 h-9 rounded-xl border border-white/10 text-white/50 text-xs font-sans font-semibold hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 h-9 rounded-xl bg-primary text-primary-foreground text-xs font-sans font-semibold hover:bg-primary/90 transition-colors"
              >
                Confirm
              </button>
            </div>

            <p className="text-[9px] font-sans text-white/20 text-center mt-2">
              Auto-confirms in 5s
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
