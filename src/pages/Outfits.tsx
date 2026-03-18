import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Wand2, Loader2, Heart, Sparkles, Shirt, CalendarPlus, CalendarDays, Layers, X } from "lucide-react";
import { ShareButton } from "@/components/app/ShareCard";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface OutfitSuggestion {
  name: string;
  description: string;
  items: string[];
  explanation: string;
  confidence: number;
}

const occasions = ["everyday", "work", "date night", "party", "formal", "travel", "athletic"];
const moods = ["confident", "relaxed", "bold", "elegant", "creative", "cozy"];

const Outfits = () => {
  const { user } = useAuth();
  const [closetItems, setClosetItems] = useState<any[]>([]);
  const [styleProfile, setStyleProfile] = useState<any>(null);
  const [occasion, setOccasion] = useState("everyday");
  const [mood, setMood] = useState("confident");
  const [outfits, setOutfits] = useState<OutfitSuggestion[]>([]);
  const [generating, setGenerating] = useState(false);
  const [savedOutfits, setSavedOutfits] = useState<any[]>([]);
  const [scheduleOutfit, setScheduleOutfit] = useState<OutfitSuggestion | null>(null);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>();
  const [scheduleNotes, setScheduleNotes] = useState("");
  const [flatLayOutfit, setFlatLayOutfit] = useState<OutfitSuggestion | null>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("clothing_items").select("*").eq("user_id", user.id),
      supabase.from("style_profiles").select("archetype, preferences").eq("user_id", user.id).single(),
      supabase.from("outfits").select("*, outfit_items(clothing_item_id)").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]).then(([itemsRes, styleRes, outfitsRes]) => {
      if (itemsRes.data) setClosetItems(itemsRes.data);
      if (styleRes.data) setStyleProfile(styleRes.data);
      if (outfitsRes.data) setSavedOutfits(outfitsRes.data);
    });
  }, [user]);

  const generate = async () => {
    if (closetItems.length < 2) {
      toast.error("Add at least 2 items to your closet first");
      return;
    }
    setGenerating(true);
    try {
      let upcomingEvents: any[] = [];
      if (user) {
        const today = new Date().toISOString().split("T")[0];
        const { data: events } = await supabase
          .from("calendar_events")
          .select("title, event_date, occasion")
          .eq("user_id", user.id)
          .gte("event_date", today)
          .order("event_date", { ascending: true })
          .limit(5);
        if (events) upcomingEvents = events;
      }

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-outfits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ closetItems, occasion, mood, styleProfile, upcomingEvents }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate outfits");
      }
      const data = await resp.json();
      setOutfits(data.outfits || []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const saveOutfit = async (outfit: OutfitSuggestion) => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from("outfits").insert({
        user_id: user.id,
        name: outfit.name,
        description: outfit.description,
        ai_explanation: outfit.explanation,
        confidence_score: outfit.confidence,
        occasion,
        mood,
        ai_generated: true,
        is_favorite: true,
      }).select().single();

      if (error) throw error;

      const matchedItems = closetItems.filter((ci) =>
        outfit.items.some((name) => ci.name?.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(ci.name?.toLowerCase() || ""))
      );
      if (matchedItems.length > 0 && data) {
        await supabase.from("outfit_items").insert(
          matchedItems.map((ci) => ({ outfit_id: data.id, clothing_item_id: ci.id }))
        );
      }

      toast.success(`"${outfit.name}" saved!`);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const addToSchedule = async () => {
    if (!user || !scheduleOutfit || !scheduleDate) return;
    try {
      const { error } = await supabase.from("calendar_events").insert({
        user_id: user.id,
        title: scheduleOutfit.name,
        event_date: format(scheduleDate, "yyyy-MM-dd"),
        occasion: occasion.charAt(0).toUpperCase() + occasion.slice(1),
        notes: scheduleNotes || `AI-generated: ${scheduleOutfit.description}`,
        outfit_items: scheduleOutfit.items,
      });
      if (error) throw error;
      toast.success(`"${scheduleOutfit.name}" scheduled for ${format(scheduleDate, "MMM d")}!`);
      setScheduleOutfit(null);
      setScheduleDate(undefined);
      setScheduleNotes("");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-primary" /> Outfit Generator
          </h1>
          <p className="text-muted-foreground font-sans text-sm mt-1 mb-8">AI-powered outfit combinations from your closet</p>
        </motion.div>

        {/* Controls */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-muted-foreground font-sans mb-1 block">Occasion</label>
              <Select value={occasion} onValueChange={setOccasion}>
                <SelectTrigger className="bg-secondary border-glass-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {occasions.map((o) => <SelectItem key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-sans mb-1 block">Mood</label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger className="bg-secondary border-glass-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {moods.map((m) => <SelectItem key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={generate} disabled={generating} className="w-full gold-gradient text-primary-foreground font-sans">
                {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                {generating ? "Generating..." : "Generate Outfits"}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Results */}
        {outfits.length === 0 && !generating && (
          <div className="text-center py-20">
            <Wand2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl text-foreground mb-2">Ready to generate outfits</h3>
            <p className="text-muted-foreground font-sans text-sm">
              {closetItems.length < 2
                ? "Add at least 2 items to your closet to get started"
                : "Select your occasion and mood, then click generate"}
            </p>
          </div>
        )}

        <div className="grid gap-6">
          <AnimatePresence>
            {outfits.map((outfit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground">{outfit.name}</h3>
                    <p className="text-muted-foreground font-sans text-sm">{outfit.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-sans text-primary bg-primary/10 px-2 py-1 rounded-full">
                      {outfit.confidence}% match
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => saveOutfit(outfit)} className="text-muted-foreground hover:text-primary">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setFlatLayOutfit(outfit)}
                      className="text-muted-foreground hover:text-primary"
                      title="Flat-Lay View"
                    >
                      <Layers className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setScheduleOutfit(outfit)}
                      className="text-muted-foreground hover:text-primary"
                      title="Add to Schedule"
                    >
                      <CalendarPlus className="h-4 w-4" />
                    </Button>
                    <ShareButton outfit={outfit} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {outfit.items.map((item, j) => (
                    <span key={j} className="px-3 py-1.5 rounded-full text-xs font-sans bg-secondary text-foreground flex items-center gap-1">
                      <Shirt className="h-3 w-3" /> {item}
                    </span>
                  ))}
                </div>

                <p className="text-sm font-sans text-muted-foreground italic">"{outfit.explanation}"</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Schedule Outfit Dialog */}
        <Dialog open={!!scheduleOutfit} onOpenChange={(open) => { if (!open) setScheduleOutfit(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-display flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" /> Schedule Outfit
              </DialogTitle>
            </DialogHeader>
            {scheduleOutfit && (
              <div className="space-y-4 pt-2">
                <div className="glass rounded-xl p-3">
                  <p className="font-sans text-sm font-semibold text-foreground">{scheduleOutfit.name}</p>
                  <p className="font-sans text-xs text-muted-foreground mt-0.5">{scheduleOutfit.description}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-sans mb-1.5 block">Pick a date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !scheduleDate && "text-muted-foreground")}>
                        <CalendarDays className="h-4 w-4 mr-2" />
                        {scheduleDate ? format(scheduleDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={scheduleDate}
                        onSelect={setScheduleDate}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Input
                  placeholder="Notes (optional)"
                  value={scheduleNotes}
                  onChange={(e) => setScheduleNotes(e.target.value)}
                />
                <Button onClick={addToSchedule} disabled={!scheduleDate} className="w-full gold-gradient text-primary-foreground font-sans">
                  <CalendarPlus className="h-4 w-4 mr-2" /> Add to Schedule
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
        {/* Flat-Lay View Dialog */}
        <Dialog open={!!flatLayOutfit} onOpenChange={(open) => { if (!open) setFlatLayOutfit(null); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" /> Flat-Lay View
              </DialogTitle>
            </DialogHeader>
            {flatLayOutfit && (
              <div className="space-y-4 pt-2">
                <p className="text-sm text-muted-foreground">{flatLayOutfit.name}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {flatLayOutfit.items.map((itemName, idx) => {
                    const matchedItem = closetItems.find((ci) =>
                      ci.name?.toLowerCase().includes(itemName.toLowerCase()) || itemName.toLowerCase().includes(ci.name?.toLowerCase() || "")
                    );
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.08 }}
                        className="rounded-xl border border-border bg-card overflow-hidden"
                      >
                        {matchedItem?.photo_url ? (
                          <img src={matchedItem.photo_url} alt={itemName} className="w-full aspect-square object-cover" />
                        ) : (
                          <div className="w-full aspect-square bg-muted/40 flex items-center justify-center">
                            <Shirt className="h-8 w-8 text-muted-foreground/40" />
                          </div>
                        )}
                        <div className="p-2">
                          <p className="text-xs font-medium text-foreground truncate">{itemName}</p>
                          {matchedItem?.color && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <div className="w-2 h-2 rounded-full border border-border" style={{ backgroundColor: matchedItem.color }} />
                              <span className="text-[10px] text-muted-foreground">{matchedItem.color}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground italic text-center">"{flatLayOutfit.explanation}"</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Outfits;
