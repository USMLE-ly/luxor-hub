import { getApiUrl } from "@/lib/api";
import React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import {UploadSimple, Camera, Spinner, InstagramLogo, TwitterLogo, ArrowSquareOut, ArrowsClockwise, Warning, StackSimple, File, Upload} from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { ImageSwiper } from "@/components/ui/image-swiper";

import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { FashionHero } from "@/components/ui/hero-fashion";
import { humanizeText, humanizeTextArray } from "@/lib/humanizer";

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
  items: string[];
  items_detected: string[];
  strengths: string[];
  improvements?: { issue: string; suggestion: string; priority: string }[];
  audit: string;
  tweak_plan: string;
  generation_prompt: string;
  tweak_image_url?: string;
  style_score?: number;
  ai_source_label?: string;
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
            { icon: InstagramLogo, href: "#" },
            { icon: TwitterLogo, href: "#" },
            { icon: ArrowSquareOut, href: "#" },
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
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } },
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
  const [progressValue, setProgressValue] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [progressStage, setProgressStage] = useState("");
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
    let pending = null;
    try { pending = sessionStorage.getItem("pendingUpload"); } catch {}
    if (pending) {
      try { sessionStorage.removeItem("pendingUpload"); } catch {}
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
    setProgressValue(10);
    setProgressStage("Compressing image...");
    try {
      // Compress first — phone photos are 3-12 MB, this shrinks them to ~100-200 KB
      const b64 = await compressImage(file);
      const apiUrl = getApiUrl(); // "" on Vercel (uses rewrites), direct URL on Replit/local

      // Retry loop — Cipher Vision can be slow; retry with backoff instead of giving up
      let fnData: any = null;
      setProgressValue(30);
      setProgressStage("Calling MiMo Vision 2.5...");
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
          if (!response.ok) {
            let errMsg = 'Server returned ' + response.status;
            try { const errBody = await response.json(); if (errBody?.error) errMsg = errBody.error; } catch {}
            throw new Error(errMsg);
          }
          fnData = await response.json();
          if (!fnData || !fnData.success) {
            const errDetail = fnData?.error ? 'Backend: ' + fnData.error : 'Analysis failed - empty response';
            console.error('[ANALYZE-ERROR] Backend response:', JSON.stringify(fnData));
            throw new Error(errDetail);
          }
          break;  // any successful source is fine
        } catch (fetchErr) {
          clearTimeout(abortTimer);
          if (fetchErr.name === 'AbortError') {
            throw new Error('Request timed out after 60s');
          }
          continue;
        }
      }
      // All retries exhausted — silently reset to upload state, no toast
      if (!fnData || !fnData.success) {
        setData(null);
        setAnalysisFailed(true);
        setProgressValue(0);
        setProgressStage("Failed");
        toast.error("Analysis timed out. Tap Retry to try again.");
        return;
      }

      // Strip 'for' key from API response if present (causes ".for is not iterable" crash)
      if (fnData && typeof fnData === 'object') delete (fnData as any).for;

      setProgressValue(70);
      setProgressStage("Parsing results...");
      
      // Map the Fable 5 response to our UI shape - NO fallback dummies
      const o: OutfitData = {
        style_name: fnData.style_name || '',
        actual_colors: Array.isArray(fnData.actual_colors) ? fnData.actual_colors : [],
        items: Array.isArray(fnData.items) ? fnData.items : (Array.isArray(fnData.items_detected) ? fnData.items_detected : []),
        items_detected: Array.isArray(fnData.items_detected) ? fnData.items_detected : (Array.isArray(fnData.items) ? fnData.items : []),
        strengths: (() => { try { return humanizeTextArray(fnData.strengths); } catch { return Array.isArray(fnData.strengths) ? fnData.strengths : []; } })(),
        improvements: (() => {
          try {
            return Array.isArray(fnData.improvements) ? fnData.improvements.map((imp: any) => ({
              ...imp,
              issue: (() => { try { return humanizeText(imp.issue || ''); } catch { return imp.issue || ''; } })(),
              suggestion: (() => { try { return humanizeText(imp.suggestion || ''); } catch { return imp.suggestion || ''; } })(),
            })) : [];
          } catch { return []; }
        })(),
        audit: (() => { try { return humanizeText(fnData.audit || ''); } catch { return fnData.audit || ''; } })(),
        tweak_plan: (() => { try { return humanizeText(fnData.tweak_plan || ''); } catch { return fnData.tweak_plan || ''; }})(),
        generation_prompt: fnData.generation_prompt || '',
        vibe_type: fnData.vibe_type || '',
        top_type: fnData.top_type || '',
        bottom_type: fnData.bottom_type || '',
        footwear: fnData.footwear || '',
        accessories: fnData.accessories || '',
        style_score: fnData.style_score || 0,
        ai_source_label: fnData.ai_source_label || "",
        seasonalFit: fnData.seasonalFit || '',
      };
      // Validate required array fields before setting data — prevents ".for is not iterable" crash
      const requiredArrayKeys = ['items', 'strengths', 'improvements'] as const;
      for (const key of requiredArrayKeys) {
        // BUG FIX: Check that key EXISTS and IS an array
        // Previously: (o as any)[key] !== undefined && !Array.isArray(...)
        // This skipped validation when key was undefined (left side false),
        // allowing missing keys to reach setData() and crash the render.
        // Now: throws if key is undefined, null, or not an array.
        if (!Array.isArray((o as any)[key])) {
          throw new Error(`Invalid data format: expected "${key}" to be an array, got ${typeof (o as any)[key]}.`);
        }
      }
      setData(o);
      setProgressValue(90);
      setProgressStage("Finalizing...");
      
      // No tweak image generation (disabled due to quality issues)
      setSavedId(null);
      toast.success('Outfit analyzed! ✨');
    } catch (e: any) {
      setAnalysisFailed(true);
      setData(null);
      const errMsg = e.message || '';
      const errStack = e.stack || '(no stack)';
      // Log FULL error details to console for debugging
      console.error('[ANALYZE-ERROR]', errMsg);
      console.error('[ANALYZE-ERROR][STACK]', errStack);
      console.error('[ANALYZE-ERROR][NAME]', e.name || '(no name)');
      // Show a user-friendly message instead of raw JS error
      if (errMsg.includes('.for is not iterable') || errMsg.includes('is not iterable') || errMsg.includes('not iterable')) {
        toast.error('The analysis returned unexpected data. Please try again with a clearer photo.');
      } else if (errMsg.includes('timed out') || errMsg.includes('Timeout') || errMsg.includes('AbortError')) {
        toast.error('The AI took too long to respond. Please try again.');
      } else if (errMsg.includes('400') || errMsg.includes('401') || errMsg.includes('402')) {
        toast.error('Server authentication issue. Please refresh and try again.');
      } else {
        toast.error(errMsg || 'Analysis failed. Please ensure the image is clear and try again.');
      }
      // If the error is about Cipher Vision, show a retry CTA instead of dead end
      if (errMsg.includes('Cipher Vision') && file) {
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

  /** Dynamically determine outfit versatility based on detected items + AI vibe/style */
  const determineVersatility = useCallback((items: string[], vibe: string, style: string) => {
    // Low base scores so only categories with matching items/boosts register
    let scores: Record<string, number> = {
      Casual: 10, Business: 10, 'Date Night': 10, Party: 10, Sporty: 10, Relaxed: 10
    };

    // Item → category keyword matching (covers MiMo format: "COLOR Garment")
    items.forEach(item => {
      const lower = item.toLowerCase();

      // Casual: t-shirt, jeans, sneakers, shorts, joggers, hoodie, sandals, tank top, polo, sweatpants, denim, sweatshirt
      if (/t.?shirt|jeans|sneakers|shorts|joggers|hoodie|sandals|tank\s*top|polo|sweatpants|denim|flip.?flop|sweatshirt/.test(lower)) scores.Casual += 30;

      // Business: blazer, trousers, pumps, tie, suit, button-down, oxfords, loafers, blouse, pencil skirt, briefcase
      if (/blazer|trousers|pumps|tie|suit|button.?down|oxfords|loafers|blouse|pencil skirt|briefcase/.test(lower)) scores.Business += 35;

      // Date Night: dress, heels, necklace, clutch, earrings, bracelet, evening, silk, satin, lace, bodycon, strappy, gown
      if (/dress|heels|necklace|clutch|earrings|bracelet|evening|silk|satin|lace|bodycon|strappy|gown/.test(lower)) scores['Date Night'] += 30;

      // Party: glitter, sequin, mini, bold, metallic, leather, party, night out, clubbing, crop top
      if (/glitter|sequin|mini|bold|metallic|leather|party|night out|clubbing|crop top/.test(lower)) scores.Party += 30;

      // Sporty: sneakers, cap, shorts, athletic, joggers, gym, running, sport, performance, trainers, track
      if (/sneakers|cap|athletic|joggers|gym|running|sport|performance|trainers|track\s*pants/.test(lower)) scores.Sporty += 30;

      // Relaxed: cardigan, sweater, oversized, loungewear, hoodie, sweatpants, fleece, cozy, cotton, linen
      if (/cardigan|sweater|oversized|loungewear|hoodie|sweatpants|fleece|cozy|cotton|linen/.test(lower)) scores.Relaxed += 30;
    });

    // Vibe boost (AI's judgment)
    const v = (vibe || '').toLowerCase();
    if (/casual|everyday|weekend|street/.test(v)) scores.Casual += 25;
    if (/formal|business|office|corporate|executive|professional/.test(v)) scores.Business += 30;
    if (/party|night|club|celebrat/.test(v)) scores.Party += 25;
    if (/date|romantic|evening|dinner|glam/.test(v)) scores['Date Night'] += 25;
    if (/sport|athletic|gym|active|fitness/.test(v)) scores.Sporty += 25;
    if (/relaxed|comfort|lounge|chill|cozy/.test(v)) scores.Relaxed += 25;

    // Style name boost
    const s = (style || '').toLowerCase();
    if (/chic|elegant|sophisticated|glam|polished|couture/.test(s)) scores['Date Night'] += 20;
    if (/street|urban|edgy|bold|modern|trendy/.test(s)) scores.Casual += 20;
    if (/formal|executive|power|sharp|pro|corporate|tailored/.test(s)) scores.Business += 20;
    if (/sport|athleisure|active|fitness|performance/.test(s)) scores.Sporty += 20;
    if (/cozy|soft|relaxed|comfy|easy|bohemian/.test(s)) scores.Relaxed += 20;
    if (/party|festive|celebratory|night|daring/.test(s)) scores.Party += 20;

    const COLOR_MAP: Record<string, string> = {
      Casual: '#3b82f6',
      Business: '#8b5cf6',
      'Date Night': '#ec4899',
      Party: '#f59e0b',
      Sporty: '#06b6d4',
      Relaxed: '#22c55e',
    };

    // Filter meaningful scores (>=20), sort descending, cap at 100
    return Object.entries(scores)
      .filter(([_, v]) => v >= 20)
      .sort((a, b) => b[1] - a[1])
      .map(([label, score]) => ({
        label,
        score: Math.min(100, Math.max(0, Math.round(score))),
        color: COLOR_MAP[label] || 'hsl(var(--muted-foreground))'
      }));
  }, []);

  const handleSave = async () => {
    if (!data || !user || !imagePreview) return;
    setSaving(true);
    try {
      // Upload image
      let publicUrl = imagePreview;
      if (imageFile) {
              // Sanitize extension: strip path separators and traversal chars
      const rawExt = imageFile.name.split(".").pop() || "bin";
      const ext = rawExt.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8) || "bin";
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
        detected_items: Array.isArray(data.items_detected) ? data.items_detected.map((n) => ({ name: n, category: "Item", color: "N/A", style: "N/A" })) : [],
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
      style_name: s.overall_style || '',
      style_score: s.style_score || 0,
      items: Array.isArray((s as any).items) ? (s as any).items : Array.isArray(s.detected_items) ? (s.detected_items as any[]).map((i: any) => i.name || '') : [],
      actual_colors: (s.color_palette as any)?.colors || [],
      items_detected: Array.isArray(s.detected_items) ? (s.detected_items as any[]).map((i: any) => i.name || '') : [],
      strengths: Array.isArray(s.strengths) ? s.strengths : [],
      improvements: Array.isArray((s.detected_items as any)?.improvements) ? (s.detected_items as any).improvements : [],
      audit: s.summary || '',
      tweak_plan: s.summary || '',
      generation_prompt: s.summary || '',
      vibe_type: (s.detected_items as any)?.vibe_type || '',
      top_type: (s.detected_items as any)?.top_type || '',
      bottom_type: (s.detected_items as any)?.bottom_type || '',
      footwear: (s.detected_items as any)?.footwear || '',
      accessories: (s.detected_items as any)?.accessories || '',
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
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.23, 1, 0.32, 1] } },
  };

  /* ---------- Pre-computed lists ---------- */


  // ── Smooth auto-increment progress: 0 → 95% during loading, jumps to 100% on success ──
  useEffect(() => {
    if (!loading) {
      setDisplayProgress(progressValue);
      return;
    }
    setDisplayProgress(0);
    const timer = setInterval(() => {
      setDisplayProgress(prev => {
        if (prev >= 95) return 95;
        const increment = prev < 30 ? 3 : prev < 60 ? 2 : prev < 80 ? 1.5 : 1;
        return Math.min(prev + increment, 95);
      });
    }, 200);
    return () => clearInterval(timer);
  }, [loading, progressValue]);


  // ── Early return guard: prevent ".for is not iterable" crash ──
  // If data is null/falsy AND analysis failed, show a clean fallback
  // instead of letting React try to read properties on null.
  if (!data && analysisFailed) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-6">
            <Warning className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="font-display text-xl text-foreground mb-2">Analysis unavailable</h2>
          <p className="text-muted-foreground text-sm mb-8 max-w-sm">
            We couldn't analyze this outfit. The AI returned unexpected data. Please try again with a clearer photo.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-300 to-yellow-400 text-slate-900 font-semibold text-sm hover:scale-105 transition-transform"
            >
              Try Again
            </button>
            <button
              onClick={() => { setImagePreview(null); setImageFile(null); setAnalysisFailed(false); }}
              className="px-6 py-2.5 rounded-lg border border-white/10 text-white/70 text-sm hover:bg-white/5 transition-colors"
            >
              Upload New Photo
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ScrollReveal delay={0.1}>
      <div className="p-4 md:p-8 mx-auto max-w-7xl space-y-8 overflow-x-hidden">

        {/* ---------- HEADER ---------- */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative hidden md:block">
          <div className="absolute -top-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-[60px]" />
          <h1 className="font-display text-4xl font-bold text-foreground relative">
            {/* cb2 */}See What the World <span className="gold-text">Sees</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Upload your outfit. The AI scores it, finds the strengths, and tells you exactly what to fix.</p>
        </motion.div>

        {/* ---------- MAIN GRID: Preview + Dashboard ---------- */}
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-7xl mx-auto">

          {/* ---- LEFT: Image Preview ---- */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-[35%] lg:w-[30%] flex-shrink-0 relative"
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
                      <ImageSwiper images={imagePreview} cardWidth={400} cardHeight={600} className="w-full max-h-[55vh] md:max-h-[85vh]" />
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

                  {/* Loading overlay — golden spinning halo */}
                  <AnimatePresence>
                    {loading && (
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-forest/70 backdrop-blur-sm flex flex-col items-center justify-center gap-6 z-10 px-6"
                      >
                        <div className="relative w-24 h-24 flex items-center justify-center">
                          <div className="absolute w-full h-full rounded-full border-4 border-white/5 border-t-[#e5c785] border-r-[#d4b06a] animate-spin" />
                          <div className="absolute w-16 h-16 rounded-full bg-amber-200/10 animate-pulse" />
                          <span className="text-base font-semibold text-amber-200/85 z-10" >
                            {displayProgress}%
                          </span>
                        </div>
                        <p className="text-sm text-white/70 font-medium tracking-wide">{progressStage}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* ---- RIGHT: Analysis Column ---- */}
          <motion.div
            className="w-full md:flex-1 flex flex-col gap-4 space-y-6"
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
                    strengths={data.strengths || []}
                    improvements={data.improvements || []}
                    itemsDetected={data.items_detected || []}
                    actualColors={data.actual_colors || []}
                    audit={data.audit}
                    tweakPlan={data.tweak_plan}
                    imageUrl={imagePreview}
                    generatedImageUrl={generatedImageUrl}
                    vibeType={data.vibe_type}
                    topType={data.top_type}
                    bottomType={data.bottom_type}
                    footwear={data.footwear}
                    accessories={data.accessories}
                    aiSourceLabel={data.ai_source_label}
                  />
                </motion.div>

                {/* ---- Interactive Stylist Quiz ---- */}


                {/* ---- Outfit Versatility Section ---- */}
                <motion.div variants={childVariants}>
                  {(() => {
                    const versatilityScores = determineVersatility(data?.items_detected || [], data?.vibe_type || '', data?.style_name || '');
                    return (
                      <div className="w-full p-5 rounded-xl border border-white/10 bg-forest/40 backdrop-blur-sm">
                        <h3 className="text-xs uppercase tracking-[0.15em] text-white/60 mb-1 font-semibold">Outfit Versatility</h3>
                        <p className="text-[11px] text-white/40 mb-4">How well this outfit adapts to different occasions.</p>
                        <div className="space-y-4">
                          {Array.isArray(versatilityScores) && versatilityScores.map((v, i) => (
                            <div key={v.label}>
                              <div className="flex justify-between mb-1.5">
                                <span className="text-xs font-medium text-foreground/80">{v.label}</span>
                                <span className="text-xs font-medium text-white/60">{v.score}%</span>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full"
                                  style={{ background: `linear-gradient(90deg, ${v.color}, ${v.color}dd)` }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${v.score}%` }}
                                  transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1], delay: 0.1 * (i + 1) }}
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
                      {saving ? <Spinner className="w-4 h-4 mr-2 animate-spin" /> : <StackSimple className="w-4 h-4 mr-2" />}
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
                    <StackSimple className="w-4 h-4 mr-2" /> Open Dressing Room
                  </Button>
                </motion.div>
              </>
            ) : (
              <>
                {analysisFailed && imagePreview ? (
                  <motion.div variants={childVariants} className="text-center py-12">
                    <Warning className="h-16 w-16 text-amber-500/70 mx-auto mb-4" />
                    <h3 className="font-display text-xl text-foreground mb-2">Analysis timed out</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                      The AI took too long to respond. You can retry with a longer timeout, or upload a different photo.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <Button onClick={() => { if (imageFile) analyzeOutfit(imageFile); }} disabled={loading} variant="default" className="gap-2">
                        {loading ? <Spinner className="w-4 h-4 animate-spin" /> : <ArrowsClockwise className="w-4 h-4" />}
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

            {/* ---- ClockCounterClockwise ---- */}
            {history.length > 0 && (
              <motion.div variants={childVariants} className="pt-4">
                <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
                  <StackSimple className="w-5 h-5 text-primary" /> Previous Analyses
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Array.isArray(history) && history.slice(0, 6).map((h) => (
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
      </ScrollReveal>
    </AppLayout>
  );
}
