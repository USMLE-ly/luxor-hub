/**
 * Service layer for outfits table.
 */
import { supabase } from "@/integrations/supabase/client";

export interface SavedOutfit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  occasion: string | null;
  mood: string | null;
  mannequin_items: any;
  mannequin_image_url: string | null;
  is_favorite: boolean;
  created_at: string;
  outfit_items?: any;
}

/** Fetch all outfits for a user (with outfit_items relation) */
export async function fetchOutfits(userId: string): Promise<SavedOutfit[]> {
  const { data } = await supabase
    .from("outfits")
    .select("*, outfit_items(clothing_item_id)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data as SavedOutfit[]) || [];
}

/** Fetch recent outfits with limited columns (for dashboard) */
export async function fetchRecentOutfits(
  userId: string,
  limit = 6
): Promise<{ id: string; name: string; occasion: string | null }[]> {
  const { data } = await supabase
    .from("outfits")
    .select("id, name, occasion")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as any[]) || [];
}

/** Count total outfits for a user */
export async function countOutfits(userId: string): Promise<number> {
  const { count } = await supabase
    .from("outfits")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  return count || 0;
}

/** Insert a new outfit */
export async function insertOutfit(
  outfit: Omit<SavedOutfit, "id" | "created_at">
): Promise<{ data: any; error: string | null }> {
  const { data, error } = await supabase.from("outfits").insert(outfit).select().single();
  return { data, error: error?.message || null };
}

/** Delete an outfit */
export async function deleteOutfit(
  outfitId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("outfits").delete().eq("id", outfitId);
  return { error: error?.message || null };
}

/** Toggle favorite status */
export async function toggleOutfitFavorite(
  outfitId: string,
  isFavorite: boolean
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("outfits")
    .update({ is_favorite: isFavorite })
    .eq("id", outfitId);
  return { error: error?.message || null };
}

/** Fetch saved outfits (with non-empty mannequin_items, for Closet page) */
export async function fetchSavedOutfits(userId: string): Promise<SavedOutfit[]> {
  const { data } = await supabase
    .from("outfits")
    .select("*")
    .eq("user_id", userId)
    .not("mannequin_items", "eq", "[]")
    .order("created_at", { ascending: false });
  return (data as SavedOutfit[]) || [];
}
