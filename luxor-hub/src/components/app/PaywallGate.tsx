import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Wraps app routes behind a paywall check.
 * Users must be authenticated AND have an active subscription OR free tier to access protected content.
 */
const PaywallGate = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isReady } = useAuth();

  const { data: hasAccess, isLoading: subLoading } = useQuery({
    queryKey: ["subscription-check", user?.id],
    queryFn: async () => {
      if (!user) return false;

      // Per-user cache — never leaks across accounts
      const cacheKey = "luxor_sub_" + user.id;
      const cached = localStorage.getItem(cacheKey);
      if (cached === "true") return true;
      if (cached === "false") return false;

      const { data } = await supabase
        .from("subscriptions")
        .select("id, plan_tier")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (data) {
        localStorage.setItem(cacheKey, "true");
        return true;
      }
      localStorage.setItem(cacheKey, "false");
      return false;
    },
    enabled: !!user && isReady,
    staleTime: 5 * 60 * 1000,
  });

  // Wait for auth hydration before deciding
  if (!isReady || loading || subLoading) return null;

  if (!user) return <Navigate to="/auth" replace />;

  if (!hasAccess) return <Navigate to="/paywall" replace />;

  return <>{children}</>;
};

export default PaywallGate;
