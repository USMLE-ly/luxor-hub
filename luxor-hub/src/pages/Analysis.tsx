import React from "react";
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


/* ------------------------------------------------------------------ */
/*  Interactive Stylist Quiz — replaces Pro Tweak                      */
/* ------------------------------------------------------------------ */
function InteractiveStylistQuiz({ imagePreview, styleName, actualColors }: { imagePreview: string | null; styleName?: string; actualColors?: string[]; }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [chatHistory, setChatHistory] = useState<{role: string; text: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{image_url?: string; generated_prompt?: string; outfit_name?: string} | null>(null);
  const [nextQuestion, setNextQuestion] = useState("Tell me what kind of vibe you are going for today? (Casual, Business, Party, Date Night, or Sport)");
  const [quizComplete, setQuizComplete] = useState(false);

  const options = [
    ["Casual", "Business", "Party", "Date Night", "Sport"],
    ["Hot", "Mild", "Cold"],
    ["Neutrals", "Brights", "Pastels", "Dark"],
  ];

  const handleAnswer = async (answer: string) => {
    if (!imagePreview) { toast.error("Upload an image first"); return; }
    
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    setStep(step + 1);
    setLoading(true);

    try {
      let b64 = imagePreview;
      if (b64.startsWith("data:")) b64 = b64.split(",")[1];
      else if (b64.startsWith("http")) {
        const r = await fetch(b64);
        const blob = await r.blob();
        b64 = await new Promise((res) => {
          const fr = new FileReader();
          fr.onloadend = () => res((fr.result as string).split(",")[1]);
          fr.readAsDataURL(blob);
        });
      }

      const newHistory = [...chatHistory, { role: "user", text: answer }];
      setChatHistory(newHistory);

      const api = 'https://python--libyausmle.replit.app';
      const resp = await fetch(api + '/api/v1/stylist-explore', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_b64: b64,
          chat_history: newHistory,
          answer: answer,
          _t: Date.now(),
        }),
      });

      if (!resp.ok) throw new Error('Server error: ' + resp.status);
      const data = await resp.json();

      if (data.generated_prompt && data.image_url) {
        // Quiz complete!
        setResult({
          image_url: data.image_url,
          generated_prompt: data.generated_prompt,
          outfit_name: data.outfit_name || "New Style",
        });
        setQuizComplete(true);
        setNextQuestion("");
        toast.success('New outfit created! ✨');
      } else if (data.next_question) {
        setNextQuestion(data.next_question);
        setChatHistory([...newHistory, { role: "assistant", text: data.next_question }]);
      }
    } catch (e: any) {
      toast.error(e.message);
      setStep(step); // Revert step
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setStep(0);
    setAnswers([]);
    setChatHistory([]);
    setResult(null);
    setNextQuestion("Tell me what kind of vibe you are going for today? (Casual, Business, Party, Date Night, or Sport)");
    setQuizComplete(false);
  };

  const currentOptions = step < options.length ? options[step] : ["Yes", "No", "Try something different"];

  return (
    <motion.div variants={itemAnim}>
      <div className="relative rounded-[1.5rem] border-[0.75px] border-border p-3">
        <GlowingEffect spread={50} glow proximity={64} inactiveZone={0.01} borderWidth={3} />
        <Card className="glass-card border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="font-display flex items-center gap-2 text-lg">
              <div className="w-0.5 h-5 gold-gradient rounded-full mr-1" />
              <Sparkles className="w-5 h-5 text-primary" /> ✨ What other fashion would you like to explore?
            </CardTitle>
            <p className="text-sm text-muted-foreground">Answer a few questions and discover a completely new outfit.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {!quizComplete && !loading && step === 0 && !result && (
              <div className="text-center py-6">
                {imagePreview ? (
                  <div className="space-y-4">
                    <p className="text-sm text-foreground/80">{nextQuestion}</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {currentOptions.map((opt) => (
                        <Button key={opt} variant="outline" onClick={() => handleAnswer(opt)}
                          className="bg-white/10 backdrop-blur-md border-primary/30 hover:bg-primary/20 hover:border-primary/50 transition-all text-sm px-5 py-2.5">
                          {opt}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Camera className="w-12 h-12" />
                    <p className="text-sm">Upload an outfit photo above</p>
                  </div>
                )}
              </div>
            )}

            {!quizComplete && loading && (
              <div className="text-center py-10 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                <p className="font-display text-base">FASHION-OMEGA is crafting your look...</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {answers.map((a, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{a}</Badge>
                  ))}
                </div>
              </div>
            )}

            {!quizComplete && !loading && step > 0 && (
              <div className="text-center py-4 space-y-4">
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {answers.map((a, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{a}</Badge>
                  ))}
                </div>
                <p className="text-sm text-foreground/80">{nextQuestion}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {currentOptions.map((opt) => (
                    <Button key={opt} variant="outline" onClick={() => handleAnswer(opt)}
                      className="bg-white/10 backdrop-blur-md border-primary/30 hover:bg-primary/20 hover:border-primary/50 transition-all text-sm px-5 py-2.5">
                      {opt}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {quizComplete && result && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{result.outfit_name || "New Style"}</p>
                    <p className="text-sm text-muted-foreground mt-1">{result.generated_prompt}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> Your Current Style
                    </p>
                    <div className="rounded-2xl overflow-hidden border border-border shadow-lg bg-muted/20 aspect-[3/4]">
                      <img src={imagePreview!} alt="Current" className="w-full h-full object-cover" />
                    </div>
                    {styleName && (
                      <p className="text-xs text-muted-foreground text-center">{styleName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary" /> ✨ New Style Inspiration
                    </p>
                    <div className="rounded-2xl overflow-hidden border border-border shadow-lg bg-muted/20 aspect-[3/4]">
                      <img src={result.image_url} alt="New style" className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">
                    Based on your vibe: {answers.join(" → ")}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={resetQuiz} className="border-primary/30 hover:bg-primary/10">
                    <RefreshCw className="w-3 h-3 mr-1" /> Try Another Vibe
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

export default function Analysis() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [data, setData] = useState<OutfitData | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [analysisFailed, setAnalysisFailed] = useState(false);
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
    setAnalysisFailed(false);
    setLoading(true);
    try {
      // Compress first — phone photos are 3-12 MB, this shrinks them to ~100-200 KB
      const b64 = await compressImage(file);
      const apiUrl = 'https://python--libyausmle.replit.app';

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



                {/* ---- Cosmic Advice & Style Diagrams ---- */}
                <motion.div variants={childVariants}>
                  <div className="relative rounded-[1.5rem] border-[0.75px] border-border p-3">
                    <GlowingEffect spread={50} glow proximity={64} inactiveZone={0.01} borderWidth={3} />
                    <Card className="glass-card border-0 shadow-none">
                      <CardHeader className="pb-3">
                        <CardTitle className="font-display flex items-center gap-2 text-lg">
                          <div className="w-0.5 h-5 gold-gradient rounded-full mr-1" />
                          <Sparkles className="w-5 h-5 text-purple-400" /> Cosmic Advice & Style Diagrams
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          AI-powered recommendations to elevate your look.
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        {/* Visual Flow Diagram */}
                        <motion.div
                          variants={container}
                          initial="hidden"
                          animate="show"
                          className="space-y-3"
                        >
                          {/* Current State Pill */}
                          <motion.div variants={itemAnim} className="relative">
                            <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />
                            <div className="ml-8 pl-4 py-3 rounded-xl bg-muted/20 border border-border/40">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Current Look</span>
                                <Badge variant="outline" className="text-[10px] bg-primary/5">{data?.style_name || "Your Style"}</Badge>
                              </div>
                              <p className="text-sm text-foreground/80">
                                {data?.audit || "Upload a photo to get style advice."}
                              </p>
                            </div>
                          </motion.div>

                          {/* Action Arrow */}
                          <motion.div variants={itemAnim} className="flex justify-center py-1">
                            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                              <Sparkles className="w-3 h-3" /> Apply This Tweak
                            </div>
                          </motion.div>

                          {/* Tweak Plan Pill */}
                          <motion.div variants={itemAnim} className="relative">
                            <div className="ml-8 pl-4 py-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Recommended Upgrade</span>
                                <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/30">AI Suggestion</Badge>
                              </div>
                              <p className="text-sm text-foreground/80">
                                {data?.tweak_plan || "Complete the analysis to see a personalized upgrade."}
                              </p>
                            </div>
                          </motion.div>
                        </motion.div>

                        {/* Items Detected Flow */}
                        {data?.items_detected && data.items_detected.length > 0 && (
                          <motion.div
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="pt-2 border-t border-border/30"
                          >
                            <motion.p variants={itemAnim} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                              <Eye className="w-3 h-3" /> Items Detected
                            </motion.p>
                            <motion.div variants={itemAnim} className="flex flex-wrap gap-2">
                              {(data.actual_colors && data.actual_colors.length > 0)
                              ? data.items_detected.map((item, idx) => {
                                  const colorMap = {
                                    "Pink": "bg-pink-500", "Red": "bg-red-500", "Blue": "bg-blue-500",
                                    "Black": "bg-gray-900", "White": "bg-white border border-border",
                                    "Cream": "bg-yellow-100", "Green": "bg-green-500", "Brown": "bg-amber-800",
                                    "Gold": "bg-yellow-500", "Silver": "bg-gray-300", "Navy": "bg-blue-900",
                                    "Tan": "bg-amber-200", "Beige": "bg-amber-100", "Yellow": "bg-yellow-400",
                                    "Grey": "bg-gray-400", "Orange": "bg-orange-500",
                                  };
                                  const colorName = data.actual_colors[idx] || "";
                                  const dotClass = colorName ? (colorMap[colorName] || "bg-gray-400") : "bg-gray-400";
                                  return (
                                    <Badge key={idx} variant="outline" className="text-xs border-primary/30 bg-primary/5 backdrop-blur-sm flex items-center gap-1.5">
                                      <span className={"w-2 h-2 rounded-full inline-block " + dotClass} />
                                      {item}
                                    </Badge>
                                  );
                                })
                              : data.items_detected.map((item, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs border-primary/30 bg-primary/5 backdrop-blur-sm">
                                    {item}
                                  </Badge>
                                ))}
                            </motion.div>
                          </motion.div>
                        )}

                        {/* Colors Palette */}
                        {data?.actual_colors && data.actual_colors.length > 0 && (
                          <motion.div
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="pt-2 border-t border-border/30"
                          >
                            <motion.p variants={itemAnim} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                              <Palette className="w-3 h-3" /> Color Palette Detected
                            </motion.p>
                            <motion.div variants={itemAnim} className="flex flex-wrap gap-2">
                              {data.actual_colors.map((color, idx) => {
                                const colorMap = {
                                  "Pink": "bg-pink-500", "Red": "bg-red-500", "Blue": "bg-blue-500",
                                  "Black": "bg-gray-900", "White": "bg-white border border-border",
                                  "Cream": "bg-yellow-100", "Green": "bg-green-500", "Brown": "bg-amber-800",
                                  "Gold": "bg-yellow-500", "Silver": "bg-gray-300", "Navy": "bg-blue-900",
                                  "Tan": "bg-amber-200", "Beige": "bg-amber-100", "Yellow": "bg-yellow-400",
                                  "Grey": "bg-gray-400", "Orange": "bg-orange-500",
                                };
                                const bgClass = colorMap[color] || "bg-muted";
                                return (
                                  <div key={idx} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted/20 border border-border/40">
                                    <div className={`w-3 h-3 rounded-full ${bgClass}`} />
                                    <span className="text-xs text-foreground/70">{color}</span>
                                  </div>
                                );
                              })}
                            </motion.div>
                          </motion.div>
                        )}

                        {/* Strengths Flow */}
                        {data?.strengths && data.strengths.length > 0 && (
                          <motion.div
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="pt-2 border-t border-border/30"
                          >
                            <motion.p variants={itemAnim} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                              <ShieldCheck className="w-3 h-3" /> Style Strengths
                            </motion.p>
                            <motion.div variants={itemAnim} className="space-y-2">
                              {data.strengths.map((s, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <div className="w-5 h-5 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                  </div>
                                  <p className="text-sm text-foreground/70">{s}</p>
                                </div>
                              ))}
                            </motion.div>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>

                {/* ---- Interactive Stylist Quiz ---- */}
                <InteractiveStylistQuiz imagePreview={imagePreview} styleName={data?.style_name} actualColors={data?.actual_colors} />

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
