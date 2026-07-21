import {TShirt, MagicWand, ChatCircle, ChartBar, GearSix, SignOut, Sparkle, ArrowsOut, User, Scan, Trophy, Flame, Bell, CalendarDots, SquaresFour, Video, PaintBrush, StackSimple, GlobeHemisphereWest, Crown, CurrencyDollar, Lightning} from "@phosphor-icons/react";
import { NotificationBell } from "./NotificationBell";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { usePlanTier } from "@/hooks/usePlanTier";
import { CreditBadge } from "@/components/app/CreditBadge";
import type { PlanTier } from "@/lib/planRestrictions";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Closet", url: "/closet", icon: TShirt },
  { title: "Outfit Generator", url: "/outfits", icon: MagicWand },
  { title: "Outfit Builder", url: "/outfit-builder", icon: ArrowsOut },
  { title: "Outfit Analysis", url: "/outfit-analysis", icon: Scan },
  { title: "Outfit Calendar", url: "/outfit-calendar", icon: CalendarDots },
  { title: "AI Stylist", url: "/chat", icon: ChatCircle },
  { title: "Analytics", url: "/analytics", icon: ChartBar },
  { title: "Inspiration", url: "/inspiration", icon: Sparkle },
  { title: "Mood Board", url: "/mood-board", icon: SquaresFour },
  { title: "Video Analysis", url: "/video-analysis", icon: Video },
  { title: "Fashion Designer", url: "/fashion-designer", icon: PaintBrush },
  { title: "Virtual Try-On", url: "/virtual-tryon", icon: StackSimple },
  { title: "Community Gallery", url: "/community-gallery", icon: GlobeHemisphereWest },
  { title: "Leaderboard", url: "/leaderboard", icon: Trophy },
  { title: "Weekly Challenge", url: "/weekly-challenge", icon: Flame },
  { title: "Credits", url: "/credits", icon: Lightning },
  { title: "Badges", url: "/badges", icon: Trophy },
  { title: "Wardrobe Value", url: "/wardrobe-value", icon: CurrencyDollar },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Settings", url: "/settings", icon: GearSix },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, signOut } = useAuth();
  const { tier } = usePlanTier();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User";

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar" collapsible="icon">
      <div className="p-4 flex items-center gap-3">
        {!collapsed && (
          <h1 className="font-display text-xl font-bold gold-text">LUXOR®</h1>
        )}
        <div className="ml-auto flex items-center gap-1">
          <NotificationBell />
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        </div>
      </div>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                      activeClassName="bg-secondary text-primary font-medium"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span className="font-sans text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Credit balance badge */}
      {!collapsed && (
        <div className="px-2 py-2">
          <CreditBadge />
        </div>
      )}

      <div className="mt-auto p-4 border-t border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-primary-foreground font-semibold text-sm">
              {displayName[0]?.toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-sans text-sm text-foreground truncate">{displayName}</span>
              <button
                onClick={() => navigate("/paywall")}
                className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
              >
                <Crown className="w-3 h-3" />
                {tier === "free" ? "Free" : tier === "starter" ? "Starter" : tier === "pro" ? "Pro" : "Elite"}
              </button>
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all w-full font-sans text-sm"
        >
          <SignOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </Sidebar>
  );
}
