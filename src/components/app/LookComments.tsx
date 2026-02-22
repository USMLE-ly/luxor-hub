import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  author_name: string;
}

interface LookCommentsProps {
  lookId: string;
  lookType?: string;
  lookAuthorId?: string;
}

export const LookComments = ({ lookId, lookType = "user", lookAuthorId }: LookCommentsProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchComments = async () => {
    const { data } = await supabase
      .from("look_comments")
      .select("*")
      .eq("look_id", lookId)
      .eq("look_type", lookType)
      .order("created_at", { ascending: true });

    if (!data || data.length === 0) {
      setComments([]);
      return;
    }

    const userIds = [...new Set(data.map((c: any) => c.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", userIds);

    const nameMap: Record<string, string> = {};
    (profiles || []).forEach((p: any) => {
      nameMap[p.user_id] = p.display_name || "User";
    });

    setComments(
      data.map((c: any) => ({
        id: c.id,
        user_id: c.user_id,
        content: c.content,
        created_at: c.created_at,
        author_name: nameMap[c.user_id] || "User",
      }))
    );
  };

  useEffect(() => {
    if (expanded) fetchComments();
  }, [expanded, lookId]);

  // Realtime subscription
  useEffect(() => {
    if (!expanded) return;
    const channel = supabase
      .channel(`comments-${lookId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "look_comments", filter: `look_id=eq.${lookId}` },
        () => fetchComments()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [expanded, lookId]);

  const postComment = async () => {
    if (!user || !newComment.trim()) return;
    setSending(true);
    await supabase.from("look_comments").insert({
      look_id: lookId,
      look_type: lookType,
      user_id: user.id,
      content: newComment.trim(),
    });

    // Notify look author
    if (lookAuthorId && lookAuthorId !== user.id) {
      await supabase.from("notifications").insert({
        user_id: lookAuthorId,
        actor_id: user.id,
        type: "comment",
        reference_id: lookId,
      });
    }

    setNewComment("");
    setSending(false);
    fetchComments();
  };

  const deleteComment = async (commentId: string) => {
    await supabase.from("look_comments").delete().eq("id", commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs font-sans text-muted-foreground hover:text-foreground transition-colors"
      >
        <MessageCircle className="h-4 w-4" />
        {comments.length > 0 ? comments.length : expanded ? "Close" : "Comment"}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2">
              {comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2 group">
                  <div
                    className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-semibold text-foreground/70 flex-shrink-0 cursor-pointer"
                    onClick={() => navigate(`/profile/${c.user_id}`)}
                  >
                    {c.author_name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-sans">
                      <span
                        className="font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
                        onClick={() => navigate(`/profile/${c.user_id}`)}
                      >
                        {c.author_name}
                      </span>{" "}
                      <span className="text-foreground/80">{c.content}</span>
                    </p>
                    <span className="text-[10px] text-muted-foreground">{timeAgo(c.created_at)}</span>
                  </div>
                  {c.user_id === user?.id && (
                    <button
                      onClick={() => deleteComment(c.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}

              {user && (
                <div className="flex gap-2 pt-1">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && postComment()}
                    placeholder="Add a comment..."
                    className="h-8 text-xs bg-secondary/50 border-glass-border"
                  />
                  <Button
                    size="sm"
                    onClick={postComment}
                    disabled={sending || !newComment.trim()}
                    className="h-8 w-8 p-0 gold-gradient"
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
