import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarDays, Plus, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format, isToday, isTomorrow, addDays } from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  occasion: string | null;
  notes: string | null;
}

const OCCASIONS = ["Work", "Date Night", "Party", "Wedding", "Casual", "Gym", "Interview", "Travel", "Formal Dinner", "Other"];

export const CalendarWidget = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [eventTime, setEventTime] = useState("");
  const [occasion, setOccasion] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchEvents = async () => {
    if (!user) return;
    const today = format(new Date(), "yyyy-MM-dd");
    const weekEnd = format(addDays(new Date(), 7), "yyyy-MM-dd");
    const { data } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", user.id)
      .gte("event_date", today)
      .lte("event_date", weekEnd)
      .order("event_date", { ascending: true })
      .order("event_time", { ascending: true });
    if (data) setEvents(data);
  };

  useEffect(() => { fetchEvents(); }, [user]);

  const handleAdd = async () => {
    if (!user || !title.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("calendar_events").insert({
      user_id: user.id,
      title: title.trim(),
      event_date: eventDate,
      event_time: eventTime || null,
      occasion: occasion || null,
    });
    if (error) toast.error("Failed to add event");
    else {
      toast.success("Event added!");
      setTitle(""); setEventTime(""); setOccasion("");
      setOpen(false);
      fetchEvents();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("calendar_events").delete().eq("id", id);
    fetchEvents();
  };

  const formatDay = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    if (isToday(d)) return "Today";
    if (isTomorrow(d)) return "Tomorrow";
    return format(d, "EEE, MMM d");
  };

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Upcoming Events
        </h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="border-glass-border hover:border-primary/50 font-sans">
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background border-glass-border">
            <DialogHeader>
              <DialogTitle className="font-display text-lg">Add Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label className="text-sm font-sans text-muted-foreground">Event Name</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Team meeting" className="bg-secondary border-glass-border mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-sans text-muted-foreground">Date</Label>
                  <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="bg-secondary border-glass-border mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-sans text-muted-foreground">Time (optional)</Label>
                  <Input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className="bg-secondary border-glass-border mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-sm font-sans text-muted-foreground">Occasion / Dress Code</Label>
                <Select value={occasion} onValueChange={setOccasion}>
                  <SelectTrigger className="bg-secondary border-glass-border mt-1">
                    <SelectValue placeholder="Select occasion" />
                  </SelectTrigger>
                  <SelectContent>
                    {OCCASIONS.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAdd} disabled={saving || !title.trim()} className="w-full gold-gradient text-primary-foreground font-sans">
                {saving ? "Adding..." : "Add Event"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-6">
          <CalendarDays className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground font-sans text-sm">No upcoming events this week</p>
          <p className="text-muted-foreground/60 font-sans text-xs mt-1">Add events to get occasion-based outfit suggestions</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-sans text-sm font-medium text-foreground truncate">{event.title}</p>
                  {event.occasion && (
                    <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-primary/20 text-primary whitespace-nowrap">
                      {event.occasion}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground font-sans">{formatDay(event.event_date)}</span>
                  {event.event_time && (
                    <span className="text-xs text-muted-foreground font-sans flex items-center gap-0.5">
                      <Clock className="h-3 w-3" /> {event.event_time.slice(0, 5)}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => handleDelete(event.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
