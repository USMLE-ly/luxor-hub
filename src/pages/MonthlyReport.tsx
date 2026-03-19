import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart3, Palette, TrendingUp, Shirt, CalendarDays, ChevronLeft, ChevronRight,
  Award, Flame, Star, Loader2, PieChart, DollarSign, Snowflake, Sun, Leaf, CloudRain,
  ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, addMonths, subMonths, eachDayOfInterval } from "date-fns";
import { Progress } from "@/components/ui/progress";

interface CalendarEvent {
  id: string;
  title: string;
  event_date: string;
  occasion: string | null;
  outfit_items: any;
}

interface ClothingItem {
  id: string;
  name: string | null;
  category: string;
  color: string | null;
  photo_url: string | null;
  wear_count: number;
  price: number | null;
  season: string | null;
}

const getCurrentSeason = (): string => {
  const m = new Date().getMonth();
  if (m >= 2 && m <= 4) return "spring";
  if (m >= 5 && m <= 7) return "summer";
  if (m >= 8 && m <= 10) return "fall";
  return "winter";
};

const getNextSeason = (): string => {
  const order = ["spring", "summer", "fall", "winter"];
  const idx = order.indexOf(getCurrentSeason());
  return order[(idx + 1) % 4];
};

const seasonIcon = (s: string) => {
  switch (s) {
    case "spring": return <Leaf className="w-3.5 h-3.5 text-emerald-500" />;
    case "summer": return <Sun className="w-3.5 h-3.5 text-amber-400" />;
    case "fall": return <CloudRain className="w-3.5 h-3.5 text-orange-400" />;
    case "winter": return <Snowflake className="w-3.5 h-3.5 text-blue-300" />;
    default: return <Star className="w-3.5 h-3.5 text-muted-foreground" />;
  }
};

const MonthlyReport = () => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [closetItems, setClosetItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      supabase.from("clothing_items").select("*").eq("user_id", user.id),
    ]);
    if (evRes.data) setEvents(evRes.data);
    if (itemsRes.data) setClosetItems(itemsRes.data as ClothingItem[]);
    setLoading(false);
  };

  const stats = useMemo(() => {
    const daysInMonth = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
    const plannedDays = new Set(events.map(e => e.event_date));
    const planningConsistency = Math.round((plannedDays.size / daysInMonth.length) * 100);

    const fingerprints = new Set<string>();
    events.forEach(ev => {
      const items = Array.isArray(ev.outfit_items) ? ev.outfit_items : [];
      const fp = items.map((i: any) => (typeof i === "string" ? i : i?.name || "").toLowerCase()).filter(Boolean).sort().join("|");
      if (fp) fingerprints.add(fp);
    });
    const uniqueOutfits = fingerprints.size;
    const varietyScore = events.length > 0 ? Math.round((uniqueOutfits / events.length) * 100) : 0;

    const itemCounts = new Map<string, { count: number; name: string; photo_url: string | null; category: string }>();
    events.forEach(ev => {
      const items = Array.isArray(ev.outfit_items) ? ev.outfit_items : [];
      items.forEach((i: any) => {
        const name = (typeof i === "string" ? i : i?.name || "").toLowerCase();
        const photo = typeof i === "object" ? (i?.photo_url || i?.photoUrl || null) : null;
        const cat = typeof i === "object" ? (i?.category || "other") : "other";
        if (!name) return;
        const existing = itemCounts.get(name);
        if (existing) existing.count++;
        else itemCounts.set(name, { count: 1, name: typeof i === "string" ? i : i?.name || name, photo_url: photo, category: cat });
      });
    });
    const mostWorn = Array.from(itemCounts.values()).sort((a, b) => b.count - a.count).slice(0, 6);

    const colorCounts = new Map<string, number>();
    events.forEach(ev => {
      const items = Array.isArray(ev.outfit_items) ? ev.outfit_items : [];
      items.forEach((i: any) => {
        const color = (typeof i === "object" ? (i?.color || "") : "").toLowerCase().trim();
        if (color) colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
      });
    });
    const colorDist = Array.from(colorCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const totalColors = colorDist.reduce((sum, [, c]) => sum + c, 0);

    const occasionCounts = new Map<string, number>();
    events.forEach(ev => {
      const occ = ev.occasion || "Unset";
      occasionCounts.set(occ, (occasionCounts.get(occ) || 0) + 1);
    });
    const occasions = Array.from(occasionCounts.entries()).sort((a, b) => b[1] - a[1]);

    let streak = 0;
    const sortedDates = Array.from(plannedDays).sort().reverse();
    const today = format(new Date(), "yyyy-MM-dd");
    let checkDate = today;
    for (const d of sortedDates) {
      if (d === checkDate || d === format(new Date(new Date(checkDate).getTime() - 86400000), "yyyy-MM-dd")) {
        streak++;
        checkDate = d;
      }
    }

    return {
      totalOutfits: events.length, uniqueOutfits, varietyScore, planningConsistency,
      plannedDays: plannedDays.size, totalDays: daysInMonth.length, mostWorn, colorDist,
      totalColors, occasions, streak,
    };
  }, [events, currentMonth]);

  // Cost-per-wear analytics
  const cpwAnalytics = useMemo(() => {
    const withPrice = closetItems.filter(i => i.price && Number(i.price) > 0);
    if (withPrice.length === 0) return null;

    const totalInvested = withPrice.reduce((s, i) => s + Number(i.price), 0);
    const totalWears = withPrice.reduce((s, i) => s + (i.wear_count || 0), 0);
    const avgCpw = totalWears > 0 ? totalInvested / totalWears : totalInvested;

    const items = withPrice.map(i => {
      const price = Number(i.price);
      const wears = i.wear_count || 0;
      const cpw = wears > 0 ? Math.round((price / wears) * 100) / 100 : price;
      return { ...i, cpw, wears, priceNum: price, paidOff: cpw < 2 };
    });

    const bestValue = [...items].filter(i => i.wears > 0).sort((a, b) => a.cpw - b.cpw).slice(0, 5);
    const worstValue = [...items].filter(i => i.wears > 0).sort((a, b) => b.cpw - a.cpw).slice(0, 5);
    const neverWorn = items.filter(i => i.wears === 0).sort((a, b) => b.priceNum - a.priceNum).slice(0, 5);
    const neverWornTotal = items.filter(i => i.wears === 0).reduce((s, i) => s + i.priceNum, 0);

    return { totalInvested, totalWears, avgCpw: Math.round(avgCpw * 100) / 100, bestValue, worstValue, neverWorn, neverWornTotal };
  }, [closetItems]);

  // Seasonal wardrobe analysis
  const seasonalAnalysis = useMemo(() => {
    const current = getCurrentSeason();
    const next = getNextSeason();

    const rotateIn: ClothingItem[] = [];
    const rotateOut: ClothingItem[] = [];
    const allSeason: ClothingItem[] = [];

    closetItems.forEach(item => {
      const s = (item.season || "").toLowerCase().trim();
      if (!s || s === "all" || s === "all-season" || s === "all season") {
        allSeason.push(item);
        return;
      }
      const seasons = s.split(/[,\/&]+/).map(x => x.trim().toLowerCase());
      const fitsCurrent = seasons.includes(current);
      const fitsNext = seasons.includes(next);

      if (!fitsCurrent && fitsNext) rotateIn.push(item);
      if (fitsCurrent && !fitsNext) rotateOut.push(item);
    });

    return { current, next, rotateIn: rotateIn.slice(0, 6), rotateOut: rotateOut.slice(0, 6), allSeason: allSeason.length };
  }, [closetItems]);

  const colorHexMap: Record<string, string> = {
    black: "#1a1a1a", white: "#f5f5f5", gray: "#888", grey: "#888",
    navy: "#1a237e", blue: "#1976d2", red: "#d32f2f", green: "#388e3c",
    yellow: "#fbc02d", orange: "#f57c00", pink: "#e91e63", purple: "#7b1fa2",
    brown: "#795548", beige: "#d7ccc8", cream: "#fff8e1", tan: "#bcaaa4",
    burgundy: "#880e4f", maroon: "#880e4f", olive: "#827717",
  };

  return (
    <AppLayout>
      <div className="p-5 max-w-2xl mx-auto pb-28">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">Monthly Style Report</h1>
          <p className="text-muted-foreground font-sans text-xs mt-0.5">Your wardrobe analytics & insights</p>
        </motion.div>

        {/* Month Nav */}
        <div className="flex items-center justify-between mt-5 mb-5">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2.5 rounded-xl hover:bg-secondary transition-colors">
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <h2 className="font-display text-base font-bold text-foreground">{format(currentMonth, "MMMM yyyy")}</h2>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2.5 rounded-xl hover:bg-secondary transition-colors">
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Overview Cards */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="grid grid-cols-2 gap-3">
              {[
                { icon: <CalendarDays className="w-4 h-4 text-primary" />, value: stats.totalOutfits, label: "Outfits Planned" },
                { icon: <Star className="w-4 h-4 text-primary" />, value: `${stats.varietyScore}%`, label: "Variety Score" },
                { icon: <Flame className="w-4 h-4 text-orange-400" />, value: stats.streak, label: "Current Streak" },
                { icon: <TrendingUp className="w-4 h-4 text-primary" />, value: stats.uniqueOutfits, label: "Unique Combos" },
              ].map((card, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.05 }}
                  className="rounded-2xl border border-border bg-card p-4 text-center">
                  <div className="flex justify-center mb-2">{card.icon}</div>
                  <p className="font-display text-xl font-bold text-foreground">{card.value}</p>
                  <p className="text-[10px] font-sans text-muted-foreground mt-0.5">{card.label}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Planning Consistency */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-primary" />
                <p className="text-[10px] font-sans font-semibold text-muted-foreground uppercase tracking-[0.15em]">Planning Consistency</p>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-sans text-foreground font-medium">{stats.plannedDays} of {stats.totalDays} days planned</span>
                <span className="text-xs font-sans font-bold text-primary">{stats.planningConsistency}%</span>
              </div>
              <Progress value={stats.planningConsistency} className="h-2.5" />
              <p className="text-[10px] font-sans text-muted-foreground mt-2">
                {stats.planningConsistency >= 80 ? "🏆 Excellent — you're a planning pro!" :
                 stats.planningConsistency >= 50 ? "👍 Good progress — keep building the habit!" :
                 "💡 Try planning more days ahead for better style consistency"}
              </p>
            </motion.div>

            {/* Cost-Per-Wear Analytics */}
            {cpwAnalytics && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
                className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  <p className="text-[10px] font-sans font-semibold text-muted-foreground uppercase tracking-[0.15em]">Cost-Per-Wear Analytics</p>
                </div>
                {/* Summary row */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: "Invested", value: `$${Math.round(cpwAnalytics.totalInvested).toLocaleString()}` },
                    { label: "Total Wears", value: cpwAnalytics.totalWears.toString() },
                    { label: "Avg CPW", value: `$${cpwAnalytics.avgCpw}` },
                  ].map((s, i) => (
                    <div key={i} className="rounded-xl bg-secondary/50 p-2.5 text-center">
                      <p className="font-display text-sm font-bold text-foreground">{s.value}</p>
                      <p className="text-[9px] font-sans text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
                {/* Best value */}
                {cpwAnalytics.bestValue.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] font-sans font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                      <ArrowDownRight className="w-3 h-3 text-emerald-500" /> Best Value
                    </p>
                    <div className="space-y-1.5">
                      {cpwAnalytics.bestValue.map((item, i) => (
                        <div key={i} className="flex items-center gap-2.5">
                          {item.photo_url ? (
                            <div className="w-8 h-8 rounded-lg bg-white/90 dark:bg-white/80 overflow-hidden flex-shrink-0">
                              <img src={item.photo_url} alt="" className="w-full h-full object-contain" style={{ mixBlendMode: "multiply" }} />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                              <Shirt className="w-3.5 h-3.5 text-muted-foreground/40" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-sans text-foreground truncate capitalize">{item.name || item.category}</p>
                            <p className="text-[9px] text-muted-foreground font-sans">{item.wears} wears · ${item.priceNum}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {item.paidOff && <Award className="w-3 h-3 text-amber-400" />}
                            <span className={`text-xs font-sans font-bold ${item.cpw < 5 ? "text-emerald-500" : "text-foreground"}`}>${item.cpw}</span>
                            <span className="text-[8px] text-muted-foreground">/wear</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Worst value */}
                {cpwAnalytics.worstValue.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] font-sans font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3 text-red-400" /> Needs More Wear
                    </p>
                    <div className="space-y-1.5">
                      {cpwAnalytics.worstValue.map((item, i) => (
                        <div key={i} className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                            <Shirt className="w-3.5 h-3.5 text-muted-foreground/40" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-sans text-foreground truncate capitalize">{item.name || item.category}</p>
                            <p className="text-[9px] text-muted-foreground font-sans">{item.wears} wears · ${item.priceNum}</p>
                          </div>
                          <span className="text-xs font-sans font-bold text-red-400">${item.cpw}<span className="text-[8px] text-muted-foreground">/wear</span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Never worn */}
                {cpwAnalytics.neverWorn.length > 0 && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                    <p className="text-[10px] font-sans font-semibold text-amber-600 dark:text-amber-400 mb-1">
                      💸 ${Math.round(cpwAnalytics.neverWornTotal)} sitting unworn
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {cpwAnalytics.neverWorn.map((item, i) => (
                        <span key={i} className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize">
                          {item.name || item.category} · ${item.priceNum}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Seasonal Wardrobe Analysis */}
            {(seasonalAnalysis.rotateIn.length > 0 || seasonalAnalysis.rotateOut.length > 0) && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
                className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-1">
                  {seasonIcon(seasonalAnalysis.next)}
                  <p className="text-[10px] font-sans font-semibold text-muted-foreground uppercase tracking-[0.15em]">Seasonal Rotation</p>
                </div>
                <p className="text-[10px] font-sans text-muted-foreground mb-3">
                  Preparing for <span className="capitalize font-medium text-foreground">{seasonalAnalysis.next}</span> — {seasonalAnalysis.allSeason} all-season items ready
                </p>

                {seasonalAnalysis.rotateIn.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] font-sans font-semibold text-emerald-500 mb-2 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" /> Rotate In for {seasonalAnalysis.next}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {seasonalAnalysis.rotateIn.map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                          {item.photo_url ? (
                            <div className="w-6 h-6 rounded bg-white/90 dark:bg-white/80 overflow-hidden flex-shrink-0">
                              <img src={item.photo_url} alt="" className="w-full h-full object-contain" style={{ mixBlendMode: "multiply" }} />
                            </div>
                          ) : (
                            <Shirt className="w-3.5 h-3.5 text-emerald-500/60" />
                          )}
                          <span className="text-[10px] font-sans text-foreground capitalize">{item.name || item.category}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {seasonalAnalysis.rotateOut.length > 0 && (
                  <div>
                    <p className="text-[10px] font-sans font-semibold text-orange-400 mb-2 flex items-center gap-1">
                      <ArrowDownRight className="w-3 h-3" /> Store Away ({seasonalAnalysis.current})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {seasonalAnalysis.rotateOut.map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20">
                          {item.photo_url ? (
                            <div className="w-6 h-6 rounded bg-white/90 dark:bg-white/80 overflow-hidden flex-shrink-0">
                              <img src={item.photo_url} alt="" className="w-full h-full object-contain" style={{ mixBlendMode: "multiply" }} />
                            </div>
                          ) : (
                            <Shirt className="w-3.5 h-3.5 text-orange-400/60" />
                          )}
                          <span className="text-[10px] font-sans text-foreground capitalize">{item.name || item.category}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Most Worn Items */}
            {stats.mostWorn.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shirt className="w-4 h-4 text-primary" />
                  <p className="text-[10px] font-sans font-semibold text-muted-foreground uppercase tracking-[0.15em]">Most Worn Items</p>
                </div>
                <div className="space-y-2">
                  {stats.mostWorn.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[10px] font-sans font-bold text-muted-foreground w-4">#{i + 1}</span>
                      {item.photo_url ? (
                        <div className="w-9 h-9 rounded-lg bg-white/95 dark:bg-white/90 overflow-hidden flex items-center justify-center flex-shrink-0">
                          <img src={item.photo_url} alt="" className="w-full h-full object-contain" style={{ mixBlendMode: "multiply" }} />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                          <Shirt className="w-4 h-4 text-muted-foreground/40" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-sans font-medium text-foreground truncate capitalize">{item.name}</p>
                        <p className="text-[10px] font-sans text-muted-foreground capitalize">{item.category}</p>
                      </div>
                      <span className="text-xs font-sans font-bold text-primary">{item.count}×</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Color Distribution */}
            {stats.colorDist.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="w-4 h-4 text-primary" />
                  <p className="text-[10px] font-sans font-semibold text-muted-foreground uppercase tracking-[0.15em]">Color Distribution</p>
                </div>
                <div className="space-y-2">
                  {stats.colorDist.map(([color, count], i) => {
                    const pct = stats.totalColors > 0 ? Math.round((count / stats.totalColors) * 100) : 0;
                    const hex = colorHexMap[color] || "#888";
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full flex-shrink-0 ring-1 ring-border/30" style={{ backgroundColor: hex }} />
                        <span className="text-xs font-sans text-foreground capitalize w-16 truncate">{color}</span>
                        <div className="flex-1">
                          <div className="h-2 rounded-full overflow-hidden bg-muted">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6, delay: i * 0.05 }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: hex }}
                            />
                          </div>
                        </div>
                        <span className="text-[10px] font-sans font-bold text-muted-foreground w-8 text-right">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Occasion Breakdown */}
            {stats.occasions.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <PieChart className="w-4 h-4 text-primary" />
                  <p className="text-[10px] font-sans font-semibold text-muted-foreground uppercase tracking-[0.15em]">Occasion Breakdown</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {stats.occasions.map(([occ, count], i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 + i * 0.04 }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans bg-primary/10 text-primary border border-primary/20">
                      <span className="font-medium">{occ}</span>
                      <span className="font-bold">{count}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Empty state */}
            {events.length === 0 && !cpwAnalytics && seasonalAnalysis.rotateIn.length === 0 && seasonalAnalysis.rotateOut.length === 0 && (
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-7 h-7 text-muted-foreground/40" />
                </div>
                <p className="text-muted-foreground font-sans text-sm">No outfits planned this month</p>
                <p className="text-muted-foreground/60 font-sans text-xs mt-0.5">Head to Outfit Schedule to start planning!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default MonthlyReport;
