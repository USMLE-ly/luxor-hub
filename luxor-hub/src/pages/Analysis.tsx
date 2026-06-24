import { useState, useRef, useEffect } from "react";
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
  Upload, Camera, Star, Palette, Shirt, ShieldCheck, Sparkles,
  Loader2, Instagram, Twitter, ExternalLink, Eye, RefreshCw, AlertTriangle,
  TrendingUp, Layers, ArrowLeftRight, X
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface OutfitData {
  style_name: string;
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

/* ------------------------------------------------------------------ */
/*  SVG Circular Score                                                 */
/* ------------------------------------------------------------------ */
function CircularScore({ score, size = 112 }: { score: number | null; size?: number }) {
  const isNA = score === null || score === undefined || score === 0;
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = isNA ? circ : circ - (score / 100) * circ;
  const [animatedOffset, setOffset] = useState(circ);
  useEffect(() => {
    const id = setTimeout(() => setOffset(offset), 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line
  }, [score]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="goldArc" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C6A55C" />
            <stop offset="100%" stopColor="#E8D5A3" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#goldArc)" strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: isNA ? circ : animatedOffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {isNA ? (
          <motion.span
            className="text-lg font-bold text-muted-foreground/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            N/A
          </motion.span>
        ) : (
          <>
            <motion.span
              className="text-2xl font-bold gold-text"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
            >
              {score}
            </motion.span>
          </>
        )}
        <span className="text-[9px] text-muted-foreground -mt-1">/ 100</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
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
function ProStylistTweakBlock({ imagePreview, generationPrompt, tweakPlan }: { imagePreview: string | null; generationPrompt?: string; tweakPlan?: string; }) {
  const [result, setResult] = useState<{
    tweaked_image_url: string; suggestion: string; source: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!imagePreview) { toast.error("Upload an image first"); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      let b64 = imagePreview;
      if (b64.startsWith("data:")) b64 = b64.split(",")[1];
      else if (b64.startsWith("http")) {
        const r = await fetch(b64); const blob = await r.blob();
        b64 = await new Promise((res) => {
          const fr = new FileReader();
          fr.onloadend = () => res((fr.result as string).split(",")[1]);
          fr.readAsDataURL(blob);
        });
      }
      const api = import.meta.env.VITE_PUBLIC_API_URL || 'https://python--libyausmle.replit.app';
      const resp = await fetch(api + '/api/v1/pro-tweak/generate', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_b64: b64, generation_prompt: generationPrompt || '' }),
      });
      if (!resp.ok) throw new Error((await resp.json().catch(() => ({}))).error || 'Error ' + resp.status);
      const d = await resp.json();
      setResult({ tweaked_image_url: d.tweaked_image_url, suggestion: d.suggestion || '', source: d.source || '' });
      toast.success('Divine tweak generated!');
    } catch (e: any) {
      setError(e.message); toast.error(e.message);
    } finally { setLoading(false); }
  };

  const suggestion = result?.suggestion || tweakPlan || '';

  return (
    <motion.div variants={itemAnim}>
      <div className="relative rounded-[1.5rem] border-[0.75px] border-border p-3">
        <GlowingEffect spread={50} glow proximity={64} inactiveZone={0.01} borderWidth={3} />
        <Card className="glass-card border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="font-display flex items-center gap-2 text-lg">
              <div className="w-0.5 h-5 gold-gradient rounded-full mr-1" />
              <Sparkles className="w-5 h-5 text-primary" /> Pro Stylist Tweak
            </CardTitle>
            <p className="text-sm text-muted-foreground">Let the AI fashion deity reimagine your outfit.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {!result && !loading && !error && (
              <div className="text-center py-6">
                {imagePreview ? (
                  <Button onClick={handleGenerate} className="gold-gradient text-primary-foreground font-sans px-8 py-6 text-base">
                    <Sparkles className="h-5 w-5 mr-2" /> Analyze with Divine Vision
                  </Button>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Camera className="w-12 h-12" />
                    <p className="text-sm">Upload an outfit photo above</p>
                  </div>
                )}
              </div>
            )}

            {loading && (
              <div className="text-center py-10 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                <p className="font-display text-base">Consulting the cosmic style deities...</p>
              </div>
            )}

            {error && !loading && (
              <div className="text-center py-6 space-y-3">
                <AlertTriangle className="h-8 w-8 text-destructive mx-auto" />
                <p className="text-sm text-destructive">{error}</p>
                <Button variant="outline" onClick={handleGenerate}><RefreshCw className="h-4 w-4 mr-2" /> Try Again</Button>
              </div>
            )}

            {result && !loading && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {/* Divine Edit description */}
                {suggestion && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Divine Edit</p>
                      <p className="text-sm text-muted-foreground mt-1">{suggestion}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> Original
                    </p>
                    <div className="rounded-2xl overflow-hidden border border-border shadow-lg bg-muted/20 aspect-[3/4]">
                      <img src={imagePreview!} alt="Original" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary" /> AI-Enhanced
                    </p>
                    <div className="rounded-2xl overflow-hidden border border-border shadow-lg bg-muted/20 aspect-[3/4]">
                      <img src={result.tweaked_image_url} alt="AI enhanced" className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">
                    Source: {result.source === "cipher_vision" ? "Cipher Vision AI" : "Local Stylist"}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={handleGenerate} className="border-primary/30 hover:bg-primary/10">
                    <RefreshCw className="w-3 h-3 mr-1" /> Regenerate
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */
export default function Analysis() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [data, setData] = useState<OutfitData | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
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
    setLoading(true);
    try {
      // Compress first — phone photos are 3-12 MB, this shrinks them to ~100-200 KB
      const b64 = await compressImage(file);
      const apiUrl = import.meta.env.VITE_PUBLIC_API_URL || 'https://python--libyausmle.replit.app';

      // Retry loop — Cipher Vision can be slow; retry with backoff instead of giving up
      let fnData: any = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt > 0) {
          await new Promise(r => setTimeout(r, 2000 * attempt));
        }
        const response = await fetch(apiUrl + '/api/v1/analyze-outfit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_b64: b64 }),
        });
        if (!response.ok) throw new Error('Server returned ' + response.status);
        fnData = await response.json();
        if (!fnData || !fnData.success) throw new Error('Analysis failed');
        if (fnData.source === 'cipher_vision') break; // success — exit retry loop
        // source is 'fallback' (from Replit) or 'local' — retry
      }
      // All retries exhausted — silently reset to upload state, no toast
      if (!fnData || fnData.source !== 'cipher_vision') {
        setData(null);
        setImagePreview(null);
        setImageFile(null);
        setSavedId(null);
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
        style_score: fnData.style_score || 0,
        seasonalFit: fnData.seasonalFit || '',
      };
      setData(o);
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

  return (
    <AppLayout>
      <div className="p-4 md:p-8 mx-auto max-w-7xl space-y-8 overflow-x-hidden">

        {/* ---------- HEADER ---------- */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative">
          <div className="absolute -top-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-[60px]" />
          <h1 className="font-display text-4xl font-bold text-foreground relative">
            See What the World <span className="gold-text">Sees</span>
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
                      <img src={imagePreview} alt="Outfit" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
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
                {/* ---- Score + Style Name ---- */}
                <motion.div variants={childVariants}>
                  <div className="relative rounded-[1.5rem] border-[0.75px] border-border p-3">
                    <GlowingEffect spread={60} glow proximity={80} inactiveZone={0.01} borderWidth={3} />
                    <Card className="glass-card border-0 shadow-none">
                      <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                        <CircularScore score={data.style_score || null} />
                        <div className="flex-1 text-center md:text-left">
                          <h2 className="font-display text-2xl font-bold gold-text">{data.style_name}</h2>
                          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{data.audit}</p>
                          {data.seasonalFit && (
                            <Badge className="mt-2 gold-gradient text-primary-foreground">{data.seasonalFit}</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>



                {/* ---- 2‑col: Items + Strengths ---- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Items */}
                  <motion.div variants={childVariants}>
                    <Card className="glass-card h-full">
                      <CardHeader className="pb-2">
                        <CardTitle className="font-display flex items-center gap-2 text-base">
                          <div className="w-0.5 h-4 gold-gradient rounded-full mr-1" />
                          <Shirt className="w-5 h-5 text-primary" /> Items Detected
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <motion.ul
                          variants={container}
                          initial="hidden"
                          animate="show"
                          className="space-y-2"
                        >
                          {(data.items_detected || []).length > 0 ? (data.items_detected || []).map((item, i) => {
                              const itemColor = (data.actual_colors && data.actual_colors[i]) ? data.actual_colors[i] : null;
                              return (
                            <motion.li
                              key={i}
                              variants={itemAnim}
                              whileHover={{ scale: 1.02, x: 4 }}
                              className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/40 hover:bg-muted/30 transition-colors"
                            >
                              <div
                                className="w-5 h-5 rounded-full border-2 border-border/50 shadow-sm flex-shrink-0"
                                style={{ backgroundColor: itemColor || '#666' }}
                              />
                              <span className="text-sm text-foreground">{item}</span>
                            </motion.li>);
                            })
                          )) : (
                            <li className="flex items-center gap-3 p-3 rounded-xl bg-muted/10 border border-dashed border-border/30">
                              <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />
                              <span className="text-sm text-muted-foreground/50 italic">Awaiting analysis...</span>
                            </li>
                          )}
                        </motion.ul>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Strengths */}
                  <motion.div variants={childVariants}>
                    <Card className="glass-card h-full">
                      <CardHeader className="pb-2">
                        <CardTitle className="font-display flex items-center gap-2 text-base">
                          <div className="w-0.5 h-4 gold-gradient rounded-full mr-1" />
                          <ShieldCheck className="w-5 h-5 text-green-500" /> Strengths
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <motion.ul
                          variants={container}
                          initial="hidden"
                          animate="show"
                          className="space-y-2"
                        >
                          {(data.strengths || []).length > 0 ? (data.strengths || []).map((s, i) => (
                            <motion.li
                              key={i}
                              variants={itemAnim}
                              whileHover={{ scale: 1.02, x: 4 }}
                              className="flex items-center gap-3 p-3 rounded-xl border-l-2 border-green-500/40 bg-green-500/5"
                            >
                              <Star className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className="text-sm text-foreground">{s}</span>
                            </motion.li>
                          )) : (
                            <li className="flex items-center gap-3 p-3 rounded-xl border-l-2 border-muted/20 bg-muted/5">
                              <Star className="w-4 h-4 text-muted-foreground/20 flex-shrink-0" />
                              <span className="text-sm text-muted-foreground/50 italic">Awaiting analysis...</span>
                            </li>
                          )}
                        </motion.ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* ---- Pro Stylist Tweak ---- */}
                <ProStylistTweakBlock imagePreview={imagePreview} generationPrompt={data?.generation_prompt} tweakPlan={data?.tweak_plan} />

                {/* ---- Cosmic Audit ---- */}
                <motion.div variants={childVariants}>
                  <div className="relative rounded-[1.5rem] border-[0.75px] border-border p-3">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent blur-2xl pointer-events-none" />
                    <GlowingEffect spread={60} glow proximity={64} inactiveZone={0.01} borderWidth={3} />
                    <Card className="glass-card border-0 shadow-none relative overflow-hidden">
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-[80px]" />
                      <CardHeader className="pb-2">
                        <CardTitle className="font-display flex items-center gap-2 text-lg">
                          <div className="w-0.5 h-5 gold-gradient rounded-full mr-1" />
                          <TrendingUp className="w-5 h-5 text-primary" /> Cosmic Audit
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-foreground leading-relaxed italic border-l-2 border-primary/30 pl-4 py-2 bg-primary/5 rounded-r-xl">
                          &ldquo;{data.audit}&rdquo;
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <Badge variant="outline" className="text-xs bg-muted/30">
                            <Sparkles className="w-3 h-3 mr-1 text-primary" /> {data.tweak_plan}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
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
              /* ---- Empty state ---- */
              <motion.div variants={childVariants} className="text-center py-12">
                <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-xl text-foreground mb-2">Upload an outfit to begin</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  Tap the camera area on the left to upload a photo. The AI will analyze your style, colors, and fit.
                </p>
              </motion.div>
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
