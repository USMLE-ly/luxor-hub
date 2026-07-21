import { ReactNode, useEffect } from "react";

import { scheduleEngagementNudges, clearEngagementNudges } from "@/lib/notificationService";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav";


import { CreditExhaustedOverlay } from "./CreditExhaustedOverlay";
import { CreditConfirmModal } from "./CreditConfirmModal";
import { PageCreditBar } from "./PageCreditBar";
import { useCreditGuard } from "@/hooks/useCreditGuard";

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading, isReady } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { exhausted, exhaustedAction, exhaustedCost, setExhausted, confirmAction, confirmPending, cancelConfirm } = useCreditGuard();

  useEffect(() => {
    if (isReady && !user) {
      navigate("/auth", { replace: true });
    }
  }, [user, isReady, navigate]);

  useEffect(() => {
    if (isReady && user) {
      scheduleEngagementNudges();
    }
    return () => clearEngagementNudges();
  }, [isReady, user]);

  // Auth still hydrating — subtle spinner only, NO full-screen overlay
  if (!isReady || loading) {
    return (
      <div className="flex items-center justify-center w-full h-20">
        <div className="w-6 h-6 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated — useEffect handles redirect, just show nothing
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <main>
        {children}
      </main>
      <BottomNav />
      <CreditExhaustedOverlay
        isOpen={exhausted}
        onClose={() => setExhausted(false)}
        actionCost={exhaustedCost}
        actionName={exhaustedAction}
      />
      <CreditConfirmModal
        isOpen={!!confirmAction}
        action={confirmAction || ""}
        onConfirm={confirmPending}
        onCancel={cancelConfirm}
      />
    </div>
  );
}
