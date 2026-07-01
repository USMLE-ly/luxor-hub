import { e as useNavigate, r as reactExports, j as jsxRuntimeExports } from "./index-DFKWyX4C.js";
import { A as AppLayout } from "./AppLayout-DWOzWVNp.js";
import { d as createLucideIcon, e as useAuth, s as supabase } from "./AppContent-bHL5AEXz.js";
import { t as toast } from "./index-Dz_RoOUd.js";
import { G as GlowingEffect } from "./glowing-effect-dSXnJcuP.js";
import { m as motion } from "./proxy-B0zWGJQh.js";
import { U as Upload } from "./upload-DUFbDRJG.js";
import { S as Sparkles } from "./sparkles-BHgJF6LX.js";
import { S as Search } from "./search-DZot99qo.js";
import { L as List } from "./list-DQH39FIs.js";
import { L as LoaderCircle } from "./loader-circle-F4mLE20_.js";
import { S as ShoppingBag } from "./shopping-bag-DQiRYl-Z.js";
import { T as Trash2 } from "./trash-2-LUm5GCFX.js";
import { A as AnimatePresence } from "./index-6kPRtehs.js";
import { X } from "./x-Brxpjx9f.js";
import { A as ArrowUp } from "./arrow-up-CMlYyOW7.js";
import "./BottomNav-DHtgff54.js";
import "./shirt-DGXfgTDR.js";
import "./index-D9lcWPcn.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Grid3x3 = createLucideIcon("Grid3x3", [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }],
  ["path", { d: "M3 9h18", key: "1pudct" }],
  ["path", { d: "M3 15h18", key: "5xshup" }],
  ["path", { d: "M9 3v18", key: "fh3hqa" }],
  ["path", { d: "M15 3v18", key: "14nvp0" }]
]);
const OCCASIONS = [
  { id: "casual", label: "Casual", emoji: "👕" },
  { id: "business", label: "Business", emoji: "💼" },
  { id: "party", label: "Party", emoji: "🎉" },
  { id: "date-night", label: "Date Night", emoji: "🌹" },
  { id: "sport", label: "Sport", emoji: "🏃" }
];
function DressingRoomPage() {
  const { user } = useAuth();
  useNavigate();
  const [items, setItems] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [search, setSearch] = reactExports.useState("");
  const [viewMode, setViewMode] = reactExports.useState("grid");
  const [deleting, setDeleting] = reactExports.useState(null);
  const [uploadHover, setUploadHover] = reactExports.useState(false);
  const [showOutfitModal, setShowOutfitModal] = reactExports.useState(false);
  const [outfitGenerating, setOutfitGenerating] = reactExports.useState(false);
  const [generatedOutfits, setGeneratedOutfits] = reactExports.useState([]);
  const [selectedOutfit, setSelectedOutfit] = reactExports.useState(null);
  const [step, setStep] = reactExports.useState(0);
  const [selectedOccasion, setSelectedOccasion] = reactExports.useState("");
  const fetchItems = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from("outfit_analyses").select("id,image_url,overall_style,style_score,summary,created_at").eq("user_id", user.id).order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  };
  reactExports.useEffect(() => {
    fetchItems();
  }, [user]);
  reactExports.useEffect(() => {
    if (generatedOutfits.length > 0 && !selectedOutfit) {
      setSelectedOutfit(generatedOutfits[0]);
    }
  }, [generatedOutfits]);
  const filtered = items.filter(
    (i) => {
      var _a, _b;
      return !search || ((_a = i.overall_style) == null ? void 0 : _a.toLowerCase().includes(search.toLowerCase())) || ((_b = i.summary) == null ? void 0 : _b.toLowerCase().includes(search.toLowerCase()));
    }
  );
  const handleDelete = async (id) => {
    setDeleting(id);
    await supabase.from("outfit_analyses").delete().eq("id", id);
    setItems((p) => p.filter((x) => x.id !== id));
    toast.success("Removed from dressing room");
    setDeleting(null);
  };
  const timeAgo = (d) => {
    const m = Math.floor((Date.now() - new Date(d).getTime()) / 6e4);
    return m < 60 ? `${m}m ago` : `${Math.floor(m / 60)}h ago`;
  };
  const scoreColor = (s) => s >= 80 ? "text-green-500" : s >= 60 ? "text-yellow-500" : "text-red-400";
  const openGenerateModal = () => {
    setStep(0);
    setSelectedOccasion("");
    setShowOutfitModal(true);
  };
  const handleNext = () => {
    if (step === 0 && !selectedOccasion) {
      toast.error("Pick an occasion");
      return;
    }
    setStep(1);
  };
  const handleGenerate = (count) => {
    generateOutfit(count);
  };
  const generateOutfit = async (count = 2) => {
    setShowOutfitModal(false);
    setOutfitGenerating(true);
    setGeneratedOutfits([]);
    try {
      let userProfile = {};
      if (user) {
        const { data: profile } = await supabase.from("style_profiles").select("preferences").eq("user_id", user.id).single();
        if (profile == null ? void 0 : profile.preferences) {
          userProfile = {
            bodyType: profile.preferences.bodyShape || "Average",
            height: profile.preferences.height || "Average",
            budget: profile.preferences.budget || "Mid-range",
            lifestyle: profile.preferences.lifestyle || "Casual",
            profession: profile.preferences.profession || "Professional",
            styleGoal: profile.preferences.styleGoal || "Confident",
            brands: Array.isArray(profile.preferences.brands) ? profile.preferences.brands.join(", ") : profile.preferences.brands || "Any",
            styleMood: profile.preferences.styleMood || "",
            ageRange: profile.preferences.ageRange || ""
          };
        }
      }
      let closetItems = [];
      try {
        const { data: closetData } = await supabase.from("clothing_items").select("id, name, category, color, brand, season, photo_url").eq("user_id", (user == null ? void 0 : user.id) || "").order("created_at", { ascending: false });
        if (closetData) {
          closetItems = closetData.map((item) => ({
            id: item.id,
            label: item.name || "Unknown",
            type: item.category || "other",
            color: item.color || "",
            category: item.category || "other",
            season: item.season || "",
            image_url: item.photo_url || ""
          }));
        }
      } catch (_e) {
      }
      const api = "https://nice-useful-plot--al-bosify.replit.app";
      const genResp = await fetch(api + "/api/v1/dressing-room/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion: selectedOccasion || "casual",
          weather: "mild",
          color_palette: "neutrals",
          count,
          user_profile: userProfile,
          closet_items: closetItems
        })
      });
      if (!genResp.ok) throw new Error("Generation failed");
      const data = await genResp.json();
      if (data.success && data.outfit_options && data.outfit_options.length > 0) {
        setGeneratedOutfits(data.outfit_options);
        toast.success("Outfits generated!");
      } else {
        toast.error(data.error || "Could not generate outfits");
      }
    } catch (e) {
      toast.error(e.message || "Failed to generate outfits");
    } finally {
      setOutfitGenerating(false);
    }
  };
  function handleUploadClick() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      var _a, _b;
      const file = (_b = (_a = e.target) == null ? void 0 : _a.files) == null ? void 0 : _b[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          sessionStorage.setItem("pendingUpload", reader.result);
          window.location.href = "/outfit-analysis";
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-8 mx-auto max-w-7xl space-y-8 overflow-x-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-[60px]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-4xl font-bold text-foreground relative", children: [
        "Your ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gold-text", children: "Dressing Room" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-2 text-lg", children: "Browse your analyzed outfits. Generate new combinations from your closet." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row gap-6 items-stretch md:items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-[1.5rem] border-[0.75px] border-border p-[3px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(GlowingEffect, { spread: 60, glow: true, proximity: 80, inactiveZone: 0.01, borderWidth: 3 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.button,
          {
            onHoverStart: () => setUploadHover(true),
            onHoverEnd: () => setUploadHover(false),
            whileTap: { scale: 0.95 },
            onClick: handleUploadClick,
            className: "relative flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500/20 via-orange-500/30 to-orange-500/20 border border-orange-500/30 text-orange-500 font-sans font-semibold text-base hover:from-orange-500/30 hover:to-orange-500/40 transition-all shadow-lg shadow-orange-500/10",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  animate: { rotate: uploadHover ? 15 : 0, scale: uploadHover ? 1.15 : 1 },
                  transition: { type: "spring", stiffness: 300 },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-6 h-6" })
                }
              ),
              "Upload New Outfit"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.button,
        {
          whileTap: { scale: 0.95 },
          onClick: openGenerateModal,
          className: "flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500/20 via-purple-500/30 to-purple-500/20 border border-purple-500/30 text-purple-500 font-sans font-semibold text-base hover:from-purple-500/30 hover:to-purple-500/40 transition-all shadow-lg shadow-purple-500/10",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-6 h-6" }),
            "Generate Outfit"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              value: search,
              onChange: (e) => setSearch(e.target.value),
              id: "dressing-search",
              name: "search",
              placeholder: "Search looks...",
              className: "pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex bg-muted/30 rounded-xl p-1 border border-border/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewMode("grid"), className: `p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-muted/60 shadow-sm" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Grid3x3, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewMode("list"), className: `p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-muted/60 shadow-sm" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(List, { className: "w-4 h-4" }) })
        ] })
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-32", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-8 h-8 animate-spin text-primary" }) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "text-center py-32 space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 mx-auto rounded-full bg-muted/40 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "w-10 h-10 text-muted-foreground/60" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-2xl text-foreground", children: "Your dressing room is empty" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground max-w-md mx-auto", children: "Upload your first outfit photo to get personalized style analysis and AI recommendations." })
    ] }) : viewMode === "grid" ? (
      /* ---- GRID VIEW ---- */
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6", children: filtered.map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: idx * 0.03 },
          className: "group relative rounded-2xl overflow-hidden border border-border/50 bg-muted/10 hover:border-primary/30 transition-all duration-300",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-[3/4] overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: item.image_url,
                alt: item.overall_style,
                loading: "lazy",
                className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white text-sm font-semibold truncate", children: item.overall_style || "Unstyled" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-bold ${scoreColor(item.style_score)}`, children: item.style_score }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/60 text-xs", children: timeAgo(item.created_at) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => handleDelete(item.id),
                disabled: deleting === item.id,
                className: "w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center hover:bg-red-500/80 transition-colors",
                children: deleting === item.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4 text-white" })
              }
            ) })
          ]
        },
        item.id
      )) })
    ) : (
      /* ---- LIST VIEW ---- */
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: filtered.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 p-4 rounded-2xl bg-muted/10 border border-border/30 hover:border-primary/20 transition-all", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-xl overflow-hidden shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: item.image_url, alt: "", className: "w-full h-full object-cover" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm truncate", children: item.overall_style || "Unstyled" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground truncate", children: item.summary })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-bold ${scoreColor(item.style_score)}`, children: item.style_score }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: timeAgo(item.created_at) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => handleDelete(item.id),
            disabled: deleting === item.id,
            className: "p-2 hover:bg-red-500/20 rounded-lg transition-colors",
            children: deleting === item.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4 text-red-400" })
          }
        )
      ] }, item.id)) })
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showOutfitModal && /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4",
        onClick: () => setShowOutfitModal(false),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { scale: 0.9, opacity: 0 },
            animate: { scale: 1, opacity: 1 },
            exit: { scale: 0.9, opacity: 0 },
            className: "relative w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-900/80 backdrop-blur-2xl p-8",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => setShowOutfitModal(false),
                  className: "absolute top-4 right-4 p-2 hover:bg-white/10 rounded-xl transition-colors",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5" })
                }
              ),
              step === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-bold text-center mb-6", children: "What's the occasion?" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: OCCASIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => {
                      setSelectedOccasion(o.id);
                    },
                    className: `p-4 rounded-xl border text-left transition-all ${selectedOccasion === o.id ? "border-primary bg-primary/10 text-primary" : "border-white/10 bg-white/5 hover:bg-white/10"}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: o.emoji }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold mt-1", children: o.label })
                    ]
                  },
                  o.id
                )) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: handleNext,
                    className: "w-full mt-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors",
                    children: "Next"
                  }
                )
              ] }),
              step === 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-bold text-center mb-2", children: selectedOccasion.charAt(0).toUpperCase() + selectedOccasion.slice(1) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center mb-6", children: "How many outfits?" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-3", children: [1, 2, 3].map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => handleGenerate(n),
                    className: "py-6 rounded-xl bg-primary/10 border border-primary/30 text-primary font-bold hover:bg-primary/20 transition-all text-lg",
                    children: n
                  },
                  n
                )) })
              ] })
            ]
          }
        )
      }
    ) }),
    outfitGenerating && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-10 h-10 animate-spin text-primary mx-auto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "AI is styling your outfits..." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: generatedOutfits.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0 },
        className: "space-y-6",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-display text-2xl font-bold flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-6 h-6 text-primary" }),
              "Your AI Styled Outfits"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setGeneratedOutfits([]),
                className: "text-sm text-muted-foreground hover:text-foreground transition-colors",
                children: "Dismiss"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: generatedOutfits.map((option, idx) => {
            const typeLabels = {
              "top": "Top",
              "shirt": "Top",
              "blouse": "Top",
              "t-shirt": "Top",
              "bottom": "Bottom",
              "pants": "Bottom",
              "jeans": "Bottom",
              "shoes": "Shoes",
              "sneakers": "Shoes",
              "boots": "Shoes",
              "dress": "Dress",
              "jacket": "Layer",
              "coat": "Layer",
              "hoodie": "Layer",
              "accessory": "Accessory",
              "bag": "Bag"
            };
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "relative bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 overflow-hidden",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4 flex-wrap", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white", children: option.outfit_name }),
                    option.source === "mimo" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded-full", children: "AI Styled" }),
                    option.source === "combinatorial" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full", children: "Generated" }),
                    option.source === "full_outfit" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full", children: "Complete" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col items-center gap-4", children: option.items.map((item, itemIdx) => {
                    var _a;
                    const typeLabel = typeLabels[(_a = item.type) == null ? void 0 : _a.toLowerCase()] || item.type || `Item ${itemIdx + 1}`;
                    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-xs flex flex-col items-center gap-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-full ${item.type === "full_outfit" ? "aspect-[4/3]" : "aspect-[3/4]"} rounded-xl overflow-hidden bg-zinc-900/60 border border-white/10 shadow-lg`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "img",
                        {
                          src: item.image_url,
                          alt: item.label || item.type,
                          className: "w-full h-full object-contain"
                        }
                      ) }),
                      item.type === "full_outfit" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-widest text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full", children: "Complete Look" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-center gap-1.5", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-wider text-white/50 font-semibold", children: typeLabel }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-white/80", children: item.label }),
                        item.color && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-white/40 bg-white/10 px-2 py-0.5 rounded-full", children: item.color })
                      ] })
                    ] }, item.id || itemIdx);
                  }) }),
                  option.reason && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-4 italic leading-relaxed", children: [
                    '"',
                    option.reason,
                    '"'
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: () => toast.success(`Wearing ${option.outfit_name}!`),
                      className: "w-full mt-4 py-2.5 rounded-xl bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-all text-sm font-semibold flex items-center justify-center gap-2",
                      children: [
                        "👕 Wear ",
                        option.outfit_name
                      ]
                    }
                  )
                ]
              },
              idx
            );
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: openGenerateModal,
              className: "inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-sm",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-4 h-4" }),
                "Try Different Options"
              ]
            }
          ) })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.button,
      {
        whileHover: { scale: 1.1 },
        whileTap: { scale: 0.9 },
        onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
        className: "fixed bottom-24 right-6 w-10 h-10 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 flex items-center justify-center text-primary hover:bg-primary/30 transition-colors z-40 shadow-lg",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "w-5 h-5" })
      }
    )
  ] }) });
}
export {
  DressingRoomPage as default
};
