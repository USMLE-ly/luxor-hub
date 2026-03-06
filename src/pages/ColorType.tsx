import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Edit2, Upload, Loader2, CheckCircle, XCircle, Camera } from "lucide-react";
import { BottomNav } from "@/components/app/BottomNav";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const seasonPalettes: Record<string, { primary: string[]; complementary: string[]; universal: string[] }> = {
  "Deep Winter": {
    primary: ["hsl(180,80%,40%)", "hsl(210,90%,50%)", "hsl(240,70%,50%)", "hsl(270,60%,50%)", "hsl(300,50%,45%)", "hsl(330,70%,50%)", "hsl(350,80%,55%)", "hsl(0,70%,45%)"],
    complementary: ["hsl(15,70%,40%)", "hsl(25,80%,55%)", "hsl(35,70%,55%)", "hsl(45,80%,55%)", "hsl(55,80%,50%)", "hsl(80,60%,50%)", "hsl(120,70%,45%)", "hsl(160,60%,45%)"],
    universal: ["hsl(0,0%,5%)", "hsl(0,0%,15%)", "hsl(20,15%,25%)", "hsl(20,20%,35%)", "hsl(15,30%,45%)", "hsl(10,35%,50%)", "hsl(0,0%,8%)", "hsl(0,0%,12%)"],
  },
  "Cold Winter": {
    primary: ["hsl(180,80%,45%)", "hsl(200,90%,55%)", "hsl(230,80%,55%)", "hsl(260,70%,55%)", "hsl(280,60%,50%)", "hsl(310,70%,55%)", "hsl(340,80%,55%)", "hsl(355,75%,50%)"],
    complementary: ["hsl(10,80%,40%)", "hsl(20,80%,50%)", "hsl(30,80%,55%)", "hsl(40,85%,55%)", "hsl(50,85%,50%)", "hsl(70,70%,50%)", "hsl(100,60%,45%)", "hsl(150,60%,45%)"],
    universal: ["hsl(0,0%,5%)", "hsl(0,0%,12%)", "hsl(15,12%,25%)", "hsl(20,18%,35%)", "hsl(15,30%,45%)", "hsl(10,35%,50%)", "hsl(0,0%,8%)", "hsl(0,0%,15%)"],
  },
};

function getPalettes(season: string) {
  return seasonPalettes[season] || seasonPalettes["Cold Winter"];
}

interface ExtractedColor {
  hex: string;
  name: string;
  matchesSeason: boolean;
  advice: string;
}

const ColorType = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [dna, setDna] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [extractedPalette, setExtractedPalette] = useState<{ colors: ExtractedColor[]; summary: string; matchCount: number; totalColors: number } | null>(null);
  const [extracting, setExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    const fetchData = async () => {
      const { data } = await supabase.from("style_profiles").select("preferences").eq("user_id", user.id).single();
      if (data) { setDna((data.preferences as any)?.aiAnalysis || null); }
      setLoading(false);
    };
    fetchData();
  }, [user, authLoading, navigate]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setPreviewUrl(base64);
      setExtracting(true);
      try {
        const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-palette`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ image: base64, colorSeason: dna?.colorSeason || "" }),
        });
        if (!resp.ok) {
          if (resp.status === 429) { toast.error("Rate limited"); return; }
          if (resp.status === 402) { toast.error("AI credits exhausted"); return; }
          throw new Error("Extraction failed");
        }
        const result = await resp.json();
        setExtractedPalette(result);
        toast.success("Palette extracted!");
      } catch { toast.error("Failed to extract palette"); }
      finally { setExtracting(false); }
    };
    reader.readAsDataURL(file);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const colorSeason = dna?.colorSeason || "Cold Winter";
  const palettes = getPalettes(colorSeason);

  const PaletteSection = ({ title, description, colors, totalExtra }: { title: string; description: string; colors: string[]; totalExtra?: number }) => (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-foreground">{title}</h3>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground text-sm font-sans leading-relaxed">{description}</p>
      <div className="grid grid-cols-4 gap-2">
        {colors.slice(0, 7).map((color, i) => (<div key={i} className="aspect-square rounded-lg" style={{ backgroundColor: color }} />))}
        {totalExtra && totalExtra > 0 ? (
          <div className="aspect-square rounded-lg flex items-center justify-center" style={{ backgroundColor: colors[7] || colors[colors.length - 1] }}>
            <span className="text-sm font-bold text-background/90 font-sans">+{totalExtra}</span>
          </div>
        ) : (<div className="aspect-square rounded-lg" style={{ backgroundColor: colors[7] || colors[colors.length - 1] }} />)}
      </div>
      <button className="w-full py-3 rounded-xl bg-secondary/50 text-sm font-sans text-foreground flex items-center justify-center gap-2 hover:bg-secondary/70 transition-colors">
        View colors <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-20 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5 text-foreground" /></button>
        <h1 className="font-sans font-semibold text-foreground">Color type</h1>
        <button><Edit2 className="w-4 h-4 text-foreground" /></button>
      </div>

      <div className="px-5 pt-5 space-y-5">
        {/* Season Header */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="rounded-2xl bg-secondary/40 p-5">
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">{colorSeason}</h2>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm font-sans flex-1 pr-4">Discover and understand your Color Type with insights into Color Analysis</p>
            <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-background" />
            </div>
          </div>
        </motion.div>

        {/* Extract Palette from Photo */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }}
          className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Camera className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">Extract Palette from Photo</h3>
              <p className="text-muted-foreground text-xs font-sans">Upload any photo to see which colors match your season</p>
            </div>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

          {previewUrl && (
            <div className="rounded-xl overflow-hidden">
              <img src={previewUrl} alt="Uploaded" className="w-full max-h-48 object-cover rounded-xl" />
            </div>
          )}

          {extracting ? (
            <div className="flex items-center justify-center py-4 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm font-sans text-muted-foreground">Extracting colors...</span>
            </div>
          ) : extractedPalette ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-sans text-sm font-semibold text-foreground">
                  {extractedPalette.matchCount} of {extractedPalette.totalColors} colors match your season
                </p>
                <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} className="text-xs">
                  Try Another
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {extractedPalette.colors.map((color, i) => (
                  <div key={i} className="space-y-1">
                    <div className="aspect-square rounded-lg relative" style={{ backgroundColor: color.hex }}>
                      <div className="absolute -top-1 -right-1">
                        {color.matchesSeason ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                    </div>
                    <p className="text-[9px] font-sans text-muted-foreground text-center truncate">{color.name}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs font-sans text-muted-foreground">{extractedPalette.summary}</p>
            </div>
          ) : (
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full gap-2">
              <Upload className="w-4 h-4" /> Upload a Photo
            </Button>
          )}
        </motion.div>

        {/* Palettes */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <PaletteSection title="Primary Advanced Palette" description="The best colors for every category." colors={palettes.primary} totalExtra={296} />
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <PaletteSection title="Complementary Palette" description="Ideal colors for bottoms, shoes, and accessories." colors={palettes.complementary} totalExtra={296} />
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
          <PaletteSection title="Universal Palette" description="Core colors that pair well with any shade." colors={palettes.universal} totalExtra={7} />
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ColorType;
