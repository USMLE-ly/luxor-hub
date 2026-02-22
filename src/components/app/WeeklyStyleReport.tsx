import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Leaf, TrendingDown, Award, Calendar, Shirt, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ReportData {
  totalWearsThisWeek: number;
  uniqueItemsWorn: number;
  mostWornItem: { name: string; count: number } | null;
  underusedItems: { name: string; category: string; daysSinceWorn: number }[];
  sustainabilityScore: number;
  weekOverWeekChange: number;
  topCategories: { name: string; count: number }[];
}

export const WeeklyStyleReport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const generate = async () => {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const [logsThisWeek, logsPrevWeek, allItems, allLogs] = await Promise.all([
        supabase.from("wear_logs").select("clothing_item_id, worn_at, clothing_items(name, category)")
          .eq("user_id", user.id).gte("worn_at", weekAgo.toISOString().split("T")[0]),
        supabase.from("wear_logs").select("clothing_item_id")
          .eq("user_id", user.id)
          .gte("worn_at", twoWeeksAgo.toISOString().split("T")[0])
          .lt("worn_at", weekAgo.toISOString().split("T")[0]),
        supabase.from("clothing_items").select("id, name, category").eq("user_id", user.id),
        supabase.from("wear_logs").select("clothing_item_id, worn_at").eq("user_id", user.id),
      ]);

      const thisWeekData = logsThisWeek.data || [];
      const prevWeekData = logsPrevWeek.data || [];
      const items = allItems.data || [];
      const logs = allLogs.data || [];

      // Count wears per item this week
      const wearCounts: Record<string, { name: string; count: number }> = {};
      thisWeekData.forEach((log: any) => {
        const id = log.clothing_item_id;
        const name = log.clothing_items?.name || "Unnamed";
        if (!wearCounts[id]) wearCounts[id] = { name, count: 0 };
        wearCounts[id].count++;
      });

      const uniqueIds = new Set(thisWeekData.map((l: any) => l.clothing_item_id));
      const sorted = Object.values(wearCounts).sort((a, b) => b.count - a.count);

      // Category counts this week
      const catCounts: Record<string, number> = {};
      thisWeekData.forEach((log: any) => {
        const cat = (log.clothing_items as any)?.category || "other";
        catCounts[cat] = (catCounts[cat] || 0) + 1;
      });
      const topCategories = Object.entries(catCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      // Underused items
      const lastWornMap: Record<string, string> = {};
      logs.forEach((l: any) => {
        if (!lastWornMap[l.clothing_item_id] || l.worn_at > lastWornMap[l.clothing_item_id]) {
          lastWornMap[l.clothing_item_id] = l.worn_at;
        }
      });

      const underused = items
        .filter((item) => {
          const lastWorn = lastWornMap[item.id];
          if (!lastWorn) return true;
          const days = Math.floor((now.getTime() - new Date(lastWorn).getTime()) / (1000 * 60 * 60 * 24));
          return days > 14;
        })
        .map((item) => {
          const lastWorn = lastWornMap[item.id];
          const days = lastWorn
            ? Math.floor((now.getTime() - new Date(lastWorn).getTime()) / (1000 * 60 * 60 * 24))
            : 999;
          return { name: item.name || "Unnamed", category: item.category, daysSinceWorn: days };
        })
        .sort((a, b) => b.daysSinceWorn - a.daysSinceWorn)
        .slice(0, 5);

      // Sustainability
      const totalItems = items.length;
      const totalAllWears = logs.length;
      const avgWears = totalItems > 0 ? totalAllWears / totalItems : 0;
      const sustainabilityScore = Math.min(100, Math.round(avgWears * 15 + (totalItems > 0 ? 20 : 0)));

      const weekOverWeekChange = thisWeekData.length - prevWeekData.length;

      setReport({
        totalWearsThisWeek: thisWeekData.length,
        uniqueItemsWorn: uniqueIds.size,
        mostWornItem: sorted[0] || null,
        underusedItems: underused,
        sustainabilityScore,
        weekOverWeekChange,
        topCategories,
      });
      setLoading(false);
    };
    generate();
  }, [user]);

  if (loading || !report) return null;

  const scoreColor = report.sustainabilityScore >= 70 ? "text-green-400" : report.sustainabilityScore >= 40 ? "text-primary" : "text-destructive";
  const scoreRing = report.sustainabilityScore >= 70 ? "border-green-400/30" : report.sustainabilityScore >= 40 ? "border-primary/30" : "border-destructive/30";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="glass rounded-2xl overflow-hidden"
    >
      {/* Header gradient bar */}
      <div className="gold-gradient px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary-foreground" />
            <h2 className="font-display text-lg font-bold text-primary-foreground">Weekly Style Report</h2>
          </div>
          <span className="text-xs font-sans text-primary-foreground/80">
            {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="font-display text-2xl font-bold text-foreground">{report.totalWearsThisWeek}</p>
            <p className="text-[10px] text-muted-foreground font-sans">Wears</p>
            {report.weekOverWeekChange !== 0 && (
              <span className={`text-[10px] font-sans ${report.weekOverWeekChange > 0 ? "text-green-400" : "text-destructive"}`}>
                {report.weekOverWeekChange > 0 ? "+" : ""}{report.weekOverWeekChange} vs last week
              </span>
            )}
          </div>
          <div className="text-center">
            <p className="font-display text-2xl font-bold text-foreground">{report.uniqueItemsWorn}</p>
            <p className="text-[10px] text-muted-foreground font-sans">Unique Items</p>
          </div>
          <div className="text-center">
            <div className={`w-14 h-14 mx-auto rounded-full border-4 ${scoreRing} flex items-center justify-center`}>
              <span className={`font-display text-lg font-bold ${scoreColor}`}>{report.sustainabilityScore}</span>
            </div>
            <p className="text-[10px] text-muted-foreground font-sans mt-1">Sustainability</p>
          </div>
        </div>

        {/* Most Worn */}
        {report.mostWornItem && (
          <div className="bg-secondary/50 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg gold-gradient flex items-center justify-center flex-shrink-0">
              <Award className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-sans">Most Worn This Week</p>
              <p className="text-sm font-sans font-medium text-foreground truncate">{report.mostWornItem.name}</p>
            </div>
            <span className="text-xs text-primary font-sans font-medium">{report.mostWornItem.count}×</span>
          </div>
        )}

        {/* Top categories */}
        {report.topCategories.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground font-sans mb-2">Top Categories</p>
            <div className="flex gap-2">
              {report.topCategories.map((cat) => (
                <span key={cat.name} className="px-2.5 py-1 rounded-full text-xs font-sans bg-primary/10 text-primary capitalize">
                  {cat.name} · {cat.count}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Underused Items */}
        {report.underusedItems.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingDown className="h-3.5 w-3.5 text-gold-light" />
              <p className="text-xs text-muted-foreground font-sans">Try Wearing Again</p>
            </div>
            <div className="space-y-1.5">
              {report.underusedItems.slice(0, 3).map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm font-sans">
                  <div className="flex items-center gap-2 min-w-0">
                    <Shirt className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-foreground/80 truncate">{item.name}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">
                    {item.daysSinceWorn >= 999 ? "Never worn" : `${item.daysSinceWorn}d ago`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sustainability Tip */}
        <div className="flex items-start gap-2 bg-green-500/5 rounded-lg p-3">
          <Leaf className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground font-sans">
            {report.sustainabilityScore >= 70
              ? "Great job! You're making the most of your wardrobe."
              : report.sustainabilityScore >= 40
              ? "Try rotating underused items to boost your sustainability score."
              : "Log more wears and explore forgotten pieces to improve your score!"}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full border-glass-border hover:border-primary/50 font-sans text-xs"
          onClick={() => navigate("/analytics")}
        >
          View Full Analytics <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </motion.div>
  );
};
