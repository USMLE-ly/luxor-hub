import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserProfile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  [key: string]: any;
}

export interface StyleProfile {
  user_id: string;
  onboarding_completed: boolean | null;
  archetype: string | null;
  style_score: number | null;
  preferences: Record<string, any> | null;
  [key: string]: any;
}

/**
 * Shared hook for fetching user profile + style profile.
 * Eliminates 12 profile queries + 19 style_profiles queries across pages.
 */
export function useUserProfile(options?: { columns?: string; styleColumns?: string }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [styleProfile, setStyleProfile] = useState<StyleProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const columns = options?.columns || "user_id, display_name, avatar_url, bio";
  const styleColumns = options?.styleColumns || "*";

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [profileRes, styleRes] = await Promise.all([
        supabase.from("profiles").select(columns).eq("user_id", user.id).single(),
        supabase.from("style_profiles").select(styleColumns).eq("user_id", user.id).single(),
      ]);
      if (profileRes.data) setProfile(profileRes.data as UserProfile);
      if (styleRes.data) setStyleProfile(styleRes.data as StyleProfile);
      setError(null);
    } catch (e: any) {
      setError(e.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [user?.id, columns, styleColumns]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, styleProfile, loading, error, refetch: fetchProfile };
}
