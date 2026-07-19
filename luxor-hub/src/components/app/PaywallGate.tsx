import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AnimatedLoader from "@/components/ui/animated-loader-1";

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

      const { data } = await supabase
        .from("subscriptions")
        .select("id, plan_tier")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      return !!data;
    },
    enabled: !!user && isReady,
    staleTime: 5 * 60 * 1000,
  });

  // Wait for auth hydration before deciding — show loader instead of blank page
  if (!isReady || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <AnimatedLoader />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  // Show loading state while subscription check runs (unless we already have cached data)
  if (subLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <AnimatedLoader />
      </div>
    );
  }

  if (!hasAccess) return <Navigate to="/paywall" replace />;

  return <>{children}</>;
};

export default PaywallGate;
