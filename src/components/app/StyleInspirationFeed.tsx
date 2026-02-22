import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Bookmark, BookmarkCheck, ChevronRight, Plus, Users, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ClosetMatchDialog } from "./ClosetMatchDialog";
import { CreateLookDialog } from "./CreateLookDialog";

interface InspirationLook {
  id: string;
  title: string;
  description: string;
  occasion: string;
  items: string[];
  mood: string;
  saved: boolean;
  type: "curated" | "user";
  authorName?: string;
}

const CURATED_LOOKS: InspirationLook[] = [
  {
    id: "curated-1", title: "Effortless Monday",
    description: "A polished yet comfortable look for conquering the work week with ease.",
    occasion: "Work", items: ["White button-down", "Tailored navy trousers", "Tan loafers", "Minimalist watch"],
    mood: "Professional", saved: false, type: "curated",
  },
  {
    id: "curated-2", title: "Weekend Wanderer",
    description: "Relaxed layers perfect for brunch, markets, or a casual stroll through the city.",
    occasion: "Casual", items: ["Oversized knit sweater", "Straight-leg jeans", "White sneakers", "Canvas tote"],
    mood: "Relaxed", saved: false, type: "curated",
  },
  {
    id: "curated-3", title: "Date Night Glow",
    description: "A sophisticated ensemble that balances elegance with modern edge.",
    occasion: "Evening", items: ["Black silk camisole", "High-waisted trousers", "Heeled ankle boots", "Statement earrings"],
    mood: "Romantic", saved: false, type: "curated",
  },
  {
    id: "curated-4", title: "Athleisure Elevated",
    description: "Sport-inspired pieces styled for everyday wear — comfort meets fashion.",
    occasion: "Active", items: ["Structured joggers", "Cropped hoodie", "Chunky trainers", "Cap"],
    mood: "Energetic", saved: false, type: "curated",
  },
  {
    id: "curated-5", title: "Coastal Chic",
    description: "Breezy, sun-kissed vibes with a refined twist for warm-weather outings.",
    occasion: "Summer", items: ["Linen shirt", "Wide-leg trousers", "Leather sandals", "Straw bag"],
    mood: "Fresh", saved: false, type: "curated",
  },
  {
    id: "curated-6", title: "Power Meeting",
    description: "Command attention with sharp tailoring and confident accents.",
    occasion: "Business", items: ["Structured blazer", "Fitted turtleneck", "Slim trousers", "Oxford shoes"],
    mood: "Confident", saved: false, type: "curated",
  },
];

const moodColors: Record<string, string> = {
  Professional: "bg-primary/10 text-primary",
  Relaxed: "bg-blue-500/10 text-blue-400",
  Romantic: "bg-pink-500/10 text-pink-400",
  Energetic: "bg-orange-500/10 text-orange-400",
  Fresh: "bg-teal-500/10 text-teal-400",
  Confident: "bg-purple-500/10 text-purple-400",
  Creative: "bg-amber-500/10 text-amber-400",
  Bold: "bg-red-500/10 text-red-400",
};

export const StyleInspirationFeed = () => {
  const { user } = useAuth();
  const [looks, setLooks] = useState<InspirationLook[]>(CURATED_LOOKS);
  const [filter, setFilter] = useState<string>("All");
  const [tab, setTab] = useState<"all" | "mine" | "community">("all");
  const [matchDialog, setMatchDialog] = useState<{ open: boolean; title: string; items: string[] }>({
    open: false, title: "", items: [],
  });
  const [createOpen, setCreateOpen] = useState(false);

  // Fetch user looks + saved state
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [userLooksRes, communityLooksRes, savedRes] = await Promise.all([
        supabase.from("user_looks").select("*").eq("user_id", user.id),
        supabase.from("user_looks").select("*").eq("is_public", true),
        supabase.from("saved_looks").select("look_id, look_type").eq("user_id", user.id),
      ]);

      const savedSet = new Set(
        (savedRes.data || []).map((s: any) => `${s.look_type}:${s.look_id}`)
      );

      const userLooks: InspirationLook[] = (userLooksRes.data || []).map((l: any) => ({
        id: l.id, title: l.title, description: l.description || "",
        occasion: l.occasion || "Other", items: l.items || [],
        mood: l.mood || "Creative", saved: savedSet.has(`user:${l.id}`),
        type: "user" as const, authorName: "You",
      }));

      const communityLooks: InspirationLook[] = (communityLooksRes.data || [])
        .filter((l: any) => l.user_id !== user.id)
        .map((l: any) => ({
          id: l.id, title: l.title, description: l.description || "",
          occasion: l.occasion || "Other", items: l.items || [],
          mood: l.mood || "Creative", saved: savedSet.has(`user:${l.id}`),
          type: "user" as const, authorName: "Community",
        }));

      const curatedWithSaved = CURATED_LOOKS.map((l) => ({
        ...l,
        saved: savedSet.has(`curated:${l.id}`),
      }));

      setLooks([...curatedWithSaved, ...userLooks, ...communityLooks]);
    };
    load();
  }, [user]);

  const toggleSave = async (id: string, type: string) => {
    if (!user) return;
    const look = looks.find((l) => l.id === id);
    if (!look) return;

    if (look.saved) {
      await supabase.from("saved_looks").delete()
        .eq("user_id", user.id).eq("look_id", id).eq("look_type", type);
      toast.success("Removed from saved looks");
    } else {
      await supabase.from("saved_looks").insert({
        user_id: user.id, look_id: id, look_type: type,
      });
      toast.success("Look saved! ✨");
    }

    setLooks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, saved: !l.saved } : l))
    );
  };

  const refreshLooks = () => {
    // Re-trigger useEffect by forcing a state update
    setFilter("All");
    if (user) {
      // Small hack to re-fetch
      setLooks((prev) => [...prev]);
      // Actually re-fetch
      const load = async () => {
        const [userLooksRes, communityLooksRes, savedRes] = await Promise.all([
          supabase.from("user_looks").select("*").eq("user_id", user.id),
          supabase.from("user_looks").select("*").eq("is_public", true),
          supabase.from("saved_looks").select("look_id, look_type").eq("user_id", user.id),
        ]);
        const savedSet = new Set(
          (savedRes.data || []).map((s: any) => `${s.look_type}:${s.look_id}`)
        );
        const userLooks: InspirationLook[] = (userLooksRes.data || []).map((l: any) => ({
          id: l.id, title: l.title, description: l.description || "",
          occasion: l.occasion || "Other", items: l.items || [],
          mood: l.mood || "Creative", saved: savedSet.has(`user:${l.id}`),
          type: "user" as const, authorName: "You",
        }));
        const communityLooks: InspirationLook[] = (communityLooksRes.data || [])
          .filter((l: any) => l.user_id !== user.id)
          .map((l: any) => ({
            id: l.id, title: l.title, description: l.description || "",
            occasion: l.occasion || "Other", items: l.items || [],
            mood: l.mood || "Creative", saved: savedSet.has(`user:${l.id}`),
            type: "user" as const, authorName: "Community",
          }));
        const curatedWithSaved = CURATED_LOOKS.map((l) => ({
          ...l, saved: savedSet.has(`curated:${l.id}`),
        }));
        setLooks([...curatedWithSaved, ...userLooks, ...communityLooks]);
      };
      load();
    }
  };

  const occasions = ["All", ...Array.from(new Set(looks.map((l) => l.occasion)))];

  const filtered = looks.filter((l) => {
    const matchOccasion = filter === "All" || l.occasion === filter;
    const matchTab =
      tab === "all" ||
      (tab === "mine" && l.type === "user" && l.authorName === "You") ||
      (tab === "community" && (l.type === "curated" || l.authorName === "Community"));
    return matchOccasion && matchTab;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Style Inspiration
        </h2>
        <Button
          onClick={() => setCreateOpen(true)}
          size="sm"
          className="gold-gradient text-primary-foreground font-sans"
        >
          <Plus className="h-4 w-4 mr-1" /> Create Look
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary/50 rounded-xl p-1 w-fit">
        {([
          { key: "all", label: "All", icon: Sparkles },
          { key: "mine", label: "My Looks", icon: User },
          { key: "community", label: "Community", icon: Users },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-xs font-sans flex items-center gap-1.5 transition-all ${
              tab === t.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
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
                    {look.type === "user" && (
                      <span className="text-[10px] text-primary/70 font-sans bg-primary/5 px-1.5 py-0.5 rounded-full">
                        {look.authorName}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => toggleSave(look.id, look.type)}
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
                onClick={() => setMatchDialog({ open: true, title: look.title, items: look.items })}
              >
                Recreate from My Closet
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Sparkles className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-sans text-sm">
            {tab === "mine" ? "You haven't created any looks yet" : "No looks match your filters"}
          </p>
          {tab === "mine" && (
            <Button onClick={() => setCreateOpen(true)} variant="outline" size="sm" className="mt-3 font-sans">
              <Plus className="h-4 w-4 mr-1" /> Create Your First Look
            </Button>
          )}
        </div>
      )}

      {/* Closet Match Dialog */}
      <ClosetMatchDialog
        open={matchDialog.open}
        onOpenChange={(open) => setMatchDialog((prev) => ({ ...prev, open }))}
        lookTitle={matchDialog.title}
        lookItems={matchDialog.items}
      />

      {/* Create Look Dialog */}
      <CreateLookDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={refreshLooks}
      />
    </div>
  );
};
