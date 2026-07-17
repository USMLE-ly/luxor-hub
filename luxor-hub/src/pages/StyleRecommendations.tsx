import { getApiUrl } from "@/lib/api";
import React from "react";
import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { toast } from "sonner";
import { notifyEvent } from "@/lib/notificationService";
import { motion, AnimatePresence } from "framer-motion";
import {Spinner, UploadSimple, Camera, Palette, FaceMask, User, Star, Lightbulb, Warning} from "@phosphor-icons/react";
import { humanizeText } from "@/lib/humanizer";

import FashionReviewCard from "@/components/ui/fashion-review-card";
import GlassTabs, { type GlassTab } from "@/components/ui/glass-tabs";

interface StyleAnalysis {
  face_shape: string;
  body_type: string;
  height_estimation: string;
  weight_estimation: string;
  bmi_category: string;
  body_proportions: string;
  shoulder_width: string;
  waist_to_hip_ratio: string;
  head_size_relative: string;
  neck_length: string;
  leg_length: string;
  arm_proportions: string;
  skin_tone: string;
  skin_undertone: string;
  hair_color: string;
  eye_shape: string;
  eye_size: string;
  nose_shape: string;
  lip_shape: string;
  age_estimation: string;
  gender_presentation: string;
  overall_style_profile: string;
  outfit_description: string;
  current_style_score: number;
  current_style_strengths: string[];
  current_style_improvements: string[];
}

interface ColorAnalysis {
  best_colors: string[];
  colors_to_avoid: string[];
  best_accessory_colors: string[];
  best_shoe_colors: string[];
  best_jewelry_metals: string[];
  explanation: string;
}

interface FaceRecs {
  best_collar_types: string[];
  best_neckline_styles: string[];
  glasses_recommendation: string;
  hat_recommendation: string;
  hairstyle_advice: string;
  beard_advice: string;
  explanation: string;
}

interface BodyRecs {
  shirt_fit: string;
  jacket_fit: string;
  pants_fit: string;
  shorts_length: string;
  coat_style: string;
  suit_cut: string;
  explanation: string;
}

interface HonestTip {
  tip: string;
  confidence: number;
}

interface Recommendations {
  color_analysis: ColorAnalysis;
  face_recommendations: FaceRecs;
  body_recommendations: BodyRecs;
  honest_tips: HonestTip[];
  confidence_score: number;
}

interface OutfitReview {
  overall_score: number;
  scores: Record<string, number>;
  strengths: string[];
  improvements: { issue: string; suggestion: string; priority: string }[];
  honest_summary: string;
}

export default function StyleRecommendationsPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStartTime, setAnalysisStartTime] = useState<number | null>(null);
  const [estimatedRemainingSeconds, setEstimatedRemainingSeconds] = useState<number | null>(null);
  const styleLastTimingRef = useRef<{ mimo_vision?: number; mimo_text?: number; total?: number } | null>(null);
  const [progressValue, setProgressValue] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [progressStage, setProgressStage] = useState("");
  const [analysis, setAnalysis] = useState<StyleAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [outfitReview, setOutfitReview] = useState<OutfitReview | null>(null);
  const [activeTab, setActiveTab] = useState<"analyze" | "recommendations" | "review">("analyze");
  const glassTabs: GlassTab[] = [
    { id: "analyze", label: "Analysis" },
    { id: "recommendations", label: "Recommendations" },
    { id: "review", label: "Review" },
  ];

  // ── Real-time ETA + linked progress for 3-step style pipeline ──
  useEffect(() => {
    if (!analysisStartTime || !analyzing) return;
    setDisplayProgress(0);

    const prev = styleLastTimingRef.current;
    // 3 steps: style-analyze (~25s) + style-recommendations (~20s) + outfit-review (~25s) = ~70s total
    const estimatedTotal = prev?.total || 70;

    const timer = setInterval(() => {
      const elapsedMs = Date.now() - analysisStartTime;
      const elapsedSeconds = elapsedMs / 1000;

      // Update stage labels based on elapsed time
      if (elapsedSeconds < 8) {
        setProgressStage("Analyzing face & body...");
      } else if (elapsedSeconds < 30) {
        setProgressStage("Generating style recommendations...");
      } else if (elapsedSeconds < 55) {
        setProgressStage("Reviewing outfit...");
      } else {
        setProgressStage("Finalizing...");
      }

      if (elapsedSeconds < 3) {
        setEstimatedRemainingSeconds(null);
        return;
      }

      const remaining = Math.max(0, Math.round(estimatedTotal - elapsedSeconds));
      setEstimatedRemainingSeconds(remaining);
      const realProgress = Math.min(99, Math.round((elapsedSeconds / estimatedTotal) * 100));
      setDisplayProgress(realProgress);
    }, 200);

    return () => clearInterval(timer);
  }, [analysisStartTime, analyzing]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setAnalysis(null);
      setRecommendations(null);
      setOutfitReview(null);
      setActiveTab("analyze");
    };
    reader.readAsDataURL(file);
  };

  /* ---------- Build table data from recommendations ---------- */
  const buildTableData = (recs: Recommendations): RowData[] => {
    const rows: RowData[] = [];
    if (!recs) return rows;

    if (recs.color_analysis) {
      const ca = recs.color_analysis;
      const columns: CellData[] = [];
      columns.push({ header: "Best Colors", value: ca.best_colors ?? null });
      columns.push({ header: "Avoid", value: ca.colors_to_avoid ?? null });
      columns.push({ header: "Accessories", value: ca.best_accessory_colors ?? null });
      columns.push({ header: "Shoes", value: ca.best_shoe_colors ?? null });
      columns.push({ header: "Jewelry", value: ca.best_jewelry_metals ?? null });
      columns.push({ header: "Why", value: ca.explanation ? humanizeText(ca.explanation) : null });
      rows.push({ category: "Color Analysis", columns });
    }

    if (recs.face_recommendations) {
      const fr = recs.face_recommendations;
      const columns: CellData[] = [];
      columns.push({ header: "Collars", value: fr.best_collar_types?.length ? fr.best_collar_types : null });
      columns.push({ header: "Necklines", value: fr.best_neckline_styles?.length ? fr.best_neckline_styles : null });
      columns.push({ header: "Eyeglasses", value: fr.glasses_recommendation ? humanizeText(fr.glasses_recommendation) : null });
      columns.push({ header: "Hats", value: fr.hat_recommendation ? humanizeText(fr.hat_recommendation) : null });
      columns.push({ header: "Hairstyle", value: fr.hairstyle_advice ? humanizeText(fr.hairstyle_advice) : null });
      columns.push({ header: "Beard", value: fr.beard_advice ? humanizeText(fr.beard_advice) : null });
      columns.push({ header: "Why", value: fr.explanation ? humanizeText(fr.explanation) : null });
      rows.push({ category: "Face Recommendations", columns });
    }

    if (recs.body_recommendations) {
      const br = recs.body_recommendations;
      const columns: CellData[] = [];
      columns.push({ header: "Shirt", value: br.shirt_fit ? humanizeText(br.shirt_fit) : null });
      columns.push({ header: "Jacket", value: br.jacket_fit ? humanizeText(br.jacket_fit) : null });
      columns.push({ header: "Pants", value: br.pants_fit ? humanizeText(br.pants_fit) : null });
      columns.push({ header: "Shorts", value: br.shorts_length ? humanizeText(br.shorts_length) : null });
      columns.push({ header: "Coat", value: br.coat_style ? humanizeText(br.coat_style) : null });
      columns.push({ header: "Suit", value: br.suit_cut ? humanizeText(br.suit_cut) : null });
      columns.push({ header: "Why", value: br.explanation ? humanizeText(br.explanation) : null });
      rows.push({ category: "Body Recommendations", columns });
    }

    if (Array.isArray(recs.honest_tips) && recs.honest_tips.length > 0) {
      const columns: CellData[] = recs.honest_tips.map((tip, i) => ({
        header: `Tip ${i + 1}`,
        value: `${humanizeText(tip.tip)} (${tip.confidence}% confidence)`,
      }));
      rows.push({ category: "Honest Tips", columns });
    }

    return rows;
  };

  // ── Consolidated full analysis: face/body → recommendations → outfit review ──
  const handleFullAnalysis = async () => {
    if (!imagePreview) return;
    setAnalyzing(true);
    setAnalysisStartTime(Date.now());
    setEstimatedRemainingSeconds(null);
    setError(null);
    const api = getApiUrl();

    try {
      // Step 1: Style Analyze (face + body)
      setProgressValue(10);
      setProgressStage("Analyzing face & body...");
      const styleResp = await fetch(api + "/api/v1/style-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_b64: imagePreview }),
      });
      const styleData = await styleResp.json();
      if (styleData?.timing) styleLastTimingRef.current = { ...styleLastTimingRef.current, ...styleData.timing };
      // Strip 'for' key
      if (styleData && typeof styleData === 'object') delete (styleData as any).for;
      if (!styleData.success || !styleData.analysis) {
        throw new Error(styleData.error || "Face/body analysis failed");
      }
      setAnalysis(styleData.analysis);

      // Step 2: Style Recommendations
      setProgressValue(40);
      setProgressStage("Generating style recommendations...");
      const recResp = await fetch(api + "/api/v1/style-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis: styleData.analysis }),
      });
      const recData = await recResp.json();
      if (recData?.timing) styleLastTimingRef.current = { ...styleLastTimingRef.current, ...recData.timing };
      // Strip 'for' key
      if (recData && typeof recData === 'object') delete (recData as any).for;
      if (recData.success && recData.recommendations) {
        setRecommendations(recData.recommendations);
      } else {
        console.warn("[RECOMMENDATIONS] API returned no data, setting fallback");
        // Set a fallback so the tab is still clickable with a friendly message
        setRecommendations({
          color_analysis: { best_colors: [], colors_to_avoid: [], best_accessory_colors: [], best_shoe_colors: [], best_jewelry_metals: [], explanation: "" },
          face_recommendations: { best_collar_types: [], best_neckline_styles: [], glasses_recommendation: "", hat_recommendation: "", hairstyle_advice: "", beard_advice: "", explanation: "" },
          body_recommendations: { shirt_fit: "", jacket_fit: "", pants_fit: "", shorts_length: "", coat_style: "", suit_cut: "", explanation: "" },
          honest_tips: [],
          confidence_score: 0,
        });
      }

      // Step 3: Outfit Review
      setProgressValue(70);
      setProgressStage("Reviewing outfit...");
      const reviewResp = await fetch(api + "/api/v1/outfit-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_b64: imagePreview, occasion: "casual" }),
      });
      const reviewData = await reviewResp.json();
      if (reviewData?.timing) styleLastTimingRef.current = { ...styleLastTimingRef.current, total: reviewData.timing.total };
      // Strip 'for' key
      if (reviewData && typeof reviewData === 'object') delete (reviewData as any).for;
      if (reviewData.success && reviewData.review) {
        setOutfitReview(reviewData.review);
      } else {
        toast.warning("Outfit review unavailable");
      }

      // Done!
      setProgressValue(100);
      setProgressStage("Complete!");
      setActiveTab("analyze");
      toast.success("Full analysis complete! ✨");
      notifyEvent("analyze-complete");
    } catch (e: any) {
      setError(e.message || "Analysis failed");
      toast.error(e.message || "Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
      setAnalysisStartTime(null);
      setEstimatedRemainingSeconds(null);
    }
  };


  return (
    <AppLayout>
      <div className="p-4 md:p-8 mx-auto max-w-7xl space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl font-bold text-foreground">
            AI Style <span className="gold-text">Recommendations</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Upload a photo for honest body/face analysis, color advice, and personalized styling tips.
          </p>
        </motion.div>

        <div className="relative flex flex-col items-center gap-6 p-8 rounded-2xl border border-white/10 bg-emerald/30 backdrop-blur-sm">
          {imagePreview ? (
            <div className="relative w-full max-w-md overflow-hidden rounded-xl">
              <img src={imagePreview} alt="Upload" className="w-full h-auto max-h-[50vh] object-contain rounded-xl" />
              {analyzing && (
                <div className="absolute inset-0 bg-forest/30 backdrop-blur-md z-10" />
              )}
              <button onClick={() => { setImagePreview(null); setAnalysis(null); setRecommendations(null); setOutfitReview(null); setError(null); }}
                className="absolute top-2 right-2 p-2 rounded-full bg-forest/60 hover:bg-forest/80 text-white text-xs">✕</button>
            </div>
          ) : (
            <div onClick={() => fileInputRef.current?.click()} className="w-full max-w-md aspect-[4/3] rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/50 transition-all bg-emerald/40">
              <Camera className="w-12 h-12 text-white/30" />
              <p className="text-white/50 text-sm">Tap to upload a full-body photo</p>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

          {/* Single consolidated button — glass-morphism white */}
          <div className="flex gap-3">
            <button
              onClick={handleFullAnalysis}
              disabled={!imagePreview || analyzing}
              className="relative overflow-hidden rounded-xl px-6 py-3 text-slate-800 font-medium shadow-lg transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:scale-105 bg-white/90 backdrop-blur-sm enabled:hover:bg-white"
            >
              {analyzing ? (
                <span className="relative z-10 flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-slate-800/20 border-t-slate-800 animate-spin" />
                  Analyzing...
                </span>
              ) : (
                <span className="relative z-10 flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Analyze Outfit
                </span>
              )}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5" />
            </button>
          </div>
          {analyzing && imagePreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 overflow-hidden will-change-transform flex flex-col items-center justify-center gap-6 z-20 rounded-xl"
            >
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <div className="absolute inset-0 rounded-full border-4 border-white/10 border-t-amber-400 border-r-amber-400 animate-spin" />
                <div className="absolute w-16 h-16 rounded-full bg-amber-400/10 animate-pulse" />
                <span className="text-lg font-semibold text-amber-400/90 z-10">
                  {displayProgress}%
                </span>
              </div>
              <p className="text-sm text-white/70 font-medium tracking-wide">{progressStage}</p>
              {estimatedRemainingSeconds !== null && estimatedRemainingSeconds > 0 && (
                <p className="text-xs text-white/40 animate-pulse mt-1">
                  {estimatedRemainingSeconds > 60
                    ? `About ${Math.round(estimatedRemainingSeconds / 60)} min remaining`
                    : `About ${estimatedRemainingSeconds}s remaining`}
                </p>
              )}
            </motion.div>
          )}
          {analyzing && !imagePreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-6 mt-6 overflow-hidden will-change-transform"
            >
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <div className="absolute inset-0 rounded-full border-4 border-white/10 border-t-amber-400 border-r-amber-400 animate-spin" />
                <div className="absolute w-16 h-16 rounded-full bg-amber-400/10 animate-pulse" />
                <span className="text-lg font-semibold text-amber-400/90 z-10">
                  {displayProgress}%
                </span>
              </div>
              <p className="text-sm text-white/70 font-medium tracking-wide">{progressStage}</p>
              {estimatedRemainingSeconds !== null && estimatedRemainingSeconds > 0 && (
                <p className="text-xs text-white/40 animate-pulse mt-1">
                  {estimatedRemainingSeconds > 60
                    ? `About ${Math.round(estimatedRemainingSeconds / 60)} min remaining`
                    : `About ${estimatedRemainingSeconds}s remaining`}
                </p>
              )}
            </motion.div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/30">
              <Warning className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* ── Glass Tabs ── */}
        <GlassTabs
          tabs={glassTabs}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as "analyze" | "recommendations" | "review")}
          className="mt-6"
        />

        <AnimatePresence mode="wait">
          {/* ── TAB: Analysis (Face + Body) ── */}
          {activeTab === "analyze" && analysis && (
            <motion.div key="analysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative p-1.5 rounded-[1.75rem] bg-white/[0.03] border border-white/10 shadow-lg shadow-forest/40">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent pointer-events-none rounded-[1.75rem]" />
                <div className="relative overflow-hidden rounded-[1.25rem] bg-white/5 backdrop-blur-md p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent pointer-events-none" />
                <div className="flex items-center gap-2 mb-4"><span className="text-primary"><FaceMask className="w-4 h-4" /></span><h3 className="text-sm font-semibold text-foreground/80">Face Analysis</h3></div>
                <InfoRow label="Face Shape" value={analysis.face_shape} />
                <InfoRow label="Eye Shape" value={analysis.eye_shape} />
                <InfoRow label="Eye Size" value={analysis.eye_size} />
                <InfoRow label="Nose Shape" value={analysis.nose_shape} />
                <InfoRow label="Lip Shape" value={analysis.lip_shape} />
                <InfoRow label="Age Est." value={analysis.age_estimation} />
                <InfoRow label="Gender" value={analysis.gender_presentation} />
                </div>
              </div>
              <div className="relative p-1.5 rounded-[1.75rem] bg-white/[0.03] border border-white/10 shadow-lg shadow-forest/40">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent pointer-events-none rounded-[1.75rem]" />
                <div className="relative overflow-hidden rounded-[1.25rem] bg-white/5 backdrop-blur-md p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent pointer-events-none" />
                <div className="flex items-center gap-2 mb-4"><span className="text-primary"><User className="w-4 h-4" /></span><h3 className="text-sm font-semibold text-foreground/80">Body Analysis</h3></div>
                <InfoRow label="Body Type" value={analysis.body_type} />
                <InfoRow label="Height" value={analysis.height_estimation} />
                <InfoRow label="Weight" value={analysis.weight_estimation} />
                <InfoRow label="BMI" value={analysis.bmi_category} />
                <InfoRow label="Proportions" value={analysis.body_proportions} />
                <InfoRow label="Shoulders" value={analysis.shoulder_width} />
                <InfoRow label="Waist/Hip" value={analysis.waist_to_hip_ratio} />
                <InfoRow label="Neck" value={analysis.neck_length} />
                <InfoRow label="Legs" value={analysis.leg_length} />
                </div>
              </div>
              <div className="relative p-1.5 rounded-[1.75rem] bg-white/[0.03] border border-white/10 shadow-lg shadow-forest/40">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent pointer-events-none rounded-[1.75rem]" />
                <div className="relative overflow-hidden rounded-[1.25rem] bg-white/5 backdrop-blur-md p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent pointer-events-none" />
                <div className="flex items-center gap-2 mb-4"><span className="text-primary"><Palette className="w-4 h-4" /></span><h3 className="text-sm font-semibold text-foreground/80">Skin & Hair</h3></div>
                <InfoRow label="Skin Tone" value={analysis.skin_tone} />
                <InfoRow label="Undertone" value={analysis.skin_undertone} />
                <InfoRow label="Hair Color" value={analysis.hair_color} />
                </div>
              </div>
              <div className="relative p-1.5 rounded-[1.75rem] bg-white/[0.03] border border-white/10 shadow-lg shadow-forest/40">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent pointer-events-none rounded-[1.75rem]" />
                <div className="relative overflow-hidden rounded-[1.25rem] bg-white/5 backdrop-blur-md p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent pointer-events-none" />
                <div className="flex items-center gap-2 mb-4"><span className="text-primary"><Star className="w-4 h-4" /></span><h3 className="text-sm font-semibold text-foreground/80">Style Score</h3></div>
                <div className="text-3xl font-bold mb-2 text-yellow-500">{Number(analysis.current_style_score) * 10}/100</div>
                <p className="text-sm text-white/70 italic">"{analysis.overall_style_profile}"</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── TAB: Recommendations ── */}
          {activeTab === "recommendations" && recommendations && (
            <motion.div key="recommendations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6 w-full">
              
              {/* ── Color Analysis Card ── */}
              {recommendations.color_analysis && (
                <div className="relative p-1.5 rounded-[1.75rem] bg-white/[0.03] border border-white/10 shadow-lg shadow-forest/40">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent pointer-events-none rounded-[1.75rem]" />
                  <div className="relative overflow-hidden rounded-[1.25rem] bg-white/5 backdrop-blur-md p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent pointer-events-none" />
                  <div className="flex items-center gap-2 mb-4"><span className="text-primary"><Palette className="w-4 h-4" /></span><h3 className="text-sm font-semibold text-foreground/80">Color Analysis</h3></div>
                  <div className="flex flex-col gap-3">
                    {recommendations.color_analysis.best_colors?.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] text-white/40 w-16 shrink-0">Best:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {recommendations.color_analysis.best_colors.map((c, i) => (
                            <ColorPill key={i} name={c} />
                          ))}
                        </div>
                      </div>
                    )}
                    {recommendations.color_analysis.colors_to_avoid?.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] text-white/40 w-16 shrink-0">Avoid:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {recommendations.color_analysis.colors_to_avoid.map((c, i) => (
                            <ColorPill key={i} name={c} />
                          ))}
                        </div>
                      </div>
                    )}
                    {recommendations.color_analysis.best_accessory_colors?.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] text-white/40 w-16 shrink-0">Accents:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {recommendations.color_analysis.best_accessory_colors.map((c, i) => (
                            <ColorPill key={i} name={c} />
                          ))}
                        </div>
                      </div>
                    )}
                    {recommendations.color_analysis.best_jewelry_metals?.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] text-white/40 w-16 shrink-0">Metals:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {recommendations.color_analysis.best_jewelry_metals.map((m, i) => (
                            <ColorPill key={i} name={m} />
                          ))}
                        </div>
                      </div>
                    )}
                    {recommendations.color_analysis.explanation && (
                      <p className="text-[11px] text-white/35 italic mt-1">{recommendations.color_analysis.explanation}</p>
                    )}
                  </div>
                  </div>
                </div>
              )}

              {/* ── Face Recommendations Card ── */}
              {recommendations.face_recommendations && (
                <div className="relative p-1.5 rounded-[1.75rem] bg-white/[0.03] border border-white/10 shadow-lg shadow-forest/40">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent pointer-events-none rounded-[1.75rem]" />
                  <div className="relative overflow-hidden rounded-[1.25rem] bg-white/5 backdrop-blur-md p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent pointer-events-none" />
                  <div className="flex items-center gap-2 mb-4"><span className="text-primary"><FaceMask className="w-4 h-4" /></span><h3 className="text-sm font-semibold text-foreground/80">Face Recommendations</h3></div>
                  <div className="flex flex-col gap-2">
                    {recommendations.face_recommendations.best_collar_types?.length > 0 && (
                      <InfoRow label="Collars" align="left" value={recommendations.face_recommendations.best_collar_types.join(", ")} />
                    )}
                    {recommendations.face_recommendations.best_neckline_styles?.length > 0 && (
                      <InfoRow label="Necklines" align="left" value={recommendations.face_recommendations.best_neckline_styles.join(", ")} />
                    )}
                    {recommendations.face_recommendations.glasses_recommendation && (
                      <InfoRow label="Glasses" align="left" value={recommendations.face_recommendations.glasses_recommendation} />
                    )}
                    {recommendations.face_recommendations.hat_recommendation && (
                      <InfoRow label="Hats" align="left" value={recommendations.face_recommendations.hat_recommendation} />
                    )}
                    {recommendations.face_recommendations.hairstyle_advice && (
                      <InfoRow label="Hair" align="left" value={recommendations.face_recommendations.hairstyle_advice} />
                    )}
                    {recommendations.face_recommendations.explanation && (
                      <p className="text-[11px] text-white/35 italic mt-1">{recommendations.face_recommendations.explanation}</p>
                    )}
                  </div>
                  </div>
                </div>
              )}

              {/* ── Body Recommendations Card ── */}
              {recommendations.body_recommendations && (
                <div className="relative p-1.5 rounded-[1.75rem] bg-white/[0.03] border border-white/10 shadow-lg shadow-forest/40">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent pointer-events-none rounded-[1.75rem]" />
                  <div className="relative overflow-hidden rounded-[1.25rem] bg-white/5 backdrop-blur-md p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent pointer-events-none" />
                  <div className="flex items-center gap-2 mb-4"><span className="text-primary"><User className="w-4 h-4" /></span><h3 className="text-sm font-semibold text-foreground/80">Body Recommendations</h3></div>
                  <div className="flex flex-col gap-2">
                    {recommendations.body_recommendations.shirt_fit && (
                      <InfoRow label="Shirt" align="left" value={recommendations.body_recommendations.shirt_fit} />
                    )}
                    {recommendations.body_recommendations.jacket_fit && (
                      <InfoRow label="Jacket" align="left" value={recommendations.body_recommendations.jacket_fit} />
                    )}
                    {recommendations.body_recommendations.pants_fit && (
                      <InfoRow label="Pants" align="left" value={recommendations.body_recommendations.pants_fit} />
                    )}
                    {recommendations.body_recommendations.shorts_length && (
                      <InfoRow label="Shorts" align="left" value={recommendations.body_recommendations.shorts_length} />
                    )}
                    {recommendations.body_recommendations.coat_style && (
                      <InfoRow label="Coat" align="left" value={recommendations.body_recommendations.coat_style} />
                    )}
                    {recommendations.body_recommendations.suit_cut && (
                      <InfoRow label="Suit" align="left" value={recommendations.body_recommendations.suit_cut} />
                    )}
                    {recommendations.body_recommendations.explanation && (
                      <p className="text-[11px] text-white/35 italic mt-1">{recommendations.body_recommendations.explanation}</p>
                    )}
                  </div>
                  </div>
                </div>
              )}

              {/* ── Honest Tips Card ── */}
              {recommendations.honest_tips?.length > 0 && (
                <div className="relative p-1.5 rounded-[1.75rem] bg-white/[0.03] border border-white/10 shadow-lg shadow-forest/40">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent pointer-events-none rounded-[1.75rem]" />
                  <div className="relative overflow-hidden rounded-[1.25rem] bg-white/5 backdrop-blur-md p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent pointer-events-none" />
                  <div className="flex items-center gap-2 mb-4"><span className="text-primary"><Lightbulb className="w-4 h-4" /></span><h3 className="text-sm font-semibold text-foreground/80">Honest Tips</h3></div>
                  <div className="flex flex-col gap-2.5">
                    {recommendations.honest_tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5 shrink-0">💡</span>
                        <div className="flex-1">
                          <p className="text-xs text-white/70 leading-relaxed">{tip.tip}</p>
                          {tip.confidence > 0 && (
                            <span className="text-[10px] text-white/30">Confidence: {tip.confidence}%</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  </div>
                </div>
              )}
              {/* No data fallback — when API returned nothing */}
              {recommendations && !recommendations.color_analysis?.best_colors?.length && 
               !recommendations.face_recommendations?.best_collar_types?.length &&
               !recommendations.body_recommendations?.shirt_fit &&
               !recommendations.honest_tips?.length && (
                <div className="relative p-1.5 rounded-[1.75rem] bg-white/[0.03] border border-white/10 shadow-lg shadow-forest/40">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent pointer-events-none rounded-[1.75rem]" />
                  <div className="relative overflow-hidden rounded-[1.25rem] bg-white/5 backdrop-blur-md p-8 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent pointer-events-none" />
                  <Lightbulb className="w-10 h-10 text-amber-500/50 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-white/70 mb-1">No AI Recommendations Yet</h3>
                  <p className="text-xs text-white/40 max-w-md mx-auto">
                    The AI was unable to generate personalized recommendations for this image. 
                    This can happen if the image is unclear or the AI service is busy. 
                    Try uploading a clearer full-body photo and click Analyze again.
                  </p>
                  </div>
                </div>
              )}

              {/* Confidence Score — circular badge */}
              {recommendations && recommendations.confidence_score > 0 && (
                <div className="relative p-1 rounded-[1.25rem] bg-white/[0.03] border border-white/10 shadow-lg shadow-forest/40">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent pointer-events-none rounded-[1.25rem]" />
                    <div className="relative overflow-hidden flex justify-center items-center gap-4 p-4 rounded-[0.85rem] bg-emerald/40 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent pointer-events-none" />
                  <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                    <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 72 72">
                      <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                      <motion.circle
                        cx="36" cy="36" r="30"
                        fill="none"
                        stroke="#e5c785"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={188.5}
                        initial={{ strokeDashoffset: 188.5 }}
                        animate={{ strokeDashoffset: 188.5 - (recommendations.confidence_score / 100) * 188.5 }}
                        transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
                        style={{ filter: "drop-shadow(0 0 4px rgba(229,199,133,0.4))" }}
                      />
                    </svg>
                    <span className="text-base font-bold text-amber-200/90">{recommendations.confidence_score}%</span>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-white/40 uppercase tracking-wider">Recommendation</p>
                    <p className="text-sm font-medium text-foreground/80">Confidence Score</p>
                  </div>
                </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── TAB: Review ── */}
          {activeTab === "review" && outfitReview && (
            <motion.div
              key="review"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6 w-full px-4 py-6"
            >
              <div className="relative p-1.5 rounded-[1.75rem] bg-white/[0.03] border border-white/10 shadow-lg shadow-forest/40">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent pointer-events-none rounded-[1.75rem]" />
                <div className="relative overflow-hidden rounded-[1.25rem] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent pointer-events-none" />
              <FashionReviewCard
                overallScore={outfitReview.overall_score}
                scoreBreakdown={outfitReview.scores}
                strengths={outfitReview.strengths}
                improvements={outfitReview.improvements}
                honestSummary={outfitReview.honest_summary}
              />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}

/* Fashion terms to bold-highlight in recommendation text */
const FASHION_KEYWORDS = [
  "V-Neck", "Boat Neck", "Crew Neck", "Polo", "Mandarin",
  "Rimless", "Round", "Cat-Eye", "Aviator", "Wayfarer",
  "Single-Breasted", "Double-Breasted", "Tailored", "Slim-Fit", "Relaxed-Fit",
  "Straight-Leg", "Boot-Cut", "Skinny", "Slim", "Tapered", "Wide-Leg",
  "Mid-Length", "Oversized", "Structured", "Unstructured",
  "Lightweight", "Wool", "Linen", "Cotton", "Denim", "Leather", "Suede",
  "Statement", "Delicate", "Layered", "Minimalist",
  "High-Waisted", "Low-Rise", "Ankle-Length", "Cropped",
  "Lace-Up", "Slip-On", "Platform", "Block Heel",
  "Wide-Brimmed", "Fedora", "Beanie", "Snapback",
  "Textured", "Patterned", "Solid", "Pastel", "Neutral",
  "Fitted", "Boxy", "Pleated", "Flat-Front",
];

function highlightFashionTerms(text: string) {
  if (!text) return text;
  const escaped = FASHION_KEYWORDS.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(pattern);
  return (
    <>
      {parts.map((part, i) =>
        pattern.test(part)
          ? <span key={i} className="text-zinc-100 font-medium">{part}</span>
          : <span key={i}>{part}</span>
      )}
    </>
  );
}

/* Color name → hex mapping for swatches */
const colorSwatchMap: Record<string, string> = {
  'black': '#1a1a1a', 'white': '#f5f5f5', 'navy': '#1a2744', 'blue': '#4a90d9',
  'red': '#d94a4a', 'green': '#4ad97a', 'grey': '#8a8a8a', 'gray': '#8a8a8a',
  'brown': '#8b6914', 'yellow': '#e5c07b', 'pink': '#e8a0b8', 'purple': '#9b59b6',
  'orange': '#f4a460', 'gold': '#d4af37', 'silver': '#c0c0c0', 'teal': '#2e8b8b',
  'burgundy': '#7a1f3d', 'maroon': '#7a1f3d', 'beige': '#d4c5a0', 'cream': '#f5f0e0',
  'olive': '#8a9a5b', 'coral': '#ff7f50', 'peach': '#ffdab9', 'ivory': '#fffff0',
  'lavender': '#c8b8e0', 'mint': '#a0d0c0', 'charcoal': '#4a5054', 'taupe': '#8a7d6b',
  'camel': '#c19a6b', 'mauve': '#c09090', 'blush': '#e8b4b8', 'indigo': '#4a0080',
  'terracotta': '#c06030', 'rust': '#b7410e', 'sage': '#9cad8c', 'plum': '#6a0064',
  'wine': '#722f37', 'stone': '#8a8578', 'khaki': '#c3b091', 'tan': '#d2b48c',
  'auburn': '#a52a2a', 'chestnut': '#954535', 'mahogany': '#c04000',
};

function getColorSwatch(colorName: string): string {
  const lower = colorName.toLowerCase().trim();
  if (colorSwatchMap[lower]) return colorSwatchMap[lower];
  // Try partial match
  for (const [key, hex] of Object.entries(colorSwatchMap)) {
    if (lower.includes(key) || key.includes(lower)) return hex;
  }
  return '#888888';
}

function ColorPill({ name, className }: { name: string; className?: string }) {
  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/30 ${className || ''}`}>
      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-white/10" style={{ backgroundColor: getColorSwatch(name) }} />
      <span className="text-[11px] text-zinc-300">{name}</span>
    </span>
  );
}

function InfoRow({ label, value, align = "right" }: { label: string; value: string | number; align?: "right" | "left" }) {
  const displayValue = String(value).replace(/_/g, " ");
  const valueClass = align === "left"
    ? "text-xs text-foreground/70 leading-relaxed"
    : "text-xs text-foreground/70 leading-relaxed text-right max-w-[60%]";
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
      <span className="text-[11px] text-white/40 uppercase tracking-wider font-medium shrink-0">{label}</span>
      <span className={valueClass}>{align === "left" && <span className="text-amber-400 mr-1.5">✓</span>}{highlightFashionTerms(displayValue)}</span>
    </div>
  );
}
