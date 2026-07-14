/**
 * Service layer for calendar_events table.
 * Centralizes all Supabase queries so pages don't import supabase directly.
 */
import { supabase } from "@/integrations/supabase/client";

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  occasion: string | null;
  notes: string | null;
  outfit_items: any;
  mannequin_image_url: string | null;
  outfit_type?: string;
}

/** Fetch events for a date range */
export async function fetchEventsInRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<CalendarEvent[]> {
  const { data } = await supabase
    .from("calendar_events")
    .select("*")
    .eq("user_id", userId)
    .gte("event_date", startDate)
    .lte("event_date", endDate);
  return (data as CalendarEvent[]) || [];
}

/** Fetch all event dates (for checking which days have events) */
export async function fetchEventDates(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from("calendar_events")
    .select("event_date")
    .eq("user_id", userId);
  return (data || []).map((e: any) => e.event_date);
}

/** Insert a new calendar event */
export async function insertCalendarEvent(
  event: Omit<CalendarEvent, "id">
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("calendar_events").insert(event);
  return { error: error?.message || null };
}

/** Insert multiple calendar events at once */
export async function insertCalendarEvents(
  events: Omit<CalendarEvent, "id">[]
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("calendar_events").insert(events);
  return { error: error?.message || null };
}

/** Update outfit_items for a specific event */
export async function updateEventOutfit(
  eventId: string,
  outfitItems: any
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("calendar_events")
    .update({ outfit_items: outfitItems })
    .eq("id", eventId);
  return { error: error?.message || null };
}

/** Delete a calendar event */
export async function deleteCalendarEvent(
  eventId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("calendar_events")
    .delete()
    .eq("id", eventId);
  return { error: error?.message || null };
}
