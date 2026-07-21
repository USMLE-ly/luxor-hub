import { useState } from "react";
import { motion } from "framer-motion";
import { Gift, CheckCircle, Trophy, UserPlus, TShirt, Share } from "@phosphor-icons/react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RewardAction {
  id: string;
  label: string;
  credits: number;
  icon: React.ReactNode;
  completed?: boolean;
}

export function CreditRewards() {
  const { user } = useAuth();
  const [claimed, setClaimed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string | null>(null);

  const rewards: RewardAction[] = [
    { id: "complete_profile", label: "Complete your profile", credits: 10, icon: <UserPlus className="w-4 h-4" /> },
    { id: "add_5_closet_items", label: "Add 5 closet items", credits: 5, icon: <TShirt className="w-4 h-4" /> },
    { id: "share_outfit", label: "Share an outfit", credits: 3, icon: <Share className="w-4 h-4" /> },
    { id: "weekly_challenge", label: "Complete weekly challenge", credits: 15, icon: <Trophy className="w-4 h-4" /> },
  ];

  const handleClaim = async (action: string) => {
    if (!user || claimed.has(action)) return;
    setLoading(action);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const resp = await fetch(`${apiUrl}/api/v1/credits/reward`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await resp.json();
      if (data.credits) {
        setClaimed((prev) => new Set([...prev, action]));
        toast.success(`+${data.credits} credits earned!`);
      } else {
        toast.info(data.message || "Already claimed");
        setClaimed((prev) => new Set([...prev, action]));
      }
    } catch {
      toast.error("Failed to claim reward");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-2">
      {rewards.map((reward) => (
        <motion.button
          key={reward.id}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleClaim(reward.id)}
          disabled={claimed.has(reward.id) || loading !== null}
          className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
            claimed.has(reward.id)
              ? "border-emerald-500/20 bg-emerald-500/5 opacity-60"
              : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15]"
          }`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            claimed.has(reward.id) ? "bg-emerald-500/10 text-emerald-400" : "bg-white/[0.05] text-white/50"
          }`}>
            {claimed.has(reward.id) ? <CheckCircle className="w-4 h-4" /> : reward.icon}
          </div>
          <div className="flex-1 text-left">
            <p className="text-xs font-sans text-white/70">{reward.label}</p>
          </div>
          <span className={`text-xs font-sans font-semibold ${
            claimed.has(reward.id) ? "text-emerald-400/50" : "text-primary"
          }`}>
            +{reward.credits}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
