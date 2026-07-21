import { motion, AnimatePresence } from "framer-motion";
import { Lightning, Crown, Sparkle, TrendUp } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { useCreditBalance } from "@/hooks/useCreditBalance";

interface CreditExhaustedOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  actionCost?: number;
  actionName?: string;
}

export function CreditExhaustedOverlay({
  isOpen,
  onClose,
  actionCost = 0,
  actionName = "AI action",
}: CreditExhaustedOverlayProps) {
  const navigate = useNavigate();
  const { data } = useCreditBalance();

  const remaining = data?.credits_remaining ?? 0;
  const allocated = data?.credits_allocated ?? 30;
  const tier = data?.tier ?? "free";

  const suggestions = [
    { action: "Outfit analysis", cost: 5 },
    { action: "Style analysis", cost: 3 },
    { action: "Outfit generation", cost: 4 },
    { action: "Pro tweaks", cost: 8 },
  ];

  const affordableCount = suggestions.filter((s) => s.cost <= remaining).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-sm rounded-3xl border border-white/10 bg-gradient-to-b from-[#1a2a1f] to-[#0d1a12] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                <Lightning className="w-7 h-7 text-red-400" />
              </div>
              <h2 className="text-xl font-serif text-white mb-1">Out of Credits</h2>
              <p className="text-sm font-sans text-white/50">
                You need {actionCost} credits for {actionName.replace(/_/g, " ")}
                {remaining > 0 ? ` but only have ${remaining}` : ""}.
              </p>
            </div>

            {/* Usage breakdown */}
            {remaining > 0 && (
              <div className="mb-5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-[10px] font-sans text-white/30 uppercase tracking-wider mb-2">
                  What you can still do with {remaining} credits
                </p>
                <div className="space-y-1.5">
                  {suggestions
                    .filter((s) => s.cost <= remaining)
                    .map((s) => (
                      <div
                        key={s.action}
                        className="flex items-center justify-between text-xs font-sans"
                      >
                        <span className="text-white/60">{s.action}</span>
                        <span className="text-white/30">{s.cost} credits</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Upgrade cards */}
            <div className="space-y-2 mb-5">
              {tier === "free" && (
                <button
                  onClick={() => navigate("/pricing")}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors"
                >
                  <TrendUp className="w-5 h-5 text-primary" />
                  <div className="text-left flex-1">
                    <p className="text-sm font-sans font-semibold text-white">
                      Upgrade to Starter
                    </p>
                    <p className="text-[10px] font-sans text-white/40">
                      200 credits/mo for $9
                    </p>
                  </div>
                  <Crown className="w-4 h-4 text-primary/60" />
                </button>
              )}
              {(tier === "free" || tier === "starter") && (
                <button
                  onClick={() => navigate("/pricing")}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors"
                >
                  <Sparkle className="w-5 h-5 text-primary" />
                  <div className="text-left flex-1">
                    <p className="text-sm font-sans font-semibold text-white">
                      Upgrade to Pro
                    </p>
                    <p className="text-[10px] font-sans text-white/40">
                      1,000 credits/mo for $29
                    </p>
                  </div>
                  <Crown className="w-4 h-4 text-primary/60" />
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 h-10 rounded-xl border border-white/10 text-white/50 text-xs font-sans font-semibold hover:bg-white/5 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => navigate("/pricing")}
                className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-xs font-sans font-semibold hover:bg-primary/90 transition-colors"
              >
                View Plans
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
