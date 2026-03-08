import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Zap, Trophy, Target, Sparkles } from "lucide-react";

interface PointEntry {
  points: number;
  reason: string;
  created_at: string;
}

export function StylePointsWidget() {
  const { user } = useAuth();
  const [totalPoints, setTotalPoints] = useState(0);
  const [recentPoints, setRecentPoints] = useState<PointEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [totalRes, recentRes] = await Promise.all([
        supabase.from("style_points" as any).select("points").eq("user_id", user.id) as any,
        supabase.from("style_points" as any).select("points, reason, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5) as any,
      ]);

      if (totalRes.data) {
        setTotalPoints((totalRes.data as any[]).reduce((sum: number, r: any) => sum + r.points, 0));
      }
      if (recentRes.data) setRecentPoints(recentRes.data as PointEntry[]);
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) return null;

  const level = Math.floor(totalPoints / 100) + 1;
  const progressInLevel = totalPoints % 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-[hsl(45,80%,55%)]" />
          <h3 className="font-display text-base font-bold text-foreground">Style Points</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-primary" />
          <span className="text-xs font-sans text-muted-foreground">Level {level}</span>
        </div>
      </div>

      {/* Points & Progress */}
      <div className="flex items-center gap-4 mb-4">
        <div className="text-3xl font-display font-bold text-foreground">{totalPoints}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-sans text-muted-foreground">Next level</span>
            <span className="text-[10px] font-sans text-muted-foreground">{progressInLevel}/100</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressInLevel}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-[hsl(45,80%,55%)]"
            />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {recentPoints.length > 0 && (
        <div className="space-y-1.5">
          {recentPoints.slice(0, 3).map((entry, i) => (
            <div key={i} className="flex items-center justify-between py-1">
              <span className="text-xs font-sans text-muted-foreground truncate flex-1">{entry.reason}</span>
              <span className="text-xs font-sans font-bold text-primary">+{entry.points}</span>
            </div>
          ))}
        </div>
      )}

      {/* Quick Earn */}
      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-[10px] font-sans text-muted-foreground mb-2 flex items-center gap-1">
          <Target className="w-3 h-3" /> Earn points today
        </p>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] font-sans bg-secondary px-2 py-1 rounded-full text-muted-foreground">Log a wear +5</span>
          <span className="text-[10px] font-sans bg-secondary px-2 py-1 rounded-full text-muted-foreground">Reflect +5</span>
          <span className="text-[10px] font-sans bg-secondary px-2 py-1 rounded-full text-muted-foreground">AI suggestion +10</span>
        </div>
      </div>
    </motion.div>
  );
}
