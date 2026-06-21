# 🎨 BATCH 1/4: Color Quantization + Color Naming Fix

## Context
The outfit analysis is detecting white/cream monochrome outfits as "Slate, Maroon, Grey, Teal" — completely wrong colors. The root cause is in the image quantization and color naming functions.

## Changes Required

### 1. Fix the Image Quantization Function
Find the function that quantizes image colors (likely in the analysis component). Change it to:

```typescript
// OLD (buggy):
function quantizeColors(image, nColors = 6) {
  const small = image.resize(150, 150)
  return small.quantize(nColors)
}

// NEW (fixed):
function quantizeColors(image, nColors = 8) {
  // Step 1: Center-crop to 70% to eliminate background edges
  const w = image.width
  const h = image.height
  const marginX = Math.floor(w * 0.15)
  const marginY = Math.floor(h * 0.15)
  const cropped = image.crop(marginX, marginY, w - marginX, h - marginY)
  
  // Step 2: Resize to 300x300 (was 150x150)
  const small = cropped.resize(300, 300)
  
  // Step 3: Quantize to 8 colors (was 6)
  const palette = small.quantize(nColors)
  
  // Step 4: Filter out shadow pixels (luminance < 30)
  const filtered = palette.filter(color => {
    const lum = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b
    return lum > 30
  })
  
  return filtered.slice(0, nColors)
}
```

### 2. Fix the Color Naming Function
Update the function that maps RGB values to color names. Add these new color names:

```typescript
function colorName(rgb) {
  const { r, g, b } = rgb
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const diff = max - min
  const lum = 0.299 * r + 0.587 * g + 0.114 * b

  // Black / Charcoal
  if (max < 30 && lum < 25) return "Black"
  if (max < 50 && lum < 40) return "Charcoal"

  // White / Cream / Ivory / Off-White (WIDER THRESHOLDS)
  if (min > 220) return "White"
  if (min > 200 && max > 230) return "Ivory"
  if (r > 210 && g > 195 && b > 180) return "Cream"
  if (r > 200 && g > 180 && b > 165) return "Off-White"
  if (r > 195 && g > 180 && b > 160) return "Alabaster"
  if (r > 185 && g > 170 && b > 150) return "Ecru"

  // Greys (luminance-based)
  if (diff < 25) {
    if (lum > 200) return "Silver"
    if (lum > 170) return "Light Grey"
    if (lum > 120) return "Mid Grey"
    if (lum > 70) return "Grey"
    if (lum > 40) return "Dark Grey"
    return "Charcoal"
  }
  
  // ... rest of color detection (red, green, blue, etc.)
}
```

### 3. Fix Style Classification
Use only the **top 4 dominant colors** for style classification (not all 8):

```typescript
function classifyHistoricalStyle(colors, brightness, contrast) {
  const topColors = colors.slice(0, 4)
  const brightCount = topColors.filter(c => c.brightness === 'light').length
  const brightRatio = brightCount / topColors.length

  // Light palettes with soft contrast -> Minimalist / Soft Casual
  if (brightness === 'Light' || brightness === 'Medium-Light') {
    if (contrast === 'Soft' && brightRatio > 0.5) return 'Modernist Minimalism'
    if (contrast === 'High' && brightRatio > 0.6) return 'Modernist Minimalism'
  }
  // ... rest of classification
}
```

### 4. Add the 39-Color Reference Palette
Use these exact RGB values for closest-color matching:

```typescript
const NAMED_COLORS = {
  maroon: [128, 0, 0], dark_red: [139, 0, 0], brown: [165, 42, 42],
  firebrick: [178, 34, 34], crimson: [220, 20, 60], red: [255, 0, 0],
  tomato: [255, 99, 71], coral: [255, 127, 80], gold: [255, 215, 0],
  teal: [0, 128, 128], navy: [0, 0, 128], royal_blue: [65, 105, 225],
  indigo: [75, 0, 130], orange: [255, 165, 0], sky_blue: [135, 206, 235],
  // ... all 39 colors
}

function closestNamedColor(r, g, b) {
  let best = null, bestDist = Infinity
  for (const [name, [cr, cg, cb]] of Object.entries(NAMED_COLORS)) {
    const dist = (r-cr)**2 + (g-cg)**2 + (b-cb)**2
    if (dist < bestDist) { bestDist = dist; best = name }
  }
  return bestDist < 500 ? best : null
}
```

## Test Case
- Input: White/cream monochrome outfit photo
- Before: ❌ Detects "Slate, Maroon, Grey, Teal"
- After: ✅ Detects "White, Off-White, Ecru, Light Grey"
- Before: ❌ VICE says "NEUTRAL (52/100) - Too many colors"
- After: ✅ VICE says "DO (65/100) - Restrained palette"
