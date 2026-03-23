export type PlanTier = "free" | "starter" | "pro" | "elite";

export const TIER_ORDER: PlanTier[] = ["free", "starter", "pro", "elite"];

export function tierIndex(tier: PlanTier): number {
  return TIER_ORDER.indexOf(tier);
}

export function hasTierAccess(userTier: PlanTier, requiredTier: PlanTier): boolean {
  return tierIndex(userTier) >= tierIndex(requiredTier);
}

export const PLAN_LIMITS = {
  free: {
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
