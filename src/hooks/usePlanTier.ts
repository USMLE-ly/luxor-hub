import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { PlanTier } from "@/lib/planRestrictions";

export function usePlanTier(): { tier: PlanTier; isLoading: boolean } {
  const { user } = useAuth();

  const { data: tier, isLoading } = useQuery({
    queryKey: ["plan-tier", user?.id],
    queryFn: async (): Promise<PlanTier> => {
      if (!user) return "free";

      // Check localStorage for quick access
      const local = localStorage.getItem("luxor_paid");
      if (local && local !== "true" && local !== "false") {
        // It's a tier string
        if (["free", "starter", "pro", "elite"].includes(local)) {
          return local as PlanTier;
        }
      }

      // Query database
      const { data } = await supabase
        .from("subscriptions")
        .select("plan_tier")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (data?.plan_tier) {
        const t = data.plan_tier as PlanTier;
        localStorage.setItem("luxor_paid", t);
        return t;
      }

      return "free";
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  return { tier: tier ?? "free", isLoading };
}
