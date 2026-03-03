import { useLocation, useNavigate } from "react-router-dom";
import { Home, ShoppingBag, Scissors, Shirt } from "lucide-react";

const tabs = [
  { label: "DNA", icon: Home, path: "/dashboard" },
  { label: "My Shop", icon: ShoppingBag, path: "/inspiration" },
  { label: "AI Stylist", icon: Scissors, path: "/chat" },
  { label: "Closet", icon: Shirt, path: "/closet" },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-background border-t border-border">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive =
            location.pathname === tab.path ||
            (tab.path === "/dashboard" && location.pathname === "/style-dna") ||
            (tab.path === "/dashboard" && location.pathname === "/color-type");
          return (
            <button
              key={tab.label}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center gap-0.5 min-w-[60px] pt-1.5 pb-1"
            >
              <tab.icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? "text-[hsl(0,70%,60%)]" : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-[10px] font-sans transition-colors ${
                  isActive ? "text-[hsl(0,70%,60%)] font-semibold" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
