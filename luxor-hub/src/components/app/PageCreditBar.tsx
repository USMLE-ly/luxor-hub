import { motion } from "framer-motion";
import { Lightning } from "@phosphor-icons/react";
import { useCreditBalance } from "@/hooks/useCreditBalance";
import { usePlanTier } from "@/hooks/usePlanTier";
import { useNavigate } from "react-router-dom";

interface PageCreditBarProps {
  /** The credit action this page performs */
  action?: string;
  /** Override cost display */
  costOverride?: number;
}

export function PageCreditBar({ action, costOverride }: PageCreditBarProps) {
  const { data, isLoading } = useCreditBalance();
  const { tier } = usePlanTier();
  const navigate = useNavigate();

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

  if (isLoading) {
    return (
      <div className="w-full h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] animate-pulse mb-4" />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] mb-4"
    >
      {/* Credit icon + balance */}
      <div className="flex items-center gap-2">
        <Lightning className={`w-4 h-4 ${getColor()}`} />
        <span className={`text-sm font-sans font-bold ${getColor()}`}>
          {remaining}
        </span>
        <span className="text-[10px] font-sans text-white/30">
          / {allocated.toLocaleString()}
        </span>
      </div>

      {/* Progress bar */}
      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, percentage)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${getBarColor()}`}
        />
      </div>

      {/* Action cost */}
      {action && (
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-sans text-white/30">
            {action.replace(/_/g, " ")} =
          </span>
          <span className={`text-xs font-sans font-bold ${
            remaining >= (costOverride ?? 5) ? "text-white/60" : "text-red-400"
          }`}>
            {costOverride ?? "?"} credits
          </span>
        </div>
      )}

      {/* Link to full usage page */}
      <button
        onClick={() => navigate("/credits")}
        className="text-[10px] font-sans text-primary/70 hover:text-primary transition-colors"
      >
        Details
      </button>
    </motion.div>
  );
}
