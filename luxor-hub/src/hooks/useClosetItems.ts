import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ClosetItem {
  id: string;
  name: string | null;
  category: string | null;
  color: string | null;
  photo_url: string | null;
  image_url: string | null;
  price: number | null;
  brand: string | null;
  occasion: string | null;
  fit: string | null;
  fabric: string | null;
  created_at: string;
  [key: string]: any; // Allow extra columns from different select patterns
}

/**
 * Shared hook for fetching closet items.
 * Eliminates duplicate Supabase queries across 13+ pages.
 * 
 * Usage:
 *   const { items, loading, error, refetch } = useClosetItems();
 *   const { items } = useClosetItems({ columns: "id, name, category, color, photo_url" });
 */
export function useClosetItems(options?: {
  columns?: string;
  limit?: number;
  orderBy?: string;
}) {
  const { user } = useAuth();
  const [items, setItems] = useState<ClosetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const columns = options?.columns || "*";
  const limit = options?.limit || 500;
  const orderBy = options?.orderBy || "created_at";

  const fetchItems = useCallback(async () => {
    if (!user?.id) {
      setItems([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("clothing_items")
        .select(columns)
        .eq("user_id", user.id)
        .order(orderBy, { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;
      setItems((data as ClosetItem[]) || []);
      setError(null);
    } catch (e: any) {
      setError(e.message || "Failed to load closet");
    } finally {
      setLoading(false);
    }
  }, [user?.id, columns, limit, orderBy]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, loading, error, refetch: fetchItems };
}
