import { r as reactExports, j as jsxRuntimeExports } from "./index-UvNQFckZ.js";
import { A as AppLayout } from "./AppLayout-C2fJ8nQA.js";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./card-BPQNt8Zy.js";
import { B as Badge } from "./badge-DLtZ_P3B.js";
import { B as Button, e as useAuth, s as supabase } from "./AppContent-9kIwMzo7.js";
import { t as toast } from "./index-CXhnqnHQ.js";
import { Z as Zap } from "./zap-jBwV310w.js";
import { L as Link } from "./link-DXBvIeC0.js";
import { A as ArrowRight } from "./arrow-right-03HXU5ql.js";
import { A as Award } from "./award-p6wSQeCS.js";
import { L as LoaderCircle } from "./loader-circle-BUsfaJ2b.js";
import { m as motion } from "./proxy-DuKBf0zJ.js";
import { L as Lock } from "./lock-BDMviZcR.js";
import { E as Eye } from "./eye-CyUxwaGv.js";
import { T as Target } from "./target-6OLJeoKh.js";
import { F as Flame } from "./flame-BWu-YYpo.js";
import { C as Crown } from "./crown-DiGG4-hW.js";
import { S as Star } from "./star-Bns2gW3_.js";
import { T as TrendingUp } from "./trending-up-BHGlhj5Y.js";
import "./BottomNav-DDKq4ZnH.js";
import "./shirt-iptwcFqR.js";
import "./index-CI22_94N.js";
function RadialOrbitalTimeline({
  timelineData
}) {
  const [expandedItems, setExpandedItems] = reactExports.useState({});
  const [rotationAngle, setRotationAngle] = reactExports.useState(0);
  const [autoRotate, setAutoRotate] = reactExports.useState(true);
  const [pulseEffect, setPulseEffect] = reactExports.useState({});
  const [centerOffset] = reactExports.useState({ x: 0, y: 0 });
  const [activeNodeId, setActiveNodeId] = reactExports.useState(null);
  const containerRef = reactExports.useRef(null);
  const orbitRef = reactExports.useRef(null);
  const nodeRefs = reactExports.useRef({});
  const handleContainerClick = (e) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };
  const toggleItem = (id) => {
    setExpandedItems((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((key) => {
        if (parseInt(key) !== id) {
          newState[parseInt(key)] = false;
        }
      });
      newState[id] = !prev[id];
      if (!prev[id]) {
        setActiveNodeId(id);
        setAutoRotate(false);
        const relatedItems = getRelatedItems(id);
        const newPulseEffect = {};
        relatedItems.forEach((relId) => {
          newPulseEffect[relId] = true;
        });
        setPulseEffect(newPulseEffect);
        centerViewOnNode(id);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }
      return newState;
    });
  };
  reactExports.useEffect(() => {
    let rotationTimer;
    if (autoRotate) {
      rotationTimer = setInterval(() => {
        setRotationAngle((prev) => {
          const newAngle = (prev + 0.3) % 360;
          return Number(newAngle.toFixed(3));
        });
      }, 50);
    }
    return () => {
      if (rotationTimer) clearInterval(rotationTimer);
    };
  }, [autoRotate]);
  const centerViewOnNode = (nodeId) => {
    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    const totalNodes = timelineData.length;
    const targetAngle = nodeIndex / totalNodes * 360;
    setRotationAngle(270 - targetAngle);
  };
  const getRadius = reactExports.useCallback(() => {
    if (typeof window === "undefined") return 200;
    return window.innerWidth < 480 ? 120 : window.innerWidth < 768 ? 160 : 200;
  }, []);
  const [radius, setRadius] = reactExports.useState(getRadius);
  reactExports.useEffect(() => {
    const onResize = () => setRadius(getRadius());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [getRadius]);
  const calculateNodePosition = (index, total) => {
    const angle = (index / total * 360 + rotationAngle) % 360;
    const radian = angle * Math.PI / 180;
    const x = radius * Math.cos(radian) + centerOffset.x;
    const y = radius * Math.sin(radian) + centerOffset.y;
    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2)));
    return { x, y, angle, zIndex, opacity };
  };
  const getRelatedItems = (itemId) => {
    const currentItem = timelineData.find((item) => item.id === itemId);
    return currentItem ? currentItem.relatedIds : [];
  };
  const isRelatedToActive = (itemId) => {
    if (!activeNodeId) return false;
    const relatedItems = getRelatedItems(activeNodeId);
    return relatedItems.includes(itemId);
  };
  const getStatusStyles = (status) => {
    switch (status) {
      case "completed":
        return "text-primary-foreground bg-primary border-primary";
      case "in-progress":
        return "text-accent-foreground bg-accent border-accent";
      case "pending":
        return "text-muted-foreground bg-muted border-muted";
      default:
        return "text-muted-foreground bg-muted border-muted";
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "w-full h-full flex flex-col items-center justify-center bg-background overflow-hidden",
      ref: containerRef,
      onClick: handleContainerClick,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-full max-w-4xl h-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "absolute w-full h-full flex items-center justify-center",
          ref: orbitRef,
          style: {
            perspective: "1000px",
            transform: `translate(${centerOffset.x}px, ${centerOffset.y}px)`
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary via-accent to-primary/60 animate-pulse flex items-center justify-center z-10", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-primary/30 animate-ping opacity-70" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-primary/20 animate-ping opacity-50",
                  style: { animationDelay: "0.5s" }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-card/80 backdrop-blur-md" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "absolute rounded-full border border-primary/20",
                style: {
                  width: `${radius * 2}px`,
                  height: `${radius * 2}px`,
                  boxShadow: `
                0 0 20px hsl(var(--primary) / 0.08),
                0 0 40px hsl(var(--primary) / 0.04),
                inset 0 0 20px hsl(var(--primary) / 0.05)
              `
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "absolute rounded-full pointer-events-none",
                style: {
                  width: `${radius * 2}px`,
                  height: `${radius * 2}px`,
                  background: `conic-gradient(from ${rotationAngle}deg, transparent 0%, hsl(var(--primary) / 0.15) 15%, hsl(var(--primary) / 0.3) 25%, transparent 40%, transparent 100%)`,
                  mask: `radial-gradient(circle, transparent ${radius - 8}px, black ${radius - 6}px, black ${radius + 6}px, transparent ${radius + 8}px)`,
                  WebkitMask: `radial-gradient(circle, transparent ${radius - 8}px, black ${radius - 6}px, black ${radius + 6}px, transparent ${radius + 8}px)`
                }
              }
            ),
            timelineData.map((item, index) => {
              const position = calculateNodePosition(index, timelineData.length);
              const isExpanded = expandedItems[item.id];
              const isRelated = isRelatedToActive(item.id);
              const isPulsing = pulseEffect[item.id];
              const Icon = item.icon;
              const nodeStyle = {
                transform: `translate(${position.x}px, ${position.y}px)`,
                zIndex: isExpanded ? 200 : position.zIndex,
                opacity: isExpanded ? 1 : position.opacity
              };
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  ref: (el) => nodeRefs.current[item.id] = el,
                  className: "absolute transition-all duration-700 cursor-pointer",
                  style: nodeStyle,
                  onClick: (e) => {
                    e.stopPropagation();
                    toggleItem(item.id);
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: `absolute rounded-full -inset-1 ${isPulsing ? "animate-pulse duration-1000" : ""}`,
                        style: {
                          background: `radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, transparent 70%)`,
                          width: `${item.energy * 0.5 + 40}px`,
                          height: `${item.energy * 0.5 + 40}px`,
                          left: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                          top: `-${(item.energy * 0.5 + 40 - 40) / 2}px`
                        }
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: `
                  w-11 h-11 sm:w-10 sm:h-10 rounded-full flex items-center justify-center
                  ${isExpanded ? "bg-primary text-primary-foreground" : isRelated ? "bg-primary/50 text-primary-foreground" : "bg-card text-foreground"}
                  border-2 
                  ${isExpanded ? "border-primary shadow-lg shadow-primary/30" : isRelated ? "border-primary animate-pulse" : "border-border"}
                  transition-all duration-300 transform
                  ${isExpanded ? "scale-[1.3] sm:scale-150" : ""}
                `,
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 16 })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: `
                  absolute top-12 whitespace-nowrap
                  text-xs font-semibold tracking-wider
                  transition-all duration-300
                  ${isExpanded ? "text-foreground scale-125" : "text-muted-foreground"}
                `,
                        children: item.title
                      }
                    ),
                    isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "absolute top-20 left-1/2 -translate-x-1/2 w-56 sm:w-64 bg-card/90 backdrop-blur-lg border-border shadow-xl overflow-visible", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-border" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `px-2 text-xs ${getStatusStyles(item.status)}`, children: item.status === "completed" ? "COMPLETE" : item.status === "in-progress" ? "IN PROGRESS" : "PENDING" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-mono text-muted-foreground", children: item.date })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm mt-2", children: item.title })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "text-xs text-muted-foreground", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: item.content }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 pt-3 border-t border-border", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center text-xs mb-1", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 10, className: "mr-1" }),
                              "Energy Level"
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono", children: [
                              item.energy,
                              "%"
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-1 bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "div",
                            {
                              className: "h-full gold-gradient",
                              style: { width: `${item.energy}%` }
                            }
                          ) })
                        ] }),
                        item.relatedIds.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 pt-3 border-t border-border", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center mb-2", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { size: 10, className: "text-muted-foreground mr-1" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs uppercase tracking-wider font-medium text-muted-foreground", children: "Connected Nodes" })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: item.relatedIds.map((relatedId) => {
                            const relatedItem = timelineData.find((i) => i.id === relatedId);
                            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              Button,
                              {
                                variant: "outline",
                                size: "sm",
                                className: "flex items-center h-6 px-2 py-0 text-xs",
                                onClick: (e) => {
                                  e.stopPropagation();
                                  toggleItem(relatedId);
                                },
                                children: [
                                  relatedItem == null ? void 0 : relatedItem.title,
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 8, className: "ml-1" })
                                ]
                              },
                              relatedId
                            );
                          }) })
                        ] })
                      ] })
                    ] })
                  ]
                },
                item.id
              );
            })
          ]
        }
      ) })
    }
  );
}
const BADGE_DEFINITIONS = [
  { key: "first_analysis", name: "First Look", description: "Complete your first outfit analysis", icon: "eye", threshold: 1, type: "analyses_count" },
  { key: "5_analyses", name: "Style Explorer", description: "Complete 5 outfit analyses", icon: "target", threshold: 5, type: "analyses_count" },
  { key: "10_analyses", name: "Fashion Critic", description: "Complete 10 outfit analyses", icon: "flame", threshold: 10, type: "analyses_count" },
  { key: "25_analyses", name: "Style Master", description: "Complete 25 outfit analyses", icon: "crown", threshold: 25, type: "analyses_count" },
  { key: "score_70", name: "Rising Star", description: "Achieve an average score of 70+", icon: "star", threshold: 70, type: "avg_score" },
  { key: "score_80", name: "Style Icon", description: "Achieve an average score of 80+", icon: "trending_up", threshold: 80, type: "avg_score" },
  { key: "score_90", name: "Fashion Legend", description: "Achieve an average score of 90+", icon: "zap", threshold: 90, type: "avg_score" },
  { key: "perfect_score", name: "Perfection", description: "Get a perfect 100 on any analysis", icon: "award", threshold: 100, type: "best_score" },
  { key: "challenge_entry", name: "Challenger", description: "Enter a weekly style challenge", icon: "flame", threshold: 1, type: "challenge_entries" },
  { key: "closet_10", name: "Wardrobe Builder", description: "Add 10 items to your closet", icon: "target", threshold: 10, type: "closet_count" }
];
const iconComponentMap = {
  eye: Eye,
  target: Target,
  flame: Flame,
  crown: Crown,
  star: Star,
  trending_up: TrendingUp,
  zap: Zap,
  award: Award
};
const iconMap = {
  eye: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-6 h-6" }),
  target: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "w-6 h-6" }),
  flame: /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "w-6 h-6" }),
  crown: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "w-6 h-6" }),
  star: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "w-6 h-6" }),
  trending_up: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-6 h-6" }),
  zap: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-6 h-6" }),
  award: /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "w-6 h-6" })
};
function Badges() {
  const { user } = useAuth();
  const [unlockedKeys, setUnlockedKeys] = reactExports.useState(/* @__PURE__ */ new Set());
  const [loading, setLoading] = reactExports.useState(true);
  const [checking, setChecking] = reactExports.useState(false);
  const [viewMode, setViewMode] = reactExports.useState("grid");
  reactExports.useEffect(() => {
    if (user) {
      fetchBadges();
      checkAndUnlockBadges();
    }
  }, [user]);
  const fetchBadges = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from("user_badges").select("badge_key").eq("user_id", user.id);
    setUnlockedKeys(new Set((data || []).map((b) => b.badge_key)));
    setLoading(false);
  };
  const checkAndUnlockBadges = async () => {
    if (!user) return;
    setChecking(true);
    try {
      const [analysesRes, closetRes, challengeRes] = await Promise.all([
        supabase.from("outfit_analyses").select("style_score").eq("user_id", user.id),
        supabase.from("clothing_items").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("challenge_entries").select("id", { count: "exact", head: true }).eq("user_id", user.id)
      ]);
      const scores = (analysesRes.data || []).map((a) => Number(a.style_score));
      const analysesCount = scores.length;
      const avgScore = analysesCount > 0 ? scores.reduce((a, b) => a + b, 0) / analysesCount : 0;
      const bestScore = analysesCount > 0 ? Math.max(...scores) : 0;
      const closetCount = closetRes.count || 0;
      const challengeEntries = challengeRes.count || 0;
      const stats = {
        analyses_count: analysesCount,
        avg_score: Math.round(avgScore),
        best_score: bestScore,
        challenge_entries: challengeEntries,
        closet_count: closetCount
      };
      const { data: existing } = await supabase.from("user_badges").select("badge_key").eq("user_id", user.id);
      const existingKeys = new Set((existing || []).map((b) => b.badge_key));
      let newBadges = 0;
      for (const badge of BADGE_DEFINITIONS) {
        if (existingKeys.has(badge.key)) continue;
        const value = stats[badge.type] || 0;
        if (value >= badge.threshold) {
          const { error } = await supabase.from("user_badges").insert({
            user_id: user.id,
            badge_key: badge.key,
            badge_name: badge.name,
            badge_description: badge.description,
            badge_icon: badge.icon
          });
          if (!error) {
            existingKeys.add(badge.key);
            newBadges++;
          }
        }
      }
      setUnlockedKeys(existingKeys);
      if (newBadges > 0) {
        toast.success(`🏅 You unlocked ${newBadges} new badge${newBadges > 1 ? "s" : ""}!`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChecking(false);
    }
  };
  const unlockedCount = BADGE_DEFINITIONS.filter((b) => unlockedKeys.has(b.key)).length;
  const timelineData = BADGE_DEFINITIONS.map((badge, index) => ({
    id: index + 1,
    title: badge.name,
    date: unlockedKeys.has(badge.key) ? "Unlocked" : `Need ${badge.threshold}`,
    content: badge.description,
    category: badge.type,
    icon: iconComponentMap[badge.icon] || Award,
    relatedIds: index < BADGE_DEFINITIONS.length - 1 ? [index + 2] : [],
    status: unlockedKeys.has(badge.key) ? "completed" : "pending",
    energy: unlockedKeys.has(badge.key) ? 100 : 20
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-8 max-w-5xl mx-auto space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-3xl font-bold text-foreground", children: [
          "Badges & ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gold-text", children: "Achievements" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground mt-1", children: [
          unlockedCount,
          "/",
          BADGE_DEFINITIONS.length,
          " unlocked"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        checking && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-5 h-5 animate-spin text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex rounded-lg border border-border overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setViewMode("grid"),
              className: `px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"}`,
              children: "Grid"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setViewMode("orbital"),
              className: `px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === "orbital" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"}`,
              children: "Orbital"
            }
          )
        ] })
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin text-primary" }) }) : viewMode === "orbital" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-[600px] rounded-2xl overflow-hidden border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RadialOrbitalTimeline, { timelineData }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: BADGE_DEFINITIONS.map((badge, i) => {
      const unlocked = unlockedKeys.has(badge.key);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          transition: { delay: i * 0.05 },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: `glass-card overflow-hidden transition-all ${unlocked ? "border-primary/30" : "opacity-50"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5 flex items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${unlocked ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`, children: unlocked ? iconMap[badge.icon] || /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "w-6 h-6" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-6 h-6" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-bold text-foreground text-sm", children: badge.name }),
                unlocked && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-primary/15 text-primary border-primary/30 text-[10px]", children: "Unlocked" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: badge.description })
            ] })
          ] }) })
        },
        badge.key
      );
    }) })
  ] }) });
}
export {
  Badges as default
};
