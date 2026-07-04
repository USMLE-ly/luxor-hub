import { useState, useEffect } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import FlipGallery, { type OutfitImages } from "@/components/ui/flip-gallery";
import IPhoneMockup from "@/components/ui/iphone-mockup";
import { Perspective, Highlight } from "@/components/ui/perspective-highlight";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { humanizeTextArray } from "@/lib/humanizer";

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
  const [displayProgress, setDisplayProgress] = useState(0);
  const [progressStage, setProgressStage] = useState("");
  const [showOccasionModal, setShowOccasionModal] = useState(false);
  const [showCountModal, setShowCountModal] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState("");

  /* ---------- Generate Outfit ---------- */
  const generateOutfits = async (occasion: string, count: number) => {
    if (!user) return;
    setIsGenerating(true);
    setDisplayProgress(0);
    setProgressStage("Consulting MiMo...");
    try {
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

      setDisplayProgress(95);
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
            stylist_reasoning: humanizeTextArray(item.stylist_reasoning || []),
          }));
        }
        setGeneratedImages(normalized);
        setDisplayProgress(100);
        toast.success(`${data.images.length} outfits generated!`);
      } else {
        toast.error("No outfits returned. Try again.");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to generate outfits");
    } finally {
      setIsGenerating(false);
      setProgressValue(100);
      setDisplayProgress(100);
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

  // ── Smooth auto-increment progress: 0 → 95% during generation, jumps to 100% on success ──
  useEffect(() => {
    if (!isGenerating) {
      setDisplayProgress(progressValue);
      return;
    }
    // Reset to 0 when generation starts
    setDisplayProgress(0);
    const timer = setInterval(() => {
      setDisplayProgress(prev => {
        // Slow down as we approach 95% — never reach it via timer alone
        if (prev >= 95) return 95;
        // Speed: fast at start, slow near cap
        const increment = prev < 30 ? 3 : prev < 60 ? 2 : prev < 80 ? 1.5 : 1;
        return Math.min(prev + increment, 95);
      });
    }, 200);
    return () => clearInterval(timer);
  }, [isGenerating]);

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
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.7)',
                zIndex: 50,
              }}>
                {/* Spinning halo ring — golden sand gradient */}
                <div style={{
                  position: 'relative',
                  width: '96px',
                  height: '96px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {/* Outer spinning ring — golden sand gradient */}
                  <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '4px solid rgba(255,255,255,0.06)',
                    borderTopColor: '#e5c785',
                    borderRightColor: '#d4b06a',
                  }}
                    className="animate-spin"
                  />
                  {/* Inner pulse glow */}
                  <div style={{
                    position: 'absolute',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(229, 199, 133, 0.15)',
                  }}
                    className="animate-pulse"
                  />
                  {/* Percentage text - smoothly animated */}
                  <span style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'rgba(229, 199, 133, 0.9)',
                    zIndex: 1,
                  }}>
                    {displayProgress}%
                  </span>
                </div>
                <p style={{
                  marginTop: '24px',
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.7)',
                  fontWeight: 500,
                  letterSpacing: '0.05em',
                  textAlign: 'center',
                  padding: '0 16px',
                }}>
                  {progressStage}
                </p>
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
                  {/* Important phrases as MarketingBadges-style pills */}
                                    {/* Inline phrase highlighting - only key fashion terms pop */}
                  <div className="flex flex-col gap-4">
                    {activeOutfit.stylist_reasoning.map((note: string, i: number) => {
                      const noteColors: Array<'purple' | 'green' | 'red'> = ['purple', 'green', 'red'];
                      const highlightColor = noteColors[i % noteColors.length];
                      
                      // Split note around key fashion terms, highlighting only those terms
                      const fashionTerms = [
                        'black','navy','cream','brown','white','gray','beige','olive',
                        'burgundy','camel','charcoal','taupe','ivory','khaki','rust','mauve',
                        'slate','ebony','mocha','terracotta','indigo','cobalt','emerald',
                        'silk','cotton','wool','linen','cashmere','denim','velvet','leather',
                        'suede','chiffon','tweed','lace','satin','jersey','flannel','corduroy',
                        'mesh','knit','woven','textured','ribbed',
                        'blazer','trousers','loafers','structured','oversized','tailored',
                        'A-line','wrap','pleated','crop','high-waisted','wide-leg','slim-fit',
                        'pumps','mules','sandals','heels','flats','sneakers','boots',
                        'blouse','cardigan','sweater','hoodie','jacket','coat','parka',
                        'skirt','dress','jumpsuit','romper','shorts','jeans','chinos',
                        'silhouette','texture','earthy','neutral','monochrome','layered',
                        'minimalist','polished','effortless','sophisticated','refined',
                        'versatile','timeless','classic','modern','edgy','chic',
                        'elegant','luxurious','cozy','relaxed','sharp','crisp',
                        'flattering','elongating','grounding','softening','balancing',
                      ];
                      
                      // Escape and build regex
                      const escaped = fashionTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
                      const pattern = new RegExp('(' + escaped.join('|') + ')', 'gi');
                      const parts = note.split(pattern);
                      
                      return (
                        <p key={i} className="text-sm text-gray-300 leading-relaxed">
                          {parts.map((part, pi) => {
                            const isKeyword = fashionTerms.some(t => t.toLowerCase() === part.toLowerCase());
                            if (isKeyword) {
                              return <Highlight key={pi} color={highlightColor}>{part}</Highlight>;
                            }
                            return part ? <span key={pi}>{part}</span> : null;
                          })}
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
                <Perspective maxRotateX={8} maxRotateY={16} smoothing={0.08}>
                  <div className="grid grid-cols-2 gap-3">
                    {OCCASIONS.map((occ, idx) => {
                      const occColors: Array<'red' | 'purple' | 'green'> = ['red', 'purple', 'green', 'purple', 'green'];
                      return (
                        <button
                          key={occ.id}
                          onClick={() => handleOccasionSelect(occ.id)}
                          className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all"
                        >
                          <span className="text-2xl">{occ.emoji}</span>
                          <span className="text-sm">
                            <Highlight color={occColors[idx % occColors.length]}>{occ.label}</Highlight>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </Perspective>
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
                <Perspective maxRotateX={8} maxRotateY={16} smoothing={0.08}>
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((num, idx) => {
                      const countColors: Array<'red' | 'purple' | 'green'> = ['red', 'purple', 'green'];
                      return (
                        <button
                          key={num}
                          onClick={() => handleCountSelect(num)}
                          className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all"
                        >
                          <span className="text-2xl font-bold">
                            <Highlight color={countColors[idx]}>{num}</Highlight>
                          </span>
                          <span className="text-xs text-white/60">Outfit{num > 1 ? 's' : ''}</span>
                        </button>
                      );
                    })}
                  </div>
                </Perspective>
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
