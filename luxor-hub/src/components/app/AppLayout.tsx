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

  // Auth still hydrating — centered spinner, no overlay
  if (!isReady || loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-xs text-muted-foreground tracking-wide">Loading your wardrobe...</span>
        </div>
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
