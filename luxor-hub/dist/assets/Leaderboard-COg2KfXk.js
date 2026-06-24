import { r as reactExports, j as jsxRuntimeExports } from "./index-he9NPeB4.js";
import { A as AppLayout } from "./AppLayout-D1NFWtOs.js";
import { C as Card, a as CardContent } from "./card-COe-Zz1f.js";
import { B as Badge } from "./badge-B57TdN4z.js";
import { e as useAuth, s as supabase } from "./AppContent-Pfm712F6.js";
import { L as LoaderCircle } from "./loader-circle-BICR422t.js";
import { T as Trophy } from "./trophy-B9qnoGE8.js";
import { m as motion } from "./proxy-DbHhgb80.js";
import { U as User } from "./user-BVMiBHRn.js";
import { C as Crown } from "./crown-DHSH1fl5.js";
import { M as Medal } from "./medal-BgrKV5-W.js";
import "./BottomNav-CmhESsg9.js";
import "./shirt-fv7ktDre.js";
import "./index-CVyze4JH.js";
function Leaderboard() {
  const { user } = useAuth();
  const [entries, setEntries] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    fetchLeaderboard();
  }, []);
  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data: analyses } = await supabase.from("outfit_analyses").select("user_id, style_score");
      if (!analyses || analyses.length === 0) {
        setEntries([]);
        setLoading(false);
        return;
      }
      const userMap = {};
      for (const a of analyses) {
        if (!userMap[a.user_id]) userMap[a.user_id] = { scores: [] };
        userMap[a.user_id].scores.push(Number(a.style_score));
      }
      const userIds = Object.keys(userMap);
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", userIds);
      const profileMap = {};
      for (const p of profiles || []) {
        profileMap[p.user_id] = { display_name: p.display_name || "Stylist", avatar_url: p.avatar_url };
      }
      const leaderboard = userIds.map((uid) => {
        var _a, _b;
        const scores = userMap[uid].scores;
        return {
          user_id: uid,
          display_name: ((_a = profileMap[uid]) == null ? void 0 : _a.display_name) || "Stylist",
          avatar_url: ((_b = profileMap[uid]) == null ? void 0 : _b.avatar_url) || null,
          avg_score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
          total_analyses: scores.length,
          best_score: Math.max(...scores)
        };
      });
      leaderboard.sort((a, b) => b.avg_score - a.avg_score);
      setEntries(leaderboard);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const getRankIcon = (rank) => {
    if (rank === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "w-6 h-6 text-yellow-500" });
    if (rank === 1) return /* @__PURE__ */ jsxRuntimeExports.jsx(Medal, { className: "w-6 h-6 text-gray-400" });
    if (rank === 2) return /* @__PURE__ */ jsxRuntimeExports.jsx(Medal, { className: "w-6 h-6 text-amber-700" });
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground", children: [
      "#",
      rank + 1
    ] });
  };
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-400";
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-8 max-w-4xl mx-auto space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-3xl font-bold text-foreground", children: [
        "Style ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gold-text", children: "Leaderboard" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1", children: "Users ranked by average outfit analysis score" })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin text-primary" }) }) : entries.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-10 w-10 text-muted-foreground mx-auto mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "No analyses yet. Be the first to analyze an outfit!" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: entries.map((entry, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: i * 0.05 },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: `glass-card overflow-hidden ${entry.user_id === (user == null ? void 0 : user.id) ? "ring-1 ring-primary/50" : ""} ${i === 0 ? "border-yellow-500/30" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 flex items-center gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0", children: getRankIcon(i) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden", children: entry.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: entry.avatar_url, alt: "", className: "w-full h-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-5 h-5 text-primary" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-bold text-foreground truncate", children: entry.display_name }),
              entry.user_id === (user == null ? void 0 : user.id) && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] border-primary/30 text-primary", children: "You" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              entry.total_analyses,
              " ",
              entry.total_analyses === 1 ? "analysis" : "analyses",
              " · Best: ",
              entry.best_score,
              "/100"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right flex-shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-2xl font-bold ${getScoreColor(entry.avg_score)}`, children: entry.avg_score }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: "avg score" })
          ] })
        ] }) })
      },
      entry.user_id
    )) })
  ] }) });
}
export {
  Leaderboard as default
};
