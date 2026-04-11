import { ReactNode, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { PageTransition } from "./PageTransition";
import { AnimatePresence } from "framer-motion";

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-16">
      <AnimatePresence mode="wait">
        <PageTransition key={location.pathname}>
          <main>{children}</main>
        </PageTransition>
      </AnimatePresence>
      <BottomNav />
    </div>
  );
}
