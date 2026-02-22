import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, Bookmark, BookmarkCheck, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface InspirationLook {
  id: string;
  title: string;
  description: string;
  occasion: string;
  items: string[];
  mood: string;
  saved: boolean;
}

const CURATED_LOOKS: InspirationLook[] = [
  {
    id: "1",
    title: "Effortless Monday",
    description: "A polished yet comfortable look for conquering the work week with ease.",
    occasion: "Work",
    items: ["White button-down", "Tailored navy trousers", "Tan loafers", "Minimalist watch"],
    mood: "Professional",
    saved: false,
  },
  {
    id: "2",
    title: "Weekend Wanderer",
    description: "Relaxed layers perfect for brunch, markets, or a casual stroll through the city.",
    occasion: "Casual",
    items: ["Oversized knit sweater", "Straight-leg jeans", "White sneakers", "Canvas tote"],
    mood: "Relaxed",
    saved: false,
  },
  {
    id: "3",
    title: "Date Night Glow",
    description: "A sophisticated ensemble that balances elegance with modern edge.",
    occasion: "Evening",
    items: ["Black silk camisole", "High-waisted trousers", "Heeled ankle boots", "Statement earrings"],
    mood: "Romantic",
    saved: false,
  },
  {
    id: "4",
    title: "Athleisure Elevated",
    description: "Sport-inspired pieces styled for everyday wear — comfort meets fashion.",
    occasion: "Active",
    items: ["Structured joggers", "Cropped hoodie", "Chunky trainers", "Cap"],
    mood: "Energetic",
    saved: false,
  },
  {
    id: "5",
    title: "Coastal Chic",
    description: "Breezy, sun-kissed vibes with a refined twist for warm-weather outings.",
    occasion: "Summer",
    items: ["Linen shirt", "Wide-leg trousers", "Leather sandals", "Straw bag"],
    mood: "Fresh",
    saved: false,
  },
  {
    id: "6",
    title: "Power Meeting",
    description: "Command attention with sharp tailoring and confident accents.",
    occasion: "Business",
    items: ["Structured blazer", "Fitted turtleneck", "Slim trousers", "Oxford shoes"],
    mood: "Confident",
    saved: false,
  },
];

const moodColors: Record<string, string> = {
  Professional: "bg-primary/10 text-primary",
  Relaxed: "bg-blue-500/10 text-blue-400",
  Romantic: "bg-pink-500/10 text-pink-400",
  Energetic: "bg-orange-500/10 text-orange-400",
  Fresh: "bg-teal-500/10 text-teal-400",
  Confident: "bg-purple-500/10 text-purple-400",
};

export const StyleInspirationFeed = () => {
  const [looks, setLooks] = useState<InspirationLook[]>(CURATED_LOOKS);
  const [filter, setFilter] = useState<string>("All");

  const occasions = ["All", ...Array.from(new Set(CURATED_LOOKS.map((l) => l.occasion)))];

  const toggleSave = (id: string) => {
    setLooks((prev) =>
      prev.map((look) =>
        look.id === id ? { ...look, saved: !look.saved } : look
      )
    );
    const look = looks.find((l) => l.id === id);
    if (look?.saved) {
      toast.success("Removed from saved looks");
    } else {
      toast.success("Look saved! ✨");
    }
  };

  const filtered = filter === "All" ? looks : looks.filter((l) => l.occasion === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Style Inspiration
        </h2>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 flex-wrap">
        {occasions.map((occ) => (
          <button
            key={occ}
            onClick={() => setFilter(occ)}
            className={`px-3 py-1.5 rounded-full text-xs font-sans transition-all ${
              filter === occ
                ? "gold-gradient text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {occ}
          </button>
        ))}
      </div>

      {/* Looks Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((look, i) => (
            <motion.div
              key={look.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-5 group hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">{look.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-medium ${moodColors[look.mood] || "bg-secondary text-muted-foreground"}`}>
                      {look.mood}
                    </span>
                    <span className="text-xs text-muted-foreground font-sans">{look.occasion}</span>
                  </div>
                </div>
                <button
                  onClick={() => toggleSave(look.id)}
                  className="p-1.5 rounded-full hover:bg-secondary transition-colors"
                >
                  {look.saved ? (
                    <BookmarkCheck className="h-4 w-4 text-primary" />
                  ) : (
                    <Bookmark className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>

              <p className="text-sm text-muted-foreground font-sans mb-4 line-clamp-2">{look.description}</p>

              <div className="space-y-1.5">
                {look.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm font-sans text-foreground/80">
                    <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4 border-glass-border hover:border-primary/50 font-sans text-xs"
                onClick={() => toast.info("Match items from your closet coming soon!")}
              >
                Recreate from My Closet
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
