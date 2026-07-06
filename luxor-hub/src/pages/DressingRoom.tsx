import { useState, useEffect } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import FlipGallery, { type OutfitImages } from "@/components/ui/flip-gallery";
import IPhoneMockup from "@/components/ui/iphone-mockup";
import { Perspective, Highlight } from "@/components/ui/perspective-highlight";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Check } from "lucide-react";
import { LiquidGlassCard } from "@/components/ui/liquid-notification";
import { supabase } from "@/integrations/supabase/client";
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
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarDate, setCalendarDate] = useState("");
  const [calendarEventTitle, setCalendarEventTitle] = useState("");
  const [postingToCalendar, setPostingToCalendar] = useState(false);
  const [showCountModal, setShowCountModal] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

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
      // Strip 'for' key from API response if present (causes ".for is not iterable" crash)
      if (data && typeof data === 'object') { delete (data as any).for; }
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
            stylist_reasoning: (() => { try { return humanizeTextArray(item.stylist_reasoning || []); } catch (e) { console.warn('[DR] humanizeTextArray error:', e); return item.stylist_reasoning || []; } })(),
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

  // Show notifications when outfit generation completes
  useEffect(() => {
    if (!isGenerating && activeOutfit && activeOutfit.stylist_reasoning?.length > 0) {
      setShowNotifications(true);
    }
    if (isGenerating) {
      setShowNotifications(false);
    }
  }, [isGenerating, activeOutfit]);

  
  const handlePostToCalendar = async () => {
    if (!user || !activeOutfit || !calendarDate) return;
    setPostingToCalendar(true);
    try {
      const outfitType = activeOutfit.type || 'regular';
      const outfitItems = [
        { url: activeOutfit.top, type: "top", label: "Top" },
        { url: activeOutfit.mid, type: "mid", label: "Mid" },
        { url: activeOutfit.bottom, type: "bottom", label: "Bottom" },
      ].filter(item => item.url);
      
      const { error } = await supabase.from("calendar_events").insert({
        user_id: user.id,
        title: calendarEventTitle || "Dressing Room Outfit",
        event_date: calendarDate,
        occasion: "casual",
        outfit_items: outfitItems,
        notes: activeOutfit.accessory_note || null,
      });
      
      if (error) throw error;
      toast.success("Outfit added to calendar!");
      setShowCalendarModal(false);
      setCalendarDate("");
      setCalendarEventTitle("");
    } catch (e: any) {
      toast.error(e.message || "Failed to add to calendar");
    } finally {
      setPostingToCalendar(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8 mx-auto max-w-5xl space-y-4 overflow-x-hidden pb-32">

        {/* ---- HEADER ---- */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl font-bold text-foreground">Your Dressing Room</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Browse your analyzed outfits. Generate new combinations from your closet.
          </p>
        </motion.div>

        {/* ---- IPHONE MOCKUP + NOTIFICATIONS ---- */}
        <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto gap-3">
          {/* Top Notification — Outfit Title (above iPhone) */}
          <AnimatePresence>
            {showNotifications && activeOutfit && activeOutfit.stylist_reasoning && activeOutfit.stylist_reasoning.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 80, damping: 15 }}
                className="w-full flex justify-center"
              >
                <LiquidGlassCard
                  width="320px"
                  height="64px"
                  borderRadius="20px"
                  blurIntensity="xl"
                  glowIntensity="sm"
                  shadowIntensity="md"
                  draggable={false}
                >
                  <div className="flex items-center px-5 py-3 h-full">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white/90 truncate">
                        {activeOutfit.stylist_reasoning[0]?.split(' ').slice(0, 6).join(' ') || 'Styled Look'}
                      </p>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">Ready to wear</p>
                    </div>

                  </div>
                </LiquidGlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* iPhone Mockup */}
          <div className="w-full max-w-[340px] mx-auto flex justify-center">
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
                <div style={{
                  position: 'relative',
                  width: '96px',
                  height: '96px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
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
                  <div style={{
                    position: 'absolute',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(229, 199, 133, 0.15)',
                  }}
                    className="animate-pulse"
                  />
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
                onAddToCalendar={(outfit) => {
                  if (outfit) {
                    setCalendarDate(new Date().toISOString().split("T")[0]);
                    setCalendarEventTitle("");
                    setShowCalendarModal(true);
                  }
                }}
                isLoading={isGenerating}
                onOutfitChange={setActiveOutfit}
              />
            )}
          </IPhoneMockup>
          </div>

          {/* Three Bottom Notifications — Stylist Reasoning (below iPhone) */}
          <AnimatePresence>
            {showNotifications && activeOutfit && activeOutfit.stylist_reasoning && activeOutfit.stylist_reasoning.length > 0 && (
              <div className="flex flex-col gap-2 w-full max-w-[340px]">
                {activeOutfit.stylist_reasoning.slice(0, 3).map((note: string, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ delay: 0.2 + i * 0.15, type: "spring", stiffness: 60, damping: 15 }}
                    className="flex justify-center"
                  >
                    <LiquidGlassCard
                      width="320px"
                      height="80px"
                      borderRadius="20px"
                      blurIntensity="xl"
                      glowIntensity="sm"
                      shadowIntensity="md"
                      draggable={true}
                      expandable={true}
                    >
                      <div className="flex flex-col justify-center px-5 py-3 h-full">
                        <p className="text-sm text-white/90 leading-relaxed line-clamp-2">{note}</p>
                      </div>
                    </LiquidGlassCard>
                  </motion.div>
                ))}

                {/* Accessory Note (if present) */}
                {activeOutfit.accessory_note && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ delay: 0.7, type: "spring", stiffness: 60, damping: 15 }}
                    className="flex justify-center"
                  >
                    <LiquidGlassCard
                      width="320px"
                      height="56px"
                      borderRadius="20px"
                      blurIntensity="xl"
                      glowIntensity="xs"
                      shadowIntensity="sm"
                      draggable={false}
                    >
                      <div className="flex items-center px-5 py-3 h-full">
                        <p className="text-xs text-amber-200/80 leading-relaxed">{activeOutfit.accessory_note}</p>
                      </div>
                    </LiquidGlassCard>
                  </motion.div>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>        {/* ---- Occasion Modal ---- */}
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
                      const occColors: Array<'red' | 'purple' | 'green'> = ['red', 'green', 'purple', 'blue', 'amber'];
                      
                      return (
                        <button
                          key={occ.id}
                          onClick={() => handleOccasionSelect(occ.id)}
                          className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/10 hover:border-amber-400/50 hover:bg-amber-400/10 transition-all"
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

        {/* ---- Calendar Date Picker Modal ---- */}
        <AnimatePresence>
          {showCalendarModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setShowCalendarModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-zinc-900/95 border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-amber-400" />
                  Add to Calendar
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-white/60 block mb-1.5">Event Title</label>
                    <input
                      type="text"
                      value={calendarEventTitle}
                      onChange={(e) => setCalendarEventTitle(e.target.value)}
                      placeholder="e.g., Casual Friday Outfit"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400/50 placeholder:text-white/30"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/60 block mb-1.5">Date</label>
                    <input
                      type="date"
                      value={calendarDate}
                      onChange={(e) => setCalendarDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400/50"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowCalendarModal(false)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePostToCalendar}
                      disabled={!calendarDate || postingToCalendar}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-900 font-semibold text-sm hover:scale-[1.02] transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {postingToCalendar ? (
                        <span className="inline-block w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      {postingToCalendar ? "Adding..." : "Add to Calendar"}
                    </button>
                  </div>
                </div>
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
                      const countColors: Array<'red' | 'purple' | 'green'> = ['amber', 'green', 'purple'];
                      
                      return (
                        <button
                          key={num}
                          onClick={() => handleCountSelect(num)}
                          className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/10 hover:border-amber-400/50 hover:bg-amber-400/10 transition-all"
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
