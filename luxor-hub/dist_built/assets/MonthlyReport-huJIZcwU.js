import { j as jsxRuntimeExports, r as reactExports } from "./index-CqA86RF3.js";
import { T as TierGate } from "./TierGate-BrdTI6rL.js";
import { A as AppLayout } from "./AppLayout-QSRtcW1a.js";
import { d as createLucideIcon, e as useAuth, s as supabase } from "./AppContent-h4IlOpH8.js";
import { P as Progress } from "./progress-bBlc5nCU.js";
import { t as toDate, j as format } from "./format-CHv4aOWu.js";
import { m as motion } from "./proxy-ShtysCL3.js";
import { s as startOfMonth, e as endOfMonth, C as ChevronLeft, a as addMonths } from "./startOfMonth-CRnHFxfo.js";
import { C as ChevronRight } from "./chevron-right-DOJh4Uzv.js";
import { L as LoaderCircle } from "./loader-circle-CEY9nmQc.js";
import { C as CalendarDays } from "./BottomNav-DTwSgLpq.js";
import { S as Star } from "./star-CwFGF7ue.js";
import { F as Flame } from "./flame-DhvODhAe.js";
import { T as TrendingUp } from "./trending-up-Dlf1Mqip.js";
import { C as ChartColumn } from "./chart-column-DP9SOD6x.js";
import { D as DollarSign } from "./dollar-sign-C2UykhJy.js";
import { S as Shirt } from "./shirt-Cl12YkbS.js";
import { A as Award } from "./award-C60dU952.js";
import { A as ArrowUpRight } from "./arrow-up-right-DtO09kCB.js";
import { P as Palette } from "./palette-laFTByWf.js";
import { S as Snowflake, C as CloudRain } from "./snowflake-BacfovC1.js";
import { S as Sun } from "./sun-mOFZgOAa.js";
import { L as Leaf } from "./leaf-nF3skAzz.js";
import { s as subMonths } from "./subMonths-BrZI3sbW.js";
import "./usePlanTier-CvY4ap50.js";
import "./useQuery-0OzZNLy2.js";
import "./planRestrictions-__Vqe2nr.js";
import "./lock-81NW8mrd.js";
import "./arrow-right-B1HpFnXV.js";
import "./index-CwmenB4e.js";
import "./index-Bk2ineB8.js";
import "./index-C77h7emK.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ArrowDownRight = createLucideIcon("ArrowDownRight", [
  ["path", { d: "m7 7 10 10", key: "1fmybs" }],
  ["path", { d: "M17 7v10H7", key: "6fjiku" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ChartPie = createLucideIcon("ChartPie", [
  [
    "path",
    {
      d: "M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z",
      key: "pzmjnu"
    }
  ],
  ["path", { d: "M21.21 15.89A10 10 0 1 1 8 2.83", key: "k2fpak" }]
]);
function eachDayOfInterval(interval, options) {
  const startDate = toDate(interval.start);
  const endDate = toDate(interval.end);
  let reversed = +startDate > +endDate;
  const endTime = reversed ? +startDate : +endDate;
  const currentDate = reversed ? endDate : startDate;
  currentDate.setHours(0, 0, 0, 0);
  let step = 1;
  const dates = [];
  while (+currentDate <= endTime) {
    dates.push(toDate(currentDate));
    currentDate.setDate(currentDate.getDate() + step);
    currentDate.setHours(0, 0, 0, 0);
  }
  return reversed ? dates.reverse() : dates;
}
const getCurrentSeason = () => {
  const m = (/* @__PURE__ */ new Date()).getMonth();
  if (m >= 2 && m <= 4) return "spring";
  if (m >= 5 && m <= 7) return "summer";
  if (m >= 8 && m <= 10) return "fall";
  return "winter";
};
const getNextSeason = () => {
  const order = ["spring", "summer", "fall", "winter"];
  const idx = order.indexOf(getCurrentSeason());
  return order[(idx + 1) % 4];
};
const seasonIcon = (s) => {
  switch (s) {
    case "spring":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "w-3.5 h-3.5 text-emerald-500" });
    case "summer":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "w-3.5 h-3.5 text-amber-400" });
    case "fall":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(CloudRain, { className: "w-3.5 h-3.5 text-orange-400" });
    case "winter":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Snowflake, { className: "w-3.5 h-3.5 text-blue-300" });
    default:
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "w-3.5 h-3.5 text-muted-foreground" });
  }
};
const MonthlyReport = () => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TierGate, { requiredTier: "elite", featureName: "Monthly Style Report", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MonthlyReportInner, {}) });
};
const MonthlyReportInner = () => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = reactExports.useState(/* @__PURE__ */ new Date());
  const [events, setEvents] = reactExports.useState([]);
  const [closetItems, setClosetItems] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user, currentMonth]);
  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
    const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");
    const [evRes, itemsRes] = await Promise.all([
      supabase.from("calendar_events").select("*").eq("user_id", user.id).gte("event_date", start).lte("event_date", end),
      supabase.from("clothing_items").select("*").eq("user_id", user.id)
    ]);
    if (evRes.data) setEvents(evRes.data);
    if (itemsRes.data) setClosetItems(itemsRes.data);
    setLoading(false);
  };
  const stats = reactExports.useMemo(() => {
    const daysInMonth = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
    const plannedDays = new Set(events.map((e) => e.event_date));
    const planningConsistency = Math.round(plannedDays.size / daysInMonth.length * 100);
    const fingerprints = /* @__PURE__ */ new Set();
    events.forEach((ev) => {
      const items = Array.isArray(ev.outfit_items) ? ev.outfit_items : [];
      const fp = items.map((i) => (typeof i === "string" ? i : (i == null ? void 0 : i.name) || "").toLowerCase()).filter(Boolean).sort().join("|");
      if (fp) fingerprints.add(fp);
    });
    const uniqueOutfits = fingerprints.size;
    const varietyScore = events.length > 0 ? Math.round(uniqueOutfits / events.length * 100) : 0;
    const itemCounts = /* @__PURE__ */ new Map();
    events.forEach((ev) => {
      const items = Array.isArray(ev.outfit_items) ? ev.outfit_items : [];
      items.forEach((i) => {
        const name = (typeof i === "string" ? i : (i == null ? void 0 : i.name) || "").toLowerCase();
        const photo = typeof i === "object" ? (i == null ? void 0 : i.photo_url) || (i == null ? void 0 : i.photoUrl) || null : null;
        const cat = typeof i === "object" ? (i == null ? void 0 : i.category) || "other" : "other";
        if (!name) return;
        const existing = itemCounts.get(name);
        if (existing) existing.count++;
        else itemCounts.set(name, { count: 1, name: typeof i === "string" ? i : (i == null ? void 0 : i.name) || name, photo_url: photo, category: cat });
      });
    });
    const mostWorn = Array.from(itemCounts.values()).sort((a, b) => b.count - a.count).slice(0, 6);
    const colorCounts = /* @__PURE__ */ new Map();
    events.forEach((ev) => {
      const items = Array.isArray(ev.outfit_items) ? ev.outfit_items : [];
      items.forEach((i) => {
        const color = (typeof i === "object" ? (i == null ? void 0 : i.color) || "" : "").toLowerCase().trim();
        if (color) colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
      });
    });
    const colorDist = Array.from(colorCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const totalColors = colorDist.reduce((sum, [, c]) => sum + c, 0);
    const occasionCounts = /* @__PURE__ */ new Map();
    events.forEach((ev) => {
      const occ = ev.occasion || "Unset";
      occasionCounts.set(occ, (occasionCounts.get(occ) || 0) + 1);
    });
    const occasions = Array.from(occasionCounts.entries()).sort((a, b) => b[1] - a[1]);
    let streak = 0;
    const sortedDates = Array.from(plannedDays).sort().reverse();
    const today = format(/* @__PURE__ */ new Date(), "yyyy-MM-dd");
    let checkDate = today;
    for (const d of sortedDates) {
      if (d === checkDate || d === format(new Date(new Date(checkDate).getTime() - 864e5), "yyyy-MM-dd")) {
        streak++;
        checkDate = d;
      }
    }
    return {
      totalOutfits: events.length,
      uniqueOutfits,
      varietyScore,
      planningConsistency,
      plannedDays: plannedDays.size,
      totalDays: daysInMonth.length,
      mostWorn,
      colorDist,
      totalColors,
      occasions,
      streak
    };
  }, [events, currentMonth]);
  const cpwAnalytics = reactExports.useMemo(() => {
    const withPrice = closetItems.filter((i) => i.price && Number(i.price) > 0);
    if (withPrice.length === 0) return null;
    const totalInvested = withPrice.reduce((s, i) => s + Number(i.price), 0);
    const totalWears = withPrice.reduce((s, i) => s + (i.wear_count || 0), 0);
    const avgCpw = totalWears > 0 ? totalInvested / totalWears : totalInvested;
    const items = withPrice.map((i) => {
      const price = Number(i.price);
      const wears = i.wear_count || 0;
      const cpw = wears > 0 ? Math.round(price / wears * 100) / 100 : price;
      return { ...i, cpw, wears, priceNum: price, paidOff: cpw < 2 };
    });
    const bestValue = [...items].filter((i) => i.wears > 0).sort((a, b) => a.cpw - b.cpw).slice(0, 5);
    const worstValue = [...items].filter((i) => i.wears > 0).sort((a, b) => b.cpw - a.cpw).slice(0, 5);
    const neverWorn = items.filter((i) => i.wears === 0).sort((a, b) => b.priceNum - a.priceNum).slice(0, 5);
    const neverWornTotal = items.filter((i) => i.wears === 0).reduce((s, i) => s + i.priceNum, 0);
    return { totalInvested, totalWears, avgCpw: Math.round(avgCpw * 100) / 100, bestValue, worstValue, neverWorn, neverWornTotal };
  }, [closetItems]);
  const seasonalAnalysis = reactExports.useMemo(() => {
    const current = getCurrentSeason();
    const next = getNextSeason();
    const rotateIn = [];
    const rotateOut = [];
    const allSeason = [];
    closetItems.forEach((item) => {
      const s = (item.season || "").toLowerCase().trim();
      if (!s || s === "all" || s === "all-season" || s === "all season") {
        allSeason.push(item);
        return;
      }
      const seasons = s.split(/[,\/&]+/).map((x) => x.trim().toLowerCase());
      const fitsCurrent = seasons.includes(current);
      const fitsNext = seasons.includes(next);
      if (!fitsCurrent && fitsNext) rotateIn.push(item);
      if (fitsCurrent && !fitsNext) rotateOut.push(item);
    });
    return { current, next, rotateIn: rotateIn.slice(0, 6), rotateOut: rotateOut.slice(0, 6), allSeason: allSeason.length };
  }, [closetItems]);
  const colorHexMap = {
    black: "#1a1a1a",
    white: "#f5f5f5",
    gray: "#888",
    grey: "#888",
    navy: "#1a237e",
    blue: "#1976d2",
    red: "#d32f2f",
    green: "#388e3c",
    yellow: "#fbc02d",
    orange: "#f57c00",
    pink: "#e91e63",
    purple: "#7b1fa2",
    brown: "#795548",
    beige: "#d7ccc8",
    cream: "#fff8e1",
    tan: "#bcaaa4",
    burgundy: "#880e4f",
    maroon: "#880e4f",
    olive: "#827717"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 max-w-2xl mx-auto pb-28", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl font-bold text-foreground tracking-tight", children: "Monthly Style Report" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans text-xs mt-0.5", children: "Your wardrobe analytics & insights" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-5 mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setCurrentMonth(subMonths(currentMonth, 1)), className: "p-2.5 rounded-xl hover:bg-secondary transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "w-4 h-4 text-foreground" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-base font-bold text-foreground", children: format(currentMonth, "MMMM yyyy") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setCurrentMonth(addMonths(currentMonth, 1)), className: "p-2.5 rounded-xl hover:bg-secondary transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4 text-foreground" }) })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin text-primary" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.1 },
          className: "grid grid-cols-2 gap-3",
          children: [
            { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "w-4 h-4 text-primary" }), value: stats.totalOutfits, label: "Outfits Planned" },
            { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "w-4 h-4 text-primary" }), value: `${stats.varietyScore}%`, label: "Variety Score" },
            { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "w-4 h-4 text-orange-400" }), value: stats.streak, label: "Current Streak" },
            { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-4 h-4 text-primary" }), value: stats.uniqueOutfits, label: "Unique Combos" }
          ].map((card, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { opacity: 0, scale: 0.95 },
              animate: { opacity: 1, scale: 1 },
              transition: { delay: 0.1 + i * 0.05 },
              className: "rounded-2xl border border-border bg-card p-4 text-center",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center mb-2", children: card.icon }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-xl font-bold text-foreground", children: card.value }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-sans text-muted-foreground mt-0.5", children: card.label })
              ]
            },
            i
          ))
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.2 },
          className: "rounded-2xl border border-border bg-card p-4",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "w-4 h-4 text-primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-sans font-semibold text-muted-foreground uppercase tracking-[0.15em]", children: "Planning Consistency" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-sans text-foreground font-medium", children: [
                stats.plannedDays,
                " of ",
                stats.totalDays,
                " days planned"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-sans font-bold text-primary", children: [
                stats.planningConsistency,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: stats.planningConsistency, className: "h-2.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-sans text-muted-foreground mt-2", children: stats.planningConsistency >= 80 ? "🏆 Excellent — you're a planning pro!" : stats.planningConsistency >= 50 ? "👍 Good progress — keep building the habit!" : "💡 Try planning more days ahead for better style consistency" })
          ]
        }
      ),
      cpwAnalytics && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.22 },
          className: "rounded-2xl border border-border bg-card p-4",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "w-4 h-4 text-emerald-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-sans font-semibold text-muted-foreground uppercase tracking-[0.15em]", children: "Cost-Per-Wear Analytics" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2 mb-4", children: [
              { label: "Invested", value: `$${Math.round(cpwAnalytics.totalInvested).toLocaleString()}` },
              { label: "Total Wears", value: cpwAnalytics.totalWears.toString() },
              { label: "Avg CPW", value: `$${cpwAnalytics.avgCpw}` }
            ].map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-secondary/50 p-2.5 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-sm font-bold text-foreground", children: s.value }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px] font-sans text-muted-foreground", children: s.label })
            ] }, i)) }),
            cpwAnalytics.bestValue.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] font-sans font-semibold text-muted-foreground mb-2 flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDownRight, { className: "w-3 h-3 text-emerald-500" }),
                " Best Value"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: cpwAnalytics.bestValue.map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
                item.photo_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-lg bg-white/90 dark:bg-white/80 overflow-hidden flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: item.photo_url, alt: "", className: "w-full h-full object-contain", style: { mixBlendMode: "multiply" } }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shirt, { className: "w-3.5 h-3.5 text-muted-foreground/40" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-sans text-foreground truncate capitalize", children: item.name || item.category }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[9px] text-muted-foreground font-sans", children: [
                    item.wears,
                    " wears · $",
                    item.priceNum
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                  item.paidOff && /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "w-3 h-3 text-amber-400" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-xs font-sans font-bold ${item.cpw < 5 ? "text-emerald-500" : "text-foreground"}`, children: [
                    "$",
                    item.cpw
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[8px] text-muted-foreground", children: "/wear" })
                ] })
              ] }, i)) })
            ] }),
            cpwAnalytics.worstValue.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] font-sans font-semibold text-muted-foreground mb-2 flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "w-3 h-3 text-red-400" }),
                " Needs More Wear"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: cpwAnalytics.worstValue.map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shirt, { className: "w-3.5 h-3.5 text-muted-foreground/40" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-sans text-foreground truncate capitalize", children: item.name || item.category }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[9px] text-muted-foreground font-sans", children: [
                    item.wears,
                    " wears · $",
                    item.priceNum
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-sans font-bold text-red-400", children: [
                  "$",
                  item.cpw,
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[8px] text-muted-foreground", children: "/wear" })
                ] })
              ] }, i)) })
            ] }),
            cpwAnalytics.neverWorn.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-amber-500/20 bg-amber-500/5 p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] font-sans font-semibold text-amber-600 dark:text-amber-400 mb-1", children: [
                "💸 $",
                Math.round(cpwAnalytics.neverWornTotal),
                " sitting unworn"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: cpwAnalytics.neverWorn.map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-sans px-2 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize", children: [
                item.name || item.category,
                " · $",
                item.priceNum
              ] }, i)) })
            ] })
          ]
        }
      ),
      (seasonalAnalysis.rotateIn.length > 0 || seasonalAnalysis.rotateOut.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.24 },
          className: "rounded-2xl border border-border bg-card p-4",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
              seasonIcon(seasonalAnalysis.next),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-sans font-semibold text-muted-foreground uppercase tracking-[0.15em]", children: "Seasonal Rotation" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] font-sans text-muted-foreground mb-3", children: [
              "Preparing for ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize font-medium text-foreground", children: seasonalAnalysis.next }),
              " — ",
              seasonalAnalysis.allSeason,
              " all-season items ready"
            ] }),
            seasonalAnalysis.rotateIn.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] font-sans font-semibold text-emerald-500 mb-2 flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "w-3 h-3" }),
                " Rotate In for ",
                seasonalAnalysis.next
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: seasonalAnalysis.rotateIn.map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20", children: [
                item.photo_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded bg-white/90 dark:bg-white/80 overflow-hidden flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: item.photo_url, alt: "", className: "w-full h-full object-contain", style: { mixBlendMode: "multiply" } }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Shirt, { className: "w-3.5 h-3.5 text-emerald-500/60" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-sans text-foreground capitalize", children: item.name || item.category })
              ] }, i)) })
            ] }),
            seasonalAnalysis.rotateOut.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] font-sans font-semibold text-orange-400 mb-2 flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDownRight, { className: "w-3 h-3" }),
                " Store Away (",
                seasonalAnalysis.current,
                ")"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: seasonalAnalysis.rotateOut.map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20", children: [
                item.photo_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded bg-white/90 dark:bg-white/80 overflow-hidden flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: item.photo_url, alt: "", className: "w-full h-full object-contain", style: { mixBlendMode: "multiply" } }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Shirt, { className: "w-3.5 h-3.5 text-orange-400/60" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-sans text-foreground capitalize", children: item.name || item.category })
              ] }, i)) })
            ] })
          ]
        }
      ),
      stats.mostWorn.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.25 },
          className: "rounded-2xl border border-border bg-card p-4",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Shirt, { className: "w-4 h-4 text-primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-sans font-semibold text-muted-foreground uppercase tracking-[0.15em]", children: "Most Worn Items" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: stats.mostWorn.map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-sans font-bold text-muted-foreground w-4", children: [
                "#",
                i + 1
              ] }),
              item.photo_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-lg bg-white/95 dark:bg-white/90 overflow-hidden flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: item.photo_url, alt: "", className: "w-full h-full object-contain", style: { mixBlendMode: "multiply" } }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shirt, { className: "w-4 h-4 text-muted-foreground/40" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-sans font-medium text-foreground truncate capitalize", children: item.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-sans text-muted-foreground capitalize", children: item.category })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-sans font-bold text-primary", children: [
                item.count,
                "×"
              ] })
            ] }, i)) })
          ]
        }
      ),
      stats.colorDist.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.3 },
          className: "rounded-2xl border border-border bg-card p-4",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Palette, { className: "w-4 h-4 text-primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-sans font-semibold text-muted-foreground uppercase tracking-[0.15em]", children: "Color Distribution" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: stats.colorDist.map(([color, count], i) => {
              const pct = stats.totalColors > 0 ? Math.round(count / stats.totalColors * 100) : 0;
              const hex = colorHexMap[color] || "#888";
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-5 h-5 rounded-full flex-shrink-0 ring-1 ring-border/30", style: { backgroundColor: hex } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-sans text-foreground capitalize w-16 truncate", children: color }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 rounded-full overflow-hidden bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    initial: { width: 0 },
                    animate: { width: `${pct}%` },
                    transition: { duration: 0.6, delay: i * 0.05 },
                    className: "h-full rounded-full",
                    style: { backgroundColor: hex }
                  }
                ) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-sans font-bold text-muted-foreground w-8 text-right", children: [
                  pct,
                  "%"
                ] })
              ] }, i);
            }) })
          ]
        }
      ),
      stats.occasions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.35 },
          className: "rounded-2xl border border-border bg-card p-4",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChartPie, { className: "w-4 h-4 text-primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-sans font-semibold text-muted-foreground uppercase tracking-[0.15em]", children: "Occasion Breakdown" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: stats.occasions.map(([occ, count], i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.div,
              {
                initial: { opacity: 0, scale: 0.9 },
                animate: { opacity: 1, scale: 1 },
                transition: { delay: 0.35 + i * 0.04 },
                className: "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans bg-primary/10 text-primary border border-primary/20",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: occ }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: count })
                ]
              },
              i
            )) })
          ]
        }
      ),
      events.length === 0 && !cpwAnalytics && seasonalAnalysis.rotateIn.length === 0 && seasonalAnalysis.rotateOut.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "w-7 h-7 text-muted-foreground/40" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans text-sm", children: "No outfits planned this month" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground/60 font-sans text-xs mt-0.5", children: "Head to Outfit Schedule to start planning!" })
      ] })
    ] })
  ] }) });
};
export {
  MonthlyReport as default
};
