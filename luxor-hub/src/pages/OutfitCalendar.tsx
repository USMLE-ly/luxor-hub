import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useClosetItems } from "@/hooks/useClosetItems";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { notifyEvent } from "@/lib/notificationService";
import { useUserLocation } from "@/hooks/useUserLocation";
import { OutfitComposition } from "@/components/ui/OutfitComposition";
import {CalendarDots, CaretLeft, CaretRight, Plus, X, TShirt, Sparkle, Spinner, Cloud, Sun, CloudRain, Snowflake, Wind, Drop, Thermometer, Pencil, Bell, BellSlash, MapPin, TrendUp, Flame, ChartBar, StackSimple, CopySimple, Palette, Star, ShareNetwork, Umbrella, ThermometerCold, Warning, Trophy, Trophy, Lightning, Target, Crown, ArrowsClockwise, Lightbulb, } from "@phosphor-icons/react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, subDays, isSameMonth, isSameDay, isToday, isSunday, differenceInMilliseconds, set as setDate } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getOutfitFingerprint, getStyleTip } from "@/lib/calendarHelpers";
import { insertCalendarEvent, insertCalendarEvents, deleteCalendarEvent, updateEventOutfit } from "@/lib/calendarService";
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
  outfit_type?: string;
}

interface ClosetItem {
  id: string;
  name: string | null;
  category: string;
  photo_url: string | null;
  color: string | null;
}

const closetCategoryMap: Record<string, string[]> = {
  "Upper Body": ["top", "outerwear"],
  "Lower Body": ["bottom"],
  "Dresses": ["dress"],
  "Shoes": ["shoes"],
  "Accessories": ["accessory"],
  "Other": ["other"],
};

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

// Push notification helpers
const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
};

const scheduleNotification = (title: string, body: string, delayMs: number) => {
  if (delayMs <= 0) return;
  setTimeout(() => {
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/pwa-192.png",
        badge: "/pwa-192.png",
        tag: `outfit-reminder-${Date.now()}`,
      });
    }
  }, delayMs);
};

const OutfitCalendar = () => {
  return <OutfitCalendarInner />;
};

const OutfitCalendarInner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [savedOutfits, setSavedOutfits] = useState<any[]>([]);
  const { styleProfile } = useUserProfile();
  const { items: closetItems } = useClosetItems({ columns: "id, name, photo_url, category, color" });
  const [newEvent, setNewEvent] = useState({ title: "", occasion: "Casual", notes: "", outfitId: "", manualItems: [] as string[] });
  const [editEvent, setEditEvent] = useState({ title: "", occasion: "Casual", notes: "", outfitId: "", manualItems: [] as string[] });
  const [autoFilling, setAutoFilling] = useState(false);
  const [flatLayEvent, setFlatLayEvent] = useState<CalendarEvent | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherDay[]>([]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [closetMap, setClosetMap] = useState<Map<string, string>>(new Map());
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted"
  );
  const userLocation = useUserLocation();
  const [recentEvents, setRecentEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchEvents();
    fetchOutfits();
    fetchRecentEvents();
  }, [user, currentMonth]);

  // Build name→photo map from hook data (stable — only rebuilds on actual data change)
  useEffect(() => {
    if (closetItems.length === 0) return;
    const newMap = new Map<string, string>();
    closetItems.forEach((item: any) => {
      if (item.name && (item.photo_url || item.image_url)) newMap.set(item.name.toLowerCase(), item.photo_url || item.image_url);
    });
    setClosetMap(prev => {
      const prevKeys = Array.from(prev.keys()).sort().join(",");
      const newKeys = Array.from(newMap.keys()).sort().join(",");
      return prevKeys === newKeys ? prev : newMap;
    });
  }, [closetItems.length]);

  // Fetch weather when location resolves
  useEffect(() => {
    if (!userLocation.loading) {
      fetchWeatherForecast();
    }
  }, [userLocation.loading]);

  // Schedule push reminders for tomorrow's events
  const scheduleReminders = useCallback((evts: CalendarEvent[]) => {
    if (!notificationsEnabled) return;
    const now = new Date();
    const tonight = setDate(now, { hours: 20, minutes: 0, seconds: 0, milliseconds: 0 });
    const tomorrow = format(addDays(now, 1), "yyyy-MM-dd");

    const tomorrowEvents = evts.filter(e => e.event_date === tomorrow);
    if (tomorrowEvents.length === 0) return;

    const delayMs = differenceInMilliseconds(tonight, now);
    if (delayMs <= 0) return;

    tomorrowEvents.forEach(ev => {
      scheduleNotification(
        "👔 Outfit Reminder",
        `Prepare your outfit for tomorrow: ${ev.title}${ev.occasion ? ` (${ev.occasion})` : ""}`,
        delayMs
      );
    });
  }, [notificationsEnabled]);

  // Fetch last 14 days of events for repeat detection
  const fetchRecentEvents = async () => {
    if (!user) return;
    const twoWeeksAgo = format(subDays(new Date(), 14), "yyyy-MM-dd");
    const today = format(new Date(), "yyyy-MM-dd");
    const { data } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", user.id)
      .gte("event_date", twoWeeksAgo)
      .lte("event_date", today)
      .order("event_date", { ascending: false });
    if (data) setRecentEvents(data);
  };

  // Weekly digest: schedule Sunday 6 PM notification summarizing next week
  const scheduleWeeklyDigest = useCallback((allEvents: CalendarEvent[]) => {
    if (!notificationsEnabled) return;
    const now = new Date();
    if (!isSunday(now)) return;
    const sundayEvening = setDate(now, { hours: 18, minutes: 0, seconds: 0, milliseconds: 0 });
    const delayMs = differenceInMilliseconds(sundayEvening, now);
    if (delayMs <= 0 || delayMs > 24 * 60 * 60 * 1000) return;

    // Gather next 7 days
    const nextWeekDates: string[] = [];
    for (let i = 1; i <= 7; i++) {
      nextWeekDates.push(format(addDays(now, i), "yyyy-MM-dd"));
    }
    const nextWeekEvents = allEvents.filter(e => nextWeekDates.includes(e.event_date));
    const planned = nextWeekEvents.length;
    const unplanned = 7 - planned;

    let body = `📋 ${planned} outfit${planned !== 1 ? "s" : ""} planned for next week.`;
    if (unplanned > 0) body += ` ${unplanned} day${unplanned !== 1 ? "s" : ""} still open — tap to fill them!`;
    if (planned > 0) {
      const titles = nextWeekEvents.slice(0, 3).map(e => e.title).join(", ");
      body += `\nUp next: ${titles}${nextWeekEvents.length > 3 ? "…" : ""}`;
    }

    scheduleNotification("📅 Weekly Style Digest", body, delayMs);
  }, [notificationsEnabled]);

  // Also schedule weekly digest when events load
  useEffect(() => {
    if (events.length > 0) scheduleWeeklyDigest(events);
  }, [events, scheduleWeeklyDigest]);

  // Outfit repeat detector: fingerprint items and compare
  const detectRepeat = (ev: CalendarEvent): { isRepeat: boolean; matchDate: string | null } => {
    const items = Array.isArray(ev.outfit_items) ? ev.outfit_items : [];
    if (items.length < 2) return { isRepeat: false, matchDate: null };
    const fp = getOutfitFingerprint(items);
    if (!fp) return { isRepeat: false, matchDate: null };

    for (const recent of recentEvents) {
      if (recent.id === ev.id) continue;
      const recentItems = Array.isArray(recent.outfit_items) ? recent.outfit_items : [];
      const recentFp = getOutfitFingerprint(recentItems);
      if (recentFp === fp) {
        return { isRepeat: true, matchDate: recent.event_date };
      }
    }
    return { isRepeat: false, matchDate: null };
  };

  // Smart suggestion: recommend underused closet items when repeat detected
  const getUnderusedSuggestions = (ev: CalendarEvent): ClosetItem[] => {
    const items = Array.isArray(ev.outfit_items) ? ev.outfit_items : [];
    if (items.length === 0) return [];
    const usedCats = new Set(items.map((i: any) => (i?.category || "").toLowerCase()));
    const itemUsage = new Map<string, number>();
    recentEvents.forEach(re => {
      const reItems = Array.isArray(re.outfit_items) ? re.outfit_items : [];
      reItems.forEach((i: any) => {
        const name = (typeof i === "string" ? i : i?.name || "").toLowerCase();
        if (name) itemUsage.set(name, (itemUsage.get(name) || 0) + 1);
      });
    });
    return closetItems
      .filter(ci => {
        if (!usedCats.has((ci.category || "").toLowerCase())) return false;
        const alreadyInOutfit = items.some((i: any) => {
          const n = (typeof i === "string" ? i : i?.name || "").toLowerCase();
          return n === (ci.name || "").toLowerCase();
        });
        return !alreadyInOutfit;
      })
      .sort((a, b) => (itemUsage.get((a.name || "").toLowerCase()) || 0) - (itemUsage.get((b.name || "").toLowerCase()) || 0))
      .slice(0, 3);
  };

  const toggleNotifications = async () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      toast.success("Reminders turned off");
      return;
    }
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotificationsEnabled(true);
      toast.success("Reminders on. You'll get a nudge at 8 PM the night before.");
      scheduleReminders(events);
    } else {
      toast.error("Notification permission denied. Enable it in your browser settings.");
    }
  };

  const fetchWeatherForecast = async () => {
    try {
      const lat = userLocation.lat;
      const lon = userLocation.lon;
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
    if (data) {
      setEvents(data);
      scheduleReminders(data);
    }
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
    // Build outfit_items from saved outfit OR manually picked closet items
    let outfitItems: any[] = outfit?.mannequin_items || [];
    if (!outfit && newEvent.manualItems.length > 0) {
      outfitItems = newEvent.manualItems.map(itemId => {
        const ci = closetItems.find(c => c.id === itemId);
        return ci ? { name: ci.name, category: ci.category, photo_url: ci.photo_url, color: ci.color } : null;
      }).filter(Boolean);
    }
    const { error } = await supabase.from("calendar_events").insert({
      user_id: user.id,
      title: newEvent.title.trim(),
      event_date: format(selectedDate, "yyyy-MM-dd"),
      occasion: newEvent.occasion,
      notes: newEvent.notes || null,
      outfit_items: outfitItems,
    });
    if (error) toast.error("Failed to add event");
    else {
      toast.success("Event added!");
      notifyEvent("outfit-added-calendar");
      setShowAddDialog(false);
      setNewEvent({ title: "", occasion: "Casual", notes: "", outfitId: "", manualItems: [] });
      fetchEvents();
    }
  };

  const openEditDialog = (ev: CalendarEvent) => {
    setEditingEvent(ev);
    // Extract existing manual item IDs from outfit_items if possible
    const existingItemIds: string[] = [];
    const items = Array.isArray(ev.outfit_items) ? ev.outfit_items : [];
    items.forEach((item: any) => {
      if (typeof item === "object" && item?.name) {
        const match = closetItems.find(c => c.name?.toLowerCase() === item.name?.toLowerCase());
        if (match) existingItemIds.push(match.id);
      }
    });
    setEditEvent({
      title: ev.title,
      occasion: ev.occasion || "Casual",
      notes: ev.notes || "",
      outfitId: "",
      manualItems: existingItemIds,
    });
    setShowEditDialog(true);
  };

  const updateEvent = async () => {
    if (!editingEvent || !editEvent.title.trim()) return;
    const outfit = editEvent.outfitId ? savedOutfits.find(o => o.id === editEvent.outfitId) : null;
    const updateData: any = {
      title: editEvent.title.trim(),
      occasion: editEvent.occasion,
      notes: editEvent.notes || null,
    };
    if (outfit) {
      updateData.outfit_items = outfit.mannequin_items || [];
    } else if (editEvent.manualItems.length > 0) {
      updateData.outfit_items = editEvent.manualItems.map(itemId => {
        const ci = closetItems.find(c => c.id === itemId);
        return ci ? { name: ci.name, category: ci.category, photo_url: ci.photo_url, color: ci.color } : null;
      }).filter(Boolean);
    }

    const { error } = await supabase
      .from("calendar_events")
      .update(updateData)
      .eq("id", editingEvent.id);

    if (error) toast.error("Failed to update event");
    else {
      toast.success("Event updated!");
      setShowEditDialog(false);
      setEditingEvent(null);
      fetchEvents();
    }
  };

  const deleteEvent = async (id: string) => {
    const { error } = await deleteCalendarEvent(id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Event removed"); fetchEvents(); }
  };

  const autoFillWeek = async () => {
    if (!user) return;
    setAutoFilling(true);
    try {
      const { data: existingEventsRes } = await supabase.from("calendar_events").select("event_date").eq("user_id", user.id);
      
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
        toast.info("Your week is fully booked. You're ahead of everyone.");
        setAutoFilling(false);
        return;
      }
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
          styleProfile: styleProfile,
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
      toast.success(`Done. ${eventsToInsert.length} outfits locked in.`);
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

  // Duplicate yesterday's outfit to selected date
  const duplicateYesterday = async () => {
    if (!user || !selectedDate) return;
    const yesterday = addDays(selectedDate, -1);
    const yesterdayEvents = getEventsForDate(yesterday);
    if (yesterdayEvents.length === 0) {
      toast.error("No outfit found for the previous day");
      return;
    }
    const source = yesterdayEvents[0];
    const { error } = await supabase.from("calendar_events").insert({
      user_id: user.id,
      title: source.title + " (copy)",
      event_date: format(selectedDate, "yyyy-MM-dd"),
      occasion: source.occasion,
      notes: source.notes,
      outfit_items: source.outfit_items,
      mannequin_image_url: source.mannequin_image_url,
    });
    if (error) toast.error("Failed to duplicate");
    else { toast.success("Yesterday's outfit duplicated!"); fetchEvents(); }
  };

  // Live outfit score based on color harmony + occasion match + category coverage
  const computeOutfitScore = (itemIds: string[], occasion: string): { score: number; label: string; color: string } => {
    if (itemIds.length === 0) return { score: 0, label: "", color: "" };
    const items = itemIds.map(id => closetItems.find(c => c.id === id)).filter(Boolean) as ClosetItem[];
    if (items.length === 0) return { score: 0, label: "", color: "" };

    let score = 0;
    
    // Category coverage (max 40): tops+bottoms+shoes = perfect base
    const cats = new Set(items.map(i => (i.category || "").toLowerCase()));
    const hasTop = cats.has("top") || cats.has("outerwear") || cats.has("dress");
    const hasBottom = cats.has("bottom") || cats.has("dress");
    const hasShoes = cats.has("shoes");
    if (hasTop) score += 15;
    if (hasBottom) score += 15;
    if (hasShoes) score += 10;
    
    // Color harmony (max 35): complementary/analogous colors score higher
    const colorMap: Record<string, number> = {
      black: 0, white: 0, gray: 0, grey: 0, navy: 240, blue: 240, red: 0, 
      green: 120, yellow: 60, orange: 30, pink: 330, purple: 270, brown: 30,
      beige: 40, cream: 45, tan: 35, burgundy: 345, maroon: 345, olive: 80,
    };
    const hues = items.map(i => {
      const c = (i.color || "").toLowerCase().trim();
      return colorMap[c] !== undefined ? colorMap[c] : -1;
    }).filter(h => h >= 0);
    
    if (hues.length >= 2) {
      // Neutral-heavy = safe = good
      const neutrals = items.filter(i => ["black", "white", "gray", "grey", "navy", "beige", "cream"].includes((i.color || "").toLowerCase().trim()));
      const neutralRatio = neutrals.length / items.length;
      if (neutralRatio >= 0.5) score += 30;
      else {
        // Check if chromatic colors are analogous (within 60deg)
        const chromatic = hues.filter(h => h > 0);
        if (chromatic.length >= 2) {
          const spread = Math.max(...chromatic) - Math.min(...chromatic);
          if (spread <= 60 || spread >= 300) score += 30;
          else if (spread <= 120) score += 20;
          else score += 10;
        } else score += 25;
      }
    } else score += 20; // single item or no color data
    
    // Occasion match (max 25)
    const occasionCatBonus: Record<string, string[]> = {
      "Work": ["top", "bottom", "shoes"],
      "Formal": ["top", "bottom", "shoes", "accessory"],
      "Casual": ["top", "bottom"],
      "Date Night": ["dress", "shoes", "accessory"],
      "Party": ["dress", "shoes", "accessory"],
      "Travel": ["top", "bottom", "shoes", "outerwear"],
      "Workout": ["top", "bottom", "shoes"],
    };
    const wanted = occasionCatBonus[occasion] || [];
    const matched = wanted.filter(w => cats.has(w));
    score += Math.round((matched.length / Math.max(wanted.length, 1)) * 25);

    score = Math.min(score, 100);
    
    if (score >= 80) return { score, label: "Great Match", color: "hsl(var(--primary))" };
    if (score >= 55) return { score, label: "Good", color: "hsl(45 90% 50%)" };
    return { score, label: "Needs More", color: "hsl(var(--muted-foreground))" };
  };

  // Weather-based outfit recommendations
  const getWeatherRecommendations = (date: Date, outfitItems: any[]): { icon: React.ReactNode; text: string; severity: "warn" | "info" }[] => {
    const w = getWeatherForDate(date);
    if (!w) return [];
    const recs: { icon: React.ReactNode; text: string; severity: "warn" | "info" }[] = [];
    const items = Array.isArray(outfitItems) ? outfitItems : [];
    const cats = new Set(items.map((i: any) => (i?.category || "").toLowerCase()));
    const hasOuterwear = cats.has("outerwear");

    if (w.rain) {
      recs.push({
        icon: <Umbrella className="w-3.5 h-3.5" />,
        text: hasOuterwear ? "Rain expected — make sure your outerwear is waterproof" : "Rain expected — consider adding a waterproof jacket",
        severity: "warn",
      });
    }
    if (w.tempMin <= 5) {
      recs.push({
        icon: <Snowflake className="w-3.5 h-3.5" />,
        text: hasOuterwear ? "Cold day — layer up with warm accessories" : "Cold day (≤5°C) — add a warm coat or layers",
        severity: "warn",
      });
    } else if (w.tempMin <= 12 && !hasOuterwear) {
      recs.push({
        icon: <ThermometerCold className="w-3.5 h-3.5" />,
        text: "Cool weather — consider adding a light jacket",
        severity: "info",
      });
    }
    if (w.tempMax >= 30) {
      recs.push({
        icon: <Sun className="w-3.5 h-3.5" />,
        text: "Hot day — opt for breathable fabrics and light colors",
        severity: "info",
      });
    }
    return recs;
  };

  // AI-powered style tip based on weather + occasion combo
  

  // Share outfit as styled card image
  const shareOutfitCard = async (ev: CalendarEvent) => {
    const items = Array.isArray(ev.outfit_items) ? ev.outfit_items : [];
    const photos: string[] = [];
    items.forEach((item: any) => {
      if (typeof item === "string") {
        const url = closetMap.get(item.toLowerCase());
        if (url) photos.push(url);
      } else {
        const url = item?.photo_url || item?.photoUrl || item?.image_url || item?.imageUrl || item?.url;
        if (url) photos.push(url);
      }
    });

    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 800);
    grad.addColorStop(0, "#1D3937");
    grad.addColorStop(1, "#195042");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 800);

    // Gold accent bar
    const goldGrad = ctx.createLinearGradient(0, 0, 600, 0);
    goldGrad.addColorStop(0, "#c5a355");
    goldGrad.addColorStop(1, "#e8d48b");
    ctx.fillStyle = goldGrad;
    ctx.fillRect(0, 0, 600, 4);

    // Title
    ctx.fillStyle = "#e8d48b";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("LUXOR® • OUTFIT SCHEDULE", 30, 40);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px sans-serif";
    ctx.fillText(ev.title, 30, 80);

    ctx.fillStyle = "#999999";
    ctx.font = "14px sans-serif";
    const dateStr = format(new Date(ev.event_date + "T00:00:00"), "EEEE, MMMM d");
    ctx.fillText(`${dateStr}${ev.occasion ? ` • ${ev.occasion}` : ""}`, 30, 108);

    // Load and draw item photos in a grid
    const visiblePhotos = photos.slice(0, 4);
    if (visiblePhotos.length > 0) {
      const cols = visiblePhotos.length >= 4 ? 2 : visiblePhotos.length;
      const rows = Math.ceil(visiblePhotos.length / cols);
      const cellW = (540 / cols);
      const cellH = Math.min(280, 560 / rows);
      const startY = 140;

      // White card background for photos
      ctx.fillStyle = "#ffffff";
      const cardW = cols * cellW;
      const cardH = rows * cellH;
      ctx.beginPath();
      ctx.roundRect(30, startY - 10, cardW, cardH + 20, 16);
      ctx.fill();

      const loadImg = (src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

      try {
        const imgs = await Promise.all(visiblePhotos.map(loadImg));
        imgs.forEach((img, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const x = 30 + col * cellW + 10;
          const y = startY + row * cellH + 10;
          const w = cellW - 20;
          const h = cellH - 20;
          // Fit image
          const scale = Math.min(w / img.width, h / img.height);
          const drawW = img.width * scale;
          const drawH = img.height * scale;
          ctx.drawImage(img, x + (w - drawW) / 2, y + (h - drawH) / 2, drawW, drawH);
        });
      } catch {
        // If images fail to load, just show text
        ctx.fillStyle = "#666";
        ctx.font = "16px sans-serif";
        ctx.fillText(`${items.length} items in this outfit`, 30, 200);
      }
    }

    // Notes footer
    if (ev.notes) {
      ctx.fillStyle = "#888888";
      ctx.font = "italic 13px sans-serif";
      ctx.fillText(`"${ev.notes}"`, 30, 740);
    }

    // Watermark
    ctx.fillStyle = "#555555";
    ctx.font = "11px sans-serif";
    ctx.fillText("Styled with LUXOR®", 30, 780);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `outfit-${ev.event_date}.png`, { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            title: ev.title,
            text: `Check out my outfit for ${dateStr}!`,
            files: [file],
          });
        } catch { /* user cancelled */ }
      } else {
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `outfit-${ev.event_date}.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Outfit card downloaded!");
      }
    }, "image/png");
  };
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) { days.push(day); day = addDays(day, 1); }
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const todayWeather = getWeatherForDate(new Date());

  // Calendar Stats
  const calendarStats = useMemo(() => {
    const monthEvents = events;
    const planned = monthEvents.length;
    
    // Day streak: count consecutive days with events from today backwards
    let streak = 0;
    let checkDate = new Date();
    while (true) {
      const dateStr = format(checkDate, "yyyy-MM-dd");
      if (monthEvents.some(e => e.event_date === dateStr)) {
        streak++;
        checkDate = addDays(checkDate, -1);
      } else break;
    }

    // Most worn category from outfit items
    const categoryCounts: Record<string, number> = {};
    monthEvents.forEach(ev => {
      const items = Array.isArray(ev.outfit_items) ? ev.outfit_items : [];
      items.forEach((item: any) => {
        const cat = item?.category || item?.type || "other";
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
    });
    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    return { planned, streak, topCategory };
  }, [events]);

  // Planning streak milestones & rewards
  const streakRewards = useMemo(() => {
    const streak = calendarStats.streak;
    const milestones = [
      { days: 3, name: "Getting Started", icon: "🔥", badge: "streak_3" },
      { days: 7, name: "Week Warrior", icon: "⚡", badge: "streak_7" },
      { days: 14, name: "Style Streak", icon: "💎", badge: "streak_14" },
      { days: 30, name: "Fashion Devotee", icon: "👑", badge: "streak_30" },
    ];
    const current = milestones.filter(m => streak >= m.days);
    const next = milestones.find(m => streak < m.days);
    const progress = next ? Math.round((streak / next.days) * 100) : 100;
    return { current, next, progress, streak };
  }, [calendarStats.streak]);

  // Trophy streak badges automatically
  useEffect(() => {
    if (!user || streakRewards.current.length === 0) return;
    const awardBadges = async () => {
      for (const milestone of streakRewards.current) {
        const { data: existing } = await supabase
          .from("user_badges")
          .select("id")
          .eq("user_id", user.id)
          .eq("badge_key", milestone.badge)
          .maybeSingle();
        if (!existing) {
          await supabase.from("user_badges").insert({
            user_id: user.id,
            badge_key: milestone.badge,
            badge_name: milestone.name,
            badge_description: `Planned outfits for ${milestone.days} consecutive days`,
            badge_icon: "flame",
          });
          toast.success(`🏆 Badge unlocked: ${milestone.name}!`);
        }
      }
    };
    awardBadges();
  }, [user, streakRewards.current.length]);

  return (
    <AppLayout>
      <div className="p-5 max-w-2xl mx-auto pb-28">
        {/* Premium Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
                Your Week, Styled
              </h1>
              <p className="text-muted-foreground font-sans text-xs mt-0.5">
                Never open your closet wondering what to wear again
              </p>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={toggleNotifications}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className={`p-2.5 rounded-xl transition-colors ${
                  notificationsEnabled
                    ? "bg-primary/15 text-primary"
                    : "bg-secondary text-muted-foreground"
                }`}
                title={notificationsEnabled ? "Reminders on" : "Enable reminders"}
              >
                {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellSlash className="h-4 w-4" />}
              </motion.button>
              <motion.button
                onClick={autoFillWeek}
                disabled={autoFilling}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-sans font-semibold gold-gradient text-primary-foreground shadow-[0_4px_12px_-2px_hsl(var(--gold)/0.4)] disabled:opacity-50"
              >
                {autoFilling ? <Spinner className="h-3.5 w-3.5 animate-spin" /> : <Sparkle className="h-3.5 w-3.5" />}
                {autoFilling ? "Generating..." : "Auto-Fill Week"}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Weather Banner */}
        {todayWeather && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-5 rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md shadow-lg shadow-forest/40 p-4 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--secondary)) 100%)",
              border: "1px solid hsl(var(--border))",
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] gold-gradient opacity-60" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  {weatherCodeToIcon(todayWeather.code)}
                </div>
                <div>
                  <p className="font-sans text-xs text-muted-foreground">What the Weather Demands</p>
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
                    <Drop className="w-3 h-3" /> Rain likely
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
            <CaretLeft className="w-4 h-4 text-foreground" />
          </button>
          <h2 className="font-display text-base font-bold text-foreground tracking-wide">{format(currentMonth, "MMMM yyyy")}</h2>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2.5 rounded-xl hover:bg-secondary transition-colors">
            <CaretRight className="w-4 h-4 text-foreground" />
          </button>
        </motion.div>

        {/* Premium Calendar Grid */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl overflow-hidden mb-5 border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md shadow-lg shadow-forest/40"
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
                  className={`min-h-[160px] p-1.5 border-b border-r border-border/30 text-left transition-all relative group flex flex-col
                    ${!inMonth ? "opacity-20" : ""}
                    ${selected ? "ring-1 ring-primary/30 ring-inset" : "hover:bg-secondary/40"}
                    ${todayFlag && !dayEvents.length ? "bg-primary/5" : ""}
                  `}
                >
                  <div className="flex items-center justify-between w-full shrink-0">
                    <span className={`text-[10px] font-sans leading-none ${
                      todayFlag
                        ? "w-5 h-5 rounded-full gold-gradient text-primary-foreground flex items-center justify-center font-bold text-[10px] z-10"
                        : "text-muted-foreground"
                    }`}>
                      {format(d, "d")}
                    </span>
                    {weather && inMonth && (
                      <span className="opacity-30 text-[8px]">
                        {weatherCodeToIcon(weather.code)}
                      </span>
                    )}
                  </div>
                  {dayEvents.length > 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center w-full mt-0.5 min-h-0">
                      {(() => {
                        const allPhotos: string[] = [];
                        let hasMannequin = false;
                        let mannequinUrl = "";
                        dayEvents.forEach(ev => {
                          if (ev.mannequin_image_url) { hasMannequin = true; mannequinUrl = ev.mannequin_image_url; }
                          const items = Array.isArray(ev.outfit_items) ? ev.outfit_items : [];
                          items.forEach((item: any) => {
                            if (typeof item === "string") {
                              const url = closetMap.get(item.toLowerCase());
                              if (url) allPhotos.push(url);
                            } else {
                              const url = item?.photo_url || item?.photoUrl || item?.image_url || item?.imageUrl || item?.url;
                              if (url) allPhotos.push(url);
                            }
                          });
                        });

                        // Split-screen for DressingRoom outfits in day cell
                        // Detect DressingRoom outfits by checking for items with `url` key
                        const hasDressingRoomItems = dayEvents.some(ev => {
                          const evItems = Array.isArray(ev.outfit_items) ? ev.outfit_items : [];
                          return evItems.some((i: any) => i.url);
                        });
                        if (allPhotos.length === 0 && hasDressingRoomItems) {
                          const firstOutfitEv = dayEvents.find(ev => {
                            const evItems = Array.isArray(ev.outfit_items) ? ev.outfit_items : [];
                            return evItems.some((i: any) => i.url);
                          });
                          if (firstOutfitEv) {
                            const evItems = Array.isArray(firstOutfitEv.outfit_items) ? firstOutfitEv.outfit_items : [];
                            if (evItems.some((i: any) => i.url)) {
                              return (
                                <div className="flex-1 w-full rounded-lg overflow-hidden" style={{ minHeight: "60px" }}>
                                  <OutfitComposition items={evItems} minHeight="60px" showDividers={false} />
                                </div>
                              );
                            }
                          }
                        }

                        if (hasMannequin) {
                          return (
                            <div className="flex-1 flex items-center justify-center w-full rounded-lg bg-white/95 dark:bg-white/90 p-0.5 overflow-hidden">
                              <img loading="lazy" src={mannequinUrl} alt="" className="max-h-[80px] w-auto object-contain transition-transform duration-200 group-hover:scale-105" style={{ mixBlendMode: "multiply" }} />
                            </div>
                          );
                        }

                        if (allPhotos.length > 0) {
                          const visible = allPhotos.slice(0, 3);
                          const extra = allPhotos.length - 3;
                          return (
                            <div className="flex flex-col items-center justify-center gap-2 flex-1 rounded-lg bg-white/95 dark:bg-white/90 py-2 px-1 w-full transition-transform duration-200 group-hover:scale-105 overflow-hidden">
                              {visible.map((url, pi) => (
                                <div key={pi} className="w-12 h-12 rounded-full shadow-md border border-zinc-200 dark:border-zinc-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                                  <img
                                    src={url}
                                    alt=""
                                    className="w-full h-full object-cover pointer-events-none"
                                  />
                                </div>
                              ))}
                              {extra > 0 && (
                                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 flex items-center justify-center text-xs font-bold border border-zinc-200 dark:border-zinc-600 flex-shrink-0">
                                  +{extra}
                                </div>
                              )}
                            </div>
                          );
                        }

                        // Fallback: small dot indicator with occasion color
                        return (
                          <div className="flex gap-0.5 items-center justify-center mt-1">
                            {dayEvents.slice(0, 3).map(ev => (
                              <div key={ev.id} className="w-1.5 h-1.5 rounded-full bg-primary" />
                            ))}
                          </div>
                        );
                      })()}
                      {dayEvents.length > 1 && (
                        <span className="text-[7px] text-muted-foreground/50 font-sans mt-0.5">{dayEvents.length}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Selected Date Panel — smooth expand/collapse */}
        <AnimatePresence mode="wait">
          {selectedDate && (
            <motion.div
              key={format(selectedDate, "yyyy-MM-dd")}
              initial={{ opacity: 0, scaleY: 0, scale: 0.97 }}
              animate={{ opacity: 1, scaleY: 1, scale: 1 }} style={{ transformOrigin: "top" }}
              exit={{ opacity: 0, scaleY: 0, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
              className="rounded-2xl mb-5 border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md shadow-lg shadow-forest/40 relative overflow-hidden"
              style={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                boxShadow: "0 8px 32px -8px hsl(var(--foreground) / 0.06)",
              }}
            >
              <div className="p-5">
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
                        {w.rain && <Drop className="w-3 h-3 text-blue-400" />}
                      </div>
                    );
                  })()}
                  <Button size="sm" variant="outline" onClick={duplicateYesterday} className="gap-1 rounded-xl text-xs" title="Copy yesterday's outfit">
                    <CopySimple className="w-3 h-3" />
                  </Button>
                  <Button size="sm" onClick={() => setShowAddDialog(true)} className="gap-1.5 rounded-xl">
                    <Plus className="w-3.5 h-3.5" /> Add
                  </Button>
                </div>
              </div>

              {getEventsForDate(selectedDate).length === 0 ? (
                <div className="text-center py-8 pl-3">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/60 flex items-center justify-center mx-auto mb-3">
                    <TShirt className="w-6 h-6 text-muted-foreground/40" />
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
                      className="rounded-xl overflow-hidden backdrop-blur-sm"
                      style={{
                        background: "hsl(var(--card) / 0.6)",
                        border: "1px solid hsl(var(--border) / 0.5)",
                        borderLeft: "3px solid hsl(var(--primary))",
                      }}
                    >
                      {/* Outfit photo thumbnails / mannequin hero */}
                      {(() => {
                        const items = Array.isArray(ev.outfit_items) ? ev.outfit_items : [];
                        const resolvedPhotos: string[] = [];
                        items.forEach((item: any) => {
                          if (typeof item === "string") {
                            const url = closetMap.get(item.toLowerCase());
                            if (url) resolvedPhotos.push(url);
                          } else {
                            const url = item?.photo_url || item?.photoUrl || item?.image_url || item?.imageUrl || item?.url;
                            if (url) resolvedPhotos.push(url);
                          }
                        });
                        const photos = resolvedPhotos.slice(0, 5);

                        // Split-screen layout for DressingRoom outfits
                        if (items.length > 0 && items.some((i: any) => i.url)) {
                          return (
                            <div className="p-3 pb-0">
                              <OutfitComposition items={items} minHeight="100px" maxHeight="200px" showDividers={true} />
                            </div>
                          );
                        }

                        if (ev.mannequin_image_url) {
                          return (
                            <div className="p-3 pb-0">
                              <div className="rounded-lg bg-white/95 dark:bg-white/90 overflow-hidden flex items-center justify-center" style={{ minHeight: "120px" }}>
                                <img
                                  src={ev.mannequin_image_url}
                                  alt="Outfit preview"
                                  className="w-full h-32 object-contain"
                                  style={{ mixBlendMode: "multiply" }}
                                />
                              </div>
                            </div>
                          );
                        }

                        if (photos.length > 0) {
                          const handleDragStart = (idx: number) => setDragIdx(idx);
                          const handleDragOver = (e: React.DragEvent) => e.preventDefault();
                          const handleDrop = async (targetIdx: number) => {
                            if (dragIdx === null || dragIdx === targetIdx) return;
                            const newItems = [...items];
                            const [moved] = newItems.splice(dragIdx, 1);
                            newItems.splice(targetIdx, 0, moved);
                            setDragIdx(null);
                            const updatedEvents = events.map(e => e.id === ev.id ? { ...e, outfit_items: newItems } : e);
                            setEvents(updatedEvents);
                            await updateEventOutfit(ev.id, newItems);
                          };
                          // Compact 3-row layout: Top / Bottom+Accessory / Shoes
                          return (
                            <div className="p-3 pb-1">
                              <div className="flex flex-col items-center gap-1 py-2 rounded-xl bg-white/95 dark:bg-white/90 px-3">
                                {/* Row 1: Top (Index 0) - Centered */}
                                {photos[0] && (
                                  <div
                                    draggable
                                    onDragStart={() => handleDragStart(0)}
                                    onDragOver={handleDragOver}
                                    onDrop={() => handleDrop(0)}
                                    className="w-10 h-10 rounded-full shadow-sm border border-zinc-200 dark:border-zinc-700 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing transition-all hover:ring-2 hover:ring-primary/30"
                                  >
                                    <img loading="lazy" src={photos[0]} alt="Top" className="w-full h-full object-cover pointer-events-none" style={{ mixBlendMode: "multiply" }} />
                                  </div>
                                )}

                                {/* Row 2: Bottom (Index 1) + Accessory (Index 3) - Side by Side */}
                                {(photos[1] || photos[3]) && (
                                  <div className="flex gap-1 items-center justify-center">
                                    {photos[1] && (
                                      <div
                                        draggable
                                        onDragStart={() => handleDragStart(1)}
                                        onDragOver={handleDragOver}
                                        onDrop={() => handleDrop(1)}
                                        className="w-10 h-10 rounded-full shadow-sm border border-zinc-200 dark:border-zinc-700 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing transition-all hover:ring-2 hover:ring-primary/30"
                                      >
                                        <img loading="lazy" src={photos[1]} alt="Bottom" className="w-full h-full object-cover pointer-events-none" style={{ mixBlendMode: "multiply" }} />
                                      </div>
                                    )}
                                    {photos[3] && (
                                      <div
                                        draggable
                                        onDragStart={() => handleDragStart(3)}
                                        onDragOver={handleDragOver}
                                        onDrop={() => handleDrop(3)}
                                        className="w-10 h-10 rounded-full shadow-sm border border-zinc-200 dark:border-zinc-700 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing transition-all hover:ring-2 hover:ring-primary/30"
                                      >
                                        <img loading="lazy" src={photos[3]} alt="Accessory" className="w-full h-full object-cover pointer-events-none" style={{ mixBlendMode: "multiply" }} />
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Row 3: Shoes (Index 2) - Centered below */}
                                {photos[2] && (
                                  <div
                                    draggable
                                    onDragStart={() => handleDragStart(2)}
                                    onDragOver={handleDragOver}
                                    onDrop={() => handleDrop(2)}
                                    className="w-10 h-10 rounded-full shadow-sm border border-zinc-200 dark:border-zinc-700 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing transition-all hover:ring-2 hover:ring-primary/30"
                                  >
                                    <img loading="lazy" src={photos[2]} alt="Shoes" className="w-full h-full object-cover pointer-events-none" style={{ mixBlendMode: "multiply" }} />
                                  </div>
                                )}

                                {/* Overflow badge for 5+ items */}
                                {photos.length > 4 && (
                                  <div className="w-8 h-8 rounded-full bg-zinc-700 text-white flex items-center justify-center text-[10px] border border-zinc-600">
                                    +{photos.length - 4}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                      <div className="flex items-center gap-3 p-3.5">
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-sm font-semibold text-foreground truncate">{ev.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {ev.occasion && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-sans font-medium"
                                style={{ background: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))" }}>
                                {ev.occasion}
                              </span>
                            )}
                            {ev.notes && (
                              <p className="font-sans text-[10px] text-muted-foreground/70 truncate">{ev.notes}</p>
                            )}
                          </div>
                          {/* AI Style Tip */}
                          {(() => {
                            const w = selectedDate ? getWeatherForDate(selectedDate) : undefined;
                            const tip = getStyleTip(ev.occasion, w);
                            if (!tip) return null;
                            return (
                              <p className="mt-1.5 text-[10px] font-sans italic px-0.5"
                                style={{ color: "hsl(var(--primary) / 0.8)" }}>
                                {tip}
                              </p>
                            );
                          })()}
                          {(() => {
                            const repeat = detectRepeat(ev);
                            if (!repeat.isRepeat) return null;
                            const matchStr = repeat.matchDate
                              ? format(new Date(repeat.matchDate + "T00:00:00"), "MMM d")
                              : "recently";
                            const suggestions = getUnderusedSuggestions(ev);
                            return (
                              <div className="mt-1.5 space-y-1.5">
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-sans"
                                  style={{
                                    background: "hsl(35 90% 55% / 0.12)",
                                    color: "hsl(35 90% 40%)",
                                    border: "1px solid hsl(35 90% 55% / 0.2)",
                                  }}>
                                  <ArrowsClockwise className="w-3 h-3" />
                                  <span>Same combo worn on {matchStr} — try mixing it up!</span>
                                </div>
                                {suggestions.length > 0 && (
                                  <div className="flex items-start gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-sans"
                                    style={{
                                      background: "hsl(var(--primary) / 0.08)",
                                      border: "1px solid hsl(var(--primary) / 0.15)",
                                      color: "hsl(var(--primary))",
                                    }}>
                                    <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <span className="font-medium">Try swapping in:</span>
                                      <div className="flex gap-1.5 mt-1 flex-wrap">
                                        {suggestions.map(s => (
                                          <span key={s.id} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md"
                                            style={{ background: "hsl(var(--primary) / 0.12)" }}>
                                            {s.photo_url && <img loading="lazy" src={s.photo_url} alt="" className="w-4 h-4 rounded object-contain bg-white" style={{ mixBlendMode: "multiply" }} />}
                                            {s.name || s.category}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => shareOutfitCard(ev)}
                            className="text-muted-foreground/50 hover:text-primary p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                            title="Share outfit"
                          >
                            <ShareNetwork className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setFlatLayEvent(ev)}
                            className="text-muted-foreground/50 hover:text-primary p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                            title="Flat-Lay View"
                          >
                            <StackSimple className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditDialog(ev)}
                            className="text-muted-foreground/50 hover:text-primary p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteEvent(ev.id)}
                            className="text-muted-foreground/40 hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Weather Recommendations */}
              {selectedDate && getEventsForDate(selectedDate).length > 0 && (() => {
                const allItems = getEventsForDate(selectedDate).flatMap(ev => Array.isArray(ev.outfit_items) ? ev.outfit_items : []);
                const recs = getWeatherRecommendations(selectedDate, allItems);
                if (recs.length === 0) return null;
                return (
                  <div className="mt-3 space-y-1.5 pl-3">
                    {recs.map((rec, ri) => (
                      <motion.div
                        key={ri}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: ri * 0.08 }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-sans"
                        style={{
                          background: rec.severity === "warn"
                            ? "hsl(var(--destructive) / 0.08)"
                            : "hsl(var(--primary) / 0.08)",
                          border: `1px solid ${rec.severity === "warn" ? "hsl(var(--destructive) / 0.15)" : "hsl(var(--primary) / 0.15)"}`,
                          color: rec.severity === "warn" ? "hsl(var(--destructive))" : "hsl(var(--primary))",
                        }}
                      >
                        {rec.icon}
                        <span>{rec.text}</span>
                      </motion.div>
                    ))}
                  </div>
                );
              })()}
              </div>
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
            <div className="flex items-center gap-2 mb-3">
              <p className="text-[10px] font-sans font-semibold text-muted-foreground uppercase tracking-[0.15em]">
                7-Day Forecast
              </p>
              {userLocation.city && (
                <span className="flex items-center gap-0.5 text-[10px] font-sans text-muted-foreground/60">
                  <MapPin className="w-2.5 h-2.5" /> {userLocation.city}
                </span>
              )}
            </div>
            <div className="flex gap-1 overflow-x-auto pb-1">
              {weatherData.slice(0, 7).map((w) => {
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
                    {w.rain && <Drop className="w-2.5 h-2.5 text-blue-400" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Calendar Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl p-4 grid grid-cols-3 gap-3 mb-5"
          style={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
          }}
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CalendarDots className="w-3.5 h-3.5 text-primary" />
            </div>
            <p className="font-display text-lg font-bold text-foreground">{calendarStats.planned}</p>
            <p className="text-[9px] font-sans text-muted-foreground">Outfits Planned</p>
          </div>
          <div className="text-center border-x border-border/40">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <p className="font-display text-lg font-bold text-foreground">{calendarStats.streak}</p>
            <p className="text-[9px] font-sans text-muted-foreground">Day Streak</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <ChartBar className="w-3.5 h-3.5 text-primary" />
            </div>
            <p className="font-display text-sm font-bold text-foreground capitalize">{calendarStats.topCategory}</p>
            <p className="text-[9px] font-sans text-muted-foreground">Top Category</p>
          </div>
        </motion.div>

        {/* View Monthly Report Link */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          onClick={() => navigate("/monthly-report")}
          className="w-full rounded-2xl p-3.5 flex items-center justify-between mb-5 group transition-colors hover:bg-secondary/60"
          style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--primary) / 0.12)" }}>
              <ChartBar className="w-4 h-4 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-xs font-sans font-semibold text-foreground">Monthly Style Report</p>
              <p className="text-[10px] font-sans text-muted-foreground">Variety score, color stats & more</p>
            </div>
          </div>
          <CaretRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </motion.button>


        {streakRewards.streak > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl p-4 mb-5"
            style={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-primary" />
              <p className="text-[10px] font-sans font-semibold text-muted-foreground uppercase tracking-[0.15em]">
                Planning Streak
              </p>
            </div>
            {/* Progress to next milestone */}
            {streakRewards.next && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-sans font-medium text-foreground">
                    {streakRewards.next.icon} {streakRewards.next.name}
                  </span>
                  <span className="text-[10px] font-sans text-muted-foreground">
                    {streakRewards.streak}/{streakRewards.next.days} days
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "hsl(var(--muted))" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${streakRewards.progress}%` }}
                    transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                    className="h-full rounded-full gold-gradient"
                  />
                </div>
              </div>
            )}
            {/* Earned badges */}
            {streakRewards.current.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {streakRewards.current.map(m => (
                  <motion.div
                    key={m.badge}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-sans font-medium"
                    style={{
                      background: "hsl(var(--primary) / 0.12)",
                      color: "hsl(var(--primary))",
                      border: "1px solid hsl(var(--primary) / 0.2)",
                    }}
                  >
                    <span>{m.icon}</span>
                    <span>{m.name}</span>
                  </motion.div>
                ))}
              </div>
            )}
            {!streakRewards.next && (
              <p className="text-xs font-sans text-primary font-medium flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5" /> All milestones achieved — legendary streak!
              </p>
            )}
          </motion.div>
        )}

        {/* Add Event Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-display flex items-center gap-2">
                <CalendarDots className="h-5 w-5 text-primary" /> Plan Outfit
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

              {/* Manual Clothing Picker */}
              {!newEvent.outfitId && closetItems.length === 0 && (
                <div className="text-center py-4 px-2 rounded-xl border border-dashed border-gold/20">
                  <TShirt className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Your closet is empty.</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5">Add items to the Closet page first.</p>
                </div>
              )}
              {!newEvent.outfitId && closetItems.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-sans font-medium text-muted-foreground">Or pick items from your closet:</p>
                  {/* Mini Outfit Preview */}
                  {newEvent.manualItems.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {newEvent.manualItems.map(itemId => {
                        const ci = closetItems.find(c => c.id === itemId);
                        if (!ci) return null;
                        return (
                          <button
                            key={ci.id}
                            type="button"
                            onClick={() => setNewEvent(p => ({ ...p, manualItems: p.manualItems.filter(id => id !== ci.id) }))}
                            className="relative w-12 h-14 rounded-lg bg-emerald/60 flex-shrink-0 flex items-center justify-center overflow-hidden ring-1 ring-gold/30 group"
                          >
                            {ci.photo_url ? (
                              <img loading="lazy" src={ci.photo_url} alt="" className="w-full h-full object-contain" style={{ mixBlendMode: "multiply" }} />
                            ) : (
                              <TShirt className="w-5 h-5 text-muted-foreground/30" />
                            )}
                            <div className="absolute inset-0 bg-destructive/0 group-hover:bg-destructive/20 transition-colors flex items-center justify-center">
                              <X className="w-3 h-3 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto rounded-xl p-2">
                    {closetItems.map(ci => {
                      const isSelected = newEvent.manualItems.includes(ci.id);
                      return (
                        <button
                          key={ci.id}
                          type="button"
                          onClick={() => setNewEvent(p => ({
                            ...p,
                            manualItems: isSelected
                              ? p.manualItems.filter(id => id !== ci.id)
                              : [...p.manualItems, ci.id]
                          }))}
                          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[11px] font-sans transition-all ${
                            isSelected
                              ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                              : "bg-white/5 hover:bg-white/10 text-muted-foreground"
                          }`}
                        >
                          {ci.photo_url ? (
                            <div className="w-12 h-14 rounded-lg bg-white/90 flex items-center justify-center overflow-hidden">
                              <img loading="lazy" src={ci.photo_url} alt="" className="w-full h-full object-contain" style={{ mixBlendMode: "multiply" }} />
                            </div>
                          ) : (
                            <div className="w-12 h-14 rounded-lg bg-white/5 flex items-center justify-center">
                              <TShirt className="w-5 h-5 text-muted-foreground/30" />
                            </div>
                          )}
                          <span className="truncate w-full text-center text-[10px]">{ci.name || 'Item'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}


              <Input placeholder="Notes (optional)" value={newEvent.notes} onChange={e => setNewEvent(p => ({ ...p, notes: e.target.value }))} />
              <Button onClick={addEvent} disabled={!newEvent.title.trim()} className="w-full gold-gradient text-primary-foreground font-sans">
                Save to Calendar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Event Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-display flex items-center gap-2">
                <Pencil className="h-5 w-5 text-primary" /> Edit Outfit
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <Input placeholder="Event name" value={editEvent.title} onChange={e => setEditEvent(p => ({ ...p, title: e.target.value }))} />
              <Select value={editEvent.occasion} onValueChange={v => setEditEvent(p => ({ ...p, occasion: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {occasions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>

              {/* Manual Clothing Picker for Edit */}
              {!editEvent.outfitId && closetItems.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-sans font-medium text-muted-foreground">Or pick items from your closet:</p>
                  {/* Mini Outfit Preview */}
                  {editEvent.manualItems.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {editEvent.manualItems.map(itemId => {
                        const ci = closetItems.find(c => c.id === itemId);
                        if (!ci) return null;
                        return (
                          <button
                            key={ci.id}
                            type="button"
                            onClick={() => setEditEvent(p => ({ ...p, manualItems: p.manualItems.filter(id => id !== ci.id) }))}
                            className="relative w-12 h-14 rounded-lg bg-emerald/60 flex-shrink-0 flex items-center justify-center overflow-hidden ring-1 ring-gold/30 group"
                          >
                            {ci.photo_url ? (
                              <img loading="lazy" src={ci.photo_url} alt="" className="w-full h-full object-contain" style={{ mixBlendMode: "multiply" }} />
                            ) : (
                              <TShirt className="w-5 h-5 text-muted-foreground/30" />
                            )}
                            <div className="absolute inset-0 bg-destructive/0 group-hover:bg-destructive/20 transition-colors flex items-center justify-center">
                              <X className="w-3 h-3 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-border/50 p-2 space-y-2">
                    {Object.entries(closetCategoryMap).map(([label, cats]) => {
                      const catItems = closetItems.filter(c => cats.includes(c.category.toLowerCase()));
                      if (catItems.length === 0) return null;
                      return (
                        <div key={label}>
                          <p className="text-[10px] font-sans font-semibold text-muted-foreground uppercase tracking-wider mb-1 mt-1">{label}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {catItems.map(ci => {
                              const isSelected = editEvent.manualItems.includes(ci.id);
                              return (
                                <button
                                  key={ci.id}
                                  type="button"
                                  onClick={() => setEditEvent(p => ({
                                    ...p,
                                    manualItems: isSelected
                                      ? p.manualItems.filter(id => id !== ci.id)
                                      : [...p.manualItems, ci.id]
                                  }))}
                                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-sans transition-all ${
                                    isSelected
                                      ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                                  }`}
                                >
                                  {ci.photo_url && (
                                    <img loading="lazy" src={ci.photo_url} alt="" className="w-5 h-5 rounded object-contain bg-white" style={{ mixBlendMode: "multiply" }} />
                                  )}
                                  <span className="truncate max-w-[80px]">{ci.name || label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <Input placeholder="Notes (optional)" value={editEvent.notes} onChange={e => setEditEvent(p => ({ ...p, notes: e.target.value }))} />
              <Button onClick={updateEvent} disabled={!editEvent.title.trim()} className="w-full gold-gradient text-primary-foreground font-sans">
                Update Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Flat-Lay Composition Dialog */}
        <Dialog open={!!flatLayEvent} onOpenChange={(open) => { if (!open) setFlatLayEvent(null); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display flex items-center gap-2">
                <StackSimple className="h-5 w-5 text-primary" /> Flat-Lay View
              </DialogTitle>
            </DialogHeader>
            {flatLayEvent && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-sans text-sm font-semibold text-foreground">{flatLayEvent.title}</p>
                    <p className="text-xs font-sans text-muted-foreground">{flatLayEvent.occasion} • {format(new Date(flatLayEvent.event_date + "T00:00:00"), "MMM d")}</p>
                  </div>
                </div>

                {(() => {
                    const flItems = Array.isArray(flatLayEvent?.outfit_items) ? flatLayEvent.outfit_items : [];
                    const hasUrlItems = flItems.some((i: any) => i.url);
                    // DressingRoom outfits: vertical split-screen via shared component
                    if (hasUrlItems) {
                      return (
                        <div className="rounded-xl overflow-hidden" style={{ minHeight: "300px" }}>
                          <OutfitComposition items={flItems} minHeight="300px" className="h-80" aspectRatio="9/16" showDividers={true} />
                        </div>
                      );
                    }
                    // Mannequin image (legacy outfits)
                    if (flatLayEvent.mannequin_image_url) {
                      return (
                        <div className="rounded-xl overflow-hidden" style={{ background: "hsl(40 30% 96%)", border: "1px solid hsl(var(--border) / 0.4)" }}>
                          <img
                            src={flatLayEvent.mannequin_image_url}
                            alt="Outfit"
                            className="w-full h-64 object-contain p-4"
                            style={{ mixBlendMode: "multiply" }}
                          />
                        </div>
                      );
                    }
                    // Fallback: grid of closet items
                    return (
                      <div className="grid grid-cols-2 gap-3">
                        {flItems.map((item: any, idx: number) => {
                          const photoUrl = item?.photo_url || item?.photoUrl || item?.image_url || item?.imageUrl || item?.url;
                          const itemName = item?.name || item?.category || `Item ${idx + 1}`;
                          return (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.06 }}
                              className="rounded-xl overflow-hidden"
                              style={{
                                background: "hsl(40 30% 96%)",
                                border: "1px solid hsl(var(--border) / 0.4)",
                                boxShadow: "0 3px 12px -3px hsl(var(--foreground) / 0.08)",
                              }}
                            >
                              {photoUrl ? (
                                <div className="p-3">
                                  <img loading="lazy" src={photoUrl} alt={itemName} className="w-full aspect-square object-contain" style={{ mixBlendMode: "multiply" }} />
                                </div>
                              ) : (
                                <div className="w-full aspect-square flex items-center justify-center" style={{ background: "hsl(var(--muted) / 0.2)" }}>
                                  <TShirt className="w-8 h-8 text-muted-foreground/30" />
                                </div>
                              )}
                              <div className="px-3 pb-2.5">
                                <p className="text-xs font-medium text-foreground truncate">{itemName}</p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    );
                  })()
                }

                {flatLayEvent.notes && (
                  <p className="text-xs text-muted-foreground italic text-center">"{flatLayEvent.notes}"</p>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default OutfitCalendar;
