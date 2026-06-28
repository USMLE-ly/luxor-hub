const TIER_ORDER = ["free", "starter", "pro", "elite"];
function tierIndex(tier) {
  return TIER_ORDER.indexOf(tier);
}
function hasTierAccess(userTier, requiredTier) {
  return tierIndex(userTier) >= tierIndex(requiredTier);
}
const PLAN_LIMITS = {
  free: {
    aiSuggestionsPerDay: 3,
    closetItems: 15,
    styleDna: "basic",
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
    prioritySupport: false
  },
  starter: {
    aiSuggestionsPerDay: 10,
    closetItems: 50,
    styleDna: "basic",
    colorAnalysis: "basic",
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
    prioritySupport: false
  },
  pro: {
    aiSuggestionsPerDay: Infinity,
    closetItems: Infinity,
    styleDna: "full",
    colorAnalysis: "full",
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
    prioritySupport: false
  },
  elite: {
    aiSuggestionsPerDay: Infinity,
    closetItems: Infinity,
    styleDna: "full",
    colorAnalysis: "full",
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
    prioritySupport: true
  }
};
export {
  PLAN_LIMITS as P,
  hasTierAccess as h
};
