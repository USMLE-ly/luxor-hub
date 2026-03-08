import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Moon, ThumbsUp, ThumbsDown, Heart, MessageCircle, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

const moods = [
  { emoji: "😍", label: "Amazing", rating: 5 },
  { emoji: "😊", label: "Good", rating: 4 },
  { emoji: "😐", label: "Okay", rating: 3 },
  { emoji: "😕", label: "Meh", rating: 2 },
  { emoji: "😩", label: "Bad", rating: 1 },
];

export function EveningReflection() {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [compliments, setCompliments] = useState(0);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || selectedMood === null) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("outfit_feedback" as any).insert({
        user_id: user.id,
        rating: moods[selectedMood].rating,
        compliments,
        notes: note || null,
      });
      if (error) throw error;

      // Award style points for reflection
      await supabase.from("style_points" as any).insert({
        user_id: user.id,
        points: 5,
        reason: "Evening outfit reflection",
      });

      setSubmitted(true);
      toast.success("Reflection saved! +5 style points ✨");
    } catch (e: any) {
      toast.error("Failed to save reflection");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl p-5 text-center"
      >
        <Check className="w-8 h-8 text-primary mx-auto mb-2" />
        <p className="text-sm font-sans text-foreground font-semibold">Thanks for reflecting!</p>
        <p className="text-xs font-sans text-muted-foreground mt-1">Your feedback helps the AI learn your style better.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(260,60%,95%,0.06)] to-transparent pointer-events-none" />
      <div className="p-5 relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Moon className="w-5 h-5 text-[hsl(260,50%,65%)]" />
          <h2 className="font-display text-lg font-bold text-foreground">How'd the outfit feel?</h2>
        </div>

        {/* Mood selector */}
        <div className="flex justify-between mb-4">
          {moods.map((mood, i) => (
            <button
              key={mood.label}
              onClick={() => setSelectedMood(i)}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all ${
                selectedMood === i
                  ? "bg-primary/15 scale-110 shadow-[0_0_12px_hsl(var(--primary)/0.2)]"
                  : "hover:bg-secondary"
              }`}
            >
              <span className="text-2xl">{mood.emoji}</span>
              <span className="text-[9px] font-sans text-muted-foreground">{mood.label}</span>
            </button>
          ))}
        </div>

        {/* Compliment counter */}
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-sans text-muted-foreground flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-destructive" /> Compliments received
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCompliments(Math.max(0, compliments - 1))}
              className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground"
            >
              −
            </button>
            <span className="font-sans font-bold text-foreground w-6 text-center">{compliments}</span>
            <button
              onClick={() => setCompliments(compliments + 1)}
              className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20"
            >
              +
            </button>
          </div>
        </div>

        {/* Optional note */}
        <AnimatePresence>
          {selectedMood !== null && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Any notes about today's outfit?"
                className="w-full bg-secondary/50 border border-border rounded-xl p-3 text-sm font-sans text-foreground placeholder:text-muted-foreground resize-none h-16 mb-3"
              />
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full h-10 rounded-full bg-foreground text-background font-sans text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Sparkles className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Reflection
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
