import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Shirt, Wand2, ArrowRight, Heart, Sparkles, Palette, Scissors,
  ShoppingBag, ExternalLink, Check, Gift, Calendar, Briefcase, PartyPopper, Sun, ChevronRight,
  TrendingUp, Snowflake, Dumbbell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/ui/gradient-button";
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

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

function getScoreColor(score: number) {
  if (score >= 85) return { bg: "hsl(142 60% 45%)", text: "hsl(142 60% 95%)", border: "hsl(142 60% 45% / 0.3)" };
  if (score >= 70) return { bg: "hsl(43 74% 49%)", text: "hsl(43 74% 10%)", border: "hsl(43 74% 49% / 0.3)" };
  return { bg: "hsl(var(--muted))", text: "hsl(var(--muted-foreground))", border: "hsl(var(--border))" };
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
  const [activeOccasion, setActiveOccasion] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);

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

  const refreshData = useCallback(async () => {
    if (!user || refreshing) return;
    setRefreshing(true);
    try {
      const colorSeason = styleProfile.preferences?.aiAnalysis?.colorSeason || "Autumn";
      const [shopRes, outfitsRes] = await Promise.all([
        supabase.functions.invoke("shop-products", { body: { colorSeason, category: "all" } }),
        supabase.from("outfits").select("id, name, occasion").eq("user_id", user.id).order("created_at", { ascending: false }).limit(6),
      ]);
      if (shopRes.data?.products) setShopProducts(shopRes.data.products.slice(0, 6));
      if (outfitsRes.data) {
        const outfitsWithItems = await Promise.all(
          outfitsRes.data.map(async (outfit: any) => {
            const { data: oi } = await supabase.from("outfit_items").select("clothing_item_id").eq("outfit_id", outfit.id).limit(4);
            return { ...outfit, items: oi?.map((i: any) => i.clothing_item_id) || [] };
          })
        );
        setOutfitsList(outfitsWithItems);
      }
    } catch (e) {
      console.error("Refresh error:", e);
    } finally {
      setRefreshing(false);
      if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
    }
  }, [user, refreshing, styleProfile.preferences]);

  // Pull-to-refresh touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (scrollRef.current && scrollRef.current.scrollTop <= 0) {
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling.current) return;
    const diff = e.touches[0].clientY - touchStartY.current;
    if (diff > 0) {
      setPullDistance(Math.min(diff * 0.5, 80));
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (pullDistance > 60) {
      if (navigator.vibrate) navigator.vibrate(15);
      refreshData();
    }
    setPullDistance(0);
    isPulling.current = false;
  }, [pullDistance, refreshData]);

  const calibrationProgress = styleProfile.preferences?.calibrationProgress || 0;
  const hasCalibration = calibrationProgress > 0;
  const displayProgress = hasCalibration ? calibrationProgress : 73;

  const colorType = styleProfile.preferences?.aiAnalysis?.colorSeason || "—";
  const styleType = styleProfile.archetype || "—";
  const bodyType = styleProfile.preferences?.bodyShape || "—";

  const occasionTabs = [
    { label: "All", icon: <Sparkles className="w-4 h-4" />, color: "hsl(var(--primary))", value: null },
    { label: "Everyday", icon: <Sun className="w-4 h-4" />, color: "hsl(142, 60%, 45%)", value: "everyday" },
    { label: "Work", icon: <Briefcase className="w-4 h-4" />, color: "hsl(30, 80%, 55%)", value: "work" },
    { label: "Party", icon: <PartyPopper className="w-4 h-4" />, color: "hsl(270, 60%, 55%)", value: "party" },
  ];

  const filteredOutfits = activeOccasion
    ? outfitsList.filter((o) => o.occasion?.toLowerCase() === activeOccasion)
    : outfitsList;

  const chatPrompts = [
    { text: "Pieces that never go out of style", icon: <TrendingUp className="w-4 h-4 text-primary" /> },
    { text: "Main winter trends this season", icon: <Snowflake className="w-4 h-4 text-primary" /> },
    { text: "What sporty items are essential?", icon: <Dumbbell className="w-4 h-4 text-primary" /> },
  ];

  return (
    <AppLayout>
      <div
        ref={scrollRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative"
      >
        {/* Pull-to-refresh indicator */}
        <AnimatePresence>
          {(pullDistance > 0 || refreshing) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: refreshing ? 48 : pullDistance }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-center overflow-hidden"
            >
              <motion.div
                animate={refreshing ? { rotate: 360 } : { rotate: pullDistance * 3 }}
                transition={refreshing ? { duration: 0.8, repeat: Infinity, ease: "linear" } : { duration: 0 }}
                className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="p-5 lg:p-8 max-w-2xl mx-auto space-y-5"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
        {/* Header */}
        <motion.div variants={fadeUp} className="flex items-center justify-between">
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
          variants={fadeUp}
          className="rounded-2xl border border-border/60 overflow-hidden relative bg-card/60 backdrop-blur-xl"
        >
          {/* Shimmer sweep */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(105deg, transparent 40%, hsl(var(--primary) / 0.06) 50%, transparent 60%)" }}
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ duration: 2.5, delay: 0.8, ease: "easeInOut" }}
          />

          <div className="p-5 relative z-10">
            {/* Title row */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold text-foreground">My Style Formula</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/style-dna")}
                className="rounded-full text-xs px-4 h-8 border-border/60"
              >
                View <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>

            {/* 3-column style attributes */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button onClick={() => navigate("/color-type")} className="text-left group">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shadow-[0_0_8px_hsl(var(--primary)/0.15)]">
                    <Palette className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-[10px] font-sans text-muted-foreground">Color type</span>
                </div>
                <p className="font-sans font-bold text-foreground text-sm leading-tight">{colorType}</p>
              </button>
              <button onClick={() => navigate("/calibration")} className="text-left group">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors shadow-[0_0_8px_hsl(var(--destructive)/0.15)]">
                    <Scissors className="w-3.5 h-3.5 text-destructive" />
                  </div>
                  <span className="text-[10px] font-sans text-muted-foreground">Style Type</span>
                </div>
                <p className="font-sans font-bold text-foreground text-sm leading-tight">{styleType}</p>
              </button>
              <div className="text-left">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center shadow-[0_0_8px_hsl(var(--accent)/0.15)]">
                    <Shirt className="w-3.5 h-3.5 text-accent" />
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
              <h3 className="font-display text-lg font-bold text-foreground">
                Calibrate your Style Formula
              </h3>
              <p className="text-muted-foreground text-xs font-sans max-w-[280px] mx-auto">
                Like or dislike your Style Formula outfits to help the AI learn your style identity better
              </p>

              {/* Progress bar */}
              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1 h-9 rounded-full bg-secondary/80 overflow-hidden relative border border-border/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${displayProgress}%` }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
                    className="h-full rounded-full flex items-center justify-between px-3"
                    style={{
                      background: "linear-gradient(90deg, hsl(142, 60%, 48%), hsl(var(--primary)))",
                    }}
                  >
                    <Check className="w-4 h-4 text-primary-foreground" />
                    <span className="text-xs font-bold text-primary-foreground">{displayProgress}%</span>
                  </motion.div>
                </div>
                <div className="w-9 h-9 rounded-full bg-primary/10 border border-border/50 flex items-center justify-center flex-shrink-0">
                  <Gift className="w-4 h-4 text-primary" />
                </div>
              </div>

              {/* Start button — GradientButton with 3D press */}
              <GradientButton
                onClick={() => navigate("/calibration")}
                className="w-full rounded-full h-12 text-base"
              >
                Start <ArrowRight className="w-4 h-4 ml-2" />
              </GradientButton>
            </div>
          </div>
        </motion.div>

        {/* ── My Closet Outfits ─────────────────────────────── */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl font-bold text-foreground">All My Outfits</h2>
            <button
              onClick={() => navigate("/outfits")}
              className="text-sm text-muted-foreground font-sans hover:text-foreground transition-colors"
            >
              View all
            </button>
          </div>

          {/* Occasion tabs — functional filtering */}
          <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-none">
            {occasionTabs.map((tab) => {
              const isActive = activeOccasion === tab.value;
              return (
                <button
                  key={tab.label}
                  onClick={() => setActiveOccasion(tab.value)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all flex-shrink-0 ${
                    isActive
                      ? "bg-primary/10 border-primary/40 shadow-[0_0_12px_hsl(var(--primary)/0.1)]"
                      : "bg-card border-border hover:border-primary/20"
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${tab.color}20`, color: tab.color }}
                  >
                    {tab.icon}
                  </div>
                  <span className={`font-sans text-xs font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          {filteredOutfits.length === 0 && stats.outfits === 0 ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="h-40 bg-secondary flex items-center justify-center relative">
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
                <GradientButton onClick={() => navigate("/outfits")} className="rounded-full">
                  <Wand2 className="w-4 h-4 mr-2" /> Generate
                </GradientButton>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none snap-x snap-mandatory">
              {(filteredOutfits.length > 0 ? filteredOutfits : [{ id: "1", name: "Everyday", occasion: "everyday", items: [] }, { id: "2", name: "Work", occasion: "work", items: [] }, { id: "3", name: "Party", occasion: "party", items: [] }]).map((outfit, i) => {
                const outfitItemPhotos = outfit.items
                  .map((itemId: string) => closetItems.find((ci) => ci.id === itemId))
                  .filter(Boolean);
                return (
                  <motion.div
                    key={outfit.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.35 }}
                    className="min-w-[180px] rounded-2xl border border-border bg-card overflow-hidden flex-shrink-0 snap-start"
                  >
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
                          onClick={() => navigate("/closet")}
                          className="text-[10px] font-sans text-primary flex items-center gap-1"
                        >
                          <Sparkles className="w-2.5 h-2.5" /> Try it on
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* ── Shop Similar ──────────────────────────────────── */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-foreground" />
              <h2 className="font-display text-xl font-bold text-foreground">Shop Similar</h2>
            </div>
            <button onClick={() => navigate("/inspiration")} className="text-xs font-sans text-primary hover:underline">
              View All
            </button>
          </div>

          {shopLoading ? (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="min-w-[150px] h-48 rounded-2xl bg-secondary animate-pulse" />
              ))}
            </div>
          ) : shopProducts.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none snap-x snap-mandatory">
              {shopProducts.map((product, i) => {
                const sc = getScoreColor(product.matchScore);
                return (
                  <a
                    key={i}
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-[150px] max-w-[150px] flex-shrink-0 rounded-2xl border bg-card overflow-hidden hover:shadow-md transition-shadow snap-start"
                    style={{ borderColor: sc.border }}
                  >
                    <div className="relative h-32 bg-secondary flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center absolute inset-0 ${product.imageUrl ? 'hidden' : ''}`}>
                        <ShoppingBag className="w-8 h-8 text-muted-foreground/20" />
                      </div>
                      <div
                        className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: sc.bg, color: sc.text }}
                      >
                        {product.matchScore}%
                      </div>
                    </div>
                    <div className="p-2.5" style={{ borderTop: `2px solid ${sc.bg}` }}>
                      <p className="text-[10px] text-muted-foreground font-sans uppercase tracking-wide">{product.brand}</p>
                      <p className="text-xs font-sans font-medium text-foreground truncate">{product.name}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs font-bold text-foreground">{product.price}</span>
                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                      </div>
                    </div>
                  </a>
                );
              })}
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
        <motion.div variants={fadeUp} className="pb-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-3">Chat with AI Stylist</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none snap-x snap-mandatory">
            {chatPrompts.map((prompt) => (
              <button
                key={prompt.text}
                onClick={() => navigate(`/chat?prefill=${encodeURIComponent(prompt.text)}`)}
                className="min-w-[160px] p-4 rounded-2xl border border-border bg-card text-left hover:border-primary/30 transition-colors flex-shrink-0 snap-start relative overflow-hidden"
              >
                {/* Left accent border */}
                <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-gradient-to-b from-primary/60 to-primary/10" />
                <div className="pl-2 flex items-start gap-2.5">
                  <div className="mt-0.5 flex-shrink-0">{prompt.icon}</div>
                  <p className="font-sans text-sm text-foreground leading-snug">{prompt.text}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
