import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Shirt, TrendingUp, DollarSign, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface WearData {
  clothing_item_id: string;
  clothing_items: { name: string | null; category: string; price: number | null } | null;
}

export const WardrobeStats = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [totalItems, setTotalItems] = useState(0);
  const [mostWorn, setMostWorn] = useState<{ name: string; count: number }[]>([]);
  const [topCostPerWear, setTopCostPerWear] = useState<{ name: string; cpw: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [itemsRes, logsRes] = await Promise.all([
        supabase.from("clothing_items").select("id, name, price", { count: "exact" }).eq("user_id", user.id),
        supabase.from("wear_logs").select("clothing_item_id, clothing_items(name, category, price)").eq("user_id", user.id),
      ]);

      setTotalItems(itemsRes.count || 0);

      if (logsRes.data) {
        // Most worn
        const counts: Record<string, { name: string; count: number }> = {};
        (logsRes.data as any[]).forEach((log) => {
          const id = log.clothing_item_id;
          const name = log.clothing_items?.name || "Unnamed";
          if (!counts[id]) counts[id] = { name, count: 0 };
          counts[id].count++;
        });
        const sorted = Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 3);
        setMostWorn(sorted);

        // Cost per wear (best values)
        if (itemsRes.data) {
          const cpwData = itemsRes.data
            .filter((i) => i.price)
            .map((item) => {
              const wears = (logsRes.data as any[]).filter((l) => l.clothing_item_id === item.id).length;
              const price = Number(item.price) || 0;
              return {
                name: item.name || "Unnamed",
                cpw: wears > 0 ? Math.round((price / wears) * 100) / 100 : price,
                wears,
              };
            })
            .filter((i) => i.wears > 0)
            .sort((a, b) => a.cpw - b.cpw)
            .slice(0, 3);
          setTopCostPerWear(cpwData);
        }
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  if (loading || totalItems === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Wardrobe Insights
        </h2>
        <button
          onClick={() => navigate("/analytics")}
          className="text-xs text-primary font-sans hover:underline"
        >
          View Full Analytics →
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Items */}
        <div className="bg-secondary/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shirt className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground font-sans">Total Items</span>
          </div>
          <p className="font-display text-2xl font-bold text-foreground">{totalItems}</p>
        </div>

        {/* Most Worn */}
        <div className="bg-secondary/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-4 w-4 text-gold-light" />
            <span className="text-xs text-muted-foreground font-sans">Most Worn</span>
          </div>
          {mostWorn.length > 0 ? (
            <div className="space-y-1">
              {mostWorn.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-foreground font-sans truncate max-w-[120px]">{item.name}</span>
                  <span className="text-xs text-primary font-sans font-medium">{item.count}×</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground font-sans">No wear data yet</p>
          )}
        </div>

        {/* Best Cost Per Wear */}
        <div className="bg-secondary/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground font-sans">Best Cost/Wear</span>
          </div>
          {topCostPerWear.length > 0 ? (
            <div className="space-y-1">
              {topCostPerWear.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-foreground font-sans truncate max-w-[120px]">{item.name}</span>
                  <span className="text-xs text-green-500 font-sans font-medium">${item.cpw}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground font-sans">Add prices & log wears</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};
