import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Upload, Camera, Sparkles, TrendingUp, Palette, ShieldCheck, AlertTriangle,
  Star, Shirt, Loader2, History, Save, Trash2, Share2, X,
  Twitter, Link, Check, Download, Clock, ArrowLeftRight, Users, Search, ExternalLink, ShoppingBag, RefreshCw
} from "lucide-react";
import { compressImage, formatFileSize } from "@/lib/imageUtils";
import { PrivacyNotice } from "@/components/app/PrivacyNotice";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { StyleComparison } from "@/components/app/StyleComparison";
import { motion, AnimatePresence } from "framer-motion";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { RainbowButton } from "@/components/ui/rainbow-button";

interface OutfitAnalysisData {
  overallStyle: string;
  styleScore: number;
  summary: string;
  occasionRatings: { occasion: string; score: number; reason: string }[];
  detectedItems: { name: string; category: string; color: string; style: string }[];
  colorPalette: { colors: string[]; harmony: string; rating: string };
  strengths: string[];
  improvements: { suggestion: string; reason: string; priority: string }[];
  seasonalFit: string;
  bodyTypeNotes: string;
}

interface SavedAnalysis {
  id: string;
  image_url: string;
  overall_style: string;
  style_score: number;
  summary: string;
  occasion_ratings: any;
  detected_items: any;
  color_palette: any;
  strengths: any;
  improvements: any;
  seasonal_fit: string;
  body_type_notes: string;
  created_at: string;
}

function savedToAnalysis(s: SavedAnalysis): OutfitAnalysisData {
  return {
    overallStyle: s.overall_style,
    styleScore: s.style_score,
    summary: s.summary,
    occasionRatings: s.occasion_ratings as any,
    detectedItems: s.detected_items as any,
    colorPalette: s.color_palette as any,
    strengths: s.strengths as any,
    improvements: s.improvements as any,
    seasonalFit: s.seasonal_fit,
    bodyTypeNotes: s.body_type_notes,
  };
}

export default function OutfitAnalysis() {
  const { user } = useAuth();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<OutfitAnalysisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<SavedAnalysis[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPostingToFeed, setIsPostingToFeed] = useState(false);
  const [styleFilter, setStyleFilter] = useState("");
  const [minScore, setMinScore] = useState("");
  const [maxScore, setMaxScore] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredHistory = history.filter((h) => {
    if (styleFilter && !h.overall_style.toLowerCase().includes(styleFilter.toLowerCase())) return false;
    if (minScore && h.style_score < Number(minScore)) return false;
    if (maxScore && h.style_score > Number(maxScore)) return false;
    if (dateFilter !== "all") {
      const days = dateFilter === "7d" ? 7 : dateFilter === "30d" ? 30 : 90;
      if (Date.now() - new Date(h.created_at).getTime() > days * 86400000) return false;
    }
    return true;
  });

  const fetchHistory = async () => {
    if (!user) return;
    setLoadingHistory(true);
    const { data } = await supabase
      .from("outfit_analyses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setHistory((data as any[]) || []);
    setLoadingHistory(false);
  };

  useEffect(() => { fetchHistory(); }, [user]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }
    // Compress before storing
    const compressed = await compressImage(file);
    if (compressed.size < file.size) {
      toast.info(`Compressed: ${formatFileSize(file.size)} → ${formatFileSize(compressed.size)}`);
    }
    setImageFile(compressed);
    setAnalysis(null);
    setSaved(false);
    setImageUrl(null);
    setAnalysisError(null);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(compressed);
  };

  const handleAnalyze = async () => {
    if (!imageFile || !user) return;
    setIsAnalyzing(true);
    setSaved(false);
    setAnalysisError(null);
    try {
      const ext = imageFile.name.split(".").pop();
      const path = `${user.id}/analysis-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("clothing-photos")
        .upload(path, imageFile);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("clothing-photos")
        .getPublicUrl(path);
      setImageUrl(urlData.publicUrl);

      const { data, error } = await supabase.functions.invoke("analyze-outfit", {
        body: { imageUrl: urlData.publicUrl },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setAnalysis(data);
      toast.success("Outfit analyzed!");
    } catch (err: any) {
      console.error(err);
      const msg = err.message || "Analysis failed";
      setAnalysisError(msg);
      toast.error(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const checkAndUnlockBadges = async () => {
    if (!user) return;
    try {
      const BADGE_DEFINITIONS = [
        { key: "first_analysis", name: "First Look", description: "Complete your first outfit analysis", icon: "eye", threshold: 1, type: "analyses_count" },
        { key: "5_analyses", name: "Style Explorer", description: "Complete 5 outfit analyses", icon: "target", threshold: 5, type: "analyses_count" },
        { key: "10_analyses", name: "Fashion Critic", description: "Complete 10 outfit analyses", icon: "flame", threshold: 10, type: "analyses_count" },
        { key: "25_analyses", name: "Style Master", description: "Complete 25 outfit analyses", icon: "crown", threshold: 25, type: "analyses_count" },
        { key: "score_70", name: "Rising Star", description: "Achieve an average score of 70+", icon: "star", threshold: 70, type: "avg_score" },
        { key: "score_80", name: "Style Icon", description: "Achieve an average score of 80+", icon: "star", threshold: 80, type: "avg_score" },
        { key: "score_90", name: "Fashion Legend", description: "Achieve an average score of 90+", icon: "zap", threshold: 90, type: "avg_score" },
        { key: "perfect_score", name: "Perfection", description: "Get a perfect 100 on any analysis", icon: "award", threshold: 100, type: "best_score" },
        { key: "closet_10", name: "Wardrobe Builder", description: "Add 10 items to your closet", icon: "target", threshold: 10, type: "closet_count" },
      ];

      const [analysesRes, closetRes, existingRes] = await Promise.all([
        supabase.from("outfit_analyses").select("style_score").eq("user_id", user.id),
        supabase.from("clothing_items").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("user_badges").select("badge_key").eq("user_id", user.id),
      ]);

      const scores = (analysesRes.data || []).map((a: any) => Number(a.style_score));
      const analysesCount = scores.length;
      const avgScore = analysesCount > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / analysesCount : 0;
      const bestScore = analysesCount > 0 ? Math.max(...scores) : 0;
      const closetCount = closetRes.count || 0;

      const stats: Record<string, number> = {
        analyses_count: analysesCount,
        avg_score: Math.round(avgScore),
        best_score: bestScore,
        closet_count: closetCount,
      };

      const existingKeys = new Set((existingRes.data || []).map((b: any) => b.badge_key));

      for (const badge of BADGE_DEFINITIONS) {
        if (existingKeys.has(badge.key)) continue;
        const value = stats[badge.type] || 0;
        if (value >= badge.threshold) {
          const { error } = await supabase.from("user_badges").insert({
            user_id: user.id,
            badge_key: badge.key,
            badge_name: badge.name,
            badge_description: badge.description,
            badge_icon: badge.icon,
          });
          if (!error) {
            toast.success(`🏅 Badge Unlocked: ${badge.name}!`, {
              description: badge.description,
              duration: 5000,
            });
          }
        }
      }
    } catch (err) {
      console.error("Badge check error:", err);
    }
  };

  const handleSave = async () => {
    if (!analysis || !user || !imageUrl) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from("outfit_analyses").insert({
        user_id: user.id,
        image_url: imageUrl,
        overall_style: analysis.overallStyle,
        style_score: analysis.styleScore,
        summary: analysis.summary,
        occasion_ratings: analysis.occasionRatings as any,
        detected_items: analysis.detectedItems as any,
        color_palette: analysis.colorPalette as any,
        strengths: analysis.strengths as any,
        improvements: analysis.improvements as any,
        seasonal_fit: analysis.seasonalFit,
        body_type_notes: analysis.bodyTypeNotes,
      });
      if (error) throw error;
      setSaved(true);
      toast.success("Analysis saved!");
      fetchHistory();
      checkAndUnlockBadges();
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("outfit_analyses").delete().eq("id", id);
    setHistory((prev) => prev.filter((h) => h.id !== id));
    toast.success("Analysis deleted");
  };

  const loadSavedAnalysis = (s: SavedAnalysis) => {
    setAnalysis(savedToAnalysis(s));
    setImagePreview(s.image_url);
    setImageUrl(s.image_url);
    setSaved(true);
    setImageFile(null);
  };

  const shareText = analysis
    ? `My outfit scored ${analysis.styleScore}/100 — "${analysis.overallStyle}" ✨ Analyzed by AURELIA AI\n${analysis.summary}`
    : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${shareText}\n\n${window.location.origin}/outfit-analysis`);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank", "noopener,noreferrer");
  };

  const handlePostToFeed = async () => {
    if (!analysis || !user || !imageUrl) return;
    setIsPostingToFeed(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .single();

      const { error } = await supabase.from("user_looks").insert({
        user_id: user.id,
        title: `${analysis.overallStyle} — ${analysis.styleScore}/100`,
        description: `AI Analysis: ${analysis.summary}`,
        items: analysis.detectedItems.map((i: any) => `${i.name} (${i.color})`),
        occasion: analysis.occasionRatings?.[0]?.occasion || null,
        mood: analysis.seasonalFit || null,
        photo_url: imageUrl,
        is_public: true,
        author_name: profile?.display_name || user.email || "Stylist",
      });
      if (error) throw error;
      toast.success("Posted to community feed! 🎉");
    } catch (err: any) {
      toast.error(err.message || "Failed to post");
    } finally {
      setIsPostingToFeed(false);
    }
  };

  const handleDownloadCard = () => {
    if (!analysis) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = 600; canvas.height = 400;
    const grad = ctx.createLinearGradient(0, 0, 600, 400);
    grad.addColorStop(0, "#1a1a2e"); grad.addColorStop(1, "#16213e");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 600, 400);

    const goldGrad = ctx.createLinearGradient(40, 40, 200, 40);
    goldGrad.addColorStop(0, "#C6A55C"); goldGrad.addColorStop(1, "#E8D5A3");
    ctx.fillStyle = goldGrad; ctx.fillRect(40, 40, 80, 4);

    ctx.fillStyle = "#E8D5A3"; ctx.font = "bold 28px serif";
    ctx.fillText(analysis.overallStyle, 40, 90);
    ctx.fillStyle = "#a0a0b0"; ctx.font = "14px sans-serif";
    ctx.fillText(analysis.summary.slice(0, 60), 40, 120);

    ctx.fillStyle = "#C6A55C"; ctx.font = "bold 48px serif";
    ctx.fillText(`${analysis.styleScore}`, 450, 90);
    ctx.fillStyle = "#a0a0b0"; ctx.font = "12px sans-serif";
    ctx.fillText("/100", 510, 90);

    analysis.occasionRatings.slice(0, 5).forEach((r, i) => {
      ctx.fillStyle = "#ffffff"; ctx.font = "14px sans-serif";
      ctx.fillText(`${r.occasion}: ${r.score}%`, 50, 165 + i * 28);
    });

    ctx.fillStyle = "#C6A55C"; ctx.font = "bold 18px serif";
    ctx.fillText("AURELIA", 40, 375);
    ctx.fillStyle = "#606070"; ctx.font = "12px sans-serif";
    ctx.fillText("AI Outfit Analysis", 140, 375);

    const link = document.createElement("a");
    link.download = `aurelia-analysis-${analysis.styleScore}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("Analysis card downloaded!");
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-400";
  };

  const getPriorityColor = (p: string) => {
    if (p === "high") return "bg-destructive/15 text-destructive border-destructive/30";
    if (p === "medium") return "bg-yellow-500/15 text-yellow-600 border-yellow-500/30";
    return "bg-muted text-muted-foreground border-border";
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 overflow-x-hidden">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="absolute -top-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-[60px]" />
          <h1 className="font-display text-4xl font-bold text-foreground relative">
            AI Outfit <span className="gold-text">Analysis</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Upload a photo and get comprehensive styling feedback powered by AI</p>
        </motion.div>

        <Tabs defaultValue="analyze" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 backdrop-blur-sm">
            <TabsTrigger value="analyze" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Sparkles className="w-4 h-4" /> Analyze
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" onClick={fetchHistory}>
              <History className="w-4 h-4" /> History
            </TabsTrigger>
            <TabsTrigger value="compare" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" onClick={fetchHistory}>
              <ArrowLeftRight className="w-4 h-4" /> Compare
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="space-y-6">
            {/* Upload Section with GlowingEffect */}
            <div className="relative rounded-[1.5rem] border-[0.75px] border-border p-3">
              <GlowingEffect
                spread={40}
                glow={true}
                disabled={false}
                proximity={64}
                inactiveZone={0.01}
                borderWidth={3}
              />
              <Card className="glass-card overflow-hidden border-0 shadow-none">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                      className="relative w-full md:w-80 aspect-[3/4] rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer overflow-hidden bg-muted/30 flex-shrink-0"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {imagePreview ? (
                        <img src={imagePreview} alt="Outfit" className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
                          >
                            <Camera className="w-8 h-8 text-primary" />
                          </motion.div>
                          <p className="font-medium text-foreground">Upload Outfit Photo</p>
                          <p className="text-sm">JPG, PNG up to 10MB</p>
                        </div>
                      )}
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                    </motion.div>

                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <h3 className="font-display text-lg font-semibold text-foreground">How it works</h3>
                        <div className="space-y-3">
                          {[
                            { icon: Upload, text: "Upload a full-body outfit photo", color: "text-primary" },
                            { icon: Sparkles, text: "AI analyzes style, colors, fit & occasion", color: "text-primary" },
                            { icon: TrendingUp, text: "Get detailed scores and improvement tips", color: "text-primary" },
                          ].map((step, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.15 }}
                              className="flex items-center gap-3 text-sm text-muted-foreground"
                            >
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <step.icon className={`w-4 h-4 ${step.color}`} />
                              </div>
                              <span>{step.text}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    {isAnalyzing ? (
                        <div className="space-y-4 w-full">
                          <div className="space-y-3">
                            {["Uploading image...", "Analyzing style & colors...", "Generating insights..."].map((step, i) => (
                              <motion.div
                                key={step}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 1.2 }}
                                className="flex items-center gap-3"
                              >
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: i * 1.2 + 0.3 }}
                                  className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center"
                                >
                                  <Sparkles className="w-3 h-3 text-primary" />
                                </motion.div>
                                <span className="text-sm text-muted-foreground">{step}</span>
                              </motion.div>
                            ))}
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <motion.div
                              className="h-full gold-gradient rounded-full"
                              initial={{ width: "0%" }}
                              animate={{ width: "85%" }}
                              transition={{ duration: 8, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                      ) : (
                        <RainbowButton
                          onClick={handleAnalyze}
                          disabled={!imageFile}
                          className="w-full md:w-auto px-8 font-semibold"
                        >
                          <Sparkles className="w-5 h-5 mr-2" />Analyze My Outfit
                        </RainbowButton>
                      )}
                      {analysisError && !isAnalyzing && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                          <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                          <span className="text-sm text-destructive flex-1">{analysisError}</span>
                          <Button variant="outline" size="sm" onClick={handleAnalyze} className="shrink-0 gap-1">
                            <RefreshCw className="w-3 h-3" /> Retry
                          </Button>
                        </div>
                      )}
                      <PrivacyNotice />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            <AnimatePresence>
              {analysis && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  {/* Action bar */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-3 justify-end flex-wrap"
                  >
                    {!saved && (
                      <Button onClick={handleSave} disabled={isSaving} variant="outline" className="border-primary/30 hover:bg-primary/10">
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        {saved ? "Saved!" : "Save Analysis"}
                      </Button>
                    )}
                    {saved && <Badge className="bg-green-500/15 text-green-500 border-green-500/30">✓ Saved</Badge>}
                    <Button onClick={handlePostToFeed} disabled={isPostingToFeed} variant="outline" className="border-primary/30 hover:bg-primary/10">
                      {isPostingToFeed ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Users className="w-4 h-4 mr-2" />}
                      Post to Feed
                    </Button>
                    <Button onClick={() => setShareOpen(true)} variant="outline" className="border-primary/30 hover:bg-primary/10">
                      <Share2 className="w-4 h-4 mr-2" /> Share
                    </Button>
                  </motion.div>

                  <AnalysisResults analysis={analysis} getScoreColor={getScoreColor} getPriorityColor={getPriorityColor} />
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-end p-4 rounded-xl bg-muted/30 backdrop-blur-sm border border-border">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Style</label>
                <input
                  type="text"
                  placeholder="Filter by style..."
                  value={styleFilter}
                  onChange={(e) => setStyleFilter(e.target.value)}
                  className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-40"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Min Score</label>
                <input type="number" min={0} max={100} placeholder="0" value={minScore}
                  onChange={(e) => setMinScore(e.target.value)}
                  className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Max Score</label>
                <input type="number" min={0} max={100} placeholder="100" value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                  className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Date</label>
                <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
                  className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="all">All time</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>
              {(styleFilter || minScore || maxScore || dateFilter !== "all") && (
                <Button variant="ghost" size="sm" onClick={() => { setStyleFilter(""); setMinScore(""); setMaxScore(""); setDateFilter("all"); }}>
                  Clear
                </Button>
              )}
            </div>

            {loadingHistory ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-16">
                <History className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  {history.length === 0 ? "No saved analyses yet. Analyze an outfit and save it!" : "No analyses match your filters."}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredHistory.map((h, i) => (
                  <motion.div
                    key={h.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative rounded-[1.25rem] border-[0.75px] border-border p-2 cursor-pointer group"
                    onClick={() => loadSavedAnalysis(h)}
                  >
                    <div className="relative flex gap-4 p-4 rounded-xl bg-background overflow-hidden">
                      <img src={h.image_url} alt={h.overall_style} className="w-20 h-28 object-cover rounded-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-display font-bold text-foreground truncate">{h.overall_style}</h4>
                          <span className={`text-lg font-bold ${getScoreColor(h.style_score)}`}>{h.style_score}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{h.summary}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {timeAgo(h.created_at)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => { e.stopPropagation(); handleDelete(h.id); }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="compare">
            <StyleComparison history={history} />
          </TabsContent>
        </Tabs>

        {/* Share Modal */}
        <AnimatePresence>
          {shareOpen && analysis && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
              onClick={() => setShareOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md glass rounded-2xl p-6 space-y-4 border border-primary/20"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-display text-lg font-bold text-foreground">Share Analysis</h4>
                  <button onClick={() => setShareOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="rounded-xl p-4" style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)" }}>
                  <div className="h-1 w-16 rounded-full mb-4" style={{ background: "linear-gradient(90deg, #C6A55C, #E8D5A3)" }} />
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-display text-xl font-bold" style={{ color: "#E8D5A3" }}>{analysis.overallStyle}</h5>
                    <span className="text-2xl font-bold" style={{ color: "#C6A55C" }}>{analysis.styleScore}<span className="text-sm text-gray-400">/100</span></span>
                  </div>
                  <p className="text-xs mb-3" style={{ color: "#a0a0b0" }}>{analysis.summary.slice(0, 100)}...</p>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-bold" style={{ color: "#C6A55C" }}>AURELIA</span>
                    <span className="text-[10px]" style={{ color: "#606070" }}>AI Outfit Analysis</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <Button variant="outline" className="border-border flex-col h-auto py-3 hover:bg-primary/10" onClick={() => { if (navigator.share) { navigator.share({ title: `AURELIA: ${analysis.overallStyle}`, text: shareText }); } else { handleCopyLink(); } }}>
                    <Share2 className="h-4 w-4 mb-1" /><span className="text-[10px]">Share</span>
                  </Button>
                  <Button variant="outline" className="border-border flex-col h-auto py-3 hover:bg-primary/10" onClick={handleShareTwitter}>
                    <Twitter className="h-4 w-4 mb-1" /><span className="text-[10px]">X</span>
                  </Button>
                  <Button variant="outline" className="border-border flex-col h-auto py-3 hover:bg-primary/10" onClick={handleDownloadCard}>
                    <Download className="h-4 w-4 mb-1" /><span className="text-[10px]">Download</span>
                  </Button>
                  <Button variant="outline" className="border-border flex-col h-auto py-3 hover:bg-primary/10" onClick={handleCopyLink}>
                    {copied ? <Check className="h-4 w-4 mb-1 text-primary" /> : <Link className="h-4 w-4 mb-1" />}
                    <span className="text-[10px]">{copied ? "Copied!" : "Copy"}</span>
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}

// Animated counter hook
function useAnimatedCounter(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setValue(Math.round(target * progress));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

// Custom radar tooltip with animated counter
function RadarTooltipContent({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const { occasion, score } = payload[0].payload;
  return (
    <div className="glass rounded-lg px-3 py-2 border border-border shadow-lg">
      <p className="text-xs text-muted-foreground font-sans">{occasion}</p>
      <p className="text-lg font-bold text-primary">{score}%</p>
    </div>
  );
}

// Chart-based visual results component
function AnalysisResults({ analysis, getScoreColor, getPriorityColor }: {
  analysis: OutfitAnalysisData;
  getScoreColor: (s: number) => string;
  getPriorityColor: (p: string) => string;
}) {
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [findingSimilar, setFindingSimilar] = useState<number | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Record<number, any[]>>({});

  const handleFindSimilar = async (item: any, index: number) => {
    setFindingSimilar(index);
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/find-similar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          itemName: item.name,
          itemCategory: item.category,
          itemColor: item.color,
          itemStyle: item.style,
        }),
      });
      if (!resp.ok) throw new Error("Failed to find similar items");
      const data = await resp.json();
      setSimilarProducts(prev => ({ ...prev, [index]: data.products || [] }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to find similar items");
    } finally {
      setFindingSimilar(null);
    }
  };

  const radarData = analysis.occasionRatings.map((r) => ({
    occasion: r.occasion,
    score: r.score,
    fullMark: 100,
  }));

  const priorityValue = (p: string) => (p === "high" ? 3 : p === "medium" ? 2 : 1);
  const improvementData = analysis.improvements.map((imp) => ({
    name: imp.suggestion,
    fullSuggestion: imp.suggestion,
    reason: imp.reason,
    priority: priorityValue(imp.priority),
    label: imp.priority,
  }));

  const priorityBarColor = (p: number) => {
    if (p === 3) return "hsl(var(--destructive))";
    if (p === 2) return "hsl(45 93% 47%)";
    return "hsl(var(--muted-foreground))";
  };

  const strengthChips = analysis.strengths;

  const animatedScore = useAnimatedCounter(analysis.styleScore, 1200);

  return (
    <>
      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-[1.5rem] border-[0.75px] border-border p-3"
      >
        <GlowingEffect spread={60} glow={true} disabled={false} proximity={80} inactiveZone={0.01} borderWidth={3} />
        <Card className="glass-card overflow-hidden border-0 shadow-none">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative w-28 h-28 flex-shrink-0">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                  <motion.circle
                    cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round"
                    initial={{ strokeDasharray: "0 264" }}
                    animate={{ strokeDasharray: `${(analysis.styleScore / 100) * 264} 264` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-foreground">{animatedScore}</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="font-display text-2xl font-bold text-foreground">{analysis.overallStyle}</h2>
                  <Badge className="gold-gradient text-primary-foreground">{analysis.seasonalFit}</Badge>
                </div>
                <p className="text-muted-foreground leading-relaxed text-sm">{analysis.summary}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Occasion Radar + Color Palette row */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-display flex items-center gap-2 text-foreground text-base">
                <Star className="w-5 h-5 text-primary" /> Occasion Suitability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="occasion" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.25}
                    strokeWidth={2}
                    animationDuration={1200}
                  />
                  <RechartsTooltip content={<RadarTooltipContent />} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-display flex items-center gap-2 text-foreground text-base">
                <Palette className="w-5 h-5 text-primary" /> Color Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                {analysis.colorPalette.colors.map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1, type: "spring" }}
                    className="flex-1 aspect-square rounded-lg border border-border shadow-sm hover:scale-110 transition-transform cursor-pointer"
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary">{analysis.colorPalette.harmony}</Badge>
                <Badge variant="outline">{analysis.colorPalette.rating}</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detected Items + Strengths + Improvements row */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="glass-card h-full">
            <CardHeader className="pb-2">
              <CardTitle className="font-display flex items-center gap-2 text-foreground text-base">
                <Shirt className="w-5 h-5 text-primary" /> Detected Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {analysis.detectedItems.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setExpandedItem(expandedItem === i ? null : i)}
                >
                  <div className="flex items-center gap-2 p-2">
                    <div className="w-3 h-3 rounded-full border border-border flex-shrink-0" style={{ backgroundColor: item.color.startsWith("#") ? item.color : undefined }} />
                    <span className="text-sm text-foreground flex-1">{item.name}</span>
                    <span className="text-[10px] text-muted-foreground">{item.category}</span>
                  </div>
                  <AnimatePresence>
                    {expandedItem === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                          <div className="px-3 pb-3 pt-1 space-y-1.5 border-t border-border/30">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded border border-border" style={{ backgroundColor: item.color.startsWith("#") ? item.color : undefined }} />
                              <span className="text-xs text-muted-foreground">Color: <span className="text-foreground">{item.color}</span></span>
                            </div>
                            <p className="text-xs text-muted-foreground">Style: <span className="text-foreground">{item.style}</span></p>
                            <Badge variant="secondary" className="text-[10px]">{item.category}</Badge>
                            
                            {/* Find Similar Button */}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleFindSimilar(item, i); }}
                              disabled={findingSimilar === i}
                              className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors disabled:opacity-50"
                            >
                              {findingSimilar === i ? (
                                <><Loader2 className="w-3 h-3 animate-spin" /> Finding similar...</>
                              ) : (
                                <><Search className="w-3 h-3" /> Find Similar Online</>
                              )}
                            </button>

                            {/* Similar Products */}
                            {similarProducts[i] && similarProducts[i].length > 0 && (
                              <div className="mt-2 space-y-2">
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Similar items found:</p>
                                {similarProducts[i].map((product: any, pi: number) => (
                                  <a
                                    key={pi}
                                    href={product.shopUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border hover:border-primary/40 transition-colors"
                                  >
                                    <ShoppingBag className="w-4 h-4 text-primary flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[11px] font-medium text-foreground truncate">{product.name}</p>
                                      <p className="text-[10px] text-muted-foreground">{product.brand} · {product.price}</p>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      <span className="text-[10px] font-bold text-primary">{product.similarity}%</span>
                                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                                    </div>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="glass-card h-full">
            <CardHeader className="pb-2">
              <CardTitle className="font-display flex items-center gap-2 text-foreground text-base">
                <ShieldCheck className="w-5 h-5 text-green-500" /> Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {strengthChips.map((chip, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 text-xs py-1">
                      ✓ {chip}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="glass-card h-full">
            <CardHeader className="pb-2">
              <CardTitle className="font-display flex items-center gap-2 text-foreground text-base">
                <AlertTriangle className="w-5 h-5 text-yellow-500" /> Improvements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.improvements.map((imp, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-2 p-2 rounded-lg bg-muted/30"
                  >
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: imp.priority === "high" ? "hsl(var(--destructive))" : imp.priority === "medium" ? "hsl(45 93% 47%)" : "hsl(var(--muted-foreground))" }}
                    />
                    <div>
                      <p className="text-sm text-foreground">{imp.suggestion}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{imp.reason}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}
