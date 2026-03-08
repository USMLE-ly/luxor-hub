import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AlertTriangle, Calendar, DollarSign, Flame, Shirt, TrendingDown, Award } from "lucide-react";

interface DormantItem {
  id: string;
  name: string | null;
  category: string;
  last_worn: string | null;
  days_dormant: number;
}

interface CostPerWearItem {
  name: string;
  cpw: number;
  wears: number;
  price: number;
  paidOff: boolean;
}

interface WearHeatmapDay {
  date: string;
  count: number;
}

export function WardrobeIntelligence() {
  const { user } = useAuth();
  const [dormantItems, setDormantItems] = useState<DormantItem[]>([]);
  const [bestValue, setBestValue] = useState<CostPerWearItem[]>([]);
  const [heatmap, setHeatmap] = useState<WearHeatmapDay[]>([]);
  const [totalWears, setTotalWears] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [itemsRes, logsRes] = await Promise.all([
        supabase.from("clothing_items").select("id, name, category, price, created_at").eq("user_id", user.id),
        supabase.from("wear_logs").select("clothing_item_id, worn_at").eq("user_id", user.id),
      ]);

      const items = itemsRes.data || [];
      const logs = logsRes.data || [];
      setTotalWears(logs.length);

      // Wear counts per item
      const wearMap = new Map<string, { count: number; lastWorn: string }>();
      logs.forEach((log) => {
        const existing = wearMap.get(log.clothing_item_id);
        if (!existing || log.worn_at > existing.lastWorn) {
          wearMap.set(log.clothing_item_id, {
            count: (existing?.count || 0) + 1,
            lastWorn: log.worn_at,
          });
        } else {
          existing.count++;
        }
      });

      // Dormant items (>60 days unworn)
      const now = Date.now();
      const dormant: DormantItem[] = items
        .map((item) => {
          const wear = wearMap.get(item.id);
          const lastWorn = wear?.lastWorn || null;
          const refDate = lastWorn ? new Date(lastWorn).getTime() : new Date(item.created_at).getTime();
          const daysDormant = Math.floor((now - refDate) / (1000 * 60 * 60 * 24));
          return { id: item.id, name: item.name, category: item.category, last_worn: lastWorn, days_dormant: daysDormant };
        })
        .filter((d) => d.days_dormant >= 60)
        .sort((a, b) => b.days_dormant - a.days_dormant)
        .slice(0, 5);
      setDormantItems(dormant);

      // Cost per wear
      const cpwData: CostPerWearItem[] = items
        .filter((i) => i.price && Number(i.price) > 0)
        .map((item) => {
          const wears = wearMap.get(item.id)?.count || 0;
          const price = Number(item.price);
          const cpw = wears > 0 ? Math.round((price / wears) * 100) / 100 : price;
          return { name: item.name || "Unnamed", cpw, wears, price, paidOff: cpw < 2 };
        })
        .filter((i) => i.wears > 0)
        .sort((a, b) => a.cpw - b.cpw)
        .slice(0, 5);
      setBestValue(cpwData);

      // Heatmap (last 30 days)
      const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
      const dayMap = new Map<string, number>();
      logs.forEach((log) => {
        if (new Date(log.worn_at) >= thirtyDaysAgo) {
          dayMap.set(log.worn_at, (dayMap.get(log.worn_at) || 0) + 1);
        }
      });
      const heatmapData: WearHeatmapDay[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now - i * 24 * 60 * 60 * 1000);
        const dateStr = d.toISOString().split("T")[0];
        heatmapData.push({ date: dateStr, count: dayMap.get(dateStr) || 0 });
      }
      setHeatmap(heatmapData);
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) return null;

  const maxHeatmap = Math.max(...heatmap.map((d) => d.count), 1);

  return (
    <div className="space-y-4">
      {/* Wear Frequency Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-5 h-5 text-[hsl(15,80%,55%)]" />
          <h3 className="font-display text-base font-bold text-foreground">Wear Activity</h3>
          <span className="text-xs text-muted-foreground font-sans ml-auto">{totalWears} total wears</span>
        </div>
        <div className="flex gap-[3px] flex-wrap">
          {heatmap.map((day) => (
            <div
              key={day.date}
              className="w-[18px] h-[18px] rounded-[4px] border border-border/50"
              style={{
                backgroundColor: day.count === 0
                  ? "hsl(var(--secondary))"
                  : `hsl(var(--primary) / ${0.2 + (day.count / maxHeatmap) * 0.8})`,
              }}
              title={`${day.date}: ${day.count} items worn`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground font-sans">
          <span>Less</span>
          {[0.2, 0.4, 0.6, 0.8, 1].map((o) => (
            <div key={o} className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: `hsl(var(--primary) / ${o})` }} />
          ))}
          <span>More</span>
        </div>
      </motion.div>

      {/* Best Value Items */}
      {bestValue.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-[hsl(142,60%,45%)]" />
            <h3 className="font-display text-base font-bold text-foreground">Best Value Items</h3>
          </div>
          <div className="space-y-2">
            {bestValue.map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5">
                <span className="text-xs font-sans text-muted-foreground w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-sans text-foreground truncate">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground font-sans">{item.wears} wears · ${item.price}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.paidOff && <Award className="w-3.5 h-3.5 text-[hsl(45,80%,55%)]" />}
                  <span className={`text-sm font-sans font-bold ${item.cpw < 5 ? "text-[hsl(142,60%,45%)]" : "text-foreground"}`}>
                    ${item.cpw}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-sans">/wear</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Dormant Items */}
      {dormantItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-[hsl(40,80%,55%,0.3)] bg-card p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-[hsl(40,80%,55%)]" />
            <h3 className="font-display text-base font-bold text-foreground">Dormant Items</h3>
          </div>
          <p className="text-xs text-muted-foreground font-sans mb-3">
            These items haven't been worn in 60+ days
          </p>
          <div className="space-y-2">
            {dormantItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-1.5">
                <Shirt className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-sans text-foreground truncate">{item.name || item.category}</p>
                  <p className="text-[10px] text-muted-foreground font-sans">{item.days_dormant} days since last wear</p>
                </div>
                <span className="text-[10px] font-sans text-[hsl(40,80%,55%)] px-2 py-0.5 rounded-full bg-[hsl(40,80%,55%,0.1)]">
                  Donate?
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
