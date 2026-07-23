import { useCallback } from "react";
import { useCreditGuard } from "./useCreditGuard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/api";

const API_URL = getApiUrl();

interface AiActionOptions {
  /** Credit action key (e.g., "analyze_outfit", "pro_tweak") */
  action: string;
  /** The backend endpoint to call */
  endpoint: string;
  /** HTTP method */
  method?: "GET" | "POST";
  /** Request body (for POST) */
  body?: Record<string, any>;
  /** Custom error message */
  errorMessage?: string;
  /** Success callback */
  onSuccess?: (data: any) => void;
  /** Called before the API call (for setting loading state) */
  onStart?: () => void;
  /** Called after completion (for clearing loading state) */
  onEnd?: () => void;
}

/**
 * Unified hook that links credits → API → MiMo AI.
 * Every AI action goes through this hook to ensure:
 * 1. Credits are checked before the call
 * 2. The gateway deducts credits server-side
 * 3. The response is returned to the page
 */
export function useAiAction() {
  const { guard, consume, remaining } = useCreditGuard();
  const { user } = useAuth();

  const execute = useCallback(
    async (options: AiActionOptions): Promise<any | null> => {
      const { action, endpoint, method = "POST", body, errorMessage, onSuccess, onStart, onEnd } = options;

      // Step 1: Check credits client-side
      if (!guard(action)) {
        return null;
      }

      // Step 2: Get auth token
      if (!user) {
        toast.error("Please sign in to use AI features");
        return null;
      }

      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) {
        toast.error("Session expired. Please sign in again.");
        return null;
      }

      onStart?.();

      try {
        // Step 3: Call the backend (gateway checks credits + calls MiMo)
        const resp = await fetch(`${API_URL}${endpoint}`, {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: method === "POST" ? JSON.stringify(body) : undefined,
        });

        if (!resp.ok) {
          const errData = await resp.json().catch(() => ({}));

          // Step 4: Handle credit exhaustion from server
          if (resp.status === 429 && errData.code === "CREDITS_EXCEEDED") {
            toast.error(errData.message || "Not enough credits", {
              duration: 5000,
              action: {
                label: "Upgrade",
                onClick: () => window.location.href = "/pricing",
              },
            });
            return null;
          }

          throw new Error(errData.message || errorMessage || `AI action failed (${resp.status})`);
        }

        const data = await resp.json();

        // Deduct credits server-side after successful action
        await consume(action);

        onSuccess?.(data);
        return data;
      } catch (err: any) {
        toast.error(err.message || errorMessage || "AI action failed");
        return null;
      } finally {
        onEnd?.();
      }
    },
    [guard, user]
  );

  return { execute, remaining };
}
