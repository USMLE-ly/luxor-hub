import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Sparkles, Loader2, ChevronRight, ShoppingBag, Shirt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { GradientButton } from "@/components/ui/gradient-button";
import { toast } from "sonner";

interface Trend {
  name: string;
  description: string;
  matchLevel: "high" | "medium" | "low";
  matchReason: string;
  closetMatches: string[];
  shoppingTip: string;
  emoji: string;
}

interface TrendReport {
  season: string;
  trends: Trend[];
  summary: string;
}

const matchColors = {
  high: { bg: "bg-green-500/10", text: "text-green-500", border: "border-green-500/30", label: "Perfect Match" },
  medium: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/30", label: "Good Fit" },
  low: { bg: "bg-muted", text: "text-muted-foreground", border: "border-border", label: "Stretch" },
};

export const TrendIntelligenceWidget = () => {
  const { user } = useAuth();
  const [report, setReport] = useState<TrendReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  const fetchTrends = async () => {
    if (!user || loading) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("trend-intelligence", {
        body: { userId: user.id },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      setReport(data);
      toast.success("Trends analyzed!");
    } catch (e: any) {
      toast.error(e.message || "Failed to fetch trends");
    } finally {
      setLoading(false);
    }
  };

  if (!report) {
    return (
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg font-bold text-foreground">Trending Now For You</h3>
          </div>
          <p className="text-muted-foreground text-xs font-sans mb-4">
            AI analyzes current fashion trends and matches them to your Style DNA and closet
          </p>
          <GradientButton onClick={fetchTrends} disabled={loading} className="w-full rounded-full h-10 text-sm">
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing trends...</>
            ) : (
              <><TrendingUp className="w-4 h-4 mr-2" /> Discover Trends</>
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
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg font-bold text-foreground">Trending Now</h3>
          </div>
          <button onClick={fetchTrends} disabled={loading} className="text-xs text-primary font-sans hover:underline">
            {loading ? "Updating..." : "Refresh"}
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground font-sans mb-3">{report.season} · {report.summary}</p>

        <div className="space-y-2">
          {report.trends.map((trend, i) => {
            const mc = matchColors[trend.matchLevel];
            const isExpanded = expanded === i;
            return (
              <motion.div
                key={trend.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <button
                  onClick={() => setExpanded(isExpanded ? null : i)}
                  className={`w-full text-left rounded-xl border p-3 transition-all ${mc.border} hover:shadow-sm`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{trend.emoji}</span>
                      <div>
                        <p className="text-sm font-semibold text-foreground font-sans">{trend.name}</p>
                        <p className="text-[10px] text-muted-foreground font-sans">{trend.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${mc.bg} ${mc.text}`}>
                        {mc.label}
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 mt-3 border-t border-border/50 space-y-2">
                          <p className="text-xs text-foreground font-sans">{trend.matchReason}</p>
                          {trend.closetMatches.length > 0 && (
                            <div>
                              <p className="text-[10px] text-muted-foreground font-sans mb-1">Already in your closet:</p>
                              <div className="flex flex-wrap gap-1">
                                {trend.closetMatches.map((item, j) => (
                                  <span key={j} className="text-[10px] font-sans bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Shirt className="w-2.5 h-2.5" /> {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="flex items-start gap-1.5">
                            <ShoppingBag className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-primary font-sans">{trend.shoppingTip}</p>
                          </div>
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
