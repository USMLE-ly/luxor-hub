import { Home, Shirt, Wand2, MessageCircle, BarChart3, Settings, LogOut, Sparkles, Move, User, ScanEye, Trophy, Flame, Award, Bell, CalendarDays, LayoutGrid, Video, Paintbrush, Layers } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
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
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "My Closet", url: "/closet", icon: Shirt },
  { title: "Outfit Generator", url: "/outfits", icon: Wand2 },
  { title: "Outfit Builder", url: "/outfit-builder", icon: Move },
  { title: "Outfit Analysis", url: "/outfit-analysis", icon: ScanEye },
  { title: "Outfit Calendar", url: "/outfit-calendar", icon: CalendarDays },
  { title: "AI Stylist", url: "/chat", icon: MessageCircle },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Inspiration", url: "/inspiration", icon: Sparkles },
  { title: "Mood Board", url: "/mood-board", icon: LayoutGrid },
  { title: "Video Analysis", url: "/video-analysis", icon: Video },
  { title: "Fashion Designer", url: "/fashion-designer", icon: Paintbrush },
  { title: "Virtual Try-On", url: "/virtual-tryon", icon: Layers },
  { title: "Leaderboard", url: "/leaderboard", icon: Trophy },
  { title: "Weekly Challenge", url: "/weekly-challenge", icon: Flame },
  { title: "Badges", url: "/badges", icon: Award },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, signOut } = useAuth();
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
          <h1 className="font-display text-xl font-bold gold-text">AURELIA</h1>
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

      <div className="mt-auto p-4 border-t border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-primary-foreground font-semibold text-sm">
              {displayName[0]?.toUpperCase()}
            </div>
            <span className="font-sans text-sm text-foreground truncate">{displayName}</span>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all w-full font-sans text-sm"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </Sidebar>
  );
}
