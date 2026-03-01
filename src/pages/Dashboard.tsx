import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Shirt, Wand2, Star, Check, ArrowRight, Heart, Edit2, Sparkles, Palette, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ items: 0, outfits: 0, styleScore: 0 });
  const [profile, setProfile] = useState<{ display_name: string | null }>({ display_name: null });
  const [styleProfile, setStyleProfile] = useState<{
    onboarding_completed: boolean | null;
    archetype: string | null;
    preferences: any;
  }>({ onboarding_completed: null, archetype: null, preferences: null });

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [itemsRes, outfitsRes, profileRes, styleRes] = await Promise.all([
        supabase.from("clothing_items").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("outfits").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("profiles").select("display_name").eq("user_id", user.id).single(),
        supabase.from("style_profiles").select("onboarding_completed, archetype, style_score, preferences").eq("user_id", user.id).single(),
      ]);
      setStats({
        items: itemsRes.count || 0,
        outfits: outfitsRes.count || 0,
        styleScore: (styleRes.data as any)?.style_score || 0,
      });
      if (profileRes.data) setProfile(profileRes.data);
      if (styleRes.data) setStyleProfile(styleRes.data as any);
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    if (styleProfile.onboarding_completed === false && user) {
      navigate("/onboarding");
    }
  }, [styleProfile.onboarding_completed, user, navigate]);

  const calibrationProgress = styleProfile.preferences?.calibrationProgress || 0;
  const hasCalibration = calibrationProgress > 0;

  return (
    <AppLayout>
      <div className="p-5 lg:p-8 max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="w-10 h-10">
            <Sparkles className="w-8 h-8 text-foreground" />
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-foreground" />
            </button>
            <button
              onClick={() => navigate("/settings")}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
            >
              <span className="text-sm font-bold text-foreground">
                {(profile.display_name || user?.email || "U")[0].toUpperCase()}
              </span>
            </button>
          </div>
        </motion.div>

        {/* My Style Formula */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl font-bold text-foreground">My Style Formula</h2>
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate("/style-dna")}
              className="rounded-full bg-foreground text-background hover:bg-foreground/90 text-xs px-4"
            >
              View <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>

          <div className="rounded-2xl bg-secondary/40 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[hsl(45,80%,65%)]/20 flex items-center justify-center">
                <Palette className="w-5 h-5 text-[hsl(45,80%,55%)]" />
              </div>
              <div>
                <p className="font-sans font-semibold text-foreground text-sm">COLOR TYPE</p>
                <p className="text-muted-foreground text-xs font-sans">Determines your clothing colors</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[hsl(0,70%,68%)]/20 flex items-center justify-center">
                <Scissors className="w-5 h-5 text-[hsl(0,70%,68%)]" />
              </div>
              <div>
                <p className="font-sans font-semibold text-foreground text-sm">STYLE PREFERENCES</p>
                <p className="text-muted-foreground text-xs font-sans">Determines your best prints and fabrics</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[hsl(270,40%,65%)]/20 flex items-center justify-center">
                <Shirt className="w-5 h-5 text-[hsl(270,40%,65%)]" />
              </div>
              <div>
                <p className="font-sans font-semibold text-foreground text-sm">BODY TYPE</p>
                <p className="text-muted-foreground text-xs font-sans">Defines shapes that flatter you</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Calibration Progress */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-5"
          style={{ backgroundColor: "hsl(120, 30%, 94%)" }}
        >
          <h3 className="font-display text-lg font-bold text-foreground mb-3">
            Calibration in progress!
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-8 rounded-full bg-background overflow-hidden relative">
              <div
                className="h-full rounded-full flex items-center justify-between px-3"
                style={{
                  width: `${hasCalibration ? calibrationProgress : 30}%`,
                  background: "linear-gradient(90deg, hsl(130,60%,50%), hsl(170,70%,55%))",
                }}
              >
                <Check className="w-4 h-4 text-background" />
                <span className="text-xs font-bold text-background">{hasCalibration ? calibrationProgress : 30}%</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center">
              <span className="text-sm">🎁</span>
            </div>
          </div>
          <p className="text-muted-foreground text-xs font-sans">
            Let's continue tomorrow - the more we know you, the better the results!
          </p>
          {!hasCalibration && (
            <Button
              onClick={() => navigate("/calibration")}
              variant="outline"
              size="sm"
              className="mt-3 rounded-full text-xs"
            >
              Start Calibration <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          )}
        </motion.div>

        {/* All My Outfits */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl font-bold text-foreground">All My Outfits</h2>
            <button
              onClick={() => navigate("/outfits")}
              className="text-sm text-muted-foreground font-sans hover:text-foreground transition-colors"
            >
              View all
            </button>
          </div>

          {stats.outfits === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <Wand2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground font-sans text-sm mb-4">No outfits yet. Generate your first AI outfit!</p>
              <Button onClick={() => navigate("/outfits")} size="sm" className="rounded-full">
                Create Outfit
              </Button>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
              {["Workout", "Work", "Everyday"].map((occasion, i) => (
                <div key={occasion} className="min-w-[180px] rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="relative h-40 bg-secondary flex items-center justify-center">
                    <Edit2 className="absolute top-2 left-2 w-4 h-4 text-muted-foreground" />
                    <Heart className="absolute top-2 right-2 w-4 h-4 text-muted-foreground" />
                    <Shirt className="w-12 h-12 text-muted-foreground/40" />
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-xs">👔</span>
                      <span className="font-sans text-sm font-medium text-foreground">{occasion}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-[10px] font-sans text-muted-foreground flex items-center gap-1">
                        View items <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                      <button className="text-[10px] font-sans text-primary flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" /> Try it on
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Chat with AI Stylist */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="font-display text-xl font-bold text-foreground mb-3">Chat with AI Stylist</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {[
              "Pieces that never go out of style",
              "Main men's winter trends",
              "What sporty items are essential?",
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => navigate("/chat")}
                className="min-w-[160px] p-4 rounded-2xl bg-secondary/40 text-left hover:bg-secondary/60 transition-colors"
              >
                <p className="font-sans text-sm text-foreground leading-snug">{prompt}</p>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
