import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle, Shirt, Palette, ShoppingBag, Check } from "lucide-react";

interface ClothingItem {
  id: string;
  name: string | null;
  category: string;
  color: string | null;
}

const ESSENTIAL_CATEGORIES = [
  { key: "top", label: "Tops", icon: "👕" },
  { key: "bottom", label: "Bottoms", icon: "👖" },
  { key: "outerwear", label: "Outerwear", icon: "🧥" },
  { key: "shoes", label: "Shoes", icon: "👟" },
  { key: "dress", label: "Dresses", icon: "👗" },
  { key: "accessory", label: "Accessories", icon: "💍" },
];

const CORE_COLORS = ["black", "white", "navy", "gray", "grey", "beige", "brown", "blue"];
const ACCENT_COLORS = ["red", "green", "yellow", "pink", "orange", "purple", "burgundy"];

export function WardrobeGapAnalysis() {
  const { user } = useAuth();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("clothing_items")
        .select("id, name, category, color")
        .eq("user_id", user.id);
      setItems(data || []);
      setLoading(false);
    })();
  }, [user]);

  const analysis = useMemo(() => {
    const catCounts = new Map<string, number>();
    const colorSet = new Set<string>();

    items.forEach((i) => {
      catCounts.set(i.category, (catCounts.get(i.category) || 0) + 1);
      if (i.color) colorSet.add(i.color.toLowerCase().trim());
    });

    // Missing categories
    const missingCats = ESSENTIAL_CATEGORIES.filter(
      (c) => !catCounts.has(c.key) || (catCounts.get(c.key) || 0) === 0
    );

    // Weak categories (< 3 items)
    const weakCats = ESSENTIAL_CATEGORIES.filter((c) => {
      const count = catCounts.get(c.key) || 0;
      return count > 0 && count < 3;
    }).map((c) => ({ ...c, count: catCounts.get(c.key) || 0 }));

    // Missing core neutrals
    const missingNeutrals = CORE_COLORS.filter((c) => !colorSet.has(c));

    // Has accent colors?
    const hasAccent = ACCENT_COLORS.some((c) => colorSet.has(c));

    // Suggestions
    const suggestions: string[] = [];
    missingCats.forEach((c) => suggestions.push(`Add your first ${c.label.toLowerCase()} piece`));
    weakCats.forEach((c) => suggestions.push(`Expand ${c.label.toLowerCase()} (only ${c.count})`));
    if (missingNeutrals.length > 2) suggestions.push(`Add neutral basics: ${missingNeutrals.slice(0, 3).join(", ")}`);
    if (!hasAccent) suggestions.push("Add a pop of color — try red, green, or burgundy");

    const completeness = Math.round(
      ((ESSENTIAL_CATEGORIES.length - missingCats.length) / ESSENTIAL_CATEGORIES.length) * 100
    );

    return { missingCats, weakCats, missingNeutrals, hasAccent, suggestions, completeness, colorSet };
  }, [items]);

  if (loading || items.length === 0) return null;
  if (analysis.suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-5"
    >
      <div className="flex items-center gap-2 mb-1">
        <ShoppingBag className="w-5 h-5 text-primary" />
        <h3 className="font-display text-base font-bold text-foreground">Wardrobe Gaps</h3>
        <span className="ml-auto text-xs font-sans font-bold text-primary">{analysis.completeness}%</span>
      </div>
      <p className="text-[10px] font-sans text-muted-foreground mb-3">
        Categories & colors to complete your wardrobe
      </p>

      {/* Category coverage */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {ESSENTIAL_CATEGORIES.map((cat) => {
          const missing = analysis.missingCats.some((m) => m.key === cat.key);
          const weak = analysis.weakCats.some((w) => w.key === cat.key);
          return (
            <div
              key={cat.key}
              className={`rounded-xl p-2.5 text-center border ${
                missing
                  ? "border-destructive/30 bg-destructive/5"
                  : weak
                  ? "border-amber-500/30 bg-amber-500/5"
                  : "border-emerald-500/30 bg-emerald-500/5"
              }`}
            >
              <span className="text-base">{cat.icon}</span>
              <p className="text-[10px] font-sans font-medium text-foreground mt-0.5">{cat.label}</p>
              {missing ? (
                <AlertCircle className="w-3 h-3 text-destructive mx-auto mt-0.5" />
              ) : !weak ? (
                <Check className="w-3 h-3 text-emerald-500 mx-auto mt-0.5" />
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Color gaps */}
      {analysis.missingNeutrals.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] font-sans font-semibold text-muted-foreground mb-2 flex items-center gap-1">
            <Palette className="w-3 h-3" /> Missing Neutrals
          </p>
          <div className="flex flex-wrap gap-1.5">
            {analysis.missingNeutrals.map((c) => (
              <span key={c} className="text-[10px] font-sans px-2 py-0.5 rounded-full border border-border bg-secondary text-muted-foreground capitalize">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      <div className="space-y-1.5">
        {analysis.suggestions.slice(0, 4).map((s, i) => (
          <div key={i} className="flex items-start gap-2 py-1">
            <Shirt className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-xs font-sans text-foreground">{s}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
