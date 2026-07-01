import { r as reactExports, j as jsxRuntimeExports } from "./index-UvNQFckZ.js";
import { A as AppLayout } from "./AppLayout-C2fJ8nQA.js";
import { d as createLucideIcon, e as useAuth, s as supabase, B as Button } from "./AppContent-9kIwMzo7.js";
import { C as Card, a as CardContent } from "./card-BPQNt8Zy.js";
import { B as Badge } from "./badge-DLtZ_P3B.js";
import { I as Input } from "./input-DAE276Fi.js";
import { S as Select, a as SelectTrigger, b as SelectValue, d as SelectContent, e as SelectItem, C as ChevronUp } from "./select-BIK-HICp.js";
import { t as toast } from "./index-CXhnqnHQ.js";
import { m as motion } from "./proxy-DuKBf0zJ.js";
import { S as Search } from "./search-kh8jioyI.js";
import { T as TrendingUp } from "./trending-up-BHGlhj5Y.js";
import { L as LoaderCircle } from "./loader-circle-BUsfaJ2b.js";
import { S as Shirt } from "./shirt-iptwcFqR.js";
import { H as Heart } from "./heart-BkHfftab.js";
import { M as MessageCircle } from "./message-circle-Db_yKlJu.js";
import { C as ChevronDown } from "./chevron-down-DMP7n8R7.js";
import { S as Sparkles } from "./sparkles-CovKwywf.js";
import { A as AnimatePresence } from "./index-CI22_94N.js";
import "./BottomNav-DDKq4ZnH.js";
import "./index-DD4Lzeau.js";
import "./index-DKExEsNR.js";
import "./index-DbLPExPm.js";
import "./index-kCtdEKY2.js";
import "./index-JMgWy2k0.js";
import "./index-tS1BiThI.js";
import "./index-D1pSGaqh.js";
import "./index-B_9TlE7I.js";
import "./index-xmQ4FiWw.js";
import "./index-C-kGGVnc.js";
import "./index-F2z2EwsS.js";
import "./check-DftUbDuf.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Filter = createLucideIcon("Filter", [
  ["polygon", { points: "22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3", key: "1yg77f" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Send = createLucideIcon("Send", [
  [
    "path",
    {
      d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
      key: "1ffxy3"
    }
  ],
  ["path", { d: "m21.854 2.147-10.94 10.939", key: "12cjpa" }]
]);
const GARMENT_FILTERS = ["All", "Dress", "Blazer", "Jacket", "Coat", "Top", "Blouse", "Shirt", "Trousers", "Skirt", "Jumpsuit", "Knitwear", "Accessories"];
function CommunityGallery() {
  const { user } = useAuth();
  const [designs, setDesigns] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [garmentFilter, setGarmentFilter] = reactExports.useState("All");
  const [sortBy, setSortBy] = reactExports.useState("recent");
  const [expandedComments, setExpandedComments] = reactExports.useState(null);
  const [comments, setComments] = reactExports.useState({});
  const [newComment, setNewComment] = reactExports.useState("");
  const [loadingComments, setLoadingComments] = reactExports.useState(false);
  const [recommendingId, setRecommendingId] = reactExports.useState(null);
  const [recommendations, setRecommendations] = reactExports.useState({});
  reactExports.useEffect(() => {
    fetchDesigns();
  }, [user, garmentFilter, sortBy]);
  const fetchDesigns = async () => {
    setLoading(true);
    try {
      let query = supabase.from("fashion_designs").select("*").eq("is_public", true).order("created_at", { ascending: false });
      if (garmentFilter !== "All") {
        query = query.eq("garment_type", garmentFilter);
      }
      const { data: designsData, error } = await query;
      if (error) throw error;
      if (!(designsData == null ? void 0 : designsData.length)) {
        setDesigns([]);
        setLoading(false);
        return;
      }
      const userIds = [...new Set(designsData.map((d) => d.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", userIds);
      const profileMap = new Map((profiles == null ? void 0 : profiles.map((p) => [p.user_id, p])) || []);
      const designIds = designsData.map((d) => d.id);
      const { data: likes } = await supabase.from("look_likes").select("look_id, user_id").eq("look_type", "design").in("look_id", designIds);
      const likeCounts = /* @__PURE__ */ new Map();
      const userLikes = /* @__PURE__ */ new Set();
      likes == null ? void 0 : likes.forEach((l) => {
        likeCounts.set(l.look_id, (likeCounts.get(l.look_id) || 0) + 1);
        if (user && l.user_id === user.id) userLikes.add(l.look_id);
      });
      const { data: commentData } = await supabase.from("look_comments").select("look_id").eq("look_type", "design").in("look_id", designIds);
      const commentCounts = /* @__PURE__ */ new Map();
      commentData == null ? void 0 : commentData.forEach((c) => {
        commentCounts.set(c.look_id, (commentCounts.get(c.look_id) || 0) + 1);
      });
      let result = designsData.map((d) => ({
        ...d,
        profile: profileMap.get(d.user_id) || { display_name: null, avatar_url: null },
        likeCount: likeCounts.get(d.id) || 0,
        commentCount: commentCounts.get(d.id) || 0,
        isLiked: userLikes.has(d.id)
      }));
      if (sortBy === "popular") {
        result.sort((a, b) => b.likeCount - a.likeCount);
      }
      setDesigns(result);
    } catch (err) {
      toast.error("Failed to load community designs");
    } finally {
      setLoading(false);
    }
  };
  const handleLike = async (designId) => {
    if (!user) {
      toast.error("Sign in to like designs");
      return;
    }
    const design = designs.find((d) => d.id === designId);
    if (!design) return;
    if (design.isLiked) {
      await supabase.from("look_likes").delete().eq("look_id", designId).eq("look_type", "design").eq("user_id", user.id);
      setDesigns((prev) => prev.map((d) => d.id === designId ? { ...d, isLiked: false, likeCount: d.likeCount - 1 } : d));
    } else {
      await supabase.from("look_likes").insert({ look_id: designId, look_type: "design", user_id: user.id });
      setDesigns((prev) => prev.map((d) => d.id === designId ? { ...d, isLiked: true, likeCount: d.likeCount + 1 } : d));
      if (design.user_id !== user.id) {
        await supabase.from("notifications").insert({
          user_id: design.user_id,
          actor_id: user.id,
          type: "design_like",
          reference_id: designId
        });
      }
    }
  };
  const toggleComments = async (designId) => {
    if (expandedComments === designId) {
      setExpandedComments(null);
      return;
    }
    setExpandedComments(designId);
    if (!comments[designId]) {
      setLoadingComments(true);
      const { data } = await supabase.from("look_comments").select("*").eq("look_id", designId).eq("look_type", "design").order("created_at", { ascending: true });
      if (data == null ? void 0 : data.length) {
        const userIds = [...new Set(data.map((c) => c.user_id))];
        const { data: profiles } = await supabase.from("profiles").select("user_id, display_name").in("user_id", userIds);
        const profileMap = new Map((profiles == null ? void 0 : profiles.map((p) => [p.user_id, p])) || []);
        setComments((prev) => ({
          ...prev,
          [designId]: data.map((c) => ({ ...c, profile: profileMap.get(c.user_id) }))
        }));
      } else {
        setComments((prev) => ({ ...prev, [designId]: [] }));
      }
      setLoadingComments(false);
    }
  };
  const handleAddComment = async (designId) => {
    if (!user) {
      toast.error("Sign in to comment");
      return;
    }
    if (!newComment.trim()) return;
    const { data, error } = await supabase.from("look_comments").insert({
      look_id: designId,
      look_type: "design",
      user_id: user.id,
      content: newComment.trim()
    }).select("*").single();
    if (!error && data) {
      const { data: profile } = await supabase.from("profiles").select("user_id, display_name").eq("user_id", user.id).single();
      setComments((prev) => ({
        ...prev,
        [designId]: [...prev[designId] || [], { ...data, profile }]
      }));
      setDesigns((prev) => prev.map((d) => d.id === designId ? { ...d, commentCount: d.commentCount + 1 } : d));
      setNewComment("");
      toast.success("Comment added!");
      const design = designs.find((d) => d.id === designId);
      if (design && design.user_id !== user.id) {
        await supabase.from("notifications").insert({
          user_id: design.user_id,
          actor_id: user.id,
          type: "design_comment",
          reference_id: designId
        });
      }
    }
  };
  const handleGetRecommendations = async (design) => {
    if (!user) {
      toast.error("Sign in to get recommendations");
      return;
    }
    setRecommendingId(design.id);
    try {
      const { data: styleProfile } = await supabase.from("style_profiles").select("archetype, style_formula, preferences").eq("user_id", user.id).maybeSingle();
      const { data, error } = await supabase.functions.invoke("style-recommendations", {
        body: {
          designPrompt: design.prompt,
          garmentType: design.garment_type,
          archetype: styleProfile == null ? void 0 : styleProfile.archetype,
          styleFormula: styleProfile == null ? void 0 : styleProfile.style_formula,
          preferences: styleProfile == null ? void 0 : styleProfile.preferences
        }
      });
      if (error) throw error;
      setRecommendations((prev) => ({ ...prev, [design.id]: data.recommendations }));
    } catch (err) {
      toast.error(err.message || "Failed to get recommendations");
    } finally {
      setRecommendingId(null);
    }
  };
  const filteredDesigns = searchQuery ? designs.filter(
    (d) => {
      var _a, _b;
      return d.prompt.toLowerCase().includes(searchQuery.toLowerCase()) || d.garment_type.toLowerCase().includes(searchQuery.toLowerCase()) || ((_b = (_a = d.profile) == null ? void 0 : _a.display_name) == null ? void 0 : _b.toLowerCase().includes(searchQuery.toLowerCase()));
    }
  ) : designs;
  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 6e4);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-8 max-w-7xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-4xl font-bold text-foreground", children: [
        "Community ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gold-text", children: "Gallery" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1", children: "Discover AI-generated fashion designs from the community" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search designs...",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            className: "pl-9 bg-background/50"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: garmentFilter, onValueChange: setGarmentFilter, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectTrigger, { className: "w-[160px] bg-background/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { className: "w-4 h-4 mr-2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {})
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: GARMENT_FILTERS.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: f, children: f }, f)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: sortBy, onValueChange: (v) => setSortBy(v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectTrigger, { className: "w-[140px] bg-background/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-4 h-4 mr-2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {})
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "recent", children: "Recent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "popular", children: "Popular" })
        ] })
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-8 h-8 animate-spin text-primary" }) }) : filteredDesigns.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "glass-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-16 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Shirt, { className: "w-16 h-16 text-muted-foreground/30 mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-lg", children: "No public designs yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground/60 text-sm mt-1", children: "Be the first to share a design from the Fashion Designer!" })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: filteredDesigns.map((design, i) => {
      var _a, _b, _c;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: i * 0.04 },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "glass-card overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-square", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: design.image_url, alt: design.prompt, className: "w-full h-full object-cover" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "absolute top-3 left-3 bg-black/60 text-white border-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Shirt, { className: "w-3 h-3 mr-1" }),
                " ",
                design.garment_type
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-7 h-7 rounded-full gold-gradient flex items-center justify-center text-primary-foreground text-xs font-semibold", children: (_b = (((_a = design.profile) == null ? void 0 : _a.display_name) || "U")[0]) == null ? void 0 : _b.toUpperCase() }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground truncate", children: ((_c = design.profile) == null ? void 0 : _c.display_name) || "Anonymous" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: timeAgo(design.created_at) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/80 line-clamp-2", children: design.prompt }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 pt-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => handleLike(design.id),
                    className: "flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: `w-4 h-4 ${design.isLiked ? "fill-red-500 text-red-500" : ""}` }),
                      design.likeCount
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => toggleComments(design.id),
                    className: "flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "w-4 h-4" }),
                      design.commentCount,
                      expandedComments === design.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-3 h-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-3 h-3" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => handleGetRecommendations(design),
                    disabled: recommendingId === design.id,
                    className: "ml-auto flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-50",
                    children: [
                      recommendingId === design.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3.5 h-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-3.5 h-3.5" }),
                      "AI Tips"
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: recommendations[design.id] && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                motion.div,
                {
                  initial: { opacity: 0, height: 0 },
                  animate: { opacity: 1, height: "auto" },
                  exit: { opacity: 0, height: 0 },
                  className: "rounded-lg bg-primary/5 border border-primary/20 p-3",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-3.5 h-3.5 text-primary" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-primary", children: "Style Recommendations" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/80 whitespace-pre-line leading-relaxed", children: recommendations[design.id] })
                  ]
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: expandedComments === design.id && /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  initial: { opacity: 0, height: 0 },
                  animate: { opacity: 1, height: "auto" },
                  exit: { opacity: 0, height: 0 },
                  className: "space-y-2 pt-2 border-t border-border",
                  children: loadingComments ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin text-muted-foreground mx-auto" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    (comments[design.id] || []).map((c) => {
                      var _a2, _b2, _c2;
                      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-medium text-muted-foreground shrink-0 mt-0.5", children: (_b2 = (((_a2 = c.profile) == null ? void 0 : _a2.display_name) || "U")[0]) == null ? void 0 : _b2.toUpperCase() }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-foreground", children: ((_c2 = c.profile) == null ? void 0 : _c2.display_name) || "User" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground ml-2", children: timeAgo(c.created_at) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/70", children: c.content })
                        ] })
                      ] }, c.id);
                    }),
                    (comments[design.id] || []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground text-center py-2", children: "No comments yet" }),
                    user && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          placeholder: "Add a comment...",
                          value: expandedComments === design.id ? newComment : "",
                          onChange: (e) => setNewComment(e.target.value),
                          onKeyDown: (e) => e.key === "Enter" && handleAddComment(design.id),
                          className: "text-xs h-8 bg-background/50"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-8 px-2", onClick: () => handleAddComment(design.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-3.5 h-3.5" }) })
                    ] })
                  ] })
                }
              ) })
            ] })
          ] })
        },
        design.id
      );
    }) })
  ] }) });
}
export {
  CommunityGallery as default
};
