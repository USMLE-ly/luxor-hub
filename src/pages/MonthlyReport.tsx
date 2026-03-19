import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart3, Palette, TrendingUp, Shirt, CalendarDays, ChevronLeft, ChevronRight,
  Award, Flame, Star, Loader2, PieChart,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, addMonths, subMonths, eachDayOfInterval, isSameDay } from "date-fns";
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
}

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
    if (itemsRes.data) setClosetItems(itemsRes.data);
    setLoading(false);
  };

  const stats = useMemo(() => {
    const daysInMonth = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
    const plannedDays = new Set(events.map(e => e.event_date));
    const planningConsistency = Math.round((plannedDays.size / daysInMonth.length) * 100);

    // Unique outfits (by fingerprint)
    const fingerprints = new Set<string>();
    events.forEach(ev => {
      const items = Array.isArray(ev.outfit_items) ? ev.outfit_items : [];
      const fp = items.map((i: any) => (typeof i === "string" ? i : i?.name || "").toLowerCase()).filter(Boolean).sort().join("|");
      if (fp) fingerprints.add(fp);
    });
    const uniqueOutfits = fingerprints.size;
    const varietyScore = events.length > 0 ? Math.round((uniqueOutfits / events.length) * 100) : 0;

    // Most worn items
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

    // Color distribution
    const colorCounts = new Map<string, number>();
    events.forEach(ev => {
      const items = Array.isArray(ev.outfit_items) ? ev.outfit_items : [];
      items.forEach((i: any) => {
        const color = (typeof i === "object" ? (i?.color || "") : "").toLowerCase().trim();
        if (color) colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
      });
    });
    // Also check closet items for colors used in the month
    const colorDist = Array.from(colorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    const totalColors = colorDist.reduce((sum, [, c]) => sum + c, 0);

    // Occasion breakdown
    const occasionCounts = new Map<string, number>();
    events.forEach(ev => {
      const occ = ev.occasion || "Unset";
      occasionCounts.set(occ, (occasionCounts.get(occ) || 0) + 1);
    });
    const occasions = Array.from(occasionCounts.entries()).sort((a, b) => b[1] - a[1]);

    // Streak calc
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
      streak,
    };
  }, [events, currentMonth]);

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
                  className="rounded-2xl p-4 text-center"
                  style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
                  <div className="flex justify-center mb-2">{card.icon}</div>
                  <p className="font-display text-xl font-bold text-foreground">{card.value}</p>
                  <p className="text-[10px] font-sans text-muted-foreground mt-0.5">{card.label}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Planning Consistency */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="rounded-2xl p-4" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-primary" />
                <p className="text-[10px] font-sans font-semibold text-muted-foreground uppercase tracking-[0.15em]">Planning Consistency</p>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-sans text-foreground font-medium">{stats.plannedDays} of {stats.totalDays} days planned</span>
                <span className="text-xs font-sans font-bold" style={{ color: "hsl(var(--primary))" }}>{stats.planningConsistency}%</span>
              </div>
              <Progress value={stats.planningConsistency} className="h-2.5" />
              <p className="text-[10px] font-sans text-muted-foreground mt-2">
                {stats.planningConsistency >= 80 ? "🏆 Excellent — you're a planning pro!" :
                 stats.planningConsistency >= 50 ? "👍 Good progress — keep building the habit!" :
                 "💡 Try planning more days ahead for better style consistency"}
              </p>
            </motion.div>

            {/* Most Worn Items */}
            {stats.mostWorn.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="rounded-2xl p-4" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
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
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "hsl(var(--secondary))" }}>
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
                className="rounded-2xl p-4" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
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
                          <div className="h-2 rounded-full overflow-hidden" style={{ background: "hsl(var(--muted))" }}>
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
                className="rounded-2xl p-4" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
                <div className="flex items-center gap-2 mb-3">
                  <PieChart className="w-4 h-4 text-primary" />
                  <p className="text-[10px] font-sans font-semibold text-muted-foreground uppercase tracking-[0.15em]">Occasion Breakdown</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {stats.occasions.map(([occ, count], i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 + i * 0.04 }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans"
                      style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.2)" }}>
                      <span className="font-medium">{occ}</span>
                      <span className="font-bold">{count}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Empty state */}
            {events.length === 0 && (
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "hsl(var(--secondary))" }}>
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
