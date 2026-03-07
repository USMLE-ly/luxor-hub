import { useState, useEffect } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Heart, MessageCircle, Shirt, Loader2, Search, Filter,
  Send, Sparkles, TrendingUp, ChevronDown, ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CommunityDesign {
  id: string;
  image_url: string;
  prompt: string;
  description: string | null;
  garment_type: string;
  created_at: string;
  user_id: string;
  profile?: { display_name: string | null; avatar_url: string | null };
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profile?: { display_name: string | null };
}

const GARMENT_FILTERS = ["All", "Dress", "Blazer", "Jacket", "Coat", "Top", "Blouse", "Shirt", "Trousers", "Skirt", "Jumpsuit", "Knitwear", "Accessories"];

export default function CommunityGallery() {
  const { user } = useAuth();
  const [designs, setDesigns] = useState<CommunityDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [garmentFilter, setGarmentFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"recent" | "popular">("recent");
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [recommendingId, setRecommendingId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchDesigns();
  }, [user, garmentFilter, sortBy]);

  const fetchDesigns = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("fashion_designs")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (garmentFilter !== "All") {
        query = query.eq("garment_type", garmentFilter);
      }

      const { data: designsData, error } = await query;
      if (error) throw error;

      if (!designsData?.length) {
        setDesigns([]);
        setLoading(false);
        return;
      }

      // Fetch profiles for all unique user_ids
      const userIds = [...new Set(designsData.map(d => d.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Fetch like counts
      const designIds = designsData.map(d => d.id);
      const { data: likes } = await supabase
        .from("look_likes")
        .select("look_id, user_id")
        .eq("look_type", "design")
        .in("look_id", designIds);

      const likeCounts = new Map<string, number>();
      const userLikes = new Set<string>();
      likes?.forEach(l => {
        likeCounts.set(l.look_id, (likeCounts.get(l.look_id) || 0) + 1);
        if (user && l.user_id === user.id) userLikes.add(l.look_id);
      });

      // Fetch comment counts
      const { data: commentData } = await supabase
        .from("look_comments")
        .select("look_id")
        .eq("look_type", "design")
        .in("look_id", designIds);

      const commentCounts = new Map<string, number>();
      commentData?.forEach(c => {
        commentCounts.set(c.look_id, (commentCounts.get(c.look_id) || 0) + 1);
      });

      let result: CommunityDesign[] = designsData.map(d => ({
        ...d,
        profile: profileMap.get(d.user_id) || { display_name: null, avatar_url: null },
        likeCount: likeCounts.get(d.id) || 0,
        commentCount: commentCounts.get(d.id) || 0,
        isLiked: userLikes.has(d.id),
      }));

      if (sortBy === "popular") {
        result.sort((a, b) => b.likeCount - a.likeCount);
      }

      setDesigns(result);
    } catch (err: any) {
      toast.error("Failed to load community designs");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (designId: string) => {
    if (!user) { toast.error("Sign in to like designs"); return; }
    const design = designs.find(d => d.id === designId);
    if (!design) return;

    if (design.isLiked) {
      await supabase.from("look_likes").delete().eq("look_id", designId).eq("look_type", "design").eq("user_id", user.id);
      setDesigns(prev => prev.map(d => d.id === designId ? { ...d, isLiked: false, likeCount: d.likeCount - 1 } : d));
    } else {
      await supabase.from("look_likes").insert({ look_id: designId, look_type: "design", user_id: user.id });
      setDesigns(prev => prev.map(d => d.id === designId ? { ...d, isLiked: true, likeCount: d.likeCount + 1 } : d));
      // Notify design owner
      if (design.user_id !== user.id) {
        await supabase.from("notifications").insert({
          user_id: design.user_id,
          actor_id: user.id,
          type: "design_like",
          reference_id: designId,
        });
      }
    }
  };

  const toggleComments = async (designId: string) => {
    if (expandedComments === designId) {
      setExpandedComments(null);
      return;
    }
    setExpandedComments(designId);
    if (!comments[designId]) {
      setLoadingComments(true);
      const { data } = await supabase
        .from("look_comments")
        .select("*")
        .eq("look_id", designId)
        .eq("look_type", "design")
        .order("created_at", { ascending: true });

      if (data?.length) {
        const userIds = [...new Set(data.map(c => c.user_id))];
        const { data: profiles } = await supabase.from("profiles").select("user_id, display_name").in("user_id", userIds);
        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        setComments(prev => ({
          ...prev,
          [designId]: data.map(c => ({ ...c, profile: profileMap.get(c.user_id) })),
        }));
      } else {
        setComments(prev => ({ ...prev, [designId]: [] }));
      }
      setLoadingComments(false);
    }
  };

  const handleAddComment = async (designId: string) => {
    if (!user) { toast.error("Sign in to comment"); return; }
    if (!newComment.trim()) return;

    const { data, error } = await supabase.from("look_comments").insert({
      look_id: designId,
      look_type: "design",
      user_id: user.id,
      content: newComment.trim(),
    }).select("*").single();

    if (!error && data) {
      const { data: profile } = await supabase.from("profiles").select("user_id, display_name").eq("user_id", user.id).single();
      setComments(prev => ({
        ...prev,
        [designId]: [...(prev[designId] || []), { ...data, profile }],
      }));
      setDesigns(prev => prev.map(d => d.id === designId ? { ...d, commentCount: d.commentCount + 1 } : d));
      setNewComment("");
      toast.success("Comment added!");
    }
  };

  const handleGetRecommendations = async (design: CommunityDesign) => {
    if (!user) { toast.error("Sign in to get recommendations"); return; }
    setRecommendingId(design.id);
    try {
      const { data: styleProfile } = await supabase
        .from("style_profiles")
        .select("archetype, style_formula, preferences")
        .eq("user_id", user.id)
        .maybeSingle();

      const { data, error } = await supabase.functions.invoke("style-recommendations", {
        body: {
          designPrompt: design.prompt,
          garmentType: design.garment_type,
          archetype: styleProfile?.archetype,
          styleFormula: styleProfile?.style_formula,
          preferences: styleProfile?.preferences,
        },
      });
      if (error) throw error;
      setRecommendations(prev => ({ ...prev, [design.id]: data.recommendations }));
    } catch (err: any) {
      toast.error(err.message || "Failed to get recommendations");
    } finally {
      setRecommendingId(null);
    }
  };

  const filteredDesigns = searchQuery
    ? designs.filter(d =>
        d.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.garment_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.profile?.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : designs;

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl font-bold text-foreground">
            Community <span className="gold-text">Gallery</span>
          </h1>
          <p className="text-muted-foreground mt-1">Discover AI-generated fashion designs from the community</p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search designs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 bg-background/50"
            />
          </div>
          <Select value={garmentFilter} onValueChange={setGarmentFilter}>
            <SelectTrigger className="w-[160px] bg-background/50">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GARMENT_FILTERS.map(f => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v: "recent" | "popular") => setSortBy(v)}>
            <SelectTrigger className="w-[140px] bg-background/50">
              <TrendingUp className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Designs Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredDesigns.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="p-16 text-center">
              <Shirt className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No public designs yet</p>
              <p className="text-muted-foreground/60 text-sm mt-1">Be the first to share a design from the Fashion Designer!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDesigns.map((design, i) => (
              <motion.div
                key={design.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="glass-card overflow-hidden">
                  {/* Image */}
                  <div className="relative aspect-square">
                    <img src={design.image_url} alt={design.prompt} className="w-full h-full object-cover" />
                    <Badge className="absolute top-3 left-3 bg-black/60 text-white border-0">
                      <Shirt className="w-3 h-3 mr-1" /> {design.garment_type}
                    </Badge>
                  </div>

                  <CardContent className="p-4 space-y-3">
                    {/* Author */}
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full gold-gradient flex items-center justify-center text-primary-foreground text-xs font-semibold">
                        {(design.profile?.display_name || "U")[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {design.profile?.display_name || "Anonymous"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{timeAgo(design.created_at)}</p>
                      </div>
                    </div>

                    <p className="text-sm text-foreground/80 line-clamp-2">{design.prompt}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        onClick={() => handleLike(design.id)}
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Heart className={`w-4 h-4 ${design.isLiked ? "fill-red-500 text-red-500" : ""}`} />
                        {design.likeCount}
                      </button>
                      <button
                        onClick={() => toggleComments(design.id)}
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        {design.commentCount}
                        {expandedComments === design.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => handleGetRecommendations(design)}
                        disabled={recommendingId === design.id}
                        className="ml-auto flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                      >
                        {recommendingId === design.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                        AI Tips
                      </button>
                    </div>

                    {/* AI Recommendations */}
                    <AnimatePresence>
                      {recommendations[design.id] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="rounded-lg bg-primary/5 border border-primary/20 p-3"
                        >
                          <div className="flex items-center gap-1.5 mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                            <span className="text-xs font-medium text-primary">Style Recommendations</span>
                          </div>
                          <p className="text-xs text-foreground/80 whitespace-pre-line leading-relaxed">
                            {recommendations[design.id]}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Comments */}
                    <AnimatePresence>
                      {expandedComments === design.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 pt-2 border-t border-border"
                        >
                          {loadingComments ? (
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mx-auto" />
                          ) : (
                            <>
                              {(comments[design.id] || []).map(c => (
                                <div key={c.id} className="flex gap-2">
                                  <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-medium text-muted-foreground shrink-0 mt-0.5">
                                    {(c.profile?.display_name || "U")[0]?.toUpperCase()}
                                  </div>
                                  <div>
                                    <span className="text-xs font-medium text-foreground">{c.profile?.display_name || "User"}</span>
                                    <span className="text-[10px] text-muted-foreground ml-2">{timeAgo(c.created_at)}</span>
                                    <p className="text-xs text-foreground/70">{c.content}</p>
                                  </div>
                                </div>
                              ))}
                              {(comments[design.id] || []).length === 0 && (
                                <p className="text-xs text-muted-foreground text-center py-2">No comments yet</p>
                              )}
                              {user && (
                                <div className="flex gap-2 pt-1">
                                  <Input
                                    placeholder="Add a comment..."
                                    value={expandedComments === design.id ? newComment : ""}
                                    onChange={e => setNewComment(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handleAddComment(design.id)}
                                    className="text-xs h-8 bg-background/50"
                                  />
                                  <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => handleAddComment(design.id)}>
                                    <Send className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              )}
                            </>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
