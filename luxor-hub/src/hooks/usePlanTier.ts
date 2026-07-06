import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { PlanTier } from "@/lib/planRestrictions";

const PER_USER_CACHE_PREFIX = "luxor_plan_";

export function usePlanTier(): { tier: PlanTier; isLoading: boolean } {
  const { user, isReady } = useAuth();

  const { data: tier, isLoading } = useQuery({
    queryKey: ["plan-tier", user?.id],
    queryFn: async (): Promise<PlanTier> => {
      if (!user) return "free";

      // Per-user cache key — never bleeds across accounts
      const cacheKey = PER_USER_CACHE_PREFIX + user.id;
      const cached = localStorage.getItem(cacheKey);
      if (cached && ["free", "starter", "pro", "elite"].includes(cached)) {
        return cached as PlanTier;
      }

      const { data } = await supabase
        .from("subscriptions")
        .select("plan_tier")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (data?.plan_tier) {
        const t = data.plan_tier as PlanTier;
        localStorage.setItem(cacheKey, t);
        return t;
      }

      return "free";
    },
    // Don't fetch until auth is fully hydrated
    enabled: !!user && isReady,
    staleTime: 5 * 60 * 1000,
  });

  return { tier: tier ?? "free", isLoading };
}
