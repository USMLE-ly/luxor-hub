I need to add 3 utility files to the Luxor Hub project to fix the color analysis pipeline. Create each file with the EXACT content below in src/utils/:

## File 1: src/utils/colorQuantizer.ts

This file fixes the color quantization bug where white/cream outfits were detected as "Slate, Maroon, Grey" instead of proper white/ivory/cream tones.

Key fixes:
1. Center-crops to 70% to eliminate background edges before quantization
2. Wider thresholds for cream/ivory/off-white/alabaster/ecru detection (BEFORE grey detection)
3. Color family grouping for VICE critique (tonal variations of same family count as 1)
4. Shadow luminance filter (< 30) to remove dark pixels
```typescript
// src/utils/colorQuantizer.ts
/**
 * colorQuantizer.ts — Luxor Hub Color Analysis Engine v3.0
 * 
 * Fixes: center-crop quantization, 8 colors, shadow filtering,
 * wider cream/ivory detection, color family grouping.
 * 
 * Add this file to your Lovable project and import where needed.
 */

// ─── Named Color Reference (39 exact RGB values) ────────────────────

export const NAMED_COLORS: Record<string, [number, number, number]> = {
  maroon: [128, 0, 0],
  'dark red': [139, 0, 0],
  brown: [165, 42, 42],
  firebrick: [178, 34, 34],
  crimson: [220, 20, 60],
  red: [255, 0, 0],
  tomato: [255, 99, 71],
  coral: [255, 127, 80],
  indianred: [205, 92, 92],
  'light coral': [240, 128, 128],
  'dark salmon': [233, 150, 122],
  salmon: [250, 128, 114],
  'light salmon': [255, 160, 122],
  orange: [255, 165, 0],
  gold: [255, 215, 0],
  'dark golden rod': [184, 134, 11],
  'light sea green': [32, 178, 170],
  'dark slate gray': [47, 79, 79],
  teal: [0, 128, 128],
  'dark cyan': [0, 139, 139],
  'pale turquoise': [175, 238, 238],
  'aqua marine': [127, 255, 212],
  'steel blue': [70, 130, 180],
  'corn flower blue': [100, 149, 237],
  'light blue': [173, 216, 230],
  'sky blue': [135, 206, 235],
  'light sky blue': [135, 206, 250],
  navy: [0, 0, 128],
  'dark blue': [0, 0, 139],
  'royal blue': [65, 105, 225],
  'blue violet': [138, 43, 226],
  indigo: [75, 0, 130],
  'dark slate blue': [72, 61, 139],
  'slate blue': [106, 90, 205],
  'medium slate blue': [123, 104, 238],
  'saddle brown': [139, 69, 19],
  sienna: [160, 82, 45],
  chocolate: [210, 105, 30],
  peru: [205, 133, 63],
  'sandy brown': [244, 164, 96],
}

// ─── Color Family Groups ─────────────────────────────────────────────

export const COLOR_FAMILIES: Record<string, string[]> = {
  White: ['white', 'ivory', 'cream', 'off-white', 'alabaster', 'ecru', 'snow', 'pearl', 'bone', 'champagne', 'eggshell'],
  Grey: ['light grey', 'mid grey', 'grey', 'dark grey', 'silver', 'charcoal', 'stone', 'ash', 'pewter', 'iron', 'flannel grey', 'heather', 'moonstone', 'slate grey', 'jet', 'graphite', 'smoke'],
  Black: ['black', 'obsidian', 'jet black'],
  Beige: ['beige', 'tan', 'camel', 'sand', 'linen', 'natural', 'bisque'],
  Brown: ['brown', 'chocolate', 'chestnut', 'taupe', 'mocha', 'caramel', 'toffee', 'umber'],
  Blue: ['blue', 'navy', 'indigo', 'slate', 'royal blue', 'sky blue', 'cobalt', 'cerulean', 'sapphire', 'ultramarine', 'midnight blue', 'ink blue', 'steel blue', 'denim', 'periwinkle'],
  Green: ['green', 'olive', 'sage', 'forest', 'emerald', 'mint', 'kelly green', 'chartreuse', 'hunter green', 'pine', 'celadon', 'army green', 'khaki'],
  Teal: ['teal', 'turquoise', 'aqua', 'cyan'],
  Red: ['red', 'crimson', 'scarlet', 'poppy', 'fire engine', 'burgundy', 'wine', 'merlot', 'bordeaux', 'marsala', 'raspberry', 'amaranth'],
  Pink: ['rose', 'coral', 'salmon', 'peach', 'blush', 'dusty rose', 'baby pink'],
  Purple: ['purple', 'violet', 'lavender', 'lilac', 'plum'],
  Yellow: ['yellow', 'gold', 'mustard', 'ochre', 'saffron', 'gilded'],
  Orange: ['orange', 'coral', 'peach', 'salmon', 'tangerine'],
  Neutral: ['neutral', 'light neutral', 'dark neutral', 'greige', 'putty', 'taupe', 'mushroom'],
}

export function getColorFamily(colorName: string): string {
  const lower = colorName.toLowerCase()
  for (const [family, members] of Object.entries(COLOR_FAMILIES)) {
    if (members.includes(lower)) return family
  }
  return colorName
}

// ─── Image Color Quantization (FIXED v3.0) ──────────────────────────

export interface QuantizedColor {
  r: number
  g: number
  b: number
  hex: string
  name: string
  family: string
  luminance: number
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
}

function luminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b
}

/**
 * Quantize image colors using center crop + shadow filtering.
 * 
 * FIX: crop to center 70%, 300×300 resize, 8 colors, filter shadows (lum < 30)
 */
export async function quantizeColors(imageData: ImageData, nColors = 8): Promise<QuantizedColor[]> {
  const { width, height, data } = imageData

  // Step 1: Center crop to 70% (skip dark edges/background)
  const marginX = Math.floor(width * 0.15)
  const marginY = Math.floor(height * 0.15)
  const cropW = width - 2 * marginX
  const cropH = height - 2 * marginY

  // Sample pixels from center region
  const pixels: [number, number, number][] = []
  const stepX = Math.max(1, Math.floor(cropW / 300))
  const stepY = Math.max(1, Math.floor(cropH / 300))

  for (let y = marginY; y < height - marginY; y += stepY) {
    for (let x = marginX; x < width - marginX; x += stepX) {
      const idx = (y * width + x) * 4
      const r = data[idx], g = data[idx + 1], b = data[idx + 2]
      const lum = luminance(r, g, b)
      // Step 2+4: Filter shadow pixels (luminance < 30)
      if (lum > 30) {
        pixels.push([r, g, b])
      }
    }
  }

  // Step 3: Simple k-means quantization to nColors
  const clusters = kMeansQuantize(pixels, nColors)

  return clusters.map(([r, g, b]) => {
    const hex = rgbToHex(r, g, b)
    const name = colorName(r, g, b)
    const family = getColorFamily(name)
    const lum = luminance(r, g, b)
    return { r, g, b, hex, name, family, luminance: lum }
  })
}

// Simple k-means clustering for color quantization
function kMeansQuantize(pixels: [number, number, number][], k: number): [number, number, number][] {
  if (pixels.length === 0) return []
  
  // Initialize centroids evenly across pixel space
  const step = Math.max(1, Math.floor(pixels.length / k))
  const centroids: [number, number, number][] = []
  for (let i = 0; i < k && i * step < pixels.length; i++) {
    centroids.push([...pixels[i * step]])
  }

  // Iterate k-means (simplified — 5 iterations is usually enough for color)
  for (let iter = 0; iter < 5; iter++) {
    const clusters: [number, number, number][][] = Array.from({ length: centroids.length }, () => [])
    
    for (const pixel of pixels) {
      let minDist = Infinity
      let bestIdx = 0
      for (let i = 0; i < centroids.length; i++) {
        const c = centroids[i]
        const dist = (pixel[0] - c[0]) ** 2 + (pixel[1] - c[1]) ** 2 + (pixel[2] - c[2]) ** 2
        if (dist < minDist) { minDist = dist; bestIdx = i }
      }
      clusters[bestIdx].push(pixel)
    }

    // Update centroids
    for (let i = 0; i < centroids.length; i++) {
      if (clusters[i].length > 0) {
        const avg: [number, number, number] = [
          Math.round(clusters[i].reduce((s, p) => s + p[0], 0) / clusters[i].length),
          Math.round(clusters[i].reduce((s, p) => s + p[1], 0) / clusters[i].length),
          Math.round(clusters[i].reduce((s, p) => s + p[2], 0) / clusters[i].length),
        ]
        centroids[i] = avg
      }
    }
  }

  // Sort centroids by frequency (most common first)
  const counts = centroids.map(c => {
    let count = 0
    for (const p of pixels) {
      const dist = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2
      if (dist < 500) count++
    }
    return count
  })

  return centroids
    .map((c, i) => ({ color: c, count: counts[i] }))
    .sort((a, b) => b.count - a.count)
    .map(x => x.color)
}

// ─── Color Naming (ENHANCED v3.0) ───────────────────────────────────

/**
 * Convert RGB to a color name.
 * 
 * FIX: Wider thresholds for cream/ivory/off-white/alabaster/ecru.
 * These are checked BEFORE grey detection.
 */
export function colorName(r: number, g: number, b: number): string {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const diff = max - min
  const lum = luminance(r, g, b)

  // Pure dark / black
  if (max < 30 && lum < 25) return 'Black'
  if (max < 50 && lum < 40) return 'Charcoal'

  // --- WHITE / CREAM / IVORY / OFF-WHITE (WIDER THRESHOLDS) ---
  if (min > 220) return 'White'
  if (min > 200 && max > 230) return 'Ivory'
  if (r > 210 && g > 195 && b > 180) return 'Cream'
  if (r > 200 && g > 180 && b > 165) return 'Off-White'
  if (r > 195 && g > 180 && b > 160) return 'Alabaster'
  if (r > 185 && g > 170 && b > 150) return 'Ecru'

  // Greys (luminance-based, for shadowed whites)
  if (diff < 25) {
    if (lum > 200) return 'Silver'
    if (lum > 170) return 'Light Grey'
    if (lum > 120) return 'Mid Grey'
    if (lum > 70) return 'Grey'
    if (lum > 40) return 'Dark Grey'
    return 'Charcoal'
  }

  // Color dominance detection
  if (r > g && r > b) {
    if (r > 200 && g < 100) return 'Red'
    if (r > 180 && g < 140) return b < 80 ? 'Crimson' : 'Rose'
    if (r > 140 && r > g * 1.5) return b < 80 ? 'Burgundy' : 'Coral'
    return r > 80 ? 'Maroon' : 'Dark Red'
  }
  if (g > r && g > b) {
    if (g > 200) return 'Green'
    if (g > 160) return b > 100 ? 'Emerald' : 'Olive'
    if (g > 120 && r > 100) return 'Sage'
    if (g > 120) return 'Kelly Green'
    return g > 80 ? 'Forest' : 'Dark Green'
  }
  if (b > r && b > g) {
    if (b > 200) return 'Blue'
    if (b > 160 && r < 100) return 'Royal Blue'
    if (b > 120 && r < 80) return 'Navy'
    if (b > 120) return 'Slate'
    if (b > 80 && r > 80) return 'Indigo'
    if (b > 80) return 'Teal'
    return 'Dark Blue'
  }

  // Warm / neutral tones
  if (r > 200 && g > 160 && b < 120) return 'Gold'
  if (r > 180 && g > 140 && b < 100) return 'Mustard'
  if (r > 180 && g > 150 && b > 100) return 'Beige'
  if (r > 160 && g > 120 && b < 100) return 'Tan'
  if (r > 140 && g > 100 && b < 80) return 'Brown'
  if (r > 200 && g < 100 && b < 100) return 'Burgundy'
  if (lum > 180) return 'Light Neutral'
  if (lum > 100) return 'Neutral'
  return 'Dark Neutral'
}

// ─── VICE Critique Helper ─────────────────────────────────────────────

/**
 * Count distinct color families in a palette.
 * Used by VICE critique to avoid false "too many colors" for tonal outfits.
 */
export function countColorFamilies(colors: QuantizedColor[]): number {
  const top4 = colors.slice(0, 4)
  const families = new Set(top4.map(c => c.family))
  return families.size
}

/**
 * Check if palette is restrained (≤ 2 families in top 4 colors).
 */
export function isPaletteRestrained(colors: QuantizedColor[]): boolean {
  return countColorFamilies(colors) <= 2
}

```

## File 2: src/utils/humanizer.ts

This file removes AI writing patterns from analysis text. It replaces buzzwords like "leverage", "seamless", "groundbreaking" with natural equivalents, and strips filler phrases.

Key patterns removed:
- "stands as a" → "is a"
- "testament to" → "shows"  
- "delve", "holistic", "robust", "synergy" → natural alternatives
- AI clichés and vague attributions
```typescript
// src/utils/humanizer.ts
// src/utils/humanizer.ts

/**
 * Humanizes a string by replacing buzzwords, removing fluff, and cleaning punctuation.
 * @param text - The input string to humanize.
 * @returns The humanized string.
 */
export function humanize(text: string): string {
  let result = text;

  // Replacement rules: [pattern, replacement] where pattern is case-insensitive.
  // Longer phrases are sorted first to avoid partial substitution.
  const replacements: [RegExp, string][] = [
    // Remove filler phrases
    [/fundamentally, at its core/gi, ''],
    [/lets dive in/gi, ''],
    [/lets explore/gi, ''],
    [/without further ado/gi, ''],
    [/honestly\?/gi, ''],
    [/\blook,\s*/gi, ''],
    [/the thing is/gi, ''],
    [/let us be honest/gi, ''],

    // Phase → simpler equivalents
    [/stands as a/gi, 'is a'],
    [/serves as a/gi, 'acts as'],
    [/characterized by/gi, 'built around'],
    [/testament to/gi, 'shows'],
    [/revolutionizing/gi, 'change'],
    [/groundbreaking/gi, 'notable'],
    [/seamless/gi, 'smooth'],
    [/\bleverage\b/gi, 'use'],
    [/\bleveraging\b/gi, 'using'],
    [/holistic/gi, 'full'],
    [/robust/gi, 'solid'],
    [/scalable/gi, 'growable'],
    [/actionable/gi, 'useful'],
    [/\bdelve\b/gi, 'explore'],
    [/intricate/gi, 'detailed'],
    [/bespoke/gi, 'custom'],
    [/paradigm/gi, 'model'],
    [/synergy/gi, 'collaboration'],
    [/it is widely believed/gi, 'many people think'],
    [/it could be argued/gi, 'you could argue'],
    [/the real question is/gi, 'the question is'],
  ];

  // Apply replacements, longer patterns first
  replacements
    .sort((a, b) => b[0].source.length - a[0].source.length)
    .forEach(([pattern, replacement]) => {
      result = result.replace(pattern, replacement);
    });

  // Clean up double spaces and punctuation
  result = result.replace(/  +/g, ' ');            // collapse multiple spaces
  result = result.replace(/\s+([.,!?;:])/g, '$1'); // space before punctuation
  result = result.replace(/([.,!?;:])([a-zA-Z])/g, '$1 $2'); // space after punctuation if followed by a letter

  return result.trim();
}

/**
 * Recursively humanizes all string fields in an object.
 * @param obj - The value to humanize (can be object, array, string, etc.).
 * @returns A new value with all strings humanized.
 */
export function humanizeAnalysis(obj: any): any {
  if (typeof obj === 'string') {
    return humanize(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(item => humanizeAnalysis(item));
  }
  if (obj !== null && typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = humanizeAnalysis(obj[key]);
      }
    }
    return result;
  }
  return obj; // preserve non‑object primitives and null
}
```

## File 3: src/utils/enrichedAnalysis.ts

This file adds enriched analysis features:
1. Body shape recommendations (Pear, Apple, Hourglass, Rectangle, Inverted Triangle)
2. Minimal edit recommendations from Fashion++ paper (8 edits)
3. Garment detail descriptors (10 categories)
4. LuxorMemoryStore for local persistence of analysis history
```typescript
// src/utils/enrichedAnalysis.ts
export interface BodyShape {
  name: string;
  description: string;
  recommendation: string;
}

export const BODY_SHAPES: BodyShape[] = [
  {
    name: 'Pear',
    description: 'Wider hips',
    recommendation: 'Draw attention upward with detailed tops and keep bottoms simple.'
  },
  {
    name: 'Apple',
    description: 'Midsection weight',
    recommendation: 'Create vertical lines with V-necks and unstructured fabrics.'
  },
  {
    name: 'Hourglass',
    description: 'Balanced',
    recommendation: 'Emphasize the waist with belts and fitted silhouettes.'
  },
  {
    name: 'Rectangle',
    description: 'Straight',
    recommendation: 'Add curves with peplum tops and layered pieces.'
  },
  {
    name: 'Inverted Triangle',
    description: 'Broad shoulders',
    recommendation: 'Balance broad shoulders with A‑line skirts and wide‑leg pants.'
  }
];

export function getBodyShapeRecommendations(bodyTypeNotes: string): BodyShape[] {
  const notes = bodyTypeNotes.toLowerCase();
  const matched = BODY_SHAPES.filter(shape =>
    notes.includes(shape.name.toLowerCase())
  );
  return matched.length > 0 ? matched : BODY_SHAPES;
}

export interface EditRecommendation {
  name: string;
  effect: string;
  suitableFor: string[];
}

export const MINIMAL_EDITS: EditRecommendation[] = [
  {
    name: 'Tuck in shirt',
    effect: 'Defines the waist',
    suitableFor: ['Hourglass', 'Rectangle']
  },
  {
    name: 'Roll up sleeves',
    effect: 'Adds emphasis to the upper body',
    suitableFor: ['Inverted Triangle', 'Rectangle']
  },
  {
    name: 'Add belt',
    effect: 'Highlights the waistline',
    suitableFor: ['Hourglass', 'Rectangle', 'Pear']
  },
  {
    name: 'Change neckline',
    effect: 'Shifts focus upward',
    suitableFor: ['Pear', 'Hourglass']
  },
  {
    name: 'Layer with jacket',
    effect: 'Creates structure and hides midsection',
    suitableFor: ['Apple', 'Pear']
  },
  {
    name: 'Cuff pants',
    effect: 'Adds a horizontal break',
    suitableFor: ['Inverted Triangle', 'Rectangle']
  },
  {
    name: 'Swap shade',
    effect: 'Uses color blocking to balance proportions',
    suitableFor: ['Pear', 'Apple', 'Hourglass', 'Rectangle', 'Inverted Triangle']
  },
  {
    name: 'Half-tuck',
    effect: 'Creates an asymmetrical line',
    suitableFor: ['Hourglass', 'Rectangle']
  }
];

export function getEditRecommendations(bodyTypeNotes: string): EditRecommendation[] {
  const notes = bodyTypeNotes.toLowerCase();
  const mentionedShapes = BODY_SHAPES
    .filter(shape => notes.includes(shape.name.toLowerCase()))
    .map(shape => shape.name);

  if (mentionedShapes.length === 0) return MINIMAL_EDITS;

  return MINIMAL_EDITS.filter(edit =>
    edit.suitableFor.some(suit => mentionedShapes.includes(suit))
  );
}

export const GARMENT_DETAIL_DESCRIPTORS: string[] = [
  'Neckline style (e.g., V‑neck, crew, scoop)',
  'Sleeve type (e.g., long, short, capped)',
  'Hemline shape (e.g., straight, curved, asymmetric)',
  'Silhouette (e.g., fitted, relaxed, A‑line)',
  'Waist definition (e.g., high, natural, low rise)',
  'Garment length (e.g., mini, midi, maxi)',
  'Fit style (e.g., slim, regular, oversized)',
  'Closure type (e.g., zipper, buttons, drawstring)',
  'Pocket style (e.g., patch, welt, side seam)',
  'Collar style (e.g., shirt, polo, mandarin)'
];

export interface MemoryEntry {
  id: string;
  timestamp: Date;
  bodyTypeNotes: string;
  bodyShapes: BodyShape[];
  edits: EditRecommendation[];
  garmentDetails: string[];
}

export class LuxorMemoryStore {
  private storageKey = 'luxor_memory';
  private entries: MemoryEntry[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        this.entries = [];
        return;
      }
      const parsed = JSON.parse(raw);
      this.entries = parsed.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));
    } catch {
      this.entries = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.entries));
    } catch {
      // silently fail (e.g., localStorage full or unavailable)
    }
  }

  recordAnalysis(
    bodyTypeNotes: string,
    bodyShapes: BodyShape[],
    edits: EditRecommendation[],
    garmentDetails: string[] = []
  ): MemoryEntry {
    const entry: MemoryEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      bodyTypeNotes,
      bodyShapes,
      edits,
      garmentDetails
    };
    this.entries.push(entry);
    this.saveToStorage();
    return entry;
  }

  getHistory(): MemoryEntry[] {
    return [...this.entries];
  }

  getStyleEvolution(): string {
    if (this.entries.length === 0) return 'No analysis history yet.';

    const shapeCount: Record<string, number> = {};
    this.entries.forEach(entry =>
      entry.bodyShapes.forEach(shape => {
        const name = shape.name;
        shapeCount[name] = (shapeCount[name] || 0) + 1;
      })
    );

    const sorted = Object.entries(shapeCount).sort((a, b) => b[1] - a[1]);
    const mostFrequent = sorted[0];
    return `Your most frequent body shape assessment is "${mostFrequent[0]}" (appeared ${mostFrequent[1]} time${mostFrequent[1] > 1 ? 's' : ''}).`;
  }
}
```

## Integration Steps (apply AFTER creating the files):

1. In your analysis API call handler (the function that processes outfit analysis), import and use:
```typescript
import { quantizeColors, isPaletteRestrained, countColorFamilies } from '../utils/colorQuantizer'
import { humanizeAnalysis } from '../utils/humanizer'
import { getBodyShapeRecommendations, getEditRecommendations, GARMENT_DETAIL_DESCRIPTORS, LuxorMemoryStore } from '../utils/enrichedAnalysis'
```

2. In the analysis handler, add:
```typescript
// Before quantize: fix white/cream detection
const quantized = await quantizeColors(imageData, 8)
analysis.colorPalette.restrained = isPaletteRestrained(quantized)
analysis.colorPalette.familyCount = countColorFamilies(quantized)

// After analysis: humanize text
const humanized = humanizeAnalysis(analysis)

// Enrich with extra data
humanized.bodyShapeRecommendations = getBodyShapeRecommendations(humanized.bodyTypeNotes)
humanized.editRecommendations = getEditRecommendations(humanized.bodyTypeNotes)
humanized.garmentDetailDescriptors = GARMENT_DETAIL_DESCRIPTORS

// Store in memory
const memory = new LuxorMemoryStore()
memory.recordAnalysis(humanized.bodyTypeNotes, humanized.bodyShapeRecommendations, humanized.editRecommendations)
```

3. Run `npm run build` or equivalent to verify no TypeScript errors.

## Verification
- Before fix: White/cream outfit → "Slate, Maroon, Grey, Teal"
- After fix: White/cream outfit → "White, Ivory, Cream, Light Grey"
- VICE critique: Now uses color families, not individual colors
- Analysis text: Natural-sounding, free of AI clichés
