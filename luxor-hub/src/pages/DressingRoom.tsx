import { useState, useEffect } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ImageSwiper } from "@/components/ui/image-swiper";
import { FashionHero } from "@/components/ui/hero-fashion";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import {
  Upload, Star, Clock, Loader2, Sparkles, Trash2, Shirt,
  Instagram, Twitter, ExternalLink, Grid3X3, List, Search,
  ArrowUp, X, ShoppingBag, Sun, Cloud, Palette
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

const WEATHERS = [
  { id: "hot", label: "Hot", emoji: "☀️" },
  { id: "mild", label: "Mild", emoji: "🌤" },
  { id: "cold", label: "Cold", emoji: "❄️" },
];

const PALETTES = [
  { id: "neutrals", label: "Neutrals", emoji: "🤎" },
  { id: "brights", label: "Brights", emoji: "🌈" },
  { id: "pastels", label: "Pastels", emoji: "🌸" },
  { id: "dark", label: "Dark", emoji: "🖤" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function DressingRoomPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploadHover, setUploadHover] = useState(false);

  // Outfit generation state
  const [showOutfitModal, setShowOutfitModal] = useState(false);
  const [outfitGenerating, setOutfitGenerating] = useState(false);
  const [generatedOutfits, setGeneratedOutfits] = useState<OutfitOption[]>([]);
  const [selectedOutfit, setSelectedOutfit] = useState<OutfitOption | null>(null);

  // 3-step quiz state
  const [step, setStep] = useState(0);
  const [selectedOccasion, setSelectedOccasion] = useState("");
  const [selectedWeather, setSelectedWeather] = useState("");
  const [selectedPalette, setSelectedPalette] = useState("");

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

  // Auto-select first outfit when generated
  useEffect(() => {
    if (generatedOutfits.length > 0 && !selectedOutfit) {
      setSelectedOutfit(generatedOutfits[0]);
    }
  }, [generatedOutfits]);

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

  /* ---------- Generate Outfit (new) ---------- */
  const openGenerateModal = () => {
    setStep(0);
    setSelectedOccasion("");
    setSelectedWeather("");
    setSelectedPalette("");
    setShowOutfitModal(true);
  };

  const handleStepNext = () => {
    if (step === 0 && !selectedOccasion) { toast.error("Pick an occasion"); return; }
    if (step === 1 && !selectedWeather) { toast.error("Pick a weather"); return; }
    if (step === 2 && !selectedPalette) { toast.error("Pick a color palette"); return; }
    if (step < 2) {
      setStep(step + 1);
    } else {
      generateOutfit();
    }
  };

  const generateOutfit = async () => {
    setShowOutfitModal(false);
    setOutfitGenerating(true);
    setGeneratedOutfits([]);

    try {
      // Fetch user profile from onboarding data
      let userProfile = {};
      if (user) {
        const { data: profile } = await supabase
          .from("style_profiles")
          .select("preferences")
          .eq("user_id", user.id)
          .single();
        if (profile?.preferences) {
          userProfile = {
            bodyType: profile.preferences.bodyShape || "Average",
            height: profile.preferences.height || "Average",
            budget: profile.preferences.budget || "Mid-range",
            lifestyle: profile.preferences.lifestyle || "Casual",
            profession: profile.preferences.profession || "Professional",
            styleGoal: profile.preferences.styleGoal || "Confident",
            brands: Array.isArray(profile.preferences.brands) ? profile.preferences.brands.join(", ") : (profile.preferences.brands || "Any"),
            styleMood: profile.preferences.styleMood || "",
            ageRange: profile.preferences.ageRange || "",
          };
        }
      }
      
      const api = "https://nice-useful-plot--al-bosify.replit.app";
      const genResp = await fetch(api + "/api/v1/dressing-room/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion: selectedOccasion,
          weather: selectedWeather,
          color_palette: selectedPalette,
          user_profile: userProfile,
        }),
      });
      if (!genResp.ok) throw new Error("Generation failed");
      const data: OutfitResponse = await genResp.json();
      if (data.success && data.outfit_options && data.outfit_options.length > 0) {
        setGeneratedOutfits(data.outfit_options);
        toast.success("Outfits generated!");
      } else {
        toast.error(data.error || "Could not generate outfits");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to generate outfits");
    } finally {
      setOutfitGenerating(false);
    }
  };

  /* ---------- Upload handler ---------- */
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
          window.location.href = "/outfit-analysis";
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  /* ---------- Render ---------- */
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
            Browse your analyzed outfits. Generate new combinations from your closet.
          </p>
        </motion.div>

        {/* ---- UPLOAD + SEARCH BAR ---- */}
        <div className="flex flex-col md:flex-row gap-6 items-stretch md:items-center justify-between">
          {/* Upload Button */}
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
              Upload New Outfit
            </motion.button>
          </div>

          {/* Generate Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={openGenerateModal}
            className="flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500/20 via-purple-500/30 to-purple-500/20 border border-purple-500/30 text-purple-500 font-sans font-semibold text-base hover:from-purple-500/30 hover:to-purple-500/40 transition-all shadow-lg shadow-purple-500/10"
          >
            <Sparkles className="w-6 h-6" />
            Generate Outfit
          </motion.button>

          {/* Search + View Toggle */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search looks..."
                className="pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
            <div className="flex bg-muted/30 rounded-xl p-1 border border-border/30">
              <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-muted/60 shadow-sm" : ""}`}>
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-muted/60 shadow-sm" : ""}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ---- GALLERY / EMPTY STATE ---- */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32 space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-muted/40 flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-muted-foreground/60" />
            </div>
            <h3 className="font-display text-2xl text-foreground">Your dressing room is empty</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Upload your first outfit photo to get personalized style analysis and AI recommendations.
            </p>
          </motion.div>
        ) : viewMode === "grid" ? (
          /* ---- GRID VIEW ---- */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {filtered.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="group relative rounded-2xl overflow-hidden border border-border/50 bg-muted/10 hover:border-primary/30 transition-all duration-300"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img src={item.image_url} alt={item.overall_style} loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-sm font-semibold truncate">{item.overall_style || "Unstyled"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-bold ${scoreColor(item.style_score)}`}>{item.style_score}</span>
                    <span className="text-white/60 text-xs">{timeAgo(item.created_at)}</span>
                  </div>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleDelete(item.id)} disabled={deleting === item.id}
                    className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center hover:bg-red-500/80 transition-colors">
                    {deleting === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-white" />}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* ---- LIST VIEW ---- */
          <div className="space-y-3">
            {filtered.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/10 border border-border/30 hover:border-primary/20 transition-all">
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{item.overall_style || "Unstyled"}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.summary}</p>
                </div>
                <span className={`text-xs font-bold ${scoreColor(item.style_score)}`}>{item.style_score}</span>
                <span className="text-xs text-muted-foreground">{timeAgo(item.created_at)}</span>
                <button onClick={() => handleDelete(item.id)} disabled={deleting === item.id}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
                  {deleting === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-red-400" />}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ---- GENERATE OUTFIT MODAL (3-step Quiz) ---- */}
        <AnimatePresence>
          {showOutfitModal && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => setShowOutfitModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-900/80 backdrop-blur-2xl p-8"
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={() => setShowOutfitModal(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>

                {/* Step Indicator */}
                <div className="flex items-center gap-2 mb-8">
                  {[0, 1, 2].map((s) => (
                    <div key={s} className={`flex-1 h-1 rounded-full transition-all ${s <= step ? "bg-primary" : "bg-white/10"}`} />
                  ))}
                </div>

                {step === 0 && (
                  <div className="space-y-6">
                    <h2 className="font-display text-2xl font-bold">What's the occasion?</h2>
                    <div className="grid grid-cols-2 gap-3">
                      {OCCASIONS.map((o) => (
                        <button key={o.id} onClick={() => setSelectedOccasion(o.id)}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            selectedOccasion === o.id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-white/10 bg-white/5 hover:bg-white/10"
                          }`}>
                          <span className="text-2xl">{o.emoji}</span>
                          <p className="text-sm font-semibold mt-1">{o.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6">
                    <h2 className="font-display text-2xl font-bold">What's the weather?</h2>
                    <div className="grid grid-cols-3 gap-3">
                      {WEATHERS.map((w) => (
                        <button key={w.id} onClick={() => setSelectedWeather(w.id)}
                          className={`p-4 rounded-xl border text-center transition-all ${
                            selectedWeather === w.id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-white/10 bg-white/5 hover:bg-white/10"
                          }`}>
                          <span className="text-2xl">{w.emoji}</span>
                          <p className="text-sm font-semibold mt-1">{w.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <h2 className="font-display text-2xl font-bold">Color palette?</h2>
                    <div className="grid grid-cols-2 gap-3">
                      {PALETTES.map((p) => (
                        <button key={p.id} onClick={() => setSelectedPalette(p.id)}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            selectedPalette === p.id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-white/10 bg-white/5 hover:bg-white/10"
                          }`}>
                          <span className="text-2xl">{p.emoji}</span>
                          <p className="text-sm font-semibold mt-1">{p.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={handleStepNext}
                  className="w-full mt-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
                  {step < 2 ? "Next" : "✨ Generate Outfits"}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---- GENERATED OUTFITS (Collage Cards) ---- */}
        {outfitGenerating && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">AI is styling your outfits...</p>
            </div>
          </div>
        )}

        <AnimatePresence>
          {generatedOutfits.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  Your AI Styled Outfits
                </h2>
                <button onClick={() => setGeneratedOutfits([])}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Dismiss
                </button>
              </div>

              {/* 2-column grid for collage cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Swipeable image deck */}
              <div className="flex justify-center">
                <ImageSwiper
                  images={generatedOutfits.map(o => o.items.map(i => i.image_url).join(',')).join(',')}
                  cardWidth={300}
                  cardHeight={420}
                />
              </div>
              
              {/* Selected outfit details via FashionHero */}
              {selectedOutfit && (
                <div className="mt-8">
                  <FashionHero
                    styleName={selectedOutfit.outfit_name || "Your Style"}
                    styleScore={null}
                    strengths={[selectedOutfit.reason || ""]}
                    itemsDetected={selectedOutfit.items?.map((i: any) => i.label || i.type || "") || []}
                    actualColors={[]}
                    audit={selectedOutfit.reason || ""}
                    tweakPlan=""
                    imageUrl={selectedOutfit.items?.[0]?.image_url || ""}
                    vibeType=""
                  />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {generatedOutfits.map((option, idx) => (
                  <div key={idx}
                    className="relative bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 overflow-hidden"
                  >
                    {/* Outfit name badge */}
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white z-40">
                      {option.outfit_name}
                    </div>

                    {/* Collage container */}
                    <div className="relative h-80 w-full mt-8">
                      {/* Stack items with flat-lay positioning */}
                      {option.items.map((item, itemIdx) => {
                        const isTop = item.type === "top" || item.type === "dress" || itemIdx === 0;
                        const isBottom = item.type === "bottom" || item.type === "jeans" || itemIdx === 1;
                        const isShoes = item.type === "shoes" || item.type === "footwear" || itemIdx === 2;
                        let positionClass = "";
                        if (isBottom) {
                          positionClass = "z-10 bottom-0 left-0 w-full rounded-xl shadow-lg -rotate-2 translate-y-10";
                        } else if (isShoes) {
                          positionClass = "z-30 bottom-0 right-0 w-1/3 rounded-xl shadow-xl rotate-12 translate-x-4 translate-y-4";
                        } else {
                          positionClass = "z-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2/3 rounded-xl shadow-lg rotate-2";
                        }
                        return (
                          <div key={item.id}
                            className={`absolute ${positionClass} transition-all duration-300 hover:scale-105 hover:z-40`}
                          >
                            <img
                              src={item.image_url}
                              alt={item.label || item.type}
                              className="w-full h-full object-cover rounded-xl border border-white/10"
                              style={{ maxHeight: isShoes ? "80px" : "160px" }}
                            />
                            <div className="absolute bottom-1 left-1 right-1 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-0.5 text-xs text-white truncate">
                              {item.label || item.type} · {item.color}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Reason */}
                    {option.reason && (
                      <p className="text-xs text-muted-foreground mt-4 italic leading-relaxed">
                        "{option.reason}"
                      </p>
                    )}

                    {/* Wear button */}
                    <button
                      onClick={() => toast.success(`Wearing ${option.outfit_name}!`)}
                      className="w-full mt-4 py-2.5 rounded-xl bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-all text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      {idx === 0 ? "👕" : "👗"} Wear {option.outfit_name}
                    </button>
                  </div>
                ))}
              </div>
              </div>

              {/* Try again button */}
              <div className="text-center">
                <button onClick={openGenerateModal}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-sm">
                  <Sparkles className="w-4 h-4" />
                  Try Different Options
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
      </div>
    </AppLayout>
  );
}
