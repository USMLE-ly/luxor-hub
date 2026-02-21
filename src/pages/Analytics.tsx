import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  BarChart3, TrendingUp, Leaf, AlertTriangle, DollarSign, Calendar,
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

const CHART_COLORS = [
  "hsl(43, 74%, 49%)", "hsl(43, 80%, 65%)", "hsl(43, 70%, 35%)",
  "hsl(240, 5%, 55%)", "hsl(0, 72%, 51%)", "hsl(200, 60%, 50%)",
  "hsl(150, 50%, 45%)", "hsl(280, 50%, 55%)",
];

const Analytics = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [wearLogs, setWearLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("clothing_items").select("*").eq("user_id", user.id),
      supabase.from("wear_logs").select("*, clothing_items(name, category, price)").eq("user_id", user.id),
    ]).then(([itemsRes, logsRes]) => {
      if (itemsRes.data) setItems(itemsRes.data);
      if (logsRes.data) setWearLogs(logsRes.data);
      setLoading(false);
    });
  }, [user]);

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
      return {
        name: item.name || "Unnamed",
        cpw: wears > 0 ? Math.round((price / wears) * 100) / 100 : price,
        wears,
        price: item.price,
      };
    })
    .sort((a, b) => a.cpw - b.cpw)
    .slice(0, 8);

  // Underused items (never worn or worn once)
  const underused = items.filter((item) => {
    const wears = wearLogs.filter((l) => l.clothing_item_id === item.id).length;
    return wears <= 1;
  });

  // Sustainability score
  const totalItems = items.length;
  const totalWears = wearLogs.length;
  const avgWears = totalItems > 0 ? totalWears / totalItems : 0;
  const sustainabilityScore = Math.min(100, Math.round(avgWears * 15 + (totalItems > 0 ? 20 : 0)));

  // Total closet value
  const totalValue = items.reduce((sum, i) => sum + (i.price || 0), 0);

  const statCards = [
    { label: "Total Items", value: totalItems, icon: BarChart3, color: "text-primary" },
    { label: "Total Wears Logged", value: totalWears, icon: Calendar, color: "text-gold-light" },
    { label: "Closet Value", value: `$${totalValue.toLocaleString()}`, icon: DollarSign, color: "text-primary" },
    { label: "Sustainability", value: `${sustainabilityScore}/100`, icon: Leaf, color: sustainabilityScore > 50 ? "text-green-500" : "text-gold-light" },
  ];

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
          <p className="text-muted-foreground font-sans text-sm mt-1 mb-8">Insights into your wardrobe usage</p>
        </motion.div>

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
          {/* Category Distribution */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg font-bold text-foreground mb-4">Category Distribution</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(240, 8%, 10%)", border: "1px solid hsl(240, 5%, 22%)", borderRadius: "8px", color: "hsl(40, 20%, 95%)" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground font-sans text-sm text-center py-10">No items yet</p>
            )}
          </motion.div>

          {/* Most Worn */}
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
            ) : (
              <p className="text-muted-foreground font-sans text-sm text-center py-10">Log some wears to see data</p>
            )}
          </motion.div>
        </div>

        {/* Cost Per Wear */}
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

        {/* Underused Items */}
        {underused.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-gold-light" /> Underused Items
            </h3>
            <p className="text-muted-foreground font-sans text-sm mb-4">These items have been worn once or never. Consider wearing them more or donating!</p>
            <div className="flex flex-wrap gap-2">
              {underused.slice(0, 12).map((item) => (
                <span key={item.id} className="px-3 py-1.5 rounded-full text-xs font-sans bg-secondary text-muted-foreground">
                  {item.name || "Unnamed"} ({item.category})
                </span>
              ))}
              {underused.length > 12 && (
                <span className="px-3 py-1.5 rounded-full text-xs font-sans bg-primary/10 text-primary">
                  +{underused.length - 12} more
                </span>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default Analytics;
