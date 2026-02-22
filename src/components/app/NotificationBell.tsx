import { Bell, Heart, UserPlus } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

export function NotificationBell() {
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const navigate = useNavigate();

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full gold-gradient text-[10px] font-bold flex items-center justify-center text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-card border-glass-border" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-glass-border">
          <h3 className="font-display text-sm font-bold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllRead}
              className="text-xs text-primary hover:text-primary font-sans h-6"
            >
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground font-sans">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-glass-border">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    if (n.type === "follow") navigate(`/profile/${n.actor_id}`);
                  }}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors ${
                    !n.read ? "bg-primary/5" : ""
                  }`}
                >
                  <div className={`mt-0.5 p-1.5 rounded-full ${
                    n.type === "like" ? "bg-pink-500/10" : "bg-primary/10"
                  }`}>
                    {n.type === "like" ? (
                      <Heart className="h-3.5 w-3.5 text-pink-400" />
                    ) : (
                      <UserPlus className="h-3.5 w-3.5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-sans text-foreground">
                      <span className="font-medium">{n.actor_name}</span>{" "}
                      {n.type === "like" ? "liked your look" : "started following you"}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-sans mt-0.5">
                      {timeAgo(n.created_at)}
                    </p>
                  </div>
                  {!n.read && (
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
