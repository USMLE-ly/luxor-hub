import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Wraps app routes behind a paywall check.
 * Users must be authenticated AND have "paid" to access protected content.
 * For now, payment status is stored in localStorage as a UI-only gate.
 */
const PaywallGate = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  // Not logged in → auth page
  if (!user) return <Navigate to="/auth" replace />;

  // Not paid → paywall
  const hasPaid = localStorage.getItem("luxor_paid") === "true";
  if (!hasPaid) return <Navigate to="/paywall" replace />;

  return <>{children}</>;
};

export default PaywallGate;
