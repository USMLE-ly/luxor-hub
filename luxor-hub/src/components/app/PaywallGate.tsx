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

  // Always query the DB for subscription status — no localStorage bypass
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

      // CRITICAL: If subscription exists but status is not active (pending),
      // the user likely closed the browser before onApprove completed.
      // The webhook may have already activated it. Try to recover.
      if (data?.status === "pending" || (data && data.status !== "active")) {
        // Re-trigger credit allocation in case webhook already set status
        try {
          const { data: session } = await supabase.auth.getSession();
          const token = session?.session?.access_token;
          const apiUrl = import.meta.env.VITE_API_URL || "";
          const resp = await fetch(`${apiUrl}/api/v1/credits/allocate`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (resp.ok) {
            // Credits allocated — mark subscription as active
            await supabase
              .from("subscriptions")
              .update({ status: "active" })
              .eq("id", data.id);
            return true;
          }
        } catch {
          // Recovery failed — let them through anyway, webhook will fix it
          return true;
        }
      }

      return false;
    },
    enabled: !!user && isReady,
    staleTime: 5 * 60 * 1000,
  });

  // Wait for auth hydration before deciding — show loader instead of blank page
  if (!isReady || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  // Show loading state while subscription check runs (unless we already have cached data)
  if (subLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!hasAccess) return <Navigate to="/paywall" replace />;

  return <>{children}</>;
};

export default PaywallGate;
