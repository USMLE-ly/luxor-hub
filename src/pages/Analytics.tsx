import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  BarChart3, TrendingUp, Leaf, AlertTriangle, DollarSign, Calendar,
  Sparkles, Loader2, ShoppingBag, ChevronRight, Clock, Recycle, Heart, PackageOpen,
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { format, parseISO, differenceInDays } from "date-fns";

const CHART_COLORS = [
  "hsl(43, 74%, 49%)", "hsl(43, 80%, 65%)", "hsl(43, 70%, 35%)",
  "hsl(240, 5%, 55%)", "hsl(0, 72%, 51%)", "hsl(200, 60%, 50%)",
  "hsl(150, 50%, 45%)", "hsl(280, 50%, 55%)",
];

interface GapItem {
  category: string;
  item: string;
  reason: string;
  priority: "high" | "medium" | "low";
  estimatedPrice: string;
  shopCategory: string;
}

// CO2 estimates per fabric category (kg CO2 per garment, simplified)
const CO2_PER_CATEGORY: Record<string, number> = {
  tops: 5.5,
  bottoms: 8.0,
  outerwear: 12.0,
  shoes: 10.0,
  accessories: 2.0,
  dresses: 7.0,
  activewear: 6.0,
  formal: 9.0,
  other: 5.0,
};

const Analytics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [wearLogs, setWearLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "gaps" | "history" | "sustainability">("overview");
  const [gapAnalysis, setGapAnalysis] = useState<{ overallScore: number; gaps: GapItem[]; summary: string } | null>(null);
  const [gapLoading, setGapLoading] = useState(false);
  const [styleProfile, setStyleProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("clothing_items").select("*").eq("user_id", user.id),
      supabase.from("wear_logs").select("*, clothing_items(name, category, price)").eq("user_id", user.id).order("worn_at", { ascending: false }),
      supabase.from("style_profiles").select("*").eq("user_id", user.id).single(),
    ]).then(([itemsRes, logsRes, styleRes]) => {
      if (itemsRes.data) setItems(itemsRes.data);
      if (logsRes.data) setWearLogs(logsRes.data);
      if (styleRes.data) setStyleProfile(styleRes.data);
      setLoading(false);
    });
  }, [user]);

  const runGapAnalysis = async () => {
    if (!user) return;
    setGapLoading(true);
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wardrobe-gap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ closetItems: items, styleProfile }),
      });
      if (!resp.ok) {
        if (resp.status === 429) { toast.error("Rate limited. Try again in a moment."); return; }
        if (resp.status === 402) { toast.error("AI credits exhausted."); return; }
        throw new Error("Analysis failed");
      }
      const result = await resp.json();
      // Deduplicate gaps by item name (case-insensitive)
      if (result.gaps) {
        const seen = new Set<string>();
        result.gaps = result.gaps.filter((gap: any) => {
          const key = gap.item.toLowerCase().trim();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      }
      setGapAnalysis(result);
      toast.success("Gap analysis complete!");
    } catch { toast.error("Failed to run analysis"); }
    finally { setGapLoading(false); }
  };

  // Category distribution
  const categoryData = items.reduce((acc: any[], item) => {
    const existing = acc.find((a) => a.name === item.category);
    if (existing) existing.value++;
    else acc.push({ name: item.category, value: 1 });
    return acc;
  }, []);

  // Most worn items
  const wearCounts = wearLogs.reduce((acc: Record<string, number>, log) => {
    const name = (log.clothing_items as any)?.name || "Unknown";
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});
  const mostWorn = Object.entries(wearCounts)
    .map(([name, count]) => ({ name, count: count as number }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Cost per wear
  const costPerWear = items
    .filter((i) => i.price)
    .map((item) => {
      const wears = wearLogs.filter((l) => l.clothing_item_id === item.id).length;
      const price = Number(item.price) || 0;
      return { name: item.name || "Unnamed", cpw: wears > 0 ? Math.round((price / wears) * 100) / 100 : price, wears, price: item.price };
    })
    .sort((a, b) => a.cpw - b.cpw)
    .slice(0, 8);

  const underused = items.filter((item) => {
    const wears = wearLogs.filter((l) => l.clothing_item_id === item.id).length;
    return wears <= 1;
  });

  const totalItems = items.length;
  const totalWears = wearLogs.length;
  const avgWears = totalItems > 0 ? totalWears / totalItems : 0;
  const sustainabilityScore = Math.min(100, Math.round(avgWears * 15 + (totalItems > 0 ? 20 : 0)));
  const totalValue = items.reduce((sum, i) => sum + (i.price || 0), 0);

  // ── Sustainability calculations ──
  const totalCO2 = items.reduce((sum, item) => {
    const cat = item.category?.toLowerCase() || "other";
    return sum + (CO2_PER_CATEGORY[cat] || CO2_PER_CATEGORY.other);
  }, 0);

  const co2PerWear = totalWears > 0 ? Math.round((totalCO2 / totalWears) * 100) / 100 : totalCO2;

  // Items not worn in 90+ days — donation candidates
  const now = new Date();
  const donationCandidates = items.filter((item) => {
    const itemLogs = wearLogs.filter((l) => l.clothing_item_id === item.id);
    if (itemLogs.length === 0) {
      // Never worn + owned for 30+ days
      const ownedDays = differenceInDays(now, parseISO(item.created_at));
      return ownedDays > 30;
    }
    const lastWorn = itemLogs.sort((a: any, b: any) => new Date(b.worn_at).getTime() - new Date(a.worn_at).getTime())[0];
    return differenceInDays(now, parseISO(lastWorn.worn_at)) > 90;
  });

  // CO2 by category for chart
  const co2ByCategory = Object.entries(
    items.reduce((acc: Record<string, number>, item) => {
      const cat = item.category || "other";
      acc[cat] = (acc[cat] || 0) + (CO2_PER_CATEGORY[cat.toLowerCase()] || CO2_PER_CATEGORY.other);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value: Math.round(Number(value) * 10) / 10 }))
   .sort((a, b) => b.value - a.value);

  // Utilization rate
  const usedItems = items.filter(item => wearLogs.some(l => l.clothing_item_id === item.id));
  const utilizationRate = totalItems > 0 ? Math.round((usedItems.length / totalItems) * 100) : 0;

  const statCards = [
    { label: "Total Items", value: totalItems, icon: BarChart3, color: "text-primary" },
    { label: "Total Wears Logged", value: totalWears, icon: Calendar, color: "text-gold-light" },
    { label: "Closet Value", value: `$${totalValue.toLocaleString()}`, icon: DollarSign, color: "text-primary" },
    { label: "Sustainability", value: `${sustainabilityScore}/100`, icon: Leaf, color: sustainabilityScore > 50 ? "text-green-500" : "text-gold-light" },
  ];

  const priorityColors: Record<string, string> = {
    high: "text-destructive bg-destructive/10",
    medium: "text-primary bg-primary/10",
    low: "text-muted-foreground bg-secondary",
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" /> Wardrobe Analytics
          </h1>
          <p className="text-muted-foreground font-sans text-sm mt-1 mb-4">Insights into your wardrobe usage</p>
        </motion.div>

        {/* Tab Switch */}
        <div className="flex gap-1 bg-secondary rounded-xl p-1 mb-6 w-fit overflow-x-auto">
          {([
            { key: "overview" as const, label: "📊 Overview" },
            { key: "gaps" as const, label: "🔍 Gaps" },
            { key: "history" as const, label: "📅 History" },
            { key: "sustainability" as const, label: "🌱 Sustainability" },
          ]).map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-xs font-sans transition-all whitespace-nowrap ${
                activeTab === tab.key ? "bg-foreground text-background font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass rounded-xl p-5">
                  <stat.icon className={`h-5 w-5 ${stat.color} mb-3`} />
                  <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-muted-foreground font-sans text-xs mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-6">
                <h3 className="font-display text-lg font-bold text-foreground mb-4">Category Distribution</h3>
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                        {categoryData.map((_, i) => (<Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(240, 8%, 10%)", border: "1px solid hsl(240, 5%, 22%)", borderRadius: "8px", color: "hsl(40, 20%, 95%)" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (<p className="text-muted-foreground font-sans text-sm text-center py-10">No items yet</p>)}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-2xl p-6">
                <h3 className="font-display text-lg font-bold text-foreground mb-4">Most Worn Items</h3>
                {mostWorn.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={mostWorn} layout="vertical">
                      <XAxis type="number" stroke="hsl(240, 5%, 55%)" fontSize={12} />
                      <YAxis type="category" dataKey="name" width={100} stroke="hsl(240, 5%, 55%)" fontSize={11} tick={{ fill: "hsl(40, 20%, 90%)" }} />
                      <Tooltip contentStyle={{ background: "hsl(240, 8%, 10%)", border: "1px solid hsl(240, 5%, 22%)", borderRadius: "8px", color: "hsl(40, 20%, 95%)" }} />
                      <Bar dataKey="count" fill="hsl(43, 74%, 49%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (<p className="text-muted-foreground font-sans text-sm text-center py-10">Log some wears to see data</p>)}
              </motion.div>
            </div>

            {costPerWear.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass rounded-2xl p-6 mb-8">
                <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" /> Cost Per Wear
                </h3>
                <div className="space-y-3">
                  {costPerWear.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <div>
                        <p className="font-sans text-sm text-foreground">{item.name}</p>
                        <p className="font-sans text-xs text-muted-foreground">${item.price} · {item.wears} wear{item.wears !== 1 ? "s" : ""}</p>
                      </div>
                      <span className={`font-display text-lg font-bold ${item.cpw < 10 ? "text-green-500" : item.cpw < 30 ? "text-primary" : "text-destructive"}`}>
                        ${item.cpw}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {underused.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass rounded-2xl p-6">
                <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-gold-light" /> Underused Items
                </h3>
                <p className="text-muted-foreground font-sans text-sm mb-4">These items have been worn once or never.</p>
                <div className="flex flex-wrap gap-2">
                  {underused.slice(0, 12).map((item) => (
                    <span key={item.id} className="px-3 py-1.5 rounded-full text-xs font-sans bg-secondary text-muted-foreground">
                      {item.name || "Unnamed"} ({item.category})
                    </span>
                  ))}
                  {underused.length > 12 && (
                    <span className="px-3 py-1.5 rounded-full text-xs font-sans bg-primary/10 text-primary">+{underused.length - 12} more</span>
                  )}
                </div>
              </motion.div>
            )}
          </>
        )}

        {activeTab === "gaps" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {!gapAnalysis ? (
              <div className="glass rounded-2xl p-8 text-center">
                <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-display text-xl font-bold text-foreground mb-2">AI Wardrobe Gap Analysis</h3>
                <p className="text-muted-foreground font-sans text-sm mb-6 max-w-md mx-auto">
                  Let AI analyze your closet to find missing essentials, seasonal gaps, and pieces that would elevate your wardrobe.
                </p>
                <Button onClick={runGapAnalysis} disabled={gapLoading} className="gap-2">
                  {gapLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {gapLoading ? "Analyzing..." : "Run AI Analysis"}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="glass rounded-2xl p-6 flex items-center gap-5">
                  <div className="w-20 h-20 rounded-full border-4 border-primary flex items-center justify-center flex-shrink-0">
                    <span className="font-display text-2xl font-bold text-primary">{gapAnalysis.overallScore}%</span>
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground">Wardrobe Completeness</h3>
                    <p className="text-muted-foreground font-sans text-sm mt-1">{gapAnalysis.summary}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {gapAnalysis.gaps.map((gap, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="glass rounded-xl p-4 flex items-center gap-4">
                      <div className={`px-2 py-1 rounded-full text-[10px] font-sans font-bold uppercase ${priorityColors[gap.priority]}`}>
                        {gap.priority}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-sm font-medium text-foreground">{gap.item}</p>
                        <p className="font-sans text-xs text-muted-foreground mt-0.5">{gap.reason}</p>
                        <p className="font-sans text-[10px] text-muted-foreground mt-1">{gap.category} · {gap.estimatedPrice}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => navigate(`/inspiration`)} className="gap-1 text-xs flex-shrink-0">
                        <ShoppingBag className="w-3 h-3" /> Shop
                      </Button>
                    </motion.div>
                  ))}
                </div>
                <Button variant="outline" onClick={runGapAnalysis} disabled={gapLoading} className="gap-2">
                  {gapLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Re-analyze
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "history" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {wearLogs.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-xl font-bold text-foreground mb-2">No Wear History Yet</h3>
                <p className="text-muted-foreground font-sans text-sm">Log wears from your closet to see your timeline here.</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-4">
                  {wearLogs.slice(0, 50).map((log, i) => {
                    const itemData = log.clothing_items as any;
                    return (
                      <motion.div key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                        className="flex gap-4 pl-2">
                        <div className="w-7 h-7 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center flex-shrink-0 z-10">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        </div>
                        <div className="glass rounded-xl p-3 flex-1 -mt-1">
                          <div className="flex items-center justify-between">
                            <p className="font-sans text-sm font-medium text-foreground">{itemData?.name || "Unknown Item"}</p>
                            <span className="text-[10px] font-sans text-muted-foreground">
                              {format(parseISO(log.worn_at), "MMM d, yyyy")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-sans bg-secondary text-muted-foreground">
                              {itemData?.category || "other"}
                            </span>
                            {log.notes && <span className="text-[10px] font-sans text-muted-foreground">{log.notes}</span>}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Sustainability Tab ── */}
        {activeTab === "sustainability" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Score Hero */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="w-5 h-5 text-green-500" />
                <h3 className="font-display text-xl font-bold text-foreground">Sustainability Score</h3>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                  <p className="font-display text-3xl font-bold text-green-500">{sustainabilityScore}</p>
                  <p className="text-[10px] text-muted-foreground font-sans mt-1">Overall Score</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-secondary border border-border">
                  <p className="font-display text-3xl font-bold text-foreground">{totalCO2.toFixed(1)}</p>
                  <p className="text-[10px] text-muted-foreground font-sans mt-1">Total kg CO₂</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-secondary border border-border">
                  <p className="font-display text-3xl font-bold text-foreground">{co2PerWear}</p>
                  <p className="text-[10px] text-muted-foreground font-sans mt-1">kg CO₂ / Wear</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-secondary border border-border">
                  <p className="font-display text-3xl font-bold text-foreground">{utilizationRate}%</p>
                  <p className="text-[10px] text-muted-foreground font-sans mt-1">Utilization Rate</p>
                </div>
              </div>

              {/* Tips */}
              <div className="mt-4 p-3 rounded-xl bg-green-500/5 border border-green-500/20">
                <p className="text-xs text-green-500 font-sans leading-relaxed">
                  💡 {sustainabilityScore >= 70
                    ? "Great job! You're making the most of your wardrobe. Keep logging wears to track your impact."
                    : sustainabilityScore >= 40
                    ? "You're on the right track. Try to wear each item at least 30 times to maximize sustainability."
                    : "Start by logging wears for your items. The more you re-wear, the lower your environmental impact per outfit."
                  }
                </p>
              </div>
            </div>

            {/* CO2 by Category */}
            {co2ByCategory.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Recycle className="w-5 h-5 text-green-500" /> CO₂ Impact by Category
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={co2ByCategory}>
                    <XAxis dataKey="name" stroke="hsl(240, 5%, 55%)" fontSize={11} tick={{ fill: "hsl(40, 20%, 90%)" }} />
                    <YAxis stroke="hsl(240, 5%, 55%)" fontSize={11} tick={{ fill: "hsl(40, 20%, 90%)" }} unit=" kg" />
                    <Tooltip
                      contentStyle={{ background: "hsl(240, 8%, 10%)", border: "1px solid hsl(240, 5%, 22%)", borderRadius: "8px", color: "hsl(40, 20%, 95%)" }}
                      formatter={(value: number) => [`${value} kg CO₂`, "Impact"]}
                    />
                    <Bar dataKey="value" fill="hsl(150, 50%, 45%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-muted-foreground font-sans mt-2 text-center">
                  Estimates based on industry averages per garment category
                </p>
              </div>
            )}

            {/* Donation Candidates */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                <Heart className="w-5 h-5 text-destructive" /> Consider Donating
              </h3>
              <p className="text-muted-foreground font-sans text-xs mb-4">
                Items not worn in 90+ days or never worn since adding to closet
              </p>
              {donationCandidates.length === 0 ? (
                <div className="text-center py-6">
                  <PackageOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground font-sans">All your items are well-loved! 🎉</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {donationCandidates.slice(0, 15).map((item) => {
                    const itemWears = wearLogs.filter(l => l.clothing_item_id === item.id).length;
                    const lastLog = wearLogs.find(l => l.clothing_item_id === item.id);
                    const daysSince = lastLog
                      ? differenceInDays(now, parseISO(lastLog.worn_at))
                      : differenceInDays(now, parseISO(item.created_at));
                    return (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border">
                        <div className="flex items-center gap-3 min-w-0">
                          {item.photo_url ? (
                            <img src={item.photo_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              <PackageOpen className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-sans text-sm text-foreground truncate">{item.name || "Unnamed"}</p>
                            <p className="text-[10px] text-muted-foreground font-sans">
                              {item.category} · {itemWears} wear{itemWears !== 1 ? "s" : ""} · {daysSince}d unused
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {item.price && (
                            <span className="text-[10px] text-muted-foreground font-sans">${item.price}</span>
                          )}
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            itemWears === 0 ? "text-destructive bg-destructive/10" : "text-primary bg-primary/10"
                          }`}>
                            {itemWears === 0 ? "Never worn" : "Underused"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {donationCandidates.length > 15 && (
                    <p className="text-xs text-primary font-sans text-center pt-2">
                      +{donationCandidates.length - 15} more items to consider
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Eco Tips */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-500" /> Eco Tips
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { tip: "Aim for 30+ wears per item to offset production CO₂", icon: "🔄" },
                  { tip: "Donate or resell items you haven't worn in 3+ months", icon: "💚" },
                  { tip: "Choose natural fabrics — cotton, linen, and wool biodegrade", icon: "🌿" },
                  { tip: "Repair before replacing — extend the life of your favorites", icon: "🧵" },
                ].map((t, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                    <span className="text-lg">{t.icon}</span>
                    <p className="text-xs text-foreground font-sans">{t.tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default Analytics;
