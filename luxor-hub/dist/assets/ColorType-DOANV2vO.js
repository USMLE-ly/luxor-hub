import { j as jsxRuntimeExports, e as useNavigate, r as reactExports } from "./index-CHmOPdwM.js";
import { T as TierGate } from "./TierGate-DqFKEKo4.js";
import { d as createLucideIcon, e as useAuth, B as Button, s as supabase } from "./AppContent-Bbhy20ck.js";
import { B as BottomNav } from "./BottomNav-C58Vi7wF.js";
import { t as toast } from "./index-Bzf1gHD_.js";
import { A as ArrowLeft } from "./arrow-left-DuSNs3ry.js";
import { m as motion } from "./proxy-PXi4GB5x.js";
import { A as ArrowRight } from "./arrow-right-BMWMB9dl.js";
import { C as Camera } from "./camera-BGwV88UO.js";
import { L as LoaderCircle } from "./loader-circle-BQgBL-tH.js";
import { C as CircleCheckBig } from "./circle-check-big-BalKqfAb.js";
import { U as Upload } from "./upload-DShHxPCU.js";
import { A as AnimatePresence } from "./index-VsQuQq_u.js";
import { X } from "./x-8z2B2-CB.js";
import { C as Copy } from "./copy-m2PbzJX5.js";
import { S as Shirt } from "./shirt-B5KBwn5M.js";
import "./usePlanTier-CfVOQe8R.js";
import "./useQuery-Dau2Mn0V.js";
import "./planRestrictions-__Vqe2nr.js";
import "./lock-BvgwGlZr.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const CircleX = createLucideIcon("CircleX", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m15 9-6 6", key: "1uzhvr" }],
  ["path", { d: "m9 9 6 6", key: "z0biqf" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Pen = createLucideIcon("Pen", [
  [
    "path",
    {
      d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      key: "1a8usu"
    }
  ]
]);
const seasonPalettes = {
  "Deep Winter": {
    primary: [
      { hex: "hsl(180,80%,40%)", name: "Deep Teal", tip: "Great for tops and scarves" },
      { hex: "hsl(210,90%,50%)", name: "Royal Blue", tip: "Perfect for blazers and dresses" },
      { hex: "hsl(240,70%,50%)", name: "Cobalt", tip: "Ideal for statement pieces" },
      { hex: "hsl(270,60%,50%)", name: "Purple", tip: "Stunning for evening wear" },
      { hex: "hsl(300,50%,45%)", name: "Plum", tip: "Great for accessories and bags" },
      { hex: "hsl(330,70%,50%)", name: "Magenta", tip: "Perfect for blouses and lipstick" },
      { hex: "hsl(350,80%,55%)", name: "Crimson", tip: "Ideal for coats and dresses" },
      { hex: "hsl(0,70%,45%)", name: "Deep Red", tip: "Great for knitwear and shoes" }
    ],
    complementary: [
      { hex: "hsl(15,70%,40%)", name: "Rust", tip: "Perfect for autumn layering" },
      { hex: "hsl(25,80%,55%)", name: "Burnt Orange", tip: "Great for scarves and belts" },
      { hex: "hsl(35,70%,55%)", name: "Amber", tip: "Ideal for accessories" },
      { hex: "hsl(45,80%,55%)", name: "Gold", tip: "Perfect for jewelry and details" },
      { hex: "hsl(55,80%,50%)", name: "Mustard", tip: "Great for bags and shoes" },
      { hex: "hsl(80,60%,50%)", name: "Olive", tip: "Ideal for trousers and jackets" },
      { hex: "hsl(120,70%,45%)", name: "Forest Green", tip: "Perfect for coats" },
      { hex: "hsl(160,60%,45%)", name: "Jade", tip: "Great for tops and blouses" }
    ],
    universal: [
      { hex: "hsl(0,0%,5%)", name: "Jet Black", tip: "Foundation for any outfit" },
      { hex: "hsl(0,0%,15%)", name: "Charcoal", tip: "Great for trousers and suits" },
      { hex: "hsl(20,15%,25%)", name: "Dark Brown", tip: "Perfect for leather goods" },
      { hex: "hsl(20,20%,35%)", name: "Espresso", tip: "Ideal for boots and bags" },
      { hex: "hsl(15,30%,45%)", name: "Warm Taupe", tip: "Great for layering pieces" },
      { hex: "hsl(10,35%,50%)", name: "Sienna", tip: "Perfect for accessories" },
      { hex: "hsl(0,0%,8%)", name: "Onyx", tip: "Ideal for formal wear" },
      { hex: "hsl(0,0%,12%)", name: "Graphite", tip: "Great for coats and outerwear" }
    ]
  },
  "Cold Winter": {
    primary: [
      { hex: "hsl(180,80%,45%)", name: "Teal", tip: "Perfect for tops and blouses" },
      { hex: "hsl(200,90%,55%)", name: "Sky Blue", tip: "Great for shirts and dresses" },
      { hex: "hsl(230,80%,55%)", name: "Sapphire", tip: "Ideal for blazers" },
      { hex: "hsl(260,70%,55%)", name: "Amethyst", tip: "Perfect for evening pieces" },
      { hex: "hsl(280,60%,50%)", name: "Violet", tip: "Great for accessories" },
      { hex: "hsl(310,70%,55%)", name: "Fuchsia", tip: "Stunning for statement tops" },
      { hex: "hsl(340,80%,55%)", name: "Rose", tip: "Perfect for knitwear" },
      { hex: "hsl(355,75%,50%)", name: "Ruby", tip: "Ideal for coats and shoes" }
    ],
    complementary: [
      { hex: "hsl(10,80%,40%)", name: "Brick", tip: "Great for autumn layers" },
      { hex: "hsl(20,80%,50%)", name: "Terracotta", tip: "Perfect for accessories" },
      { hex: "hsl(30,80%,55%)", name: "Copper", tip: "Ideal for jewelry" },
      { hex: "hsl(40,85%,55%)", name: "Honey", tip: "Great for belts and bags" },
      { hex: "hsl(50,85%,50%)", name: "Saffron", tip: "Perfect for scarves" },
      { hex: "hsl(70,70%,50%)", name: "Chartreuse", tip: "Great for accent pieces" },
      { hex: "hsl(100,60%,45%)", name: "Moss", tip: "Ideal for outerwear" },
      { hex: "hsl(150,60%,45%)", name: "Emerald", tip: "Perfect for dresses" }
    ],
    universal: [
      { hex: "hsl(0,0%,5%)", name: "Jet Black", tip: "Foundation for any outfit" },
      { hex: "hsl(0,0%,12%)", name: "Charcoal", tip: "Great for trousers" },
      { hex: "hsl(15,12%,25%)", name: "Dark Brown", tip: "Perfect for leather" },
      { hex: "hsl(20,18%,35%)", name: "Cocoa", tip: "Ideal for bags and boots" },
      { hex: "hsl(15,30%,45%)", name: "Warm Taupe", tip: "Great for layering" },
      { hex: "hsl(10,35%,50%)", name: "Clay", tip: "Perfect for accessories" },
      { hex: "hsl(0,0%,8%)", name: "Onyx", tip: "Ideal for formal wear" },
      { hex: "hsl(0,0%,15%)", name: "Slate", tip: "Great for suits" }
    ]
  }
};
function getPalettes(season) {
  return seasonPalettes[season] || seasonPalettes["Cold Winter"];
}
function hslToHex(hslStr) {
  const match = hslStr.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return hslStr;
  const [, h, s, l] = match.map(Number);
  const a2 = s / 100 * Math.min(l / 100, 1 - l / 100);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l / 100 - a2 * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}
const ColorType = () => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TierGate, { requiredTier: "starter", featureName: "Color Analysis", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ColorTypeInner, {}) });
};
const ColorTypeInner = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [dna, setDna] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [extractedPalette, setExtractedPalette] = reactExports.useState(null);
  const [extracting, setExtracting] = reactExports.useState(false);
  const fileInputRef = reactExports.useRef(null);
  const [previewUrl, setPreviewUrl] = reactExports.useState(null);
  const [expandedSection, setExpandedSection] = reactExports.useState(null);
  const [selectedColor, setSelectedColor] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    const fetchData = async () => {
      var _a;
      const { data } = await supabase.from("style_profiles").select("preferences").eq("user_id", user.id).single();
      if (data) {
        setDna(((_a = data.preferences) == null ? void 0 : _a.aiAnalysis) || null);
      }
      setLoading(false);
    };
    fetchData();
  }, [user, authLoading, navigate]);
  const handleImageUpload = async (e) => {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      setPreviewUrl(base64);
      setExtracting(true);
      try {
        const resp = await fetch(`${"https://uakkwvdjoqsceewhsfjb.supabase.co"}/functions/v1/extract-palette`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVha2t3dmRqb3FzY2Vld2hzZmpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NjE2ODEsImV4cCI6MjA4NzIzNzY4MX0.2bqKl0gFyNESBduLwg6GNYbFIMwF5XjDw_9xlWd1Nfo"}`
          },
          body: JSON.stringify({ image: base64, colorSeason: (dna == null ? void 0 : dna.colorSeason) || "" })
        });
        if (!resp.ok) {
          if (resp.status === 429) {
            toast.error("Rate limited");
            return;
          }
          if (resp.status === 402) {
            toast.error("AI credits exhausted");
            return;
          }
          throw new Error("Extraction failed");
        }
        const result = await resp.json();
        setExtractedPalette(result);
        toast.success("Palette extracted!");
      } catch {
        toast.error("Failed to extract palette");
      } finally {
        setExtracting(false);
      }
    };
    reader.readAsDataURL(file);
  };
  const copyHex = (hex) => {
    const hexCode = hslToHex(hex);
    navigator.clipboard.writeText(hexCode);
    toast.success(`Copied ${hexCode}`);
  };
  if (loading || authLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-background flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" }) });
  }
  const colorSeason = (dna == null ? void 0 : dna.colorSeason) || "Cold Winter";
  const palettes = getPalettes(colorSeason);
  const PaletteSection = ({ title, description, colors, sectionKey }) => {
    var _a;
    const isExpanded = expandedSection === sectionKey;
    const displayColors = isExpanded ? colors : colors.slice(0, 7);
    const extra = colors.length - 7;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-5 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-bold text-foreground", children: title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-4 h-4 text-muted-foreground" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm font-sans leading-relaxed", children: description }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 gap-2", children: [
        displayColors.map((color, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setSelectedColor(color),
            className: "group relative aspect-square rounded-lg transition-transform hover:scale-105 active:scale-95",
            style: { backgroundColor: color.hex },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[8px] font-bold text-white font-sans", children: hslToHex(color.hex) }) })
          },
          i
        )),
        !isExpanded && extra > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setExpandedSection(sectionKey),
            className: "aspect-square rounded-lg flex items-center justify-center",
            style: { backgroundColor: ((_a = colors[7]) == null ? void 0 : _a.hex) || colors[colors.length - 1].hex },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-bold text-background/90 font-sans", children: [
              "+",
              extra
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setExpandedSection(isExpanded ? null : sectionKey),
          className: "w-full py-3 rounded-xl bg-secondary/50 text-sm font-sans text-foreground flex items-center justify-center gap-2 hover:bg-secondary/70 transition-colors",
          children: [
            isExpanded ? "Show less" : "View colors",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: `w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}` })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { height: 0, opacity: 0 },
          animate: { height: "auto", opacity: 1 },
          exit: { height: 0, opacity: 0 },
          className: "overflow-hidden",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2 pt-2", children: colors.map((color, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setSelectedColor(color),
              className: "flex items-center gap-3 p-2 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors text-left",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-lg flex-shrink-0", style: { backgroundColor: color.hex } }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-foreground font-sans truncate", children: color.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground font-sans", children: hslToHex(color.hex) })
                ] })
              ]
            },
            i
          )) })
        }
      ) })
    ] });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background pb-20", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky top-0 z-20 bg-background border-b border-border px-4 py-3 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate(-1), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-5 h-5 text-foreground" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-sans font-semibold text-foreground", children: "Color type" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-4 h-4 text-foreground" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 pt-5 space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, className: "rounded-2xl bg-secondary/40 p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-bold text-foreground mb-2", children: colorSeason }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm font-sans flex-1 pr-4", children: "Discover and understand your Color Type with insights into Color Analysis" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-foreground flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-4 h-4 text-background" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { y: 20, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { delay: 0.05 },
          className: "rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-4",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "w-5 h-5 text-primary" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-bold text-foreground", children: "Extract Palette from Photo" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs font-sans", children: "Upload any photo to see which colors match your season" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", className: "hidden", onChange: handleImageUpload }),
            previewUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: previewUrl, alt: "Uploaded", className: "w-full max-h-48 object-cover rounded-xl" }) }),
            extracting ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center py-4 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-5 h-5 animate-spin text-primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-sans text-muted-foreground", children: "Extracting colors..." })
            ] }) : extractedPalette ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-sans text-sm font-semibold text-foreground", children: [
                  extractedPalette.matchCount,
                  " of ",
                  extractedPalette.totalColors,
                  " colors match your season"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => {
                  var _a;
                  return (_a = fileInputRef.current) == null ? void 0 : _a.click();
                }, className: "text-xs", children: "Try Another" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-4 gap-2", children: extractedPalette.colors.map((color, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square rounded-lg relative", style: { backgroundColor: color.hex }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-1 -right-1", children: color.matchesSeason ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-4 h-4 text-green-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4 text-destructive" }) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px] font-sans text-muted-foreground text-center truncate", children: color.name })
              ] }, i)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-sans text-muted-foreground", children: extractedPalette.summary })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
              var _a;
              return (_a = fileInputRef.current) == null ? void 0 : _a.click();
            }, variant: "outline", className: "w-full gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-4 h-4" }),
              " Upload a Photo"
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { delay: 0.1 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(PaletteSection, { title: "Primary Advanced Palette", description: "The best colors for every category.", colors: palettes.primary, sectionKey: "primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { delay: 0.2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(PaletteSection, { title: "Complementary Palette", description: "Ideal colors for bottoms, shoes, and accessories.", colors: palettes.complementary, sectionKey: "complementary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { delay: 0.3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(PaletteSection, { title: "Universal Palette", description: "Core colors that pair well with any shade.", colors: palettes.universal, sectionKey: "universal" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: selectedColor && /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        className: "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center",
        onClick: () => setSelectedColor(null),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { y: 200 },
            animate: { y: 0 },
            exit: { y: 200 },
            onClick: (e) => e.stopPropagation(),
            className: "w-full max-w-md rounded-t-3xl bg-card border border-border p-6 space-y-4",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-bold text-foreground", children: "Color Detail" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSelectedColor(null), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5 text-muted-foreground" }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 rounded-2xl shadow-lg", style: { backgroundColor: selectedColor.hex } }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-xl font-bold text-foreground", children: selectedColor.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: () => copyHex(selectedColor.hex),
                      className: "flex items-center gap-1.5 mt-1 text-sm text-muted-foreground hover:text-foreground transition-colors",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "w-3.5 h-3.5" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-sans font-mono", children: hslToHex(selectedColor.hex) })
                      ]
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Shirt, { className: "w-5 h-5 text-primary flex-shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-sans text-foreground", children: selectedColor.tip })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => copyHex(selectedColor.hex), className: "w-full", variant: "outline", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "w-4 h-4 mr-2" }),
                " Copy Hex Code"
              ] })
            ]
          }
        )
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BottomNav, {})
  ] });
};
export {
  ColorType as default
};
