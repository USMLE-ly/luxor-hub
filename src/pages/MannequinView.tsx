import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/app/AppLayout";
import Mannequin3D, { type ClothingItem } from "@/components/app/Mannequin3D";
import { Button } from "@/components/ui/button";
import { CalendarWidget } from "@/components/app/CalendarWidget";
import { ArrowLeft, Plus, X, CalendarDays, Shirt, Save } from "lucide-react";
import { toast } from "sonner";

const MannequinView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gender, setGender] = useState<"male" | "female">("male");
  const [clothing, setClothing] = useState<ClothingItem[]>([]);
  const [closetItems, setClosetItems] = useState<any[]>([]);
  const [showCloset, setShowCloset] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [styleRes, closetRes] = await Promise.all([
        supabase.from("style_profiles").select("preferences").eq("user_id", user.id).single(),
        supabase.from("clothing_items").select("*").eq("user_id", user.id).limit(50),
      ]);
      const prefs = (styleRes.data?.preferences as any) || {};
      if (prefs.gender === "female") setGender("female");
      if (closetRes.data) setClosetItems(closetRes.data);
    };
    fetchData();
  }, [user]);

  const addItem = (item: any) => {
    const mapped: ClothingItem = {
      category: item.category || "tops",
      color: item.color || "navy",
      name: item.name || item.category,
      imageUrl: item.photo_url,
    };
    setClothing((prev) => [...prev, mapped]);
    setShowCloset(false);
  };

  const removeItem = (index: number) => {
    setClothing((prev) => prev.filter((_, i) => i !== index));
  };

  const saveToCalendar = async (date: string) => {
    if (!user) return;
    const { error } = await supabase.from("calendar_events").insert({
      user_id: user.id,
      title: `Outfit: ${clothing.map((c) => c.name).join(", ")}`,
      event_date: date,
      occasion: "Planned Outfit",
      notes: `Mannequin outfit with ${clothing.length} items`,
      outfit_items: clothing as any,
    });
    if (error) {
      toast.error("Failed to save to calendar");
    } else {
      toast.success("Outfit saved to calendar!");
      setShowCalendar(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-56px)]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-display text-lg font-bold text-foreground">Style Mannequin</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCalendar(true)}
              className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
            >
              <CalendarDays className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </div>

        {/* 3D Mannequin */}
        <div className="flex-1 relative bg-gradient-to-b from-secondary/20 to-background">
          <Mannequin3D gender={gender} clothing={clothing} className="w-full h-full" />

          {/* Gender toggle */}
          <div className="absolute top-3 left-3 flex gap-1 bg-background/80 backdrop-blur rounded-full p-1">
            {(["male", "female"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`px-3 py-1 rounded-full text-xs font-sans font-medium transition-colors ${
                  gender === g
                    ? "bg-foreground text-background"
                    : "text-muted-foreground"
                }`}
              >
                {g === "male" ? "♂ Male" : "♀ Female"}
              </button>
            ))}
          </div>
        </div>

        {/* Clothing strip */}
        <div className="px-4 py-3 border-t border-border">
          <div className="flex items-center gap-2 mb-2">
            <Shirt className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-sans font-semibold text-foreground">
              Items ({clothing.length})
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {clothing.map((item, i) => (
              <div
                key={i}
                className="relative flex-shrink-0 w-14 h-14 rounded-lg bg-secondary flex items-center justify-center"
              >
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: item.color || "#6b7b8d" }}
                />
                <button
                  onClick={() => removeItem(i)}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive flex items-center justify-center"
                >
                  <X className="w-2.5 h-2.5 text-destructive-foreground" />
                </button>
                <span className="absolute bottom-0.5 text-[8px] font-sans text-muted-foreground truncate w-full text-center px-0.5">
                  {item.name}
                </span>
              </div>
            ))}
            <button
              onClick={() => setShowCloset(true)}
              className="flex-shrink-0 w-14 h-14 rounded-lg border-2 border-dashed border-border flex items-center justify-center hover:border-foreground transition-colors"
            >
              <Plus className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Closet picker */}
        <AnimatePresence>
          {showCloset && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed inset-x-0 bottom-0 z-50 bg-background rounded-t-2xl border-t border-border max-h-[60vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-background">
                <h3 className="font-display text-base font-bold text-foreground">Add from Closet</h3>
                <button onClick={() => setShowCloset(false)}>
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              {closetItems.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground text-sm font-sans">No items in your closet yet.</p>
                  <Button onClick={() => navigate("/closet")} size="sm" className="mt-3 rounded-full">
                    Go to Closet
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 p-4">
                  {closetItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => addItem(item)}
                      className="rounded-xl bg-secondary p-2 text-center hover:bg-secondary/80 transition-colors"
                    >
                      {item.photo_url ? (
                        <img src={item.photo_url} alt={item.name} className="w-full aspect-square rounded-lg object-cover mb-1" />
                      ) : (
                        <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center mb-1">
                          <Shirt className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <p className="text-[10px] font-sans text-foreground truncate">{item.name || item.category}</p>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Calendar modal */}
        <AnimatePresence>
          {showCalendar && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 flex items-end"
              onClick={() => setShowCalendar(false)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25 }}
                className="w-full bg-background rounded-t-2xl p-5"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="font-display text-lg font-bold text-foreground mb-3">Post to Calendar</h3>
                <p className="text-sm text-muted-foreground font-sans mb-4">
                  Pick a date to save this outfit ({clothing.length} items)
                </p>
                <div className="flex gap-2 overflow-x-auto pb-4">
                  {Array.from({ length: 7 }, (_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() + i);
                    const dateStr = d.toISOString().split("T")[0];
                    const dayName = d.toLocaleDateString("en", { weekday: "short" });
                    const dayNum = d.getDate();
                    return (
                      <button
                        key={dateStr}
                        onClick={() => saveToCalendar(dateStr)}
                        className="flex-shrink-0 w-16 py-3 rounded-xl bg-secondary hover:bg-primary/20 transition-colors text-center"
                      >
                        <p className="text-[10px] text-muted-foreground font-sans">{dayName}</p>
                        <p className="text-lg font-bold text-foreground">{dayNum}</p>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default MannequinView;
