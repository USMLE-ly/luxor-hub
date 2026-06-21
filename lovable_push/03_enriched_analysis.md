# 🧬 BATCH 3/4: Enriched Analysis — Body Shape, Edit Recs, Garment Details

## Context
The analysis should return more than just colors and style. Using knowledge from the RSOS paper (2014), Fashion++ (ICCV 2019), and OVNet (CVPR 2021), we need to add body shape recommendations, minimal edit recommendations, and garment detail descriptors.

## Changes Required

### 1. Add Body Shape Recommendations
Add this function and include its output in the analysis response:

```typescript
interface BodyShape {
  shape: string
  description: string
  recommendation: string
}

function getBodyShapeRecommendations(bodyTypeNotes: string): BodyShape[] {
  const bodyShapes = [
    { shape: 'Pear', description: 'Wider hips than shoulders', recommendation: 'A-line skirts, wide necklines to balance proportions' },
    { shape: 'Apple', description: 'Weight around midsection', recommendation: 'Empire waist, V-necks, structured jackets' },
    { shape: 'Hourglass', description: 'Balanced shoulders and hips, defined waist', recommendation: 'Fitted silhouettes, belts, wrap dresses' },
    { shape: 'Rectangle', description: 'Straight, balanced proportions', recommendation: 'Layering, waist definition, peplum tops' },
    { shape: 'Inverted Triangle', description: 'Broad shoulders, narrower hips', recommendation: 'Flared bottoms, simple tops, A-line skirts' },
  ]
  
  const note = bodyTypeNotes?.toLowerCase() || ''
  const found = bodyShapes.find(s => note.includes(s.shape.toLowerCase()))
  
  return found ? [found] : [
    { shape: 'Universal', description: 'Balanced proportions', recommendation: 'Focus on fit and silhouette definition' },
    { shape: 'General Tip', description: 'Vertical alignment is key', recommendation: 'Monochromatic dressing elongates the frame' },
  ]
}
```

### 2. Add Edit Recommendations (Fashion++ Minimal Edits)
Based on the Fashion++ ICCV 2019 paper — minimal edits that improve an outfit:

```typescript
interface EditRecommendation {
  edit: string
  effect: string
  suitableFor: string[]
}

function getEditRecommendations(bodyTypeNotes: string): EditRecommendation[] {
  const edits = [
    { edit: 'Tuck in shirt', effect: 'Defines waist, creates cleaner silhouette', suitableFor: ['Rectangle', 'Apple'] },
    { edit: 'Roll up sleeves', effect: 'Casual, relaxed, shows forearms', suitableFor: ['All'] },
    { edit: 'Add belt', effect: 'Defines waist, adds structure', suitableFor: ['Hourglass', 'Rectangle'] },
    { edit: 'Change neckline', effect: 'Alters perceived shoulder width', suitableFor: ['Pear', 'Inverted Triangle'] },
    { edit: 'Layer with jacket', effect: 'Adds structure, hides problem areas', suitableFor: ['Apple', 'Rectangle'] },
    { edit: 'Cuff pants', effect: 'Shows ankle, shortens leg visually', suitableFor: ['All'] },
  ]
  
  const note = bodyTypeNotes?.toLowerCase() || ''
  const matched = edits.filter(e => 
    e.suitableFor.some(s => s.toLowerCase() !== 'all' && note.includes(s.toLowerCase()))
  )
  
  return matched.length > 0 ? matched.slice(0, 4) : edits.slice(0, 3)
}
```

### 3. Add Garment Detail Descriptors
These help describe garments more accurately in the analysis output:

```typescript
const garmentDetailDescriptors = [
  'Neckline: crew, V-neck, scoop, boat, halter, strapless, turtleneck, cowl',
  'Sleeve: short, long, 3/4, cap, puff, bell, bishop, raglan, set-in, dolman',
  'Hemline: straight, curved, high-low, asymmetrical, scalloped, raw edge',
  'Silhouette: A-line, fit-and-flare, sheath, shift, trapeze, mermaid, column',
  'Waist: natural, empire, drop, high-rise, mid-rise, low-rise',
  'Length: mini, above-knee, knee, midi, below-knee, maxi, floor',
  'Fit: slim, tailored, regular, relaxed, oversized, boyfriend, baggy',
  'Closure: button, zipper, hook-and-eye, drawstring, wrap, snap',
  'Pocket: patch, welt, slash, cargo, besom, flap, kangaroo',
  'Collar: spread, point, button-down, mandarin, wing, notch, shawl, Peter Pan',
]
```

### 4. Add Skin Tone Matching
Based on color grading theory — recommend colors based on skin tone:

```typescript
const skinToneMatching = [
  { tone: 'Fair/Cool', colors: ['Blue', 'Purple', 'Pink', 'Silver', 'White'] },
  { tone: 'Fair/Warm', colors: ['Peach', 'Coral', 'Gold', 'Olive', 'Cream'] },
  { tone: 'Medium/Cool', colors: ['Navy', 'Burgundy', 'Emerald', 'Teal'] },
  { tone: 'Medium/Warm', colors: ['Brown', 'Orange', 'Yellow', 'Red'] },
  { tone: 'Dark/Cool', colors: ['Jewel tones', 'Plum', 'Sapphire', 'Magenta'] },
  { tone: 'Dark/Warm', colors: ['Gold', 'Copper', 'Rust', 'Camel'] },
]
```

### 5. Update the Analysis Response Shape
Add these fields to the analysis API response:

```typescript
interface AnalysisResponse {
  // ... existing fields
  
  // NEW ENRICHED FIELDS:
  bodyShapeRecommendations?: BodyShape[]
  editRecommendations?: EditRecommendation[]
  garmentDetailDescriptors?: string[]
  skinToneMatch?: typeof skinToneMatching[0]
}
```

## Test Case
- When calling /analyze-outfit with a balanced body type:
  - bodyShapeRecommendations should return ['Universal', 'General Tip']
  - editRecommendations should return 3-4 suggestions
  - garmentDetailDescriptors should have 10 entries
