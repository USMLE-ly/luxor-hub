import { useState, useEffect } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Trophy, Crown, Medal, Flame, Clock, Loader2, User, Sparkles, ChevronRight, History, Swords, Target, Recycle, Shirt
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface ChallengeEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  score: number;
  analysis_id: string;
}

interface PastChallenge {
  id: string;
  week_start: string;
  week_end: string;
  theme: string | null;
  entries: ChallengeEntry[];
  userRank: number | null;
  userScore: number | null;
}

export default function WeeklyChallenge() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState<{ id: string; week_start: string; week_end: string; theme: string | null } | null>(null);
  const [entries, setEntries] = useState<ChallengeEntry[]>([]);
  const [userAnalyses, setUserAnalyses] = useState<{ id: string; style_score: number; overall_style: string; image_url: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [userEntry, setUserEntry] = useState<ChallengeEntry | null>(null);
  const [pastChallenges, setPastChallenges] = useState<PastChallenge[]>([]);
  const [loadingPast, setLoadingPast] = useState(false);

  useEffect(() => {
    fetchChallenge();
  }, [user]);

  const fetchChallenge = async () => {
    setLoading(true);
    try {
      const { data: challengeId } = await supabase.rpc("get_or_create_current_challenge");
      if (!challengeId) return;

      const { data: challengeData } = await supabase
        .from("weekly_challenges")
        .select("*")
        .eq("id", challengeId)
        .single();
      
      if (challengeData) setChallenge(challengeData);

      const { data: entryData } = await supabase
        .from("challenge_entries")
        .select("*")
        .eq("challenge_id", challengeId)
        .order("score", { ascending: false });

      const userIds = (entryData || []).map((e: any) => e.user_id);
      let profileMap: Record<string, { display_name: string; avatar_url: string | null }> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url")
          .in("user_id", userIds);
        for (const p of profiles || []) {
          profileMap[p.user_id] = { display_name: p.display_name || "Stylist", avatar_url: p.avatar_url };
        }
      }

      const mappedEntries: ChallengeEntry[] = (entryData || []).map((e: any) => ({
        user_id: e.user_id,
        display_name: profileMap[e.user_id]?.display_name || "Stylist",
        avatar_url: profileMap[e.user_id]?.avatar_url || null,
        score: Number(e.score),
        analysis_id: e.analysis_id,
      }));
      setEntries(mappedEntries);
      setUserEntry(mappedEntries.find(e => e.user_id === user?.id) || null);

      if (user && challengeData) {
        const { data: analyses } = await supabase
          .from("outfit_analyses")
          .select("id, style_score, overall_style, image_url")
          .eq("user_id", user.id)
          .gte("created_at", challengeData.week_start)
          .order("style_score", { ascending: false });
        setUserAnalyses((analyses as any[]) || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPastChallenges = async () => {
    if (!user) return;
    setLoadingPast(true);
    try {
      const currentWeekStart = challenge?.week_start;
      
      const { data: challenges } = await supabase
        .from("weekly_challenges")
        .select("*")
        .order("week_start", { ascending: false })
        .limit(12);

      const pastOnes = (challenges || []).filter(c => c.week_start !== currentWeekStart);

      if (pastOnes.length === 0) {
        setPastChallenges([]);
        setLoadingPast(false);
        return;
      }

      const challengeIds = pastOnes.map(c => c.id);
      const { data: allEntries } = await supabase
        .from("challenge_entries")
        .select("*")
        .in("challenge_id", challengeIds)
        .order("score", { ascending: false });

      const entryUserIds = [...new Set((allEntries || []).map((e: any) => e.user_id))];
      let profileMap: Record<string, { display_name: string; avatar_url: string | null }> = {};
      if (entryUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url")
          .in("user_id", entryUserIds);
        for (const p of profiles || []) {
          profileMap[p.user_id] = { display_name: p.display_name || "Stylist", avatar_url: p.avatar_url };
        }
      }

      const result: PastChallenge[] = pastOnes.map(c => {
        const cEntries = (allEntries || [])
          .filter((e: any) => e.challenge_id === c.id)
          .map((e: any) => ({
            user_id: e.user_id,
            display_name: profileMap[e.user_id]?.display_name || "Stylist",
            avatar_url: profileMap[e.user_id]?.avatar_url || null,
            score: Number(e.score),
            analysis_id: e.analysis_id,
          }));

        const userIdx = cEntries.findIndex(e => e.user_id === user.id);

        return {
          ...c,
          entries: cEntries,
          userRank: userIdx >= 0 ? userIdx + 1 : null,
          userScore: userIdx >= 0 ? cEntries[userIdx].score : null,
        };
      });

      setPastChallenges(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPast(false);
    }
  };

  const handleSubmit = async (analysisId: string, score: number) => {
    if (!user || !challenge) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("challenge_entries").insert({
        challenge_id: challenge.id,
        user_id: user.id,
        analysis_id: analysisId,
        score,
      });
      if (error) throw error;
      toast.success("Entry submitted! 🏆");
      fetchChallenge();
    } catch (err: any) {
      if (err.message?.includes("duplicate")) {
        toast.error("You've already entered this week's challenge");
      } else {
        toast.error(err.message || "Failed to submit");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const daysLeft = challenge
    ? Math.max(0, Math.ceil((new Date(challenge.week_end).getTime() - Date.now()) / 86400000))
    : 0;

  const getRankIcon = (rank: number) => {
    if (rank === 0) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-amber-700" />;
    return <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-muted-foreground">#{rank + 1}</span>;
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Weekly Style <span className="gold-text">Challenge</span>
          </h1>
          <p className="text-muted-foreground mt-1">Compete for the highest outfit score this week</p>
        </div>

        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="current" className="flex items-center gap-2">
              <Flame className="w-4 h-4" /> This Week
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-2">
              <Target className="w-4 h-4" /> Challenges
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2" onClick={fetchPastChallenges}>
              <History className="w-4 h-4" /> Past
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-6">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {challenge && (
                  <Card className="glass-card overflow-hidden border-primary/20">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Flame className="w-5 h-5 text-primary" />
                            <h2 className="font-display text-xl font-bold text-foreground">
                              {challenge.theme || "Style Showdown"}
                            </h2>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(challenge.week_start).toLocaleDateString()} — {new Date(challenge.week_end).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-primary">
                            <Clock className="w-4 h-4" />
                            <span className="font-display font-bold">{daysLeft}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">days left</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{entries.length} participants</span>
                        {userEntry && <Badge className="bg-green-500/15 text-green-500 border-green-500/30">✓ Entered</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!userEntry && userAnalyses.length > 0 && (
                  <Card className="glass-card">
                    <CardContent className="p-6">
                      <h3 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" /> Submit Your Best Analysis
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">Pick your highest-scoring analysis from this week:</p>
                      <div className="space-y-2">
                        {userAnalyses.slice(0, 5).map((a) => (
                          <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                            <img src={a.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{a.overall_style}</p>
                              <p className="text-xs text-muted-foreground">Score: {a.style_score}/100</p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleSubmit(a.id, Number(a.style_score))}
                              disabled={submitting}
                              className="gold-gradient text-primary-foreground"
                            >
                              Submit
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!userEntry && userAnalyses.length === 0 && (
                  <Card className="glass-card">
                    <CardContent className="p-6 text-center">
                      <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm mb-3">
                        Analyze an outfit this week to enter the challenge!
                      </p>
                      <Button onClick={() => navigate("/outfit-analysis")} variant="outline" className="border-primary/30">
                        Go to Outfit Analysis <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-primary" /> This Week's Rankings
                  </h3>
                  {entries.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No entries yet. Be the first!</p>
                  ) : (
                    <div className="space-y-2">
                      {entries.map((entry, i) => (
                        <motion.div
                          key={entry.user_id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <Card className={`glass-card ${entry.user_id === user?.id ? "ring-1 ring-primary/50" : ""} ${i === 0 ? "border-yellow-500/30" : ""}`}>
                            <CardContent className="p-4 flex items-center gap-3">
                              {getRankIcon(i)}
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                {entry.avatar_url ? (
                                  <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <User className="w-4 h-4 text-primary" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground text-sm truncate">
                                  {entry.display_name}
                                  {entry.user_id === user?.id && <span className="text-primary ml-1">(You)</span>}
                                </p>
                              </div>
                              <span className={`text-xl font-bold ${entry.score >= 80 ? "text-green-500" : entry.score >= 60 ? "text-yellow-500" : "text-red-400"}`}>
                                {entry.score}
                              </span>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          {/* Challenges Tab - New Challenge Types */}
          <TabsContent value="challenges" className="space-y-4">
            {[
              {
                icon: <Shirt className="w-5 h-5 text-primary" />,
                title: "7-Day Capsule Challenge",
                description: "Create 7 unique outfits using only 10 items from your closet",
                points: 50,
                badge: "Capsule Master",
              },
              {
                icon: <Recycle className="w-5 h-5 text-[hsl(142,60%,45%)]" />,
                title: "Rewear 100 Challenge",
                description: "Wear an item 100 times and track it. Sustainability wins!",
                points: 100,
                badge: "Eco Warrior",
              },
              {
                icon: <Swords className="w-5 h-5 text-[hsl(15,80%,55%)]" />,
                title: "Outfit Battle",
                description: "Submit your best outfit — community votes on style, fit & creativity",
                points: 30,
                badge: "Battle Champion",
              },
              {
                icon: <Target className="w-5 h-5 text-[hsl(270,50%,55%)]" />,
                title: "Thrift Flip",
                description: "Style a thrifted piece into a high-fashion look",
                points: 40,
                badge: "Thrift King",
              },
            ].map((challenge, i) => (
              <motion.div
                key={challenge.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="glass-card hover:border-primary/30 transition-colors cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                        {challenge.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold text-foreground text-sm mb-1">{challenge.title}</h3>
                        <p className="text-xs text-muted-foreground font-sans mb-2">{challenge.description}</p>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px]">
                            +{challenge.points} pts
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            🏆 {challenge.badge}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {loadingPast ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : pastChallenges.length === 0 ? (
              <div className="text-center py-16">
                <History className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No past challenges yet.</p>
              </div>
            ) : (
              pastChallenges.map((pc) => (
                <Card key={pc.id} className="glass-card overflow-hidden">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                          <Flame className="w-4 h-4 text-primary" />
                          {pc.theme || "Style Showdown"}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(pc.week_start).toLocaleDateString()} — {new Date(pc.week_end).toLocaleDateString()}
                        </p>
                      </div>
                      {pc.userRank !== null && (
                        <Badge className="bg-primary/15 text-primary border-primary/30">
                          #{pc.userRank} · {pc.userScore}/100
                        </Badge>
                      )}
                    </div>

                    {pc.entries.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No entries</p>
                    ) : (
                      <div className="space-y-1.5">
                        {pc.entries.slice(0, 3).map((entry, i) => (
                          <div key={entry.user_id} className="flex items-center gap-2 text-sm">
                            {getRankIcon(i)}
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                              {entry.avatar_url ? (
                                <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-3 h-3 text-primary" />
                              )}
                            </div>
                            <span className="flex-1 truncate text-foreground">
                              {entry.display_name}
                              {entry.user_id === user?.id && <span className="text-primary ml-1">(You)</span>}
                            </span>
                            <span className={`font-bold ${entry.score >= 80 ? "text-green-500" : entry.score >= 60 ? "text-yellow-500" : "text-red-400"}`}>
                              {entry.score}
                            </span>
                          </div>
                        ))}
                        {pc.entries.length > 3 && (
                          <p className="text-[10px] text-muted-foreground">+{pc.entries.length - 3} more participants</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
