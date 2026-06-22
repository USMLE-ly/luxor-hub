import { supabase } from "@/integrations/supabase/client";
import {
  COLOR_THEORY, SKIN_TONE_RECOMMENDATIONS, BODY_SHAPES,
  FABRICS, FASHION_STYLES, OCCASION_OUTFITS,
  SEASONAL_RECOMMENDATIONS
} from "./fashionKnowledge";

const LOCAL_ANALYSIS_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_LUXOR_ANALYSIS_URL) ||
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_PUBLIC_API_URL) ||
  "http://localhost:5000";
const OMEGA_API_URL = LOCAL_ANALYSIS_URL.replace(/\/+$/, "");

export interface OutfitAnalysis {
  overallStyle: string;
  styleScore: number;
  summary: string;
  occasionRatings: Array<{
    occasion: string;
    score: number;
    reason: string;
  }>;
  detectedItems: Array<{
    name: string;
    category: string;
    color: string;
    style: string;
  }>;
  colorPalette: {
    colors: string[];
    harmony: string;
    rating: string;
  };
  strengths: string[];
  improvements: Array<{
    suggestion: string;
    reason: string;
    priority: "high" | "medium" | "low";
  }>;
  seasonalFit: string;
  bodyTypeNotes: string;
  /** New KB-powered fields */
  fashionRecommendations?: {
    occasionOutfits?: string[];
    accessories?: string[];
    alternativeStyles?: string[];
    colorMatches?: string[];
    fabricSuggestions?: string[];
  };
  styleBreakdown?: {
    primary: string;
    secondary?: string;
    confidence: number;
  };
  colorHarmonyScore?: number;
}

/* ═══════════════════════════════════════════
   CLIENT-SIDE ANALYSIS ENGINE
   Uses Canvas pixel sampling + Fashion KB
   ═══════════════════════════════════════════ */

interface ClientAnalysis {
  colors: string[];
  colorNames: string[];
  harmony: string;
  brightness: string;
  contrast: string;
  texture: string;
  warmth: number;    // 0-1 scale (cool→warm)
  saturation: number; // 0-1
  dominantHue: number; // 0-360
}

function analyzeColorsClientSide(imageUrl: string): Promise<ClientAnalysis> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const size = 80;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, size, size);

        const pixelData = ctx.getImageData(0, 0, size, size).data;
        const totalPixels = size * size;

        // ── Color quantization ──
        const buckets = new Map<string, { r: number; g: number; b: number; count: number; h: number; s: number }>();
        let totalR = 0, totalG = 0, totalB = 0;
        let totalH = 0, totalS = 0;
        let variance = 0;

        for (let y = 0; y < size; y += 3) {
          for (let x = 0; x < size; x += 3) {
            const idx = (y * size + x) * 4;
            const r = pixelData[idx], g = pixelData[idx + 1], b = pixelData[idx + 2];
            totalR += r; totalG += g; totalB += b;

            // RGB → HSL approximation
            const max = Math.max(r, g, b) / 255, min = Math.min(r, g, b) / 255;
            const light = (max + min) / 2;
            let h = 0, s = 0;
            if (max !== min) {
              const d = max - min;
              s = light > 0.5 ? d / (2 - max - min) : d / (max + min);
              if (max === r/255) h = ((g/255 - b/255) / d + (g/255 < b/255 ? 6 : 0)) * 60;
              else if (max === g/255) h = ((b/255 - r/255) / d + 2) * 60;
              else h = ((r/255 - g/255) / d + 4) * 60;
            }
            totalH += h; totalS += s;

            // Quantize to 32-step buckets
            const qr = Math.round(r / 32) * 32;
            const qg = Math.round(g / 32) * 32;
            const qb = Math.round(b / 32) * 32;
            const key = `${qr},${qg},${qb}`;

            const existing = buckets.get(key);
            if (existing) { existing.count++; }
            else { buckets.set(key, { r: qr, g: qg, b: qb, count: 1, h, s }); }
          }
        }

        // Sort by frequency
        const sorted = [...buckets.entries()]
          .sort((a, b) => b[1].count - a[1].count)
          .slice(0, 8);

        const colors = sorted.map(([, v]) =>
          `#${v.r.toString(16).padStart(2, "0")}${v.g.toString(16).padStart(2, "0")}${v.b.toString(16).padStart(2, "0")}`
        );
        const colorNames = sorted.map(([, v]) => rgbToColorName(v.r, v.g, v.b));

        // ── Brightness ──
        const avgBright = (totalR + totalG + totalB) / (3 * (totalPixels / 9));
        const brightness = avgBright > 180 ? "Light" : avgBright > 120 ? "Medium" : avgBright > 70 ? "Medium-Dark" : "Dark";

        // ── Contrast ──
        const mean = (totalR + totalG + totalB) / (3 * (totalPixels / 9));
        for (let y = 0; y < size; y += 3) {
          for (let x = 0; x < size; x += 3) {
            const idx = (y * size + x) * 4;
            const bright = (pixelData[idx] + pixelData[idx + 1] + pixelData[idx + 2]) / 3;
            variance += (bright - mean) ** 2;
          }
        }
        const std = Math.sqrt(variance / (totalPixels / 9));
        const contrast = std > 55 ? "High" : std > 30 ? "Medium" : "Soft";

        // ── Texture (roughness via local variance) ──
        let textureVar = 0;
        let texSamples = 0;
        for (let y = 4; y < size - 4; y += 4) {
          for (let x = 4; x < size - 4; x += 4) {
            const idx = (y * size + x) * 4;
            const c = (pixelData[idx] + pixelData[idx + 1] + pixelData[idx + 2]) / 3;
            // Compare with neighbors
            const n1 = ((y - 4) * size + x) * 4;
            const n2 = (y * size + (x - 4)) * 4;
            const nc1 = (pixelData[n1] + pixelData[n1 + 1] + pixelData[n1 + 2]) / 3;
            const nc2 = (pixelData[n2] + pixelData[n2 + 1] + pixelData[n2 + 2]) / 3;
            textureVar += Math.abs(c - nc1) + Math.abs(c - nc2);
            texSamples += 2;
          }
        }
        const avgTexture = textureVar / texSamples;
        const texture = avgTexture > 15 ? "Textured / Patterned" : avgTexture > 8 ? "Slightly Textured" : "Smooth";

        // ── Warmth (0 = cool, 1 = warm) ──
        const avgH = totalH / (totalPixels / 9);
        const avgS = totalS / (totalPixels / 9);
        const warmth = Math.min(1, Math.max(0, (avgH > 20 && avgH < 70 ? 0.7 : avgH > 200 && avgH < 300 ? 0.2 : 0.5)));
        const dominantHue = avgH;
        const saturation = Math.min(1, avgS * 2);

        // ── Harmony ──
        const warmCount = sorted.filter(([, v]) => {
          const h = v.h;
          return (h > 0 && h < 60) || (h > 320);
        }).length;
        const coolCount = sorted.filter(([, v]) => {
          const h = v.h;
          return h > 180 && h < 300;
        }).length;
        const harmony =
          colors.length <= 2 ? "Monochromatic" :
          warmCount > 0 && coolCount > 0 ? "Balanced" :
          warmCount > coolCount ? "Warm Tonal" :
          coolCount > warmCount ? "Cool Tonal" : "Analogous";

        resolve({ colors, colorNames, harmony, brightness, contrast, texture, warmth, saturation, dominantHue });
      } catch (e) { reject(e); }
    };
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = imageUrl;
  });
}

/* ── Color Name Mapping (expanded from KB) ── */
function rgbToColorName(r: number, g: number, b: number): string {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const diff = max - min;
  if (max < 25 && min < 25) return "Black";
  if (r > 230 && g > 230 && b > 230) return "White";
  if (r > 180 && g > 180 && b > 180) return "Ivory";
  if (diff < 25 && max > 100) return "Gray";

  // Normalize
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const mx = Math.max(rn, gn, bn), mn = Math.min(rn, gn, bn);
  const d = mx - mn;
  let h = 0;
  if (d > 0.02) {
    if (mx === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
    else if (mx === gn) h = ((bn - rn) / d + 2) * 60;
    else h = ((rn - gn) / d + 4) * 60;
  }

  const s = mx > 0 ? d / mx : 0;
  const v = mx;

  // Named colors based on HSV
  if (s < 0.15) return v > 0.8 ? "White" : v > 0.3 ? "Gray" : "Charcoal";

  if (h <= 15 || h > 345) {
    if (s > 0.7 && v > 0.7) return "Red";
    if (v < 0.3) return "Maroon";
    if (s < 0.5) return "Rose";
    return "Burgundy";
  }
  if (h <= 45) {
    if (s > 0.7 && v > 0.8) return "Orange";
    if (s < 0.4 && v > 0.8) return "Cream";
    if (v > 0.7) return "Gold";
    return "Mustard";
  }
  if (h <= 75) {
    if (v > 0.8 && s > 0.6) return "Yellow";
    if (s < 0.5) return "Beige";
    return "Olive";
  }
  if (h <= 150) {
    if (v > 0.7 && s > 0.5) return "Green";
    if (v < 0.3) return "Forest";
    if (s < 0.4) return "Sage";
    return "Emerald";
  }
  if (h <= 200) {
    if (s > 0.5 && v > 0.7) return "Teal";
    return "Mint";
  }
  if (h <= 260) {
    if (v > 0.7 && s > 0.5) return "Blue";
    if (v < 0.3) return "Navy";
    if (s < 0.4) return "Slate";
    return "Royal Blue";
  }
  if (h <= 330) {
    if (v > 0.7) return "Purple";
    if (v > 0.5) return "Violet";
    return "Indigo";
  }
  if (s > 0.5 && v > 0.8) return "Pink";
  return "Rose";
}

/* ── Style Classifier using KB ── */
function classifyStyle(client: ClientAnalysis): {
  primary: string; secondary?: string; confidence: number
} {
  const { warmth, brightness, contrast, texture, saturation, colorNames } = client;

  // Score each style
  const scores = FASHION_STYLES.map(style => {
    let score = 0;
    const s = style.name;

    // Minimalist → low color count, neutral
    if (s === "Minimalist") {
      if (colorNames.filter(c => (COLOR_THEORY.neutral as readonly string[]).includes(c)).length >= 2) score += 30;
      if (contrast === "Soft") score += 20;
      if (saturation < 0.3) score += 25;
    }
    // Casual → medium brightness, soft contrast
    if (s === "Casual") {
      if (brightness === "Medium" || brightness === "Light") score += 20;
      if (contrast !== "High") score += 15;
      if (saturation < 0.6) score += 15;
    }
    // Formal → high contrast, dark or neutral, smooth texture
    if (s === "Formal") {
      if (brightness === "Dark" || brightness === "Medium-Dark") score += 20;
      if (contrast === "High" || contrast === "Medium") score += 15;
      if (texture === "Smooth") score += 20;
    }
    // Streetwear → high contrast, bold colors
    if (s === "Streetwear") {
      if (contrast === "High") score += 20;
      if (saturation > 0.5) score += 20;
      if (brightness === "Medium-Dark" || brightness === "Dark") score += 15;
    }
    // Bohemian → warm, textured, earthy
    if (s === "Bohemian") {
      if (warmth > 0.5) score += 20;
      if (texture === "Textured / Patterned") score += 20;
      if (saturation < 0.5 && warmth > 0.4) score += 15;
    }
    // Edgy / Dark → dark, high contrast, smooth
    if (s === "Edgy / Dark") {
      if (brightness === "Dark" || brightness === "Medium-Dark") score += 30;
      if (contrast === "High") score += 20;
      if (colorNames.includes("Black")) score += 25;
    }
    // Romantic → light, soft, high warmth
    if (s === "Romantic") {
      if (brightness === "Light") score += 20;
      if (contrast === "Soft") score += 20;
      if (saturation > 0.3 && saturation < 0.7) score += 15;
      if (warmth > 0.3 && warmth < 0.7) score += 15;
    }
    // Sporty → medium brightness, medium contrast
    if (s === "Sporty") {
      if (brightness === "Medium" || brightness === "Light") score += 15;
      if (contrast === "Medium") score += 15;
      if (saturation > 0.4) score += 15;
    }
    // Korean → light, soft, pastel
    if (s === "Korean") {
      if (brightness === "Light") score += 25;
      if (contrast === "Soft") score += 20;
      if (saturation < 0.4) score += 20;
    }
    // Preppy → medium brightness, structured feel via contrast
    if (s === "Preppy") {
      if (brightness === "Medium") score += 15;
      if (contrast === "Medium") score += 15;
      if (saturation < 0.5 && colorNames.filter(c => !(COLOR_THEORY.neutral as readonly string[]).includes(c)).length <= 3) score += 15;
    }
    // Vintage → warm, medium saturation
    if (s === "Vintage") {
      if (warmth > 0.4 && warmth < 0.8) score += 20;
      if (saturation > 0.3 && saturation < 0.6) score += 15;
      if (texture !== "Smooth") score += 15;
    }
    // Traditional → warm, rich, smooth
    if (s === "Traditional") {
      if (warmth > 0.5) score += 20;
      if (saturation > 0.4) score += 15;
      if (texture === "Textured / Patterned") score += 15;
    }

    return { name: s, score };
  });

  scores.sort((a, b) => b.score - a.score);
  const primary = scores[0];
  const secondary = scores[1]?.score > primary.score * 0.5 ? scores[1].name : undefined;

  return {
    primary: primary.name,
    secondary,
    confidence: Math.min(100, Math.round(primary.score)),
  };
}

/* ── Season detector ── */
function detectSeason(brightness: string, warmth: number, texture: string): string {
  if (brightness === "Light" && warmth > 0.5) return "Spring / Summer";
  if (brightness === "Light" && warmth <= 0.5) return "Summer";
  if (brightness === "Dark" && warmth > 0.5) return "Autumn";
  if (brightness === "Dark" && warmth <= 0.5) return "Winter";
  if (brightness === "Medium" && warmth > 0.5) return "Spring → Autumn";
  return "Transitional (All Seasons)";
}

/* ── KB-powered fashion recommendations ── */
function getFashionRecommendations(
  style: string, season: string, colorNames: string[], brightness: string
): {
  occasionOutfits: string[];
  accessories: string[];
  alternativeStyles: string[];
  colorMatches: string[];
  fabricSuggestions: string[];
} {
  // Map outfit recommendations
  const topColors = colorNames.slice(0, 3);
  const occasionOutfits: string[] = [];

  // Find the best matching occasion in our KB
  for (const [occ, data] of Object.entries(OCCASION_OUTFITS)) {
    const allOutfits = [...data.men, ...data.women];
    occasionOutfits.push(...allOutfits.slice(0, 2));
    if (occasionOutfits.length >= 6) break;
  }

  // Accessories from KB
  const allAccessories = new Set<string>();
  for (const data of Object.values(OCCASION_OUTFITS)) {
    data.accessories.forEach(a => allAccessories.add(a));
  }
  const accessories = [...allAccessories].slice(0, 6);

  // Alternative styles
  const alternativeStyles = FASHION_STYLES
    .filter(s => s.name.toLowerCase() !== style.toLowerCase())
    .slice(0, 3)
    .map(s => `${s.name} (${s.vibe})`);

  // Color matches from KB
  const colorMatches: string[] = [];
  for (const color of topColors) {
    const matches = (COLOR_THEORY.matching as any)[color];
    if (matches) {
      if (matches[0] === "All") {
        colorMatches.push(`${color} pairs well with most colors`);
      } else {
        colorMatches.push(`${color} → ${matches.slice(0, 3).join(", ")}`);
      }
    }
  }

  // Fabric suggestions from KB
  const seasonKey = season.includes("Spring") ? "Spring" : season.includes("Summer") ? "Summer" :
    season.includes("Autumn") ? "Autumn" : "Winter";
  const recs = (SEASONAL_RECOMMENDATIONS as any)[seasonKey];
  const fabricSuggestions = recs ? recs.fabrics.slice(0, 4) : ["Cotton", "Linen"];

  return { occasionOutfits: [...new Set(occasionOutfits)], accessories, alternativeStyles, colorMatches, fabricSuggestions };
}

/* ── Build full analysis ── */
function buildAnalysis(client: ClientAnalysis): OutfitAnalysis {
  const { colors, colorNames, harmony, brightness, contrast, texture, warmth, saturation } = client;

  // Style
  const styleResult = classifyStyle(client);
  const style = styleResult.primary;
  const season = detectSeason(brightness, warmth, texture);

  // Score calculation using KB criteria
  let score = 60;
  if (contrast === "High") score += 8;
  else if (contrast === "Medium") score += 4;
  if (harmony === "Warm Tonal" || harmony === "Cool Tonal") score += 6;
  if (harmony === "Monochromatic") score += 4;
  if (harmony === "Balanced") score += 8;
  if (colorNames.length >= 3) score += 5;
  if (colorNames.length <= 2) score += 3;
  if (brightness === "Medium") score += 4;
  if (texture !== "Smooth") score += 3;
  if (saturation > 0.3 && saturation < 0.7) score += 3;
  score = Math.min(score, 97);

  // Strengths
  const strengths: string[] = [];
  if (contrast === "High") strengths.push("Confident contrast creates strong visual impact and definition");
  if (contrast === "Soft") strengths.push("Subtle tonal blending for a refined, understated elegance");
  if (harmony.includes("Warm")) strengths.push("Warm palette radiates approachability and earthiness");
  if (harmony.includes("Cool")) strengths.push("Cool tones communicate polish and sophistication");
  if (harmony === "Balanced") strengths.push("Excellent warm-cool balance shows advanced color intuition");
  if (harmony === "Monochromatic") strengths.push("Monochromatic discipline signals intentional, curated style");
  if (colorNames.length >= 3) strengths.push("Multi-color palette demonstrates layered, thoughtful composition");
  if (texture === "Textured / Patterned") strengths.push("Texture adds rich dimensionality, keeping the eye engaged");
  if (styleResult.secondary) strengths.push(`Bridges ${style} and ${styleResult.secondary} — versatile, adaptive style signature`);
  if (strengths.length === 0) strengths.push("Clean, coherent outfit composition with clear visual direction");

  // Improvements using KB
  const improvements: Array<{ suggestion: string; reason: string; priority: "high" | "medium" | "low" }> = [];

  if (colorNames.length < 3) improvements.push({
    suggestion: "Add an accent accessory for visual lift",
    reason: `${colorNames[0] || "The current"} palette is restrained — a scarf, bag, or shoe in a complementary color adds personality without overwhelming`,
    priority: "medium",
  });
  if (contrast === "Soft" && brightness === "Light") improvements.push({
    suggestion: "Anchor with a darker base layer",
    reason: "Light-on-light risks washing out; a charcoal bottom or belt creates grounding contrast",
    priority: "medium",
  });
  if (contrast === "High" && (brightness === "Dark" || brightness === "Medium-Dark")) improvements.push({
    suggestion: "Introduce a mid-tone element",
    reason: "High-contrast dark looks benefit from a mid-tone bridge piece (e.g., grey knit) that eases the transition between extremes",
    priority: "low",
  });
  if (brightness === "Light" && contrast === "High") improvements.push({
    suggestion: "Soften with texture rather than color",
    reason: "High-contrast light palettes read crisp — add texture via a knit or linen piece to introduce warmth without darkening",
    priority: "low",
  });
  if (harmony === "Warm Tonal" && brightness === "Dark") improvements.push({
    suggestion: "Layer with a lighter warm piece",
    reason: "Dark warm tones can feel heavy; a camel or cream layer lightens the visual load while preserving the warm story",
    priority: "medium",
  });
  if (harmony === "Cool Tonal" && brightness === "Dark") improvements.push({
    suggestion: "Add a cool-toned highlight",
    reason: "Dark cool palettes benefit from a single lighter cool accent (powder blue, silver) to keep the look from reading as flat",
    priority: "low",
  });
  if (texture === "Smooth" && colorNames.length <= 2) improvements.push({
    suggestion: "Mix in a textured piece",
    reason: "Smooth + minimal risks feeling sterile; a ribbed knit, tweed, or leather texture adds sensory depth",
    priority: "low",
  });
  if (!improvements.length) improvements.push({
    suggestion: "Play with silhouette extremity",
    reason: "Proportion is the next frontier — try an oversized top with slim bottoms or vice versa for a shapes-driven update",
    priority: "low",
  });

  // Occasion ratings from KB
  const occasionRatings = [
    {
      occasion: "Casual Everyday",
      score: contrast === "Soft" ? 85 : brightness === "Light" ? 78 : 68,
      reason: brightness === "Light" ? "Light, easy palette naturally suits relaxed daily wear" : "Tonal balance is appropriate for day-to-day versatility",
    },
    {
      occasion: "Work / Office",
      score: style === "Formal" || style === "Minimalist" || style === "Preppy" ? 82 :
             contrast === "High" ? 62 : 72,
      reason: style === "Formal" || style === "Minimalist" ? "Clean lines and restrained palette signal professional polish" :
              "Moderate contrast and mid-tones adapt well to office settings",
    },
    {
      occasion: "Evening Out",
      score: brightness === "Dark" ? 82 : contrast === "High" ? 75 : 62,
      reason: brightness === "Dark" ? "Darker palette transitions naturally to evening environments" : "Mid-range brightness works for casual-to-moderate evening settings",
    },
    {
      occasion: "Date Night",
      score: saturation > 0.4 ? 78 : warmth > 0.5 ? 74 : 66,
      reason: saturation > 0.4 ? "Rich color saturation suggests intentional, confident styling" :
              warmth > 0.5 ? "Warm tones convey approachability and comfort" : "Neutral palette reads as understated and versatile",
    },
    {
      occasion: "Formal Event",
      score: brightness === "Dark" && contrast === "High" ? 75 :
             style === "Formal" ? 80 : 55,
      reason: style === "Formal" ? "Structured, formal-appropriate palette and contrast levels" :
              "The palette falls in semi-formal range — consider darker, more structured pieces for formal occasions",
    },
    {
      occasion: "Weekend Brunch",
      score: brightness === "Light" || brightness === "Medium" ? 86 : 70,
      reason: brightness === "Light" || brightness === "Medium" ? "Bright-to-mid palette reads as fresh, daytime-appropriate" : "Darker tones can work for cozy brunch settings",
    },
  ];

  // Detected items (KB-powered naming)
  const detectedItems = [
    {
      name: `${colorNames[0] || "Neutral"} primary garment`,
      category: "Upper Body / Primary",
      color: colors[0] || "#888",
      style,
    },
  ];
  if (colorNames.length > 1) {
    detectedItems.push({
      name: `${colorNames[1]} secondary piece`,
      category: "Lower Body / Secondary",
      color: colors[1],
      style: harmony.includes("Warm") ? "Tonal Match" : "Contrast Accent",
    });
  }
  if (colorNames.length > 2) {
    detectedItems.push({
      name: `${colorNames[2]} accent detail`,
      category: "Accent / Accessory",
      color: colors[2],
      style: saturation > 0.5 ? "Statement" : "Subtle",
    });
  }

  // KB-powered recommendations
  const recommendations = getFashionRecommendations(style, season, colorNames, brightness);

  // Body type notes
  const bodyNote = `The silhouette appears ${brightness === "Dark" ? "structured and defined" : "balanced and flowing"}. ${contrast === "High" ? "Strong contrast between elements creates clear visual zones." : "The tonal continuity creates a cohesive vertical line."}`;

  return {
    overallStyle: style,
    styleScore: score,
    summary: `This outfit reads as ${style.toLowerCase()} with a ${brightness.toLowerCase()} palette and ${contrast.toLowerCase()} contrast. The color harmony is ${harmony.toLowerCase()} (${texture.toLowerCase()} texture). ${styleResult.secondary ? `It bridges ${style} and ${styleResult.secondary} aesthetics.` : ""}`,
    occasionRatings,
    detectedItems,
    colorPalette: {
      colors,
      harmony,
      rating: score >= 75
        ? `Strong palette — ${harmony.toLowerCase()} harmony, ${texture.toLowerCase()} texture, ${brightness.toLowerCase()} tonal weight. Colors work cohesively${colorNames.length >= 3 ? " with good variety" : ""}.`
        : `Functional palette with ${harmony.toLowerCase()} harmony — consider adding a complementary accent for more visual range`,
    },
    strengths,
    improvements,
    seasonalFit: season,
    bodyTypeNotes: bodyNote,
    fashionRecommendations: recommendations,
    styleBreakdown: styleResult,
    colorHarmonyScore: score,
  };
}

/* ═══════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════ */

export async function analyzeOutfitImage(imageUrl: string): Promise<OutfitAnalysis> {
  // NOTE: The primary OMEGA backend call is handled by OutfitAnalysis.tsx's runOmegaAudit.
  // This function serves as the fallback when runOmegaAudit isn't triggered.
  
  // 1. Try Supabase edge function
  try {
    const { data, error } = await supabase.functions.invoke("analyze-outfit", { body: { imageUrl } });
    if (!error && data && !data.error) return data as OutfitAnalysis;
  } catch {}

  // 2. Client-side with fashion KB integration (last resort)
  console.log("[analysis] Using client-side + fashion KB analysis");
  const clientData = await analyzeColorsClientSide(imageUrl);
  return buildAnalysis(clientData);
}
