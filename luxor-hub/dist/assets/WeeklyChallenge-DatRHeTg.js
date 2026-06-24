import { e as useNavigate, r as reactExports, j as jsxRuntimeExports } from "./index-BJjnbSuc.js";
import { A as AppLayout } from "./AppLayout-DQMjD52q.js";
import { C as Card, a as CardContent } from "./card-6Baj89SU.js";
import { B as Badge } from "./badge-CDjguxs1.js";
import { d as createLucideIcon, e as useAuth, s as supabase, B as Button } from "./AppContent-4cFLEqQ4.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-BqmNL8I5.js";
import { t as toast } from "./index-DqqhH6-L.js";
import { F as Flame } from "./flame-BMKHIMR6.js";
import { T as Target } from "./target-DZW8s6qf.js";
import { H as History } from "./history-C0AoisBV.js";
import { L as LoaderCircle } from "./loader-circle-De8pAAiQ.js";
import { C as Clock } from "./clock-hA_RhJJG.js";
import { S as Sparkles } from "./sparkles-D_uBq3Qr.js";
import { C as ChevronRight } from "./chevron-right-DwfE1lXm.js";
import { T as Trophy } from "./trophy-BkqBlvTj.js";
import { m as motion } from "./proxy-DPNpeU0t.js";
import { U as User } from "./user-5K2EfAuQ.js";
import { S as Shirt } from "./shirt-GoHrHLkp.js";
import { R as Recycle } from "./recycle-DmAt-trc.js";
import { C as Crown } from "./crown-BuPDFDON.js";
import { M as Medal } from "./medal-Dgir9E1r.js";
import "./BottomNav-TzXkY_hr.js";
import "./index-CWYjAC1K.js";
import "./index-ZAaTSPdI.js";
import "./index-ZUFtIYVr.js";
import "./index-BdIuB2-P.js";
import "./index-BGgHy4vq.js";
import "./index-DoiO9BYn.js";
import "./index-CNBvEil4.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Swords = createLucideIcon("Swords", [
  ["polyline", { points: "14.5 17.5 3 6 3 3 6 3 17.5 14.5", key: "1hfsw2" }],
  ["line", { x1: "13", x2: "19", y1: "19", y2: "13", key: "1vrmhu" }],
  ["line", { x1: "16", x2: "20", y1: "16", y2: "20", key: "1bron3" }],
  ["line", { x1: "19", x2: "21", y1: "21", y2: "19", key: "13pww6" }],
  ["polyline", { points: "14.5 6.5 18 3 21 3 21 6 17.5 9.5", key: "hbey2j" }],
  ["line", { x1: "5", x2: "9", y1: "14", y2: "18", key: "1hf58s" }],
  ["line", { x1: "7", x2: "4", y1: "17", y2: "20", key: "pidxm4" }],
  ["line", { x1: "3", x2: "5", y1: "19", y2: "21", key: "1pehsh" }]
]);
function WeeklyChallenge() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = reactExports.useState(true);
  const [challenge, setChallenge] = reactExports.useState(null);
  const [entries, setEntries] = reactExports.useState([]);
  const [userAnalyses, setUserAnalyses] = reactExports.useState([]);
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [userEntry, setUserEntry] = reactExports.useState(null);
  const [pastChallenges, setPastChallenges] = reactExports.useState([]);
  const [loadingPast, setLoadingPast] = reactExports.useState(false);
  reactExports.useEffect(() => {
    fetchChallenge();
  }, [user]);
  const fetchChallenge = async () => {
    setLoading(true);
    try {
      const { data: challengeId } = await supabase.rpc("get_or_create_current_challenge");
      if (!challengeId) return;
      const { data: challengeData } = await supabase.from("weekly_challenges").select("*").eq("id", challengeId).single();
      if (challengeData) setChallenge(challengeData);
      const { data: entryData } = await supabase.from("challenge_entries").select("*").eq("challenge_id", challengeId).order("score", { ascending: false });
      const userIds = (entryData || []).map((e) => e.user_id);
      let profileMap = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", userIds);
        for (const p of profiles || []) {
          profileMap[p.user_id] = { display_name: p.display_name || "Stylist", avatar_url: p.avatar_url };
        }
      }
      const mappedEntries = (entryData || []).map((e) => {
        var _a, _b;
        return {
          user_id: e.user_id,
          display_name: ((_a = profileMap[e.user_id]) == null ? void 0 : _a.display_name) || "Stylist",
          avatar_url: ((_b = profileMap[e.user_id]) == null ? void 0 : _b.avatar_url) || null,
          score: Number(e.score),
          analysis_id: e.analysis_id
        };
      });
      setEntries(mappedEntries);
      setUserEntry(mappedEntries.find((e) => e.user_id === (user == null ? void 0 : user.id)) || null);
      if (user && challengeData) {
        const { data: analyses } = await supabase.from("outfit_analyses").select("id, style_score, overall_style, image_url").eq("user_id", user.id).gte("created_at", challengeData.week_start).order("style_score", { ascending: false });
        setUserAnalyses(analyses || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const fetchPastChallenges = async () => {
    if (!user) return;
    setLoadingPast(true);
    try {
      const currentWeekStart = challenge == null ? void 0 : challenge.week_start;
      const { data: challenges } = await supabase.from("weekly_challenges").select("*").order("week_start", { ascending: false }).limit(12);
      const pastOnes = (challenges || []).filter((c) => c.week_start !== currentWeekStart);
      if (pastOnes.length === 0) {
        setPastChallenges([]);
        setLoadingPast(false);
        return;
      }
      const challengeIds = pastOnes.map((c) => c.id);
      const { data: allEntries } = await supabase.from("challenge_entries").select("*").in("challenge_id", challengeIds).order("score", { ascending: false });
      const entryUserIds = [...new Set((allEntries || []).map((e) => e.user_id))];
      let profileMap = {};
      if (entryUserIds.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", entryUserIds);
        for (const p of profiles || []) {
          profileMap[p.user_id] = { display_name: p.display_name || "Stylist", avatar_url: p.avatar_url };
        }
      }
      const result = pastOnes.map((c) => {
        const cEntries = (allEntries || []).filter((e) => e.challenge_id === c.id).map((e) => {
          var _a, _b;
          return {
            user_id: e.user_id,
            display_name: ((_a = profileMap[e.user_id]) == null ? void 0 : _a.display_name) || "Stylist",
            avatar_url: ((_b = profileMap[e.user_id]) == null ? void 0 : _b.avatar_url) || null,
            score: Number(e.score),
            analysis_id: e.analysis_id
          };
        });
        const userIdx = cEntries.findIndex((e) => e.user_id === user.id);
        return {
          ...c,
          entries: cEntries,
          userRank: userIdx >= 0 ? userIdx + 1 : null,
          userScore: userIdx >= 0 ? cEntries[userIdx].score : null
        };
      });
      setPastChallenges(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPast(false);
    }
  };
  const handleSubmit = async (analysisId, score) => {
    var _a;
    if (!user || !challenge) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("challenge_entries").insert({
        challenge_id: challenge.id,
        user_id: user.id,
        analysis_id: analysisId,
        score
      });
      if (error) throw error;
      toast.success("Entry submitted! 🏆");
      fetchChallenge();
    } catch (err) {
      if ((_a = err.message) == null ? void 0 : _a.includes("duplicate")) {
        toast.error("You've already entered this week's challenge");
      } else {
        toast.error(err.message || "Failed to submit");
      }
    } finally {
      setSubmitting(false);
    }
  };
  const daysLeft = challenge ? Math.max(0, Math.ceil((new Date(challenge.week_end).getTime() - Date.now()) / 864e5)) : 0;
  const getRankIcon = (rank) => {
    if (rank === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "w-5 h-5 text-yellow-500" });
    if (rank === 1) return /* @__PURE__ */ jsxRuntimeExports.jsx(Medal, { className: "w-5 h-5 text-gray-400" });
    if (rank === 2) return /* @__PURE__ */ jsxRuntimeExports.jsx(Medal, { className: "w-5 h-5 text-amber-700" });
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "w-5 h-5 flex items-center justify-center text-xs font-bold text-muted-foreground", children: [
      "#",
      rank + 1
    ] });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-8 max-w-4xl mx-auto space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-3xl font-bold text-foreground", children: [
        "Weekly Style ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gold-text", children: "Challenge" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1", children: "Compete for the highest outfit score this week" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "current", className: "w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-3 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "current", className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "w-4 h-4" }),
          " This Week"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "challenges", className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "w-4 h-4" }),
          " Challenges"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "history", className: "flex items-center gap-2", onClick: fetchPastChallenges, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "w-4 h-4" }),
          " Past"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "current", className: "space-y-6", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin text-primary" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        challenge && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "glass-card overflow-hidden border-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "w-5 h-5 text-primary" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-bold text-foreground", children: challenge.theme || "Style Showdown" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
                new Date(challenge.week_start).toLocaleDateString(),
                " — ",
                new Date(challenge.week_end).toLocaleDateString()
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-primary", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display font-bold", children: daysLeft })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: "days left" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center gap-4 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              entries.length,
              " participants"
            ] }),
            userEntry && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-500/15 text-green-500 border-green-500/30", children: "✓ Entered" })
          ] })
        ] }) }),
        !userEntry && userAnalyses.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "glass-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-4 h-4 text-primary" }),
            " Submit Your Best Analysis"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Pick your highest-scoring analysis from this week:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: userAnalyses.slice(0, 5).map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: a.image_url, alt: "", className: "w-10 h-10 rounded-lg object-cover" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground truncate", children: a.overall_style }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                "Score: ",
                a.style_score,
                "/100"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                onClick: () => handleSubmit(a.id, Number(a.style_score)),
                disabled: submitting,
                className: "gold-gradient text-primary-foreground",
                children: "Submit"
              }
            )
          ] }, a.id)) })
        ] }) }),
        !userEntry && userAnalyses.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "glass-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-8 h-8 text-muted-foreground mx-auto mb-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mb-3", children: "Analyze an outfit this week to enter the challenge!" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => navigate("/outfit-analysis"), variant: "outline", className: "border-primary/30", children: [
            "Go to Outfit Analysis ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4 ml-1" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "w-4 h-4 text-primary" }),
            " This Week's Rankings"
          ] }),
          entries.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-8", children: "No entries yet. Be the first!" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: entries.map((entry, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { opacity: 0, x: -10 },
              animate: { opacity: 1, x: 0 },
              transition: { delay: i * 0.05 },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: `glass-card ${entry.user_id === (user == null ? void 0 : user.id) ? "ring-1 ring-primary/50" : ""} ${i === 0 ? "border-yellow-500/30" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 flex items-center gap-3", children: [
                getRankIcon(i),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden", children: entry.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: entry.avatar_url, alt: "", className: "w-full h-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-4 h-4 text-primary" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium text-foreground text-sm truncate", children: [
                  entry.display_name,
                  entry.user_id === (user == null ? void 0 : user.id) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary ml-1", children: "(You)" })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xl font-bold ${entry.score >= 80 ? "text-green-500" : entry.score >= 60 ? "text-yellow-500" : "text-red-400"}`, children: entry.score })
              ] }) })
            },
            entry.user_id
          )) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "challenges", className: "space-y-4", children: [
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Shirt, { className: "w-5 h-5 text-primary" }),
          title: "7-Day Capsule Challenge",
          description: "Create 7 unique outfits using only 10 items from your closet",
          points: 50,
          badge: "Capsule Master"
        },
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Recycle, { className: "w-5 h-5 text-[hsl(142,60%,45%)]" }),
          title: "Rewear 100 Challenge",
          description: "Wear an item 100 times and track it. Sustainability wins!",
          points: 100,
          badge: "Eco Warrior"
        },
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { className: "w-5 h-5 text-[hsl(15,80%,55%)]" }),
          title: "Outfit Battle",
          description: "Submit your best outfit — community votes on style, fit & creativity",
          points: 30,
          badge: "Battle Champion"
        },
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "w-5 h-5 text-[hsl(270,50%,55%)]" }),
          title: "Thrift Flip",
          description: "Style a thrifted piece into a high-fashion look",
          points: 40,
          badge: "Thrift King"
        }
      ].map((challenge2, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { opacity: 0, x: -10 },
          animate: { opacity: 1, x: 0 },
          transition: { delay: i * 0.05 },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "glass-card hover:border-primary/30 transition-colors cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0", children: challenge2.icon }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-bold text-foreground text-sm mb-1", children: challenge2.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-sans mb-2", children: challenge2.description }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-primary/15 text-primary border-primary/30 text-[10px]", children: [
                  "+",
                  challenge2.points,
                  " pts"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-[10px]", children: [
                  "🏆 ",
                  challenge2.badge
                ] })
              ] })
            ] })
          ] }) }) })
        },
        challenge2.title
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "history", className: "space-y-6", children: loadingPast ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin text-primary" }) }) : pastChallenges.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-10 w-10 text-muted-foreground mx-auto mb-3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "No past challenges yet." })
      ] }) : pastChallenges.map((pc) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "glass-card overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-display font-bold text-foreground flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "w-4 h-4 text-primary" }),
              pc.theme || "Style Showdown"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
              new Date(pc.week_start).toLocaleDateString(),
              " — ",
              new Date(pc.week_end).toLocaleDateString()
            ] })
          ] }),
          pc.userRank !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-primary/15 text-primary border-primary/30", children: [
            "#",
            pc.userRank,
            " · ",
            pc.userScore,
            "/100"
          ] })
        ] }),
        pc.entries.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "No entries" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          pc.entries.slice(0, 3).map((entry, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
            getRankIcon(i),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden", children: entry.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: entry.avatar_url, alt: "", className: "w-full h-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-3 h-3 text-primary" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex-1 truncate text-foreground", children: [
              entry.display_name,
              entry.user_id === (user == null ? void 0 : user.id) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary ml-1", children: "(You)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-bold ${entry.score >= 80 ? "text-green-500" : entry.score >= 60 ? "text-yellow-500" : "text-red-400"}`, children: entry.score })
          ] }, entry.user_id)),
          pc.entries.length > 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground", children: [
            "+",
            pc.entries.length - 3,
            " more participants"
          ] })
        ] })
      ] }) }, pc.id)) })
    ] })
  ] }) });
}
export {
  WeeklyChallenge as default
};
