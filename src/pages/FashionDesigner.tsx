import { useState, useEffect, useRef } from "react";
import { PrivacyNotice } from "@/components/app/PrivacyNotice";
import { AppLayout } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Sparkles, Loader2, Download, Palette, Shirt, Wand2, Heart, Share2, Trash2,
  History, Image as ImageIcon, Twitter, Link, Check, Eye
} from "lucide-react";
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
  dbId?: string;
  isFavorite?: boolean;
  isPublic?: boolean;
}

interface SavedDesign {
  id: string;
  image_url: string;
  prompt: string;
  description: string | null;
  garment_type: string;
  is_favorite: boolean;
  is_public: boolean;
  created_at: string;
}

export default function FashionDesigner() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [garmentType, setGarmentType] = useState("Dress");
  const [isGenerating, setIsGenerating] = useState(false);
  const [designs, setDesigns] = useState<DesignResult[]>([]);
  const [gallery, setGallery] = useState<SavedDesign[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [archetype, setArchetype] = useState<string | null>(null);
  const [colorSeason, setColorSeason] = useState<string | null>(null);
  const [bestColors, setBestColors] = useState<string[]>([]);
  const [shareOpen, setShareOpen] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
    fetchGallery();
  }, [user]);

  const fetchGallery = async () => {
    if (!user) return;
    setLoadingGallery(true);
    const { data } = await supabase
      .from("fashion_designs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setGallery((data as SavedDesign[]) || []);
    setLoadingGallery(false);
  };

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

  const handleSaveDesign = async (design: DesignResult, index: number) => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from("fashion_designs").insert({
        user_id: user.id,
        image_url: design.imageUrl,
        prompt: design.prompt,
        description: design.description || null,
        garment_type: design.garmentType,
      }).select("id").single();
      if (error) throw error;
      
      const updated = [...designs];
      updated[index] = { ...updated[index], dbId: data.id };
      setDesigns(updated);
      toast.success("Design saved to gallery!");
      fetchGallery();
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    }
  };

  const handleToggleFavorite = async (id: string) => {
    const item = gallery.find((g) => g.id === id);
    if (!item) return;
    const { error } = await supabase
      .from("fashion_designs")
      .update({ is_favorite: !item.is_favorite })
      .eq("id", id);
    if (!error) {
      setGallery((prev) => prev.map((g) => g.id === id ? { ...g, is_favorite: !g.is_favorite } : g));
      toast.success(item.is_favorite ? "Removed from favorites" : "Added to favorites ❤️");
    }
  };

  const handleTogglePublic = async (id: string) => {
    const item = gallery.find((g) => g.id === id);
    if (!item) return;
    const { error } = await supabase
      .from("fashion_designs")
      .update({ is_public: !item.is_public })
      .eq("id", id);
    if (!error) {
      setGallery((prev) => prev.map((g) => g.id === id ? { ...g, is_public: !g.is_public } : g));
      toast.success(item.is_public ? "Design made private" : "Design shared publicly! 🌍");
    }
  };

  const handleDeleteDesign = async (id: string) => {
    const { error } = await supabase.from("fashion_designs").delete().eq("id", id);
    if (!error) {
      setGallery((prev) => prev.filter((g) => g.id !== id));
      toast.success("Design deleted");
    }
  };

  const handleDownload = (url: string, type: string) => {
    const link = document.createElement("a");
    link.download = `luxor-design-${type.toLowerCase()}-${Date.now()}.png`;
    link.href = url;
    link.click();
    toast.success("Design downloaded!");
  };

  const handleCopyShareLink = (design: SavedDesign) => {
    const text = `Check out my AI-designed ${design.garment_type}: "${design.prompt}" ✨ Created with LUXOR`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = (design: SavedDesign) => {
    const text = `Check out my AI-designed ${design.garment_type}: "${design.prompt}" ✨ Created with LUXOR`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const inspirationPrompts = [
    "A structured blazer with asymmetric lapels and subtle texture",
    "A flowing evening gown with draped shoulders",
    "A minimalist oversized coat with clean lines",
    "A tailored jumpsuit with architectural details",
    "A deconstructed shirt with raw-edge details",
  ];

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

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

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 backdrop-blur-sm">
            <TabsTrigger value="create" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Wand2 className="w-4 h-4" /> Create
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" onClick={fetchGallery}>
              <History className="w-4 h-4" /> Gallery ({gallery.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
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
                  <PrivacyNotice />
                </CardContent>
              </Card>
            </div>

            {/* Generated Designs */}
            <AnimatePresence>
              {designs.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">New Designs</h2>
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
                            <img src={design.imageUrl} alt={design.prompt} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 gap-2">
                              <Button variant="secondary" size="sm" onClick={() => handleDownload(design.imageUrl, design.garmentType)}>
                                <Download className="w-3 h-3 mr-1" /> Download
                              </Button>
                              {!design.dbId && (
                                <Button variant="secondary" size="sm" onClick={() => handleSaveDesign(design, i)}>
                                  <Heart className="w-3 h-3 mr-1" /> Save
                                </Button>
                              )}
                              {design.dbId && (
                                <Badge variant="secondary" className="text-xs"><Check className="w-3 h-3 mr-1" /> Saved</Badge>
                              )}
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
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            {loadingGallery ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : gallery.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="p-12 text-center">
                  <ImageIcon className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground">No saved designs yet. Create and save your first design!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gallery.map((design, i) => (
                  <motion.div
                    key={design.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="glass-card overflow-hidden group">
                      <div className="relative aspect-square">
                        <img src={design.image_url} alt={design.prompt} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 gap-2">
                          <Button variant="secondary" size="sm" onClick={() => handleDownload(design.image_url, design.garment_type)}>
                            <Download className="w-3 h-3" />
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => setShareOpen(shareOpen === design.id ? null : design.id)}>
                            <Share2 className="w-3 h-3" />
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => handleDeleteDesign(design.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="absolute top-3 left-3 flex gap-2">
                          <Badge className="bg-black/60 text-white border-0">
                            <Shirt className="w-3 h-3 mr-1" /> {design.garment_type}
                          </Badge>
                        </div>
                        <div className="absolute top-3 right-3 flex gap-1">
                          <button
                            onClick={() => handleToggleFavorite(design.id)}
                            className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
                          >
                            <Heart className={`w-4 h-4 ${design.is_favorite ? "fill-red-500 text-red-500" : "text-white"}`} />
                          </button>
                          <button
                            onClick={() => handleTogglePublic(design.id)}
                            className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
                          >
                            <Eye className={`w-4 h-4 ${design.is_public ? "text-primary" : "text-white"}`} />
                          </button>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <p className="text-sm text-foreground line-clamp-2">{design.prompt}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] text-muted-foreground">{timeAgo(design.created_at)}</span>
                          {design.is_favorite && <Badge variant="outline" className="text-[10px] border-red-500/30 text-red-400">❤️ Favorite</Badge>}
                          {design.is_public && <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">🌍 Public</Badge>}
                        </div>

                        {/* Share dropdown */}
                        <AnimatePresence>
                          {shareOpen === design.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3 flex gap-2"
                            >
                              <Button variant="outline" size="sm" onClick={() => handleCopyShareLink(design)}>
                                {copied ? <Check className="w-3 h-3 mr-1" /> : <Link className="w-3 h-3 mr-1" />}
                                Copy
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleShareTwitter(design)}>
                                <Twitter className="w-3 h-3 mr-1" /> Tweet
                              </Button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
