import { useState, useRef, useEffect } from "react";
import TierGate from "@/components/app/TierGate";
import { AppLayout } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Upload, Loader2, Sparkles, Camera, Download, ArrowRight, Image as ImageIcon, Shirt, X, Share2, Copy, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { RainbowButton } from "@/components/ui/rainbow-button";

interface SavedDesign {
  id: string;
  image_url: string;
  prompt: string;
  garment_type: string;
}

export default function VirtualTryOn() {
  return (
    <TierGate requiredTier="elite" featureName="Virtual Try-On">
      <VirtualTryOnInner />
    </TierGate>
  );
}

function VirtualTryOnInner() {
  const { user } = useAuth();
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userPhotoFile, setUserPhotoFile] = useState<File | null>(null);
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<SavedDesign | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [results, setResults] = useState<{ imageUrl: string; designPrompt: string; timestamp: number }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("fashion_designs")
        .select("id, image_url, prompt, garment_type")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setDesigns((data as SavedDesign[]) || []);
    })();
  }, [user]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Photo must be under 10MB"); return; }
    setUserPhotoFile(file);
    setResultImage(null);
    const reader = new FileReader();
    reader.onload = (ev) => setUserPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleTryOn = async () => {
    if (!userPhoto || !selectedDesign || !user) return;
    setIsProcessing(true);
    setResultImage(null);
    try {
      const { data, error } = await supabase.functions.invoke("virtual-tryon", {
        body: {
          userPhotoUrl: userPhoto,
          designImageUrl: selectedDesign.image_url,
          garmentType: selectedDesign.garment_type,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResultImage(data.resultImageUrl);
      setResults((prev) => [{
        imageUrl: data.resultImageUrl,
        designPrompt: selectedDesign.prompt,
        timestamp: Date.now(),
      }, ...prev]);
      toast.success("Virtual try-on complete! ✨");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Try-on failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (url: string) => {
    const link = document.createElement("a");
    link.download = `luxor-tryon-${Date.now()}.png`;
    link.href = url;
    link.click();
    toast.success("Image downloaded!");
  };

  const [shareLink, setShareLink] = useState<string | null>(null);
  const handleShare = async (imageUrl: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Virtual Try-On by LEXOR®",
          text: "Check out this virtual try-on!",
          url: imageUrl,
        });
      } else {
        await navigator.clipboard.writeText(imageUrl);
        setShareLink(imageUrl);
        toast.success("Link copied to clipboard! Share with friends for their vote ✨");
        setTimeout(() => setShareLink(null), 3000);
      }
    } catch {
      toast.error("Share failed");
    }
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative">
          <div className="absolute -top-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-[60px]" />
          <h1 className="font-display text-4xl font-bold text-foreground relative">
            Virtual <span className="gold-text">Try-On</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">See your AI-designed garments on you using AI image editing</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Step 1: Upload Photo */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">1</Badge> Your Photo
            </h3>
            <div className="relative rounded-[1.25rem] border-[0.75px] border-border p-2">
              <GlowingEffect spread={30} glow proximity={48} inactiveZone={0.01} borderWidth={2} />
              <Card className="glass-card border-0 shadow-none overflow-hidden">
                <CardContent className="p-0">
                  {userPhoto ? (
                    <div className="relative">
                      <img src={userPhoto} alt="Your photo" className="w-full aspect-[3/4] object-cover rounded-lg" />
                      <button
                        onClick={() => { setUserPhoto(null); setUserPhotoFile(null); setResultImage(null); }}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="aspect-[3/4] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-muted/20 transition-colors rounded-lg"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="w-10 h-10 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground text-center">Upload a full-body photo</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
          </div>

          {/* Step 2: Select Design */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">2</Badge> Select Design
            </h3>
            {designs.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="p-8 text-center">
                  <Shirt className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No saved designs yet. Create designs in the Fashion Designer first!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-[500px] overflow-y-auto pr-1">
                {designs.map((design) => (
                  <motion.div
                    key={design.id}
                    whileHover={{ scale: 1.02 }}
                    className={`relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                      selectedDesign?.id === design.id
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-transparent hover:border-border"
                    }`}
                    onClick={() => setSelectedDesign(design)}
                  >
                    <img src={design.image_url} alt={design.prompt} className="w-full aspect-square object-cover" />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-[10px] text-white line-clamp-1">{design.garment_type}</p>
                    </div>
                    {selectedDesign?.id === design.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Step 3: Result */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">3</Badge> Try-On Result
            </h3>

            <RainbowButton
              onClick={handleTryOn}
              disabled={!userPhoto || !selectedDesign || isProcessing}
              className="w-full mb-3"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              {isProcessing ? "Processing…" : "Try It On"}
            </RainbowButton>

            <Card className="glass-card overflow-hidden">
              <CardContent className="p-0">
                {isProcessing ? (
                  <div className="aspect-[3/4] flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">AI is dressing you…</p>
                  </div>
                ) : resultImage ? (
                  <div className="relative">
                    <img src={resultImage} alt="Try-on result" className="w-full aspect-[3/4] object-cover rounded-lg" />
                    <div className="absolute bottom-3 right-3 flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => handleShare(resultImage)}>
                        {shareLink === resultImage ? <Check className="w-3 h-3 mr-1" /> : <Share2 className="w-3 h-3 mr-1" />}
                        {shareLink === resultImage ? "Copied!" : "Share"}
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleDownload(resultImage)}>
                        <Download className="w-3 h-3 mr-1" /> Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[3/4] flex flex-col items-center justify-center gap-3">
                    <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground text-center">Upload a photo and select a design to begin</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Previous Results */}
        {results.length > 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Previous Try-Ons</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {results.slice(1).map((r) => (
                <motion.div
                  key={r.timestamp}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative rounded-lg overflow-hidden border border-border group cursor-pointer"
                  onClick={() => setResultImage(r.imageUrl)}
                >
                  <img src={r.imageUrl} alt="Try-on" className="w-full aspect-[3/4] object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); handleDownload(r.imageUrl); }}>
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
