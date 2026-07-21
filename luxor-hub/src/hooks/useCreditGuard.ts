import { useCallback } from "react";
import { useCreditBalance } from "./useCreditBalance";
import { CREDIT_COSTS } from "@/lib/planRestrictions";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

/**
 * Hook that checks credit balance before allowing an AI action.
 * Returns a guard function that should be called before every AI action.
 */
export function useCreditGuard() {
  const { data } = useCreditBalance();
  const navigate = useNavigate();

  const remaining = data?.credits_remaining ?? 30;

  const canAfford = useCallback(
    (action: string): boolean => {
      const cost = CREDIT_COSTS[action] ?? 0;
      return remaining >= cost;
    },
    [remaining]
  );

  const getActionCost = useCallback(
    (action: string): number => {
      return CREDIT_COSTS[action] ?? 0;
    },
    []
  );

  const guard = useCallback(
    (action: string): boolean => {
      const cost = CREDIT_COSTS[action] ?? 0;

      if (remaining < cost) {
        toast.error(
          `Not enough credits. ${action.replace(/_/g, " ")} costs ${cost} credits, but you have ${remaining}.`,
          {
            duration: 5000,
            action: {
              label: "Upgrade",
              onClick: () => navigate("/pricing"),
            },
          }
        );
        return false;
      }

      if (remaining <= cost * 2) {
        toast.warning(
          `Low credits: ${remaining - cost} remaining after this action.`,
          { duration: 3000 }
        );
      }

      return true;
    },
    [remaining, navigate]
  );

  return { guard, canAfford, getActionCost, remaining };
}
