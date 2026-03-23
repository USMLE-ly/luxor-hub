import { useEffect, useState, useRef } from "react";
import TierGate from "@/components/app/TierGate";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Edit2, Upload, Loader2, CheckCircle, XCircle, Camera, Copy, X, Shirt, Glasses, Watch } from "lucide-react";
import { BottomNav } from "@/components/app/BottomNav";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const seasonPalettes: Record<string, { primary: { hex: string; name: string; tip: string }[]; complementary: { hex: string; name: string; tip: string }[]; universal: { hex: string; name: string; tip: string }[] }> = {
  "Deep Winter": {
    primary: [
      { hex: "hsl(180,80%,40%)", name: "Deep Teal", tip: "Great for tops and scarves" },
      { hex: "hsl(210,90%,50%)", name: "Royal Blue", tip: "Perfect for blazers and dresses" },
      { hex: "hsl(240,70%,50%)", name: "Cobalt", tip: "Ideal for statement pieces" },
      { hex: "hsl(270,60%,50%)", name: "Purple", tip: "Stunning for evening wear" },
      { hex: "hsl(300,50%,45%)", name: "Plum", tip: "Great for accessories and bags" },
      { hex: "hsl(330,70%,50%)", name: "Magenta", tip: "Perfect for blouses and lipstick" },
      { hex: "hsl(350,80%,55%)", name: "Crimson", tip: "Ideal for coats and dresses" },
      { hex: "hsl(0,70%,45%)", name: "Deep Red", tip: "Great for knitwear and shoes" },
    ],
    complementary: [
      { hex: "hsl(15,70%,40%)", name: "Rust", tip: "Perfect for autumn layering" },
      { hex: "hsl(25,80%,55%)", name: "Burnt Orange", tip: "Great for scarves and belts" },
      { hex: "hsl(35,70%,55%)", name: "Amber", tip: "Ideal for accessories" },
      { hex: "hsl(45,80%,55%)", name: "Gold", tip: "Perfect for jewelry and details" },
      { hex: "hsl(55,80%,50%)", name: "Mustard", tip: "Great for bags and shoes" },
      { hex: "hsl(80,60%,50%)", name: "Olive", tip: "Ideal for trousers and jackets" },
      { hex: "hsl(120,70%,45%)", name: "Forest Green", tip: "Perfect for coats" },
      { hex: "hsl(160,60%,45%)", name: "Jade", tip: "Great for tops and blouses" },
    ],
    universal: [
      { hex: "hsl(0,0%,5%)", name: "Jet Black", tip: "Foundation for any outfit" },
      { hex: "hsl(0,0%,15%)", name: "Charcoal", tip: "Great for trousers and suits" },
      { hex: "hsl(20,15%,25%)", name: "Dark Brown", tip: "Perfect for leather goods" },
      { hex: "hsl(20,20%,35%)", name: "Espresso", tip: "Ideal for boots and bags" },
      { hex: "hsl(15,30%,45%)", name: "Warm Taupe", tip: "Great for layering pieces" },
      { hex: "hsl(10,35%,50%)", name: "Sienna", tip: "Perfect for accessories" },
      { hex: "hsl(0,0%,8%)", name: "Onyx", tip: "Ideal for formal wear" },
      { hex: "hsl(0,0%,12%)", name: "Graphite", tip: "Great for coats and outerwear" },
    ],
  },
  "Cold Winter": {
    primary: [
      { hex: "hsl(180,80%,45%)", name: "Teal", tip: "Perfect for tops and blouses" },
      { hex: "hsl(200,90%,55%)", name: "Sky Blue", tip: "Great for shirts and dresses" },
      { hex: "hsl(230,80%,55%)", name: "Sapphire", tip: "Ideal for blazers" },
      { hex: "hsl(260,70%,55%)", name: "Amethyst", tip: "Perfect for evening pieces" },
      { hex: "hsl(280,60%,50%)", name: "Violet", tip: "Great for accessories" },
      { hex: "hsl(310,70%,55%)", name: "Fuchsia", tip: "Stunning for statement tops" },
      { hex: "hsl(340,80%,55%)", name: "Rose", tip: "Perfect for knitwear" },
      { hex: "hsl(355,75%,50%)", name: "Ruby", tip: "Ideal for coats and shoes" },
    ],
    complementary: [
      { hex: "hsl(10,80%,40%)", name: "Brick", tip: "Great for autumn layers" },
      { hex: "hsl(20,80%,50%)", name: "Terracotta", tip: "Perfect for accessories" },
      { hex: "hsl(30,80%,55%)", name: "Copper", tip: "Ideal for jewelry" },
      { hex: "hsl(40,85%,55%)", name: "Honey", tip: "Great for belts and bags" },
      { hex: "hsl(50,85%,50%)", name: "Saffron", tip: "Perfect for scarves" },
      { hex: "hsl(70,70%,50%)", name: "Chartreuse", tip: "Great for accent pieces" },
      { hex: "hsl(100,60%,45%)", name: "Moss", tip: "Ideal for outerwear" },
      { hex: "hsl(150,60%,45%)", name: "Emerald", tip: "Perfect for dresses" },
    ],
    universal: [
      { hex: "hsl(0,0%,5%)", name: "Jet Black", tip: "Foundation for any outfit" },
      { hex: "hsl(0,0%,12%)", name: "Charcoal", tip: "Great for trousers" },
      { hex: "hsl(15,12%,25%)", name: "Dark Brown", tip: "Perfect for leather" },
      { hex: "hsl(20,18%,35%)", name: "Cocoa", tip: "Ideal for bags and boots" },
      { hex: "hsl(15,30%,45%)", name: "Warm Taupe", tip: "Great for layering" },
      { hex: "hsl(10,35%,50%)", name: "Clay", tip: "Perfect for accessories" },
      { hex: "hsl(0,0%,8%)", name: "Onyx", tip: "Ideal for formal wear" },
      { hex: "hsl(0,0%,15%)", name: "Slate", tip: "Great for suits" },
    ],
  },
};

function getPalettes(season: string) {
  return seasonPalettes[season] || seasonPalettes["Cold Winter"];
}

function hslToHex(hslStr: string): string {
  const match = hslStr.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return hslStr;
  const [, h, s, l] = match.map(Number);
  const a2 = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l / 100 - a2 * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

interface ExtractedColor {
  hex: string;
  name: string;
  matchesSeason: boolean;
  advice: string;
}

const ColorType = () => {
  return (
    <TierGate requiredTier="starter" featureName="Color Analysis">
      <ColorTypeContent />
    </TierGate>
  );
};

const ColorTypeContent = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [dna, setDna] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [extractedPalette, setExtractedPalette] = useState<{ colors: ExtractedColor[]; summary: string; matchCount: number; totalColors: number } | null>(null);
  const [extracting, setExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<{ hex: string; name: string; tip: string } | null>(null);

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

  const copyHex = (hex: string) => {
    const hexCode = hslToHex(hex);
    navigator.clipboard.writeText(hexCode);
    toast.success(`Copied ${hexCode}`);
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

  const PaletteSection = ({ title, description, colors, sectionKey }: { title: string; description: string; colors: { hex: string; name: string; tip: string }[]; sectionKey: string }) => {
    const isExpanded = expandedSection === sectionKey;
    const displayColors = isExpanded ? colors : colors.slice(0, 7);
    const extra = colors.length - 7;

    return (
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-foreground">{title}</h3>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm font-sans leading-relaxed">{description}</p>
        <div className="grid grid-cols-4 gap-2">
          {displayColors.map((color, i) => (
            <button
              key={i}
              onClick={() => setSelectedColor(color)}
              className="group relative aspect-square rounded-lg transition-transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: color.hex }}
            >
              <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 flex items-center justify-center">
                <span className="text-[8px] font-bold text-white font-sans">{hslToHex(color.hex)}</span>
              </div>
            </button>
          ))}
          {!isExpanded && extra > 0 && (
            <button
              onClick={() => setExpandedSection(sectionKey)}
              className="aspect-square rounded-lg flex items-center justify-center"
              style={{ backgroundColor: colors[7]?.hex || colors[colors.length - 1].hex }}
            >
              <span className="text-sm font-bold text-background/90 font-sans">+{extra}</span>
            </button>
          )}
        </div>
        <button
          onClick={() => setExpandedSection(isExpanded ? null : sectionKey)}
          className="w-full py-3 rounded-xl bg-secondary/50 text-sm font-sans text-foreground flex items-center justify-center gap-2 hover:bg-secondary/70 transition-colors"
        >
          {isExpanded ? "Show less" : "View colors"} <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
        </button>

        {/* Expanded color grid with names */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-2 pt-2">
                {colors.map((color, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedColor(color)}
                    className="flex items-center gap-3 p-2 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ backgroundColor: color.hex }} />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground font-sans truncate">{color.name}</p>
                      <p className="text-[10px] text-muted-foreground font-sans">{hslToHex(color.hex)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

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
          <PaletteSection title="Primary Advanced Palette" description="The best colors for every category." colors={palettes.primary} sectionKey="primary" />
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <PaletteSection title="Complementary Palette" description="Ideal colors for bottoms, shoes, and accessories." colors={palettes.complementary} sectionKey="complementary" />
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
          <PaletteSection title="Universal Palette" description="Core colors that pair well with any shade." colors={palettes.universal} sectionKey="universal" />
        </motion.div>
      </div>

      {/* Color Detail Modal */}
      <AnimatePresence>
        {selectedColor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center"
            onClick={() => setSelectedColor(null)}
          >
            <motion.div
              initial={{ y: 200 }}
              animate={{ y: 0 }}
              exit={{ y: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-3xl bg-card border border-border p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-foreground">Color Detail</h3>
                <button onClick={() => setSelectedColor(null)}>
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl shadow-lg" style={{ backgroundColor: selectedColor.hex }} />
                <div>
                  <p className="font-display text-xl font-bold text-foreground">{selectedColor.name}</p>
                  <button
                    onClick={() => copyHex(selectedColor.hex)}
                    className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="font-sans font-mono">{hslToHex(selectedColor.hex)}</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
                <Shirt className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-sm font-sans text-foreground">{selectedColor.tip}</p>
              </div>
              <Button onClick={() => copyHex(selectedColor.hex)} className="w-full" variant="outline">
                <Copy className="w-4 h-4 mr-2" /> Copy Hex Code
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
};

export default ColorType;
