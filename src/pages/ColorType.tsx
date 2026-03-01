import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Edit2 } from "lucide-react";
import { BottomNav } from "@/components/app/BottomNav";

// Generate season-based palettes
const seasonPalettes: Record<string, { primary: string[]; complementary: string[]; universal: string[] }> = {
  "Deep Winter": {
    primary: [
      "hsl(180,80%,40%)", "hsl(210,90%,50%)", "hsl(240,70%,50%)", "hsl(270,60%,50%)",
      "hsl(300,50%,45%)", "hsl(330,70%,50%)", "hsl(350,80%,55%)", "hsl(0,70%,45%)",
    ],
    complementary: [
      "hsl(15,70%,40%)", "hsl(25,80%,55%)", "hsl(35,70%,55%)", "hsl(45,80%,55%)",
      "hsl(55,80%,50%)", "hsl(80,60%,50%)", "hsl(120,70%,45%)", "hsl(160,60%,45%)",
    ],
    universal: [
      "hsl(0,0%,5%)", "hsl(0,0%,15%)", "hsl(20,15%,25%)", "hsl(20,20%,35%)",
      "hsl(15,30%,45%)", "hsl(10,35%,50%)", "hsl(0,0%,8%)", "hsl(0,0%,12%)",
    ],
  },
  "Cold Winter": {
    primary: [
      "hsl(180,80%,45%)", "hsl(200,90%,55%)", "hsl(230,80%,55%)", "hsl(260,70%,55%)",
      "hsl(280,60%,50%)", "hsl(310,70%,55%)", "hsl(340,80%,55%)", "hsl(355,75%,50%)",
    ],
    complementary: [
      "hsl(10,80%,40%)", "hsl(20,80%,50%)", "hsl(30,80%,55%)", "hsl(40,85%,55%)",
      "hsl(50,85%,50%)", "hsl(70,70%,50%)", "hsl(100,60%,45%)", "hsl(150,60%,45%)",
    ],
    universal: [
      "hsl(0,0%,5%)", "hsl(0,0%,12%)", "hsl(15,12%,25%)", "hsl(20,18%,35%)",
      "hsl(15,30%,45%)", "hsl(10,35%,50%)", "hsl(0,0%,8%)", "hsl(0,0%,15%)",
    ],
  },
};

// Fallback for any season
function getPalettes(season: string) {
  return seasonPalettes[season] || seasonPalettes["Cold Winter"];
}

const ColorType = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [dna, setDna] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }

    const fetch = async () => {
      const { data } = await supabase
        .from("style_profiles")
        .select("preferences")
        .eq("user_id", user.id)
        .single();
      if (data) {
        const prefs = data.preferences as any;
        setDna(prefs?.aiAnalysis || null);
      }
      setLoading(false);
    };
    fetch();
  }, [user, authLoading, navigate]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const colorSeason = dna?.colorSeason || "Cold Winter";
  const palettes = getPalettes(colorSeason);

  const PaletteSection = ({
    title,
    description,
    colors,
    totalExtra,
  }: {
    title: string;
    description: string;
    colors: string[];
    totalExtra?: number;
  }) => (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-foreground">{title}</h3>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground text-sm font-sans leading-relaxed">{description}</p>
      <div className="grid grid-cols-4 gap-2">
        {colors.slice(0, 7).map((color, i) => (
          <div
            key={i}
            className="aspect-square rounded-lg"
            style={{ backgroundColor: color }}
          />
        ))}
        {totalExtra && totalExtra > 0 ? (
          <div
            className="aspect-square rounded-lg flex items-center justify-center"
            style={{ backgroundColor: colors[7] || colors[colors.length - 1] }}
          >
            <span className="text-sm font-bold text-background/90 font-sans">+{totalExtra}</span>
          </div>
        ) : (
          <div
            className="aspect-square rounded-lg"
            style={{ backgroundColor: colors[7] || colors[colors.length - 1] }}
          />
        )}
      </div>
      <button className="w-full py-3 rounded-xl bg-secondary/50 text-sm font-sans text-foreground flex items-center justify-center gap-2 hover:bg-secondary/70 transition-colors">
        View colors <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="font-sans font-semibold text-foreground">Color type</h1>
        <button>
          <Edit2 className="w-4 h-4 text-foreground" />
        </button>
      </div>

      <div className="px-5 pt-5 space-y-5">
        {/* Season Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="rounded-2xl bg-secondary/40 p-5"
        >
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">{colorSeason}</h2>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm font-sans flex-1 pr-4">
              Discover and understand your Color Type with insights into Color Analysis
            </p>
            <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-background" />
            </div>
          </div>
        </motion.div>

        {/* Primary Advanced Palette */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <PaletteSection
            title="Primary Advanced Palette"
            description="The best colors for every category - from tops and bottoms to shoes and accessories."
            colors={palettes.primary}
            totalExtra={296}
          />
        </motion.div>

        {/* Complementary Palette */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <PaletteSection
            title="Complementary Palette"
            description="Ideal colors for bottoms, shoes, and accessories that mix effortlessly with your Primary colors to elevate your Personal outfits."
            colors={palettes.complementary}
            totalExtra={296}
          />
        </motion.div>

        {/* Universal Palette */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <PaletteSection
            title="Universal Palette"
            description="Core colors for bottoms, accessories, and shoes that pair well with any shade."
            colors={palettes.universal}
            totalExtra={7}
          />
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ColorType;
