import { useState, useEffect } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ProgressBar } from "@/components/ui/progress-bar";
import FlipGallery from "@/components/ui/flip-gallery";

import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import {
  Upload, Star, Clock, Loader2, Sparkles, Trash2, Shirt,
  Instagram, Twitter, ExternalLink, Grid3X3, List, Search,
  ArrowUp, X, ShoppingBag
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface GalleryItem {
  id: string;
  image_url: string;
  overall_style: string;
  style_score: number;
  summary: string;
  created_at: string;
}

interface ClosetItem {
  id: string;
  label: string;
  type: string;
  color: string;
  image_url: string;
}

interface OutfitOption {
  outfit_name: string;
  reason: string;
  items: ClosetItem[];
  source?: string;
}

interface OutfitResponse {
  success: boolean;
  outfit_options: OutfitOption[];
  error?: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const OCCASIONS = [
  { id: "casual", label: "Casual", emoji: "👕" },
  { id: "business", label: "Business", emoji: "💼" },
  { id: "party", label: "Party", emoji: "🎉" },
  { id: "date-night", label: "Date Night", emoji: "🌹" },
  { id: "sport", label: "Sport", emoji: "🏃" },
];

const OUTFIT_COUNT = 3;

export default function DressingRoomPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleting, setDeleting] = useState<string | null>(null);

  // FlipGallery generated images
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [progressStage, setProgressStage] = useState("");

  // Occasion modal
  const [showOccasionModal, setShowOccasionModal] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState("");

  /* ---------- Fetch gallery items ---------- */
  const fetchItems = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("outfit_analyses")
      .select("id,image_url,overall_style,style_score,summary,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, [user]);

  const filtered = items.filter(
    (i) =>
      !search ||
      i.overall_style?.toLowerCase().includes(search.toLowerCase()) ||
      i.summary?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await supabase.from("outfit_analyses").delete().eq("id", id);
    setItems((p) => p.filter((x) => x.id !== id));
    toast.success("Removed from dressing room");
    setDeleting(null);
  };

  const timeAgo = (d: string) => {
    const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    return m < 60 ? `${m}m ago` : `${Math.floor(m / 60)}h ago`;
  };

  const scoreColor = (s: number) =>
    s >= 80 ? "text-green-500" : s >= 60 ? "text-yellow-500" : "text-red-400";

  /* ---------- Generate Outfit (context-preserving) ---------- */
  const generateOutfits = async (occasion: string, count: number) => {
    if (!user) return;
    setIsGenerating(true);
    setProgressValue(10);
    setProgressStage("Scanning your closet...");
    try {
      const apiBase =
        import.meta.env.VITE_API_URL ||
        import.meta.env.VITE_PUBLIC_API_URL ||
        (window.location.hostname === "localhost" ? "http://localhost:5000" : "");

      // Fetch closet items
      const { data: closetData } = await supabase
        .from("clothing_items")
        .select("id, name, category, color, style, season, photo_url")
        .eq("user_id", user.id);

      const closetItems = (closetData || []).map((c) => ({
        id: c.id,
        name: c.name || "Unnamed",
        category: c.category || "other",
        color: c.color || "unknown",
        style: c.style || "casual",
        season: c.season || "all-season",
        photo_url: c.photo_url || "",
      }));

      setProgressValue(30);
      setProgressStage(`Consulting MiMo for ${occasion} outfits...`);

      // Call edge function
      const { data: functionData, error } = await supabase.functions.invoke("generate-outfits", {
        body: {
          closetItems,
          occasion,
          mood: "confident",
          count: Math.min(count || OUTFIT_COUNT, 7),
        },
      });

      if (error) throw new Error(error.message);

      setProgressValue(70);
      setProgressStage("Assembling your looks...");

      if (functionData?.outfits?.length > 0) {
        // Map outfit images from analysis gallery
        const images = functionData.outfits
          .map((o: any) => {
            // Try to find matching items in gallery
            const matched = items.find((g) =>
              o.name?.toLowerCase().includes(g.overall_style?.toLowerCase())
            );
            return matched?.image_url || null;
          })
          .filter(Boolean);

        if (images.length > 0) {
          setGeneratedImages(images);
        } else {
          // Fallback: use saved analysis images
          setGeneratedImages(items.slice(0, OUTFIT_COUNT).map((i) => i.image_url));
        }

        toast.success(`${functionData.outfits.length} outfits generated!`);
      } else {
        // Fallback: show recent analyses
        const fallbackImages = items.slice(0, OUTFIT_COUNT).map((i) => i.image_url);
        if (fallbackImages.length > 0) {
          setGeneratedImages(fallbackImages);
          toast.success("Showing recent analyses");
        } else {
          toast.error("No outfits could be generated. Upload some clothes first!");
        }
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to generate outfits");
    } finally {
      setIsGenerating(false);
      setProgressValue(100);
    }
  };

  const handleGenerateClick = () => {
    setSelectedOccasion("");
    setShowOccasionModal(true);
  };

  const handleOccasionSelect = (occasionId: string) => {
    setSelectedOccasion(occasionId);
    setShowOccasionModal(false);
    generateOutfits(occasionId, OUTFIT_COUNT);
  };

  const handleDismiss = () => {
    setGeneratedImages([]);
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8 mx-auto max-w-7xl space-y-8 overflow-x-hidden">

        {/* ---- HEADER ---- */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="absolute -top-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-[60px]" />
          <h1 className="font-display text-4xl font-bold text-foreground">Your Dressing Room</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Browse your analyzed outfits. Generate new combinations from your closet.
          </p>
        </motion.div>

        {/* ---- FLIP GALLERY ---- */}
        <div className="flex justify-center items-start pt-4">
          <FlipGallery
            images={generatedImages}
            onGenerate={handleGenerateClick}
            onDismiss={handleDismiss}
            isLoading={isGenerating}
          />
        </div>

        {/* ---- Progress indicator ---- */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-sm mx-auto"
            >
              <ProgressBar value={progressValue} stage={progressStage} variant="purple" animated />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---- Analysis History (collapsed when showing FlipGallery) ---- */}
        {generatedImages.length === 0 && (
          <>
            {/* Search & View Toggle */}
            {items.length > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search saved analyses..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Gallery Grid/List */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filtered.length > 0 ? (
              <div className={viewMode === "grid"
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                : "space-y-3"
              }>
                {filtered.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={viewMode === "grid"
                      ? "relative group rounded-xl overflow-hidden border border-border/50 bg-card hover:shadow-lg transition-all"
                      : "relative flex items-center gap-4 p-3 rounded-xl border border-border/50 bg-card hover:shadow-lg transition-all"
                    }
                  >
                    {viewMode === "grid" ? (
                      <>
                        <div className="aspect-[3/4]">
                          <img src={item.image_url} alt={item.overall_style} className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                          <p className="text-sm font-semibold text-white truncate">{item.overall_style}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs font-bold ${scoreColor(item.style_score)}`}>{item.style_score}/100</span>
                            <span className="text-[10px] text-white/50">{timeAgo(item.created_at)}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                        >
                          {deleting === item.id ? <Loader2 className="w-3 h-3 animate-spin text-white" /> : <Trash2 className="w-3 h-3 text-white" />}
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={item.image_url} alt={item.overall_style} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{item.overall_style}</p>
                          <p className="text-xs text-muted-foreground truncate">{item.summary}</p>
                        </div>
                        <span className={`text-xs font-bold ${scoreColor(item.style_score)}`}>{item.style_score}/100</span>
                        <span className="text-[10px] text-muted-foreground">{timeAgo(item.created_at)}</span>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors"
                        >
                          {deleting === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        </button>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Shirt className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" />
                <h3 className="font-display text-xl text-foreground mb-2">Your dressing room is empty</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                  Head over to the Analysis page to scan an outfit, or generate a new combination from your closet.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button onClick={() => navigate("/outfit-analysis")} variant="default" className="gap-2">
                    <Upload className="w-4 h-4" /> Analyze an Outfit
                  </Button>
                  <Button onClick={handleGenerateClick} variant="outline" className="gap-2">
                    <Sparkles className="w-4 h-4" /> Generate from Closet
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ---- Occasion Modal ---- */}
        <AnimatePresence>
          {showOccasionModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setShowOccasionModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-zinc-900/95 border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-white mb-4">Pick an Occasion</h3>
                <div className="grid grid-cols-2 gap-3">
                  {OCCASIONS.map((occ) => (
                    <button
                      key={occ.id}
                      onClick={() => handleOccasionSelect(occ.id)}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all"
                    >
                      <span className="text-2xl">{occ.emoji}</span>
                      <span className="text-sm text-white/80">{occ.label}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowOccasionModal(false)}
                  className="w-full mt-4 py-2 text-sm text-white/50 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
