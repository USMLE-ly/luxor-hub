import React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import {
  Upload, Camera,
  Loader2, Instagram, Twitter, ExternalLink, RefreshCw, AlertTriangle,
  Layers
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ImageSwiper } from "@/components/ui/image-swiper";
import { FashionHero } from "@/components/ui/hero-fashion";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface OutfitData {
  style_name: string;
  vibe_type?: string;
  top_type?: string;
  bottom_type?: string;
  footwear?: string;
  accessories?: string;
  actual_colors: string[];
  items_detected: string[];
  strengths: string[];
  audit: string;
  tweak_plan: string;
  generation_prompt: string;
  style_score?: number;
  seasonalFit?: string;
}

interface SavedAnalysis {
  id: string;
  image_url: string;
  overall_style: string;
  style_score: number;
  summary: string;
  detected_items: any;
  color_palette: any;
  strengths: any;
  created_at: string;
}

/*  Footer (shared)                                                    */
/* ------------------------------------------------------------------ */
function Footer() {
  return (
    <footer className="relative mt-12 mb-6">
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
/*  Framer‑Motion list variants                                        */
/* ------------------------------------------------------------------ */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

/* ------------------------------------------------------------------ */
/*  Pro Stylist Tweak Sub‑component                                    */
/* ------------------------------------------------------------------ */



export default function Analysis() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [data, setData] = useState<OutfitData | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [analysisFailed, setAnalysisFailed] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [history, setHistory] = useState<SavedAnalysis[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  // Handle auto-analysis when imageFile changes (upload or pending)
  // Use a ref to avoid stale closure issues with analyzeOutfit
  const analyzeRef = useRef<((file: File) => Promise<void>) | null>(null);
  useEffect(() => {
    analyzeRef.current = analyzeOutfit;
  });
  useEffect(() => {
    if (imageFile && analyzeRef.current) {
      analyzeRef.current(imageFile);
    }
  }, [imageFile]);

  // Check for pending upload from Dressing Room
  useEffect(() => {
    const pending = sessionStorage.getItem("pendingUpload");
    if (pending) {
      sessionStorage.removeItem("pendingUpload");
      const byteString = atob(pending.split(",")[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      const blob = new Blob([ab], { type: "image/jpeg" });
      const file = new File([blob], "upload.jpg", { type: "image/jpeg" });
      setImagePreview(pending);
      setImageFile(file);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from("style_profiles")
      .select("preferences")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.preferences) setUserProfile(data.preferences);
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("outfit_analyses")
      .select("id,image_url,overall_style,style_score,summary,detected_items,color_palette,strengths,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data: d }) => setHistory(d || []));
  }, [user]);

  const handleFile = (f: File) => {
    if (!f) return;
    setImagePreview(URL.createObjectURL(f));
    setImageFile(f);
    setData(null);
    setSavedId(null);
    setGeneratedImageUrl(null);
  };

  const getBase64 = (file: File): Promise<string> =>
    new Promise((res) => {
      const r = new FileReader();
      r.onloadend = () => res((r.result as string).split(",")[1]);
      r.readAsDataURL(file);
    });

  // Compress image on the client before sending — eliminates network + backend timeout
  const compressImage = (file: File, maxDim = 1024, quality = 0.7): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round(height * maxDim / width);
            width = maxDim;
          } else {
            width = Math.round(width * maxDim / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality).split(',')[1]);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });

  const analyzeOutfit = async (file: File) => {
    setAnalysisFailed(false);
    setLoading(true);
    try {
      // Compress first — phone photos are 3-12 MB, this shrinks them to ~100-200 KB
      const b64 = await compressImage(file);
      const apiUrl = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://luxor-hub.replit.app');

      // Retry loop — Cipher Vision can be slow; retry with backoff instead of giving up
      let fnData: any = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt > 0) {
          await new Promise(r => setTimeout(r, 2000 * attempt));
        }
        const controller = new AbortController();
        const abortTimer = setTimeout(() => controller.abort(), 120000);
        try {
          const response = await fetch(apiUrl + '/api/v1/analyze-outfit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_b64: b64 }),
            signal: controller.signal,
          });
          clearTimeout(abortTimer);
          if (!response.ok) throw new Error('Server returned ' + response.status);
          fnData = await response.json();
          if (!fnData || !fnData.success) throw new Error('Analysis failed');
          break;  // any successful source is fine
        } catch (fetchErr) {
          clearTimeout(abortTimer);
          if (fetchErr.name === 'AbortError') {
            throw new Error('Request timed out after 60s');
          }
          throw fetchErr;
        }
      }
      // All retries exhausted — silently reset to upload state, no toast
      if (!fnData || !fnData.success) {
        setData(null);
        setAnalysisFailed(true);
        toast.error("Analysis timed out. Tap Retry to try again.");
        return;
      }

      // Map the Fable 5 response to our UI shape - NO fallback dummies
      const o: OutfitData = {
        style_name: fnData.style_name || '',
        actual_colors: fnData.actual_colors || [],
        items_detected: fnData.items_detected || [],
        strengths: fnData.strengths || [],
        audit: fnData.audit || '',
        tweak_plan: fnData.tweak_plan || '',
        generation_prompt: fnData.generation_prompt || '',
        vibe_type: fnData.vibe_type || '',
        top_type: fnData.top_type || '',
        bottom_type: fnData.bottom_type || '',
        footwear: fnData.footwear || '',
        accessories: fnData.accessories || '',
        style_score: fnData.style_score || 0,
        seasonalFit: fnData.seasonalFit || '',
      };
      setData(o);
      
      // Generate AI fashion image from the generation_prompt
      if (fnData.generation_prompt) {
        const prompt = fnData.generation_prompt;
        const safe = encodeURIComponent(prompt);
        // Use window origin for relative URLs, or default to localhost
        const base = window.location.hostname === 'localhost' 
          ? 'http://localhost:5000'
          : (import.meta.env.VITE_API_URL || window.location.origin);
        // Build Pollinations URL from the prompt
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${safe}?width=1024&height=1024&nologin=true&seed=`;
        setGeneratedImageUrl(pollinationsUrl + Date.now());
      }
      setSavedId(null);
      toast.success('Outfit analyzed! ✨');
    } catch (e: any) {
      toast.error(e.message || 'Analysis failed');
      // If the error is about Cipher Vision, show a retry CTA instead of dead end
      if (e.message && e.message.includes('Cipher Vision') && file) {
        const retryFile = file;
        setTimeout(() => {
          toast(
            <div className="flex items-center gap-2">
              <span>Click to retry analysis</span>
              <Button size="sm" variant="outline" onClick={() => analyzeOutfit(retryFile)}>Retry</Button>
            </div>,
            { duration: 8000 }
          );
        }, 500);
      }
    } finally {
      setLoading(false);
    }
  };

  /** Dynamically determine outfit versatility categories and scores */
  const determineVersatility = useCallback((items: string[], vibe: string, style: string) => {
    // Initialize base scores for various possible categories
    let scores: { [key: string]: number } = {
      Casual: 30, Business: 30, 'Date Night': 30, Party: 30, Sporty: 30, Relaxed: 30
    };

    // Adjust scores based on detected items
    items.forEach(item => {
      const lower = item.toLowerCase();
      
      if (lower.includes('t-shirt') || lower.includes('jeans') || lower.includes('sneakers') || lower.includes('shorts') || lower.includes('joggers')) scores.Casual += 25;
      if (lower.includes('blazer') || lower.includes('trousers') || lower.includes('pumps') || lower.includes('tie') || lower.includes('suit') || lower.includes('button-up')) scores.Business += 25;
      if (lower.includes('dress') || lower.includes('heels') || lower.includes('necklace') || lower.includes('clutch') || lower.includes('earrings')) scores['Date Night'] += 25;
      if (lower.includes('glitter') || lower.includes('sequin') || lower.includes('mini') || lower.includes('bold') || lower.includes('metallic')) scores.Party += 25;
      if (lower.includes('sneakers') || lower.includes('cap') || lower.includes('shorts') || lower.includes('athletic') || lower.includes('joggers')) scores.Sporty += 25;
      if (lower.includes('cardigan') || lower.includes('sweater') || lower.includes('oversized') || lower.includes('loungewear') || lower.includes('hoodie')) scores.Relaxed += 25;
    });

    // Boost by the AI's vibe_type
    if (vibe?.toLowerCase().includes('casual')) scores.Casual += 20;
    if (vibe?.toLowerCase().includes('formal') || vibe?.toLowerCase().includes('business')) scores.Business += 20;
    if (vibe?.toLowerCase().includes('party')) scores.Party += 20;
    if (vibe?.toLowerCase().includes('date')) scores['Date Night'] += 20;
    if (vibe?.toLowerCase().includes('sport')) scores.Sporty += 20;
    if (vibe?.toLowerCase().includes('relaxed') || vibe?.toLowerCase().includes('streetwear')) scores.Relaxed += 20;
    
    // Boost by style_name
    if (style?.toLowerCase().includes('chic') || style?.toLowerCase().includes('elegant')) scores['Date Night'] += 10;
    if (style?.toLowerCase().includes('street') || style?.toLowerCase().includes('urban')) scores.Casual += 10;
    if (style?.toLowerCase().includes('formal') || style?.toLowerCase().includes('executive')) scores.Business += 10;
    if (style?.toLowerCase().includes('sport') || style?.toLowerCase().includes('athleisure')) scores.Sporty += 10;

    // Color map for each category
    const COLOR_MAP: { [key: string]: string } = {
      'Casual': '#3b82f6',
      'Business': '#8b5cf6',
      'Date Night': '#ec4899',
      'Party': '#f59e0b',
      'Sporty': '#06b6d4',
      'Relaxed': '#22c55e',
    };

    // Filter out scores < 30 (irrelevant for this outfit), sort highest first
    return Object.entries(scores)
      .filter(([_, score]) => score >= 30)
      .sort((a, b) => b[1] - a[1])
      .map(([label, score]) => ({
        label,
        score: Math.min(100, Math.max(0, Math.round(score))),
        color: COLOR_MAP[label] || '#666666'
      }));
  }, []);

  const handleSave = async () => {
    if (!data || !user || !imagePreview) return;
    setSaving(true);
    try {
      // Upload image
      let publicUrl = imagePreview;
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("clothing-photos").upload(path, imageFile);
        if (!upErr) {
          const { data: pub } = supabase.storage.from("clothing-photos").getPublicUrl(path);
          publicUrl = pub.publicUrl;
        }
      }
      const { data: ins, error } = await supabase.from("outfit_analyses").insert({
        user_id: user.id,
        image_url: publicUrl,
        overall_style: data.style_name,
        style_score: data.style_score || 0,
        summary: data.audit,
        detected_items: data.items_detected.map((n) => ({ name: n, category: "Item", color: "N/A", style: "N/A" })),
        color_palette: { colors: data.actual_colors, harmony: "Balanced", rating: "Good" },
        strengths: data.strengths,
        improvements: [{ suggestion: data.tweak_plan, reason: "AI suggestion", priority: "medium" }],
        seasonal_fit: data.seasonalFit || '',
        body_type_notes: "",
      }).select("id").single();
      if (error) throw error;
      setSavedId(ins.id);
      toast.success("Analysis saved!");
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const loadSaved = (s: SavedAnalysis) => {
    setImagePreview(s.image_url);
    setImageFile(null);
    setData({
      vibe_type: (s.detected_items as any)?.vibe_type || '',
      style_name: s.overall_style || '',
      actual_colors: (s.color_palette as any)?.colors || [],
      items_detected: ((s.detected_items || []) as any[]).map((i: any) => i.name || ''),
      strengths: (s.strengths as string[]) || [],
      audit: s.summary || '',
      tweak_plan: '',
      generation_prompt: '',
      style_score: s.style_score || 0,
    });
    setSavedId(s.id);
  };

  const timeAgo = (d: string) => {
    const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    return m < 60 ? `${m}m ago` : `${Math.floor(m / 60)}h ago`;
  };

  /* ---------- Framer variants ---------- */
  const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
  };

  /* ---------- Pre-computed lists ---------- */

  return (
    <AppLayout>
      <div className="p-4 md:p-8 mx-auto max-w-7xl space-y-8 overflow-x-hidden">

        {/* ---------- HEADER ---------- */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative">
          <div className="absolute -top-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-[60px]" />
          <h1 className="font-display text-4xl font-bold text-foreground relative">
            {/* cb2 */}See What the World <span className="gold-text">Sees</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Upload your outfit. The AI scores it, finds the strengths, and tells you exactly what to fix.</p>
        </motion.div>

        {/* ---------- MAIN GRID: Preview + Dashboard ---------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ---- LEFT: Image Preview ---- */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-[1.5rem] border-[0.75px] border-border p-3 sticky top-24">
              <GlowingEffect spread={40} glow proximity={56} inactiveZone={0.01} borderWidth={3} />
              <Card className="glass-card border-0 shadow-none overflow-hidden">
                <CardContent className="p-0">
                  {/* Upload area */}
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="relative aspect-[3/4] cursor-pointer overflow-hidden bg-muted/20 group"
                  >
                    {imagePreview ? (
                      <ImageSwiper images={imagePreview} cardWidth={400} cardHeight={600} className="w-full" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <motion.div
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 2.5, repeat: Infinity }}
                          className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
                        >
                          <Camera className="w-10 h-10 text-primary" />
                        </motion.div>
                        <p className="font-display text-sm">Tap to upload your outfit</p>
                        <p className="text-[10px]">JPG or PNG, max 10 MB</p>
                      </div>
                    )}
                    {/* File input */}
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                    />
                  </div>

                  {/* Loading overlay */}
                  <AnimatePresence>
                    {loading && (
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10"
                      >
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="font-display text-sm">Analyzing your outfit…</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* ---- RIGHT: 2‑col Dashboard ---- */}
          <motion.div
            className="lg:col-span-7 space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {data ? (
              <>
                {/* ---- User Profile Context ---- */}
                {userProfile && (
                  <motion.div variants={childVariants} className="mb-4 p-3 rounded-xl bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-cyan-900/30 border border-white/10">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-white/70">
                      <span className="text-white/40 uppercase tracking-wider mr-1">Profile</span>
                      {userProfile.bodyShape && <span className="px-2 py-1 rounded bg-white/5 border border-white/10">{userProfile.bodyShape}</span>}
                      {userProfile.height && <span className="px-2 py-1 rounded bg-white/5 border border-white/10">{userProfile.height}</span>}
                      {userProfile.budget && <span className="px-2 py-1 rounded bg-white/5 border border-white/10">${userProfile.budget}</span>}
                      {userProfile.styleGoal && <span className="px-2 py-1 rounded bg-white/5 border border-white/10">{userProfile.styleGoal}</span>}
                      {userProfile.lifestyle && <span className="px-2 py-1 rounded bg-white/5 border border-white/10">{userProfile.lifestyle}</span>}
                      {userProfile.profession && <span className="px-2 py-1 rounded bg-white/5 border border-white/10">{userProfile.profession}</span>}
                    </div>
                  </motion.div>
                )}

                {/* ---- Fashion Hero Layout ---- */}
                <motion.div variants={childVariants}>
                  <FashionHero
                    styleName={data.style_name}
                    styleScore={data.style_score || null}
                    strengths={data.strengths}
                    itemsDetected={data.items_detected}
                    actualColors={data.actual_colors}
                    audit={data.audit}
                    tweakPlan={data.tweak_plan}
                    imageUrl={imagePreview}
                    generatedImageUrl={generatedImageUrl}
                    vibeType={data.vibe_type}
                    topType={data.top_type}
                    bottomType={data.bottom_type}
                    footwear={data.footwear}
                    accessories={data.accessories}
                  />
                </motion.div>

                {/* ---- Interactive Stylist Quiz ---- */}


                {/* ---- Outfit Versatility Section ---- */}
                <motion.div variants={childVariants}>
                  {(() => {
                    const versatilityScores = determineVersatility(data?.items_detected || [], data?.vibe_type || '', data?.style_name || '');
                    return (
                      <div className="w-full p-5 rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm">
                        <h3 className="text-xs uppercase tracking-[0.15em] text-white/60 mb-1 font-semibold">Outfit Versatility</h3>
                        <p className="text-[11px] text-white/40 mb-4">How well this outfit adapts to different occasions.</p>
                        <div className="space-y-4">
                          {versatilityScores.map((v, i) => (
                            <div key={v.label}>
                              <div className="flex justify-between mb-1.5">
                                <span className="text-xs font-medium text-white/80">{v.label}</span>
                                <span className="text-xs font-medium text-white/60">{v.score}%</span>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full"
                                  style={{ background: `linear-gradient(90deg, ${v.color}, ${v.color}dd)` }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${v.score}%` }}
                                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 * (i + 1) }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>

                {/* ---- Save Button ---- */}
                <motion.div variants={childVariants} className="flex items-center gap-3 justify-end">
                  {!savedId ? (
                    <Button onClick={handleSave} disabled={saving} variant="outline" className="border-primary/30 hover:bg-primary/10" whileTap={{ scale: 0.95 }}>
                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Layers className="w-4 h-4 mr-2" />}
                      Save Analysis
                    </Button>
                  ) : (
                    <Badge className="bg-green-500/15 text-green-500 border-green-500/30">✓ Saved to Dressing Room</Badge>
                  )}
                  <Button
                    onClick={() => navigate("/dressing-room")}
                    variant="outline"
                    className="border-primary/30 hover:bg-primary/10"
                    whileTap={{ scale: 0.95 }}
                  >
                    <Layers className="w-4 h-4 mr-2" /> Open Dressing Room
                  </Button>
                </motion.div>
              </>
            ) : (
              <>
                {analysisFailed && imagePreview ? (
                  <motion.div variants={childVariants} className="text-center py-12">
                    <AlertTriangle className="h-16 w-16 text-amber-500/70 mx-auto mb-4" />
                    <h3 className="font-display text-xl text-foreground mb-2">Analysis timed out</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                      The AI took too long to respond. You can retry with a longer timeout, or upload a different photo.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <Button onClick={() => { if (imageFile) analyzeOutfit(imageFile); }} disabled={loading} variant="default" className="gap-2">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        {loading ? "Analyzing..." : "🔄 Retry Analysis"}
                      </Button>
                      <Button onClick={() => { setImagePreview(null); setImageFile(null); setAnalysisFailed(false); }} variant="outline" className="gap-2">
                        <Upload className="w-4 h-4" /> Upload new photo
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  /* ---- Empty state ---- */
                  <motion.div variants={childVariants} className="text-center py-12">
                    <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-display text-xl text-foreground mb-2">Upload an outfit to begin</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                      Tap the camera area on the left to upload a photo. The AI will analyze your style, colors, and fit.
                    </p>
                  </motion.div>
                )}
              </>
            )}

            {/* ---- History ---- */}
            {history.length > 0 && (
              <motion.div variants={childVariants} className="pt-4">
                <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" /> Previous Analyses
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {history.slice(0, 6).map((h) => (
                    <motion.button
                      key={h.id}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => loadSaved(h)}
                      className="relative rounded-xl overflow-hidden border border-border/50 group text-left"
                    >
                      <div className="aspect-[3/4] bg-muted/20">
                        <img src={h.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-background/90 to-transparent">
                        <p className="text-[10px] font-semibold text-foreground truncate">{h.overall_style}</p>
                        <p className="text-[8px] text-muted-foreground">{h.style_score}/100 · {timeAgo(h.created_at)}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* ---------- FOOTER ---------- */}
        <Footer />
      </div>
    </AppLayout>
  );
}
