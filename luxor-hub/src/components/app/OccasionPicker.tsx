/**
 * OccasionPicker — Dynamic outfit occasion engine UI
 *
 * Flow: User picks occasion → Match items by metadata →
 *       Permutation calculator → Show N outfits
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Spinner, Sparkle, TShirt, Pants, Sneaker, Watch, CaretRight, X } from "@phosphor-icons/react";
import {
  OCCASIONS,
  generateOccasionOutfits,
  calculateOccasionFromLocalItems,
  type OccasionId,
  type OccasionResult,
  type OutfitCombination,
  type ClosetItem,
  type MatchResult,
} from "@/lib/occasionEngine";
import { useWardrobeStore } from "@/store/useWardrobeStore";
import { isSupabaseConfigured } from "@/integrations/supabase/client";

// ── Category Icon ──────────────────────────────────────────
function CategoryIcon({ category }: { category: string }) {
  switch (category) {
    case "top": return <TShirt className="w-4 h-4" />;
    case "bottom": return <Pants className="w-4 h-4" />;
    case "shoes": return <Sneaker className="w-4 h-4" />;
    default: return <Watch className="w-4 h-4" />;
  }
}

// ── Confidence Badge ───────────────────────────────────────
function ConfidenceBadge({ confidence }: { confidence: number }) {
  const color = confidence >= 0.7 ? "text-green-500" : confidence >= 0.4 ? "text-yellow-500" : "text-red-400";
  return (
    <span className={`text-[9px] font-sans font-bold ${color}`}>
      {Math.round(confidence * 100)}%
    </span>
  );
}

// ── Item Card ──────────────────────────────────────────────
function ItemCard({ item, match }: { item: ClosetItem; match?: MatchResult }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 border border-border">
      {item.photo_url ? (
        <img loading="lazy" src={item.photo_url} alt={item.name || "Item"} className="w-10 h-10 rounded-md object-cover" />
      ) : (
        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
          <CategoryIcon category={item.category} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-sans font-semibold text-foreground truncate">{item.name || "Unnamed"}</p>
        <div className="flex items-center gap-1">
          <p className="text-[10px] font-sans text-muted-foreground capitalize">{item.rawCategory || item.category}</p>
          {match && (
            <>
              <span className="text-[9px] text-muted-foreground">·</span>
              <ConfidenceBadge confidence={match.confidence} />
            </>
          )}
        </div>
        {match && (
          <p className="text-[9px] font-sans text-muted-foreground truncate italic">{match.reason}</p>
        )}
      </div>
    </div>
  );
}

// ── Outfit Card ────────────────────────────────────────────
function OutfitCard({ outfit, index }: { outfit: OutfitCombination; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-3 rounded-xl bg-card border border-border"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-sans font-bold text-primary">Outfit #{outfit.id}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {outfit.top && <ItemCard item={outfit.top} />}
        {outfit.bottom && <ItemCard item={outfit.bottom} />}
        {outfit.shoes && <ItemCard item={outfit.shoes} />}
        {outfit.accessory && <ItemCard item={outfit.accessory} />}
      </div>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────
export function OccasionPicker() {
  const { user } = useAuth();
  const [result, setResult] = useState<OccasionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const catalogItems = useWardrobeStore((s) => s.catalogItems);

  const handleOccasionSelect = useCallback(
    async (occasionId: OccasionId) => {
      setLoading(true);
      setResult(null);

      try {
        let occasionResult: OccasionResult;

        if (isSupabaseConfigured && user?.id) {
          occasionResult = await generateOccasionOutfits(user.id, occasionId);
        } else if (catalogItems.length > 0) {
          occasionResult = calculateOccasionFromLocalItems(catalogItems, occasionId);
        } else {
          occasionResult = {
            success: false, occasion: occasionId, maxOutfits: 0,
            tops: [], bottoms: [], shoes: [], accessories: [],
            outfits: [], message: "No clothing items found. Add items to your closet first!",
            analysis: [],
          };
        }

        setResult(occasionResult);

        if (occasionResult.maxOutfits > 0) {
          toast.success(occasionResult.message);
        } else {
          toast.info(occasionResult.message);
        }
      } catch (err) {
        console.error("[OCCASION PICKER] Error:", err);
        toast.error("Failed to calculate outfits");
      } finally {
        setLoading(false);
      }
    },
    [user, catalogItems]
  );

  const matchedCount = result?.analysis?.filter((r) => r.matches).length || 0;
  const totalCount = result?.analysis?.length || 0;

  return (
    <div className="mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-sans font-semibold text-foreground text-sm flex items-center gap-1.5">
          <Sparkle className="w-4 h-4 text-primary" />
          Pick an Occasion
        </h2>
        {result && (
          <button
            onClick={() => setResult(null)}
            className="text-xs font-sans text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Occasion Buttons */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {OCCASIONS.map((occ) => (
          <button
            key={occ.id}
            onClick={() => handleOccasionSelect(occ.id)}
            disabled={loading}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-sans font-semibold transition-all border ${
              result?.occasion === occ.label
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card text-foreground border-border hover:border-primary/40 hover:bg-primary/5"
            } ${loading ? "opacity-60 cursor-wait" : ""}`}
          >
            <span>{occ.emoji}</span>
            <span>{occ.label}</span>
          </button>
        ))}
      </div>

      {/* Loading State */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20"
          >
            <Spinner className="w-4 h-4 animate-spin text-primary" />
            <p className="text-xs font-sans text-primary">Calculating outfits...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2"
          >
            {/* Summary Card */}
            <div className={`p-3 rounded-xl border mb-2 ${
              result.maxOutfits > 0
                ? "bg-primary/5 border-primary/20"
                : "bg-muted border-border"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-sans font-bold text-foreground">{result.message}</p>
                  {totalCount > 0 && (
                    <p className="text-[10px] font-sans text-muted-foreground mt-0.5">
                      Analyzed {totalCount} items · {matchedCount} matched "{result.occasion}"
                    </p>
                  )}
                  <p className="text-[10px] font-sans text-muted-foreground mt-0.5">
                    {result.tops.length} tops · {result.bottoms.length} bottoms · {result.shoes.length} shoes · {result.accessories.length} accessories
                  </p>
                </div>
                {result.maxOutfits > 0 && (
                  <div className="text-right ml-3">
                    <span className="text-2xl font-display font-bold text-primary">{result.maxOutfits}</span>
                    <p className="text-[9px] font-sans text-muted-foreground">OUTFITS</p>
                  </div>
                )}
              </div>
            </div>

            {/* Analysis Details (collapsed) */}
            {result.analysis.length > 0 && (
              <details className="mb-2 group">
                <summary className="text-[10px] font-sans text-muted-foreground cursor-pointer hover:text-foreground transition-colors flex items-center gap-1">
                  <CaretRight className="w-3 h-3 group-open:rotate-90 transition-transform" />
                  Analysis ({matchedCount}/{totalCount} matched)
                </summary>
                <div className="mt-1 space-y-1 max-h-40 overflow-y-auto scrollbar-none">
                  {result.analysis.map((m) => (
                    <div key={m.item.id} className={`flex items-center gap-2 p-1.5 rounded-lg text-[10px] ${
                      m.matches ? "bg-green-500/5 border border-green-500/20" : "bg-red-500/5 border border-red-500/10"
                    }`}>
                      <span className={m.matches ? "text-green-500" : "text-red-400"}>
                        {m.matches ? "✓" : "✗"}
                      </span>
                      <span className="font-sans text-foreground truncate flex-1">{m.item.name || "Unnamed"}</span>
                      <ConfidenceBadge confidence={m.confidence} />
                    </div>
                  ))}
                </div>
              </details>
            )}

            {/* Outfit Combinations */}
            {result.outfits.length > 0 && (
              <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-none">
                {result.outfits.map((outfit, idx) => (
                  <OutfitCard key={outfit.id} outfit={outfit} index={idx} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {result.maxOutfits === 0 && (
              <div className="text-center py-4 rounded-xl bg-muted/50 border border-border">
                <Sparkle className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs font-sans font-semibold text-foreground">Nothing found for this occasion</p>
                <p className="text-[10px] font-sans text-muted-foreground mt-1">
                  No matching items found. Add more clothes or create your own outfit!
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
