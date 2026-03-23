import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Wraps app routes behind a paywall check.
 * Users must be authenticated AND have an active subscription OR free tier to access protected content.
 */
const PaywallGate = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  const { data: hasAccess, isLoading: subLoading } = useQuery({
    queryKey: ["subscription-check", user?.id],
    queryFn: async () => {
      if (!user) return false;

      // Check localStorage first for quick gate (supports "true" for paid and "free" for free tier)
      const localPaid = localStorage.getItem("luxor_paid");
      if (localPaid === "true" || localPaid === "free") return true;

      const { data } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (data) {
        localStorage.setItem("luxor_paid", "true");
        return true;
      }
      return false;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  if (loading || subLoading) return null;

  if (!user) return <Navigate to="/auth" replace />;

  if (!hasAccess) return <Navigate to="/paywall" replace />;

  return <>{children}</>;
};

export default PaywallGate;
