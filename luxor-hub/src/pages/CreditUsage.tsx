import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  Lightning, TrendUp, Clock, Crown, ArrowUpRight, Gift, CheckCircle,
  Trophy, UserPlus, TShirt, Share, Sparkle, Lightning as BoltIcon, Pause, Play,
} from "@phosphor-icons/react";
import { AppLayout } from "@/components/app/AppLayout";
import { useCreditBalance } from "@/hooks/useCreditBalance";
import { usePlanTier } from "@/hooks/usePlanTier";
import { useStreak } from "@/hooks/useStreak";
import { StreakCalendar } from "@/components/app/StreakCalendar";
import { CREDIT_COSTS, TIER_MONTHLY_CREDITS } from "@/lib/planRestrictions";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface CreditEvent {
  action: string;
  cost: number;
  credits_remaining: number;
  created_at: string;
}

const ACTION_LABELS: Record<string, string> = {
  analyze_outfit: "Outfit Analysis",
  style_analyze: "Style Analysis",
  style_recommendations: "Style Recommendations",
  outfit_review: "Outfit Review",
  generate_outfits: "Outfit Generation",
  pro_tweak: "Pro Tweaks",
  closet_analyze: "Closet Analysis",
  stylist_explore: "Stylist Explore",
  stylist_generate: "Stylist Generate",
  ai_fill_details: "AI Auto-Fill",
  generate_1_outfit: "Generate 1 Outfit",
  generate_2_outfits: "Generate 2 Outfits",
  generate_3_outfits: "Generate 3 Outfits",
  dressing_room_style: "Dressing Room Style",
  dressing_room_tryon: "Virtual Try-On",
  outfit_analysis: "Full Outfit Analysis",
  outfit_recommendation: "Style Recommendations",
  calendar_manual: "Calendar Event",
  reward_complete_profile: "Profile Complete",
  reward_add_5_closet_items: "Add 5 Items",
  reward_share_outfit: "Share Outfit",
  reward_invite_friend: "Invite Friend",
  reward_weekly_challenge: "Weekly Challenge",
  reward_first_analysis: "First Analysis",
  reward_streak_1: "Streak: Day 1",
  reward_streak_3: "Streak: Day 3",
  reward_streak_7: "Streak: Day 7",
  reward_streak_14: "Streak: Day 14",
  reward_streak_30: "Streak: Day 30",
  reward_streak_60: "Streak: Day 60",
  reward_streak_100: "Streak: Day 100",
  reward_referral: "Referral Bonus",
  reward_streak: "Streak Bonus",
};

const REWARD_TASKS = [
  { id: "complete_profile", label: "Complete your profile", credits: 10, icon: UserPlus },
  { id: "add_5_closet_items", label: "Add 5 closet items", credits: 5, icon: TShirt },
  { id: "share_outfit", label: "Share an outfit", credits: 3, icon: Share },
  { id: "weekly_challenge", label: "Complete weekly challenge", credits: 15, icon: Trophy },
];

const CREDIT_PACKS = [
  { id: "small", label: "Starter Pack", credits: 100, price: 3 },
  { id: "medium", label: "Pro Pack", credits: 500, price: 10, popular: true },
  { id: "large", label: "Max Pack", credits: 1000, price: 15 },
];

export default function CreditUsage() {
  const { user } = useAuth();
  const { tier } = usePlanTier();
  const { data: balance } = useCreditBalance();
  const streak = useStreak();
  const navigate = useNavigate();

  // Record daily login on mount
  useEffect(() => {
    if (user && streak.data && streak.data.current_streak === 0) {
      streak.recordLogin();
    }
  }, [user]);

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

  // Split events into earned vs spent
  const earnedEvents = events.filter((e) => e.cost < 0);
  const spentEvents = events.filter((e) => e.cost > 0);
  const totalEarned = earnedEvents.reduce((sum, e) => sum + Math.abs(e.cost), 0);
  const totalSpent = spentEvents.reduce((sum, e) => sum + e.cost, 0);

  // Group spending by action
  const spendingByAction = spentEvents.reduce(
    (acc: Record<string, { count: number; totalCost: number }>, event) => {
      if (!acc[event.action]) acc[event.action] = { count: 0, totalCost: 0 };
      acc[event.action].count += 1;
      acc[event.action].totalCost += event.cost;
      return acc;
    },
    {}
  );
  const sortedSpending = Object.entries(spendingByAction)
    .sort(([, a], [, b]) => b.totalCost - a.totalCost)
    .slice(0, 6);

  // Reward claiming state handled locally
  const handleClaimReward = async (action: string) => {
    if (!user) return;
    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;
    if (!token) return;
    const apiUrl = import.meta.env.VITE_API_URL || "";
    try {
      const resp = await fetch(`${apiUrl}/api/v1/credits/reward`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await resp.json();
      if (data.credits) {
        toast.success(`+${data.credits} credits earned!`);
      } else {
        toast.info(data.message || "Already claimed");
      }
    } catch {
      toast.error("Failed to claim reward");
    }
  };

  const handleTopUp = async (packId: string) => {
    if (!user) { toast.error("Please sign in first"); return; }
    toast.info("Payment integration coming soon!");
  };

  const handleCopyReferral = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const resp = await fetch(`${apiUrl}/api/v1/credits/referral/link`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json();
      if (data.referral_link) {
        navigator.clipboard.writeText(data.referral_link);
        toast.success("Referral link copied!");
      }
    } catch {
      toast.error("Failed to get referral link");
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-[var(--bg)] px-4 py-8">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-8">
            <h1 className="text-2xl font-serif text-[var(--text)] mb-1">Credit Hub</h1>
            <p className="text-sm font-sans text-[var(--text-muted)]">
              Track your AI styling consumption
            </p>
          </motion.div>

          {/* Streak Calendar */}
          {streak.data && <StreakCalendar streak={streak.data} />}

          {/* Main balance card */}
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-6 mb-6 mt-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lightning className="w-5 h-5 text-[var(--accent)]" />
                <span className="text-sm font-sans font-semibold text-[var(--text)]">
                  {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
                </span>
              </div>
              <button onClick={() => navigate("/pricing")} className="flex items-center gap-1 text-xs font-sans text-[var(--accent)] hover:opacity-80 transition-opacity">
                Upgrade <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-end gap-2 mb-3">
              <span className="text-4xl font-serif text-[var(--text)]">{remaining}</span>
              <span className="text-sm font-sans text-[var(--text-muted)] mb-1">/ {allocated.toLocaleString()} credits</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 rounded-full bg-[var(--surface-alt)] overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-warm)]"
              />
            </div>

            <div className="flex justify-between text-[11px] font-sans text-[var(--text-muted)]">
              <span>{used} used</span>
              <span>{remaining} remaining</span>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[var(--surface-border)]">
              <div className="text-center">
                <p className="text-lg font-serif text-green-400">{totalEarned}</p>
                <p className="text-[10px] font-sans text-[var(--text-muted)]">earned</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-serif text-[var(--text)]">{totalSpent}</p>
                <p className="text-[10px] font-sans text-[var(--text-muted)]">spent</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-serif text-[var(--accent)]">{events.length}</p>
                <p className="text-[10px] font-sans text-[var(--text-muted)]">actions</p>
              </div>
            </div>
          </motion.div>

          {/* Spending Breakdown */}
          {sortedSpending.length > 0 && (
            <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
              className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-5 mb-6"
            >
              <h2 className="text-sm font-sans font-semibold text-[var(--text)] mb-3">Spending Breakdown</h2>
              <div className="space-y-2">
                {sortedSpending.map(([action, data]) => {
                  const maxCost = sortedSpending[0]?.[1].totalCost || 1;
                  const barWidth = (data.totalCost / maxCost) * 100;
                  return (
                    <div key={action} className="flex items-center gap-3">
                      <span className="text-[11px] font-sans text-[var(--text-muted)] w-28 truncate">
                        {ACTION_LABELS[action] || action}
                      </span>
                      <div className="flex-1 h-1.5 rounded-full bg-[var(--surface-alt)]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${barWidth}%` }}
                          transition={{ duration: 0.8, delay: 0.1 }}
                          className="h-full rounded-full bg-[var(--accent)]/60"
                        />
                      </div>
                      <span className="text-[10px] font-sans text-[var(--text-muted)] w-12 text-right">{data.totalCost}c</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Recent Activity */}
          <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}
            className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-5 mb-6"
          >
            <h2 className="text-sm font-sans font-semibold text-[var(--text)] mb-3">Recent Activity</h2>
            {events.length === 0 ? (
              <p className="text-xs font-sans text-[var(--text-muted)] text-center py-4">
                No credit usage yet. Try an AI action to get started!
              </p>
            ) : (
              <div className="space-y-2">
                {events.slice(0, 10).map((event, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-[var(--surface-border)] last:border-0">
                    <div>
                      <p className="text-xs font-sans text-[var(--text)]">
                        {ACTION_LABELS[event.action] || event.action}
                      </p>
                      <p className="text-[10px] font-sans text-[var(--text-muted)]">
                        {new Date(event.created_at).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span className={`text-xs font-sans font-semibold ${event.cost < 0 ? "text-green-400" : "text-[var(--text-muted)]"}`}>
                      {event.cost < 0 ? `+${Math.abs(event.cost)}` : `-${event.cost}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Earn Free Credits */}
          <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
            className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-5 mb-6"
          >
            <h2 className="text-sm font-sans font-semibold text-[var(--text)] mb-3 flex items-center gap-2">
              <Gift className="w-4 h-4 text-[var(--accent)]" /> Earn Free Credits
            </h2>
            <div className="space-y-2">
              {REWARD_TASKS.map((reward) => {
                const Icon = reward.icon;
                return (
                  <button key={reward.id} onClick={() => handleClaimReward(reward.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-alt)] hover:border-[var(--accent)]/20 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--accent)]/10">
                      <Icon className="w-4 h-4 text-[var(--accent)]" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs font-sans text-[var(--text)]">{reward.label}</p>
                    </div>
                    <span className="text-xs font-sans font-semibold text-[var(--accent)]">+{reward.credits}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Credit Top-Up */}
          <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }}
            className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-5 mb-6"
          >
            <h2 className="text-sm font-sans font-semibold text-[var(--text)] mb-3 flex items-center gap-2">
              <Sparkle className="w-4 h-4 text-[var(--accent)]" /> Buy More Credits
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {CREDIT_PACKS.map((pack) => (
                <button key={pack.id} onClick={() => handleTopUp(pack.id)}
                  className={`relative p-4 rounded-2xl border text-left transition-all ${
                    pack.popular
                      ? "border-[var(--accent)]/30 bg-[var(--accent)]/5"
                      : "border-[var(--surface-border)] bg-[var(--surface-alt)] hover:border-[var(--accent)]/20"
                  }`}
                >
                  {pack.popular && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-sans font-bold text-[var(--accent)] bg-[var(--accent)]/10 border border-[var(--accent)]/20">
                      BEST VALUE
                    </span>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <BoltIcon className="w-4 h-4 text-[var(--accent)]" />
                    <span className="text-xs font-sans font-semibold text-[var(--text)]">{pack.label}</span>
                  </div>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-2xl font-serif text-[var(--text)]">{pack.credits}</span>
                    <span className="text-xs font-sans text-[var(--text-muted)] mb-0.5">credits</span>
                  </div>
                  <p className="text-sm font-sans font-semibold text-[var(--accent)]">${pack.price}</p>
                  <p className="text-[10px] font-sans text-[var(--text-muted)] mt-1">
                    ~{Math.floor(pack.credits / 4)} analyses
                  </p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Refer a Friend */}
          <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
            className="rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-5 mb-6"
          >
            <h2 className="text-sm font-sans font-semibold text-[var(--accent)] mb-2 flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Refer a Friend
            </h2>
            <p className="text-xs font-sans text-[var(--text-muted)] mb-3">
              Both you and your friend get <strong className="text-[var(--accent)]">20 bonus credits</strong> when they sign up.
            </p>
            <button onClick={handleCopyReferral}
              className="w-full h-9 rounded-xl bg-[var(--accent)] text-[var(--bg)] text-xs font-sans font-semibold hover:opacity-90 transition-opacity"
            >
              Copy Referral Link
            </button>
          </motion.div>

          {/* Credit Costs Reference */}
          <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.45 }}
            className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-5"
          >
            <h2 className="text-sm font-sans font-semibold text-[var(--text)] mb-3 flex items-center gap-2">
              <TrendUp className="w-4 h-4 text-[var(--accent)]" /> Credit Costs
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(CREDIT_COSTS)
                .sort(([, a], [, b]) => a - b)
                .map(([action, cost]) => (
                  <div key={action}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--surface-alt)] border border-[var(--surface-border)]"
                  >
                    <span className="text-[11px] font-sans text-[var(--text-muted)]">
                      {ACTION_LABELS[action] || action}
                    </span>
                    <span className="text-[11px] font-sans font-semibold text-[var(--accent)]">{cost}</span>
                  </div>
                ))}
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
