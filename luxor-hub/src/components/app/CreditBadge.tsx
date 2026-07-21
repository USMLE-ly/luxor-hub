import { Lightning } from "@phosphor-icons/react";
import { useCreditBalance } from "@/hooks/useCreditBalance";
import { useNavigate } from "react-router-dom";

export function CreditBadge() {
  const { data, isLoading } = useCreditBalance();
  const navigate = useNavigate();

  const allocated = data?.credits_allocated || 30;
  const remaining = data?.credits_remaining || 0;
  const percentage = allocated > 0 ? (remaining / allocated) * 100 : 0;

  const getColor = () => {
    if (percentage > 60) return "text-emerald-400";
    if (percentage > 30) return "text-amber-400";
    return "text-red-400";
  };

  const getBarColor = () => {
    if (percentage > 60) return "bg-emerald-500/60";
    if (percentage > 30) return "bg-amber-500/60";
    return "bg-red-500/60";
  };

  if (isLoading) {
    return (
      <div className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] animate-pulse">
        <div className="h-3 w-20 bg-white/10 rounded" />
      </div>
    );
  }

  return (
    <button
      onClick={() => navigate("/pricing")}
      className="w-full px-3 py-2.5 rounded-xl bg-gradient-to-r from-white/[0.04] to-white/[0.02] border border-white/[0.08] hover:border-white/[0.15] transition-all group text-left"
      title="Manage credits"
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Lightning className={`w-3.5 h-3.5 ${getColor()}`} />
          <span className="text-[11px] font-sans font-semibold text-white/70 tracking-wide">
            Credits
          </span>
        </div>
        <span className={`text-[11px] font-sans font-bold ${getColor()}`}>
          {remaining.toLocaleString()}
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className={`h-full rounded-full ${getBarColor()} transition-all duration-500`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
      <p className="text-[9px] font-sans text-white/30 mt-1 group-hover:text-white/50 transition-colors">
        {remaining} of {allocated.toLocaleString()} remaining
      </p>
    </button>
  );
}
