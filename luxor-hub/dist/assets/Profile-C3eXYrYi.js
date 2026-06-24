import { h as useParams, r as reactExports, j as jsxRuntimeExports } from "./index-BJjnbSuc.js";
import { A as AppLayout } from "./AppLayout-DQMjD52q.js";
import { d as createLucideIcon, e as useAuth, B as Button, s as supabase } from "./AppContent-4cFLEqQ4.js";
import { t as toast } from "./index-DqqhH6-L.js";
import { m as motion } from "./proxy-DPNpeU0t.js";
import { U as UserPlus } from "./user-plus-DQbc4X02.js";
import { S as Sparkles } from "./sparkles-D_uBq3Qr.js";
import { U as Users } from "./users-C4_PMGj-.js";
import "./BottomNav-TzXkY_hr.js";
import "./shirt-GoHrHLkp.js";
import "./index-CWYjAC1K.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const UserCheck = createLucideIcon("UserCheck", [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
  ["polyline", { points: "16 11 18 13 22 9", key: "1pwet4" }]
]);
const Profile = () => {
  var _a;
  const { userId } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = reactExports.useState(null);
  const [looks, setLooks] = reactExports.useState([]);
  const [followerCount, setFollowerCount] = reactExports.useState(0);
  const [followingCount, setFollowingCount] = reactExports.useState(0);
  const [isFollowing, setIsFollowing] = reactExports.useState(false);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    if (!userId) return;
    const fetchProfile = async () => {
      const [profileRes, looksRes, followersRes, followingRes] = await Promise.all([
        supabase.from("profiles").select("user_id, display_name, avatar_url").eq("user_id", userId).single(),
        supabase.from("user_looks").select("*").eq("user_id", userId).eq("is_public", true).order("created_at", { ascending: false }),
        supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", userId),
        supabase.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", userId)
      ]);
      if (profileRes.data) setProfile(profileRes.data);
      setLooks(looksRes.data || []);
      setFollowerCount(followersRes.count || 0);
      setFollowingCount(followingRes.count || 0);
      if (user && user.id !== userId) {
        const { data } = await supabase.from("follows").select("id").eq("follower_id", user.id).eq("following_id", userId).maybeSingle();
        setIsFollowing(!!data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [userId, user]);
  const toggleFollow = async () => {
    if (!user || !userId || user.id === userId) return;
    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", userId);
      setIsFollowing(false);
      setFollowerCount((c) => c - 1);
      toast.success("Unfollowed");
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, following_id: userId });
      await supabase.from("notifications").insert({
        user_id: userId,
        actor_id: user.id,
        type: "follow"
      });
      setIsFollowing(true);
      setFollowerCount((c) => c + 1);
      toast.success("Following! ✨");
    }
  };
  const displayName = (profile == null ? void 0 : profile.display_name) || "User";
  const isOwnProfile = (user == null ? void 0 : user.id) === userId;
  const moodColors = {
    Professional: "bg-primary/10 text-primary",
    Relaxed: "bg-blue-500/10 text-blue-400",
    Romantic: "bg-pink-500/10 text-pink-400",
    Energetic: "bg-orange-500/10 text-orange-400",
    Creative: "bg-amber-500/10 text-amber-400",
    Bold: "bg-red-500/10 text-red-400"
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center min-h-[60vh]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" }) }) });
  }
  if (!profile) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center min-h-[60vh]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans", children: "Profile not found" }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 lg:p-8 max-w-4xl mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass rounded-2xl p-6 lg:p-8 mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-full gold-gradient flex items-center justify-center text-primary-foreground font-display text-2xl font-bold shrink-0", children: (_a = displayName[0]) == null ? void 0 : _a.toUpperCase() }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl font-bold text-foreground", children: displayName }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-5 mt-2 text-sm font-sans text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: followerCount }),
            " followers"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: followingCount }),
            " following"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: looks.length }),
            " looks"
          ] })
        ] })
      ] }),
      !isOwnProfile && user && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: toggleFollow,
          variant: isFollowing ? "outline" : "default",
          className: isFollowing ? "border-primary/30 text-primary font-sans" : "gold-gradient text-primary-foreground font-sans",
          children: isFollowing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "h-4 w-4 mr-2" }),
            " Following"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-4 w-4 mr-2" }),
            " Follow"
          ] })
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-5 w-5 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-bold text-foreground", children: "Public Looks" })
    ] }),
    looks.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-12 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-10 w-10 text-muted-foreground mx-auto mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans text-sm", children: isOwnProfile ? "You haven't shared any looks yet." : "No public looks yet." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2", children: looks.map((look, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 15 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: i * 0.05 },
        className: "glass rounded-2xl p-5",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-bold text-foreground mb-1", children: look.title }),
          look.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground font-sans mb-3", children: look.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap mb-3", children: [
            look.mood && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-2 py-0.5 rounded-full text-[10px] font-sans font-medium ${moodColors[look.mood] || "bg-secondary text-muted-foreground"}`, children: look.mood }),
            look.occasion && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded-full text-[10px] font-sans bg-secondary text-muted-foreground", children: look.occasion })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: look.items.map((item, j) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2.5 py-1 rounded-full text-xs font-sans bg-secondary/80 text-foreground/80", children: item }, j)) })
        ]
      },
      look.id
    )) })
  ] }) }) });
};
export {
  Profile as default
};
