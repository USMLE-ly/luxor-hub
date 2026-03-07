import { useState, useEffect } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Sparkles, Loader2, Download, Palette, Shirt, Wand2, RefreshCw, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { RainbowButton } from "@/components/ui/rainbow-button";

const GARMENT_TYPES = [
  "Dress", "Blazer", "Jacket", "Coat", "Top", "Blouse", "Shirt",
  "Trousers", "Skirt", "Jumpsuit", "Knitwear", "Accessories",
];

interface DesignResult {
  imageUrl: string;
  description: string;
  prompt: string;
  garmentType: string;
  timestamp: number;
}

export default function FashionDesigner() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [garmentType, setGarmentType] = useState("Dress");
  const [isGenerating, setIsGenerating] = useState(false);
  const [designs, setDesigns] = useState<DesignResult[]>([]);
  const [archetype, setArchetype] = useState<string | null>(null);
  const [colorSeason, setColorSeason] = useState<string | null>(null);
  const [bestColors, setBestColors] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("style_profiles")
        .select("archetype, style_formula, preferences")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setArchetype(data.archetype);
        const formula = data.style_formula as any;
        const prefs = data.preferences as any;
        if (formula?.colorSeason) setColorSeason(formula.colorSeason);
        else if (prefs?.colorSeason) setColorSeason(prefs.colorSeason);
        if (formula?.bestColors) setBestColors(formula.bestColors);
        else if (prefs?.bestColors) setBestColors(prefs.bestColors);
      }
    })();
  }, [user]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Describe what you'd like designed");
      return;
    }
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("design-clothing", {
        body: { prompt, archetype, colorSeason, bestColors, garmentType },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setDesigns((prev) => [{
        imageUrl: data.imageUrl,
        description: data.description,
        prompt,
        garmentType,
        timestamp: Date.now(),
      }, ...prev]);
      toast.success("Design created!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Design generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (design: DesignResult) => {
    const link = document.createElement("a");
    link.download = `aurelia-design-${design.garmentType.toLowerCase()}-${Date.now()}.png`;
    link.href = design.imageUrl;
    link.click();
    toast.success("Design downloaded!");
  };

  const inspirationPrompts = [
    "A structured blazer with asymmetric lapels and subtle texture",
    "A flowing evening gown with draped shoulders",
    "A minimalist oversized coat with clean lines",
    "A tailored jumpsuit with architectural details",
    "A deconstructed shirt with raw-edge details",
  ];

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative">
          <div className="absolute -top-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-[60px]" />
          <h1 className="font-display text-4xl font-bold text-foreground relative">
            AI Fashion <span className="gold-text">Designer</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Create custom clothing designs powered by your Style DNA</p>
        </motion.div>

        {/* Style DNA Context */}
        {(archetype || colorSeason) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-2">
            {archetype && <Badge variant="secondary" className="text-xs"><Sparkles className="w-3 h-3 mr-1" />{archetype}</Badge>}
            {colorSeason && <Badge variant="secondary" className="text-xs"><Palette className="w-3 h-3 mr-1" />{colorSeason}</Badge>}
            {bestColors.slice(0, 4).map((c, i) => (
              <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted/50 border border-border text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                {c}
              </div>
            ))}
          </motion.div>
        )}

        {/* Design Input */}
        <div className="relative rounded-[1.5rem] border-[0.75px] border-border p-3">
          <GlowingEffect spread={40} glow proximity={64} inactiveZone={0.01} borderWidth={3} />
          <Card className="glass-card border-0 shadow-none">
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <Textarea
                    placeholder="Describe your dream garment... e.g., 'A structured blazer with asymmetric lapels in deep burgundy'"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[100px] bg-background/50"
                  />
                </div>
                <div className="space-y-3">
                  <Select value={garmentType} onValueChange={setGarmentType}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GARMENT_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <RainbowButton onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className="w-full">
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
                    Design
                  </RainbowButton>
                </div>
              </div>

              {/* Inspiration chips */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground">Try:</span>
                {inspirationPrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(p)}
                    className="text-xs px-2 py-1 rounded-full bg-muted/30 border border-border hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    {p.slice(0, 40)}…
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generated Designs */}
        <AnimatePresence>
          {designs.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Your Designs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {designs.map((design, i) => (
                  <motion.div
                    key={design.timestamp}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="glass-card overflow-hidden group">
                      <div className="relative aspect-square">
                        <img
                          src={design.imageUrl}
                          alt={design.prompt}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                          <Button variant="secondary" size="sm" onClick={() => handleDownload(design)}>
                            <Download className="w-3 h-3 mr-1" /> Download
                          </Button>
                        </div>
                        <Badge className="absolute top-3 left-3 bg-black/60 text-white border-0">
                          <Shirt className="w-3 h-3 mr-1" /> {design.garmentType}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <p className="text-sm text-foreground line-clamp-2">{design.prompt}</p>
                        {design.description && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-3">{design.description}</p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
