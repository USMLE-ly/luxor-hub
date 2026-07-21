import { useState } from "react";
import { motion } from "framer-motion";
import { Lightning, Sparkle, Crown, CheckCircle } from "@phosphor-icons/react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreditPack {
  id: string;
  label: string;
  credits: number;
  price: number;
  popular?: boolean;
}

const PACKS: CreditPack[] = [
  { id: "small", label: "Starter Pack", credits: 100, price: 3 },
  { id: "medium", label: "Pro Pack", credits: 500, price: 10, popular: true },
  { id: "large", label: "Max Pack", credits: 1000, price: 15 },
];

export function CreditTopUp() {
  const { user } = useAuth();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handlePurchase = async (pack: CreditPack) => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }

    setPurchasing(pack.id);
    try {
      // For now, simulate PayPal one-time payment
      // In production, integrate PayPal Buttons here
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) return;

      const apiUrl = import.meta.env.VITE_API_URL || "";
      const resp = await fetch(`${apiUrl}/api/v1/credits/topup`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pack: pack.id,
          paypal_transaction_id: `sim_${Date.now()}`,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        setSuccess(pack.id);
        toast.success(`Added ${pack.credits} credits! Now you have ${data.total_remaining} credits.`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        toast.error("Purchase failed. Please try again.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {PACKS.map((pack) => (
        <motion.button
          key={pack.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handlePurchase(pack)}
          disabled={purchasing !== null}
          className={`relative p-4 rounded-2xl border text-left transition-all ${
            pack.popular
              ? "border-primary/30 bg-primary/5"
              : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15]"
          } ${success === pack.id ? "border-emerald-500/30 bg-emerald-500/5" : ""}`}
        >
          {pack.popular && (
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-sans font-bold text-primary bg-primary/10 border border-primary/20">
              BEST VALUE
            </span>
          )}
          <div className="flex items-center gap-2 mb-2">
            {pack.popular ? (
              <Sparkle className="w-4 h-4 text-primary" />
            ) : (
              <Lightning className="w-4 h-4 text-white/40" />
            )}
            <span className="text-xs font-sans font-semibold text-white/70">
              {pack.label}
            </span>
          </div>
          <div className="flex items-end gap-1 mb-1">
            <span className="text-2xl font-serif text-white">{pack.credits}</span>
            <span className="text-xs font-sans text-white/30 mb-0.5">credits</span>
          </div>
          <p className="text-sm font-sans font-semibold text-primary">${pack.price}</p>
          <p className="text-[10px] font-sans text-white/25 mt-1">
            ~{Math.floor(pack.credits / 4)} analyses
          </p>
          {success === pack.id && (
            <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-emerald-400" />
          )}
        </motion.button>
      ))}
    </div>
  );
}
