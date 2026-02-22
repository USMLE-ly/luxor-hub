import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Download, X, Twitter, Facebook, Link, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface OutfitShareData {
  name: string;
  description: string;
  items: string[];
  occasion?: string;
  mood?: string;
  confidence?: number;
  archetype?: string;
}

interface ShareCardProps {
  outfit: OutfitShareData;
  onClose: () => void;
}

export function ShareCard({ outfit, onClose }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const shareText = `Check out my outfit "${outfit.name}" styled by AURELIA AI! 🌟\n${outfit.items.join(" • ")}\n${outfit.description}`;
  const shareUrl = window.location.origin;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      // Use canvas to capture the card
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = 600;
      canvas.height = 400;

      // Draw gradient background
      const grad = ctx.createLinearGradient(0, 0, 600, 400);
      grad.addColorStop(0, "#1a1a2e");
      grad.addColorStop(1, "#16213e");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 600, 400);

      // Gold accent line
      const goldGrad = ctx.createLinearGradient(40, 40, 200, 40);
      goldGrad.addColorStop(0, "#C6A55C");
      goldGrad.addColorStop(1, "#E8D5A3");
      ctx.fillStyle = goldGrad;
      ctx.fillRect(40, 40, 80, 4);

      // Title
      ctx.fillStyle = "#E8D5A3";
      ctx.font = "bold 28px serif";
      ctx.fillText(outfit.name, 40, 90);

      // Description
      ctx.fillStyle = "#a0a0b0";
      ctx.font = "14px sans-serif";
      ctx.fillText(outfit.description.slice(0, 60), 40, 120);

      // Items
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px sans-serif";
      outfit.items.forEach((item, i) => {
        ctx.fillText(`• ${item}`, 50, 165 + i * 28);
      });

      // Confidence badge
      if (outfit.confidence) {
        ctx.fillStyle = "rgba(198, 165, 92, 0.2)";
        ctx.fillRect(440, 35, 120, 30);
        ctx.fillStyle = "#C6A55C";
        ctx.font = "bold 14px sans-serif";
        ctx.fillText(`${outfit.confidence}% match`, 455, 55);
      }

      // Branding
      ctx.fillStyle = "#C6A55C";
      ctx.font = "bold 18px serif";
      ctx.fillText("AURELIA", 40, 375);
      ctx.fillStyle = "#606070";
      ctx.font = "12px sans-serif";
      ctx.fillText("AI-Powered Style", 140, 375);

      // Download
      const link = document.createElement("a");
      link.download = `aurelia-${outfit.name.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Outfit card downloaded!");
    } catch (e) {
      toast.error("Failed to download card");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `AURELIA: ${outfit.name}`, text: shareText, url: shareUrl });
      } catch (e) {
        // User cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg"
      >
        {/* Preview Card */}
        <div ref={cardRef} className="rounded-2xl overflow-hidden mb-4" style={{
          background: "linear-gradient(135deg, #1a1a2e, #16213e)",
          padding: "2rem",
        }}>
          <div className="h-1 w-20 rounded-full mb-6" style={{
            background: "linear-gradient(90deg, #C6A55C, #E8D5A3)",
          }} />
          <h3 className="font-display text-2xl font-bold mb-1" style={{ color: "#E8D5A3" }}>
            {outfit.name}
          </h3>
          <p className="text-sm mb-6" style={{ color: "#a0a0b0" }}>{outfit.description}</p>

          <div className="flex flex-wrap gap-2 mb-6">
            {outfit.items.map((item, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full text-xs font-sans" style={{
                background: "rgba(255,255,255,0.08)",
                color: "#ffffff",
              }}>
                {item}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold" style={{ color: "#C6A55C" }}>AURELIA</span>
              <span className="text-xs" style={{ color: "#606070" }}>AI-Powered Style</span>
            </div>
            {outfit.confidence && (
              <span className="text-xs px-2 py-1 rounded-full" style={{
                background: "rgba(198, 165, 92, 0.2)",
                color: "#C6A55C",
              }}>
                {outfit.confidence}% match
              </span>
            )}
          </div>
        </div>

        {/* Share Actions */}
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-sans text-sm font-medium text-foreground">Share this outfit</h4>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <Button variant="outline" className="border-glass-border flex-col h-auto py-3" onClick={handleNativeShare}>
              <Share2 className="h-4 w-4 mb-1" />
              <span className="text-[10px]">Share</span>
            </Button>
            <Button variant="outline" className="border-glass-border flex-col h-auto py-3" onClick={handleShareTwitter}>
              <Twitter className="h-4 w-4 mb-1" />
              <span className="text-[10px]">X / Twitter</span>
            </Button>
            <Button variant="outline" className="border-glass-border flex-col h-auto py-3" onClick={handleDownload}>
              <Download className="h-4 w-4 mb-1" />
              <span className="text-[10px]">Download</span>
            </Button>
            <Button variant="outline" className="border-glass-border flex-col h-auto py-3" onClick={handleCopyLink}>
              {copied ? <Check className="h-4 w-4 mb-1 text-primary" /> : <Link className="h-4 w-4 mb-1" />}
              <span className="text-[10px]">{copied ? "Copied!" : "Copy"}</span>
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ShareButton({ outfit }: { outfit: OutfitShareData }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="text-muted-foreground hover:text-primary"
        title="Share outfit"
      >
        <Share2 className="h-4 w-4" />
      </Button>
      <AnimatePresence>
        {open && <ShareCard outfit={outfit} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
