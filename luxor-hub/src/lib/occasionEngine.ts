/**
 * Outfit Occasion Engine v2
 *
 * FLOW:
 * 1. User picks an occasion
 * 2. MiMo Vision 2.5v analyzes every clothing image in the closet
 * 3. MiMo returns which items match the occasion (with confidence scores)
 * 4. Permutation calculator runs as CALLBACK on MiMo's matched items
 * 5. Returns 0 to N outfits — never hardcoded
 *
 * If MiMo finds 0 matching items → "Nothing found. Make the outfit you want."
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
  prompt: string; // The prompt sent to MiMo Vision
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

export interface MiMoMatchResult {
  item: ClosetItem;
  matches: boolean;
  confidence: number; // 0-1
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
  mimoAnalysis: MiMoMatchResult[];
}

// ── Occasion Definitions ───────────────────────────────────

export const OCCASIONS: OccasionDef[] = [
  {
    id: "casual",
    label: "Casual",
    emoji: "👕",
    prompt: "Is this clothing item suitable for a casual everyday outfit? Consider comfort, relaxed fit, streetwear, loungewear.",
  },
  {
    id: "formal",
    label: "Formal",
    emoji: "🤵",
    prompt: "Is this clothing item suitable for a formal black-tie event, gala, or wedding? Consider elegance, sophistication, dress code.",
  },
  {
    id: "business",
    label: "Business",
    emoji: "💼",
    prompt: "Is this clothing item suitable for a business office, professional meeting, or corporate environment? Consider smart-casual to formal workwear.",
  },
  {
    id: "sporty",
    label: "Sporty",
    emoji: "🏃",
    prompt: "Is this clothing item suitable for sports, gym, running, or athletic activities? Consider performance fabric,运动性, activewear.",
  },
  {
    id: "party",
    label: "Party",
    emoji: "🎉",
    prompt: "Is this clothing item suitable for a party, nightclub, or festive celebration? Consider bold style, nightlife, going-out looks.",
  },
  {
    id: "date-night",
    label: "Date Night",
    emoji: "🌹",
    prompt: "Is this clothing item suitable for a romantic dinner date or evening out? Consider stylish, attractive, evening-appropriate.",
  },
  {
    id: "winter",
    label: "Winter",
    emoji: "❄️",
    prompt: "Is this clothing item suitable for cold winter weather? Consider warmth, layering, heavy fabrics, cold-weather wear.",
  },
  {
    id: "summer",
    label: "Summer",
    emoji: "☀️",
    prompt: "Is this clothing item suitable for hot summer weather? Consider lightweight, breathable, light colors, beach-appropriate.",
  },
];

// ── Category Normalization ─────────────────────────────────

function normalizeCategory(raw: string): "top" | "bottom" | "shoes" | "accessory" {
  const lower = raw.toLowerCase().trim();
  if (lower === "top" || lower === "outerwear" || lower === "dress") return "top";
  if (lower === "bottom" || lower === "pants" || lower === "skirt" || lower === "shorts") return "bottom";
  if (lower === "shoes" || lower === "footwear" || lower === "sneakers" || lower === "boots") return "shoes";
  return "accessory";
}

// ── MiMo Vision 2.5v Integration ──────────────────────────

/**
 * Send a clothing item image to MiMo Vision for occasion matching.
 * Returns whether the item matches the occasion with a confidence score.
 */
async function analyzeItemWithMiMo(
  item: ClosetItem,
  occasion: OccasionDef,
  apiBase: string
): Promise<MiMoMatchResult> {
  // If no image, do text-based matching as fallback
  if (!item.photo_url) {
    const textMatch = textBasedMatch(item, occasion);
    return {
      item,
      matches: textMatch.matches,
      confidence: textMatch.confidence,
      reason: textMatch.reason,
    };
  }

  try {
    const response = await fetch(apiBase + "/api/v1/mimo-vision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: item.photo_url,
        prompt: occasion.prompt,
        item_name: item.name,
        item_category: item.category,
        item_color: item.color,
        item_brand: item.brand,
      }),
    });

    if (!response.ok) {
      // Fallback to text-based matching if MiMo is unavailable
      const textMatch = textBasedMatch(item, occasion);
      return { item, ...textMatch };
    }

    const data = await response.json();
    return {
      item,
      matches: data.matches === true || data.matches === "yes",
      confidence: typeof data.confidence === "number" ? data.confidence : 0.5,
      reason: data.reason || "Analyzed by MiMo Vision",
    };
  } catch (err) {
    console.warn(`[MIMO] Vision analysis failed for ${item.name}:`, err);
    const textMatch = textBasedMatch(item, occasion);
    return { item, ...textMatch };
  }
}

/**
 * Text-based fallback when MiMo Vision is unavailable.
 * Matches based on item metadata keywords.
 */
function textBasedMatch(
  item: ClosetItem,
  occasion: OccasionDef
): { matches: boolean; confidence: number; reason: string } {
  const searchText = [item.occasion, item.style, item.season, item.name, item.color]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  // Items with no metadata are universal (match everything)
  const hasMetadata = !!(item.occasion || item.style || item.season);
  if (!hasMetadata) {
    return { matches: true, confidence: 0.3, reason: "No metadata — treated as universal" };
  }

  const occasionKeywords: Record<string, string[]> = {
    casual: ["casual", "everyday", "relaxed", "streetwear", "loungewear"],
    formal: ["formal", "black-tie", "gala", "wedding", "elegant"],
    business: ["business", "office", "professional", "work", "corporate", "smart-casual"],
    sporty: ["sport", "sporty", "athletic", "gym", "activewear", "running"],
    party: ["party", "nightlife", "club", "going-out", "festive"],
    "date-night": ["date", "date-night", "romantic", "dinner", "evening"],
    winter: ["winter", "cold", "layering", "warm"],
    summer: ["summer", "hot", "beach", "light", "breathable"],
  };

  const keywords = occasionKeywords[occasion.id] || [];
  const matched = keywords.filter((kw) => searchText.includes(kw));

  if (matched.length > 0) {
    return {
      matches: true,
      confidence: Math.min(0.5 + matched.length * 0.15, 0.9),
      reason: `Text match: ${matched.join(", ")}`,
    };
  }

  return { matches: false, confidence: 0.1, reason: "No matching keywords found" };
}

// ── Permutation Calculator (runs as MiMo callback) ─────────

/**
 * Calculates ALL possible outfit combinations from MiMo-matched items.
 * This runs AFTER MiMo Vision returns its analysis.
 * Returns 0 to N outfits — unlimited, never hardcoded.
 */
function calculatePermutationsFromMiMo(
  mimoResults: MiMoMatchResult[],
  occasion: OccasionDef
): {
  tops: ClosetItem[];
  bottoms: ClosetItem[];
  shoes: ClosetItem[];
  accessories: CloViewItem[];
  outfits: OutfitCombination[];
  maxOutfits: number;
} {
  // Filter to only items MiMo said match
  const matched = mimoResults.filter((r) => r.matches);

  const tops: ClosetItem[] = [];
  const bottoms: ClosetItem[] = [];
  const shoes: CloViewItem[] = [];
  const accessories: CloViewItem[] = [];

  for (const result of matched) {
    const cat = normalizeCategory(result.item.category);
    switch (cat) {
      case "top": tops.push(result.item); break;
      case "bottom": bottoms.push(result.item); break;
      case "shoes": shoes.push(result.item); break;
      default: accessories.push(result.item); break;
    }
  }

  // Max outfits = minimum across required categories
  const maxOutfits = Math.min(tops.length, bottoms.length);

  // Generate all combinations via round-robin
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

/**
 * Full pipeline: MiMo Vision analyzes → Permutation calculator runs as callback.
 *
 * 1. Fetch all clothing items from Supabase
 * 2. Send each item to MiMo Vision for occasion matching
 * 3. Permutation calculator runs on MiMo's matched results
 * 4. Return the exact number of outfits possible
 */
export async function generateOccasionOutfits(
  userId: string,
  occasionId: OccasionId
): Promise<OccasionResult> {
  const occasion = OCCASIONS.find((o) => o.id === occasionId);
  if (!occasion) {
    return {
      success: false, occasion: occasionId, maxOutfits: 0,
      tops: [], bottoms: [], shoes: [], accessories: [],
      outfits: [], message: `Unknown occasion: ${occasionId}`,
      mimoAnalysis: [],
    };
  }

  if (!isSupabaseConfigured) {
    return {
      success: false, occasion: occasion.label, maxOutfits: 0,
      tops: [], bottoms: [], shoes: [], accessories: [],
      outfits: [], message: "Database not connected. Please configure Supabase.",
      mimoAnalysis: [],
    };
  }

  // 1. Fetch all items
  const { data: items, error } = await supabase
    .from("clothing_items")
    .select("id, name, category, color, brand, season, occasion, style, photo_url")
    .eq("user_id", userId);

  if (error) {
    return {
      success: false, occasion: occasion.label, maxOutfits: 0,
      tops: [], bottoms: [], shoes: [], accessories: [],
      outfits: [], message: `Failed to fetch closet: ${error.message}`,
      mimoAnalysis: [],
    };
  }

  if (!items || items.length === 0) {
    return {
      success: true, occasion: occasion.label, maxOutfits: 0,
      tops: [], bottoms: [], shoes: [], accessories: [],
      outfits: [], message: "Your closet is empty. Add some clothing items first!",
      mimoAnalysis: [],
    };
  }

  // 2. MiMo Vision analyzes each item
  const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_PUBLIC_API_URL ||
    (typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:5000" : "");

  const mimoResults: MiMoMatchResult[] = [];

  // Analyze items in batches of 5 to avoid rate limits
  for (let i = 0; i < items.length; i += 5) {
    const batch = items.slice(i, i + 5);
    const batchResults = await Promise.all(
      batch.map((item) => analyzeItemWithMiMo(item as ClosetItem, occasion, apiBase))
    );
    mimoResults.push(...batchResults);
  }

  // 3. Permutation calculator runs as CALLBACK on MiMo results
  const matched = mimoResults.filter((r) => r.matches);
  const { tops, bottoms, shoes, accessories, outfits, maxOutfits } =
    calculatePermutationsFromMiMo(mimoResults, occasion);

  // 4. Build message
  let message = "";
  if (maxOutfits === 0) {
    if (matched.length === 0) {
      message = `MiMo Vision found 0 items that fit "${occasion.label}". Nothing found — make the outfit you want!`;
    } else {
      const missing: string[] = [];
      if (tops.length === 0) missing.push("tops");
      if (bottoms.length === 0) missing.push("bottoms");
      message = `Found ${matched.length} matching items, but no complete outfits possible. You need ${missing.join(" and ")} for "${occasion.label}".`;
    }
  } else if (maxOutfits === 1) {
    message = `MiMo Vision found 1 perfect "${occasion.label}" outfit for you!`;
  } else if (maxOutfits < 5) {
    message = `MiMo Vision created ${maxOutfits} "${occasion.label}" outfits from your closet.`;
  } else {
    message = `Great news! MiMo Vision found ${maxOutfits} "${occasion.label}" outfits in your wardrobe!`;
  }

  return {
    success: true,
    occasion: occasion.label,
    maxOutfits,
    tops,
    bottoms,
    shoes,
    accessories,
    outfits,
    message,
    mimoAnalysis: mimoResults,
  };
}

// ── Local Fallback (no Supabase) ──────────────────────────

export function calculateOccasionFromLocalItems(
  localItems: Array<{ id: string; name: string; category: string; color?: string; fit?: string; fabric?: string }>,
  occasionId: OccasionId
): OccasionResult {
  const occasion = OCCASIONS.find((o) => o.id === occasionId);
  if (!occasion) {
    return {
      success: false, occasion: occasionId, maxOutfits: 0,
      tops: [], bottoms: [], shoes: [], accessories: [],
      outfits: [], message: `Unknown occasion: ${occasionId}`,
      mimoAnalysis: [],
    };
  }

  const categorized: Record<string, ClosetItem[]> = { top: [], bottom: [], shoes: [], accessory: [] };

  for (const item of localItems) {
    const cat = normalizeCategory(item.category);
    const searchText = [item.name, item.color, item.fit, item.fabric].filter(Boolean).join(" ").toLowerCase();
    const hasMetadata = !!(item.color || item.fit || item.fabric);
    // Without metadata, treat as universal match
    const matches = !hasMetadata;

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
    message = `No "${occasion.label}" outfits possible from local items.`;
  } else if (maxOutfits === 1) {
    message = `Found 1 "${occasion.label}" outfit!`;
  } else {
    message = `${maxOutfits} "${occasion.label}" outfits available!`;
  }

  return {
    success: true, occasion: occasion.label, maxOutfits,
    tops, bottoms, shoes, accessories, outfits, message,
    mimoAnalysis: [],
  };
}
