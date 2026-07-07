import { ReactNode, useEffect } from "react";
import { motion } from "framer-motion";
import { scheduleEngagementNudges, clearEngagementNudges } from "@/lib/notificationService";
import { ClassicLoader } from "@/components/ui/loader";
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
      navigate("/auth", { replace: true });
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
        <ClassicLoader />
      </div>
    );
  }

  // User is not authenticated — show loader while redirect happens
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <ClassicLoader />
      </div>
    );
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
    </div>
  );
}
