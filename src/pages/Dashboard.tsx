import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Shirt, Wand2, ArrowRight, Heart, Sparkles, Palette, Scissors,
  ShoppingBag, ExternalLink, Check, Gift, Calendar, Briefcase, PartyPopper, Sun, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ShopProduct {
  name: string;
  brand: string;
  price: string;
  matchScore: number;
  category: string;
  url: string;
  imageUrl: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ items: 0, outfits: 0, styleScore: 0 });
  const [profile, setProfile] = useState<{ display_name: string | null }>({ display_name: null });
  const [styleProfile, setStyleProfile] = useState<{
    onboarding_completed: boolean | null;
    archetype: string | null;
    preferences: any;
  }>({ onboarding_completed: null, archetype: null, preferences: null });
  const [shopProducts, setShopProducts] = useState<ShopProduct[]>([]);
  const [shopLoading, setShopLoading] = useState(false);
  const [closetItems, setClosetItems] = useState<{ id: string; photo_url: string | null; name: string | null; category: string }[]>([]);
  const [outfitsList, setOutfitsList] = useState<{ id: string; name: string; occasion: string | null; items: string[] }[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [itemsRes, outfitsRes, profileRes, styleRes, closetRes, outfitsListRes] = await Promise.all([
        supabase.from("clothing_items").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("outfits").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("profiles").select("display_name").eq("user_id", user.id).single(),
        supabase.from("style_profiles").select("onboarding_completed, archetype, style_score, preferences").eq("user_id", user.id).single(),
        supabase.from("clothing_items").select("id, photo_url, name, category").eq("user_id", user.id).order("created_at", { ascending: false }).limit(12),
        supabase.from("outfits").select("id, name, occasion").eq("user_id", user.id).order("created_at", { ascending: false }).limit(6),
      ]);
      setStats({
        items: itemsRes.count || 0,
        outfits: outfitsRes.count || 0,
        styleScore: (styleRes.data as any)?.style_score || 0,
      });
      if (profileRes.data) setProfile(profileRes.data);
      if (styleRes.data) setStyleProfile(styleRes.data as any);
      if (closetRes.data) setClosetItems(closetRes.data);
      
      // Fetch outfit items for each outfit
      if (outfitsListRes.data && outfitsListRes.data.length > 0) {
        const outfitsWithItems = await Promise.all(
          outfitsListRes.data.map(async (outfit: any) => {
            const { data: oi } = await supabase
              .from("outfit_items")
              .select("clothing_item_id")
              .eq("outfit_id", outfit.id)
              .limit(4);
            return { ...outfit, items: oi?.map((i: any) => i.clothing_item_id) || [] };
          })
        );
        setOutfitsList(outfitsWithItems);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchShop = async () => {
      setShopLoading(true);
      try {
        const colorSeason = styleProfile.preferences?.aiAnalysis?.colorSeason || "Autumn";
        const { data } = await supabase.functions.invoke("shop-products", {
          body: { colorSeason, category: "all" },
        });
        if (data?.products) setShopProducts(data.products.slice(0, 6));
      } catch (e) {
        console.error("Shop fetch error:", e);
      } finally {
        setShopLoading(false);
      }
    };
    fetchShop();
  }, [user, styleProfile.preferences]);

  useEffect(() => {
    if (styleProfile.onboarding_completed === false && user) {
      navigate("/onboarding");
    }
  }, [styleProfile.onboarding_completed, user, navigate]);

  const calibrationProgress = styleProfile.preferences?.calibrationProgress || 0;
  const hasCalibration = calibrationProgress > 0;
  const displayProgress = hasCalibration ? calibrationProgress : 73;

  const colorType = styleProfile.preferences?.aiAnalysis?.colorSeason || "—";
  const styleType = styleProfile.archetype || "—";
  const bodyType = styleProfile.preferences?.bodyShape || "—";

  const occasionTabs = [
    { label: "Everyday", icon: <Sun className="w-5 h-5" />, color: "hsl(142, 60%, 45%)" },
    { label: "Weekend", icon: <Calendar className="w-5 h-5" />, color: "hsl(330, 60%, 55%)" },
    { label: "Work", icon: <Briefcase className="w-5 h-5" />, color: "hsl(30, 80%, 55%)" },
    { label: "Party", icon: <PartyPopper className="w-5 h-5" />, color: "hsl(270, 60%, 55%)" },
  ];

  return (
    <AppLayout>
      <div className="p-5 lg:p-8 max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="w-10 h-10">
            <Sparkles className="w-8 h-8 text-foreground" />
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-foreground" />
            </button>
            <button
              onClick={() => navigate("/settings")}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
            >
              <span className="text-sm font-bold text-foreground">
                {(profile.display_name || user?.email || "U")[0].toUpperCase()}
              </span>
            </button>
          </div>
        </motion.div>

        {/* ── My Style Formula Card ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border overflow-hidden"
          style={{ background: "linear-gradient(135deg, hsl(30 40% 95%), hsl(35 50% 92%))" }}
        >
          <div className="p-5">
            {/* Title row */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold text-foreground">My Style Formula</h2>
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate("/style-dna")}
                className="rounded-full bg-foreground text-background hover:bg-foreground/90 text-xs px-4 h-8"
              >
                View <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>

            {/* 3-column style attributes */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button onClick={() => navigate("/color-type")} className="text-left hover:opacity-80 transition-opacity">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-5 h-5 rounded-md bg-[hsl(45,80%,55%)]/20 flex items-center justify-center">
                    <Palette className="w-3 h-3 text-[hsl(45,80%,55%)]" />
                  </div>
                  <span className="text-[10px] font-sans text-muted-foreground">Color type</span>
                </div>
                <p className="font-sans font-bold text-foreground text-sm leading-tight">{colorType}</p>
              </button>
              <button onClick={() => navigate("/calibration")} className="text-left hover:opacity-80 transition-opacity">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-5 h-5 rounded-md bg-[hsl(0,70%,68%)]/20 flex items-center justify-center">
                    <Scissors className="w-3 h-3 text-[hsl(0,70%,68%)]" />
                  </div>
                  <span className="text-[10px] font-sans text-muted-foreground">Style Type</span>
                </div>
                <p className="font-sans font-bold text-foreground text-sm leading-tight">{styleType}</p>
              </button>
              <div className="text-left">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-5 h-5 rounded-md bg-[hsl(270,40%,65%)]/20 flex items-center justify-center">
                    <Shirt className="w-3 h-3 text-[hsl(270,40%,65%)]" />
                  </div>
                  <span className="text-[10px] font-sans text-muted-foreground">Body Type</span>
                </div>
                <p className="font-sans font-bold text-foreground text-sm leading-tight">{bodyType}</p>
              </div>
            </div>

            {/* Decorative divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-5" />

            {/* Calibration Section */}
            <div className="text-center space-y-3">
              {/* Animated Decorative orb */}
              <motion.div
                className="mx-auto w-28 h-28 rounded-full flex items-center justify-center relative"
                style={{ background: "radial-gradient(circle at 40% 35%, hsl(25 80% 65%), hsl(350 60% 50%), hsl(15 70% 40%))" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                {/* Glow pulse */}
                <motion.div
                  className="absolute inset-[-8px] rounded-full"
                  style={{ background: "radial-gradient(circle, hsl(25 80% 65% / 0.4), transparent 70%)" }}
                  animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="w-20 h-20 rounded-full border-2 border-white/20 flex items-center justify-center"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-8 h-8 text-white/80" />
                </motion.div>
              </motion.div>

              <h3 className="font-display text-lg font-bold text-foreground">
                Calibrate your Style Formula
              </h3>
              <p className="text-muted-foreground text-xs font-sans max-w-[280px] mx-auto">
                Like or dislike your Style Formula outfits to help the AI learn your style identity better
              </p>

              {/* Progress bar */}
              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1 h-9 rounded-full bg-background/80 overflow-hidden relative border border-border/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${displayProgress}%` }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
                    className="h-full rounded-full flex items-center justify-between px-3"
                    style={{
                      background: "linear-gradient(90deg, hsl(130,55%,48%), hsl(0,70%,62%))",
                    }}
                  >
                    <Check className="w-4 h-4 text-white" />
                    <span className="text-xs font-bold text-white">{displayProgress}%</span>
                  </motion.div>
                </div>
                <div className="w-9 h-9 rounded-full bg-[hsl(0,70%,68%)]/10 border border-border/50 flex items-center justify-center flex-shrink-0">
                  <Gift className="w-4 h-4 text-[hsl(0,70%,62%)]" />
                </div>
              </div>

              {/* Start button */}
              <Button
                onClick={() => navigate("/calibration")}
                className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90 font-sans font-semibold h-12 text-base"
              >
                Start <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* ── My Closet Outfits ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl font-bold text-foreground">All My Outfits</h2>
            <button
              onClick={() => navigate("/outfits")}
              className="text-sm text-muted-foreground font-sans hover:text-foreground transition-colors"
            >
              View all
            </button>
          </div>

          {/* Occasion tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-none">
            {occasionTabs.map((tab) => (
              <button
                key={tab.label}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors flex-shrink-0"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${tab.color}20`, color: tab.color }}>
                  {tab.icon}
                </div>
                <div className="text-left">
                  <span className="font-sans text-xs font-semibold text-foreground block">{tab.label}</span>
                  <span className="text-[9px] font-sans text-muted-foreground">
                    {stats.outfits} OUTFITS
                  </span>
                </div>
              </button>
            ))}
          </div>

          {outfitsList.length === 0 && stats.outfits === 0 ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="h-40 bg-secondary flex items-center justify-center relative">
                  {/* Show closet item thumbnails as preview */}
                  {closetItems.length > 0 ? (
                    <div className="grid grid-cols-2 gap-1 p-2 w-full h-full">
                      {closetItems.slice(0, 4).map((item) => (
                        <div key={item.id} className="rounded-lg overflow-hidden bg-background/50">
                          {item.photo_url ? (
                            <img src={item.photo_url} alt={item.name || ""} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Shirt className="w-5 h-5 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center">
                      <Shirt className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-[10px] text-muted-foreground font-sans px-4">
                        Add your items and AI stylist will mix and match them into Outfits
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card overflow-hidden flex items-center justify-center p-6">
                <Button onClick={() => navigate("/outfits")} size="sm" className="rounded-full gold-gradient text-primary-foreground">
                  <Wand2 className="w-4 h-4 mr-2" /> Generate
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
              {(outfitsList.length > 0 ? outfitsList : [{ id: "1", name: "Everyday", occasion: "everyday", items: [] }, { id: "2", name: "Work", occasion: "work", items: [] }, { id: "3", name: "Party", occasion: "party", items: [] }]).map((outfit) => {
                const outfitItemPhotos = outfit.items
                  .map((itemId: string) => closetItems.find((ci) => ci.id === itemId))
                  .filter(Boolean);
                return (
                  <div key={outfit.id} className="min-w-[180px] rounded-2xl border border-border bg-card overflow-hidden flex-shrink-0">
                    <div className="relative h-40 bg-secondary flex items-center justify-center">
                      {outfitItemPhotos.length > 0 ? (
                        <div className="grid grid-cols-2 gap-0.5 p-1 w-full h-full">
                          {outfitItemPhotos.slice(0, 4).map((item: any) => (
                            <div key={item.id} className="overflow-hidden">
                              {item.photo_url ? (
                                <img src={item.photo_url} alt={item.name || ""} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-background/30">
                                  <Shirt className="w-4 h-4 text-muted-foreground/30" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Shirt className="w-12 h-12 text-muted-foreground/30" />
                      )}
                    </div>
                    <div className="p-3">
                      <span className="font-sans text-sm font-medium text-foreground">{outfit.name}</span>
                      <div className="flex gap-3 mt-2">
                        <button className="text-[10px] font-sans text-muted-foreground flex items-center gap-1">
                          View items <ChevronRight className="w-2.5 h-2.5" />
                        </button>
                        <button
                          onClick={() => navigate("/mannequin")}
                          className="text-[10px] font-sans text-primary flex items-center gap-1"
                        >
                          <Sparkles className="w-2.5 h-2.5" /> Try it on
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* ── Shop Similar ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-foreground" />
              <h2 className="font-display text-xl font-bold text-foreground">Shop Similar</h2>
            </div>
            <span className="text-[10px] font-sans text-muted-foreground bg-secondary px-2 py-1 rounded-full">
              AI Picks
            </span>
          </div>

          {shopLoading ? (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="min-w-[150px] h-48 rounded-2xl bg-secondary animate-pulse" />
              ))}
            </div>
          ) : shopProducts.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
              {shopProducts.map((product, i) => (
                <a
                  key={i}
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-[150px] max-w-[150px] flex-shrink-0 rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative h-32 bg-secondary flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-muted-foreground/30" />
                    <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {product.matchScore}%
                    </div>
                  </div>
                  <div className="p-2.5">
                    <p className="text-[10px] text-muted-foreground font-sans uppercase tracking-wide">{product.brand}</p>
                    <p className="text-xs font-sans font-medium text-foreground truncate">{product.name}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs font-bold text-foreground">{product.price}</span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-6 text-center">
              <ShoppingBag className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground font-sans text-xs">
                Analyze an outfit to get personalized shop recommendations
              </p>
              <Button onClick={() => navigate("/outfit-analysis")} size="sm" className="mt-3 rounded-full text-xs">
                Analyze Outfit
              </Button>
            </div>
          )}
        </motion.div>

        {/* ── Chat with AI Stylist ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pb-8"
        >
          <h2 className="font-display text-xl font-bold text-foreground mb-3">Chat with AI Stylist</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
            {[
              "Pieces that never go out of style",
              "Main winter trends this season",
              "What sporty items are essential?",
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => navigate("/chat")}
                className="min-w-[160px] p-4 rounded-2xl border border-border bg-card text-left hover:border-primary/30 transition-colors flex-shrink-0"
              >
                <p className="font-sans text-sm text-foreground leading-snug">{prompt}</p>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
