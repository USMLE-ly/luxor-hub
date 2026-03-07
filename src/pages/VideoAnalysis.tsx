import { useState, useRef, useCallback } from "react";
import { PrivacyNotice } from "@/components/app/PrivacyNotice";
import { AppLayout } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Video, Play, Pause, SkipForward, Loader2, Sparkles, Camera, Trash2, CheckCircle2, AlertTriangle, Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { RainbowButton } from "@/components/ui/rainbow-button";

interface FrameAnalysis {
  frameIndex: number;
  timestamp: number;
  imageDataUrl: string;
  analysis?: any;
  status: "pending" | "analyzing" | "done" | "error";
}

interface MultiAngleResult {
  overallScore: number;
  overallStyle: string;
  summary: string;
  frameResults: {
    frameIndex: number;
    timestamp: number;
    styleScore: number;
    overallStyle: string;
    strengths: string[];
    detectedItems: { name: string; category: string; color: string; style: string }[];
  }[];
  fitAssessment: {
    consistency: number;
    silhouetteNotes: string;
    proportionNotes: string;
    bestAngle: string;
    recommendations: string[];
  };
  colorConsistency: {
    dominantColors: string[];
    harmony: string;
    rating: string;
  };
}

export default function VideoAnalysis() {
  const { user } = useAuth();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [frames, setFrames] = useState<FrameAnalysis[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [result, setResult] = useState<MultiAngleResult | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video must be under 50MB");
      return;
    }
    if (!file.type.startsWith("video/")) {
      toast.error("Please upload a video file");
      return;
    }
    setVideoFile(file);
    setVideoUrl(URL.createObjectURL(file));
    setFrames([]);
    setResult(null);
  };

  const extractFrames = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsExtracting(true);
    setExtractionProgress(0);

    const duration = video.duration;
    const frameCount = Math.min(6, Math.max(3, Math.floor(duration / 2)));
    const interval = duration / (frameCount + 1);
    const extractedFrames: FrameAnalysis[] = [];

    for (let i = 1; i <= frameCount; i++) {
      const time = interval * i;
      await new Promise<void>((resolve) => {
        video.currentTime = time;
        video.onseeked = () => {
          canvas.width = Math.min(video.videoWidth, 1280);
          canvas.height = Math.min(video.videoHeight, 960);
          const scale = Math.min(canvas.width / video.videoWidth, canvas.height / video.videoHeight);
          const w = video.videoWidth * scale;
          const h = video.videoHeight * scale;
          ctx.drawImage(video, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);

          extractedFrames.push({
            frameIndex: i - 1,
            timestamp: time,
            imageDataUrl: canvas.toDataURL("image/jpeg", 0.85),
            status: "pending",
          });
          setExtractionProgress(Math.round((i / frameCount) * 100));
          resolve();
        };
      });
    }

    setFrames(extractedFrames);
    setIsExtracting(false);
    toast.success(`Extracted ${extractedFrames.length} key frames`);
  }, []);

  const analyzeFrames = async () => {
    if (!user || frames.length === 0) return;
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    const updatedFrames = [...frames];
    const frameResults: any[] = [];

    for (let i = 0; i < updatedFrames.length; i++) {
      const frame = updatedFrames[i];
      frame.status = "analyzing";
      setFrames([...updatedFrames]);

      try {
        const { data, error } = await supabase.functions.invoke("analyze-outfit", {
          body: { imageUrl: frame.imageDataUrl },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        frame.analysis = data;
        frame.status = "done";
        frameResults.push({
          frameIndex: frame.frameIndex,
          timestamp: frame.timestamp,
          styleScore: data.styleScore,
          overallStyle: data.overallStyle,
          strengths: data.strengths || [],
          detectedItems: data.detectedItems || [],
        });
      } catch (err: any) {
        console.error(`Frame ${i} error:`, err);
        frame.status = "error";
      }

      setAnalysisProgress(Math.round(((i + 1) / updatedFrames.length) * 100));
      setFrames([...updatedFrames]);
    }

    if (frameResults.length > 0) {
      const avgScore = Math.round(frameResults.reduce((s, f) => s + f.styleScore, 0) / frameResults.length);
      const allItems = frameResults.flatMap((f) => f.detectedItems);
      const uniqueItems = allItems.filter((item, idx, arr) =>
        arr.findIndex((i) => i.name === item.name && i.category === item.category) === idx
      );
      const allStrengths = [...new Set(frameResults.flatMap((f) => f.strengths))];
      const scores = frameResults.map((f) => f.styleScore);
      const consistency = 100 - (Math.max(...scores) - Math.min(...scores));
      const bestIdx = frameResults.reduce((best, f, i) => f.styleScore > frameResults[best].styleScore ? i : best, 0);
      const styleVotes: Record<string, number> = {};
      frameResults.forEach((f) => { styleVotes[f.overallStyle] = (styleVotes[f.overallStyle] || 0) + 1; });
      const dominantStyle = Object.entries(styleVotes).sort((a, b) => b[1] - a[1])[0]?.[0] || "Mixed";

      const allColors = frameResults
        .map((f) => {
          const frame = updatedFrames.find((uf) => uf.frameIndex === f.frameIndex);
          return frame?.analysis?.colorPalette?.colors || [];
        })
        .flat();

      const multiResult: MultiAngleResult = {
        overallScore: avgScore,
        overallStyle: dominantStyle,
        summary: `Multi-angle analysis of ${frameResults.length} frames. The outfit maintains a ${dominantStyle} aesthetic with ${consistency >= 85 ? "excellent" : consistency >= 70 ? "good" : "moderate"} consistency across angles.`,
        frameResults,
        fitAssessment: {
          consistency,
          silhouetteNotes: `Analyzed from ${frameResults.length} angles — silhouette reads as ${allStrengths.includes("Good proportions") ? "well-proportioned" : "balanced"}.`,
          proportionNotes: `${uniqueItems.length} distinct items identified across all angles.`,
          bestAngle: `Frame ${bestIdx + 1} (${frameResults[bestIdx].timestamp.toFixed(1)}s) scored highest at ${frameResults[bestIdx].styleScore}/100.`,
          recommendations: allStrengths.slice(0, 4),
        },
        colorConsistency: {
          dominantColors: [...new Set(allColors)].slice(0, 6),
          harmony: updatedFrames[0]?.analysis?.colorPalette?.harmony || "Balanced",
          rating: consistency >= 85 ? "Excellent consistency" : consistency >= 70 ? "Good consistency" : "Some variation",
        },
      };

      setResult(multiResult);
      toast.success("Multi-angle analysis complete!");
    }

    setIsAnalyzing(false);
  };

  const reset = () => {
    setVideoFile(null);
    setVideoUrl(null);
    setFrames([]);
    setResult(null);
    setExtractionProgress(0);
    setAnalysisProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-400";
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="absolute -top-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-[60px]" />
          <h1 className="font-display text-4xl font-bold text-foreground relative">
            Video <span className="gold-text">Analysis</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Upload a video for multi-angle outfit assessment</p>
        </motion.div>

        {/* Upload */}
        {!videoUrl && (
          <div className="relative rounded-[1.5rem] border-[0.75px] border-border p-3">
            <GlowingEffect spread={40} glow proximity={64} inactiveZone={0.01} borderWidth={3} />
            <Card className="glass-card border-0 shadow-none">
              <CardContent className="p-8">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-12 flex flex-col items-center gap-4 cursor-pointer transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Video className="w-12 h-12 text-primary/60" />
                  <p className="text-muted-foreground text-center">
                    Drop a video or click to upload<br />
                    <span className="text-xs">MP4, MOV, WebM • Max 50MB</span>
                  </p>
                </motion.div>
                <input ref={fileInputRef} type="file" accept="video/*" onChange={handleVideoSelect} className="hidden" />
                <PrivacyNotice className="mt-4" />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Video Preview + Controls */}
        {videoUrl && (
          <div className="space-y-6">
            <Card className="glass-card overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 relative">
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      className="w-full rounded-lg max-h-[400px] object-contain bg-black/50"
                      controls
                      onLoadedMetadata={() => toast.info(`Video loaded: ${videoRef.current?.duration.toFixed(1)}s`)}
                    />
                  </div>
                  <div className="flex flex-col gap-3 min-w-[200px]">
                    <RainbowButton
                      onClick={extractFrames}
                      disabled={isExtracting || isAnalyzing}
                      className="w-full"
                    >
                      {isExtracting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Camera className="w-4 h-4 mr-2" />}
                      Extract Frames
                    </RainbowButton>

                    {frames.length > 0 && (
                      <RainbowButton
                        onClick={analyzeFrames}
                        disabled={isAnalyzing || isExtracting}
                        className="w-full"
                      >
                        {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        Analyze All Frames
                      </RainbowButton>
                    )}

                    <Button variant="outline" onClick={reset} className="w-full">
                      <Trash2 className="w-4 h-4 mr-2" /> Start Over
                    </Button>
                  </div>
                </div>

                {isExtracting && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-muted-foreground">Extracting key frames…</p>
                    <Progress value={extractionProgress} />
                  </div>
                )}
                {isAnalyzing && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-muted-foreground">Analyzing frames with AI…</p>
                    <Progress value={analysisProgress} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Extracted Frames */}
            {frames.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">Extracted Frames ({frames.length})</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {frames.map((frame) => (
                    <motion.div
                      key={frame.frameIndex}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative rounded-lg overflow-hidden border border-border group"
                    >
                      <img src={frame.imageDataUrl} alt={`Frame ${frame.frameIndex + 1}`} className="w-full aspect-[3/4] object-cover" />
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <p className="text-xs text-white/80">{frame.timestamp.toFixed(1)}s</p>
                        {frame.status === "analyzing" && <Loader2 className="w-3 h-3 animate-spin text-primary absolute top-2 right-2" />}
                        {frame.status === "done" && <CheckCircle2 className="w-3 h-3 text-green-400 absolute top-2 right-2" />}
                        {frame.status === "error" && <AlertTriangle className="w-3 h-3 text-destructive absolute top-2 right-2" />}
                      </div>
                      {frame.analysis && (
                        <div className="absolute top-2 left-2">
                          <Badge variant="secondary" className="text-[10px] bg-black/60 text-white border-0">
                            {frame.analysis.styleScore}/100
                          </Badge>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Multi-Angle Result */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Overall Score */}
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Multi-Angle Assessment</span>
                        <span className={`text-4xl font-bold ${getScoreColor(result.overallScore)}`}>
                          {result.overallScore}<span className="text-lg text-muted-foreground">/100</span>
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Badge variant="outline" className="text-sm">{result.overallStyle}</Badge>
                      <p className="text-muted-foreground">{result.summary}</p>
                    </CardContent>
                  </Card>

                  {/* Frame-by-Frame Scores */}
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="text-lg">Frame-by-Frame Scores</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                        {result.frameResults.map((fr) => (
                          <div key={fr.frameIndex} className="text-center p-3 rounded-lg bg-muted/30 border border-border">
                            <p className="text-xs text-muted-foreground mb-1">Frame {fr.frameIndex + 1}</p>
                            <p className={`text-2xl font-bold ${getScoreColor(fr.styleScore)}`}>{fr.styleScore}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{fr.timestamp.toFixed(1)}s</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Fit Assessment */}
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="text-lg">Fit Assessment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">Angle Consistency</span>
                        <Progress value={result.fitAssessment.consistency} className="flex-1" />
                        <span className={`font-semibold ${getScoreColor(result.fitAssessment.consistency)}`}>
                          {result.fitAssessment.consistency}%
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-muted/20 border border-border">
                          <p className="text-xs text-muted-foreground mb-1">Silhouette</p>
                          <p className="text-sm">{result.fitAssessment.silhouetteNotes}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/20 border border-border">
                          <p className="text-xs text-muted-foreground mb-1">Best Angle</p>
                          <p className="text-sm">{result.fitAssessment.bestAngle}</p>
                        </div>
                      </div>
                      {result.fitAssessment.recommendations.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {result.fitAssessment.recommendations.map((r, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{r}</Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Color Consistency */}
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="text-lg">Color Consistency</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex gap-1">
                          {result.colorConsistency.dominantColors.map((c, i) => (
                            <div key={i} className="w-8 h-8 rounded-full border border-border" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                        <Badge variant="outline">{result.colorConsistency.harmony}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{result.colorConsistency.rating}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </AppLayout>
  );
}
