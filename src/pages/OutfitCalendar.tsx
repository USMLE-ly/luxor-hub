import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  CalendarDays, ChevronLeft, ChevronRight, Plus, X, Shirt, Sparkles, Loader2,
  Cloud, Sun, CloudRain, Snowflake, Wind, Droplets, Thermometer,
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

interface WeatherDay {
  date: string;
  temp: number;
  tempMax: number;
  tempMin: number;
  description: string;
  icon: string;
  code: number;
  rain: boolean;
}

const occasions = ["Casual", "Work", "Date Night", "Formal", "Travel", "Workout", "Party"];

const weatherCodeToIcon = (code: number) => {
  if (code === 0 || code === 1) return <Sun className="w-4 h-4 text-amber-400" />;
  if (code <= 3) return <Cloud className="w-4 h-4 text-muted-foreground" />;
  if (code >= 51 && code <= 67) return <CloudRain className="w-4 h-4 text-blue-400" />;
  if (code >= 71 && code <= 77) return <Snowflake className="w-4 h-4 text-blue-200" />;
  if (code >= 80 && code <= 82) return <CloudRain className="w-4 h-4 text-blue-400" />;
  if (code >= 95) return <CloudRain className="w-4 h-4 text-purple-400" />;
  return <Cloud className="w-4 h-4 text-muted-foreground" />;
};

const OutfitCalendar = () => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [savedOutfits, setSavedOutfits] = useState<any[]>([]);
  const [newEvent, setNewEvent] = useState({ title: "", occasion: "Casual", notes: "", outfitId: "" });
  const [autoFilling, setAutoFilling] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherDay[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchEvents();
    fetchOutfits();
    fetchWeatherForecast();
  }, [user, currentMonth]);

  const fetchWeatherForecast = async () => {
    try {
      // Get user location or default to NYC
      let lat = 40.7128, lon = -74.006;
      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => 
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
          );
          lat = pos.coords.latitude;
          lon = pos.coords.longitude;
        } catch { /* use default */ }
      }

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max&temperature_unit=celsius&forecast_days=14`;
      const resp = await fetch(url);
      if (!resp.ok) return;
      const data = await resp.json();
      
      const weatherMap: Record<number, string> = {
        0: "Clear", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast",
        45: "Foggy", 48: "Rime fog", 51: "Light drizzle", 53: "Drizzle",
        55: "Heavy drizzle", 61: "Light rain", 63: "Rain", 65: "Heavy rain",
        71: "Light snow", 73: "Snow", 75: "Heavy snow", 80: "Rain showers",
        95: "Thunderstorm",
      };

      const days: WeatherDay[] = data.daily.time.map((date: string, i: number) => ({
        date,
        temp: Math.round((data.daily.temperature_2m_max[i] + data.daily.temperature_2m_min[i]) / 2),
        tempMax: Math.round(data.daily.temperature_2m_max[i]),
        tempMin: Math.round(data.daily.temperature_2m_min[i]),
        description: weatherMap[data.daily.weathercode[i]] || "Unknown",
        code: data.daily.weathercode[i],
        rain: (data.daily.precipitation_probability_max[i] || 0) > 40,
      }));
      setWeatherData(days);
    } catch { /* silently fail */ }
  };

  const getWeatherForDate = (date: Date): WeatherDay | undefined => {
    const dateStr = format(date, "yyyy-MM-dd");
    return weatherData.find(w => w.date === dateStr);
  };

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
      .select("id, name, mannequin_items, occasion, mood")
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

  const autoFillWeek = async () => {
    if (!user) return;
    setAutoFilling(true);
    try {
      const [itemsRes, styleRes, existingEventsRes] = await Promise.all([
        supabase.from("clothing_items").select("*").eq("user_id", user.id),
        supabase.from("style_profiles").select("archetype, preferences").eq("user_id", user.id).single(),
        supabase.from("calendar_events").select("event_date").eq("user_id", user.id),
      ]);

      const closetItems = itemsRes.data || [];
      if (closetItems.length < 2) {
        toast.error("Add at least 2 items to your closet first");
        setAutoFilling(false);
        return;
      }

      const existingDates = new Set((existingEventsRes.data || []).map((e: any) => e.event_date));
      const today = new Date();
      const daysToFill: Date[] = [];
      for (let i = 0; i < 14 && daysToFill.length < 7; i++) {
        const d = addDays(today, i);
        const dateStr = format(d, "yyyy-MM-dd");
        if (!existingDates.has(dateStr)) daysToFill.push(d);
      }

      if (daysToFill.length === 0) {
        toast.info("Your upcoming week is already fully scheduled!");
        setAutoFilling(false);
        return;
      }

      // Build weather forecast for the days to fill
      const weatherForecast = daysToFill.map(d => {
        const w = getWeatherForDate(d);
        return w ? { date: format(d, "yyyy-MM-dd"), temp: w.temp, description: w.description, rain: w.rain } : null;
      }).filter(Boolean);

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-outfits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          closetItems,
          occasion: "everyday",
          mood: "confident",
          styleProfile: styleRes.data,
          upcomingEvents: [],
          weatherForecast,
          count: daysToFill.length,
        }),
      });

      if (!resp.ok) throw new Error("Failed to generate outfits");
      const data = await resp.json();
      const generatedOutfits = data.outfits || [];

      const occasionMap: Record<string, string> = {
        Monday: "Work", Tuesday: "Work", Wednesday: "Work",
        Thursday: "Work", Friday: "Casual", Saturday: "Casual", Sunday: "Casual",
      };

      const eventsToInsert = daysToFill.map((d, i) => {
        const outfit = generatedOutfits[i % generatedOutfits.length];
        const dayName = format(d, "EEEE");
        const w = getWeatherForDate(d);
        const weatherNote = w ? ` | ${w.temp}°C ${w.description}` : "";
        return {
          user_id: user.id,
          title: outfit?.name || `${dayName} Outfit`,
          event_date: format(d, "yyyy-MM-dd"),
          occasion: occasionMap[dayName] || "Casual",
          notes: (outfit?.explanation || "AI-suggested outfit") + weatherNote,
          outfit_items: outfit?.items || [],
        };
      });

      const { error } = await supabase.from("calendar_events").insert(eventsToInsert);
      if (error) throw error;

      toast.success(`Scheduled ${eventsToInsert.length} weather-smart outfits!`);
      fetchEvents();
    } catch (e: any) {
      toast.error(e.message || "Failed to auto-fill schedule");
    } finally {
      setAutoFilling(false);
    }
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return events.filter(e => e.event_date === dateStr);
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) { days.push(day); day = addDays(day, 1); }

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Today's weather summary
  const todayWeather = getWeatherForDate(new Date());

  return (
    <AppLayout>
      <div className="p-5 max-w-2xl mx-auto pb-28">
        {/* Premium Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
                Outfit Schedule
              </h1>
              <p className="text-muted-foreground font-sans text-xs mt-0.5">
                Your curated weekly wardrobe — powered by AI & weather
              </p>
            </div>
            <motion.button
              onClick={autoFillWeek}
              disabled={autoFilling}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-sans font-semibold gold-gradient text-primary-foreground shadow-[0_4px_12px_-2px_hsl(var(--gold)/0.4)] disabled:opacity-50"
            >
              {autoFilling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {autoFilling ? "Generating..." : "Auto-Fill Week"}
            </motion.button>
          </div>
        </motion.div>

        {/* Weather Banner */}
        {todayWeather && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-5 rounded-2xl p-4 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--secondary)) 100%)",
              border: "1px solid hsl(var(--border))",
            }}
          >
            {/* Subtle gold accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] gold-gradient opacity-60" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  {weatherCodeToIcon(todayWeather.code)}
                </div>
                <div>
                  <p className="font-sans text-xs text-muted-foreground">Today's Weather</p>
                  <p className="font-display text-lg font-bold text-foreground leading-tight">
                    {todayWeather.tempMax}° <span className="text-muted-foreground text-sm font-normal">/ {todayWeather.tempMin}°</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs font-sans text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Thermometer className="w-3 h-3" /> {todayWeather.description}
                </span>
                {todayWeather.rain && (
                  <span className="flex items-center gap-1 text-blue-400">
                    <Droplets className="w-3 h-3" /> Rain likely
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Month Nav */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex items-center justify-between mb-4"
        >
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2.5 rounded-xl hover:bg-secondary transition-colors">
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <h2 className="font-display text-base font-bold text-foreground tracking-wide">{format(currentMonth, "MMMM yyyy")}</h2>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2.5 rounded-xl hover:bg-secondary transition-colors">
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
        </motion.div>

        {/* Premium Calendar Grid */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl overflow-hidden mb-5"
          style={{
            border: "1px solid hsl(var(--border))",
            background: "hsl(var(--card))",
            boxShadow: "0 8px 32px -8px hsl(var(--foreground) / 0.08)",
          }}
        >
          <div className="grid grid-cols-7">
            {dayNames.map(d => (
              <div key={d} className="py-2.5 text-center text-[10px] font-sans font-semibold text-muted-foreground uppercase tracking-[0.15em] border-b border-border/50">
                {d}
              </div>
            ))}
            {days.map((d, i) => {
              const dayEvents = getEventsForDate(d);
              const inMonth = isSameMonth(d, currentMonth);
              const todayFlag = isToday(d);
              const selected = selectedDate && isSameDay(d, selectedDate);
              const weather = getWeatherForDate(d);
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(d)}
                  className={`min-h-[76px] p-1.5 border-b border-r border-border/30 text-left transition-all relative group
                    ${!inMonth ? "opacity-20" : ""}
                    ${selected ? "bg-primary/8 ring-1 ring-primary/30 ring-inset" : "hover:bg-secondary/40"}
                    ${todayFlag ? "bg-primary/5" : ""}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-sans leading-none ${
                      todayFlag
                        ? "w-5 h-5 rounded-full gold-gradient text-primary-foreground flex items-center justify-center font-bold text-[10px]"
                        : "text-foreground"
                    }`}>
                      {format(d, "d")}
                    </span>
                    {weather && inMonth && (
                      <span className="opacity-60 group-hover:opacity-100 transition-opacity">
                        {weatherCodeToIcon(weather.code)}
                      </span>
                    )}
                  </div>
                  {weather && inMonth && (
                    <p className="text-[8px] font-sans text-muted-foreground/60 mt-0.5">{weather.tempMax}°</p>
                  )}
                  {dayEvents.length > 0 && (
                    <div className="mt-0.5 space-y-0.5">
                      {dayEvents.slice(0, 2).map(ev => (
                        <div key={ev.id} className="rounded px-1 py-[2px] truncate" style={{ background: "hsl(var(--primary) / 0.15)" }}>
                          <span className="text-[7px] font-sans text-primary font-semibold tracking-wide">{ev.title}</span>
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="text-[7px] text-muted-foreground font-sans">+{dayEvents.length - 2}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Selected Date Panel */}
        <AnimatePresence mode="wait">
          {selectedDate && (
            <motion.div
              key={format(selectedDate, "yyyy-MM-dd")}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-2xl p-5 mb-5 relative overflow-hidden"
              style={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                boxShadow: "0 8px 32px -8px hsl(var(--foreground) / 0.06)",
              }}
            >
              {/* Gold accent */}
              <div className="absolute top-0 left-0 w-1 h-full gold-gradient rounded-r" />

              <div className="flex items-center justify-between mb-4 pl-3">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">{format(selectedDate, "EEEE")}</h3>
                  <p className="text-xs font-sans text-muted-foreground">{format(selectedDate, "MMMM d, yyyy")}</p>
                </div>
                <div className="flex items-center gap-2">
                  {(() => {
                    const w = getWeatherForDate(selectedDate);
                    if (!w) return null;
                    return (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary/60 text-xs font-sans text-muted-foreground">
                        {weatherCodeToIcon(w.code)}
                        <span>{w.tempMax}°/{w.tempMin}°</span>
                        {w.rain && <Droplets className="w-3 h-3 text-blue-400" />}
                      </div>
                    );
                  })()}
                  <Button size="sm" onClick={() => setShowAddDialog(true)} className="gap-1.5 rounded-xl">
                    <Plus className="w-3.5 h-3.5" /> Add
                  </Button>
                </div>
              </div>

              {getEventsForDate(selectedDate).length === 0 ? (
                <div className="text-center py-8 pl-3">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/60 flex items-center justify-center mx-auto mb-3">
                    <Shirt className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-muted-foreground font-sans text-sm">No outfits planned</p>
                  <p className="text-muted-foreground/60 font-sans text-xs mt-0.5">Tap "Add" or use Auto-Fill Week</p>
                </div>
              ) : (
                <div className="space-y-2 pl-3">
                  {getEventsForDate(selectedDate).map((ev, idx) => (
                    <motion.div
                      key={ev.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-3 p-3.5 rounded-xl transition-colors hover:bg-secondary/30"
                      style={{ border: "1px solid hsl(var(--border) / 0.5)" }}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--primary) / 0.05))" }}
                      >
                        <Shirt className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-sm font-semibold text-foreground truncate">{ev.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {ev.occasion && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-sans font-medium bg-primary/10 text-primary">
                              {ev.occasion}
                            </span>
                          )}
                          {ev.notes && (
                            <p className="font-sans text-[10px] text-muted-foreground/70 truncate">{ev.notes}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteEvent(ev.id)}
                        className="text-muted-foreground/40 hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upcoming Week Weather Strip */}
        {weatherData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl p-4"
            style={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
            }}
          >
            <p className="text-[10px] font-sans font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-3">
              7-Day Forecast
            </p>
            <div className="flex gap-1 overflow-x-auto pb-1">
              {weatherData.slice(0, 7).map((w, i) => {
                const d = new Date(w.date + "T00:00:00");
                return (
                  <button
                    key={w.date}
                    onClick={() => setSelectedDate(d)}
                    className="flex flex-col items-center gap-1 min-w-[52px] p-2 rounded-xl transition-all hover:bg-secondary/50"
                  >
                    <span className="text-[9px] font-sans text-muted-foreground font-medium">
                      {isToday(d) ? "Today" : format(d, "EEE")}
                    </span>
                    {weatherCodeToIcon(w.code)}
                    <span className="text-[11px] font-sans font-semibold text-foreground">{w.tempMax}°</span>
                    <span className="text-[9px] font-sans text-muted-foreground">{w.tempMin}°</span>
                    {w.rain && <Droplets className="w-2.5 h-2.5 text-blue-400" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Add Event Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-display flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" /> Plan Outfit
              </DialogTitle>
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
              {(() => {
                const w = selectedDate ? getWeatherForDate(selectedDate) : null;
                if (!w) return null;
                return (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/50 text-xs font-sans text-muted-foreground">
                    {weatherCodeToIcon(w.code)}
                    <span>{w.description}, {w.tempMax}°/{w.tempMin}°C</span>
                    {w.rain && <span className="text-blue-400 flex items-center gap-0.5"><Droplets className="w-3 h-3" /> Rain</span>}
                  </div>
                );
              })()}
              <Input placeholder="Notes (optional)" value={newEvent.notes} onChange={e => setNewEvent(p => ({ ...p, notes: e.target.value }))} />
              <Button onClick={addEvent} disabled={!newEvent.title.trim()} className="w-full gold-gradient text-primary-foreground font-sans">
                Save to Calendar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default OutfitCalendar;