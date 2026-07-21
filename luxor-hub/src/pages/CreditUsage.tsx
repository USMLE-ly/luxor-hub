import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Lightning, TrendUp, Clock, Crown, ArrowUpRight } from "@phosphor-icons/react";
import { AppLayout } from "@/components/app/AppLayout";
import { useCreditBalance } from "@/hooks/useCreditBalance";
import { usePlanTier } from "@/hooks/usePlanTier";
import { CREDIT_COSTS, TIER_MONTHLY_CREDITS } from "@/lib/planRestrictions";
import { useNavigate } from "react-router-dom";

interface CreditEvent {
  action: string;
  cost: number;
  credits_remaining: number;
  created_at: string;
}

export default function CreditUsage() {
  const { user } = useAuth();
  const { tier } = usePlanTier();
  const { data: balance } = useCreditBalance();
  const navigate = useNavigate();

  const { data: events = [] } = useQuery<CreditEvent[]>({
    queryKey: ["credit-history", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) return [];
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const resp = await fetch(`${apiUrl}/api/v1/credits/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) return [];
      const data = await resp.json();
      return data.events || [];
    },
    enabled: !!user,
    staleTime: 60_000,
  });

  const allocated = balance?.credits_allocated ?? 30;
  const remaining = balance?.credits_remaining ?? 0;
  const used = allocated - remaining;
  const percentage = allocated > 0 ? (remaining / allocated) * 100 : 0;

  // Group events by action for breakdown
  const actionBreakdown = events.reduce(
    (acc: Record<string, { count: number; totalCost: number }>, event) => {
      const action = event.action;
      if (!acc[action]) acc[action] = { count: 0, totalCost: 0 };
      acc[action].count += 1;
      acc[action].totalCost += event.cost;
      return acc;
    },
    {}
  );

  const sortedBreakdown = Object.entries(actionBreakdown)
    .sort(([, a], [, b]) => b.totalCost - a.totalCost)
    .slice(0, 6);

  const actionLabels: Record<string, string> = {
    analyze_outfit: "Outfit Analysis",
    style_analyze: "Style Analysis",
    style_recommendations: "Style Recommendations",
    outfit_review: "Outfit Review",
    generate_outfits: "Outfit Generation",
    pro_tweak: "Pro Tweaks",
    closet_analyze: "Closet Analysis",
    stylist_explore: "Stylist Explore",
    stylist_generate: "Stylist Generate",
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] via-[#0d2218] to-background px-4 py-8">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-8"
          >
            <h1 className="text-2xl font-serif text-white mb-1">Credit Usage</h1>
            <p className="text-sm font-sans text-white/40">
              Track your AI styling consumption
            </p>
          </motion.div>

          {/* Main balance card */}
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lightning className="w-5 h-5 text-primary" />
                <span className="text-sm font-sans font-semibold text-white/70">
                  {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
                </span>
              </div>
              <button
                onClick={() => navigate("/pricing")}
                className="flex items-center gap-1 text-xs font-sans text-primary hover:text-primary/80 transition-colors"
              >
                Upgrade <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-end gap-2 mb-3">
              <span className="text-4xl font-serif text-white">{remaining}</span>
              <span className="text-sm font-sans text-white/30 mb-1">
                / {allocated.toLocaleString()} credits
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 rounded-full bg-white/[0.06] overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, percentage)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full transition-all ${
                  percentage > 60
                    ? "bg-emerald-500"
                    : percentage > 30
                    ? "bg-amber-500"
                    : "bg-red-500"
                }`}
              />
            </div>

            <div className="flex justify-between text-xs font-sans text-white/30">
              <span>{used} used this month</span>
              <span>{remaining} remaining</span>
            </div>
          </motion.div>

          {/* Spending breakdown */}
          {sortedBreakdown.length > 0 && (
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 mb-6"
            >
              <h2 className="text-sm font-sans font-semibold text-white/60 mb-4">
                Spending Breakdown
              </h2>
              <div className="space-y-3">
                {sortedBreakdown.map(([action, data]) => {
                  const maxCost = sortedBreakdown[0]?.[1].totalCost || 1;
                  const barWidth = (data.totalCost / maxCost) * 100;
                  return (
                    <div key={action}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-sans text-white/60">
                          {actionLabels[action] || action}
                        </span>
                        <span className="text-xs font-sans text-white/30">
                          {data.totalCost} credits ({data.count}x)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/[0.04]">
                        <div
                          className="h-full rounded-full bg-primary/40"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Recent activity */}
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 mb-6"
          >
            <h2 className="text-sm font-sans font-semibold text-white/60 mb-4">
              Recent Activity
            </h2>
            {events.length === 0 ? (
              <p className="text-xs font-sans text-white/30 text-center py-4">
                No credit usage yet. Try an AI action to get started!
              </p>
            ) : (
              <div className="space-y-2">
                {events.slice(0, 10).map((event, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0"
                  >
                    <div>
                      <p className="text-xs font-sans text-white/60">
                        {actionLabels[event.action] || event.action}
                      </p>
                      <p className="text-[10px] font-sans text-white/25">
                        {new Date(event.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span className="text-xs font-sans text-red-400/70">
                      -{event.cost}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Credit costs reference */}
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
          >
            <h2 className="text-sm font-sans font-semibold text-white/60 mb-3">
              Credit Costs
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(CREDIT_COSTS)
                .sort(([, a], [, b]) => a - b)
                .map(([action, cost]) => (
                  <div
                    key={action}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.04]"
                  >
                    <span className="text-[11px] font-sans text-white/50">
                      {actionLabels[action] || action}
                    </span>
                    <span className="text-[11px] font-sans font-semibold text-primary">
                      {cost}
                    </span>
                  </div>
                ))}
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
