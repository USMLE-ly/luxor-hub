import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface CreditBalance {
  credits_allocated: number;
  credits_remaining: number;
  month: string;
  tier: string;
}

const DEFAULT_BALANCE: CreditBalance = {
  credits_allocated: 30,
  credits_remaining: 30,
  month: "",
  tier: "free",
};

export function useCreditBalance() {
  const { user } = useAuth();

  return useQuery<CreditBalance>({
    queryKey: ["credit-balance", user?.id],
    queryFn: async () => {
      if (!user) return DEFAULT_BALANCE;

      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) return DEFAULT_BALANCE;

      const apiUrl = import.meta.env.VITE_API_URL || "";
      if (!apiUrl) return DEFAULT_BALANCE;

      // 8-second timeout prevents hanging on sleeping backends
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      try {
        const resp = await fetch(`${apiUrl}/api/v1/credits/balance`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!resp.ok) return DEFAULT_BALANCE;
        const data = await resp.json();
        return {
          credits_allocated: data.credits_allocated ?? 30,
          credits_remaining: data.credits_remaining ?? 30,
          month: data.month ?? "",
          tier: data.tier ?? "free",
        };
      } catch (err) {
        clearTimeout(timeoutId);
        // Timeout or network error — return defaults silently
        console.warn("[CREDITS] Balance fetch failed, using defaults:", err);
        return DEFAULT_BALANCE;
      }
    },
    enabled: !!user,
    meta: { logSource: "useCreditBalance" },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1,
  });
}
