import { CREDIT_COSTS } from "@/lib/planRestrictions";

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
  weekly_challenge: "Weekly Challenge",
};

interface CreditTooltipProps {
  action: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps any button with a credit cost tooltip.
 * Usage: <CreditTooltip action="pro_tweak"><Button>Generate</Button></CreditTooltip>
 */
export function CreditTooltip({ action, children, className = "" }: CreditTooltipProps) {
  const cost = CREDIT_COSTS[action] ?? 0;
  const label = ACTION_LABELS[action] || action.replace(/_/g, " ");

  return (
    <div className={`relative group inline-block ${className}`}>
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-[#1a2a1f] border border-white/10 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        <p className="text-[10px] font-sans text-white/50">
          Costs <span className="text-primary font-bold">{cost} credits</span>
        </p>
        <p className="text-[9px] font-sans text-white/25">{label}</p>
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#1a2a1f]" />
      </div>
    </div>
  );
}
