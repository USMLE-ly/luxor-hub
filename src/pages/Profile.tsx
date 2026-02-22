import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, UserCheck, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ProfileData {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface PublicLook {
  id: string;
  title: string;
  description: string | null;
  items: string[];
  occasion: string | null;
  mood: string | null;
  created_at: string;
}

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [looks, setLooks] = useState<PublicLook[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetchProfile = async () => {
      const [profileRes, looksRes, followersRes, followingRes] = await Promise.all([
        supabase.from("profiles").select("user_id, display_name, avatar_url").eq("user_id", userId).single(),
        supabase.from("user_looks").select("*").eq("user_id", userId).eq("is_public", true).order("created_at", { ascending: false }),
        supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", userId),
        supabase.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", userId),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      setLooks(looksRes.data || []);
      setFollowerCount(followersRes.count || 0);
      setFollowingCount(followingRes.count || 0);

      // Check if current user follows this profile
      if (user && user.id !== userId) {
        const { data } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", user.id)
          .eq("following_id", userId)
          .maybeSingle();
        setIsFollowing(!!data);
      }

      setLoading(false);
    };
    fetchProfile();
  }, [userId, user]);

  const toggleFollow = async () => {
    if (!user || !userId || user.id === userId) return;
    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", userId);
      setIsFollowing(false);
      setFollowerCount((c) => c - 1);
      toast.success("Unfollowed");
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, following_id: userId });
      // Create notification
      await supabase.from("notifications").insert({
        user_id: userId,
        actor_id: user.id,
        type: "follow",
      });
      setIsFollowing(true);
      setFollowerCount((c) => c + 1);
      toast.success("Following! ✨");
    }
  };

  const displayName = profile?.display_name || "User";
  const isOwnProfile = user?.id === userId;

  const moodColors: Record<string, string> = {
    Professional: "bg-primary/10 text-primary",
    Relaxed: "bg-blue-500/10 text-blue-400",
    Romantic: "bg-pink-500/10 text-pink-400",
    Energetic: "bg-orange-500/10 text-orange-400",
    Creative: "bg-amber-500/10 text-amber-400",
    Bold: "bg-red-500/10 text-red-400",
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground font-sans">Profile not found</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Profile Header */}
          <div className="glass rounded-2xl p-6 lg:p-8 mb-8">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center text-primary-foreground font-display text-2xl font-bold shrink-0">
                {displayName[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <h1 className="font-display text-2xl font-bold text-foreground">{displayName}</h1>
                <div className="flex gap-5 mt-2 text-sm font-sans text-muted-foreground">
                  <span><strong className="text-foreground">{followerCount}</strong> followers</span>
                  <span><strong className="text-foreground">{followingCount}</strong> following</span>
                  <span><strong className="text-foreground">{looks.length}</strong> looks</span>
                </div>
              </div>
              {!isOwnProfile && user && (
                <Button
                  onClick={toggleFollow}
                  variant={isFollowing ? "outline" : "default"}
                  className={isFollowing
                    ? "border-primary/30 text-primary font-sans"
                    : "gold-gradient text-primary-foreground font-sans"
                  }
                >
                  {isFollowing ? (
                    <><UserCheck className="h-4 w-4 mr-2" /> Following</>
                  ) : (
                    <><UserPlus className="h-4 w-4 mr-2" /> Follow</>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Public Looks */}
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold text-foreground">Public Looks</h2>
          </div>

          {looks.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground font-sans text-sm">
                {isOwnProfile ? "You haven't shared any looks yet." : "No public looks yet."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {looks.map((look, i) => (
                <motion.div
                  key={look.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass rounded-2xl p-5"
                >
                  <h3 className="font-display text-lg font-bold text-foreground mb-1">{look.title}</h3>
                  {look.description && (
                    <p className="text-sm text-muted-foreground font-sans mb-3">{look.description}</p>
                  )}
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
                  <div className="flex flex-wrap gap-1.5">
                    {look.items.map((item, j) => (
                      <span key={j} className="px-2.5 py-1 rounded-full text-xs font-sans bg-secondary/80 text-foreground/80">
                        {item}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Profile;
