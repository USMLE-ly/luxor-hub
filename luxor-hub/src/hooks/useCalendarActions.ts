import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWardrobeStore } from "@/store/useWardrobeStore";

interface OutfitItem {
  url: string;
  type: string;
  label: string;
  name?: string;
}

export function useCalendarActions() {
  const { user } = useAuth();
  const catalogItems = useWardrobeStore((s) => s.catalogItems);
  const selectedItems = useWardrobeStore((s) => s.selectedItems);

  const [manualOutfitItems, setManualOutfitItems] = useState<OutfitItem[]>([]);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarDate, setCalendarDate] = useState("");
  const [calendarEventTitle, setCalendarEventTitle] = useState("");
  const [postingToCalendar, setPostingToCalendar] = useState(false);

  const openForManualSelection = (lastOccasion: string) => {
    if (selectedItems.length === 0) {
      toast.error("Select at least one item first");
      return;
    }
    const items = selectedItems
      .map((id) => {
        const item = catalogItems.find((c) => c.id === id);
        if (!item) return null;
        return { url: item.imageUrl || "/placeholder.svg", type: item.category, label: item.name || "Item", name: item.name };
      })
      .filter(Boolean) as OutfitItem[];

    if (items.length === 0) {
      toast.error("Selected items have no images");
      return;
    }

    setManualOutfitItems(items);
    setCalendarDate(new Date().toISOString().split("T")[0]);
    setCalendarEventTitle("");
    setShowCalendarModal(true);
  };

  const openForAiOutfit = (outfit: { top?: string; mid?: string; bottom?: string }, lastOccasion: string) => {
    const items: OutfitItem[] = [];
    if (outfit.top) items.push({ url: outfit.top, type: "top", label: "Top", name: "Top" });
    if (outfit.mid) items.push({ url: outfit.mid, type: "mid", label: "Mid", name: "Mid" });
    if (outfit.bottom) items.push({ url: outfit.bottom, type: "bottom", label: "Bottom", name: "Bottom" });
    setManualOutfitItems(items);
    setCalendarDate(new Date().toISOString().split("T")[0]);
    setCalendarEventTitle("");
    setShowCalendarModal(true);
  };

  const saveToCalendar = async (lastOccasion: string) => {
    if (!user || manualOutfitItems.length === 0 || !calendarDate) return;
    setPostingToCalendar(true);
    try {
      const outfitItems = manualOutfitItems.map((item) => ({
        photo_url: item.url,
        name: item.name || item.label,
        category: item.type,
      }));

      const { error } = await supabase.from("calendar_events").insert({
        user_id: user.id,
        title: calendarEventTitle || "Dressing Room Outfit",
        event_date: calendarDate,
        occasion: lastOccasion || "casual",
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

  const closeModal = () => {
    setShowCalendarModal(false);
    setCalendarDate("");
    setCalendarEventTitle("");
    setManualOutfitItems([]);
  };

  return {
    manualOutfitItems,
    showCalendarModal,
    calendarDate,
    setCalendarDate,
    calendarEventTitle,
    setCalendarEventTitle,
    postingToCalendar,
    openForManualSelection,
    openForAiOutfit,
    saveToCalendar,
    closeModal,
  };
}
