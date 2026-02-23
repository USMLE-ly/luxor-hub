import { useState, useEffect } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Medal, Crown, TrendingUp, Loader2, User } from "lucide-react";
import { motion } from "framer-motion";

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  avg_score: number;
  total_analyses: number;
  best_score: number;
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // Fetch all analyses
      const { data: analyses } = await supabase
        .from("outfit_analyses")
        .select("user_id, style_score");

      if (!analyses || analyses.length === 0) {
        setEntries([]);
        setLoading(false);
        return;
      }

      // Aggregate by user
      const userMap: Record<string, { scores: number[] }> = {};
      for (const a of analyses) {
        if (!userMap[a.user_id]) userMap[a.user_id] = { scores: [] };
        userMap[a.user_id].scores.push(Number(a.style_score));
      }

      // Fetch profiles
      const userIds = Object.keys(userMap);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const profileMap: Record<string, { display_name: string; avatar_url: string | null }> = {};
      for (const p of profiles || []) {
        profileMap[p.user_id] = { display_name: p.display_name || "Stylist", avatar_url: p.avatar_url };
      }

      const leaderboard: LeaderboardEntry[] = userIds.map((uid) => {
        const scores = userMap[uid].scores;
        return {
          user_id: uid,
          display_name: profileMap[uid]?.display_name || "Stylist",
          avatar_url: profileMap[uid]?.avatar_url || null,
          avg_score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
          total_analyses: scores.length,
          best_score: Math.max(...scores),
        };
      });

      leaderboard.sort((a, b) => b.avg_score - a.avg_score);
      setEntries(leaderboard);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 0) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-amber-700" />;
    return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank + 1}</span>;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-400";
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Style <span className="gold-text">Leaderboard</span>
          </h1>
          <p className="text-muted-foreground mt-1">Users ranked by average outfit analysis score</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No analyses yet. Be the first to analyze an outfit!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, i) => (
              <motion.div
                key={entry.user_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`glass-card overflow-hidden ${entry.user_id === user?.id ? "ring-1 ring-primary/50" : ""} ${i === 0 ? "border-yellow-500/30" : ""}`}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex-shrink-0">{getRankIcon(i)}</div>
                    
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {entry.avatar_url ? (
                        <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-primary" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-foreground truncate">{entry.display_name}</h3>
                        {entry.user_id === user?.id && (
                          <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">You</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {entry.total_analyses} {entry.total_analyses === 1 ? "analysis" : "analyses"} · Best: {entry.best_score}/100
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className={`text-2xl font-bold ${getScoreColor(entry.avg_score)}`}>{entry.avg_score}</span>
                      <p className="text-[10px] text-muted-foreground">avg score</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
