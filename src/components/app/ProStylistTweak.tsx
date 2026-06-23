import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import {
  Sparkles, Loader2, AlertTriangle, ArrowLeftRight, Eye, RefreshCw, ImageIcon
} from "lucide-react";
import { toast } from "sonner";

interface ProStylistTweakProps {
  imagePreview: string | null;
  imageUrl: string | null;
}

interface TweakResult {
  tweaked_image_url: string;
  suggestion: string;
  source: string;
  generation_prompt: string;
}

export function ProStylistTweak({ imagePreview, imageUrl }: ProStylistTweakProps) {
  const [tweakResult, setTweakResult] = useState<TweakResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imageSrc = imagePreview || imageUrl;

  const handleGenerateTweak = async () => {
    if (!imageSrc) {
      toast.error("Upload an image first");
      return;
    }
    setIsGenerating(true);
    setError(null);
    setTweakResult(null);

    try {
      // Convert image to base64
      let base64Image: string;
      if (imageSrc.startsWith("data:")) {
        base64Image = imageSrc.split(",")[1];
      } else if (imageSrc.startsWith("http")) {
        // Fetch remote image and convert to base64
        const resp = await fetch(imageSrc);
        const blob = await resp.blob();
        base64Image = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
          reader.readAsDataURL(blob);
        });
      } else {
        base64Image = imageSrc;
      }

      const apiUrl = import.meta.env.VITE_PUBLIC_API_URL || "https://python--libyausmle.replit.app";
      const resp = await fetch(`${apiUrl}/api/v1/pro-tweak/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_b64: base64Image }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${resp.status}`);
      }

      const data = await resp.json();
      setTweakResult({
        tweaked_image_url: data.tweaked_image_url,
        suggestion: data.suggestion || "",
        source: data.source || "unknown",
        generation_prompt: data.generation_prompt || "",
      });
      toast.success("✨ Pro Stylist Tweak generated!");
    } catch (err: any) {
      const msg = err.message || "Failed to generate tweak";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <div className="relative rounded-[1.5rem] border-[0.75px] border-border p-3">
        <GlowingEffect spread={50} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
        <Card className="glass-card overflow-hidden border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="font-display flex items-center gap-2 text-foreground text-lg">
              <div className="w-0.5 h-5 gold-gradient rounded-full mr-1" />
              <Sparkles className="w-5 h-5 text-primary" /> Pro Stylist Tweak
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Let the AI fashion deity reimagine your outfit with a divine upgrade.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Generate Button */}
            {!tweakResult && !isGenerating && !error && (
              <div className="text-center py-6">
                {imageSrc ? (
                  <Button
                    onClick={handleGenerateTweak}
                    className="gold-gradient text-primary-foreground font-sans px-8 py-3 text-base"
                  >
                    <Sparkles className="h-5 w-5 mr-2" /> Generate Divine Tweak
                  </Button>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <ImageIcon className="w-12 h-12" />
                    <p className="text-sm">Upload an outfit photo in the Analyze tab first</p>
                  </div>
                )}
              </div>
            )}

            {/* Loading */}
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-10 space-y-4"
              >
                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                <p className="font-display text-base text-foreground">Consulting the cosmic style deities...</p>
                <p className="text-sm text-muted-foreground">Generating your AI-enhanced look</p>
                <div className="max-w-xs mx-auto space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-2 rounded-full bg-muted animate-pulse" style={{ width: `${100 - i * 20}%`, animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Error */}
            {error && !isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-6 space-y-3"
              >
                <AlertTriangle className="h-8 w-8 text-destructive mx-auto" />
                <p className="text-sm text-destructive">{error}</p>
                <Button variant="outline" onClick={handleGenerateTweak}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Try Again
                </Button>
              </motion.div>
            )}

            {/* Result: Side-by-Side */}
            {tweakResult && !isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Side-by-Side Images */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> Original
                    </p>
                    <div className="rounded-2xl overflow-hidden border border-border shadow-lg bg-muted/20 aspect-[3/4]">
                      {imageSrc ? (
                        <img src={imageSrc} alt="Original outfit" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                          No image
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary" /> AI-Enhanced
                    </p>
                    <div className="rounded-2xl overflow-hidden border border-border shadow-lg bg-muted/20 aspect-[3/4]">
                      <img
                        src={tweakResult.tweaked_image_url}
                        alt="AI-enhanced outfit"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'><rect fill='%231a1a2e' width='400' height='600'/><text fill='%23666' font-family='sans-serif' font-size='14' x='100' y='300'>AI image unavailable</text></svg>";
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Suggestion */}
                {tweakResult.suggestion && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Stylist's Verdict</p>
                      <p className="text-sm text-muted-foreground mt-1">{tweakResult.suggestion}</p>
                    </div>
                  </div>
                )}

                {/* Source Badge */}
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">
                    Source: {tweakResult.source === "cipher_vision" ? "✨ Cipher Vision AI" : "📊 Local Stylist"}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleGenerateTweak}
                    className="border-primary/30 hover:bg-primary/10"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" /> Regenerate
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
