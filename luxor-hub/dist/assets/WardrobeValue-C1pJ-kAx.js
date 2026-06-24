import { j as jsxRuntimeExports, r as reactExports } from "./index-BJjnbSuc.js";
import { A as AppLayout } from "./AppLayout-DQMjD52q.js";
import { d as createLucideIcon, e as useAuth, s as supabase, T as TriangleAlert } from "./AppContent-4cFLEqQ4.js";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle } from "./card-6Baj89SU.js";
import { T as TierGate } from "./TierGate-UP2WgdwB.js";
import { m as motion } from "./proxy-DPNpeU0t.js";
import { D as DollarSign } from "./dollar-sign-KKb_KM49.js";
import { T as TrendingUp } from "./trending-up-C53f9tAL.js";
import { S as ShoppingBag } from "./shopping-bag-DL7n-KjC.js";
import { X } from "./x-kMbRGhbO.js";
import { R as ResponsiveContainer, P as PieChart, p as Pie, C as Cell, q as Tooltip } from "./PieChart-DDxwxLE6.js";
import { S as Shirt } from "./shirt-GoHrHLkp.js";
import { W as Watch } from "./watch-Ffblnd_3.js";
import "./BottomNav-TzXkY_hr.js";
import "./index-CWYjAC1K.js";
import "./usePlanTier-Dnd9Vx1Q.js";
import "./useQuery-BNpZQpR2.js";
import "./planRestrictions-__Vqe2nr.js";
import "./lock-KX049Fqg.js";
import "./arrow-right-tIMF6hRe.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Footprints = createLucideIcon("Footprints", [
  [
    "path",
    {
      d: "M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z",
      key: "1dudjm"
    }
  ],
  [
    "path",
    {
      d: "M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z",
      key: "l2t8xc"
    }
  ],
  ["path", { d: "M16 17h4", key: "1dejxt" }],
  ["path", { d: "M4 13h4", key: "1bwh8b" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const TrendingDown = createLucideIcon("TrendingDown", [
  ["polyline", { points: "22 17 13.5 8.5 8.5 13.5 2 7", key: "1r2t7k" }],
  ["polyline", { points: "16 17 22 17 22 11", key: "11uiuu" }]
]);
const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--muted-foreground))",
  "hsl(0 0% 60%)",
  "hsl(0 0% 40%)",
  "hsl(0 0% 75%)",
  "hsl(0 0% 25%)"
];
const CATEGORY_ICONS = {
  top: /* @__PURE__ */ jsxRuntimeExports.jsx(Shirt, { className: "w-4 h-4" }),
  bottom: /* @__PURE__ */ jsxRuntimeExports.jsx(Shirt, { className: "w-4 h-4" }),
  shoes: /* @__PURE__ */ jsxRuntimeExports.jsx(Footprints, { className: "w-4 h-4" }),
  accessory: /* @__PURE__ */ jsxRuntimeExports.jsx(Watch, { className: "w-4 h-4" })
};
const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};
function WardrobeValue() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TierGate, { requiredTier: "pro", featureName: "Wardrobe Value", children: /* @__PURE__ */ jsxRuntimeExports.jsx(WardrobeValueContent, {}) }) });
}
function WardrobeValueContent() {
  const { user } = useAuth();
  const [items, setItems] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [dismissedIds, setDismissedIds] = reactExports.useState(/* @__PURE__ */ new Set());
  reactExports.useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("clothing_items").select("id, name, category, price, wear_count, last_worn_at, photo_url").eq("user_id", user.id);
      if (data) setItems(data);
      setLoading(false);
    })();
  }, [user]);
  const stats = reactExports.useMemo(() => {
    const priced = items.filter((i) => i.price && i.price > 0);
    const totalValue = priced.reduce((s, i) => s + (i.price || 0), 0);
    const totalWears = priced.reduce((s, i) => s + i.wear_count, 0);
    const avgCpw = totalWears > 0 ? totalValue / totalWears : 0;
    return { totalValue, totalItems: items.length, avgCpw };
  }, [items]);
  const bestValue = reactExports.useMemo(() => {
    return items.filter((i) => i.price && i.price > 0 && i.wear_count > 0).map((i) => ({ ...i, cpw: (i.price || 0) / i.wear_count })).sort((a, b) => a.cpw - b.cpw).slice(0, 5);
  }, [items]);
  const worstValue = reactExports.useMemo(() => {
    return items.filter((i) => i.price && i.price > 0).map((i) => ({ ...i, cpw: i.wear_count > 0 ? (i.price || 0) / i.wear_count : i.price || 0 })).sort((a, b) => b.cpw - a.cpw).slice(0, 5);
  }, [items]);
  const deadInventory = reactExports.useMemo(() => {
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0];
    return items.filter(
      (i) => i.price && i.price > 20 && !dismissedIds.has(i.id) && (!i.last_worn_at || i.last_worn_at < sixtyDaysAgo)
    );
  }, [items, dismissedIds]);
  const categoryData = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    items.filter((i) => i.price && i.price > 0).forEach((i) => map.set(i.category, (map.get(i.category) || 0) + (i.price || 0)));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value: Math.round(value) })).sort((a, b) => b.value - a.value);
  }, [items]);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 max-w-2xl mx-auto space-y-4", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-32 rounded-2xl bg-secondary animate-pulse" }, i)) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      className: "p-4 sm:p-5 lg:p-8 max-w-2xl mx-auto space-y-5",
      initial: "hidden",
      animate: "show",
      variants: { show: { transition: { staggerChildren: 0.08 } } },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { variants: fadeUp, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-2xl font-bold text-foreground flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "w-6 h-6" }),
            " Wardrobe Value"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground font-sans mt-1", children: "Understand your closet investment" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: fadeUp, className: "grid grid-cols-3 gap-3", children: [
          { label: "Total Value", value: `$${stats.totalValue.toLocaleString()}` },
          { label: "Items", value: stats.totalItems.toString() },
          { label: "Avg CPW", value: `$${stats.avgCpw.toFixed(2)}` }
        ].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60 bg-card/60 backdrop-blur-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-wider text-muted-foreground font-sans", children: s.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-foreground mt-1", children: s.value })
        ] }) }, s.label)) }),
        bestValue.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60 bg-card/60 backdrop-blur-xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base font-display flex items-center gap-2 text-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-4 h-4 text-green-500" }),
            " Best Value Items"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-2", children: bestValue.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-1.5 border-b border-border/30 last:border-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
              item.photo_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: item.photo_url, alt: "", className: "w-8 h-8 rounded-lg object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-lg bg-secondary flex items-center justify-center", children: CATEGORY_ICONS[item.category] || /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "w-4 h-4 text-muted-foreground" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-sans text-foreground truncate", children: item.name || item.category })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-mono text-green-500 whitespace-nowrap", children: [
              "$",
              item.cpw.toFixed(2),
              "/wear"
            ] })
          ] }, item.id)) })
        ] }) }),
        worstValue.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60 bg-card/60 backdrop-blur-xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base font-display flex items-center gap-2 text-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "w-4 h-4 text-destructive" }),
            " Highest Cost-Per-Wear"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-2", children: worstValue.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-1.5 border-b border-border/30 last:border-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
              item.photo_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: item.photo_url, alt: "", className: "w-8 h-8 rounded-lg object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-lg bg-secondary flex items-center justify-center", children: CATEGORY_ICONS[item.category] || /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "w-4 h-4 text-muted-foreground" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-sans text-foreground truncate", children: item.name || item.category })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-mono text-destructive whitespace-nowrap", children: [
              "$",
              item.cpw.toFixed(2),
              "/wear"
            ] })
          ] }, item.id)) })
        ] }) }),
        deadInventory.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60 bg-card/60 backdrop-blur-xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base font-display flex items-center gap-2 text-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 text-yellow-500" }),
              " Dead Inventory"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground font-sans", children: "Items over $20 not worn in 60+ days" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-2", children: deadInventory.slice(0, 8).map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-1.5 border-b border-border/30 last:border-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
              item.photo_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: item.photo_url, alt: "", className: "w-8 h-8 rounded-lg object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-lg bg-secondary flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "w-4 h-4 text-muted-foreground" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-sans text-foreground truncate", children: item.name || item.category }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground", children: [
                  "$",
                  item.price
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setDismissedIds((prev) => new Set(prev).add(item.id)),
                className: "p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" })
              }
            )
          ] }, item.id)) })
        ] }) }),
        categoryData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60 bg-card/60 backdrop-blur-xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base font-display text-foreground", children: "Spend by Category" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-32 h-32", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: categoryData, cx: "50%", cy: "50%", innerRadius: 30, outerRadius: 55, dataKey: "value", stroke: "none", children: categoryData.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: COLORS[i % COLORS.length] }, i)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Tooltip,
                {
                  formatter: (value) => [`$${value}`, ""],
                  contentStyle: { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }
                }
              )
            ] }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 space-y-1.5", children: categoryData.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs font-sans", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2.5 h-2.5 rounded-full", style: { background: COLORS[i % COLORS.length] } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground capitalize", children: c.name })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                "$",
                c.value
              ] })
            ] }, c.name)) })
          ] }) })
        ] }) })
      ]
    }
  );
}
export {
  WardrobeValue as default
};
