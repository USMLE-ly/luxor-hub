import { ReactNode, useEffect } from "react";
import log from "@/lib/diagnosticLogger";
import { motion } from "framer-motion";
import { scheduleEngagementNudges, clearEngagementNudges } from "@/lib/notificationService";

import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { PageTransition } from "./PageTransition";
import { AnimatePresence } from "framer-motion";
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

  log("AUTH", "AppLayout", `isReady=${isReady}, loading=${loading}, user=${user ? user.id.slice(0,8) : "null"}`);

  // Auth still hydrating — show subtle spinner, NOT the full-screen green AnimatedLoader
  if (!isReady || loading) {
    log("AUTH", "AppLayout", "Auth hydrating — showing non-blocking spinner");
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated — return null (the useEffect above handles redirect)
  if (!user) {
    log("AUTH", "AppLayout", "No user — returning null, redirect handled by useEffect");
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AnimatePresence mode="wait">
        <PageTransition key={location.pathname}>
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.main>
        </PageTransition>
      </AnimatePresence>
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
