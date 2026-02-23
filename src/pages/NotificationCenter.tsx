import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Bell, Heart, UserPlus, Award, Trophy, Flame, Check, CheckCheck,
  Loader2, MessageCircle, Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface UnifiedNotification {
  id: string;
  type: "like" | "follow" | "comment" | "badge" | "challenge";
  title: string;
  description: string;
  read: boolean;
  created_at: string;
  link?: string;
  icon: "heart" | "user-plus" | "award" | "trophy" | "flame" | "message";
}

export default function NotificationCenter() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<UnifiedNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "social" | "badges" | "challenges">("all");

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [socialRes, badgesRes, challengeRes] = await Promise.all([
      supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("user_badges")
        .select("*")
        .eq("user_id", user.id)
        .order("unlocked_at", { ascending: false })
        .limit(20),
      supabase
        .from("challenge_entries")
        .select("*, weekly_challenges(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    const unified: UnifiedNotification[] = [];

    // Social notifications
    if (socialRes.data) {
      const actorIds = [...new Set(socialRes.data.map((n: any) => n.actor_id))];
      let nameMap: Record<string, string> = {};
      if (actorIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", actorIds);
        for (const p of profiles || []) {
          nameMap[p.user_id] = p.display_name || "Someone";
        }
      }

      for (const n of socialRes.data as any[]) {
        const actor = nameMap[n.actor_id] || "Someone";
        unified.push({
          id: `social-${n.id}`,
          type: n.type,
          title: n.type === "like" ? `${actor} liked your look` : n.type === "follow" ? `${actor} started following you` : `${actor} commented`,
          description: n.type === "like" ? "❤️ Your style is getting attention!" : n.type === "follow" ? "✨ You have a new follower!" : "💬 New comment on your look",
          read: n.read,
          created_at: n.created_at,
          link: n.type === "follow" ? `/profile/${n.actor_id}` : undefined,
          icon: n.type === "like" ? "heart" : n.type === "follow" ? "user-plus" : "message",
        });
      }
    }

    // Badge notifications
    if (badgesRes.data) {
      for (const b of badgesRes.data as any[]) {
        unified.push({
          id: `badge-${b.id}`,
          type: "badge",
          title: `🏅 Badge Unlocked: ${b.badge_name}`,
          description: b.badge_description,
          read: true,
          created_at: b.unlocked_at,
          link: "/badges",
          icon: "award",
        });
      }
    }

    // Challenge entries
    if (challengeRes.data) {
      for (const c of challengeRes.data as any[]) {
        const challenge = c.weekly_challenges;
        unified.push({
          id: `challenge-${c.id}`,
          type: "challenge",
          title: `Challenge Entry: ${challenge?.theme || "Style Showdown"}`,
          description: `You scored ${c.score}/100 in the weekly challenge`,
          read: true,
          created_at: c.created_at,
          link: "/weekly-challenge",
          icon: "trophy",
        });
      }
    }

    unified.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setNotifications(unified);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("All marked as read");
  };

  const filtered = notifications.filter(n => {
    if (filter === "social") return ["like", "follow", "comment"].includes(n.type);
    if (filter === "badges") return n.type === "badge";
    if (filter === "challenges") return n.type === "challenge";
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const iconMap = {
    heart: <Heart className="w-4 h-4 text-pink-400" />,
    "user-plus": <UserPlus className="w-4 h-4 text-primary" />,
    award: <Award className="w-4 h-4 text-yellow-500" />,
    trophy: <Trophy className="w-4 h-4 text-primary" />,
    flame: <Flame className="w-4 h-4 text-orange-400" />,
    message: <MessageCircle className="w-4 h-4 text-blue-400" />,
  };

  const typeBgMap: Record<string, string> = {
    heart: "bg-pink-500/10",
    "user-plus": "bg-primary/10",
    award: "bg-yellow-500/10",
    trophy: "bg-primary/10",
    flame: "bg-orange-500/10",
    message: "bg-blue-500/10",
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Notification <span className="gold-text">Center</span>
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              All your activity in one place
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-primary/15 text-primary border-primary/30">{unreadCount} unread</Badge>
              )}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead} className="border-primary/30 text-primary">
              <CheckCheck className="w-4 h-4 mr-1" /> Mark all read
            </Button>
          )}
        </div>

        <Tabs defaultValue="all" className="w-full" onValueChange={(v) => setFilter(v as any)}>
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="social" className="text-xs">Social</TabsTrigger>
            <TabsTrigger value="badges" className="text-xs">Badges</TabsTrigger>
            <TabsTrigger value="challenges" className="text-xs">Challenges</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filtered.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card
                    className={`glass-card cursor-pointer hover:bg-muted/30 transition-colors ${!n.read ? "ring-1 ring-primary/20 bg-primary/5" : ""}`}
                    onClick={() => n.link && navigate(n.link)}
                  >
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className={`mt-0.5 p-2 rounded-full ${typeBgMap[n.icon]}`}>
                        {iconMap[n.icon]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-muted-foreground">{timeAgo(n.created_at)}</p>
                        {!n.read && <div className="mt-1 h-2 w-2 rounded-full bg-primary ml-auto" />}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
