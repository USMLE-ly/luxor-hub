
import { Navigate } from "react-router-dom";
import log from "@/lib/diagnosticLogger";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";


/**
 * Wraps app routes behind a paywall check.
 * Users must be authenticated AND have an active subscription OR free tier to access protected content.
 */
const PaywallGate = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isReady } = useAuth();

  // Always query the DB for subscription status — with timeout protection
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
      // try to recover — but with a strict 8-second timeout
      if (data?.status === "pending" || (data && data.status !== "active")) {
        try {
          const { data: session } = await supabase.auth.getSession();
          const token = session?.session?.access_token;
          const apiUrl = import.meta.env.VITE_API_URL || "";
          
          // CRITICAL: Add AbortController timeout to prevent hanging on sleeping backends
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);
          
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

  log("AUTH", "PaywallGate", `isReady=${isReady}, loading=${loading}, user=${user ? user.id.slice(0,8) : "null"}, subLoading=${subLoading}, hasAccess=${hasAccess}`);

  if (!isReady || loading) {
    log("AUTH", "PaywallGate", "Auth not ready — showing non-blocking spinner");
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  log("AUTH", "PaywallGate", "No user — redirecting to /auth");
  return <Navigate to="/auth" replace />;

  if (subLoading) {
    log("AUTH", "PaywallGate", "Subscription check in progress — showing non-blocking spinner");
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  log("AUTH", "PaywallGate", hasAccess ? "ACCESS GRANTED — rendering children" : "No access — redirecting to /paywall");
  if (!hasAccess) return <Navigate to="/paywall" replace />;

  return <>{children}</>;
};

export default PaywallGate;
