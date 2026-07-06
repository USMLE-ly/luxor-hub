import { ReactNode, useEffect } from "react";
import { scheduleEngagementNudges, clearEngagementNudges } from "@/lib/notificationService";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { PageTransition } from "./PageTransition";
import { AnimatePresence } from "framer-motion";

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading, isReady } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect after session hydration is complete (isReady)
    if (isReady && !user) {
      navigate("/auth");
    }
  }, [user, isReady, navigate]);

  // Schedule re-engagement notifications
  useEffect(() => {
    if (isReady && user) {
      scheduleEngagementNudges();
    }
    return () => clearEngagementNudges();
  }, [isReady, user]);

  // Show spinner while auth is still hydrating
  if (!isReady || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <AnimatePresence mode="wait">
        <PageTransition key={location.pathname}>
          <main>{children}</main>
        </PageTransition>
      </AnimatePresence>
      <BottomNav />
    </div>
  );
}
