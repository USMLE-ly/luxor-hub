import { r as reactExports, j as jsxRuntimeExports } from "./index-DbMNM3HR.js";
import { P as PrivacyNotice } from "./PrivacyNotice-B_cCHgHg.js";
import { A as AppLayout } from "./AppLayout-z0hM-vSW.js";
import { c as cn, e as useAuth, s as supabase, B as Button } from "./AppContent-_r6To3FT.js";
import { C as Card, a as CardContent } from "./card-D4-p7cnU.js";
import { B as Badge } from "./badge-DIG_I_On.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-DCQAOkuu.js";
import { S as Select, a as SelectTrigger, b as SelectValue, d as SelectContent, e as SelectItem } from "./select-UYTgCGSJ.js";
import { t as toast } from "./index-eweMusN_.js";
import { G as GlowingEffect } from "./glowing-effect-DYoLES-k.js";
import { R as RainbowButton } from "./rainbow-button-LuMsQIkk.js";
import { m as motion } from "./proxy-BW1EVREd.js";
import { S as Sparkles } from "./sparkles-Dn0VJ8Xg.js";
import { P as Palette } from "./palette-B4msHapo.js";
import { W as WandSparkles } from "./wand-sparkles-B0E1KWXD.js";
import { H as History } from "./history-ChB6yANX.js";
import { L as LoaderCircle } from "./loader-circle-BwBuuCzi.js";
import { A as AnimatePresence } from "./index-JsMeU7Bl.js";
import { D as Download } from "./download-r3aO6a6G.js";
import { H as Heart } from "./heart-9MJilOc4.js";
import { C as Check } from "./check-Y0AmOnPb.js";
import { S as Shirt } from "./shirt-DOs4UNgN.js";
import { I as Image } from "./image-Bmq8x8yJ.js";
import { S as Share2 } from "./share-2-B_4p6KG1.js";
import { T as Trash2 } from "./trash-2-D0lMQ9Gw.js";
import { E as Eye } from "./eye-DwFt7xp7.js";
import { L as Link } from "./link-DPGv8dSD.js";
import { T as Twitter } from "./twitter-0cmkcCgC.js";
import "./shield-check-oY6EcCHy.js";
import "./BottomNav-BJG5rdUS.js";
import "./index-CGyMD0h7.js";
import "./index-Skka8Gpk.js";
import "./index-dLjowoPm.js";
import "./index-YYaHjnEQ.js";
import "./index-Ds-JyBc4.js";
import "./index-BKDZmRbY.js";
import "./index-iZFGYXPD.js";
import "./index-tPWAgP5u.js";
import "./index-dLIQLZ_n.js";
import "./index-Do4Kx4MT.js";
import "./index-Bi2Gmo1d.js";
import "./chevron-down-CUuC4RMp.js";
import "./index-CqBZZwGN.js";
const Textarea = reactExports.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "textarea",
    {
      className: cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ref,
      ...props
    }
  );
});
Textarea.displayName = "Textarea";
const GARMENT_TYPES = [
  "Dress",
  "Blazer",
  "Jacket",
  "Coat",
  "Top",
  "Blouse",
  "Shirt",
  "Trousers",
  "Skirt",
  "Jumpsuit",
  "Knitwear",
  "Accessories"
];
function FashionDesigner() {
  const { user } = useAuth();
  const [prompt, setPrompt] = reactExports.useState("");
  const [garmentType, setGarmentType] = reactExports.useState("Dress");
  const [isGenerating, setIsGenerating] = reactExports.useState(false);
  const [designs, setDesigns] = reactExports.useState([]);
  const [gallery, setGallery] = reactExports.useState([]);
  const [loadingGallery, setLoadingGallery] = reactExports.useState(false);
  const [archetype, setArchetype] = reactExports.useState(null);
  const [colorSeason, setColorSeason] = reactExports.useState(null);
  const [bestColors, setBestColors] = reactExports.useState([]);
  const [shareOpen, setShareOpen] = reactExports.useState(null);
  const [copied, setCopied] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("style_profiles").select("archetype, style_formula, preferences").eq("user_id", user.id).maybeSingle();
      if (data) {
        setArchetype(data.archetype);
        const formula = data.style_formula;
        const prefs = data.preferences;
        if (formula == null ? void 0 : formula.colorSeason) setColorSeason(formula.colorSeason);
        else if (prefs == null ? void 0 : prefs.colorSeason) setColorSeason(prefs.colorSeason);
        if (formula == null ? void 0 : formula.bestColors) setBestColors(formula.bestColors);
        else if (prefs == null ? void 0 : prefs.bestColors) setBestColors(prefs.bestColors);
      }
    })();
    fetchGallery();
  }, [user]);
  const fetchGallery = async () => {
    if (!user) return;
    setLoadingGallery(true);
    const { data } = await supabase.from("fashion_designs").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setGallery(data || []);
    setLoadingGallery(false);
  };
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Describe what you'd like designed");
      return;
    }
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("design-clothing", {
        body: { prompt, archetype, colorSeason, bestColors, garmentType }
      });
      if (error) throw error;
      if (data == null ? void 0 : data.error) throw new Error(data.error);
      setDesigns((prev) => [{
        imageUrl: data.imageUrl,
        description: data.description,
        prompt,
        garmentType,
        timestamp: Date.now()
      }, ...prev]);
      toast.success("Design created!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Design generation failed");
    } finally {
      setIsGenerating(false);
    }
  };
  const handleSaveDesign = async (design, index) => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from("fashion_designs").insert({
        user_id: user.id,
        image_url: design.imageUrl,
        prompt: design.prompt,
        description: design.description || null,
        garment_type: design.garmentType
      }).select("id").single();
      if (error) throw error;
      const updated = [...designs];
      updated[index] = { ...updated[index], dbId: data.id };
      setDesigns(updated);
      toast.success("Design saved to gallery!");
      fetchGallery();
    } catch (err) {
      toast.error(err.message || "Failed to save");
    }
  };
  const handleToggleFavorite = async (id) => {
    const item = gallery.find((g) => g.id === id);
    if (!item) return;
    const { error } = await supabase.from("fashion_designs").update({ is_favorite: !item.is_favorite }).eq("id", id);
    if (!error) {
      setGallery((prev) => prev.map((g) => g.id === id ? { ...g, is_favorite: !g.is_favorite } : g));
      toast.success(item.is_favorite ? "Removed from favorites" : "Added to favorites ❤️");
    }
  };
  const handleTogglePublic = async (id) => {
    const item = gallery.find((g) => g.id === id);
    if (!item) return;
    const { error } = await supabase.from("fashion_designs").update({ is_public: !item.is_public }).eq("id", id);
    if (!error) {
      setGallery((prev) => prev.map((g) => g.id === id ? { ...g, is_public: !g.is_public } : g));
      toast.success(item.is_public ? "Design made private" : "Design shared publicly! 🌍");
    }
  };
  const handleDeleteDesign = async (id) => {
    const { error } = await supabase.from("fashion_designs").delete().eq("id", id);
    if (!error) {
      setGallery((prev) => prev.filter((g) => g.id !== id));
      toast.success("Design deleted");
    }
  };
  const handleDownload = (url, type) => {
    const link = document.createElement("a");
    link.download = `lexor-design-${type.toLowerCase()}-${Date.now()}.png`;
    link.href = url;
    link.click();
    toast.success("Design downloaded!");
  };
  const handleCopyShareLink = (design) => {
    const text = `Check out my AI-designed ${design.garment_type}: "${design.prompt}" ✨ Created with LEXOR®`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2e3);
  };
  const handleShareTwitter = (design) => {
    const text = `Check out my AI-designed ${design.garment_type}: "${design.prompt}" ✨ Created with LEXOR®`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };
  const inspirationPrompts = [
    "A structured blazer with asymmetric lapels and subtle texture",
    "A flowing evening gown with draped shoulders",
    "A minimalist oversized coat with clean lines",
    "A tailored jumpsuit with architectural details",
    "A deconstructed shirt with raw-edge details"
  ];
  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 6e4);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-8 max-w-6xl mx-auto space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-[60px]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-4xl font-bold text-foreground relative", children: [
        "AI Fashion ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gold-text", children: "Designer" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-2 text-lg", children: "Create custom clothing designs powered by your Style DNA" })
    ] }),
    (archetype || colorSeason) && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "flex flex-wrap gap-2", children: [
      archetype && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-3 h-3 mr-1" }),
        archetype
      ] }),
      colorSeason && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Palette, { className: "w-3 h-3 mr-1" }),
        colorSeason
      ] }),
      bestColors.slice(0, 4).map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 px-2 py-1 rounded-full bg-muted/50 border border-border text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3 h-3 rounded-full", style: { backgroundColor: c } }),
        c
      ] }, i))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "create", className: "w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-2 mb-6 bg-muted/50 backdrop-blur-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "create", className: "flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(WandSparkles, { className: "w-4 h-4" }),
          " Create"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "gallery", className: "flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground", onClick: fetchGallery, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "w-4 h-4" }),
          " Gallery (",
          gallery.length,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "create", className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-[1.5rem] border-[0.75px] border-border p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(GlowingEffect, { spread: 40, glow: true, proximity: 64, inactiveZone: 0.01, borderWidth: 3 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "glass-card border-0 shadow-none", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6 space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  placeholder: "Describe your dream garment... e.g., 'A structured blazer with asymmetric lapels in deep burgundy'",
                  value: prompt,
                  onChange: (e) => setPrompt(e.target.value),
                  className: "min-h-[100px] bg-background/50"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: garmentType, onValueChange: setGarmentType, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "bg-background/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: GARMENT_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(RainbowButton, { onClick: handleGenerate, disabled: isGenerating || !prompt.trim(), className: "w-full", children: [
                  isGenerating ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(WandSparkles, { className: "w-4 h-4 mr-2" }),
                  "Design"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Try:" }),
              inspirationPrompts.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => setPrompt(p),
                  className: "text-xs px-2 py-1 rounded-full bg-muted/30 border border-border hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground",
                  children: [
                    p.slice(0, 40),
                    "…"
                  ]
                },
                i
              ))
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(PrivacyNotice, {})
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: designs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-foreground", children: "New Designs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: designs.map((design, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: { delay: i * 0.1 },
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "glass-card overflow-hidden group", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-square", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: design.imageUrl, alt: design.prompt, className: "w-full h-full object-cover" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", size: "sm", onClick: () => handleDownload(design.imageUrl, design.garmentType), children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-3 h-3 mr-1" }),
                      " Download"
                    ] }),
                    !design.dbId && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", size: "sm", onClick: () => handleSaveDesign(design, i), children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "w-3 h-3 mr-1" }),
                      " Save"
                    ] }),
                    design.dbId && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "text-xs", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-3 h-3 mr-1" }),
                      " Saved"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "absolute top-3 left-3 bg-black/60 text-white border-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Shirt, { className: "w-3 h-3 mr-1" }),
                    " ",
                    design.garmentType
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground line-clamp-2", children: design.prompt }),
                  design.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-2 line-clamp-3", children: design.description })
                ] })
              ] })
            },
            design.timestamp
          )) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "gallery", className: "space-y-6", children: loadingGallery ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin text-primary" }) }) : gallery.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "glass-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-12 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "w-12 h-12 text-muted-foreground/40 mx-auto mb-3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "No saved designs yet. Create and save your first design!" })
      ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: gallery.map((design, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: i * 0.05 },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "glass-card overflow-hidden group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-square", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: design.image_url, alt: design.prompt, className: "w-full h-full object-cover" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", size: "sm", onClick: () => handleDownload(design.image_url, design.garment_type), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-3 h-3" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", size: "sm", onClick: () => setShareOpen(shareOpen === design.id ? null : design.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "w-3 h-3" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", size: "sm", onClick: () => handleDeleteDesign(design.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3 h-3" }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-3 left-3 flex gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-black/60 text-white border-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Shirt, { className: "w-3 h-3 mr-1" }),
                " ",
                design.garment_type
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-3 right-3 flex gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => handleToggleFavorite(design.id),
                    className: "w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: `w-4 h-4 ${design.is_favorite ? "fill-red-500 text-red-500" : "text-white"}` })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => handleTogglePublic(design.id),
                    className: "w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: `w-4 h-4 ${design.is_public ? "text-primary" : "text-white"}` })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground line-clamp-2", children: design.prompt }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: timeAgo(design.created_at) }),
                design.is_favorite && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] border-red-500/30 text-red-400", children: "❤️ Favorite" }),
                design.is_public && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] border-primary/30 text-primary", children: "🌍 Public" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: shareOpen === design.id && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                motion.div,
                {
                  initial: { opacity: 0, height: 0 },
                  animate: { opacity: 1, height: "auto" },
                  exit: { opacity: 0, height: 0 },
                  className: "mt-3 flex gap-2",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleCopyShareLink(design), children: [
                      copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-3 h-3 mr-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { className: "w-3 h-3 mr-1" }),
                      "Copy"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleShareTwitter(design), children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Twitter, { className: "w-3 h-3 mr-1" }),
                      " Tweet"
                    ] })
                  ]
                }
              ) })
            ] })
          ] })
        },
        design.id
      )) }) })
    ] })
  ] }) });
}
export {
  FashionDesigner as default
};
