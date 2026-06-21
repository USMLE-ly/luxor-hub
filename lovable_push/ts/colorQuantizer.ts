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
