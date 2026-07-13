/**
 * Outfit Occasion Engine
 *
 * FLOW:
 * 1. User picks an occasion
 * 2. Match items from closet by metadata (occasion, style, season, name)
 * 3. Permutation calculator runs on matched items
 * 4. Returns 0 to N outfits — never hardcoded
 */

import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";

// ── Types ──────────────────────────────────────────────────

export type OccasionId =
  | "casual"
  | "formal"
  | "business"
  | "sporty"
  | "party"
  | "date-night"
  | "winter"
  | "summer";

export interface OccasionDef {
  id: OccasionId;
  label: string;
  emoji: string;
}

export interface ClosetItem {
  id: string;
  name: string | null;
  category: string;
  color: string | null;
  brand: string | null;
  season: string | null;
  occasion: string | null;
  style: string | null;
  photo_url: string | null;
}

export interface MatchResult {
  item: ClosetItem;
  matches: boolean;
  confidence: number;
  reason: string;
}

export interface OutfitCombination {
  id: number;
  top: ClosetItem | null;
  bottom: ClosetItem | null;
  shoes: ClosetItem | null;
  accessory: ClosetItem | null;
}

export interface OccasionResult {
  success: boolean;
  occasion: string;
  maxOutfits: number;
  tops: ClosetItem[];
  bottoms: ClosetItem[];
  shoes: ClosetItem[];
  accessories: ClosetItem[];
  outfits: OutfitCombination[];
  message: string;
  analysis: MatchResult[];
}

// ── Occasion Definitions ───────────────────────────────────

export const OCCASIONS: OccasionDef[] = [
  { id: "casual", label: "Casual", emoji: "👕" },
  { id: "formal", label: "Formal", emoji: "🤵" },
  { id: "business", label: "Business", emoji: "💼" },
  { id: "sporty", label: "Sporty", emoji: "🏃" },
  { id: "party", label: "Party", emoji: "🎉" },
  { id: "date-night", label: "Date Night", emoji: "🌹" },
  { id: "winter", label: "Winter", emoji: "❄️" },
  { id: "summer", label: "Summer", emoji: "☀️" },
];

// ── Category Normalization ─────────────────────────────────

function normalizeCategory(raw: string): "top" | "bottom" | "shoes" | "accessory" {
  const lower = raw.toLowerCase().trim();
  if (lower === "top" || lower === "outerwear" || lower === "dress") return "top";
  if (lower === "bottom" || lower === "pants" || lower === "skirt" || lower === "shorts") return "bottom";
  if (lower === "shoes" || lower === "footwear" || lower === "sneakers" || lower === "boots") return "shoes";
  return "accessory";
}

// ── Occasion Keywords ──────────────────────────────────────

const OCCASION_KEYWORDS: Record<string, string[]> = {
  casual: ["casual", "everyday", "relaxed", "streetwear", "loungewear"],
  formal: ["formal", "black-tie", "gala", "wedding", "elegant"],
  business: ["business", "office", "professional", "work", "corporate", "smart-casual"],
  sporty: ["sport", "sporty", "athletic", "gym", "activewear", "running"],
  party: ["party", "nightlife", "club", "going-out", "festive"],
  "date-night": ["date", "date-night", "romantic", "dinner", "evening"],
  winter: ["winter", "cold", "layering", "warm"],
  summer: ["summer", "hot", "beach", "light", "breathable"],
};

// ── Item Matching ──────────────────────────────────────────

function matchItem(item: ClosetItem, occasionId: OccasionId): MatchResult {
  const searchText = [item.occasion, item.style, item.season, item.name, item.color]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const hasMetadata = !!(item.occasion || item.style || item.season);
  if (!hasMetadata) {
    return { item, matches: true, confidence: 0.3, reason: "No metadata — treated as universal" };
  }

  const keywords = OCCASION_KEYWORDS[occasionId] || [];
  const matched = keywords.filter((kw) => searchText.includes(kw));

  if (matched.length > 0) {
    return {
      item,
      matches: true,
      confidence: Math.min(0.5 + matched.length * 0.15, 0.9),
      reason: `Matched: ${matched.join(", ")}`,
    };
  }

  return { item, matches: false, confidence: 0.1, reason: "No matching keywords" };
}

// ── Permutation Calculator ─────────────────────────────────

function calculatePermutations(
  results: MatchResult[],
  occasionId: OccasionId
): {
  tops: ClosetItem[];
  bottoms: ClosetItem[];
  shoes: ClosetItem[];
  accessories: ClosetItem[];
  outfits: OutfitCombination[];
  maxOutfits: number;
} {
  const matched = results.filter((r) => r.matches);

  const tops: ClosetItem[] = [];
  const bottoms: ClosetItem[] = [];
  const shoes: ClosetItem[] = [];
  const accessories: ClosetItem[] = [];

  for (const result of matched) {
    const cat = normalizeCategory(result.item.category);
    switch (cat) {
      case "top": tops.push(result.item); break;
      case "bottom": bottoms.push(result.item); break;
      case "shoes": shoes.push(result.item); break;
      default: accessories.push(result.item); break;
    }
  }

  const maxOutfits = Math.min(tops.length, bottoms.length);

  const outfits: OutfitCombination[] = [];
  for (let i = 0; i < maxOutfits; i++) {
    outfits.push({
      id: i + 1,
      top: tops[i % tops.length] || null,
      bottom: bottoms[i % bottoms.length] || null,
      shoes: shoes.length > 0 ? shoes[i % shoes.length] : null,
      accessory: accessories.length > 0 ? accessories[i % accessories.length] : null,
    });
  }

  return { tops, bottoms, shoes, accessories, outfits, maxOutfits };
}

// ── Main Engine ────────────────────────────────────────────

export async function generateOccasionOutfits(
  userId: string,
  occasionId: OccasionId
): Promise<OccasionResult> {
  const occasion = OCCASIONS.find((o) => o.id === occasionId);
  if (!occasion) {
    return {
      success: false, occasion: occasionId, maxOutfits: 0,
      tops: [], bottoms: [], shoes: [], accessories: [],
      outfits: [], message: `Unknown occasion: ${occasionId}`, analysis: [],
    };
  }

  if (!isSupabaseConfigured) {
    return {
      success: false, occasion: occasion.label, maxOutfits: 0,
      tops: [], bottoms: [], shoes: [], accessories: [],
      outfits: [], message: "Database not connected.", analysis: [],
    };
  }

  const { data: items, error } = await supabase
    .from("clothing_items")
    .select("id, name, category, color, brand, season, occasion, style, photo_url")
    .eq("user_id", userId);

  if (error) {
    return {
      success: false, occasion: occasion.label, maxOutfits: 0,
      tops: [], bottoms: [], shoes: [], accessories: [],
      outfits: [], message: `Failed to fetch closet: ${error.message}`, analysis: [],
    };
  }

  if (!items || items.length === 0) {
    return {
      success: true, occasion: occasion.label, maxOutfits: 0,
      tops: [], bottoms: [], shoes: [], accessories: [],
      outfits: [], message: "Your closet is empty. Add some clothing items first!", analysis: [],
    };
  }

  // Match each item against the occasion
  const analysis = items.map((item) => matchItem(item as ClosetItem, occasionId));

  // Run permutation calculator on matched items
  const { tops, bottoms, shoes, accessories, outfits, maxOutfits } =
    calculatePermutations(analysis, occasionId);

  const matched = analysis.filter((r) => r.matches);

  let message = "";
  if (maxOutfits === 0) {
    if (matched.length === 0) {
      message = `No items match "${occasion.label}". Nothing found — make the outfit you want!`;
    } else {
      const missing: string[] = [];
      if (tops.length === 0) missing.push("tops");
      if (bottoms.length === 0) missing.push("bottoms");
      message = `Found ${matched.length} matching items, but no complete outfits. You need ${missing.join(" and ")}.`;
    }
  } else if (maxOutfits === 1) {
    message = `Found 1 perfect "${occasion.label}" outfit!`;
  } else if (maxOutfits < 5) {
    message = `${maxOutfits} "${occasion.label}" outfits available.`;
  } else {
    message = `Great news! ${maxOutfits} "${occasion.label}" outfits in your wardrobe!`;
  }

  return {
    success: true, occasion: occasion.label, maxOutfits,
    tops, bottoms, shoes, accessories, outfits, message, analysis,
  };
}

// ── Local Fallback ─────────────────────────────────────────

export function calculateOccasionFromLocalItems(
  localItems: Array<{ id: string; name: string; category: string; color?: string; fit?: string; fabric?: string }>,
  occasionId: OccasionId
): OccasionResult {
  const occasion = OCCASIONS.find((o) => o.id === occasionId);
  if (!occasion) {
    return {
      success: false, occasion: occasionId, maxOutfits: 0,
      tops: [], bottoms: [], shoes: [], accessories: [],
      outfits: [], message: `Unknown occasion: ${occasionId}`, analysis: [],
    };
  }

  const categorized: Record<string, ClosetItem[]> = { top: [], bottom: [], shoes: [], accessory: [] };

  for (const item of localItems) {
    const cat = normalizeCategory(item.category);
    categorized[cat].push({
      id: item.id, name: item.name, category: cat,
      color: item.color || null, brand: null, season: null,
      occasion: null, style: null, photo_url: null,
    });
  }

  const tops = categorized.top;
  const bottoms = categorized.bottom;
  const shoes = categorized.shoes;
  const accessories = categorized.accessory;
  const maxOutfits = Math.min(tops.length, bottoms.length);

  const outfits: OutfitCombination[] = [];
  for (let i = 0; i < maxOutfits; i++) {
    outfits.push({
      id: i + 1,
      top: tops[i % tops.length] || null,
      bottom: bottoms[i % bottoms.length] || null,
      shoes: shoes.length > 0 ? shoes[i % shoes.length] : null,
      accessory: accessories.length > 0 ? accessories[i % accessories.length] : null,
    });
  }

  let message = "";
  if (maxOutfits === 0) {
    message = `No "${occasion.label}" outfits possible.`;
  } else if (maxOutfits === 1) {
    message = `Found 1 "${occasion.label}" outfit!`;
  } else {
    message = `${maxOutfits} "${occasion.label}" outfits available!`;
  }

  return {
    success: true, occasion: occasion.label, maxOutfits,
    tops, bottoms, shoes, accessories, outfits, message, analysis: [],
  };
}
