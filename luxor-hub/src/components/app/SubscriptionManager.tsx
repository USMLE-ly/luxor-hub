import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Pause, Play, Crown, Calendar } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function SubscriptionManager() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<"pause" | "resume" | null>(null);

  const { data: sub } = useQuery({
    queryKey: ["subscription-status", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("subscriptions")
        .select("plan_tier, status, pause_until")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const handlePause = async (months: number) => {
    if (!user) return;
    setLoading("pause");
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const resp = await fetch(`${apiUrl}/api/v1/subscription/pause`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ pause_months: months }),
      });
      const data = await resp.json();
      if (resp.ok) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
      } else {
        toast.error(data.error || "Failed to pause");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  const handleResume = async () => {
    if (!user) return;
    setLoading("resume");
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const resp = await fetch(`${apiUrl}/api/v1/subscription/resume`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json();
      if (resp.ok) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
        queryClient.invalidateQueries({ queryKey: ["credit-balance"] });
      } else {
        toast.error(data.error || "Failed to resume");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  if (!sub || sub.status === "free") return null;

  return (
    <motion.div
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-primary" />
          <span className="text-sm font-sans font-semibold text-white/70">
            {sub.plan_tier?.charAt(0).toUpperCase()}{sub.plan_tier?.slice(1)} Plan
          </span>
        </div>
        <span className={`text-xs font-sans px-2 py-0.5 rounded-full ${
          sub.status === "active"
            ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
            : "text-amber-400 bg-amber-500/10 border border-amber-500/20"
        }`}>
          {sub.status === "active" ? "Active" : "Paused"}
        </span>
      </div>

      {sub.status === "active" && (
        <div className="space-y-2">
          <p className="text-xs font-sans text-white/40 mb-3">
            Going on vacation? Pause to keep your credits without being charged.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handlePause(1)}
              disabled={loading === "pause"}
              className="flex-1 flex items-center justify-center gap-2 h-9 rounded-xl border border-white/10 text-white/50 text-xs font-sans font-semibold hover:bg-white/5 transition-colors"
            >
              <Pause className="w-3.5 h-3.5" />
              Pause 1 Month
            </button>
            <button
              onClick={() => handlePause(2)}
              disabled={loading === "pause"}
              className="flex-1 flex items-center justify-center gap-2 h-9 rounded-xl border border-white/10 text-white/50 text-xs font-sans font-semibold hover:bg-white/5 transition-colors"
            >
              <Pause className="w-3.5 h-3.5" />
              Pause 2 Months
            </button>
          </div>
        </div>
      )}

      {sub.status === "paused" && (
        <div className="space-y-2">
          <p className="text-xs font-sans text-white/40">
            {sub.pause_until
              ? `Paused until ${new Date(sub.pause_until).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
              : "Your subscription is paused"}
          </p>
          <button
            onClick={handleResume}
            disabled={loading === "resume"}
            className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-primary text-primary-foreground text-xs font-sans font-semibold hover:bg-primary/90 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            Resume Subscription
          </button>
        </div>
      )}

      <button
        onClick={() => navigate("/pricing")}
        className="w-full mt-3 h-8 rounded-lg border border-white/[0.06] text-white/30 text-[10px] font-sans hover:text-white/50 hover:border-white/[0.12] transition-all"
      >
        Change Plan
      </button>
    </motion.div>
  );
}
