import { useLocation, useNavigate } from "react-router-dom";
import {CalendarDots, Scan, StackSimple, TShirt, Sparkle} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { haptic } from "@/lib/haptics";
import { playGoldClick } from "@/lib/audio-system";

const tabs = [
  { label: "Schedule", icon: CalendarDays, path: "/outfit-calendar" },
  { label: "Analysis", icon: ScanLine, path: "/outfit-analysis" },
  { label: "Dressing Room", icon: Layers, path: "/dressing-room" },
  { label: "Recommend", icon: Sparkles, path: "/style-recommendations" },
  { label: "Closet", icon: Shirt, path: "/closet" },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 pb-[env(safe-area-inset-bottom)] pointer-events-none">
      <div className="grid grid-cols-5 items-center h-14 max-w-lg mx-auto mb-3 mt-1 rounded-full border border-white/10 bg-emerald/80 backdrop-blur-2xl shadow-lg shadow-forest/50 pointer-events-auto">
        {tabs.map((tab) => {
          const isActive =
            location.pathname === tab.path;
          return (
            <motion.button
              key={tab.label}
              onClick={() => { haptic("selection"); playGoldClick(); navigate(tab.path); }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.93 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="flex flex-col items-center gap-0.5 min-w-[44px] pt-1.5 pb-1 relative"
            >
              <motion.div
                animate={{ scale: isActive ? 1.12 : 1, y: isActive ? -2 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <tab.icon
                  className={`w-[18px] h-[18px] transition-colors duration-300 ${
                    isActive ? "text-primary drop-shadow-[0_0_6px_hsl(var(--gold)/0.3)]" : "text-muted-foreground"
                  }`}
                  strokeWidth={isActive ? 2.4 : 1.8}
                />
              </motion.div>
              <motion.span
                animate={{ color: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}
                className={`text-[9px] font-sans`}
              >
                {tab.label}
              </motion.span>
              {isActive && (
                <motion.div
                  layoutId="bottomNavDot"
                  className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--gold)/0.4)]"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
