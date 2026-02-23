import { useState, useEffect } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Award, Target, Flame, Star, Zap, Crown, Eye, TrendingUp, Loader2, Lock
} from "lucide-react";
import { motion } from "framer-motion";

const BADGE_DEFINITIONS = [
  { key: "first_analysis", name: "First Look", description: "Complete your first outfit analysis", icon: "eye", threshold: 1, type: "analyses_count" },
  { key: "5_analyses", name: "Style Explorer", description: "Complete 5 outfit analyses", icon: "target", threshold: 5, type: "analyses_count" },
  { key: "10_analyses", name: "Fashion Critic", description: "Complete 10 outfit analyses", icon: "flame", threshold: 10, type: "analyses_count" },
  { key: "25_analyses", name: "Style Master", description: "Complete 25 outfit analyses", icon: "crown", threshold: 25, type: "analyses_count" },
  { key: "score_70", name: "Rising Star", description: "Achieve an average score of 70+", icon: "star", threshold: 70, type: "avg_score" },
  { key: "score_80", name: "Style Icon", description: "Achieve an average score of 80+", icon: "trending_up", threshold: 80, type: "avg_score" },
  { key: "score_90", name: "Fashion Legend", description: "Achieve an average score of 90+", icon: "zap", threshold: 90, type: "avg_score" },
  { key: "perfect_score", name: "Perfection", description: "Get a perfect 100 on any analysis", icon: "award", threshold: 100, type: "best_score" },
  { key: "challenge_entry", name: "Challenger", description: "Enter a weekly style challenge", icon: "flame", threshold: 1, type: "challenge_entries" },
  { key: "closet_10", name: "Wardrobe Builder", description: "Add 10 items to your closet", icon: "target", threshold: 10, type: "closet_count" },
];

const iconMap: Record<string, React.ReactNode> = {
  eye: <Eye className="w-6 h-6" />,
  target: <Target className="w-6 h-6" />,
  flame: <Flame className="w-6 h-6" />,
  crown: <Crown className="w-6 h-6" />,
  star: <Star className="w-6 h-6" />,
  trending_up: <TrendingUp className="w-6 h-6" />,
  zap: <Zap className="w-6 h-6" />,
  award: <Award className="w-6 h-6" />,
};

export default function Badges() {
  const { user } = useAuth();
  const [unlockedKeys, setUnlockedKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBadges();
      checkAndUnlockBadges();
    }
  }, [user]);

  const fetchBadges = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("user_badges")
      .select("badge_key")
      .eq("user_id", user.id);
    setUnlockedKeys(new Set((data || []).map((b: any) => b.badge_key)));
    setLoading(false);
  };

  const checkAndUnlockBadges = async () => {
    if (!user) return;
    setChecking(true);
    try {
      // Gather stats
      const [analysesRes, closetRes, challengeRes] = await Promise.all([
        supabase.from("outfit_analyses").select("style_score").eq("user_id", user.id),
        supabase.from("clothing_items").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("challenge_entries").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);

      const scores = (analysesRes.data || []).map((a: any) => Number(a.style_score));
      const analysesCount = scores.length;
      const avgScore = analysesCount > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / analysesCount : 0;
      const bestScore = analysesCount > 0 ? Math.max(...scores) : 0;
      const closetCount = closetRes.count || 0;
      const challengeEntries = challengeRes.count || 0;

      const stats: Record<string, number> = {
        analyses_count: analysesCount,
        avg_score: Math.round(avgScore),
        best_score: bestScore,
        challenge_entries: challengeEntries,
        closet_count: closetCount,
      };

      // Check existing badges
      const { data: existing } = await supabase
        .from("user_badges")
        .select("badge_key")
        .eq("user_id", user.id);
      const existingKeys = new Set((existing || []).map((b: any) => b.badge_key));

      let newBadges = 0;
      for (const badge of BADGE_DEFINITIONS) {
        if (existingKeys.has(badge.key)) continue;
        const value = stats[badge.type] || 0;
        if (value >= badge.threshold) {
          const { error } = await supabase.from("user_badges").insert({
            user_id: user.id,
            badge_key: badge.key,
            badge_name: badge.name,
            badge_description: badge.description,
            badge_icon: badge.icon,
          });
          if (!error) {
            existingKeys.add(badge.key);
            newBadges++;
          }
        }
      }

      setUnlockedKeys(existingKeys);
      if (newBadges > 0) {
        toast.success(`🏅 You unlocked ${newBadges} new badge${newBadges > 1 ? "s" : ""}!`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChecking(false);
    }
  };

  const unlockedCount = BADGE_DEFINITIONS.filter(b => unlockedKeys.has(b.key)).length;

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Badges & <span className="gold-text">Achievements</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              {unlockedCount}/{BADGE_DEFINITIONS.length} unlocked
            </p>
          </div>
          {checking && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BADGE_DEFINITIONS.map((badge, i) => {
              const unlocked = unlockedKeys.has(badge.key);
              return (
                <motion.div
                  key={badge.key}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={`glass-card overflow-hidden transition-all ${unlocked ? "border-primary/30" : "opacity-50"}`}>
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${unlocked ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {unlocked ? iconMap[badge.icon] || <Award className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-bold text-foreground text-sm">{badge.name}</h3>
                          {unlocked && <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px]">Unlocked</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{badge.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
