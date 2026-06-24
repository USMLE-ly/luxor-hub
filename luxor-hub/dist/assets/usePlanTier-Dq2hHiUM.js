import { e as useAuth, s as supabase } from "./AppContent-_r6To3FT.js";
import { u as useQuery } from "./useQuery-CiOycrs6.js";
function usePlanTier() {
  const { user } = useAuth();
  const { data: tier, isLoading } = useQuery({
    queryKey: ["plan-tier", user == null ? void 0 : user.id],
    queryFn: async () => {
      if (!user) return "free";
      const local = localStorage.getItem("luxor_paid");
      if (local && local !== "true" && local !== "false") {
        if (["free", "starter", "pro", "elite"].includes(local)) {
          return local;
        }
      }
      const { data } = await supabase.from("subscriptions").select("plan_tier").eq("user_id", user.id).eq("status", "active").limit(1).maybeSingle();
      if (data == null ? void 0 : data.plan_tier) {
        const t = data.plan_tier;
        localStorage.setItem("luxor_paid", t);
        return t;
      }
      return "free";
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1e3
  });
  return { tier: tier ?? "free", isLoading };
}
export {
  usePlanTier as u
};
