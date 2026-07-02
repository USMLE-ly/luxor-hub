import { useState, useEffect } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import FlipGallery from "@/components/ui/flip-gallery";
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

  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [progressStage, setProgressStage] = useState("");
  const [showOccasionModal, setShowOccasionModal] = useState(false);

  /* ---------- Generate Outfit ---------- */
  const generateOutfits = async (occasion: string, count: number) => {
    if (!user) return;
    setIsGenerating(true);
    setProgressValue(10);
    setProgressStage("Scanning your closet...");
    try {
      setProgressValue(30);
      setProgressStage(`Consulting MiMo for ${occasion} outfits...`);

      const { data: functionData, error } = await supabase.functions.invoke("generate-outfits", {
        body: {
          closetItems: [],
          occasion,
          mood: "confident",
          count: Math.min(count || OUTFIT_COUNT, 7),
        },
      });

      if (error) throw new Error(error.message);

      setProgressValue(70);
      setProgressStage("Assembling your looks...");

      if (functionData?.outfits?.length > 0) {
        // Pull saved analysis images as outfit visuals
        const { data: recentItems } = await supabase
          .from("outfit_analyses")
          .select("image_url")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(OUTFIT_COUNT);

        const images = (recentItems || []).map((i) => i.image_url).filter(Boolean);
        if (images.length > 0) {
          setGeneratedImages(images);
        }
        toast.success(`${functionData.outfits.length} outfits generated!`);
      } else {
        // Fallback: show recent analyses
        const { data: fallbackItems } = await supabase
          .from("outfit_analyses")
          .select("image_url")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(OUTFIT_COUNT);

        const fallbackImages = (fallbackItems || []).map((i) => i.image_url).filter(Boolean);
        if (fallbackImages.length > 0) {
          setGeneratedImages(fallbackImages);
          toast.success("Showing recent analyses");
        } else {
          toast.error("No outfits could be generated. Upload some clothes first!");
        }
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
    setShowOccasionModal(false);
    generateOutfits(occasionId, OUTFIT_COUNT);
  };

  const handleDismiss = () => {
    setGeneratedImages([]);
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
            images={generatedImages}
            onGenerate={handleGenerateClick}
            onDismiss={handleDismiss}
            isLoading={isGenerating}
          />
        </div>

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
      </div>
    </AppLayout>
  );
}
