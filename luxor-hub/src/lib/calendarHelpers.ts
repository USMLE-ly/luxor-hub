/**
 * Shared calendar helper functions extracted from OutfitCalendar.tsx.
 * Pure functions with no React dependencies — reusable across MonthlyReport, Council, etc.
 */

export interface ClosetItem {
  id: string;
  name: string | null;
  category: string | null;
  color: string | null;
  [key: string]: any;
}

export interface WeatherDay {
  date: string;
  tempMax: number;
  tempMin: number;
  rain: boolean;
  [key: string]: any;
}

/** Generate a stable fingerprint for outfit deduplication */
export function getOutfitFingerprint(items: any[]): string {
  if (!Array.isArray(items) || items.length === 0) return "";
  return items
    .map((item: any) => (typeof item === "string" ? item.toLowerCase() : (item?.name || item?.category || "").toLowerCase()))
    .filter(Boolean)
    .sort()
    .join("|");
}

/** Score an outfit on a 0-100 scale based on category coverage, color harmony, and occasion match */
export function computeOutfitScore(
  items: ClosetItem[],
  occasion: string
): { score: number; label: string; color: string } {
  if (items.length === 0) return { score: 0, label: "", color: "" };

  let score = 0;
  const cats = new Set(items.map(i => (i.category || "").toLowerCase()));

  // Category coverage (max 40)
  if (cats.has("top") || cats.has("outerwear") || cats.has("dress")) score += 15;
  if (cats.has("bottom") || cats.has("dress")) score += 15;
  if (cats.has("shoes")) score += 10;

  // Color harmony (max 35)
  const colorMap: Record<string, number> = {
    black: 0, white: 0, gray: 0, grey: 0, navy: 240, blue: 240, red: 0,
    green: 120, yellow: 60, orange: 30, pink: 330, purple: 270, brown: 30,
    beige: 40, cream: 45, tan: 35, burgundy: 345, maroon: 345, olive: 80,
  };
  const hues = items
    .map(i => colorMap[(i.color || "").toLowerCase().trim()] ?? -1)
    .filter(h => h >= 0);

  if (hues.length >= 2) {
    const neutrals = items.filter(i =>
      ["black", "white", "gray", "grey", "navy", "beige", "cream"].includes((i.color || "").toLowerCase().trim())
    );
    if (neutrals.length / items.length >= 0.5) score += 30;
    else {
      const chromatic = hues.filter(h => h > 0);
      if (chromatic.length >= 2) {
        const spread = Math.max(...chromatic) - Math.min(...chromatic);
        if (spread <= 60 || spread >= 300) score += 30;
        else if (spread <= 120) score += 20;
        else score += 10;
      } else score += 25;
    }
  } else score += 20;

  // Occasion match (max 25)
  const occasionCats: Record<string, string[]> = {
    work: ["top", "bottom", "shoes"], formal: ["top", "bottom", "shoes", "accessory"],
    casual: ["top", "bottom"], "date night": ["dress", "shoes", "accessory"],
    party: ["dress", "shoes", "accessory"], travel: ["top", "bottom", "shoes", "outerwear"],
    workout: ["top", "bottom", "shoes"],
  };
  const wanted = occasionCats[occasion.toLowerCase()] || [];
  const matched = wanted.filter(w => cats.has(w));
  score += Math.round((matched.length / Math.max(wanted.length, 1)) * 25);
  score = Math.min(score, 100);

  if (score >= 80) return { score, label: "Great Match", color: "hsl(var(--primary))" };
  if (score >= 55) return { score, label: "Good", color: "hsl(45 90% 50%)" };
  return { score, label: "Needs More", color: "hsl(var(--muted-foreground))" };
}

/** Generate a style tip based on weather + occasion */
export function getStyleTip(occasion: string | null, weather: WeatherDay | undefined): string | null {
  if (!occasion && !weather) return null;
  const occ = (occasion || "casual").toLowerCase();
  if (weather?.rain) return "Bring a waterproof layer — rain is expected.";
  if (weather && weather.tempMin <= 5) return "Bundle up — temperatures will drop below 5°C.";
  if (weather && weather.tempMax >= 30) return "Go lightweight — it's going to be hot.";
  if (occ === "formal") return "Stick to neutral tones and clean lines for a polished look.";
  if (occ === "date night") return "A pop of color or a statement accessory can elevate your look.";
  return null;
}
