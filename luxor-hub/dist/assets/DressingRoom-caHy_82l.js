import { e as useNavigate, r as reactExports, j as jsxRuntimeExports } from "./index-CHmOPdwM.js";
import { A as AppLayout } from "./AppLayout-8H8QbKOT.js";
import { d as createLucideIcon, e as useAuth, B as Button, s as supabase } from "./AppContent-Bbhy20ck.js";
import { C as Card, a as CardContent } from "./card-BVu4fzp-.js";
import { B as Badge } from "./badge-C4Dmqa7k.js";
import { t as toast } from "./index-Bzf1gHD_.js";
import { G as GlowingEffect } from "./glowing-effect-K1N7oBz6.js";
import { m as motion } from "./proxy-PXi4GB5x.js";
import { U as Upload } from "./upload-DShHxPCU.js";
import { S as Search } from "./search-Z_9Kb7of.js";
import { L as List } from "./list-D59-5aTX.js";
import { L as LoaderCircle } from "./loader-circle-BQgBL-tH.js";
import { S as Shirt } from "./shirt-B5KBwn5M.js";
import { S as Sparkles } from "./sparkles-DaDdlGiv.js";
import { A as AnimatePresence } from "./index-VsQuQq_u.js";
import { S as Star } from "./star-BMzM0bQd.js";
import { C as Clock } from "./clock-Cx3YEc6V.js";
import { T as Trash2 } from "./trash-2-BDf35Op1.js";
import { A as ArrowUp } from "./arrow-up-Dr3Ekt4b.js";
import { I as Instagram } from "./instagram-DZsGk2Ct.js";
import { T as Twitter } from "./twitter-DiyvIRli.js";
import { E as ExternalLink } from "./external-link-SJ-nOEbL.js";
import "./BottomNav-C58Vi7wF.js";
import "./index-DjtY8y_y.js";
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
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } }
};
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};
function Footer() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "relative mt-16 mb-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 -top-6 h-px bg-gradient-to-r from-transparent via-border to-transparent backdrop-blur-sm" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/60", children: "© 2026 LUXOR® — AI Fashion Style" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-4", children: [
        { icon: Instagram, href: "#" },
        { icon: Twitter, href: "#" },
        { icon: ExternalLink, href: "#" }
      ].map(({ icon: Icon, href }, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.a,
        {
          href,
          whileHover: { scale: 1.15, y: -2 },
          whileTap: { scale: 0.9 },
          className: "w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-4 h-4" })
        },
        i
      )) })
    ] })
  ] });
}
function DressingRoom() {
  const { user } = useAuth();
  useNavigate();
  const [items, setItems] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [search, setSearch] = reactExports.useState("");
  const [view, setView] = reactExports.useState("grid");
  const [deleting, setDeleting] = reactExports.useState(null);
  const [uploadHover, setUploadHover] = reactExports.useState(false);
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
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-8 mx-auto max-w-7xl space-y-8 overflow-x-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-[60px]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-4xl font-bold text-foreground relative", children: [
        "Your ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gold-text", children: "Dressing Room" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-2 text-lg", children: "Browse your analyzed outfits. Upload new ones or revisit past looks." })
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
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Upload Outfit" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-[200px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              placeholder: "Search outfits…",
              value: search,
              onChange: (e) => setSearch(e.target.value),
              className: "w-full pl-9 pr-3 py-2.5 rounded-xl bg-muted/30 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 bg-muted/30 rounded-xl p-1 border border-border/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setView("grid"),
              className: `p-2 rounded-lg transition-colors ${view === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Grid3x3, { className: "w-4 h-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setView("list"),
              className: `p-2 rounded-lg transition-colors ${view === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(List, { className: "w-4 h-4" })
            }
          )
        ] })
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-32", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-10 h-10 animate-spin text-primary" }) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        className: "text-center py-32 space-y-5",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shirt, { className: "w-12 h-12 text-primary/60" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-2xl text-foreground", children: "Your dressing room is empty" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm max-w-sm mx-auto", children: "Upload and analyze your first outfit to see it here. Each analysis saves automatically." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.button,
            {
              whileHover: { scale: 1.03 },
              whileTap: { scale: 0.95 },
              onClick: handleUploadClick,
              className: "inline-flex items-center gap-2 px-8 py-4 rounded-xl gold-gradient text-primary-foreground font-sans font-semibold shadow-lg",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-5 h-5" }),
                " Analyze Your First Outfit"
              ]
            }
          )
        ]
      }
    ) : view === "grid" ? (
      /* ======== GRID VIEW ======== */
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          variants: containerVariants,
          initial: "hidden",
          animate: "show",
          className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: filtered.map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              variants: cardVariants,
              layout: true,
              exit: { opacity: 0, scale: 0.9, y: -20 },
              className: "group",
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-[1.5rem] border-[0.75px] border-border p-[3px] h-full", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(GlowingEffect, { spread: 30, glow: true, proximity: 48, inactiveZone: 0.01, borderWidth: 2 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "glass-card border-0 shadow-none h-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0 h-full flex flex-col", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-[3/4] overflow-hidden bg-muted/30", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "img",
                      {
                        src: item.image_url,
                        alt: item.overall_style || "Outfit",
                        className: "w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl",
                        loading: "lazy"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-3 right-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: `${scoreColor(item.style_score)} bg-background/80 backdrop-blur-sm border-border/50 font-semibold text-xs px-2.5 py-1`, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "w-3 h-3 mr-1 inline" }),
                      item.style_score
                    ] }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-3 left-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "bg-background/80 backdrop-blur-sm text-[10px] text-muted-foreground", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3 mr-1 inline" }),
                      timeAgo(item.created_at)
                    ] }) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 flex-1 flex flex-col gap-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-base font-bold text-foreground truncate", children: item.overall_style || "Unnamed Outfit" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground line-clamp-2 flex-1 leading-relaxed", children: item.summary || "No analysis summary available." }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        Button,
                        {
                          size: "sm",
                          whileTap: { scale: 0.95 },
                          className: "flex-1 text-xs h-9 gold-gradient text-primary-foreground font-sans",
                          onClick: handleUploadClick,
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-3.5 h-3.5 mr-1" }),
                            " Re‑Analyze"
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          size: "sm",
                          variant: "ghost",
                          whileTap: { scale: 0.9 },
                          className: "h-9 w-9 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                          onClick: () => handleDelete(item.id),
                          disabled: deleting === item.id,
                          children: deleting === item.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
                        }
                      )
                    ] })
                  ] })
                ] }) })
              ] })
            },
            item.id
          )) })
        }
      )
    ) : (
      /* ======== LIST VIEW ======== */
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          variants: containerVariants,
          initial: "hidden",
          animate: "show",
          className: "space-y-4",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: filtered.map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              variants: cardVariants,
              layout: true,
              exit: { opacity: 0, height: 0 },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "glass-card border-border/50 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 flex items-center gap-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-24 rounded-xl overflow-hidden bg-muted/30 flex-shrink-0 shadow-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: item.image_url, alt: "", className: "w-full h-full object-cover", loading: "lazy" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-sm font-bold text-foreground truncate", children: item.overall_style || "Unnamed" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: `${scoreColor(item.style_score)} text-xs flex-shrink-0`, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "w-3 h-3 mr-1 inline" }),
                      item.style_score
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground truncate mt-1", children: item.summary }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground/60 mt-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3 mr-1 inline" }),
                    timeAgo(item.created_at)
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      size: "sm",
                      whileTap: { scale: 0.95 },
                      className: "text-xs h-9 gold-gradient text-primary-foreground font-sans",
                      onClick: handleUploadClick,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-3.5 h-3.5 mr-1" }),
                        " Re‑Analyze"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      size: "sm",
                      variant: "ghost",
                      whileTap: { scale: 0.9 },
                      className: "h-9 w-9 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                      onClick: () => handleDelete(item.id),
                      disabled: deleting === item.id,
                      children: deleting === item.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
                    }
                  )
                ] })
              ] }) })
            },
            item.id
          )) })
        }
      )
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.button,
      {
        whileHover: { scale: 1.1 },
        whileTap: { scale: 0.9 },
        onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
        className: "fixed bottom-24 right-6 w-10 h-10 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 flex items-center justify-center text-primary hover:bg-primary/30 transition-colors z-40 shadow-lg",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "w-5 h-5" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] }) });
}
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
export {
  DressingRoom as default
};
