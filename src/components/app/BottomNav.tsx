import { useLocation, useNavigate } from "react-router-dom";
import { Home, ShoppingBag, ScanLine, Scissors, Shirt, Users } from "lucide-react";
import { motion } from "framer-motion";
import { haptic } from "@/lib/haptics";

const tabs = [
  { label: "DNA", icon: Home, path: "/dashboard" },
  { label: "My Shop", icon: ShoppingBag, path: "/inspiration" },
  { label: "Analysis", icon: ScanLine, path: "/outfit-analysis" },
  { label: "AI Stylist", icon: Scissors, path: "/chat" },
  { label: "Council", icon: Users, path: "/council" },
  { label: "Closet", icon: Shirt, path: "/closet" },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border/50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive =
            location.pathname === tab.path ||
            (tab.path === "/dashboard" && location.pathname === "/style-dna") ||
            (tab.path === "/dashboard" && location.pathname === "/color-type");
          return (
            <button
              key={tab.label}
              onClick={() => { haptic("selection"); navigate(tab.path); }}
              className="flex flex-col items-center gap-0.5 min-w-[52px] pt-1.5 pb-1 relative"
            >
              <motion.div
                animate={{ scale: isActive ? 1.12 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <tab.icon
                  className={`w-[18px] h-[18px] transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                  strokeWidth={isActive ? 2.4 : 1.8}
                />
              </motion.div>
              <span
                className={`text-[9px] font-sans transition-colors ${
                  isActive ? "text-primary font-semibold" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
              {/* Active dot indicator */}
              {isActive && (
                <motion.div
                  layoutId="bottomNavDot"
                  className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
