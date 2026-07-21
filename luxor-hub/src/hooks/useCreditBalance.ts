import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface CreditBalance {
  credits_allocated: number;
  credits_remaining: number;
  month: string;
  tier: string;
}

export function useCreditBalance() {
  const { user } = useAuth();

  return useQuery<CreditBalance>({
    queryKey: ["credit-balance", user?.id],
    queryFn: async () => {
      if (!user) {
        return { credits_allocated: 30, credits_remaining: 30, month: "", tier: "free" };
      }

      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) {
        return { credits_allocated: 30, credits_remaining: 30, month: "", tier: "free" };
      }

      const apiUrl = import.meta.env.VITE_API_URL || "";
      const resp = await fetch(`${apiUrl}/api/v1/credits/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!resp.ok) {
        return { credits_allocated: 30, credits_remaining: 30, month: "", tier: "free" };
      }

      return resp.json();
    },
    enabled: !!user,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}
