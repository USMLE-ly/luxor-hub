import { useState, useEffect } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Shirt, Star, Clock, Search, Loader2, Sparkles,
  Grid3X3, List, Trash2, ExternalLink
} from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

interface DressingRoomItem {
  id: string;
  image_url: string;
  overall_style: string;
  style_score: number;
  summary: string;
  created_at: string;
}

export default function DressingRoom() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<DressingRoomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchItems = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("outfit_analyses")
        .select("id, image_url, overall_style, style_score, summary, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (err: any) {
      console.error("Failed to fetch dressing room items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [user]);

  const filteredItems = items.filter((item) =>
    !searchQuery ||
    item.overall_style?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase.from("outfit_analyses").delete().eq("id", id);
      if (error) throw error;
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Outfit removed from dressing room");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-400";
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 overflow-x-hidden">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="absolute -top-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-[60px]" />
          <h1 className="font-display text-4xl font-bold text-foreground relative">
            Your <span className="gold-text">Dressing Room</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Browse your analyzed outfits. Upload a new one or revisit past looks.
          </p>
        </motion.div>

        {/* Upload Button & Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative rounded-[1.25rem] border-[0.75px] border-border p-[3px] flex-1 max-w-md">
            <GlowingEffect
              spread={30}
              glow={true}
              disabled={false}
              proximity={48}
              inactiveZone={0.01}
              borderWidth={2}
            />
            <div className="relative flex items-center bg-card rounded-xl">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3" />
              <Input
                placeholder="Search outfits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-primary/10 text-primary" : ""}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-primary/10 text-primary" : ""}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => navigate("/outfit-analysis")}
              className="gold-gradient text-primary-foreground font-sans"
            >
              <Upload className="w-4 h-4 mr-2" /> Upload New Outfit
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 space-y-4"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Shirt className="w-10 h-10 text-primary/60" />
            </div>
            <h3 className="font-display text-xl text-foreground">Your dressing room is empty</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Upload and analyze your first outfit to see it here. Each analysis saves automatically.
            </p>
            <Button
              onClick={() => navigate("/outfit-analysis")}
              className="gold-gradient text-primary-foreground font-sans mt-2"
            >
              <Sparkles className="w-4 h-4 mr-2" /> Analyze Your First Outfit
            </Button>
          </motion.div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            <AnimatePresence>
              {filteredItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.03 }}
                  layout
                >
                  <div className="relative rounded-[1.25rem] border-[0.75px] border-border p-[3px] h-full">
                    <GlowingEffect
                      spread={25}
                      glow={true}
                      disabled={false}
                      proximity={40}
                      inactiveZone={0.01}
                      borderWidth={2}
                    />
                    <Card className="glass-card overflow-hidden border-0 shadow-none h-full">
                      <CardContent className="p-0 h-full flex flex-col">
                        {/* Thumbnail */}
                        <div className="relative aspect-[3/4] overflow-hidden bg-muted/30">
                          <img
                            src={item.image_url}
                            alt={item.overall_style || "Outfit"}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            loading="lazy"
                          />
                          {/* Score Badge */}
                          <div className="absolute top-2 right-2">
                            <Badge className={`${getScoreColor(item.style_score)} bg-background/80 backdrop-blur-sm border-border/50 font-semibold text-xs`}>
                              <Star className="w-3 h-3 mr-1 inline" />
                              {item.style_score}
                            </Badge>
                          </div>
                          {/* Time */}
                          <div className="absolute bottom-2 left-2">
                            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-[10px] text-muted-foreground">
                              <Clock className="w-3 h-3 mr-1 inline" />
                              {timeAgo(item.created_at)}
                            </Badge>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-3 flex-1 flex flex-col gap-2">
                          <p className="font-display text-sm font-semibold text-foreground truncate">
                            {item.overall_style || "Unnamed Outfit"}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
                            {item.summary || "No analysis summary available."}
                          </p>
                          {/* Actions */}
                          <div className="flex items-center gap-2 pt-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 text-xs h-8 border-primary/30 hover:bg-primary/10"
                              onClick={() => navigate("/outfit-analysis")}
                            >
                              <Sparkles className="w-3 h-3 mr-1" /> Style
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 text-xs h-8 border-primary/30 hover:bg-primary/10"
                              onClick={() => {
                                // Navigate to outfit analysis with this image pre-loaded
                                navigate(`/outfit-analysis?image=${encodeURIComponent(item.image_url)}`);
                              }}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" /> Try On
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDelete(item.id)}
                              disabled={deletingId === item.id}
                            >
                              {deletingId === item.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* List View */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <AnimatePresence>
              {filteredItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  layout
                >
                  <Card className="glass-card overflow-hidden border-border/50">
                    <CardContent className="p-3 flex items-center gap-4">
                      <div className="w-16 h-20 rounded-lg overflow-hidden bg-muted/30 flex-shrink-0">
                        <img
                          src={item.image_url}
                          alt={item.overall_style || "Outfit"}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-display text-sm font-semibold text-foreground truncate">
                            {item.overall_style || "Unnamed Outfit"}
                          </p>
                          <Badge className={`${getScoreColor(item.style_score)} text-xs flex-shrink-0`}>
                            <Star className="w-3 h-3 mr-1 inline" />
                            {item.style_score}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {item.summary || "No summary"}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                          <Clock className="w-3 h-3 mr-1 inline" />
                          {timeAgo(item.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-8 border-primary/30 hover:bg-primary/10"
                          onClick={() => navigate("/outfit-analysis")}
                        >
                          <Sparkles className="w-3 h-3 mr-1" /> Style
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-8 border-primary/30 hover:bg-primary/10"
                          onClick={() => navigate(`/outfit-analysis?image=${encodeURIComponent(item.image_url)}`)}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" /> Try On
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                        >
                          {deletingId === item.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
