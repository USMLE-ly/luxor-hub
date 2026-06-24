import { r as reactExports, j as jsxRuntimeExports } from "./index-CHmOPdwM.js";
import { P as PrivacyNotice } from "./PrivacyNotice-DLJzhzbV.js";
import { A as AppLayout } from "./AppLayout-8H8QbKOT.js";
import { d as createLucideIcon, e as useAuth, B as Button, T as TriangleAlert, s as supabase } from "./AppContent-Bbhy20ck.js";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle } from "./card-BVu4fzp-.js";
import { B as Badge } from "./badge-C4Dmqa7k.js";
import { P as Progress } from "./progress-C0weoGsP.js";
import { t as toast } from "./index-Bzf1gHD_.js";
import { G as GlowingEffect } from "./glowing-effect-K1N7oBz6.js";
import { R as RainbowButton } from "./rainbow-button-C2qCP4pk.js";
import { m as motion } from "./proxy-PXi4GB5x.js";
import { L as LoaderCircle } from "./loader-circle-BQgBL-tH.js";
import { C as Camera } from "./camera-BGwV88UO.js";
import { S as Sparkles } from "./sparkles-DaDdlGiv.js";
import { T as Trash2 } from "./trash-2-BDf35Op1.js";
import { C as CircleCheck } from "./circle-check-CgzBKpc_.js";
import { A as AnimatePresence } from "./index-VsQuQq_u.js";
import "./shield-check-45WlOrI7.js";
import "./BottomNav-C58Vi7wF.js";
import "./shirt-B5KBwn5M.js";
import "./index-Cmi1X9dA.js";
import "./index-DgZFac8B.js";
import "./index-DjtY8y_y.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Video = createLucideIcon("Video", [
  [
    "path",
    {
      d: "m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5",
      key: "ftymec"
    }
  ],
  ["rect", { x: "2", y: "6", width: "14", height: "12", rx: "2", key: "158x01" }]
]);
function VideoAnalysis() {
  const { user } = useAuth();
  const [videoFile, setVideoFile] = reactExports.useState(null);
  const [videoUrl, setVideoUrl] = reactExports.useState(null);
  const [frames, setFrames] = reactExports.useState([]);
  const [isExtracting, setIsExtracting] = reactExports.useState(false);
  const [isAnalyzing, setIsAnalyzing] = reactExports.useState(false);
  const [extractionProgress, setExtractionProgress] = reactExports.useState(0);
  const [analysisProgress, setAnalysisProgress] = reactExports.useState(0);
  const [result, setResult] = reactExports.useState(null);
  const videoRef = reactExports.useRef(null);
  const canvasRef = reactExports.useRef(null);
  const fileInputRef = reactExports.useRef(null);
  const handleVideoSelect = (e) => {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
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
  const extractFrames = reactExports.useCallback(async () => {
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
    const extractedFrames = [];
    for (let i = 1; i <= frameCount; i++) {
      const time = interval * i;
      await new Promise((resolve) => {
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
            status: "pending"
          });
          setExtractionProgress(Math.round(i / frameCount * 100));
          resolve();
        };
      });
    }
    setFrames(extractedFrames);
    setIsExtracting(false);
    toast.success(`Extracted ${extractedFrames.length} key frames`);
  }, []);
  const analyzeFrames = async () => {
    var _a, _b, _c, _d, _e;
    if (!user || frames.length === 0) return;
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    const updatedFrames = [...frames];
    const frameResults = [];
    for (let i = 0; i < updatedFrames.length; i++) {
      const frame = updatedFrames[i];
      frame.status = "analyzing";
      setFrames([...updatedFrames]);
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6e4);
        const { data, error } = await supabase.functions.invoke("analyze-outfit", {
          body: { imageUrl: frame.imageDataUrl }
        });
        clearTimeout(timeout);
        if (error) throw error;
        if (data == null ? void 0 : data.error) throw new Error(data.error);
        frame.analysis = data;
        frame.status = "done";
        frameResults.push({
          frameIndex: frame.frameIndex,
          timestamp: frame.timestamp,
          styleScore: Math.min(100, Math.max(0, data.styleScore)),
          // Cap 0-100
          overallStyle: data.overallStyle,
          strengths: data.strengths || [],
          detectedItems: data.detectedItems || []
        });
      } catch (err) {
        console.error(`Frame ${i} error:`, err);
        frame.status = "error";
        toast.error(`Frame ${i + 1} analysis failed: ${((_a = err.message) == null ? void 0 : _a.includes("abort")) ? "Timed out" : err.message || "Unknown error"}`);
      }
      setAnalysisProgress(Math.round((i + 1) / updatedFrames.length * 100));
      setFrames([...updatedFrames]);
    }
    if (frameResults.length > 0) {
      const avgScore = Math.round(frameResults.reduce((s, f) => s + f.styleScore, 0) / frameResults.length);
      const allItems = frameResults.flatMap((f) => f.detectedItems);
      const uniqueItems = allItems.filter(
        (item, idx, arr) => arr.findIndex((i) => i.name === item.name && i.category === item.category) === idx
      );
      const allStrengths = [...new Set(frameResults.flatMap((f) => f.strengths))];
      const scores = frameResults.map((f) => f.styleScore);
      const consistency = 100 - (Math.max(...scores) - Math.min(...scores));
      const bestIdx = frameResults.reduce((best, f, i) => f.styleScore > frameResults[best].styleScore ? i : best, 0);
      const styleVotes = {};
      frameResults.forEach((f) => {
        styleVotes[f.overallStyle] = (styleVotes[f.overallStyle] || 0) + 1;
      });
      const dominantStyle = ((_b = Object.entries(styleVotes).sort((a, b) => b[1] - a[1])[0]) == null ? void 0 : _b[0]) || "Mixed";
      const allColors = frameResults.map((f) => {
        var _a2, _b2;
        const frame = updatedFrames.find((uf) => uf.frameIndex === f.frameIndex);
        return ((_b2 = (_a2 = frame == null ? void 0 : frame.analysis) == null ? void 0 : _a2.colorPalette) == null ? void 0 : _b2.colors) || [];
      }).flat();
      const multiResult = {
        overallScore: avgScore,
        overallStyle: dominantStyle,
        summary: `Multi-angle analysis of ${frameResults.length} frames. The outfit maintains a ${dominantStyle} aesthetic with ${consistency >= 85 ? "excellent" : consistency >= 70 ? "good" : "moderate"} consistency across angles.`,
        frameResults,
        fitAssessment: {
          consistency,
          silhouetteNotes: `Analyzed from ${frameResults.length} angles — silhouette reads as ${allStrengths.includes("Good proportions") ? "well-proportioned" : "balanced"}.`,
          proportionNotes: `${uniqueItems.length} distinct items identified across all angles.`,
          bestAngle: `Frame ${bestIdx + 1} (${frameResults[bestIdx].timestamp.toFixed(1)}s) scored highest at ${frameResults[bestIdx].styleScore}/100.`,
          recommendations: allStrengths.slice(0, 4)
        },
        colorConsistency: {
          dominantColors: [...new Set(allColors)].slice(0, 6),
          harmony: ((_e = (_d = (_c = updatedFrames[0]) == null ? void 0 : _c.analysis) == null ? void 0 : _d.colorPalette) == null ? void 0 : _e.harmony) || "Balanced",
          rating: consistency >= 85 ? "Excellent consistency" : consistency >= 70 ? "Good consistency" : "Some variation"
        }
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
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-400";
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-8 max-w-6xl mx-auto space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-[60px]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-4xl font-bold text-foreground relative", children: [
        "Video ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gold-text", children: "Analysis" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-2 text-lg", children: "Upload a video for multi-angle outfit assessment" })
    ] }),
    !videoUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-[1.5rem] border-[0.75px] border-border p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(GlowingEffect, { spread: 40, glow: true, proximity: 64, inactiveZone: 0.01, borderWidth: 3 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "glass-card border-0 shadow-none", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            whileHover: { scale: 1.01 },
            className: "border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-12 flex flex-col items-center gap-4 cursor-pointer transition-colors",
            onClick: () => {
              var _a;
              return (_a = fileInputRef.current) == null ? void 0 : _a.click();
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Video, { className: "w-12 h-12 text-primary/60" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-center", children: [
                "Drop a video or click to upload",
                /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: "MP4, MOV, WebM • Max 50MB" })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileInputRef, type: "file", accept: "video/*", onChange: handleVideoSelect, className: "hidden" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PrivacyNotice, { className: "mt-4" })
      ] }) })
    ] }),
    videoUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "glass-card overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 relative", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "video",
            {
              ref: videoRef,
              src: videoUrl,
              className: "w-full rounded-lg max-h-[400px] object-contain bg-black/50",
              controls: true,
              onLoadedMetadata: () => {
                var _a;
                return toast.info(`Video loaded: ${(_a = videoRef.current) == null ? void 0 : _a.duration.toFixed(1)}s`);
              }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 min-w-[200px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              RainbowButton,
              {
                onClick: extractFrames,
                disabled: isExtracting || isAnalyzing,
                className: "w-full",
                children: [
                  isExtracting ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "w-4 h-4 mr-2" }),
                  "Extract Frames"
                ]
              }
            ),
            frames.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              RainbowButton,
              {
                onClick: analyzeFrames,
                disabled: isAnalyzing || isExtracting,
                className: "w-full",
                children: [
                  isAnalyzing ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-4 h-4 mr-2" }),
                  "Analyze All Frames"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: reset, className: "w-full", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4 mr-2" }),
              " Start Over"
            ] })
          ] })
        ] }),
        isExtracting && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Extracting key frames…" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: extractionProgress })
        ] }),
        isAnalyzing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Analyzing frames with AI…" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: analysisProgress })
        ] })
      ] }) }),
      frames.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold text-foreground", children: [
          "Extracted Frames (",
          frames.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3", children: frames.map((frame) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0, scale: 0.9 },
            animate: { opacity: 1, scale: 1 },
            className: "relative rounded-lg overflow-hidden border border-border group",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: frame.imageDataUrl, alt: `Frame ${frame.frameIndex + 1}`, className: "w-full aspect-[3/4] object-cover" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-white/80", children: [
                  frame.timestamp.toFixed(1),
                  "s"
                ] }),
                frame.status === "analyzing" && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3 h-3 animate-spin text-primary absolute top-2 right-2" }),
                frame.status === "done" && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3 text-green-400 absolute top-2 right-2" }),
                frame.status === "error" && /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3 h-3 text-destructive absolute top-2 right-2" })
              ] }),
              frame.analysis && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2 left-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "text-[10px] bg-black/60 text-white border-0", children: [
                frame.analysis.styleScore,
                "/100"
              ] }) })
            ]
          },
          frame.frameIndex
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: result && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          className: "space-y-6",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "glass-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Multi-Angle Assessment" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-4xl font-bold ${getScoreColor(result.overallScore)}`, children: [
                  result.overallScore,
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg text-muted-foreground", children: "/100" })
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-sm", children: result.overallStyle }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: result.summary })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "glass-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg", children: "Frame-by-Frame Scores" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3", children: result.frameResults.map((fr) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center p-3 rounded-lg bg-muted/30 border border-border", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mb-1", children: [
                  "Frame ",
                  fr.frameIndex + 1
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-2xl font-bold ${getScoreColor(fr.styleScore)}`, children: fr.styleScore }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground mt-1", children: [
                  fr.timestamp.toFixed(1),
                  "s"
                ] })
              ] }, fr.frameIndex)) }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "glass-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg", children: "Fit Assessment" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "Angle Consistency" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: result.fitAssessment.consistency, className: "flex-1" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-semibold ${getScoreColor(result.fitAssessment.consistency)}`, children: [
                    result.fitAssessment.consistency,
                    "%"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg bg-muted/20 border border-border", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Silhouette" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: result.fitAssessment.silhouetteNotes })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg bg-muted/20 border border-border", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Best Angle" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: result.fitAssessment.bestAngle })
                  ] })
                ] }),
                result.fitAssessment.recommendations.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 mt-2", children: result.fitAssessment.recommendations.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs", children: r }, i)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "glass-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg", children: "Color Consistency" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1", children: result.colorConsistency.dominantColors.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-full border border-border", style: { backgroundColor: c } }, i)) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: result.colorConsistency.harmony })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: result.colorConsistency.rating })
              ] })
            ] })
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("canvas", { ref: canvasRef, className: "hidden" })
  ] }) });
}
export {
  VideoAnalysis as default
};
