import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Shirt, Wand2, ArrowRight, Heart, Sparkles, Palette, Scissors,
  ShoppingBag, ExternalLink, Check, Gift, Calendar, Briefcase, PartyPopper, Sun, ChevronRight,
  TrendingUp, Snowflake, Dumbbell, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/ui/gradient-button";
import { useNavigate } from "react-router-dom";
import { WeeklyCapsuleWidget } from "@/components/app/WeeklyCapsuleWidget";
import { TrendIntelligenceWidget } from "@/components/app/TrendIntelligenceWidget";
import { MorningRoutineCard } from "@/components/app/MorningRoutineCard";
import { EveningReflection } from "@/components/app/EveningReflection";
import { StylePointsWidget } from "@/components/app/StylePointsWidget";
import { WeatherOutfitCard } from "@/components/app/WeatherOutfitCard";

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

function TrendingDesigns({ navigate }: { navigate: (path: string) => void }) {
  const [designs, setDesigns] = useState<{ id: string; image_url: string; prompt: string; garment_type: string; likeCount: number; authorName: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: publicDesigns } = await supabase
        .from("fashion_designs")
        .select("id, image_url, prompt, garment_type, user_id, created_at")
        .eq("is_public", true)
        .gte("created_at", weekAgo)
        .order("created_at", { ascending: false });

      if (!publicDesigns?.length) { setDesigns([]); setLoading(false); return; }

      const ids = publicDesigns.map(d => d.id);
      const userIds = [...new Set(publicDesigns.map(d => d.user_id))];

      const [{ data: likes }, { data: profiles }] = await Promise.all([
        supabase.from("look_likes").select("look_id").eq("look_type", "design").in("look_id", ids),
        supabase.from("profiles").select("user_id, display_name").in("user_id", userIds),
      ]);

      const likeCounts = new Map<string, number>();
      likes?.forEach(l => likeCounts.set(l.look_id, (likeCounts.get(l.look_id) || 0) + 1));
      const profileMap = new Map(profiles?.map(p => [p.user_id, p.display_name]) || []);

      const sorted = publicDesigns
        .map(d => ({
          id: d.id,
          image_url: d.image_url,
          prompt: d.prompt,
          garment_type: d.garment_type,
          likeCount: likeCounts.get(d.id) || 0,
          authorName: profileMap.get(d.user_id) || "Anonymous",
        }))
        .sort((a, b) => b.likeCount - a.likeCount)
        .slice(0, 6);

      setDesigns(sorted);
      setLoading(false);
    })();
  }, []);

  if (loading) return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {[1, 2, 3].map(i => <div key={i} className="min-w-[150px] h-48 rounded-2xl bg-secondary animate-pulse" />)}
    </div>
  );

  if (!designs.length) return null;

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-foreground" />
          <h2 className="font-display text-xl font-bold text-foreground">Trending Designs</h2>
        </div>
        <button onClick={() => navigate("/community-gallery")} className="text-xs font-sans text-primary hover:underline">
          View All
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none snap-x snap-mandatory">
        {designs.map((d, i) => (
          <motion.button
            key={d.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate("/community-gallery")}
            className="min-w-[150px] max-w-[150px] flex-shrink-0 rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow snap-start text-left"
          >
            <div className="relative h-32 bg-secondary">
              <img src={d.image_url} alt={d.prompt} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                <Heart className="w-2.5 h-2.5 fill-current" /> {d.likeCount}
              </div>
            </div>
            <div className="p-2.5">
              <p className="text-[10px] text-muted-foreground font-sans">{d.authorName}</p>
              <p className="text-xs font-sans font-medium text-foreground truncate">{d.prompt.slice(0, 40)}</p>
              <p className="text-[10px] text-primary mt-1">{d.garment_type}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </>
  );
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
  const [wardrobeItems, setWardrobeItems] = useState<{ category: string; color: string | null }[]>([]);
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
      const [itemsRes, outfitsRes, profileRes, styleRes, closetRes, outfitsListRes, allItemsRes] = await Promise.all([
        supabase.from("clothing_items").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("outfits").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("profiles").select("display_name").eq("user_id", user.id).single(),
        supabase.from("style_profiles").select("onboarding_completed, archetype, style_score, preferences").eq("user_id", user.id).single(),
        supabase.from("clothing_items").select("id, photo_url, name, category, color").eq("user_id", user.id).order("created_at", { ascending: false }).limit(12),
        supabase.from("outfits").select("id, name, occasion").eq("user_id", user.id).order("created_at", { ascending: false }).limit(6),
        supabase.from("clothing_items").select("category, color").eq("user_id", user.id),
      ]);
      setStats({
        items: itemsRes.count || 0,
        outfits: outfitsRes.count || 0,
        styleScore: (styleRes.data as any)?.style_score || 0,
      });
      if (profileRes.data) setProfile(profileRes.data);
      if (styleRes.data) setStyleProfile(styleRes.data as any);
      if (closetRes.data) setClosetItems(closetRes.data as any);
      if (allItemsRes.data) setWardrobeItems(allItemsRes.data);

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

  // Wardrobe completeness analysis
  const ESSENTIAL_CATS = ["top", "bottom", "outerwear", "shoes", "dress", "accessory"];
  const CORE_COLORS = ["black", "white", "navy", "gray", "grey", "beige", "brown", "blue"];
  const ACCENT_COLORS = ["red", "green", "yellow", "pink", "orange", "purple", "burgundy"];

  const wardrobeCompleteness = useMemo(() => {
    if (!wardrobeItems.length) return null;
    const catCounts = new Map<string, number>();
    const colorSet = new Set<string>();
    wardrobeItems.forEach((i) => {
      catCounts.set(i.category, (catCounts.get(i.category) || 0) + 1);
      if (i.color) colorSet.add(i.color.toLowerCase().trim());
    });
    const coveredCats = ESSENTIAL_CATS.filter((c) => (catCounts.get(c) || 0) >= 3).length;
    const catScore = coveredCats / ESSENTIAL_CATS.length;
    const coveredNeutrals = CORE_COLORS.filter((c) => colorSet.has(c)).length;
    const hasAccent = ACCENT_COLORS.some((c) => colorSet.has(c));
    const colorScore = (coveredNeutrals / CORE_COLORS.length) * 0.8 + (hasAccent ? 0.2 : 0);
    const overall = Math.round((catScore * 0.6 + colorScore * 0.4) * 100);
    const missingCats = ESSENTIAL_CATS.filter((c) => !catCounts.has(c) || (catCounts.get(c) || 0) === 0);
    const weakCats = ESSENTIAL_CATS.filter((c) => { const n = catCounts.get(c) || 0; return n > 0 && n < 3; });
    const gaps: string[] = [];
    missingCats.slice(0, 2).forEach((c) => gaps.push(`Add ${c}s`));
    weakCats.slice(0, 2).forEach((c) => gaps.push(`More ${c}s`));
    if (coveredNeutrals < 4) gaps.push("Add neutral basics");
    if (!hasAccent) gaps.push("Add accent color");
    return { overall, gaps: gaps.slice(0, 3) };
  }, [wardrobeItems]);

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
          className="p-4 sm:p-5 lg:p-8 max-w-2xl mx-auto space-y-5 overflow-x-hidden"
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

        {/* ── Weather Card ─────────────────────────── */}
        <motion.div variants={fadeUp}>
          <WeatherOutfitCard />
        </motion.div>

        {/* ── Morning Routine Card ─────────────────────────── */}
        <motion.div variants={fadeUp}>
          <MorningRoutineCard />
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

        {/* ── Wardrobe Completeness Widget ──────────────────── */}
        {wardrobeCompleteness && (
          <motion.div variants={fadeUp} className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl p-5">
            <div className="flex items-center gap-4">
              {/* SVG Ring */}
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
                  <motion.circle
                    cx="40" cy="40" r="34" fill="none"
                    strokeWidth="5"
                    strokeLinecap="round"
                    stroke="url(#completenessGrad)"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - wardrobeCompleteness.overall / 100) }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                  />
                  <defs>
                    <linearGradient id="completenessGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(142, 60%, 48%)" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold font-sans text-foreground">{wardrobeCompleteness.overall}%</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-base font-bold text-foreground mb-1">Wardrobe Readiness</h3>
                <p className="text-[10px] font-sans text-muted-foreground mb-2">Category coverage & color diversity</p>
                <div className="space-y-1">
                  {wardrobeCompleteness.gaps.map((gap, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <AlertCircle className="w-3 h-3 text-primary flex-shrink-0" />
                      <span className="text-[11px] font-sans text-foreground">{gap}</span>
                    </div>
                  ))}
                </div>
                {wardrobeCompleteness.gaps.length > 0 && (
                  <button
                    onClick={() => navigate("/inspiration")}
                    className="text-[10px] font-sans text-primary font-semibold mt-2 flex items-center gap-1 hover:underline"
                  >
                    Shop to fill gaps <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

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

        {/* ── Trending Now For You ─────────────────────────── */}
        <motion.div variants={fadeUp}>
          <TrendIntelligenceWidget />
        </motion.div>

        {/* ── Trending Community Designs ────────────────────── */}
        <motion.div variants={fadeUp}>
          <TrendingDesigns navigate={navigate} />
        </motion.div>

        {/* ── Weekly Capsule Plan ───────────────────────────── */}
        <motion.div variants={fadeUp}>
          <WeeklyCapsuleWidget />
        </motion.div>

        {/* ── Style Points ────────────────────────────────── */}
        <motion.div variants={fadeUp}>
          <StylePointsWidget />
        </motion.div>

        {/* ── Chat with AI Stylist ──────────────────────────── */}
        <motion.div variants={fadeUp}>
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

        {/* ── Evening Reflection ─────────────────────────────── */}
        <motion.div variants={fadeUp} className="pb-8">
          <EveningReflection />
        </motion.div>
      </motion.div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
