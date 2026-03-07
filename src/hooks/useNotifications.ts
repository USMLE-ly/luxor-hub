import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string;
  type: "like" | "follow" | "design_like" | "design_comment";
  reference_id: string | null;
  read: boolean;
  created_at: string;
  actor_name?: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) {
      // Fetch actor names
      const actorIds = [...new Set(data.map((n: any) => n.actor_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", actorIds);

      const nameMap: Record<string, string> = {};
      (profiles || []).forEach((p: any) => {
        nameMap[p.user_id] = p.display_name || "Someone";
      });

      const enriched: Notification[] = data.map((n: any) => ({
        ...n,
        actor_name: nameMap[n.actor_id] || "Someone",
      }));
      setNotifications(enriched);
      setUnreadCount(enriched.filter((n) => !n.read).length);
    }
  }, [user]);

  const markAllRead = useCallback(async () => {
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("user-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const newNotif = payload.new as any;
          // Fetch actor name
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("user_id", newNotif.actor_id)
            .single();

          const actorName = profile?.display_name || "Someone";
          const enriched: Notification = { ...newNotif, actor_name: actorName };

          setNotifications((prev) => [enriched, ...prev]);
          setUnreadCount((prev) => prev + 1);

          // Show toast
          if (newNotif.type === "like") {
            toast(`${actorName} liked your look! ❤️`);
          } else if (newNotif.type === "follow") {
            toast(`${actorName} started following you! ✨`);
          } else if (newNotif.type === "design_like") {
            toast(`${actorName} liked your design! ❤️`);
          } else if (newNotif.type === "design_comment") {
            toast(`${actorName} commented on your design! 💬`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { notifications, unreadCount, markAllRead, refetch: fetchNotifications };
}
