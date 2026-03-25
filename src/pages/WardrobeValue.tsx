import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingDown, TrendingUp, AlertTriangle, X, Shirt, Footprints, Watch, ShoppingBag } from "lucide-react";
import TierGate from "@/components/app/TierGate";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface ClothingItem {
  id: string;
  name: string | null;
  category: string;
  price: number | null;
  wear_count: number;
  last_worn_at: string | null;
  photo_url: string | null;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--muted-foreground))",
  "hsl(0 0% 60%)",
  "hsl(0 0% 40%)",
  "hsl(0 0% 75%)",
  "hsl(0 0% 25%)",
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  top: <Shirt className="w-4 h-4" />,
  bottom: <Shirt className="w-4 h-4" />,
  shoes: <Footprints className="w-4 h-4" />,
  accessory: <Watch className="w-4 h-4" />,
};

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function WardrobeValue() {
  return (
    <AppLayout>
      <TierGate requiredTier="pro" featureName="Wardrobe Value">
        <WardrobeValueContent />
      </TierGate>
    </AppLayout>
  );
}

function WardrobeValueContent() {
  const { user } = useAuth();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("clothing_items")
        .select("id, name, category, price, wear_count, last_worn_at, photo_url")
        .eq("user_id", user.id);
      if (data) setItems(data);
      setLoading(false);
    })();
  }, [user]);

  const stats = useMemo(() => {
    const priced = items.filter((i) => i.price && i.price > 0);
    const totalValue = priced.reduce((s, i) => s + (i.price || 0), 0);
    const totalWears = priced.reduce((s, i) => s + i.wear_count, 0);
    const avgCpw = totalWears > 0 ? totalValue / totalWears : 0;
    return { totalValue, totalItems: items.length, avgCpw };
  }, [items]);

  const bestValue = useMemo(() => {
    return items
      .filter((i) => i.price && i.price > 0 && i.wear_count > 0)
      .map((i) => ({ ...i, cpw: (i.price || 0) / i.wear_count }))
      .sort((a, b) => a.cpw - b.cpw)
      .slice(0, 5);
  }, [items]);

  const worstValue = useMemo(() => {
    return items
      .filter((i) => i.price && i.price > 0)
      .map((i) => ({ ...i, cpw: i.wear_count > 0 ? (i.price || 0) / i.wear_count : (i.price || 0) }))
      .sort((a, b) => b.cpw - a.cpw)
      .slice(0, 5);
  }, [items]);

  const deadInventory = useMemo(() => {
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    return items.filter(
      (i) =>
        i.price &&
        i.price > 20 &&
        !dismissedIds.has(i.id) &&
        (!i.last_worn_at || i.last_worn_at < sixtyDaysAgo)
    );
  }, [items, dismissedIds]);

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    items
      .filter((i) => i.price && i.price > 0)
      .forEach((i) => map.set(i.category, (map.get(i.category) || 0) + (i.price || 0)));
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  }, [items]);

  if (loading) {
    return (
      <div className="p-4 max-w-2xl mx-auto space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-secondary animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className="p-4 sm:p-5 lg:p-8 max-w-2xl mx-auto space-y-5"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <DollarSign className="w-6 h-6" /> Wardrobe Value
        </h1>
        <p className="text-sm text-muted-foreground font-sans mt-1">
          Understand your closet investment
        </p>
      </motion.div>

      {/* Summary Row */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Value", value: `$${stats.totalValue.toLocaleString()}` },
          { label: "Items", value: stats.totalItems.toString() },
          { label: "Avg CPW", value: `$${stats.avgCpw.toFixed(2)}` },
        ].map((s) => (
          <Card key={s.label} className="border-border/60 bg-card/60 backdrop-blur-xl">
            <CardContent className="p-4 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-sans">{s.label}</p>
              <p className="text-xl font-bold text-foreground mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Best Value */}
      {bestValue.length > 0 && (
        <motion.div variants={fadeUp}>
          <Card className="border-border/60 bg-card/60 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2 text-foreground">
                <TrendingUp className="w-4 h-4 text-green-500" /> Best Value Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {bestValue.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    {item.photo_url ? (
                      <img src={item.photo_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                        {CATEGORY_ICONS[item.category] || <ShoppingBag className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    )}
                    <span className="text-sm font-sans text-foreground truncate">{item.name || item.category}</span>
                  </div>
                  <span className="text-xs font-mono text-green-500 whitespace-nowrap">${item.cpw.toFixed(2)}/wear</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Worst Value */}
      {worstValue.length > 0 && (
        <motion.div variants={fadeUp}>
          <Card className="border-border/60 bg-card/60 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2 text-foreground">
                <TrendingDown className="w-4 h-4 text-destructive" /> Highest Cost-Per-Wear
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {worstValue.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    {item.photo_url ? (
                      <img src={item.photo_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                        {CATEGORY_ICONS[item.category] || <ShoppingBag className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    )}
                    <span className="text-sm font-sans text-foreground truncate">{item.name || item.category}</span>
                  </div>
                  <span className="text-xs font-mono text-destructive whitespace-nowrap">${item.cpw.toFixed(2)}/wear</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Dead Inventory */}
      {deadInventory.length > 0 && (
        <motion.div variants={fadeUp}>
          <Card className="border-border/60 bg-card/60 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2 text-foreground">
                <AlertTriangle className="w-4 h-4 text-yellow-500" /> Dead Inventory
              </CardTitle>
              <p className="text-[11px] text-muted-foreground font-sans">Items over $20 not worn in 60+ days</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {deadInventory.slice(0, 8).map((item) => (
                <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    {item.photo_url ? (
                      <img src={item.photo_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                        <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-sans text-foreground truncate">{item.name || item.category}</p>
                      <p className="text-[10px] text-muted-foreground">${item.price}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDismissedIds((prev) => new Set(prev).add(item.id))}
                    className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Category Breakdown */}
      {categoryData.length > 0 && (
        <motion.div variants={fadeUp}>
          <Card className="border-border/60 bg-card/60 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display text-foreground">Spend by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value" stroke="none">
                        {categoryData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [`$${value}`, ""]}
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-1.5">
                  {categoryData.map((c, i) => (
                    <div key={c.name} className="flex items-center justify-between text-xs font-sans">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-foreground capitalize">{c.name}</span>
                      </div>
                      <span className="text-muted-foreground">${c.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
