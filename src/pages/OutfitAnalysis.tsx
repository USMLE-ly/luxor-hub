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
  ChevronRight, Star, Shirt, Loader2, History, Save, Trash2, Share2, X,
  Twitter, Link, Check, Download, Clock, ArrowLeftRight, Users
} from "lucide-react";
import { StyleComparison } from "@/components/app/StyleComparison";
import { motion, AnimatePresence } from "framer-motion";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }
    setImageFile(file);
    setAnalysis(null);
    setSaved(false);
    setImageUrl(null);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imageFile || !user) return;
    setIsAnalyzing(true);
    setSaved(false);
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
      toast.error(err.message || "Analysis failed");
    } finally {
      setIsAnalyzing(false);
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

  // Share helpers
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
      // Get display name
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
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            AI Outfit <span className="gold-text">Analysis</span>
          </h1>
          <p className="text-muted-foreground mt-1">Upload a photo and get comprehensive styling feedback</p>
        </div>

        <Tabs defaultValue="analyze" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="analyze" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Analyze
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2" onClick={fetchHistory}>
              <History className="w-4 h-4" /> History
            </TabsTrigger>
            <TabsTrigger value="compare" className="flex items-center gap-2" onClick={fetchHistory}>
              <ArrowLeftRight className="w-4 h-4" /> Compare
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="space-y-6">
            {/* Upload Section */}
            <Card className="glass-card overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div
                    className="relative w-full md:w-80 aspect-[3/4] rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer overflow-hidden bg-muted/30 flex-shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Outfit" className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <Camera className="w-8 h-8 text-primary" />
                        </div>
                        <p className="font-medium text-foreground">Upload Outfit Photo</p>
                        <p className="text-sm">JPG, PNG up to 10MB</p>
                      </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-display text-lg font-semibold text-foreground">How it works</h3>
                      <div className="space-y-3">
                        {[
                          { icon: Upload, text: "Upload a full-body outfit photo" },
                          { icon: Sparkles, text: "AI analyzes style, colors, fit & occasion" },
                          { icon: TrendingUp, text: "Get detailed scores and improvement tips" },
                        ].map((step, i) => (
                          <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <step.icon className="w-4 h-4 text-primary" />
                            </div>
                            <span>{step.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={handleAnalyze}
                      disabled={!imageFile || isAnalyzing}
                      className="gold-gradient text-primary-foreground font-semibold w-full md:w-auto"
                      size="lg"
                    >
                      {isAnalyzing ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Analyzing...</>
                      ) : (
                        <><Sparkles className="w-5 h-5 mr-2" />Analyze My Outfit</>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                  <div className="flex items-center gap-3 justify-end flex-wrap">
                    {!saved && (
                      <Button onClick={handleSave} disabled={isSaving} variant="outline" className="border-primary/30">
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        {saved ? "Saved!" : "Save Analysis"}
                      </Button>
                    )}
                    {saved && <Badge className="bg-green-500/15 text-green-500 border-green-500/30">✓ Saved</Badge>}
                    <Button onClick={handlePostToFeed} disabled={isPostingToFeed} variant="outline" className="border-primary/30">
                      {isPostingToFeed ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Users className="w-4 h-4 mr-2" />}
                      Post to Feed
                    </Button>
                    <Button onClick={() => setShareOpen(true)} variant="outline" className="border-primary/30">
                      <Share2 className="w-4 h-4 mr-2" /> Share
                    </Button>
                  </div>

                  <AnalysisResults analysis={analysis} getScoreColor={getScoreColor} getPriorityColor={getPriorityColor} />
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {loadingHistory ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-16">
                <History className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No saved analyses yet. Analyze an outfit and save it!</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {history.map((h) => (
                  <motion.div
                    key={h.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-xl overflow-hidden cursor-pointer group"
                    onClick={() => loadSavedAnalysis(h)}
                  >
                    <div className="flex gap-4 p-4">
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
                className="w-full max-w-md glass rounded-xl p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-display text-lg font-bold text-foreground">Share Analysis</h4>
                  <button onClick={() => setShareOpen(false)} className="text-muted-foreground hover:text-foreground">
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
                  <Button variant="outline" className="border-border flex-col h-auto py-3" onClick={() => { if (navigator.share) { navigator.share({ title: `AURELIA: ${analysis.overallStyle}`, text: shareText }); } else { handleCopyLink(); } }}>
                    <Share2 className="h-4 w-4 mb-1" /><span className="text-[10px]">Share</span>
                  </Button>
                  <Button variant="outline" className="border-border flex-col h-auto py-3" onClick={handleShareTwitter}>
                    <Twitter className="h-4 w-4 mb-1" /><span className="text-[10px]">X</span>
                  </Button>
                  <Button variant="outline" className="border-border flex-col h-auto py-3" onClick={handleDownloadCard}>
                    <Download className="h-4 w-4 mb-1" /><span className="text-[10px]">Download</span>
                  </Button>
                  <Button variant="outline" className="border-border flex-col h-auto py-3" onClick={handleCopyLink}>
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

// Extracted results component
function AnalysisResults({ analysis, getScoreColor, getPriorityColor }: {
  analysis: OutfitAnalysisData;
  getScoreColor: (s: number) => string;
  getPriorityColor: (p: string) => string;
}) {
  return (
    <>
      {/* Overall Score */}
      <Card className="glass-card overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--primary))" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${(analysis.styleScore / 100) * 264} 264`} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-foreground">{analysis.styleScore}</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="font-display text-2xl font-bold text-foreground">{analysis.overallStyle}</h2>
                <Badge className="gold-gradient text-primary-foreground">{analysis.seasonalFit}</Badge>
              </div>
              <p className="text-muted-foreground">{analysis.summary}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Occasion Ratings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2 text-foreground">
            <Star className="w-5 h-5 text-primary" /> Occasion Suitability
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.occasionRatings.map((r, i) => (
            <motion.div key={r.occasion} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{r.occasion}</span>
                <span className={`text-sm font-bold ${getScoreColor(r.score)}`}>{r.score}%</span>
              </div>
              <Progress value={r.score} className="h-2" />
              <p className="text-xs text-muted-foreground">{r.reason}</p>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Detected Items */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2 text-foreground">
              <Shirt className="w-5 h-5 text-primary" /> Detected Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.detectedItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <div className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: item.color.startsWith("#") ? item.color : undefined }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.category} · {item.style}</p>
                </div>
                <Badge variant="outline" className="text-xs">{item.color}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Color Palette */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2 text-foreground">
              <Palette className="w-5 h-5 text-primary" /> Color Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              {analysis.colorPalette.colors.map((c, i) => (
                <div key={i} className="flex-1 aspect-square rounded-lg border border-border shadow-sm" style={{ backgroundColor: c }} title={c} />
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Harmony</span>
                <span className="font-medium text-foreground">{analysis.colorPalette.harmony}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Rating</span>
                <span className="font-medium text-foreground">{analysis.colorPalette.rating}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{analysis.bodyTypeNotes}</p>
          </CardContent>
        </Card>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2 text-foreground">
              <ShieldCheck className="w-5 h-5 text-green-500" /> Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <ChevronRight className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground">{s}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2 text-foreground">
              <AlertTriangle className="w-5 h-5 text-yellow-500" /> Suggestions to Improve
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.improvements.map((imp, i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/30 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-xs ${getPriorityColor(imp.priority)}`}>{imp.priority}</Badge>
                  <p className="text-sm font-medium text-foreground">{imp.suggestion}</p>
                </div>
                <p className="text-xs text-muted-foreground">{imp.reason}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
