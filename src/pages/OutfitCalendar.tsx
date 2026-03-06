import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  CalendarDays, ChevronLeft, ChevronRight, Plus, X, Shirt, Cloud,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CalendarEvent {
  id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  occasion: string | null;
  notes: string | null;
  outfit_items: any;
  mannequin_image_url: string | null;
}

const occasions = ["Casual", "Work", "Date Night", "Formal", "Travel", "Workout", "Party"];

const OutfitCalendar = () => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [savedOutfits, setSavedOutfits] = useState<any[]>([]);
  const [newEvent, setNewEvent] = useState({ title: "", occasion: "Casual", notes: "", outfitId: "" });
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [weather, setWeather] = useState<Record<string, { temp: number; icon: string }>>({});

  useEffect(() => {
    if (!user) return;
    fetchEvents();
    fetchOutfits();
  }, [user, currentMonth]);

  const fetchEvents = async () => {
    if (!user) return;
    setLoading(true);
    const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
    const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");
    const { data } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", user.id)
      .gte("event_date", start)
      .lte("event_date", end)
      .order("event_date");
    if (data) setEvents(data);
    setLoading(false);
  };

  const fetchOutfits = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("outfits")
      .select("id, name, mannequin_items")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setSavedOutfits(data);
  };

  const addEvent = async () => {
    if (!user || !selectedDate || !newEvent.title.trim()) return;
    const outfit = savedOutfits.find(o => o.id === newEvent.outfitId);
    const { error } = await supabase.from("calendar_events").insert({
      user_id: user.id,
      title: newEvent.title.trim(),
      event_date: format(selectedDate, "yyyy-MM-dd"),
      occasion: newEvent.occasion,
      notes: newEvent.notes || null,
      outfit_items: outfit?.mannequin_items || [],
    });
    if (error) toast.error("Failed to add event");
    else {
      toast.success("Event added!");
      setShowAddDialog(false);
      setNewEvent({ title: "", occasion: "Casual", notes: "", outfitId: "" });
      fetchEvents();
    }
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase.from("calendar_events").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Event removed"); fetchEvents(); }
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return events.filter(e => e.event_date === dateStr);
  };

  // Build calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) { days.push(day); day = addDays(day, 1); }

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <AppLayout>
      <div className="p-5 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2 mb-1">
            <CalendarDays className="h-6 w-6 text-primary" /> Outfit Calendar
          </h1>
          <p className="text-muted-foreground font-sans text-xs mb-5">Plan your outfits ahead</p>
        </motion.div>

        {/* Month Nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <h2 className="font-display text-lg font-bold text-foreground">{format(currentMonth, "MMMM yyyy")}</h2>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* View toggle */}
        <div className="flex gap-1 bg-secondary rounded-xl p-1 mb-4 w-fit">
          {(["month", "week"] as const).map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className={`px-4 py-1.5 rounded-lg text-xs font-sans capitalize transition-all ${viewMode === mode ? "bg-foreground text-background font-semibold" : "text-muted-foreground"}`}>
              {mode}
            </button>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden mb-5">
          <div className="grid grid-cols-7">
            {dayNames.map(d => (
              <div key={d} className="py-2 text-center text-[10px] font-sans font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                {d}
              </div>
            ))}
            {days.map((d, i) => {
              const dayEvents = getEventsForDate(d);
              const inMonth = isSameMonth(d, currentMonth);
              const today = isToday(d);
              const selected = selectedDate && isSameDay(d, selectedDate);
              return (
                <button
                  key={i}
                  onClick={() => { setSelectedDate(d); }}
                  className={`min-h-[70px] p-1 border-b border-r border-border text-left transition-colors relative
                    ${!inMonth ? "opacity-30" : ""}
                    ${selected ? "bg-primary/10" : "hover:bg-secondary/50"}
                    ${today ? "ring-1 ring-primary ring-inset" : ""}
                  `}
                >
                  <span className={`text-xs font-sans ${today ? "text-primary font-bold" : "text-foreground"}`}>
                    {format(d, "d")}
                  </span>
                  {dayEvents.length > 0 && (
                    <div className="mt-0.5 space-y-0.5">
                      {dayEvents.slice(0, 2).map(ev => (
                        <div key={ev.id} className="bg-primary/20 rounded px-1 py-0.5 truncate">
                          <span className="text-[8px] font-sans text-primary font-medium">{ev.title}</span>
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="text-[8px] text-muted-foreground font-sans">+{dayEvents.length - 2} more</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Panel */}
        {selectedDate && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-lg font-bold text-foreground">{format(selectedDate, "EEEE, MMM d")}</h3>
              <Button size="sm" onClick={() => setShowAddDialog(true)} className="gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Add
              </Button>
            </div>
            {getEventsForDate(selectedDate).length === 0 ? (
              <p className="text-muted-foreground font-sans text-sm">No outfits planned for this day</p>
            ) : (
              <div className="space-y-2">
                {getEventsForDate(selectedDate).map(ev => (
                  <div key={ev.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Shirt className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm font-medium text-foreground truncate">{ev.title}</p>
                      {ev.occasion && <p className="font-sans text-[10px] text-muted-foreground">{ev.occasion}</p>}
                    </div>
                    <button onClick={() => deleteEvent(ev.id)} className="text-muted-foreground hover:text-destructive p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Add Event Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-display">Plan Outfit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <Input placeholder="Event name (e.g., Team meeting)" value={newEvent.title} onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))} />
              <Select value={newEvent.occasion} onValueChange={v => setNewEvent(p => ({ ...p, occasion: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {occasions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
              {savedOutfits.length > 0 && (
                <Select value={newEvent.outfitId} onValueChange={v => setNewEvent(p => ({ ...p, outfitId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Attach saved outfit (optional)" /></SelectTrigger>
                  <SelectContent>
                    {savedOutfits.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              <Input placeholder="Notes (optional)" value={newEvent.notes} onChange={e => setNewEvent(p => ({ ...p, notes: e.target.value }))} />
              <Button onClick={addEvent} disabled={!newEvent.title.trim()} className="w-full">Save to Calendar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default OutfitCalendar;
