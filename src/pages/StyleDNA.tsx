import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Sparkles, Palette, Star, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  "Navy": "hsl(220, 60%, 25%)",
  "Burgundy": "hsl(345, 60%, 30%)",
  "Forest Green": "hsl(140, 50%, 25%)",
  "Charcoal": "hsl(0, 0%, 30%)",
  "Olive": "hsl(80, 40%, 35%)",
  "Rust": "hsl(15, 70%, 45%)",
  "Teal": "hsl(180, 50%, 35%)",
  "Cream": "hsl(40, 60%, 90%)",
  "Camel": "hsl(30, 50%, 55%)",
  "Slate Blue": "hsl(210, 30%, 50%)",
  "Terracotta": "hsl(15, 55%, 50%)",
  "Sage": "hsl(130, 20%, 55%)",
  "Ivory": "hsl(40, 40%, 92%)",
  "Stone": "hsl(30, 15%, 60%)",
  "Dusty Rose": "hsl(350, 30%, 65%)",
  "Lavender": "hsl(270, 40%, 70%)",
  "Coral": "hsl(16, 80%, 65%)",
  "Mustard": "hsl(45, 80%, 50%)",
  "Black": "hsl(0, 0%, 10%)",
  "White": "hsl(0, 0%, 95%)",
  "Red": "hsl(0, 70%, 50%)",
  "Blue": "hsl(210, 70%, 50%)",
  "Green": "hsl(120, 50%, 40%)",
  "Beige": "hsl(35, 40%, 80%)",
  "Brown": "hsl(25, 50%, 35%)",
  "Gray": "hsl(0, 0%, 50%)",
  "Pink": "hsl(340, 60%, 65%)",
  "Orange": "hsl(25, 80%, 55%)",
  "Yellow": "hsl(50, 80%, 55%)",
  "Purple": "hsl(270, 50%, 45%)",
  "Neon": "hsl(120, 100%, 50%)",
  "Hot Pink": "hsl(330, 100%, 55%)",
  "Bright Orange": "hsl(25, 100%, 55%)",
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
        if (prefs?.aiAnalysis) {
          setDna(prefs.aiAnalysis);
        }
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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden px-6 pt-12 pb-8"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <Sparkles className="w-10 h-10 text-primary" />
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-display text-3xl font-bold text-foreground mb-2"
          >
            Your Style DNA
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground font-sans"
          >
            Powered by AI analysis
          </motion.p>
        </div>
      </motion.div>

      <div className="px-6 space-y-6 pb-24">
        {/* Archetype Card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-border bg-card p-6 text-center"
        >
          <p className="text-xs font-sans uppercase tracking-widest text-muted-foreground mb-2">Your Archetype</p>
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">{archetype}</h2>
          <div className="flex items-center justify-center gap-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{styleScore}</div>
              <p className="text-xs text-muted-foreground font-sans">Style Score</p>
            </div>
          </div>
        </motion.div>

        {/* Color Season */}
        {dna && (
          <>
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-5 h-5 text-primary" />
                <h3 className="font-display text-lg font-bold text-foreground">Color Analysis</h3>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="px-4 py-2 rounded-full bg-primary/10 text-primary font-sans font-semibold text-sm">
                  {dna.colorSeason}
                </div>
                <span className="text-sm text-muted-foreground font-sans capitalize">
                  {dna.undertone} undertone
                </span>
              </div>

              <p className="text-xs font-sans uppercase tracking-widest text-muted-foreground mb-3">Best Colors</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {dna.bestColors.map((color) => (
                  <div key={color} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/60">
                    <div
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: getColorHsl(color) }}
                    />
                    <span className="text-xs font-sans text-foreground">{color}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs font-sans uppercase tracking-widest text-muted-foreground mb-3">Colors to Avoid</p>
              <div className="flex flex-wrap gap-2">
                {dna.colorsToAvoid.map((color) => (
                  <div key={color} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10">
                    <div
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: getColorHsl(color) }}
                    />
                    <span className="text-xs font-sans text-foreground">{color}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Summary */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h3 className="font-display text-lg font-bold text-foreground">AI Summary</h3>
              </div>
              <p className="text-muted-foreground font-sans text-sm leading-relaxed">{dna.summary}</p>
            </motion.div>

            {/* Recommendations */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-primary" />
                <h3 className="font-display text-lg font-bold text-foreground">Recommendations</h3>
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
          </>
        )}

        {!dna && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
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

      {/* Bottom CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-background/80 backdrop-blur-sm p-4 border-t border-border">
        <Button
          onClick={() => navigate("/dashboard")}
          className="w-full h-14 rounded-xl font-semibold font-sans text-base bg-foreground text-background hover:bg-foreground/90"
        >
          Go to Dashboard
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default StyleDNA;
