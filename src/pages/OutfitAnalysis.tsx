import { useState, useRef } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Upload, Camera, Sparkles, TrendingUp, Palette, ShieldCheck, AlertTriangle, ChevronRight, Star, Shirt, Sun, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OutfitAnalysis {
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

export default function OutfitAnalysis() {
  const { user } = useAuth();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<OutfitAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }
    setImageFile(file);
    setAnalysis(null);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imageFile || !user) return;
    setIsAnalyzing(true);
    try {
      // Upload to storage
      const ext = imageFile.name.split(".").pop();
      const path = `${user.id}/analysis-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("clothing-photos")
        .upload(path, imageFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("clothing-photos")
        .getPublicUrl(path);

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

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            AI Outfit <span className="gold-text">Analysis</span>
          </h1>
          <p className="text-muted-foreground mt-1">Upload a photo and get comprehensive styling feedback</p>
        </div>

        {/* Upload Section */}
        <Card className="glass-card overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Upload Area */}
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Action Area */}
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
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Analyze My Outfit
                    </>
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
              {/* Overall Score Card */}
              <Card className="glass-card overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                        <circle
                          cx="50" cy="50" r="42" fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${(analysis.styleScore / 100) * 264} 264`}
                        />
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
                    <Star className="w-5 h-5 text-primary" />
                    Occasion Suitability
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysis.occasionRatings.map((r, i) => (
                    <motion.div
                      key={r.occasion}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="space-y-1.5"
                    >
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
                      <Shirt className="w-5 h-5 text-primary" />
                      Detected Items
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
                      <Palette className="w-5 h-5 text-primary" />
                      Color Analysis
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
                      <ShieldCheck className="w-5 h-5 text-green-500" />
                      Strengths
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
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      Suggestions to Improve
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysis.improvements.map((imp, i) => (
                      <div key={i} className="p-3 rounded-lg bg-muted/30 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-xs ${getPriorityColor(imp.priority)}`}>
                            {imp.priority}
                          </Badge>
                          <p className="text-sm font-medium text-foreground">{imp.suggestion}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{imp.reason}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
