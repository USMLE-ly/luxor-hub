import { useState } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import FlipGallery, { type OutfitImages } from "@/components/ui/flip-gallery";
import IPhoneMockup from "@/components/ui/iphone-mockup";
import { Perspective, Highlight } from "@/components/ui/perspective-highlight";
import { CircularProgress } from "@/components/ui/circular-progress";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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

export default function DressingRoomPage() {
  const { user } = useAuth();

  const [generatedImages, setGeneratedImages] = useState<OutfitImages[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeOutfit, setActiveOutfit] = useState<OutfitImages | null>(null);
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
        body: JSON.stringify({ occasion, count, user_id: user.id }),
      });

      const data = await res.json();
      console.log("[DressingRoom] API RAW RESPONSE:", data);
      if (!data.success) throw new Error(data.error || "Generation failed");

      setProgressValue(80);
      setProgressStage("Ready!");

      if (data.images?.length > 0) {
        const images = data.images || [];
        let normalized: OutfitImages[];
        if (images.length > 0 && typeof images[0] === 'string') {
          normalized = images.map((url: string) => ({
            top: url, mid: url, bottom: url,
            type: 'regular' as const, accessory_note: '', stylist_reasoning: [],
          }));
          console.log("[DressingRoom] Normalized flat URLs to OutfitImages:", normalized);
        } else {
          normalized = images.map((item: any) => ({
            top: item.top || '',
            mid: item.mid || '',
            bottom: item.bottom || '',
            type: item.type || 'regular',
            accessory_note: item.accessory_note || '',
            stylist_reasoning: item.stylist_reasoning || [],
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
    setActiveOutfit(null);
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

        {/* ---- IPHONE MOCKUP + FLIPGALLERY ---- */}
        <div className="flex justify-center items-start">
          <IPhoneMockup
            model="15-pro"
            color="golden-sands"
            screenBg="#0a0a0a"
            scale={0.85}
            showHomeIndicator={true}
            safeArea={true}
          >
            {isGenerating ? (
              <div className="flex items-center justify-center w-full h-full" style={{ minHeight: '300px' }}>
                <CircularProgress progress={progressValue} label={progressStage} />
              </div>
            ) : (
              <FlipGallery
                outfits={generatedImages}
                onGenerate={handleGenerateClick}
                onDismiss={handleDismiss}
                isLoading={isGenerating}
                onOutfitChange={setActiveOutfit}
              />
            )}
          </IPhoneMockup>
        </div>

        {/* ---- STYLIST NOTES & ACCESSORY NOTE ---- */}
        {activeOutfit && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-sm mx-auto space-y-4"
          >
            {activeOutfit.accessory_note && (
              <div className="bg-[#2a1f1a] border border-[#4a2f1a] text-amber-200/90 p-3 rounded-lg text-center text-sm">
                {activeOutfit.accessory_note}
              </div>
            )}

            {activeOutfit.stylist_reasoning && activeOutfit.stylist_reasoning.length > 0 && (
              <Perspective>
                <div className="p-6 rounded-lg bg-[#1F1F1F] border border-white/10">
                  <h4 className="text-sm font-semibold text-purple-400 mb-4 text-center">Stylist Notes</h4>
                  <div className="flex flex-col gap-3">
                    {activeOutfit.stylist_reasoning.map((note: string, i: number) => {
                      const colors: Array<'red' | 'purple' | 'green'> = ['purple', 'green', 'red', 'purple', 'green'];
                      return (
                        <p key={i} className="text-sm text-gray-300 leading-relaxed">
                          <Highlight color={colors[i % colors.length]}>{note}</Highlight>
                        </p>
                      );
                    })}
                  </div>
                </div>
              </Perspective>
            )}
          </motion.div>
        )}



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
