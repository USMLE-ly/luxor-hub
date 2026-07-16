import { getApiUrl } from "@/lib/api";
import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useWardrobeStore } from "@/store/useWardrobeStore";
import { AppLayout } from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import FlipGallery, { type OutfitImages } from "@/components/ui/flip-gallery";
import { Perspective, Highlight } from "@/components/ui/perspective-highlight";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import {CalendarDots, Check} from "@phosphor-icons/react";
import { notifyEvent } from "@/lib/notificationService";
import { supabase } from "@/integrations/supabase/client";
import { humanizeTextArray } from "@/lib/humanizer";
import { VerticalImageStack } from "@/components/ui/vertical-image-stack";
import { useCalendarActions } from "@/hooks/useCalendarActions";
import { ErrorBoundary } from "@/components/app/ErrorBoundary";

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
  const navigate = useNavigate();

  const [generatedImages, setGeneratedImages] = useState<OutfitImages[]>([]);

  // ── Dynamic outfit stack from Zustand ──
  const catalogItems = useWardrobeStore((s) => s.catalogItems);
  const clearOutfit = useWardrobeStore((s) => s.clearOutfit);
  const toggleSelectedItem = useWardrobeStore((s) => s.toggleSelectedItem);
  const selectedItems = useWardrobeStore((s) => s.selectedItems);
  const clearSelectedItems = useWardrobeStore((s) => s.clearSelectedItems);

  const currentStackImages = useMemo(() => {
    return selectedItems
      .map((id) => {
        const item = catalogItems.find((c) => c.id === id);
        if (!item) return null;
        return {
          id: item.id,
          src: item.imageUrl || "/placeholder.svg",
          name: item.name || "Unnamed",
        };
      })
      .filter(Boolean) as { id: string; src: string; name: string }[];
  }, [selectedItems, catalogItems]);

  // ── Sync catalog items on mount if store is empty (race condition fix) ──
  const syncCatalogItems = useWardrobeStore((s) => s.syncCatalogItems);
  const syncAttempted = useRef(false);
  useEffect(() => {
    if (syncAttempted.current) return;
    if (catalogItems.length > 0 || !user?.id) return;
    syncAttempted.current = true;
    const syncOnMount = async () => {
      try {
        const { data } = await supabase
          .from("clothing_items")
          .select("id, name, category, color, image_url")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (data && data.length > 0) {
          syncCatalogItems(data.map((item: { id: string; name: string | null; category: string | null; color: string | null; image_url: string | null }) => {
            const cat = (item.category || "").toLowerCase();
            const zustandCat = (["top","outerwear"].includes(cat) ? "top"
              : ["bottom","shoes"].includes(cat) ? "bottom"
              : "accessory") as "top" | "bottom" | "accessory";
            return {
              id: item.id,
              name: item.name || "Unnamed",
              src: item.image_url || "/placeholder.svg",
              category: zustandCat,
              rawCategory: item.category || undefined,
              imageUrl: item.image_url || undefined,
              color: item.color || undefined,
            };
          }));
        }
      } catch (e) {
        console.warn("[DressingRoom] Failed to sync catalog on mount:", e);
      }
    };
    syncOnMount();
  }, []); // one-time sync

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeOutfit, setActiveOutfit] = useState<OutfitImages | null>(null);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [progressStage, setProgressStage] = useState("");
  const [showOccasionModal, setShowOccasionModal] = useState(false);
  const [availableOutfitCount, setAvailableOutfitCount] = useState<number | null>(null);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastOccasion, setLastOccasion] = useState("");
  const cal = useCalendarActions();

  /* ---------- Generate Outfit ---------- */
  const generateOutfits = async (occasion: string, count: number) => {
    if (!user) return;
    setIsGenerating(true);
    setProgressStage("Consulting MiMo...");
    try {
      setProgressStage(`Generating ${count} ${occasion} outfits...`);

      const api = getApiUrl();
      const genUrl = api + "/api/v1/generate-outfits";
      console.log("[DR] Generating outfits:", genUrl, { occasion, count, user_id: user.id });
      const res = await fetch(genUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occasion, count, user_id: user.id }),
      });

      console.log("[DR] Generate response status:", res.status);
      const data = await res.json();
      console.log("[DR] Generate response:", data?.success, "images:", data?.images?.length);
      // Strip 'for' key from API response if present (causes ".for is not iterable" crash)
      if (data && typeof data === "object" && "for" in data) { delete data.for; }
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
        notifyEvent("outfit-generated");
      } else {
        toast.error("No outfits returned. Try again.");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to generate outfits");
    } finally {
      setIsGenerating(false);
      setDisplayProgress(100);
    }
  };

  const handleGenerateClick = () => {
    setShowOccasionModal(true);
  };

  const handleOccasionSelect = async (occasionId: string, event?: React.MouseEvent) => {
    // Prevent double-click / rapid re-trigger
    const btn = event?.currentTarget as HTMLElement;
    if (btn?.dataset?.clicked === "true") return;
    if (btn) btn.dataset.clicked = "true";
    
    setShowOccasionModal(false);
    setLastOccasion(occasionId);
    setIsLoadingAvailability(true);
    try {
      const api = getApiUrl();
      const currentCloset = useWardrobeStore.getState().catalogItems;
      // Send items with rawCategory as the backend "category" field so
      // the Python _cat() classifier can correctly detect shoes, dresses, etc.
      const itemsForBackend = currentCloset.map((item) => ({
        ...item,
        category: item.rawCategory || item.category,
      }));
      const fetchUrl = api + "/api/v1/check-availability";
      console.log("[DR] Fetching availability:", fetchUrl, "items:", itemsForBackend.length);
      const res = await fetch(fetchUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion: occasionId,
          user_id: user?.id,
          closetItems: itemsForBackend,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log("[DR] Availability response:", data);
      const count = data.maxOutfits || 0;
      if (count > 0) {
        setAvailableOutfitCount(Math.min(count, 5));
      } else {
        toast.info("No outfits available for this occasion. Try adding more clothes.");
      }
    } catch (e) {
      console.error("[DR] Availability check failed:", e);
      toast.error("Could not check availability. Try again.");
    } finally {
      setIsLoadingAvailability(false);
    }
  };



  const handleDismiss = () => {
    setGeneratedImages([] as OutfitImages[]);
    setActiveOutfit(null);
  };

  // ── Smooth auto-increment progress: 0 → 95% during generation, jumps to 100% on success ──
  useEffect(() => {
    if (!isGenerating) {
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

  



  return (
    <ErrorBoundary fallbackMessage="The Dressing Room hit an error. Try refreshing the page.">
    <AppLayout>
      <ScrollReveal delay={0.1}>
      <div className="p-4 md:p-8 mx-auto max-w-5xl space-y-4 overflow-x-hidden pb-32">

                {/* ---- DUAL PHONE FRAMES ---- */}
        <div className="container mx-auto px-4 py-6 space-y-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground">Your Dressing Room</h1>
            <p className="text-sm text-muted-foreground">Build outfits manually or let AI generate new combinations.</p>
          </div>

          {/* Two Phone Frames Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">

            {/* FRAME 1: MANUAL OUTFIT BUILDER (INSTAGRAM STYLE) */}
            <div className="relative mx-auto w-full max-w-[320px] aspect-[9/19] rounded-[3rem] border-[6px] border-amber-200/80 bg-zinc-950 shadow-2xl p-2 overflow-hidden">
              <div className="flex flex-col h-full w-full rounded-[2.75rem] bg-zinc-900 overflow-hidden">
                {/* TOP HALF: Vertical Image Stack (Preview) */}
                <div className="flex-1 w-full relative overflow-hidden border-b border-zinc-800/50">
                  <VerticalImageStack images={currentStackImages} />
                </div>
                {/* BOTTOM HALF: Gallery Picker */}
                <div className="h-[45%] bg-zinc-900 p-3 flex flex-col gap-2 overflow-hidden">
                  <div className="flex justify-between items-center shrink-0">
                    <span className="text-xs font-medium text-zinc-400">Select from Closet</span>
                    <div className="flex gap-1">
                      <button onClick={() => cal.openForManualSelection(lastOccasion)} disabled={selectedItems.length === 0} title="Send to Calendar" className="text-[10px] bg-amber-900/50 hover:bg-amber-800/50 px-2 py-1 rounded text-amber-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"><CalendarDots className="w-3 h-3" />Calendar</button>
                      <button onClick={() => { clearSelectedItems(); clearOutfit(); }} className="text-[10px] bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded text-zinc-300 transition-colors">Clear</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 overflow-y-auto flex-1 content-start pr-1 custom-scrollbar">
                    {catalogItems.map((item) => {
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleSelectedItem(item.id)}
                          className="relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-zinc-800 hover:ring-2 hover:ring-zinc-500 transition-all"
                        >
                          <img
                            src={item.imageUrl || ""}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.style.display = "none";
                              const fallback = img.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = "flex";
                            }}
                            draggable={false}
                          />
                          <div className="w-full h-full items-center justify-center text-zinc-600 text-lg hidden">
                            {(() => {
                                const rc = (item.rawCategory || item.category || "").toLowerCase();
                                if (["shoes","sneakers","boots","sandals","heels","flats","footwear"].some(k => rc.includes(k))) return "👟";
                                if (["dress","gown","jumpsuit","romper"].some(k => rc.includes(k))) return "👗";
                                if (["bag","purse","belt","hat","scarf","jewelry","watch","sunglasses","accessory"].some(k => rc.includes(k))) return "👜";
                                if (item.category === "top") return "👕";
                                if (item.category === "bottom") return "👖";
                                return "👕";
                              })()}
                          </div>
                          {selectedItems.includes(item.id) && (
                            <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-zinc-900">
                              <span className="text-[10px] text-white font-bold">✓</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {catalogItems.length === 0 && user && (
                      <>
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="aspect-square rounded-xl bg-zinc-800/50 animate-pulse" />
                        ))}
                      </>
                    )}
                    {catalogItems.length === 0 && !user && (
                      <div className="col-span-3 flex flex-col items-center gap-2 py-4">
                        <p className="text-[10px] text-zinc-600 text-center">Sign in to see your closet</p>
                        <button onClick={() => navigate("/auth")} className="text-[10px] px-3 py-1 rounded-full bg-amber-900/50 text-amber-300 hover:bg-amber-800/50 transition-colors">
                          Sign In
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* FRAME 2: AI GENERATE OUTFIT */}
            <div className="flex flex-col items-center">
              {/* Occasion Header Badge */}
              {(isGenerating || generatedImages.length > 0) && (
                <div className="px-4 py-1.5 rounded-full bg-zinc-800/50 backdrop-blur-md border border-zinc-700/30 text-[11px] text-zinc-400 shadow-lg flex items-center gap-2 mb-3">
                  <span className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                  <span>{isGenerating ? 'Generating' : 'Wearing'}: <b className="text-white capitalize">{lastOccasion || "Casual"}</b></span>
                </div>
              )}
            <div className="relative mx-auto w-full max-w-[320px] aspect-[9/19] rounded-[3rem] border-[6px] border-amber-200/80 bg-zinc-950 shadow-2xl p-2 overflow-hidden flex flex-col">
              <div className="flex-1 flex flex-col rounded-[2.75rem] bg-zinc-900 overflow-hidden">
                {isGenerating ? (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="relative w-20 h-20 mb-3">
                      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="34" fill="none" stroke="rgb(63,63,70)" strokeWidth="4" />
                        <circle
                          cx="40" cy="40" r="34" fill="none"
                          stroke="rgb(232,200,122)"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 34}`}
                          strokeDashoffset={`${2 * Math.PI * 34 * (1 - displayProgress / 100)}`}
                          style={{ transition: "stroke-dashoffset 0.3s ease" }}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-amber-200">{displayProgress}%</span>
                    </div>
                    <p className="text-xs text-zinc-400 text-center px-4">{progressStage}</p>
                  </div>
                ) : generatedImages.length > 0 ? (
                  <FlipGallery
                    outfits={generatedImages}
                    onGenerate={handleGenerateClick}
                    onDismiss={handleDismiss}
                    onAddToCalendar={(outfit) => {
                      if (outfit) cal.openForAiOutfit(outfit, lastOccasion);
                    }}
                    isLoading={isGenerating}
                    onOutfitChange={setActiveOutfit}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center text-zinc-600 text-xs text-center px-4">
                    Select items in the left frame, then generate.
                  </div>
                )}
              </div>
              {/* Buttons — fixed at bottom, side by side */}
              <div className="absolute bottom-6 left-4 right-4 z-50 flex flex-row gap-3">
                <button
                  onClick={handleGenerateClick}
                  disabled={isGenerating}
                  className="flex-1 py-3.5 rounded-full bg-gradient-to-r from-[#E8C87A] to-[#E8C87A]/80 text-zinc-900 text-sm font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-40"
                >
                  Generate
                </button>
                <button
                  onClick={handleDismiss}
                  disabled={isGenerating}
                  className="flex-1 py-3.5 rounded-full bg-zinc-700/80 backdrop-blur-sm text-zinc-300 text-sm font-medium border border-zinc-600/50 hover:bg-zinc-600/80 transition-all disabled:opacity-40"
                >
                  Dismiss
                </button>
              </div>
            </div>
            </div>

          </div>
        </div>

          {/* Three Bottom Notifications — Stylist Reasoning (below iPhone) */}
          <AnimatePresence>
            {showNotifications && activeOutfit && activeOutfit.stylist_reasoning && activeOutfit.stylist_reasoning.length > 0 && (
              <div className="flex flex-col items-center w-full max-w-[320px] mx-auto mt-4">
                <motion.div
                  className="flex flex-col gap-3 max-h-[220px] overflow-y-auto w-full px-1 py-1 custom-scrollbar"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.1 }
                    }
                  }}
                >
                  {activeOutfit.stylist_reasoning.slice(0, 3).map((note: string, i: number) => (
                    <motion.div
                      key={i}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 24 }}
                      className="w-full p-4 rounded-2xl bg-zinc-800/40 backdrop-blur-md border border-zinc-700/30 shadow-lg text-zinc-300 text-sm relative transition-all"
                    >
                      <div className="absolute left-0 top-3 bottom-3 w-1 bg-gradient-to-b from-[#E8C87A] to-amber-600 rounded-full" />
                      <p className="pl-2">{note}</p>
                    </motion.div>
                  ))}
                  {activeOutfit.accessory_note && (
                    <motion.div
                      key="accessory"
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 24 }}
                      className="w-full p-3 rounded-2xl bg-zinc-800/30 backdrop-blur-md border border-amber-800/30 shadow-md relative transition-all"
                    >
                      <div className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full" />
                      <p className="pl-2 text-xs text-amber-200/80 leading-relaxed">{activeOutfit.accessory_note}</p>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        {/* ---- Occasion Modal ---- */}
        <AnimatePresence>
          {showOccasionModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-forest/60 backdrop-blur-sm"
              onClick={() => setShowOccasionModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-emerald/95 border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-white mb-4">Pick an Occasion</h3>
                <Perspective maxRotateX={8} maxRotateY={16} smoothing={0.08}>
                  <div className="grid grid-cols-2 gap-3">
                    {OCCASIONS.map((occ, idx) => {
                      const occColors: Array<'red' | 'purple' | 'green'> = ['red', 'green', 'purple', 'red', 'green'];
                      
                      return (
                        <button
                          key={occ.id}
                          onClick={(e) => handleOccasionSelect(occ.id, e)}
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

        {/* ---- Availability Chooser Modal ---- */}
        <AnimatePresence>
          {availableOutfitCount !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setAvailableOutfitCount(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-zinc-800 border border-zinc-700/50 rounded-2xl p-6 max-w-[300px] w-full mx-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-white text-center font-medium mb-1">Available Outfits</h3>
                <p className="text-zinc-400 text-center text-sm mb-4">
                  We found <span className="text-amber-400 font-semibold">{availableOutfitCount}</span> outfit{availableOutfitCount !== 1 ? "s" : ""} for this occasion. How many do you want?
                </p>
                <div className="flex justify-center gap-3">
                  {Array.from({ length: availableOutfitCount }, (_, i) => i + 1).map((count) => (
                    <button
                      key={count}
                      onClick={() => {
                        generateOutfits(lastOccasion, count);
                        setAvailableOutfitCount(null);
                      }}
                      className="w-12 h-12 rounded-full bg-gradient-to-r from-[#E8C87A]/20 to-amber-500/20 border border-amber-400/30 hover:border-amber-400/60 hover:bg-amber-400/20 text-amber-300 text-sm font-medium transition-all"
                    >
                      {count}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setAvailableOutfitCount(null)}
                  className="w-full mt-4 py-2 text-zinc-500 text-xs hover:text-zinc-300 transition-colors"
                >
                  Cancel
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---- Loading Availability Indicator ---- */}
        <AnimatePresence>
          {isLoadingAvailability && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-zinc-800 border border-zinc-700/50 rounded-2xl p-6 max-w-[260px] w-full mx-4 shadow-2xl text-center"
              >
                <div className="w-10 h-10 mx-auto mb-3 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
                <p className="text-zinc-300 text-sm">Analyzing your closet...</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---- Calendar Date Picker Modal ---- */}
        <AnimatePresence>
          {cal.showCalendarModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-forest/60 backdrop-blur-sm"
              onClick={() => cal.closeModal()}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-emerald/95 border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <CalendarDots className="w-5 h-5 text-amber-400" />
                  Add to Calendar
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="calendarEventTitle" className="text-sm text-white/60 block mb-1.5">Event Title</label>
                    <input
                      type="text"
                      id="calendarEventTitle"
                      name="calendarEventTitle"
                      value={cal.calendarEventTitle}
                      onChange={(e) => cal.setCalendarEventTitle(e.target.value)}
                      placeholder="e.g., Casual Friday Outfit"
                      autoComplete="off"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400/50 placeholder:text-white/30"
                    />
                  </div>
                  <div>
                    <label htmlFor="calendarDate" className="text-sm text-white/60 block mb-1.5">Date</label>
                    <input
                      type="date"
                      id="calendarDate"
                      name="calendarDate"
                      value={cal.calendarDate}
                      onChange={(e) => cal.setCalendarDate(e.target.value)}
                      autoComplete="date"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400/50"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => cal.closeModal()}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => cal.saveToCalendar(lastOccasion)}
                      disabled={!cal.calendarDate || cal.postingToCalendar}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-900 font-semibold text-sm hover:scale-[1.02] transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {cal.postingToCalendar ? (
                        <span className="inline-block w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      {cal.postingToCalendar ? "Adding..." : "Add to Calendar"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        </div>
      </ScrollReveal>
    </AppLayout>
    </ErrorBoundary>
  );
}
