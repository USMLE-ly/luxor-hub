/**
 * Shared calendar helper functions extracted from OutfitCalendar.tsx.
 * Pure functions with no React dependencies — reusable across MonthlyReport, Council, etc.
 */

/** Generate a stable fingerprint for outfit deduplication */
export function getOutfitFingerprint(items: any[]): string {
  if (!Array.isArray(items) || items.length === 0) return "";
  const names = items
    .map((item: any) => {
      if (typeof item === "string") return item.toLowerCase();
      return (item?.name || item?.category || "").toLowerCase();
    })
    .filter(Boolean)
    .sort();
  return names.join("|");
}

/** Weather + occasion style tips — returns a human-readable suggestion string */
export function getStyleTip(
  occasion: string | null,
  weather: { rain?: boolean; temp?: number } | undefined
): string | null {
  if (!occasion && !weather) return null;
  const occ = (occasion || "casual").toLowerCase();
  const isRain = weather?.rain;
  const temp = weather?.temp ?? 20;
  const isCold = temp <= 10;
  const isHot = temp >= 28;
  const isCool = temp > 10 && temp <= 18;

  // Weather + occasion combos
  if (occ === "formal" && isRain) return "✨ Pair a structured trench with oxfords — rainy elegance";
  if (occ === "formal" && isCold) return "✨ Layer a cashmere scarf over your blazer for warmth with polish";
  if (occ === "formal" && isHot) return "✨ Opt for linen suiting in light tones — breathable yet sharp";
  if (occ === "work" && isRain) return "✨ Dark-wash denim + waterproof Chelsea boots = rain-proof smart-casual";
  if (occ === "work" && isCold) return "✨ Turtleneck under a structured coat keeps it sleek and warm";
  if (occ === "work" && isHot) return "✨ Linen camp collar shirt + tailored shorts = summer-office approved";
  if (occ === "date night" && isRain) return "✨ All-black with a sleek umbrella — mysterious and rain-ready";
  if (occ === "date night" && isCold) return "✨ Oversized coat over a fitted outfit creates effortless contrast";
  if (occ === "date night" && isHot) return "✨ Silk cami + wide-leg pants — breezy romance";
  if (occ === "casual" && isRain) return "✨ Waterproof sneakers + oversized hoodie = cozy rain vibes";
  if (occ === "casual" && isCold) return "✨ Layer a puffer over a knit — street-style warmth";
  if (occ === "casual" && isHot) return "✨ Light cotton tee + shorts — let the accessories do the talking";
  if (occ === "party" && isCold) return "✨ Faux-fur jacket over your party outfit = head-turning entrance";
  if (occ === "party") return "✨ Statement piece + minimal everything else = maximum impact";
  if (occ === "travel" && isRain) return "✨ Quick-dry layers + waterproof bag — travel smart in rain";
  if (occ === "travel") return "✨ Neutral capsule pieces that mix & match = pack light, look great";
  if (occ === "workout") return "✨ Moisture-wicking layers — performance meets style";

  // Fallback weather-only tips
  if (isRain) return "✨ Waterproof layers + dark tones hide splash marks";
  if (isCold) return "✨ Thermals underneath keep you stylish without bulk";
  if (isCool) return "✨ Light layers you can peel off as the day warms";
  if (isHot) return "✨ Breathable fabrics in light colors keep you cool";
  return null;
}
