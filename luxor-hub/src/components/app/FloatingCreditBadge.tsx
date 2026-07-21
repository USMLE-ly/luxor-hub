import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightning, X, TrendUp } from "@phosphor-icons/react";
import { useCreditBalance } from "@/hooks/useCreditBalance";
import { usePlanTier } from "@/hooks/usePlanTier";
import { useNavigate } from "react-router-dom";
import { CREDIT_COSTS } from "@/lib/planRestrictions";

export function FloatingCreditBadge() {
  const { data, isLoading } = useCreditBalance();
  const { tier } = usePlanTier();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const remaining = data?.credits_remaining ?? 0;
  const allocated = data?.credits_allocated ?? 30;
  const percentage = allocated > 0 ? (remaining / allocated) * 100 : 0;

  const getColor = () => {
    if (percentage > 60) return "text-emerald-400";
    if (percentage > 30) return "text-amber-400";
    return "text-red-400";
  };

  const getBarColor = () => {
    if (percentage > 60) return "bg-emerald-500";
    if (percentage > 30) return "bg-amber-500";
    return "bg-red-500";
  };

  const getBorderColor = () => {
    if (percentage > 60) return "border-emerald-500/30";
    if (percentage > 30) return "border-amber-500/30";
    return "border-red-500/30";
  };

  if (isLoading) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.1] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute top-14 right-0 w-64 rounded-2xl border border-white/10 bg-[#111f17] backdrop-blur-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div className="flex items-center gap-2">
                <Lightning className={`w-4 h-4 ${getColor()}`} />
                <span className="text-xs font-sans font-semibold text-white/80">Credits</span>
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="w-5 h-5 rounded-full bg-white/[0.05] flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X className="w-3 h-3 text-white/40" />
              </button>
            </div>

            {/* Balance */}
            <div className="px-4 pb-3">
              <div className="flex items-end gap-1 mb-2">
                <span className={`text-2xl font-serif ${getColor()}`}>{remaining}</span>
                <span className="text-xs font-sans text-white/30 mb-0.5">/ {allocated.toLocaleString()}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, percentage)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full ${getBarColor()}`}
                />
              </div>
              <p className="text-[10px] font-sans text-white/30">
                ~{Math.floor(remaining / 4)} analyses remaining
              </p>
            </div>

            {/* Quick costs */}
            <div className="px-4 pb-3">
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(CREDIT_COSTS).slice(0, 4).map(([action, cost]) => (
                  <div key={action} className="flex items-center justify-between px-2 py-1 rounded-md bg-white/[0.03]">
                    <span className="text-[9px] font-sans text-white/40 truncate">
                      {action.replace(/_/g, " ")}
                    </span>
                    <span className={`text-[9px] font-sans font-semibold ${remaining >= cost ? "text-white/50" : "text-red-400/60"}`}>
                      {cost}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 pb-3">
              <button
                onClick={() => { navigate("/credits"); setExpanded(false); }}
                className="w-full h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[11px] font-sans font-semibold text-white/60 hover:bg-white/[0.08] hover:text-white/80 transition-all flex items-center justify-center gap-1.5"
              >
                <TrendUp className="w-3 h-3" />
                View All Usage
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main badge button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setExpanded(!expanded)}
        className={`relative flex items-center gap-2 px-3 py-2 rounded-full border backdrop-blur-xl shadow-lg transition-all ${
          expanded
            ? "bg-white/[0.08] border-white/[0.15]"
            : "bg-[#111f17]/80 border-white/[0.08] hover:border-white/[0.15]"
        } ${getBorderColor()}`}
      >
        <Lightning className={`w-3.5 h-3.5 ${getColor()}`} />
        <span className={`text-xs font-sans font-bold ${getColor()}`}>
          {remaining}
        </span>
        {/* Pulse animation when low */}
        {percentage < 20 && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        )}
      </motion.button>
    </div>
  );
}
