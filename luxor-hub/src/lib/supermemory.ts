import Supermemory from "supermemory";

/**
 * LEXOR® Fashion Memory Engine
 * Powered by Supermemory — long-term memory for AI fashion intelligence.
 * 
 * Stores and retrieves: style DNA, wardrobe history, outfit preferences,
 * trend affinity, seasonal habits, body evolution, and conversation context.
 */

const supermemoryClient = new Supermemory({
  apiKey: import.meta.env.VITE_SUPERMEMORY_API_KEY || "",
});

/* ── Types ── */
export interface StyleMemory {
  id: string;
  content: string;
  type: "style_dna" | "wardrobe" | "outfit" | "preference" | "trend" | "body" | "conversation";
  metadata?: Record<string, unknown>;
}

export interface UserProfile {
  static: string[];
  dynamic: string[];
}

/* ── Core Operations ── */

/** Add a fashion memory for a user */
export async function addFashionMemory(params: {
  userId: string;
  content: string;
  type: StyleMemory["type"];
  metadata?: Record<string, unknown>;
}) {
  try {
    const result = await supermemoryClient.add({
      content: params.content,
      containerTag: `lexor-user-${params.userId}`,
      metadata: {
        ...params.metadata,
        memoryType: params.type,
        userId: params.userId,
        timestamp: new Date().toISOString(),
      },
      entityContext: `Fashion style memory for user ${params.userId}. This is a ${params.type} memory about their fashion preferences, wardrobe, and style identity.`,
    });
    return result;
  } catch (error) {
    console.error("[Supermemory] Failed to add memory:", error);
    return null;
  }
}

/** Search user's fashion memories */
export async function searchFashionMemories(params: {
  userId: string;
  query: string;
  limit?: number;
}) {
  try {
    const results = await supermemoryClient.search({
      q: params.query,
      containerTag: `lexor-user-${params.userId}`,
      limit: params.limit || 10,
    });
    return results;
  } catch (error) {
    console.error("[Supermemory] Failed to search memories:", error);
    return null;
  }
}

/** Get user's fashion profile (static + dynamic memories) */
export async function getUserFashionProfile(userId: string, query?: string) {
  try {
    const profile = await supermemoryClient.profile({
      containerTag: `lexor-user-${userId}`,
      query: query || "fashion style preferences wardrobe",
    });
    return profile;
  } catch (error) {
    console.error("[Supermemory] Failed to get profile:", error);
    return null;
  }
}

/* ── High-Level Fashion Operations ── */

/** Store outfit decision and reasoning */
export async function storeOutfitDecision(userId: string, outfit: {
  name: string;
  occasion: string;
  items: string[];
  reasoning: string;
  confidence: number;
}) {
  return addFashionMemory({
    userId,
    content: `Outfit: ${outfit.name}. Occasion: ${outfit.occasion}. Items: ${outfit.items.join(", ")}. Reasoning: ${outfit.reasoning}. Confidence: ${outfit.confidence}%.`,
    type: "outfit",
    metadata: { occasion: outfit.occasion, confidence: outfit.confidence },
  });
}

/** Store style preference learned from user interaction */
export async function storeStylePreference(userId: string, preference: string, source: string) {
  return addFashionMemory({
    userId,
    content: `Style preference: ${preference}. Source: ${source}.`,
    type: "preference",
    metadata: { source },
  });
}

/** Store wardrobe item with details */
export async function storeWardrobeItem(userId: string, item: {
  name: string;
  category: string;
  color: string;
  season: string;
  occasion?: string;
  brand?: string;
}) {
  return addFashionMemory({
    userId,
    content: `Wardrobe item: ${item.name}. Category: ${item.category}. Color: ${item.color}. Season: ${item.season}. ${item.occasion ? `Occasion: ${item.occasion}.` : ""} ${item.brand ? `Brand: ${item.brand}.` : ""}`,
    type: "wardrobe",
    metadata: { category: item.category, season: item.season },
  });
}

/** Store style DNA evolution */
export async function storeStyleDNA(userId: string, dna: {
  archetype: string;
  scores: Record<string, number>;
  evolution: string;
}) {
  return addFashionMemory({
    userId,
    content: `Style DNA: Archetype is ${dna.archetype}. Scores: ${Object.entries(dna.scores).map(([k, v]) => `${k}: ${v}`).join(", ")}. Evolution: ${dna.evolution}.`,
    type: "style_dna",
    metadata: { archetype: dna.archetype, scores: dna.scores },
  });
}

/** Store trend affinity */
export async function storeTrendAffinity(userId: string, trend: {
  name: string;
  affinity: "love" | "like" | "dislike" | "ignore";
  reason: string;
}) {
  return addFashionMemory({
    userId,
    content: `Trend: ${trend.name}. Affinity: ${trend.affinity}. Reason: ${trend.reason}.`,
    type: "trend",
    metadata: { affinity: trend.affinity },
  });
}

/** Search for outfit suggestions based on past preferences */
export async function findSimilarOutfits(userId: string, occasion: string, weather?: string) {
  return searchFashionMemories({
    userId,
    query: `outfit for ${occasion}${weather ? ` in ${weather} weather` : ""}`,
    limit: 5,
  });
}

/** Get contextual memories for AI chat */
export async function getChatContext(userId: string, currentMessage: string) {
  const [searchResults, profile] = await Promise.all([
    searchFashionMemories({ userId, query: currentMessage, limit: 3 }),
    getUserFashionProfile(userId, currentMessage),
  ]);

  return {
    searchResults: searchResults?.results || [],
    profile: profile?.profile || { static: [], dynamic: [] },
  };
}

export default supermemoryClient;
