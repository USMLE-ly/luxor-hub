import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, UserPlus, UserCheck, Share2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface FeedLook {
  id: string;
  title: string;
  description: string | null;
  items: string[];
  occasion: string | null;
  mood: string | null;
  author_id: string;
  author_name: string;
  created_at: string;
  liked: boolean;
  likeCount: number;
  isFollowing: boolean;
}

export const SocialFeed = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [looks, setLooks] = useState<FeedLook[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    if (!user) return;

    const [looksRes, likesRes, followsRes, profilesRes] = await Promise.all([
      supabase.from("user_looks").select("*").eq("is_public", true).order("created_at", { ascending: false }).limit(50),
      supabase.from("look_likes").select("look_id").eq("user_id", user.id),
      supabase.from("follows").select("following_id").eq("follower_id", user.id),
      supabase.from("profiles").select("user_id, display_name"),
    ]);

    const likedSet = new Set((likesRes.data || []).map((l: any) => l.look_id));
    const followingSet = new Set((followsRes.data || []).map((f: any) => f.following_id));
    const profileMap: Record<string, string> = {};
    (profilesRes.data || []).forEach((p: any) => { profileMap[p.user_id] = p.display_name || "User"; });

    // Get like counts
    const lookIds = (looksRes.data || []).map((l: any) => l.id);
    let likeCounts: Record<string, number> = {};
    if (lookIds.length > 0) {
      const { data: allLikes } = await supabase.from("look_likes").select("look_id").in("look_id", lookIds);
      (allLikes || []).forEach((l: any) => {
        likeCounts[l.look_id] = (likeCounts[l.look_id] || 0) + 1;
      });
    }

    const feedLooks: FeedLook[] = (looksRes.data || []).map((l: any) => ({
      id: l.id,
      title: l.title,
      description: l.description,
      items: l.items || [],
      occasion: l.occasion,
      mood: l.mood,
      author_id: l.user_id,
      author_name: l.author_name || profileMap[l.user_id] || "Stylist",
      created_at: l.created_at,
      liked: likedSet.has(l.id),
      likeCount: likeCounts[l.id] || 0,
      isFollowing: followingSet.has(l.user_id),
    }));

    setLooks(feedLooks);
    setLoading(false);
  };

  useEffect(() => { fetchFeed(); }, [user]);

  const toggleLike = async (lookId: string) => {
    if (!user) return;
    const look = looks.find((l) => l.id === lookId);
    if (!look) return;

    if (look.liked) {
      await supabase.from("look_likes").delete().eq("user_id", user.id).eq("look_id", lookId);
    } else {
      await supabase.from("look_likes").insert({ user_id: user.id, look_id: lookId, look_type: "user" });
      // Notify the look author
      if (look.author_id !== user.id) {
        await supabase.from("notifications").insert({
          user_id: look.author_id,
          actor_id: user.id,
          type: "like",
          reference_id: lookId,
        });
      }
    }

    setLooks((prev) =>
      prev.map((l) =>
        l.id === lookId
          ? { ...l, liked: !l.liked, likeCount: l.liked ? l.likeCount - 1 : l.likeCount + 1 }
          : l
      )
    );
  };

  const toggleFollow = async (targetUserId: string) => {
    if (!user || targetUserId === user.id) return;
    const isFollowing = looks.find((l) => l.author_id === targetUserId)?.isFollowing;

    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", targetUserId);
      toast.success("Unfollowed");
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, following_id: targetUserId });
      // Notify the followed user
      await supabase.from("notifications").insert({
        user_id: targetUserId,
        actor_id: user.id,
        type: "follow",
      });
      toast.success("Following! ✨");
    }

    setLooks((prev) =>
      prev.map((l) =>
        l.author_id === targetUserId ? { ...l, isFollowing: !isFollowing } : l
      )
    );
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const moodColors: Record<string, string> = {
    Professional: "bg-primary/10 text-primary",
    Relaxed: "bg-blue-500/10 text-blue-400",
    Romantic: "bg-pink-500/10 text-pink-400",
    Energetic: "bg-orange-500/10 text-orange-400",
    Fresh: "bg-teal-500/10 text-teal-400",
    Confident: "bg-purple-500/10 text-purple-400",
    Creative: "bg-amber-500/10 text-amber-400",
    Bold: "bg-red-500/10 text-red-400",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="font-display text-xl font-bold text-foreground">Community Feed</h2>
      </div>

      {looks.length === 0 ? (
        <div className="text-center py-16">
          <Sparkles className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-sans text-sm">No public looks yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {looks.map((look, i) => (
              <motion.div
                key={look.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-5"
              >
                {/* Author Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full gold-gradient flex items-center justify-center text-primary-foreground font-semibold text-sm">
                      {look.author_name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-sans font-medium text-foreground cursor-pointer hover:text-primary transition-colors" onClick={() => navigate(`/profile/${look.author_id}`)}>{look.author_name}</p>
                      <p className="text-[10px] text-muted-foreground font-sans">{timeAgo(look.created_at)}</p>
                    </div>
                  </div>
                  {look.author_id !== user?.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFollow(look.author_id)}
                      className={`text-xs font-sans h-7 ${
                        look.isFollowing
                          ? "border-primary/30 text-primary"
                          : "border-glass-border hover:border-primary/50"
                      }`}
                    >
                      {look.isFollowing ? (
                        <><UserCheck className="h-3 w-3 mr-1" /> Following</>
                      ) : (
                        <><UserPlus className="h-3 w-3 mr-1" /> Follow</>
                      )}
                    </Button>
                  )}
                </div>

                {/* Photo */}
                {(look as any).photo_url && (
                  <div className="rounded-xl overflow-hidden mb-3 border border-glass-border">
                    <img src={(look as any).photo_url} alt={look.title} className="w-full h-56 object-cover" />
                  </div>
                )}

                {/* Content */}
                <h3 className="font-display text-lg font-bold text-foreground mb-1">{look.title}</h3>
                {look.description && (
                  <p className="text-sm text-muted-foreground font-sans mb-3">{look.description}</p>
                )}

                {/* Tags */}
                <div className="flex gap-2 flex-wrap mb-3">
                  {look.mood && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-medium ${moodColors[look.mood] || "bg-secondary text-muted-foreground"}`}>
                      {look.mood}
                    </span>
                  )}
                  {look.occasion && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-sans bg-secondary text-muted-foreground">
                      {look.occasion}
                    </span>
                  )}
                </div>

                {/* Items */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {look.items.map((item, j) => (
                    <span key={j} className="px-2.5 py-1 rounded-full text-xs font-sans bg-secondary/80 text-foreground/80">
                      {item}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-2 border-t border-glass-border">
                  <button
                    onClick={() => toggleLike(look.id)}
                    className={`flex items-center gap-1.5 text-xs font-sans transition-colors ${
                      look.liked ? "text-pink-400" : "text-muted-foreground hover:text-pink-400"
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${look.liked ? "fill-current" : ""}`} />
                    {look.likeCount > 0 && look.likeCount}
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`Check out "${look.title}" on Aurelia!`);
                      toast.success("Link copied!");
                    }}
                    className="flex items-center gap-1.5 text-xs font-sans text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
