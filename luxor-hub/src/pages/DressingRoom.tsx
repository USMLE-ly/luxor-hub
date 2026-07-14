import { useState, useEffect, useMemo } from "react";
import {
  useWardrobeStore,
  type Category,
} from "@/store/useWardrobeStore";
import { AppLayout } from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import FlipGallery, { type OutfitImages } from "@/components/ui/flip-gallery";
import { Perspective, Highlight } from "@/components/ui/perspective-highlight";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import {CalendarDots, Check} from "@phosphor-icons/react";
import { notifyEvent } from "@/lib/notificationService";
import { LiquidGlassCard } from "@/components/ui/liquid-notification";
import { supabase } from "@/integrations/supabase/client";
import { humanizeTextArray } from "@/lib/humanizer";
import { VerticalImageStack } from "@/components/ui/vertical-image-stack";
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

  const [generatedImages, setGeneratedImages] = useState<OutfitImages[]>([]);

  // ── Dynamic outfit stack from Zustand ──
  const catalogItems = useWardrobeStore((s) => s.catalogItems);
  const selected = useWardrobeStore((s) => s.selected);
  const toggleClothing = useWardrobeStore((s) => s.toggleClothing);
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
  const [showNotifications, setShowNotifications] = useState(false);

  /* ---------- Generate Outfit ---------- */
  const generateOutfits = async (occasion: string, count: number) => {
    if (!user) return;
    setIsGenerating(true);
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
      setProgressValue(100);
      setDisplayProgress(100);
    }
  };

  const handleGenerateClick = () => {
    setShowOccasionModal(true);
  };

  const handleOccasionSelect = (occasionId: string) => {
    setShowOccasionModal(false);
    // Directly generate up to 3 outfits — the API decides how many based on closet stock
    generateOutfits(occasionId, 3);
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

  
  // Send manually selected outfit to calendar
  const [manualOutfitItems, setManualOutfitItems] = useState<{ url: string; type: string; label: string; name?: string }[]>([]);

  const handleSendManualToCalendar = () => {
    if (selectedItems.length === 0) {
      toast.error("Select at least one item first");
      return;
    }
    const outfitItems = selectedItems
      .map((id) => {
        const item = catalogItems.find((c) => c.id === id);
        if (!item) return null;
        return { url: item.imageUrl || "/placeholder.svg", type: item.category, label: item.name || "Item", name: item.name };
      })
      .filter(Boolean) as { url: string; type: string; label: string; name?: string }[];

    if (outfitItems.length === 0) {
      toast.error("Selected items have no images");
      return;
    }

    setManualOutfitItems(outfitItems);
    setCalendarDate(new Date().toISOString().split("T")[0]);
    setCalendarEventTitle("");
    setShowCalendarModal(true);
  };

  const handlePostToCalendarFinal = async () => {
    if (!user || manualOutfitItems.length === 0 || !calendarDate) return;
    setPostingToCalendar(true);
    try {
      // Store ALL items as { photo_url, name, category } so the Calendar can resolve them
      const outfitItems = manualOutfitItems.map((item) => ({
        photo_url: item.url,
        name: item.name || item.label,
        category: item.type,
      }));

      const { error } = await supabase.from("calendar_events").insert({
        user_id: user.id,
        title: calendarEventTitle || "Dressing Room Outfit",
        event_date: calendarDate,
        occasion: "casual",
        outfit_items: outfitItems,
        notes: manualOutfitItems.map((i) => i.label).join(", "),
      });

      if (error) throw error;
      toast.success("Outfit added to calendar!");
      setShowCalendarModal(false);
      setCalendarDate("");
      setCalendarEventTitle("");
      setManualOutfitItems([]);
    } catch (e: any) {
      toast.error(e.message || "Failed to add to calendar");
    } finally {
      setPostingToCalendar(false);
    }
  };

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
                      <button onClick={handleSendManualToCalendar} disabled={selectedItems.length === 0} title="Send to Calendar" className="text-[10px] bg-amber-900/50 hover:bg-amber-800/50 px-2 py-1 rounded text-amber-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"><CalendarDots className="w-3 h-3" />Calendar</button>
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
                          {(item.imageUrl) ? (
                            <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                                draggable={false}
                              />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600 text-lg">
                              {item.category === "top" ? "👕" : item.category === "bottom" ? "👖" : "👟"}
                            </div>
                          )}
                          {selectedItems.includes(item.id) && (
                            <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-zinc-900">
                              <span className="text-[10px] text-white font-bold">✓</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {catalogItems.length === 0 && (
                      <p className="col-span-3 text-[10px] text-zinc-600 text-center py-4">No items in closet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* FRAME 2: AI GENERATE OUTFIT */}
            <div className="relative mx-auto w-full max-w-[320px] aspect-[9/19] rounded-[3rem] border-[6px] border-amber-200/80 bg-zinc-950 shadow-2xl p-2 overflow-hidden flex flex-col">
              <div className="flex-1 flex flex-col rounded-[2.75rem] bg-zinc-900 overflow-hidden">
                {isGenerating ? (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="relative w-16 h-16 mb-3">
                      <div className="absolute inset-0 rounded-full border-2 border-zinc-700" />
                      <div className="absolute inset-0 rounded-full border-2 border-amber-200 border-t-transparent animate-spin" />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-amber-200">{displayProgress}%</span>
                    </div>
                    <p className="text-xs text-zinc-400 text-center px-4">{progressStage}</p>
                  </div>
                ) : generatedImages.length > 0 ? (
                  <FlipGallery
                    outfits={generatedImages}
                    onGenerate={handleGenerateClick}
                    onDismiss={handleDismiss}
                    onAddToCalendar={(outfit) => {
                      if (outfit) {
                        // Convert OutfitImages to manualOutfitItems so handlePostToCalendarFinal can save them
                        const items: { url: string; type: string; label: string; name?: string }[] = [];
                        if (outfit.top) items.push({ url: outfit.top, type: "top", label: "Top", name: "Top" });
                        if (outfit.mid) items.push({ url: outfit.mid, type: "mid", label: "Mid", name: "Mid" });
                        if (outfit.bottom) items.push({ url: outfit.bottom, type: "bottom", label: "Bottom", name: "Bottom" });
                        setManualOutfitItems(items);
                        setCalendarDate(new Date().toISOString().split("T")[0]);
                        setCalendarEventTitle("");
                        setShowCalendarModal(true);
                      }
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
              {/* Generate Button — fixed at bottom */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center px-4 z-10">
                <button
                  onClick={handleGenerateClick}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#E8C87A] to-[#E8C87A]/80 text-zinc-900 text-sm font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Generate Outfit
                </button>
              </div>
            </div>

          </div>
        </div>

          {/* Three Bottom Notifications — Stylist Reasoning (below iPhone) */}
          <AnimatePresence>
            {showNotifications && activeOutfit && activeOutfit.stylist_reasoning && activeOutfit.stylist_reasoning.length > 0 && (
              <StaggerContainer staggerDelay={0.12} className="flex flex-col gap-2 w-full max-w-[340px]">
                {activeOutfit.stylist_reasoning.slice(0, 3).map((note: string, i: number) => (
                  <StaggerItem key={i}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7, y: [-30,-50,-70][i] }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ type: "spring", stiffness: 100, damping: 25 }}
                    className="flex justify-center origin-center"
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
                        <p className="text-sm text-foreground/90 leading-relaxed line-clamp-2">{note}</p>
                      </div>
                    </LiquidGlassCard>
                  </motion.div>
                  </StaggerItem>
                ))}

                {/* Accessory Note (if present) */}
                {activeOutfit.accessory_note && (
                  <StaggerItem>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7, y: -90 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ type: "spring", stiffness: 100, damping: 25 }}
                    className="flex justify-center origin-center"
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
                  </StaggerItem>
                )}
              </StaggerContainer>
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
              className="fixed inset-0 z-50 flex items-center justify-center bg-forest/60 backdrop-blur-sm"
              onClick={() => setShowCalendarModal(false)}
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
                      value={calendarEventTitle}
                      onChange={(e) => setCalendarEventTitle(e.target.value)}
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
                      value={calendarDate}
                      onChange={(e) => setCalendarDate(e.target.value)}
                      autoComplete="date"
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
                      onClick={handlePostToCalendarFinal}
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

        </div>
      </ScrollReveal>
    </AppLayout>
    </ErrorBoundary>
  );
}
