import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface StreakInfo {
  current_streak: number;
  longest_streak: number;
  total_login_days: number;
  last_login_date: string | null;
  next_milestone_days: number;
  next_milestone_credits: number;
  next_milestone_label: string;
}

interface LoginResult {
  current_streak: number;
  longest_streak: number;
  total_login_days: number;
  streak_milestone_reached: boolean;
  milestone_days: number;
  bonus_credits: number;
  new_balance?: number;
}

const DEFAULT_STREAK: StreakInfo = {
  current_streak: 0,
  longest_streak: 0,
  total_login_days: 0,
  last_login_date: null,
  next_milestone_days: 1,
  next_milestone_credits: 2,
  next_milestone_label: "First Day",
};

export function useStreak() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const streakQuery = useQuery<StreakInfo>({
    queryKey: ["streak-info", user?.id],
    queryFn: async () => {
      if (!user) return DEFAULT_STREAK;
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) return DEFAULT_STREAK;

      const apiUrl = import.meta.env.VITE_API_URL || "";
      if (!apiUrl) return DEFAULT_STREAK;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      try {
        const resp = await fetch(`${apiUrl}/api/v1/streak/info`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!resp.ok) return DEFAULT_STREAK;
        const data = await resp.json();
        return { ...DEFAULT_STREAK, ...data };
      } catch {
        clearTimeout(timeoutId);
        return DEFAULT_STREAK;
      }
    },
    enabled: !!user,
    staleTime: 300_000,
    refetchOnWindowFocus: false,
  });

  const recordLogin = async (): Promise<LoginResult | null> => {
    if (!user) return null;
    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;
    if (!token) return null;

    const apiUrl = import.meta.env.VITE_API_URL || "";
    if (!apiUrl) return null;

    try {
      const resp = await fetch(`${apiUrl}/api/v1/streak/login`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (!resp.ok) return null;
      const data = await resp.json();
      queryClient.invalidateQueries({ queryKey: ["streak-info"] });
      queryClient.invalidateQueries({ queryKey: ["credit-balance"] });
      return data;
    } catch {
      return null;
    }
  };

  const claimBonus = async (streakDays: number) => {
    if (!user) return null;
    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;
    if (!token) return null;

    const apiUrl = import.meta.env.VITE_API_URL || "";
    if (!apiUrl) return null;

    try {
      const resp = await fetch(`${apiUrl}/api/v1/streak/claim`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ streak_days: streakDays }),
      });
      if (!resp.ok) return null;
      const data = await resp.json();
      queryClient.invalidateQueries({ queryKey: ["streak-info"] });
      queryClient.invalidateQueries({ queryKey: ["credit-balance"] });
      return data;
    } catch {
      return null;
    }
  };

  return { ...streakQuery, recordLogin, claimBonus };
}
