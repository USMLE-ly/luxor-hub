import { r as reactExports, j as jsxRuntimeExports } from "./index-DFKWyX4C.js";
import { A as AppLayout } from "./AppLayout-DWOzWVNp.js";
import { B as Button } from "./AppContent-bHL5AEXz.js";
import { t as toast } from "./index-Dz_RoOUd.js";
import { m as motion } from "./proxy-B0zWGJQh.js";
import { C as Camera } from "./camera-CF-kjSuO.js";
import { L as LoaderCircle } from "./loader-circle-F4mLE20_.js";
import { U as User } from "./user-_vS23Oj8.js";
import { S as Star } from "./star-DWNiNoWD.js";
import { A as AnimatePresence } from "./index-6kPRtehs.js";
import { S as ScanFace } from "./scan-face-DBSLEeqn.js";
import { P as Palette } from "./palette-BXKWRJDR.js";
import "./BottomNav-DHtgff54.js";
import "./shirt-DGXfgTDR.js";
const apiBase = "https://nice-useful-plot--al-bosify.replit.app";
function StyleRecommendationsPage() {
  const [imagePreview, setImagePreview] = reactExports.useState(null);
  const [analyzing, setAnalyzing] = reactExports.useState(false);
  const [analysis, setAnalysis] = reactExports.useState(null);
  const [recommendations, setRecommendations] = reactExports.useState(null);
  const [outfitReview, setOutfitReview] = reactExports.useState(null);
  const [activeTab, setActiveTab] = reactExports.useState("analyze");
  const fileInputRef = reactExports.useRef(null);
  const handleImageUpload = (e) => {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setAnalysis(null);
      setRecommendations(null);
      setOutfitReview(null);
    };
    reader.readAsDataURL(file);
  };
  const handleAnalyze = async () => {
    if (!imagePreview) return;
    setAnalyzing(true);
    const api = apiBase;
    try {
      const resp = await fetch(api + "/api/v1/style-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_b64: imagePreview })
      });
      const data = await resp.json();
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
        toast.success("Analysis complete!");
        setActiveTab("recommendations");
        const recResp = await fetch(api + "/api/v1/style-recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ analysis: data.analysis })
        });
        const recData = await recResp.json();
        if (recData.success && recData.recommendations) {
          setRecommendations(recData.recommendations);
        }
      } else {
        toast.error(data.error || "Analysis failed");
      }
    } catch (e) {
      toast.error(e.message || "Failed to analyze");
    } finally {
      setAnalyzing(false);
    }
  };
  const handleReview = async () => {
    if (!imagePreview) return;
    setAnalyzing(true);
    const api = apiBase;
    try {
      const resp = await fetch(api + "/api/v1/outfit-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_b64: imagePreview, occasion: "casual" })
      });
      const data = await resp.json();
      if (data.success && data.review) {
        setOutfitReview(data.review);
        toast.success("Outfit reviewed!");
      } else {
        toast.error(data.error || "Review failed");
      }
    } catch (e) {
      toast.error(e.message || "Failed to review");
    } finally {
      setAnalyzing(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-8 mx-auto max-w-7xl space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-4xl font-bold text-foreground", children: [
        "AI Style ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gold-text", children: "Recommendations" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-2 text-lg", children: "Upload a photo for honest body/face analysis, color advice, and personalized styling tips." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-6 p-8 rounded-2xl border border-white/10 bg-zinc-900/30 backdrop-blur-sm", children: [
      imagePreview ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full max-w-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: imagePreview, alt: "Upload", className: "w-full h-auto max-h-[50vh] object-contain rounded-xl" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setImagePreview(null);
              setAnalysis(null);
              setRecommendations(null);
              setOutfitReview(null);
            },
            className: "absolute top-2 right-2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs",
            children: "\\u2715"
          }
        )
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => {
        var _a;
        return (_a = fileInputRef.current) == null ? void 0 : _a.click();
      }, className: "w-full max-w-md aspect-[4/3] rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/50 transition-all bg-zinc-900/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "w-12 h-12 text-white/30" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/50 text-sm", children: "Tap to upload a full-body photo" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", onChange: handleImageUpload, className: "hidden" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleAnalyze, disabled: !imagePreview || analyzing, className: "gap-2", children: [
          analyzing ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-4 h-4" }),
          analyzing ? "Analyzing..." : "Analyze Body & Face"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleReview, disabled: !imagePreview || analyzing, variant: "outline", className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "w-4 h-4" }),
          " Review Outfit"
        ] })
      ] })
    ] }),
    analysis && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 border-b border-white/10 pb-2", children: ["analyze", "recommendations", "review"].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => setActiveTab(tab),
        className: "px-4 py-2 rounded-lg text-sm font-medium transition-all " + (activeTab === tab ? "bg-primary/20 text-primary" : "text-white/50 hover:text-white/80"),
        children: tab === "analyze" ? "✨ Analysis" : tab === "recommendations" ? "✨ Recommendations" : "✨ Review"
      },
      tab
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: activeTab === "analyze" && analysis && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScanFace, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-white/80", children: "Face Analysis" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Face Shape", value: analysis.face_shape }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Eye Shape", value: analysis.eye_shape }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Eye Size", value: analysis.eye_size }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Nose Shape", value: analysis.nose_shape }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Lip Shape", value: analysis.lip_shape }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Age Est.", value: analysis.age_estimation }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Gender", value: analysis.gender_presentation })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-white/80", children: "Body Analysis" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Body Type", value: analysis.body_type }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Height", value: analysis.height_estimation }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Weight", value: analysis.weight_estimation }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "BMI", value: analysis.bmi_category }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Proportions", value: analysis.body_proportions }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Shoulders", value: analysis.shoulder_width }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Waist/Hip", value: analysis.waist_to_hip_ratio }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Neck", value: analysis.neck_length }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Legs", value: analysis.leg_length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Palette, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-white/80", children: "Skin & Hair" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Skin Tone", value: analysis.skin_tone }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Undertone", value: analysis.skin_undertone }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Hair Color", value: analysis.hair_color })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-white/80", children: "Style Score" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-3xl font-bold mb-2 text-yellow-500", children: [
          Number(analysis.current_style_score) * 10,
          "/100"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-white/70 italic", children: [
          '"',
          analysis.overall_style_profile,
          '"'
        ] })
      ] })
    ] }, "analysis") })
  ] }) });
}
function InfoRow({ label, value }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between py-1.5 border-b border-white/5 last:border-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-white/50", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-white/80 font-medium capitalize", children: String(value).replace(/_/g, " ") })
  ] });
}
export {
  StyleRecommendationsPage as default
};
