import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getApiUrl } from "@/lib/api";

/**
 * Wraps app routes behind a paywall check.
 * Users must be authenticated AND have an active subscription OR free tier to access protected content.
 */
const PaywallGate = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isReady } = useAuth();

  // Always query the DB for subscription status — with hard 5s timeout
  const { data: hasAccess, isLoading: subLoading } = useQuery({
    queryKey: ["subscription-check", user?.id],
    queryFn: async () => {
      if (!user) return false;

      // Check for active subscription
      const { data } = await supabase
        .from("subscriptions")
        .select("id, plan_tier, status")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (data?.status === "active") return true;

      // If subscription exists but status is not active (pending),
      // try to recover — but with a hard 5-second timeout
      if (data?.status === "pending" || (data && data.status !== "active")) {
        try {
          const { data: session } = await supabase.auth.getSession();
          const token = session?.session?.access_token;
          const apiUrl = getApiUrl();

          // HARD 5-SECOND TIMEOUT — prevents hanging on sleeping backends
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const resp = await fetch(`${apiUrl}/api/v1/credits/allocate`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (resp.ok) {
            await supabase
              .from("subscriptions")
              .update({ status: "active" })
              .eq("id", data.id);
            return true;
          }
        } catch {
          // Recovery failed or timed out — let them through anyway
          return true;
        }
      }

      return false;
    },
    enabled: !!user && isReady,
    staleTime: 5 * 60 * 1000,
  });

  // Auth still loading — subtle spinner, NO full-screen green overlay
  if (!isReady || loading) {
    return (
      <div className="flex items-center justify-center w-full h-20">
        <div className="w-6 h-6 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated — redirect to auth
  if (!user) return <Navigate to="/auth" replace />;

  // Subscription check in progress — subtle spinner
  if (subLoading) {
    return (
      <div className="flex items-center justify-center w-full h-20">
        <div className="w-6 h-6 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // No access — redirect to paywall
  if (!hasAccess) return <Navigate to="/paywall" replace />;

  // Access granted — render children
  return <>{children}</>;
};

export default PaywallGate;
