import { j as jsxRuntimeExports, r as reactExports } from "./index-UvNQFckZ.js";
import { T as TierGate } from "./TierGate-O49JfB3-.js";
import { A as AppLayout } from "./AppLayout-C2fJ8nQA.js";
import { e as useAuth, s as supabase, B as Button } from "./AppContent-9kIwMzo7.js";
import { C as Card, a as CardContent } from "./card-BPQNt8Zy.js";
import { B as Badge } from "./badge-DLtZ_P3B.js";
import { t as toast } from "./index-CXhnqnHQ.js";
import { G as GlowingEffect } from "./glowing-effect-D_W-Xryh.js";
import { R as RainbowButton } from "./rainbow-button-0VsxECJj.js";
import { m as motion } from "./proxy-DuKBf0zJ.js";
import { X } from "./x-DeR7balG.js";
import { C as Camera } from "./camera-kUHluzGe.js";
import { S as Shirt } from "./shirt-iptwcFqR.js";
import { S as Sparkles } from "./sparkles-CovKwywf.js";
import { L as LoaderCircle } from "./loader-circle-BUsfaJ2b.js";
import { C as Check } from "./check-DftUbDuf.js";
import { S as Share2 } from "./share-2-Db4RYI35.js";
import { D as Download } from "./download-nt1DcBSk.js";
import { I as Image } from "./image-BSYT6HAI.js";
import "./usePlanTier-CsntS8Ov.js";
import "./useQuery-1wxa5yCG.js";
import "./planRestrictions-__Vqe2nr.js";
import "./lock-BDMviZcR.js";
import "./arrow-right-03HXU5ql.js";
import "./BottomNav-DDKq4ZnH.js";
import "./index-CI22_94N.js";
import "./index-CXACtV8R.js";
function VirtualTryOn() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TierGate, { requiredTier: "elite", featureName: "Virtual Try-On", children: /* @__PURE__ */ jsxRuntimeExports.jsx(VirtualTryOnInner, {}) });
}
function VirtualTryOnInner() {
  const { user } = useAuth();
  const [userPhoto, setUserPhoto] = reactExports.useState(null);
  const [userPhotoFile, setUserPhotoFile] = reactExports.useState(null);
  const [designs, setDesigns] = reactExports.useState([]);
  const [selectedDesign, setSelectedDesign] = reactExports.useState(null);
  const [isProcessing, setIsProcessing] = reactExports.useState(false);
  const [resultImage, setResultImage] = reactExports.useState(null);
  const [results, setResults] = reactExports.useState([]);
  const fileInputRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("fashion_designs").select("id, image_url, prompt, garment_type").eq("user_id", user.id).order("created_at", { ascending: false });
      setDesigns(data || []);
    })();
  }, [user]);
  const handlePhotoSelect = (e) => {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Photo must be under 10MB");
      return;
    }
    setUserPhotoFile(file);
    setResultImage(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      var _a2;
      return setUserPhoto((_a2 = ev.target) == null ? void 0 : _a2.result);
    };
    reader.readAsDataURL(file);
  };
  const handleTryOn = async () => {
    if (!userPhoto || !selectedDesign || !user) return;
    setIsProcessing(true);
    setResultImage(null);
    try {
      const { data, error } = await supabase.functions.invoke("virtual-tryon", {
        body: {
          userPhotoUrl: userPhoto,
          designImageUrl: selectedDesign.image_url,
          garmentType: selectedDesign.garment_type
        }
      });
      if (error) throw error;
      if (data == null ? void 0 : data.error) throw new Error(data.error);
      setResultImage(data.resultImageUrl);
      setResults((prev) => [{
        imageUrl: data.resultImageUrl,
        designPrompt: selectedDesign.prompt,
        timestamp: Date.now()
      }, ...prev]);
      toast.success("Virtual try-on complete! ✨");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Try-on failed");
    } finally {
      setIsProcessing(false);
    }
  };
  const handleDownload = (url) => {
    const link = document.createElement("a");
    link.download = `luxor-tryon-${Date.now()}.png`;
    link.href = url;
    link.click();
    toast.success("Image downloaded!");
  };
  const [shareLink, setShareLink] = reactExports.useState(null);
  const handleShare = async (imageUrl) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Virtual Try-On by LEXOR®",
          text: "Check out this virtual try-on!",
          url: imageUrl
        });
      } else {
        await navigator.clipboard.writeText(imageUrl);
        setShareLink(imageUrl);
        toast.success("Link copied to clipboard! Share with friends for their vote ✨");
        setTimeout(() => setShareLink(null), 3e3);
      }
    } catch {
      toast.error("Share failed");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-8 max-w-6xl mx-auto space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-[60px]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-4xl font-bold text-foreground relative", children: [
        "Virtual ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gold-text", children: "Try-On" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-2 text-lg", children: "See your AI-designed garments on you using AI image editing" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-medium text-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px]", children: "1" }),
          " Your Photo"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-[1.25rem] border-[0.75px] border-border p-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(GlowingEffect, { spread: 30, glow: true, proximity: 48, inactiveZone: 0.01, borderWidth: 2 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "glass-card border-0 shadow-none overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: userPhoto ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: userPhoto, alt: "Your photo", className: "w-full aspect-[3/4] object-cover rounded-lg" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => {
                  setUserPhoto(null);
                  setUserPhotoFile(null);
                  setResultImage(null);
                },
                className: "absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4 text-white" })
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "aspect-[3/4] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-muted/20 transition-colors rounded-lg",
              onClick: () => {
                var _a;
                return (_a = fileInputRef.current) == null ? void 0 : _a.click();
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "w-10 h-10 text-muted-foreground/40" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center", children: "Upload a full-body photo" })
              ]
            }
          ) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", onChange: handlePhotoSelect, className: "hidden" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-medium text-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px]", children: "2" }),
          " Select Design"
        ] }),
        designs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "glass-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-8 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Shirt, { className: "w-10 h-10 text-muted-foreground/40 mx-auto mb-2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No saved designs yet. Create designs in the Fashion Designer first!" })
        ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2 max-h-[500px] overflow-y-auto pr-1", children: designs.map((design) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            whileHover: { scale: 1.02 },
            className: `relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${(selectedDesign == null ? void 0 : selectedDesign.id) === design.id ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-border"}`,
            onClick: () => setSelectedDesign(design),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: design.image_url, alt: design.prompt, className: "w-full aspect-square object-cover" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-white line-clamp-1", children: design.garment_type }) }),
              (selectedDesign == null ? void 0 : selectedDesign.id) === design.id && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-3 h-3 text-primary-foreground" }) })
            ]
          },
          design.id
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-medium text-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px]", children: "3" }),
          " Try-On Result"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          RainbowButton,
          {
            onClick: handleTryOn,
            disabled: !userPhoto || !selectedDesign || isProcessing,
            className: "w-full mb-3",
            children: [
              isProcessing ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-4 h-4 mr-2" }),
              isProcessing ? "Processing…" : "Try It On"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "glass-card overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: isProcessing ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "aspect-[3/4] flex flex-col items-center justify-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-8 h-8 animate-spin text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "AI is dressing you…" })
        ] }) : resultImage ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: resultImage, alt: "Try-on result", className: "w-full aspect-[3/4] object-cover rounded-lg" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-3 right-3 flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", size: "sm", onClick: () => handleShare(resultImage), children: [
              shareLink === resultImage ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-3 h-3 mr-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "w-3 h-3 mr-1" }),
              shareLink === resultImage ? "Copied!" : "Share"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", size: "sm", onClick: () => handleDownload(resultImage), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-3 h-3 mr-1" }),
              " Save"
            ] })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "aspect-[3/4] flex flex-col items-center justify-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "w-10 h-10 text-muted-foreground/30" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center", children: "Upload a photo and select a design to begin" })
        ] }) }) })
      ] })
    ] }),
    results.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-foreground", children: "Previous Try-Ons" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3", children: results.slice(1).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          className: "relative rounded-lg overflow-hidden border border-border group cursor-pointer",
          onClick: () => setResultImage(r.imageUrl),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: r.imageUrl, alt: "Try-on", className: "w-full aspect-[3/4] object-cover" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", size: "sm", onClick: (e) => {
              e.stopPropagation();
              handleDownload(r.imageUrl);
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-3 h-3" }) }) })
          ]
        },
        r.timestamp
      )) })
    ] })
  ] }) });
}
export {
  VirtualTryOn as default
};
