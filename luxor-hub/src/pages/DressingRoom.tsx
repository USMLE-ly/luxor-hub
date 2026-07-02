import { useState, useEffect } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import FlipGallery, { type OutfitImages } from "@/components/ui/flip-gallery";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ProgressBar } from "@/components/ui/progress-bar";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const OCCASIONS = [
  { id: "casual", label: "Casual", emoji: "👕" },
  { id: "business", label: "Business", emoji: "💼" },
  { id: "party", label: "Party", emoji: "🎉" },
  { id: "date-night", label: "Date Night", emoji: "🌹" },
  { id: "sport", label: "Sport", emoji: "🏃" },
];

const OUTFIT_COUNT = 3;

export default function DressingRoomPage() {
  const { user } = useAuth();

  const [generatedImages, setGeneratedImages] = useState<OutfitImages[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [progressStage, setProgressStage] = useState("");
  const [showOccasionModal, setShowOccasionModal] = useState(false);
  const [showCountModal, setShowCountModal] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState("");

  /* ---------- Generate Outfit ---------- */
  const generateOutfits = async (occasion: string, count: number) => {
    if (!user) return;
    setIsGenerating(true);
    setProgressValue(10);
    setProgressStage("Consulting MiMo...");
    try {
      setProgressValue(40);
      setProgressStage(`Generating ${count} ${occasion} outfits...`);

      const api = import.meta.env.VITE_API_URL || import.meta.env.VITE_PUBLIC_API_URL || 
        (window.location.hostname === "localhost" ? "http://localhost:5000" : "");

      const res = await fetch(api + "/api/v1/generate-outfits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occasion, count }),
      });

      const data = await res.json();
      console.log("[DressingRoom] API RAW RESPONSE:", data);
      if (!data.success) throw new Error(data.error || "Generation failed");

      setProgressValue(80);
      setProgressStage("Ready!");

      if (data.images?.length > 0) {
        // Normalize data: if it's flat URLs, wrap into objects; otherwise use as-is
        const images = data.images || [];
        let normalized: OutfitImages[];
        if (images.length > 0 && typeof images[0] === 'string') {
          // Flat array of URLs — wrap into { top, mid, bottom } objects for the 3-split gallery
          normalized = images.map((url: string) => ({
            top: url, mid: url, bottom: url,
            type: 'regular' as const, accessory_note: '',
          }));
          console.log("[DressingRoom] Normalized flat URLs to OutfitImages:", normalized);
        } else {
          // Defensive: ensure all image keys exist, prevent null/undefined from reaching FlipGallery
          normalized = images.map((item: any) => ({
            top: item.top || '',
            mid: item.mid || '',
            bottom: item.bottom || '',
            type: item.type || 'regular',
            accessory_note: item.accessory_note || '',
          }));
        }
        setGeneratedImages(normalized);
        toast.success(`${data.images.length} outfits generated!`);
      } else {
        toast.error("No outfits returned. Try again.");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to generate outfits");
    } finally {
      setIsGenerating(false);
      setProgressValue(100);
    }
  };

  const handleGenerateClick = () => {
    setShowOccasionModal(true);
  };

  const handleOccasionSelect = (occasionId: string) => {
    setSelectedOccasion(occasionId);
    setShowOccasionModal(false);
    setShowCountModal(true);
  };

  const handleCountSelect = (count: number) => {
    setShowCountModal(false);
    generateOutfits(selectedOccasion, count);
  };

  const handleDismiss = () => {
    setGeneratedImages([] as OutfitImages[]);
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8 mx-auto max-w-7xl space-y-8 overflow-x-hidden">

        {/* ---- HEADER ---- */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl font-bold text-foreground">Your Dressing Room</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Browse your analyzed outfits. Generate new combinations from your closet.
          </p>
        </motion.div>

        {/* ---- FLIP GALLERY (No duplicate empty state below) ---- */}
        <div className="flex justify-center items-start pt-4">
          <FlipGallery
            outfits={generatedImages}
            onGenerate={handleGenerateClick}
            onDismiss={handleDismiss}
            isLoading={isGenerating}
          />
        </div>

        {/* ---- Accessory note ---- */}
        {generatedImages.length > 0 && generatedImages[0]?.accessory_note && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-sm mx-auto mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-center"
          >
            <p className="text-sm text-amber-300/90">{generatedImages[0].accessory_note}</p>
          </motion.div>
        )}

        {/* ---- Progress indicator ---- */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-sm mx-auto"
            >
              <ProgressBar value={progressValue} stage={progressStage} variant="purple" animated />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---- Occasion Modal ---- */}
        <AnimatePresence>
          {showOccasionModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setShowOccasionModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-zinc-900/95 border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-white mb-4">Pick an Occasion</h3>
                <div className="grid grid-cols-2 gap-3">
                  {OCCASIONS.map((occ) => (
                    <button
                      key={occ.id}
                      onClick={() => handleOccasionSelect(occ.id)}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all"
                    >
                      <span className="text-2xl">{occ.emoji}</span>
                      <span className="text-sm text-white/80">{occ.label}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowOccasionModal(false)}
                  className="w-full mt-4 py-2 text-sm text-white/50 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---- Count Modal ---- */}
        <AnimatePresence>
          {showCountModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setShowCountModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-zinc-900/95 border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-white mb-4">How many outfits?</h3>
                <p className="text-sm text-white/50 mb-4">Choose how many combinations to generate.</p>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleCountSelect(num)}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all"
                    >
                      <span className="text-2xl font-bold text-white">{num}</span>
                      <span className="text-xs text-white/60">Outfit{num > 1 ? 's' : ''}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowCountModal(false)}
                  className="w-full mt-4 py-2 text-sm text-white/50 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
