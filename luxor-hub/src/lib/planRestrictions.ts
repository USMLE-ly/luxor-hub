export type PlanTier = "free" | "starter" | "pro" | "elite";

export const TIER_ORDER: PlanTier[] = ["free", "starter", "pro", "elite"];

export function tierIndex(tier: PlanTier): number {
  return TIER_ORDER.indexOf(tier);
}

export function hasTierAccess(userTier: PlanTier, requiredTier: PlanTier): boolean {
  return tierIndex(userTier) >= tierIndex(requiredTier);
}

// ── Credit-Based Limits ────────────────────────────────────────────────
export const TIER_MONTHLY_CREDITS: Record<PlanTier, number> = {
  free: 30,
  starter: 200,
  pro: 1000,
  elite: 5000,
};

export const CREDIT_COSTS: Record<string, number> = {
  analyze_outfit: 5,
  style_analyze: 3,
  style_recommendations: 3,
  outfit_review: 2,
  generate_outfits: 4,
  pro_tweak: 8,
  closet_analyze: 3,
  stylist_explore: 2,
  stylist_generate: 4,
  ai_fill_details: 2,
  generate_1_outfit: 3,
  generate_2_outfits: 5,
  generate_3_outfits: 7,
  calendar_manual: 2,
  dressing_room_style: 3,
  dressing_room_tryon: 4,
  outfit_analysis: 5,
  outfit_recommendation: 3,
};

export function getEstimatedAnalyses(tier: PlanTier): number {
  const credits = TIER_MONTHLY_CREDITS[tier];
  const avgCost = 4; // average cost per AI action
  return Math.floor(credits / avgCost);
}

export function hasCreditsRemaining(creditsRemaining: number, actionCost: number): boolean {
  return creditsRemaining >= actionCost;
}

export const PLAN_LIMITS = {
  free: {
    monthlyCredits: 30,
    aiSuggestionsPerDay: 3,
    closetItems: 15,
    styleDna: "basic" as const,
    colorAnalysis: false,
    dailyOutfit: false,
    capsuleWardrobes: false,
    virtualTryOn: false,
    personalConcierge: false,
    priorityChat: false,
    outfitCalendar: false,
    trendIntelligence: false,
    shoppingRecs: false,
    wardrobeGap: false,
    monthlyReport: false,
    prioritySupport: false,
  },
  starter: {
    monthlyCredits: 200,
    aiSuggestionsPerDay: 10,
    closetItems: 50,
    styleDna: "basic" as const,
    colorAnalysis: "basic" as const,
    dailyOutfit: true,
    capsuleWardrobes: false,
    virtualTryOn: false,
    personalConcierge: false,
    priorityChat: false,
    outfitCalendar: false,
    trendIntelligence: false,
    shoppingRecs: false,
    wardrobeGap: false,
    monthlyReport: false,
    prioritySupport: false,
  },
  pro: {
    monthlyCredits: 1000,
    aiSuggestionsPerDay: Infinity,
    closetItems: Infinity,
    styleDna: "full" as const,
    colorAnalysis: "full" as const,
    dailyOutfit: true,
    capsuleWardrobes: true,
    virtualTryOn: false,
    personalConcierge: false,
    priorityChat: true,
    outfitCalendar: true,
    trendIntelligence: false,
    shoppingRecs: false,
    wardrobeGap: false,
    monthlyReport: false,
    prioritySupport: false,
  },
  elite: {
    monthlyCredits: 5000,
    aiSuggestionsPerDay: Infinity,
    closetItems: Infinity,
    styleDna: "full" as const,
    colorAnalysis: "full" as const,
    dailyOutfit: true,
    capsuleWardrobes: true,
    virtualTryOn: true,
    personalConcierge: true,
    priorityChat: true,
    outfitCalendar: true,
    trendIntelligence: true,
    shoppingRecs: true,
    wardrobeGap: true,
    monthlyReport: true,
    prioritySupport: true,
  },
} as const;
