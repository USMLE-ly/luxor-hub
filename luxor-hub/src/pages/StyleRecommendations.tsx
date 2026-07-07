import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { toast } from "sonner";
import { notifyEvent } from "@/lib/notificationService";
import { motion, AnimatePresence } from "framer-motion";
import {Spinner, UploadSimple, Camera, Palette, FaceMask, User, Star, Lightbulb, Warning} from "@phosphor-icons/react";
import { humanizeText } from "@/lib/humanizer";
import InfoCardsTable, { type RowData, type CellData } from "@/components/ui/info-cards-table";
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

const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_PUBLIC_API_URL || "";

function getApiUrl(): string {
  return apiBase || (window.location.hostname === "localhost" ? "http://localhost:5000" : "");
}

export default function StyleRecommendationsPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
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

  // ── Smooth auto-increment progress: 0 → 95% during loading, jumps to 100% on success ──
  useEffect(() => {
    if (!analyzing) {
      setDisplayProgress(progressValue);
      return;
    }
    setDisplayProgress(0);
    const timer = setInterval(() => {
      setDisplayProgress(prev => {
        if (prev >= 95) return 95;
        const inc = prev < 30 ? 3 : prev < 60 ? 2 : prev < 80 ? 1.5 : 1;
        return Math.min(prev + inc, 95);
      });
    }, 200);
    return () => clearInterval(timer);
  }, [analyzing, progressValue]);
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
      // Strip 'for' key
      if (styleData && typeof styleData === 'object') delete (styleData as any).for;
      console.log("[STYLE-ANALYZE RAW RESPONSE]", styleData);
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
      // Strip 'for' key
      if (recData && typeof recData === 'object') delete (recData as any).for;
      console.log("[RECOMMENDATIONS API RAW RESPONSE]", recData);
      if (recData.success && recData.recommendations) {
        console.log("[RECOMMENDATIONS] Data received:", Object.keys(recData.recommendations));
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
      // Strip 'for' key
      if (reviewData && typeof reviewData === 'object') delete (reviewData as any).for;
      console.log("[OUTFIT-REVIEW RAW RESPONSE]", reviewData);
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
            <motion.div key="recommendations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              {/* Unified Recommendations Table */}
              <InfoCardsTable rows={buildTableData(recommendations)} />
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
              className="w-full"
            >
              <FashionReviewCard
                overallScore={outfitReview.overall_score}
                scoreBreakdown={outfitReview.scores}
                strengths={outfitReview.strengths}
                improvements={outfitReview.improvements}
                honestSummary={outfitReview.honest_summary}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-white/5 last:border-0">
      <span className="text-xs text-white/50">{label}</span>
      <span className="text-xs text-foreground/80 font-medium capitalize">{String(value).replace(/_/g, " ")}</span>
    </div>
  );
}
