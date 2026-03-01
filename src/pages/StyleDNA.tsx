import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Sparkles, Palette, Star, ArrowRight, CheckCircle2, ShieldCheck, Scissors, Shirt, Check, Dna } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/app/AppLayout";

interface StyleDNAData {
  colorSeason: string;
  undertone: string;
  bestColors: string[];
  colorsToAvoid: string[];
  archetype: string;
  styleScore: number;
  recommendations: string[];
  summary: string;
}

const colorNameToHsl: Record<string, string> = {
  "Navy": "hsl(220, 60%, 25%)", "Burgundy": "hsl(345, 60%, 30%)", "Forest Green": "hsl(140, 50%, 25%)",
  "Charcoal": "hsl(0, 0%, 30%)", "Olive": "hsl(80, 40%, 35%)", "Rust": "hsl(15, 70%, 45%)",
  "Teal": "hsl(180, 50%, 35%)", "Cream": "hsl(40, 60%, 90%)", "Camel": "hsl(30, 50%, 55%)",
  "Slate Blue": "hsl(210, 30%, 50%)", "Terracotta": "hsl(15, 55%, 50%)", "Sage": "hsl(130, 20%, 55%)",
  "Ivory": "hsl(40, 40%, 92%)", "Stone": "hsl(30, 15%, 60%)", "Dusty Rose": "hsl(350, 30%, 65%)",
  "Lavender": "hsl(270, 40%, 70%)", "Coral": "hsl(16, 80%, 65%)", "Mustard": "hsl(45, 80%, 50%)",
  "Black": "hsl(0, 0%, 10%)", "White": "hsl(0, 0%, 95%)", "Red": "hsl(0, 70%, 50%)",
  "Blue": "hsl(210, 70%, 50%)", "Green": "hsl(120, 50%, 40%)", "Beige": "hsl(35, 40%, 80%)",
  "Brown": "hsl(25, 50%, 35%)", "Gray": "hsl(0, 0%, 50%)", "Pink": "hsl(340, 60%, 65%)",
  "Orange": "hsl(25, 80%, 55%)", "Yellow": "hsl(50, 80%, 55%)", "Purple": "hsl(270, 50%, 45%)",
};

function getColorHsl(name: string): string {
  return colorNameToHsl[name] || `hsl(${Math.abs(name.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % 360}, 50%, 50%)`;
}

const StyleDNA = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [dna, setDna] = useState<StyleDNAData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("style_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (data) {
        setProfile(data);
        const prefs = data.preferences as any;
        if (prefs?.aiAnalysis) setDna(prefs.aiAnalysis);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user, authLoading, navigate]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const archetype = profile?.archetype || "Style Explorer";
  const styleScore = profile?.style_score || 25;
  const calibrationProgress = (profile?.preferences as any)?.calibrationProgress || 0;

  return (
    <AppLayout>
      <div className="pb-8">
        {/* Hero header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-5 pt-8 pb-5"
        >
          <div className="flex items-center gap-2 mb-1">
            <Dna className="w-5 h-5 text-primary" />
            <span className="text-xs font-sans font-semibold uppercase tracking-widest text-muted-foreground">Style DNA</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">My Style Formula</h1>
        </motion.div>

        <div className="px-5 space-y-4">
          {/* Formula cards */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-secondary/40 p-4 space-y-3"
          >
            <button onClick={() => navigate("/color-type")} className="flex items-center gap-3 w-full text-left hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-xl bg-[hsl(45,80%,65%)]/20 flex items-center justify-center">
                <Palette className="w-5 h-5 text-[hsl(45,80%,55%)]" />
              </div>
              <div className="flex-1">
                <p className="font-sans font-semibold text-foreground text-sm">Color Type</p>
                <p className="text-muted-foreground text-xs font-sans">
                  {dna?.colorSeason ? `${dna.colorSeason} · ${dna.undertone} undertone` : "Determines your clothing colors"}
                </p>
              </div>
              {dna?.colorSeason && (
                <div className="flex gap-1">
                  {dna.bestColors.slice(0, 3).map((c) => (
                    <div key={c} className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: getColorHsl(c) }} />
                  ))}
                </div>
              )}
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </button>

            <button onClick={() => navigate("/calibration")} className="flex items-center gap-3 w-full text-left hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-xl bg-[hsl(0,70%,68%)]/20 flex items-center justify-center">
                <Scissors className="w-5 h-5 text-[hsl(0,70%,68%)]" />
              </div>
              <div className="flex-1">
                <p className="font-sans font-semibold text-foreground text-sm">Style Preferences</p>
                <p className="text-muted-foreground text-xs font-sans">Your best prints & fabrics</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[hsl(270,40%,65%)]/20 flex items-center justify-center">
                <Shirt className="w-5 h-5 text-[hsl(270,40%,65%)]" />
              </div>
              <div className="flex-1">
                <p className="font-sans font-semibold text-foreground text-sm">Body Type</p>
                <p className="text-muted-foreground text-xs font-sans">Defines shapes that flatter you</p>
              </div>
            </div>
          </motion.div>

          {/* Calibration progress */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            onClick={() => navigate("/calibration")}
            className="w-full rounded-2xl p-4 text-left hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "hsl(120, 30%, 94%)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-sans font-bold text-foreground text-sm">Calibration Progress</p>
              <span className="text-xs font-sans text-muted-foreground">{calibrationProgress || 30}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-6 rounded-full bg-background overflow-hidden">
                <div
                  className="h-full rounded-full flex items-center justify-between px-2"
                  style={{
                    width: `${calibrationProgress || 30}%`,
                    background: "linear-gradient(90deg, hsl(130,60%,50%), hsl(170,70%,55%))",
                  }}
                >
                  <Check className="w-3 h-3 text-background" />
                  <span className="text-[10px] font-bold text-background">{calibrationProgress || 30}%</span>
                </div>
              </div>
              <span className="text-sm">🎁</span>
            </div>
          </motion.button>

          {/* Archetype Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <p className="text-xs font-sans uppercase tracking-widest text-muted-foreground">Your Archetype</p>
            </div>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">{archetype}</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">{styleScore}</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-sans">Style Score</p>
                  <div className="flex gap-0.5 mt-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${s <= Math.round(styleScore / 20) ? "text-[hsl(45,80%,55%)] fill-[hsl(45,80%,55%)]" : "text-muted"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Color palette preview */}
          {dna && (
            <>
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                onClick={() => navigate("/color-type")}
                className="w-full rounded-2xl border border-border bg-card p-5 text-left hover:bg-secondary/20 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-primary" />
                    <h3 className="font-display text-base font-bold text-foreground">{dna.colorSeason}</h3>
                  </div>
                  <span className="text-xs font-sans text-muted-foreground capitalize">{dna.undertone} undertone</span>
                </div>
                <div className="flex gap-1.5 mb-3">
                  {dna.bestColors.slice(0, 8).map((color) => (
                    <div
                      key={color}
                      className="flex-1 h-8 rounded-lg border border-border"
                      style={{ backgroundColor: getColorHsl(color) }}
                      title={color}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground font-sans">Tap to view full palette</p>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </motion.button>

              {/* AI Summary */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <h3 className="font-display text-base font-bold text-foreground">AI Summary</h3>
                </div>
                <p className="text-muted-foreground font-sans text-sm leading-relaxed">{dna.summary}</p>
              </motion.div>

              {/* Recommendations */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-primary" />
                  <h3 className="font-display text-base font-bold text-foreground">Recommendations</h3>
                </div>
                <div className="space-y-3">
                  {dna.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm font-sans text-muted-foreground leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Colors to Avoid */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <p className="text-xs font-sans uppercase tracking-widest text-muted-foreground mb-3">Colors to Avoid</p>
                <div className="flex flex-wrap gap-2">
                  {dna.colorsToAvoid.map((color) => (
                    <div key={color} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10">
                      <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: getColorHsl(color) }} />
                      <span className="text-xs font-sans text-foreground">{color}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}

          {!dna && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-border bg-card p-6 text-center"
            >
              <p className="text-muted-foreground font-sans mb-4">
                Complete the onboarding with selfie capture to unlock your full AI Color & Style analysis.
              </p>
              <Button onClick={() => navigate("/onboarding")} className="rounded-xl">
                Complete Onboarding
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default StyleDNA;
