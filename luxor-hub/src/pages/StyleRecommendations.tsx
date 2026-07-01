import { useState, useRef } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, Upload, Camera, Shirt, Palette, FaceIcon, User, Star, Lightbulb, AlertTriangle } from "lucide-react";

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

export default function StyleRecommendationsPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<StyleAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [outfitReview, setOutfitReview] = useState<OutfitReview | null>(null);
  const [activeTab, setActiveTab] = useState<"analyze" | "recommendations" | "review">("analyze");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setAnalysis(null);
      setRecommendations(null);
      setOutfitReview(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imagePreview) return;
    setAnalyzing(true);
    const api = apiBase || (window.location.hostname === "localhost" ? "http://localhost:5000" : "");
    try {
      const resp = await fetch(api + "/api/v1/style-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_b64: imagePreview }),
      });
      const data = await resp.json();
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
        toast.success("Analysis complete!");
        setActiveTab("recommendations");
        const recResp = await fetch(api + "/api/v1/style-recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ analysis: data.analysis }),
        });
        const recData = await recResp.json();
        if (recData.success && recData.recommendations) {
          setRecommendations(recData.recommendations);
        }
      } else {
        toast.error(data.error || "Analysis failed");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to analyze");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReview = async () => {
    if (!imagePreview) return;
    setAnalyzing(true);
    const api = apiBase || (window.location.hostname === "localhost" ? "http://localhost:5000" : "");
    try {
      const resp = await fetch(api + "/api/v1/outfit-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_b64: imagePreview, occasion: "casual" }),
      });
      const data = await resp.json();
      if (data.success && data.review) {
        setOutfitReview(data.review);
        toast.success("Outfit reviewed!");
      } else {
        toast.error(data.error || "Review failed");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to review");
    } finally {
      setAnalyzing(false);
    }
  };

  const scoreColor = (s: number) => s >= 80 ? "text-green-500" : s >= 60 ? "text-yellow-500" : "text-red-400";

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

        <div className="flex flex-col items-center gap-6 p-8 rounded-2xl border border-white/10 bg-zinc-900/30 backdrop-blur-sm">
          {imagePreview ? (
            <div className="relative w-full max-w-md">
              <img src={imagePreview} alt="Upload" className="w-full h-auto max-h-[50vh] object-contain rounded-xl" />
              <button onClick={() => { setImagePreview(null); setAnalysis(null); setRecommendations(null); setOutfitReview(null); }}
                className="absolute top-2 right-2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs">\u2715</button>
            </div>
          ) : (
            <div onClick={() => fileInputRef.current?.click()} className="w-full max-w-md aspect-[4/3] rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/50 transition-all bg-zinc-900/40">
              <Camera className="w-12 h-12 text-white/30" />
              <p className="text-white/50 text-sm">Tap to upload a full-body photo</p>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

          <div className="flex gap-3">
            <Button onClick={handleAnalyze} disabled={!imagePreview || analyzing} className="gap-2">
              {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <User className="w-4 h-4" />}
              {analyzing ? "Analyzing..." : "Analyze Body & Face"}
            </Button>
            <Button onClick={handleReview} disabled={!imagePreview || analyzing} variant="outline" className="gap-2">
              <Star className="w-4 h-4" /> Review Outfit
            </Button>
          </div>
        </div>

        {analysis && (
          <div className="flex gap-2 border-b border-white/10 pb-2">
            {(["analyze", "recommendations", "review"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={"px-4 py-2 rounded-lg text-sm font-medium transition-all " + (
                  activeTab === tab ? "bg-primary/20 text-primary" : "text-white/50 hover:text-white/80"
                )}>
                {tab === "analyze" ? "\u2728 Analysis" : tab === "recommendations" ? "\u2728 Recommendations" : "\u2728 Review"}
              </button>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === "analyze" && analysis && (
            <motion.div key="analysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl p-5">
                <div className="flex items-center gap-2 mb-4"><span className="text-primary"><FaceIcon className="w-4 h-4" /></span><h3 className="text-sm font-semibold text-white/80">Face Analysis</h3></div>
                <InfoRow label="Face Shape" value={analysis.face_shape} />
                <InfoRow label="Eye Shape" value={analysis.eye_shape} />
                <InfoRow label="Eye Size" value={analysis.eye_size} />
                <InfoRow label="Nose Shape" value={analysis.nose_shape} />
                <InfoRow label="Lip Shape" value={analysis.lip_shape} />
                <InfoRow label="Age Est." value={analysis.age_estimation} />
                <InfoRow label="Gender" value={analysis.gender_presentation} />
              </div>
              <div className="rounded-xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl p-5">
                <div className="flex items-center gap-2 mb-4"><span className="text-primary"><User className="w-4 h-4" /></span><h3 className="text-sm font-semibold text-white/80">Body Analysis</h3></div>
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
              <div className="rounded-xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl p-5">
                <div className="flex items-center gap-2 mb-4"><span className="text-primary"><Palette className="w-4 h-4" /></span><h3 className="text-sm font-semibold text-white/80">Skin & Hair</h3></div>
                <InfoRow label="Skin Tone" value={analysis.skin_tone} />
                <InfoRow label="Undertone" value={analysis.skin_undertone} />
                <InfoRow label="Hair Color" value={analysis.hair_color} />
              </div>
              <div className="rounded-xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl p-5">
                <div className="flex items-center gap-2 mb-4"><span className="text-primary"><Star className="w-4 h-4" /></span><h3 className="text-sm font-semibold text-white/80">Style Score</h3></div>
                <div className="text-3xl font-bold mb-2 text-yellow-500">{Number(analysis.current_style_score) * 10}/100</div>
                <p className="text-sm text-white/70 italic">"{analysis.overall_style_profile}"</p>
              </div>
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
      <span className="text-xs text-white/80 font-medium capitalize">{String(value).replace(/_/g, " ")}</span>
    </div>
  );
}
