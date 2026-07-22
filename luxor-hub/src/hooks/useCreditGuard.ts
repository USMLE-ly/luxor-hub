import { useCallback } from "react";
import { useCreditBalance } from "./useCreditBalance";
import { CREDIT_COSTS } from "@/lib/planRestrictions";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

/**
 * Hook that checks credit balance before allowing an AI action.
 * Returns a guard function that should be called before every AI action.
 */
export function useCreditGuard() {
  const { data } = useCreditBalance();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const remaining = data?.credits_remaining ?? 30;
  const [exhausted, setExhausted] = useState(false);
  const [exhaustedAction, setExhaustedAction] = useState("");
  const [exhaustedCost, setExhaustedCost] = useState(0);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [pendingHandler, setPendingHandler] = useState<(() => void) | null>(null);

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
      
      // MEDIUM #9: Show confirmation modal for expensive actions (>= 5 credits)
      if (cost >= 5 && remaining >= cost) {
        // Don't block — just flag. The consumer will call guardConfirmed()
        return true;
      }

      if (remaining < cost) {
        setExhaustedAction(action);
        setExhaustedCost(cost);
        setExhausted(true);
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

  const guardWithConfirm = useCallback(
    (action: string, onConfirmed: () => void): boolean => {
      const cost = CREDIT_COSTS[action] ?? 0;
      
      if (remaining < cost) {
        setExhaustedAction(action);
        setExhaustedCost(cost);
        setExhausted(true);
        return false;
      }

      // Show confirmation for expensive actions
      if (cost >= 5) {
        setConfirmAction(action);
        setPendingHandler(() => onConfirmed);
        return false; // Don't execute yet — wait for modal
      }
      
      return true;
    },
    [remaining]
  );

  const confirmPending = useCallback(() => {
    if (pendingHandler) {
      pendingHandler();
    }
    setConfirmAction(null);
    setPendingHandler(null);
  }, [pendingHandler]);

  const cancelConfirm = useCallback(() => {
    setConfirmAction(null);
    setPendingHandler(null);
  }, []);

  const consume = useCallback(
    async (action: string): Promise<boolean> => {
      // Check locally first
      if (!guard(action)) return false;

      try {
        const { data: session } = await supabase.auth.getSession();
        const token = session?.session?.access_token;
        if (!token) {
          toast.error("Session expired. Please sign in again.");
          return false;
        }

        const apiUrl = import.meta.env.VITE_API_URL || "";
        const resp = await fetch(`${apiUrl}/api/v1/credits/consume`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action }),
        });

        if (resp.status === 402) {
          const data = await resp.json();
          toast.error(data.message || "Not enough credits", {
            duration: 5000,
            action: {
              label: "Upgrade",
              onClick: () => window.location.href = "/pricing",
            },
          });
          return false;
        }

        if (!resp.ok) {
          console.warn("[CREDITS] Consume failed:", resp.status);
          return false;
        }

        const data = await resp.json();
        if (data.credits_remaining !== undefined) {
          toast.info(`${data.cost} credits used — ${data.credits_remaining} remaining`, { duration: 2000 });
          // Refetch balance so UI updates immediately
          queryClient.invalidateQueries({ queryKey: ["credit-balance"] });
        }
        return true;
      } catch (err) {
        console.warn("[CREDITS] Consume error:", err);
        return false;
      }
    },
    [guard]
  );

  return { guard, guardWithConfirm, canAfford, getActionCost, consume, remaining, exhausted, exhaustedAction, exhaustedCost, setExhausted, confirmAction, confirmPending, cancelConfirm };
}
