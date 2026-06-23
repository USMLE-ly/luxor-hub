import { useState, useEffect } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import {
  Upload, Star, Clock, Loader2, Sparkles, Trash2, Shirt,
  Instagram, Twitter, ExternalLink, Grid3X3, List, Search,
  ArrowUp
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

/* ------------------------------------------------------------------ */
/*  Framer variants                                                    */
/* ------------------------------------------------------------------ */
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */
function Footer() {
  return (
    <footer className="relative mt-16 mb-6">
      <div className="absolute inset-0 -top-6 h-px bg-gradient-to-r from-transparent via-border to-transparent backdrop-blur-sm" />
      <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <p className="text-xs text-muted-foreground/60">
          © 2026 LUXOR® — AI Fashion Style
        </p>
        <div className="flex items-center gap-4">
          {[
            { icon: Instagram, href: "#" },
            { icon: Twitter, href: "#" },
            { icon: ExternalLink, href: "#" },
          ].map(({ icon: Icon, href }, i) => (
            <motion.a
              key={i}
              href={href}
              whileHover={{ scale: 1.15, y: -2 }}
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <Icon className="w-4 h-4" />
            </motion.a>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */
export default function DressingRoom() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploadHover, setUploadHover] = useState(false);

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

  /* ----- Upload handler ----- */

  return (
    <AppLayout>
      <div className="p-4 md:p-8 mx-auto max-w-7xl space-y-8 overflow-x-hidden">

        {/* ---- HEADER ---- */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative">
          <div className="absolute -top-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-[60px]" />
          <h1 className="font-display text-4xl font-bold text-foreground relative">
            Your <span className="gold-text">Dressing Room</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Browse your analyzed outfits. Upload new ones or revisit past looks.
          </p>
        </motion.div>

        {/* ---- UPLOAD + SEARCH BAR ---- */}
        <div className="flex flex-col md:flex-row gap-6 items-stretch md:items-center justify-between">
          {/* Glowing Upload Button */}
          <div className="relative rounded-[1.5rem] border-[0.75px] border-border p-[3px]">
            <GlowingEffect spread={60} glow proximity={80} inactiveZone={0.01} borderWidth={3} />
            <motion.button
              onHoverStart={() => setUploadHover(true)}
              onHoverEnd={() => setUploadHover(false)}
              whileTap={{ scale: 0.95 }}
              onClick={handleUploadClick}
              className="relative flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500/20 via-orange-500/30 to-orange-500/20 border border-orange-500/30 text-orange-500 font-sans font-semibold text-base hover:from-orange-500/30 hover:to-orange-500/40 transition-all shadow-lg shadow-orange-500/10"
            >
              <motion.div
                animate={{ rotate: uploadHover ? 15 : 0, scale: uploadHover ? 1.15 : 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Upload className="w-6 h-6" />
              </motion.div>
              <span>Upload Outfit</span>
            </motion.button>
          </div>

          {/* Search + View Toggle */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                placeholder="Search outfits…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-muted/30 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>
            <div className="flex items-center gap-1 bg-muted/30 rounded-xl p-1 border border-border/50">
              <button
                onClick={() => setView("grid")}
                className={`p-2 rounded-lg transition-colors ${view === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-2 rounded-lg transition-colors ${view === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ---- CONTENT ---- */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-32 space-y-5"
          >
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Shirt className="w-12 h-12 text-primary/60" />
            </div>
            <h3 className="font-display text-2xl text-foreground">Your dressing room is empty</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Upload and analyze your first outfit to see it here. Each analysis saves automatically.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUploadClick}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl gold-gradient text-primary-foreground font-sans font-semibold shadow-lg"
            >
              <Sparkles className="w-5 h-5" /> Analyze Your First Outfit
            </motion.button>
          </motion.div>
        ) : view === "grid" ? (
          /* ======== GRID VIEW ======== */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filtered.map((item, idx) => (
                <motion.div
                  key={item.id}
                  variants={cardVariants}
                  layout
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  className="group"
                >
                  <div className="relative rounded-[1.5rem] border-[0.75px] border-border p-[3px] h-full">
                    <GlowingEffect spread={30} glow proximity={48} inactiveZone={0.01} borderWidth={2} />
                    <Card className="glass-card border-0 shadow-none h-full overflow-hidden">
                      <CardContent className="p-0 h-full flex flex-col">
                        {/* Thumbnail */}
                        <div className="relative aspect-[3/4] overflow-hidden bg-muted/30">
                          <img
                            src={item.image_url}
                            alt={item.overall_style || "Outfit"}
                            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl"
                            loading="lazy"
                          />
                          {/* Score badge */}
                          <div className="absolute top-3 right-3">
                            <Badge className={`${scoreColor(item.style_score)} bg-background/80 backdrop-blur-sm border-border/50 font-semibold text-xs px-2.5 py-1`}>
                              <Star className="w-3 h-3 mr-1 inline" />
                              {item.style_score}
                            </Badge>
                          </div>
                          {/* Time */}
                          <div className="absolute bottom-3 left-3">
                            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-[10px] text-muted-foreground">
                              <Clock className="w-3 h-3 mr-1 inline" />
                              {timeAgo(item.created_at)}
                            </Badge>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-4 flex-1 flex flex-col gap-3">
                          <p className="font-display text-base font-bold text-foreground truncate">
                            {item.overall_style || "Unnamed Outfit"}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2 flex-1 leading-relaxed">
                            {item.summary || "No analysis summary available."}
                          </p>
                          {/* Actions */}
                          <div className="flex items-center gap-2 pt-1">
                            <Button
                              size="sm"
                              whileTap={{ scale: 0.95 }}
                              className="flex-1 text-xs h-9 gold-gradient text-primary-foreground font-sans"
                              onClick={handleUploadClick}
                            >
                              <Sparkles className="w-3.5 h-3.5 mr-1" /> Re‑Analyze
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              whileTap={{ scale: 0.9 }}
                              className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(item.id)}
                              disabled={deleting === item.id}
                            >
                              {deleting === item.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
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
          /* ======== LIST VIEW ======== */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            <AnimatePresence>
              {filtered.map((item, idx) => (
                <motion.div
                  key={item.id}
                  variants={cardVariants}
                  layout
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Card className="glass-card border-border/50 overflow-hidden">
                    <CardContent className="p-4 flex items-center gap-5">
                      <div className="w-20 h-24 rounded-xl overflow-hidden bg-muted/30 flex-shrink-0 shadow-md">
                        <img src={item.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-display text-sm font-bold text-foreground truncate">
                            {item.overall_style || "Unnamed"}
                          </p>
                          <Badge className={`${scoreColor(item.style_score)} text-xs flex-shrink-0`}>
                            <Star className="w-3 h-3 mr-1 inline" />
                            {item.style_score}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-1">{item.summary}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1.5">
                          <Clock className="w-3 h-3 mr-1 inline" />
                          {timeAgo(item.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          whileTap={{ scale: 0.95 }}
                          className="text-xs h-9 gold-gradient text-primary-foreground font-sans"
                          onClick={handleUploadClick}
                        >
                          <Sparkles className="w-3.5 h-3.5 mr-1" /> Re‑Analyze
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          whileTap={{ scale: 0.9 }}
                          className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(item.id)}
                          disabled={deleting === item.id}
                        >
                          {deleting === item.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
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

        {/* ---- SCROLL TO TOP ---- */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-24 right-6 w-10 h-10 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 flex items-center justify-center text-primary hover:bg-primary/30 transition-colors z-40 shadow-lg"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>

        {/* ---- FOOTER ---- */}
        <Footer />
      </div>
    </AppLayout>
  );
}

/* ------------------------------------------------------------------ */
/*  Simple file input handler: opens picker, stores in sessionStorage  */
/* ------------------------------------------------------------------ */
function handleUploadClick() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = (e: any) => {
    const file = e.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        sessionStorage.setItem("pendingUpload", reader.result as string);
        window.location.href = "/analysis";
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
}
