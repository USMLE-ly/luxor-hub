import { e as useNavigate, r as reactExports, j as jsxRuntimeExports } from "./index-UvNQFckZ.js";
import { A as AppLayout } from "./AppLayout-C2fJ8nQA.js";
import { C as Card, a as CardContent } from "./card-BPQNt8Zy.js";
import { B as Badge } from "./badge-DLtZ_P3B.js";
import { d as createLucideIcon, e as useAuth, s as supabase, B as Button } from "./AppContent-9kIwMzo7.js";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-0U-FlVhg.js";
import { t as toast } from "./index-CXhnqnHQ.js";
import { L as LoaderCircle } from "./loader-circle-BUsfaJ2b.js";
import { B as Bell } from "./bell-PURjshAR.js";
import { A as AnimatePresence } from "./index-CI22_94N.js";
import { m as motion } from "./proxy-DuKBf0zJ.js";
import { H as Heart } from "./heart-BkHfftab.js";
import { U as UserPlus } from "./user-plus-iqds-AWR.js";
import { A as Award } from "./award-p6wSQeCS.js";
import { T as Trophy } from "./trophy-BoQyp8PM.js";
import { F as Flame } from "./flame-BWu-YYpo.js";
import { M as MessageCircle } from "./message-circle-Db_yKlJu.js";
import "./BottomNav-DDKq4ZnH.js";
import "./shirt-iptwcFqR.js";
import "./index-DD4Lzeau.js";
import "./index-DbLPExPm.js";
import "./index-DKExEsNR.js";
import "./index-B_9TlE7I.js";
import "./index-tS1BiThI.js";
import "./index-kCtdEKY2.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const CheckCheck = createLucideIcon("CheckCheck", [
  ["path", { d: "M18 6 7 17l-5-5", key: "116fxf" }],
  ["path", { d: "m22 10-7.5 7.5L13 16", key: "ke71qq" }]
]);
function NotificationCenter() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [filter, setFilter] = reactExports.useState("all");
  const fetchAll = reactExports.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [socialRes, badgesRes, challengeRes] = await Promise.all([
      supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
      supabase.from("user_badges").select("*").eq("user_id", user.id).order("unlocked_at", { ascending: false }).limit(20),
      supabase.from("challenge_entries").select("*, weekly_challenges(*)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10)
    ]);
    const unified = [];
    if (socialRes.data) {
      const actorIds = [...new Set(socialRes.data.map((n) => n.actor_id))];
      let nameMap = {};
      if (actorIds.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("user_id, display_name").in("user_id", actorIds);
        for (const p of profiles || []) {
          nameMap[p.user_id] = p.display_name || "Someone";
        }
      }
      for (const n of socialRes.data) {
        const actor = nameMap[n.actor_id] || "Someone";
        unified.push({
          id: `social-${n.id}`,
          type: n.type,
          title: n.type === "like" ? `${actor} liked your look` : n.type === "follow" ? `${actor} started following you` : `${actor} commented`,
          description: n.type === "like" ? "❤️ Your style is getting attention!" : n.type === "follow" ? "✨ You have a new follower!" : "💬 New comment on your look",
          read: n.read,
          created_at: n.created_at,
          link: n.type === "follow" ? `/profile/${n.actor_id}` : void 0,
          icon: n.type === "like" ? "heart" : n.type === "follow" ? "user-plus" : "message"
        });
      }
    }
    if (badgesRes.data) {
      for (const b of badgesRes.data) {
        unified.push({
          id: `badge-${b.id}`,
          type: "badge",
          title: `🏅 Badge Unlocked: ${b.badge_name}`,
          description: b.badge_description,
          read: true,
          created_at: b.unlocked_at,
          link: "/badges",
          icon: "award"
        });
      }
    }
    if (challengeRes.data) {
      for (const c of challengeRes.data) {
        const challenge = c.weekly_challenges;
        unified.push({
          id: `challenge-${c.id}`,
          type: "challenge",
          title: `Challenge Entry: ${(challenge == null ? void 0 : challenge.theme) || "Style Showdown"}`,
          description: `You scored ${c.score}/100 in the weekly challenge`,
          read: true,
          created_at: c.created_at,
          link: "/weekly-challenge",
          icon: "trophy"
        });
      }
    }
    unified.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setNotifications(unified);
    setLoading(false);
  }, [user]);
  reactExports.useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All marked as read");
  };
  const filtered = notifications.filter((n) => {
    if (filter === "social") return ["like", "follow", "comment"].includes(n.type);
    if (filter === "badges") return n.type === "badge";
    if (filter === "challenges") return n.type === "challenge";
    return true;
  });
  const unreadCount = notifications.filter((n) => !n.read).length;
  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 6e4);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };
  const iconMap = {
    heart: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "w-4 h-4 text-pink-400" }),
    "user-plus": /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "w-4 h-4 text-primary" }),
    award: /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "w-4 h-4 text-yellow-500" }),
    trophy: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "w-4 h-4 text-primary" }),
    flame: /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "w-4 h-4 text-orange-400" }),
    message: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "w-4 h-4 text-blue-400" })
  };
  const typeBgMap = {
    heart: "bg-pink-500/10",
    "user-plus": "bg-primary/10",
    award: "bg-yellow-500/10",
    trophy: "bg-primary/10",
    flame: "bg-orange-500/10",
    message: "bg-blue-500/10"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-8 max-w-3xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-3xl font-bold text-foreground", children: [
          "Notification ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gold-text", children: "Center" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground mt-1 text-sm", children: [
          "All your activity in one place",
          unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "ml-2 bg-primary/15 text-primary border-primary/30", children: [
            unreadCount,
            " unread"
          ] })
        ] })
      ] }),
      unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: markAllRead, className: "border-primary/30 text-primary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCheck, { className: "w-4 h-4 mr-1" }),
        " Mark all read"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { defaultValue: "all", className: "w-full", onValueChange: (v) => setFilter(v), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-4 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "all", className: "text-xs", children: "All" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "social", className: "text-xs", children: "Social" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "badges", className: "text-xs", children: "Badges" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "challenges", className: "text-xs", children: "Challenges" })
    ] }) }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin text-primary" }) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "w-10 h-10 text-muted-foreground mx-auto mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "No notifications yet" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: filtered.map((n, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: i * 0.03 },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Card,
          {
            className: `glass-card cursor-pointer hover:bg-muted/30 transition-colors ${!n.read ? "ring-1 ring-primary/20 bg-primary/5" : ""}`,
            onClick: () => n.link && navigate(n.link),
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 flex items-start gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mt-0.5 p-2 rounded-full ${typeBgMap[n.icon]}`, children: iconMap[n.icon] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: n.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: n.description })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: timeAgo(n.created_at) }),
                !n.read && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 h-2 w-2 rounded-full bg-primary ml-auto" })
              ] })
            ] })
          }
        )
      },
      n.id
    )) }) })
  ] }) });
}
export {
  NotificationCenter as default
};
