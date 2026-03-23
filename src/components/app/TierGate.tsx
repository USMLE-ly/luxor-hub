import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlanTier } from "@/hooks/usePlanTier";
import { hasTierAccess, TIER_ORDER, type PlanTier } from "@/lib/planRestrictions";

interface TierGateProps {
  requiredTier: PlanTier;
  featureName: string;
  children: React.ReactNode;
}

const TIER_LABELS: Record<PlanTier, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  elite: "Elite",
};

const TierGate = ({ requiredTier, featureName, children }: TierGateProps) => {
  const { tier, isLoading } = usePlanTier();
  const navigate = useNavigate();

  if (isLoading) return null;

  if (hasTierAccess(tier, requiredTier)) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center mb-6">
        <Lock className="w-7 h-7 text-muted-foreground" />
      </div>
      <h2 className="font-display text-xl font-bold text-foreground mb-2">
        {featureName}
      </h2>
      <p className="text-muted-foreground text-sm mb-6 max-w-xs">
        This feature requires the <span className="text-foreground font-semibold">{TIER_LABELS[requiredTier]}</span> plan or higher. Upgrade to unlock it.
      </p>
      <Button
        onClick={() => navigate("/paywall")}
        className="gap-2"
      >
        Upgrade Now <ArrowRight className="w-4 h-4" />
      </Button>
      <p className="text-muted-foreground/60 text-xs mt-3">
        You're currently on the <span className="font-medium">{TIER_LABELS[tier]}</span> plan
      </p>
    </motion.div>
  );
};

export default TierGate;
