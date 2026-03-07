import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Sparkles, ChevronRight, Loader2, Shirt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { GradientButton } from "@/components/ui/gradient-button";
import { toast } from "sonner";

interface DayPlan {
  date: string;
  dayLabel: string;
  outfitName: string;
  items: string[];
  occasion: string;
  tip: string;
}

interface CapsulePlan {
  plan: DayPlan[];
  summary: string;
}

export const WeeklyCapsuleWidget = () => {
  const { user } = useAuth();
  const [plan, setPlan] = useState<CapsulePlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  const generatePlan = async () => {
    if (!user || loading) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("weekly-capsule", {
        body: { userId: user.id },
      });
      if (error) throw error;
      if (data?.error) {
        if (data.error.includes("Rate limit")) toast.error("Rate limited — try again shortly.");
        else if (data.error.includes("credits")) toast.error("AI credits exhausted.");
        else throw new Error(data.error);
        return;
      }
      setPlan(data);
      toast.success("Weekly capsule plan generated!");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  if (!plan) {
    return (
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg font-bold text-foreground">This Week's Plan</h3>
          </div>
          <p className="text-muted-foreground text-xs font-sans mb-4">
            AI generates a 7-day capsule wardrobe from your closet, calendar events, and weather
          </p>
          <GradientButton onClick={generatePlan} disabled={loading} className="w-full rounded-full h-10 text-sm">
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> Generate Weekly Plan</>
            )}
          </GradientButton>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg font-bold text-foreground">This Week's Plan</h3>
          </div>
          <button
            onClick={generatePlan}
            disabled={loading}
            className="text-xs text-primary font-sans hover:underline"
          >
            {loading ? "Generating..." : "Refresh"}
          </button>
        </div>
        <p className="text-muted-foreground text-xs font-sans mb-4">{plan.summary}</p>

        <div className="space-y-2">
          {plan.plan.map((day, i) => {
            const isToday = day.date === today;
            const isExpanded = expanded === i;
            return (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <button
                  onClick={() => setExpanded(isExpanded ? null : i)}
                  className={`w-full text-left rounded-xl border p-3 transition-all ${
                    isToday
                      ? "border-primary/40 bg-primary/5 shadow-[0_0_12px_hsl(var(--primary)/0.08)]"
                      : "border-border hover:border-primary/20 bg-background"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        isToday ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                      }`}>
                        {day.dayLabel.slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground font-sans">{day.outfitName}</p>
                        <p className="text-[10px] text-muted-foreground font-sans">{day.occasion}</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 mt-3 border-t border-border/50">
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {day.items.map((item, j) => (
                              <span key={j} className="text-[10px] font-sans bg-secondary text-foreground px-2 py-1 rounded-full flex items-center gap-1">
                                <Shirt className="w-2.5 h-2.5" /> {item}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-primary font-sans italic">💡 {day.tip}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
