import { Lightning } from "@phosphor-icons/react";
import { useCreditBalance } from "@/hooks/useCreditBalance";
import { CREDIT_COSTS } from "@/lib/planRestrictions";
import { useNavigate } from "react-router-dom";

interface CreditCostBannerProps {
  /** The credit action key (e.g., "analyze_outfit", "pro_tweak") */
  action: string;
  /** Optional override class */
  className?: string;
}

export function CreditCostBanner({ action, className = "" }: CreditCostBannerProps) {
  const { data } = useCreditBalance();
  const navigate = useNavigate();

  const cost = CREDIT_COSTS[action] ?? 0;
  const remaining = data?.credits_remaining ?? 30;
  const canAfford = remaining >= cost;
  const percentage = data?.credits_allocated
    ? (remaining / data.credits_allocated) * 100
    : 100;

  return (
    <div
      className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all ${
        canAfford
          ? "border-white/[0.08] bg-white/[0.02]"
          : "border-red-500/30 bg-red-500/5"
      } ${className}`}
    >
      <div className="flex items-center gap-2">
        <Lightning
          className={`w-3.5 h-3.5 ${
            canAfford
              ? percentage > 30
                ? "text-emerald-400"
                : "text-amber-400"
              : "text-red-400"
          }`}
        />
        <span className="text-[11px] font-sans text-white/50">
          {cost} credits
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-sans text-white/30">
          {remaining} left
        </span>
        {!canAfford && (
          <button
            onClick={() => navigate("/pricing")}
            className="text-[10px] font-sans font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Upgrade
          </button>
        )}
      </div>
    </div>
  );
}
