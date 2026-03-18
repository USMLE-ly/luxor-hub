import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useUserLocation } from "@/hooks/useUserLocation";
import { Sun, Cloud, CloudRain, Snowflake, Wind, Thermometer, Calendar, Sparkles, ChevronRight, Timer, RefreshCw, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/ui/gradient-button";

interface WeatherData {
  temperature: number;
  condition: string;
  location: string;
}

interface CalendarEvent {
  title: string;
  occasion: string | null;
  event_time: string | null;
}

interface OutfitSuggestion {
  name: string;
  items: string[];
  confidence: number;
  occasion: string;
}

function getWeatherIcon(condition: string) {
  const c = condition.toLowerCase();
  if (c.includes("rain") || c.includes("drizzle")) return <CloudRain className="w-5 h-5" />;
  if (c.includes("snow")) return <Snowflake className="w-5 h-5" />;
  if (c.includes("cloud") || c.includes("overcast")) return <Cloud className="w-5 h-5" />;
  if (c.includes("wind")) return <Wind className="w-5 h-5" />;
  return <Sun className="w-5 h-5" />;
}

export function MorningRoutineCard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userLocation = useUserLocation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [suggestions, setSuggestions] = useState<OutfitSuggestion[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(600);

  useEffect(() => {
    if (!user || userLocation.loading) return;
    const load = async () => {
      const today = new Date().toISOString().split("T")[0];

      const [weatherRes, eventsRes] = await Promise.all([
        supabase.functions.invoke("get-weather", { 
          body: { lat: userLocation.lat, lon: userLocation.lon } 
        }).catch(() => ({ data: null })),
        supabase.from("calendar_events").select("title, occasion, event_time").eq("user_id", user.id).eq("event_date", today).order("event_time"),
      ]);

      if (weatherRes.data) {
        setWeather({
          temperature: weatherRes.data.temperature ?? weatherRes.data.temp ?? 20,
          condition: weatherRes.data.condition ?? weatherRes.data.description ?? "Clear",
          location: weatherRes.data.city || userLocation.city || "Your area",
        });
      } else {
        // Even without weather API data, show city from location
        setWeather({
          temperature: 20,
          condition: "Clear",
          location: userLocation.city || "Your area",
        });
      }

      if (eventsRes.data) setEvents(eventsRes.data as CalendarEvent[]);

      const occasion = eventsRes.data?.[0]?.occasion || "everyday";
      const temp = weatherRes.data?.temp ?? 20;
      const mockSuggestions: OutfitSuggestion[] = [
        {
          name: temp < 15 ? "Layered & Warm" : "Light & Fresh",
          items: temp < 15 ? ["Wool sweater", "Coat", "Boots"] : ["Cotton tee", "Chinos", "Sneakers"],
          confidence: 87,
          occasion,
        },
        {
          name: "Smart Casual",
          items: ["Oxford shirt", "Tailored trousers", "Loafers"],
          confidence: 82,
          occasion: "work",
        },
        {
          name: "Weekend Vibes",
          items: ["Graphic tee", "Jeans", "Canvas sneakers"],
          confidence: 78,
          occasion: "casual",
        },
      ];
      setSuggestions(mockSuggestions);
      setLoading(false);
    };
    load();
  }, [user, userLocation.loading]);

  // Timer effect
  useEffect(() => {
    if (!timerActive || timerSeconds <= 0) return;
    const interval = setInterval(() => setTimerSeconds((s) => s - 1), 1000);
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (loading || userLocation.loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 animate-pulse">
        <div className="h-6 w-40 bg-secondary rounded mb-3" />
        <div className="h-20 bg-secondary rounded" />
      </div>
    );
  }

  const current = suggestions[activeSuggestion];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(40,80%,95%,0.08)] to-transparent pointer-events-none" />

      <div className="p-5 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-[hsl(40,80%,55%)]" />
            <h2 className="font-display text-lg font-bold text-foreground">Good Morning</h2>
          </div>
          {weather && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              {getWeatherIcon(weather.condition)}
              <span className="text-sm font-sans font-semibold">{weather.temperature}°</span>
            </div>
          )}
        </div>

        {/* City & Weather Location */}
        {weather?.location && (
          <div className="flex items-center gap-1 mb-3 text-[10px] font-sans text-muted-foreground/70">
            <MapPin className="w-3 h-3" />
            <span>{weather.location}</span>
            {weather.condition && <span className="ml-1">· {weather.condition}</span>}
          </div>
        )}

        {/* Today's Events */}
        {events.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-sans uppercase tracking-wider text-muted-foreground">Today's Events</span>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-none">
              {events.slice(0, 3).map((ev, i) => (
                <div key={i} className="flex-shrink-0 px-3 py-1.5 rounded-full bg-primary/10 text-xs font-sans text-primary">
                  {ev.event_time && <span className="font-semibold mr-1">{ev.event_time.slice(0, 5)}</span>}
                  {ev.title}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outfit Suggestion Carousel */}
        {current && (
          <div className="rounded-xl border border-border bg-secondary/30 p-4 mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-sans font-semibold text-foreground">{current.name}</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-sans">
                <span className="text-primary font-bold">{current.confidence}%</span>
                <span className="text-muted-foreground">match</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {current.items.map((item, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full bg-background text-[11px] font-sans text-foreground border border-border">
                  {item}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {suggestions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSuggestion(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === activeSuggestion ? "bg-primary w-4" : "bg-muted-foreground/30"}`}
                />
              ))}
              <div className="flex-1" />
              <button
                onClick={() => setActiveSuggestion((prev) => (prev + 1) % suggestions.length)}
                className="text-[10px] font-sans text-primary hover:underline flex items-center gap-0.5"
              >
                Next <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Get Ready Timer */}
        <div className="flex gap-2">
          <GradientButton
            onClick={() => navigate("/outfits")}
            className="flex-1 rounded-full h-10 text-sm"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> View Full Outfit
          </GradientButton>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (!timerActive) { setTimerSeconds(600); setTimerActive(true); }
              else setTimerActive(false);
            }}
            className="rounded-full h-10 px-3 border-border/60"
          >
            <Timer className="w-3.5 h-3.5 mr-1" />
            {timerActive ? formatTime(timerSeconds) : "Get Ready"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
