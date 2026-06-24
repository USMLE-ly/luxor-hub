import { e as useNavigate, r as reactExports, j as jsxRuntimeExports } from "./index-DbMNM3HR.js";
import { A as AppLayout } from "./AppLayout-z0hM-vSW.js";
import { d as createLucideIcon, e as useAuth, s as supabase } from "./AppContent-_r6To3FT.js";
import { m as motion } from "./proxy-BW1EVREd.js";
import { C as CircleAlert } from "./circle-alert-DejpBd9a.js";
import { C as Camera } from "./camera-C-B6mYPG.js";
import { C as ChevronRight } from "./chevron-right-6uHjLKlg.js";
import { S as Sparkles } from "./sparkles-Dn0VJ8Xg.js";
import { L as LoaderCircle } from "./loader-circle-BwBuuCzi.js";
import { S as ShoppingBag } from "./shopping-bag-XUNI31xn.js";
import { H as Heart } from "./heart-9MJilOc4.js";
import { E as ExternalLink } from "./external-link-FBgN6WHy.js";
import "./BottomNav-BJG5rdUS.js";
import "./shirt-DOs4UNgN.js";
import "./index-JsMeU7Bl.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ArrowUpDown = createLucideIcon("ArrowUpDown", [
  ["path", { d: "m21 16-4 4-4-4", key: "f6ql7i" }],
  ["path", { d: "M17 20V4", key: "1ejh1v" }],
  ["path", { d: "m3 8 4-4 4 4", key: "11wl7u" }],
  ["path", { d: "M7 4v16", key: "1glfcx" }]
]);
const categories = ["All", "Tops", "Bottoms", "Shoes", "Outerwear", "Accessories"];
const brandLogos = [
  { name: "Amazon", emoji: "📦" },
  { name: "Zara", emoji: "👗" },
  { name: "H&M", emoji: "🏷️" },
  { name: "ASOS", emoji: "🛍️" },
  { name: "Uniqlo", emoji: "👘" },
  { name: "Nike", emoji: "👟" }
];
const ESSENTIAL_CATS = ["top", "bottom", "outerwear", "shoes", "dress", "accessory"];
const CORE_COLORS = ["black", "white", "navy", "gray", "grey", "beige", "brown", "blue"];
const ACCENT_COLORS = ["red", "green", "yellow", "pink", "orange", "purple", "burgundy"];
const catToShopMap = {
  top: "Tops",
  bottom: "Bottoms",
  outerwear: "Outerwear",
  shoes: "Shoes",
  dress: "Tops",
  accessory: "Accessories"
};
const Inspiration = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = reactExports.useState("All");
  const [liked, setLiked] = reactExports.useState(/* @__PURE__ */ new Set());
  const [products, setProducts] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [colorSeason, setColorSeason] = reactExports.useState("");
  const [bodyShape, setBodyShape] = reactExports.useState("");
  const [archetype, setArchetype] = reactExports.useState("");
  const [closetCategories, setClosetCategories] = reactExports.useState([]);
  const [closetColors, setClosetColors] = reactExports.useState([]);
  const [imgErrors, setImgErrors] = reactExports.useState(/* @__PURE__ */ new Set());
  const [sortByMatch, setSortByMatch] = reactExports.useState(true);
  const [profileLoaded, setProfileLoaded] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("style_profiles").select("archetype, preferences").eq("user_id", user.id).single(),
      supabase.from("clothing_items").select("category, color").eq("user_id", user.id)
    ]).then(([styleRes, closetRes]) => {
      var _a, _b, _c;
      const prefs = ((_a = styleRes.data) == null ? void 0 : _a.preferences) || {};
      setColorSeason(((_b = prefs == null ? void 0 : prefs.aiAnalysis) == null ? void 0 : _b.colorSeason) || "");
      setBodyShape((prefs == null ? void 0 : prefs.bodyShape) || "");
      setArchetype(((_c = styleRes.data) == null ? void 0 : _c.archetype) || "");
      if (closetRes.data) {
        setClosetCategories(closetRes.data.map((i) => i.category));
        setClosetColors(closetRes.data.map((i) => i.color).filter(Boolean));
      }
      setProfileLoaded(true);
    });
  }, [user]);
  const gaps = reactExports.useMemo(() => {
    if (!closetCategories.length) return { missingCats: [], missingColors: [], suggestions: [] };
    const catCounts = /* @__PURE__ */ new Map();
    closetCategories.forEach((c) => catCounts.set(c, (catCounts.get(c) || 0) + 1));
    const colorSet = new Set(closetColors.map((c) => c.toLowerCase().trim()));
    const missingCats = ESSENTIAL_CATS.filter((c) => !catCounts.has(c) || (catCounts.get(c) || 0) === 0);
    const weakCats = ESSENTIAL_CATS.filter((c) => {
      const n = catCounts.get(c) || 0;
      return n > 0 && n < 3;
    });
    const missingNeutrals = CORE_COLORS.filter((c) => !colorSet.has(c));
    const hasAccent = ACCENT_COLORS.some((c) => colorSet.has(c));
    const suggestions = [];
    missingCats.forEach((c) => suggestions.push(`Add ${c}s to your closet`));
    weakCats.forEach((c) => suggestions.push(`Expand your ${c}s collection`));
    if (missingNeutrals.length > 2) suggestions.push(`Get neutral basics: ${missingNeutrals.slice(0, 3).join(", ")}`);
    if (!hasAccent) suggestions.push("Add a pop of color");
    return { missingCats: [...missingCats, ...weakCats], missingColors: missingNeutrals, suggestions: suggestions.slice(0, 3) };
  }, [closetCategories, closetColors]);
  reactExports.useEffect(() => {
    if (!profileLoaded) return;
    fetchProducts();
  }, [activeCategory, profileLoaded, colorSeason, bodyShape, archetype]);
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        category: activeCategory,
        colorSeason,
        bodyShape,
        archetype,
        closetCategories: closetCategories.join(",")
      });
      const url = `${"https://uakkwvdjoqsceewhsfjb.supabase.co"}/functions/v1/shop-products?${params}`;
      const resp = await fetch(url, {
        headers: { Authorization: `Bearer ${"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVha2t3dmRqb3FzY2Vld2hzZmpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NjE2ODEsImV4cCI6MjA4NzIzNzY4MX0.2bqKl0gFyNESBduLwg6GNYbFIMwF5XjDw_9xlWd1Nfo"}` }
      });
      if (!resp.ok) throw new Error("Failed to fetch products");
      const result = await resp.json();
      setProducts(result.products || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };
  const toggleLike = (id) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const taggedProducts = reactExports.useMemo(() => {
    const gapShopCats = new Set(gaps.missingCats.map((c) => catToShopMap[c] || "").filter(Boolean));
    return products.map((p) => ({
      ...p,
      fillsGap: gapShopCats.has(p.category)
    }));
  }, [products, gaps.missingCats]);
  const sortedProducts = sortByMatch ? [...taggedProducts].sort((a, b) => {
    if (a.fillsGap && !b.fillsGap) return -1;
    if (!a.fillsGap && b.fillsGap) return 1;
    return b.matchScore - a.matchScore;
  }) : taggedProducts;
  const getScoreColor = (score) => {
    if (score >= 85) return "text-green-400 bg-green-500/20";
    if (score >= 70) return "text-primary bg-primary/20";
    return "text-muted-foreground bg-secondary";
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 sm:px-5 py-5 max-w-lg mx-auto overflow-x-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, className: "mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl font-bold text-foreground", children: "My Shop" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans text-xs mt-0.5", children: "Personalized picks based on your Style DNA" })
    ] }),
    gaps.suggestions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 0.02 },
        className: "rounded-2xl border border-primary/20 bg-primary/5 p-4 mb-5",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4 text-primary" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans font-semibold text-foreground text-sm", children: "Fill Your Wardrobe Gaps" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground font-sans", children: "Items tagged below will complete your closet" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: gaps.suggestions.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-sans px-2.5 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary font-medium", children: s }, i)) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.button,
      {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 0.05 },
        onClick: () => navigate("/chat?prefill=" + encodeURIComponent("Check if this item matches my style DNA")),
        className: "w-full rounded-2xl bg-foreground text-background p-4 mb-5 flex items-center gap-3 text-left hover:opacity-90 transition-opacity",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl bg-background/10 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "w-5 h-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans font-semibold text-sm", children: "Check if item is a Match" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs opacity-70 font-sans", children: "Scan any item to see if it fits your Style DNA" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4 opacity-50" })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, className: "mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-sans font-semibold text-foreground text-sm mb-3", children: "Browse Matches online" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-4 overflow-x-auto pb-2 scrollbar-none", children: brandLogos.map((brand) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1.5 flex-shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-xl", children: brand.emoji }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-sans text-muted-foreground", children: brand.name })
      ] }, brand.name)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 0.15 },
        className: "rounded-2xl bg-primary/5 border border-primary/20 p-4 mb-5 flex items-center gap-3",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-5 h-5 text-primary" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans font-semibold text-foreground text-sm", children: "Shop My Style Formula" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-sans", children: colorSeason ? `Matched to your ${colorSeason} palette` : "Personalized picks based on your DNA" })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 overflow-x-auto pb-1 scrollbar-none flex-1", children: categories.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setActiveCategory(cat),
          className: `px-4 py-1.5 rounded-full text-xs font-sans whitespace-nowrap transition-all ${activeCategory === cat ? "bg-foreground text-background font-semibold" : "bg-secondary text-muted-foreground hover:text-foreground"}`,
          children: cat
        },
        cat
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setSortByMatch(!sortByMatch),
          className: `ml-2 px-3 py-1.5 rounded-full text-[10px] font-sans flex items-center gap-1 transition-all flex-shrink-0 ${sortByMatch ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpDown, { className: "w-3 h-3" }),
            " Match"
          ]
        }
      )
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: sortedProducts.map((product, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: i * 0.04 },
        className: "rounded-xl border border-border bg-card overflow-hidden group",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "aspect-[3/4] relative bg-secondary", children: [
            !imgErrors.has(product.id) ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: product.imageUrl,
                alt: product.name,
                className: "w-full h-full object-cover",
                loading: "lazy",
                onError: () => setImgErrors((prev) => new Set(prev).add(product.id))
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-secondary to-muted/50 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "w-8 h-8 text-muted-foreground/40" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-sans text-muted-foreground/60 px-3 text-center leading-tight", children: product.name })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `absolute top-2 left-2 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1 ${getScoreColor(product.matchScore)}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-2.5 h-2.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-bold font-sans", children: [
                product.matchScore,
                "%"
              ] })
            ] }),
            product.fillsGap && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2 left-[52px] backdrop-blur-sm rounded-full px-2 py-0.5 bg-primary/80 text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-bold font-sans", children: "Fills Gap" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: (e) => {
                  e.stopPropagation();
                  toggleLike(product.id);
                },
                className: "absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: `w-3.5 h-3.5 transition-colors ${liked.has(product.id) ? "text-red-500 fill-red-500" : "text-foreground"}` })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "a",
                {
                  href: product.affiliateUrl,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "flex items-center gap-1.5 bg-foreground text-background px-3 py-1.5 rounded-full text-xs font-sans font-semibold",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "w-3 h-3" }),
                    " Shop Now"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: (e) => {
                e.stopPropagation();
                navigate(`/chat?prefill=${encodeURIComponent(`Is this a good match for me? ${product.name} by ${product.brand} in ${product.color} (${product.category})`)}`);
              }, className: "flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-sans font-semibold", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-3 h-3" }),
                " Check Match"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground font-sans uppercase tracking-wider", children: product.brand }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-xs font-medium text-foreground mt-0.5 truncate", children: product.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-sans font-bold text-sm text-foreground", children: product.price }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-sans text-[10px] text-muted-foreground line-through", children: [
                  "€",
                  (parseFloat(product.price.replace(/[^0-9.]/g, "")) * 1.35).toFixed(0)
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: product.affiliateUrl, target: "_blank", rel: "noopener noreferrer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "w-3 h-3 text-muted-foreground" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 mt-2 flex-wrap", children: product.tags.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded-full font-sans", children: tag }, tag)) })
          ] })
        ]
      },
      product.id
    )) })
  ] }) });
};
export {
  Inspiration as default
};
