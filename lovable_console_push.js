// =============================================================
// LOVABLE FILE PUSH — Console Inject for Luxor Hub v3.0
// Paste this into your browser console (F12) on:
// https://lovable.dev/projects/5deb8621-bcc7-408a-a556-13a42a1aa488
// =============================================================
(async function() {
    'use strict';
    console.log('%c[Lovable Push] 🚀 Starting Luxor Hub v3.0 push...', 'color: #C8A951; font-weight: bold; font-size: 14px');

    // ─── Color Quantizer (289 lines) ───────────────────────────
    const COLOR_QUANTIZER_TS = `/**
 * colorQuantizer.ts — Luxor Hub Color Analysis Engine v3.0
 * Fixes: center-crop quantization, 8 colors, shadow filtering,
 * wider cream/ivory detection, color family grouping.
 */
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
};

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
};

export function getColorFamily(colorName: string): string {
  const lower = colorName.toLowerCase();
  for (const [family, members] of Object.entries(COLOR_FAMILIES)) {
    if (members.includes(lower)) return family;
  }
  return colorName;
}

export interface QuantizedColor {
  r: number; g: number; b: number;
  hex: string; name: string; family: string; luminance: number;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function luminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export async function quantizeColors(imageData: ImageData, nColors = 8): Promise<QuantizedColor[]> {
  const { width, height, data } = imageData;
  const marginX = Math.floor(width * 0.15);
  const marginY = Math.floor(height * 0.15);
  const pixels: [number, number, number][] = [];
  const stepX = Math.max(1, Math.floor((width - 2 * marginX) / 300));
  const stepY = Math.max(1, Math.floor((height - 2 * marginY) / 300));
  for (let y = marginY; y < height - marginY; y += stepY) {
    for (let x = marginX; x < width - marginX; x += stepX) {
      const idx = (y * width + x) * 4;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      if (r + g + b > 30 * 3) pixels.push([r, g, b]);
    }
  }
  const centroids = kmeans(pixels, nColors);
  return centroids.map(c => {
    const hex = rgbToHex(c[0], c[1], c[2]);
    const name = colorName(c[0], c[1], c[2]);
    const family = getColorFamily(name);
    return { r: c[0], g: c[1], b: c[2], hex, name, family, luminance: luminance(c[0], c[1], c[2]) };
  });
}

function kmeans(pixels: [number, number, number][], k: number): [number, number, number][] {
  if (pixels.length === 0) return [];
  const step = Math.max(1, Math.floor(pixels.length / k));
  const centroids: [number, number, number][] = [];
  for (let i = 0; i < k && i * step < pixels.length; i++) centroids.push([...pixels[i * step]]);
  for (let iter = 0; iter < 5; iter++) {
    const clusters: [number, number, number][][] = Array.from({ length: centroids.length }, () => []);
    for (const pixel of pixels) {
      let minDist = Infinity, bestIdx = 0;
      for (let i = 0; i < centroids.length; i++) {
        const c = centroids[i];
        const dist = (pixel[0] - c[0]) ** 2 + (pixel[1] - c[1]) ** 2 + (pixel[2] - c[2]) ** 2;
        if (dist < minDist) { minDist = dist; bestIdx = i; }
      }
      clusters[bestIdx].push(pixel);
    }
    for (let i = 0; i < centroids.length; i++) {
      if (clusters[i].length > 0) {
        centroids[i] = [
          Math.round(clusters[i].reduce((s, p) => s + p[0], 0) / clusters[i].length),
          Math.round(clusters[i].reduce((s, p) => s + p[1], 0) / clusters[i].length),
          Math.round(clusters[i].reduce((s, p) => s + p[2], 0) / clusters[i].length),
        ];
      }
    }
  }
  return centroids;
}

export function colorName(r: number, g: number, b: number): string {
  const max = Math.max(r, g, b), min = Math.min(r, g, b), diff = max - min, lum = luminance(r, g, b);
  if (max < 30 && lum < 25) return 'Black';
  if (max < 50 && lum < 40) return 'Charcoal';
  if (min > 220) return 'White';
  if (min > 200 && max > 230) return 'Ivory';
  if (r > 210 && g > 195 && b > 180) return 'Cream';
  if (r > 200 && g > 180 && b > 165) return 'Off-White';
  if (r > 195 && g > 180 && b > 160) return 'Alabaster';
  if (r > 185 && g > 170 && b > 150) return 'Ecru';
  if (diff < 25) {
    if (lum > 200) return 'Silver';
    if (lum > 170) return 'Light Grey';
    if (lum > 120) return 'Mid Grey';
    if (lum > 70) return 'Grey';
    if (lum > 40) return 'Dark Grey';
    return 'Charcoal';
  }
  if (r > g && r > b) {
    if (r > 200 && g < 100) return 'Red';
    if (r > 180 && g < 140) return b < 80 ? 'Crimson' : 'Rose';
    if (r > 140 && r > g * 1.5) return b < 80 ? 'Burgundy' : 'Coral';
    return r > 80 ? 'Maroon' : 'Dark Red';
  }
  if (g > r && g > b) {
    if (g > 200) return 'Green';
    if (g > 160) return b > 100 ? 'Emerald' : 'Olive';
    if (g > 120 && r > 100) return 'Sage';
    if (g > 120) return 'Kelly Green';
    return g > 80 ? 'Forest' : 'Dark Green';
  }
  if (b > r && b > g) {
    if (b > 200) return 'Blue';
    if (b > 160 && r < 100) return 'Royal Blue';
    if (b > 120 && r < 80) return 'Navy';
    if (b > 120) return 'Slate';
    if (b > 80 && r > 80) return 'Indigo';
    if (b > 80) return 'Teal';
    return 'Dark Blue';
  }
  if (r > 200 && g > 160 && b < 120) return 'Gold';
  if (r > 180 && g > 140 && b < 100) return 'Mustard';
  if (r > 180 && g > 150 && b > 100) return 'Beige';
  if (r > 160 && g > 120 && b < 100) return 'Tan';
  if (r > 140 && g > 100 && b < 80) return 'Brown';
  if (r > 200 && g < 100 && b < 100) return 'Burgundy';
  if (lum > 180) return 'Light Neutral';
  if (lum > 100) return 'Neutral';
  return 'Dark Neutral';
}

export function countColorFamilies(colors: QuantizedColor[]): number {
  return new Set(colors.slice(0, 4).map(c => c.family)).size;
}

export function isPaletteRestrained(colors: QuantizedColor[]): boolean {
  return countColorFamilies(colors) <= 2;
}`;

    // ─── Humanizer (84 lines) ──────────────────────────────────
    const HUMANIZER_TS = `export function humanize(text: string): string {
  let result = text;
  const replacements: [RegExp, string][] = [
    [/fundamentally, at its core/gi, ''],
    [/lets dive in/gi, ''],
    [/lets explore/gi, ''],
    [/without further ado/gi, ''],
    [/honestly\\?/gi, ''],
    [/\\blook,\\s*/gi, ''],
    [/the thing is/gi, ''],
    [/let us be honest/gi, ''],
    [/stands as a/gi, 'is a'],
    [/serves as a/gi, 'acts as'],
    [/characterized by/gi, 'built around'],
    [/testament to/gi, 'shows'],
    [/revolutionizing/gi, 'change'],
    [/groundbreaking/gi, 'notable'],
    [/seamless/gi, 'smooth'],
    [/\\bleverage\\b/gi, 'use'],
    [/\\bleveraging\\b/gi, 'using'],
    [/holistic/gi, 'full'],
    [/robust/gi, 'solid'],
    [/scalable/gi, 'growable'],
    [/actionable/gi, 'useful'],
    [/\\bdelve\\b/gi, 'explore'],
    [/intricate/gi, 'detailed'],
    [/bespoke/gi, 'custom'],
    [/paradigm/gi, 'model'],
    [/synergy/gi, 'collaboration'],
    [/it is widely believed/gi, 'many people think'],
    [/it could be argued/gi, 'you could argue'],
    [/the real question is/gi, 'the question is'],
  ];
  replacements.sort((a, b) => b[0].source.length - a[0].source.length)
    .forEach(([pattern, replacement]) => { result = result.replace(pattern, replacement); });
  result = result.replace(/  +/g, ' ');
  result = result.replace(/\\s+([.,!?;:])/g, '$1');
  result = result.replace(/([.,!?;:])([a-zA-Z])/g, '$1 $2');
  return result.trim();
}

export function humanizeAnalysis(obj: any): any {
  if (typeof obj === 'string') return humanize(obj);
  if (Array.isArray(obj)) return obj.map(item => humanizeAnalysis(item));
  if (obj !== null && typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) result[key] = humanizeAnalysis(obj[key]);
    }
    return result;
  }
  return obj;
}`;

    // ─── Enriched Analysis (201 lines) ────────────────────────
    const ENRICHED_ANALYSIS_TS = `export interface BodyShape {
  name: string;
  description: string;
  recommendation: string;
}

export const BODY_SHAPES: BodyShape[] = [
  { name: 'Pear', description: 'Wider hips', recommendation: 'Draw attention upward with detailed tops and keep bottoms simple.' },
  { name: 'Apple', description: 'Midsection weight', recommendation: 'Create vertical lines with V-necks and unstructured fabrics.' },
  { name: 'Hourglass', description: 'Balanced', recommendation: 'Emphasize the waist with belts and fitted silhouettes.' },
  { name: 'Rectangle', description: 'Straight', recommendation: 'Add curves with peplum tops and layered pieces.' },
  { name: 'Inverted Triangle', description: 'Broad shoulders', recommendation: 'Balance broad shoulders with A-line skirts and wide-leg pants.' },
];

export function getBodyShapeRecommendations(bodyTypeNotes: string): BodyShape[] {
  const notes = bodyTypeNotes.toLowerCase();
  const matched = BODY_SHAPES.filter(shape => notes.includes(shape.name.toLowerCase()));
  return matched.length > 0 ? matched : BODY_SHAPES;
}

export interface EditRecommendation {
  name: string;
  effect: string;
  suitableFor: string[];
}

export const MINIMAL_EDITS: EditRecommendation[] = [
  { name: 'Tuck in shirt', effect: 'Defines the waist', suitableFor: ['Hourglass', 'Rectangle'] },
  { name: 'Roll up sleeves', effect: 'Adds emphasis to the upper body', suitableFor: ['Inverted Triangle', 'Rectangle'] },
  { name: 'Add belt', effect: 'Highlights the waistline', suitableFor: ['Hourglass', 'Rectangle', 'Pear'] },
  { name: 'Change neckline', effect: 'Shifts focus upward', suitableFor: ['Pear', 'Hourglass'] },
  { name: 'Layer with jacket', effect: 'Creates structure and hides midsection', suitableFor: ['Apple', 'Pear'] },
  { name: 'Cuff pants', effect: 'Adds a horizontal break', suitableFor: ['Inverted Triangle', 'Rectangle'] },
  { name: 'Swap shade', effect: 'Uses color blocking to balance proportions', suitableFor: ['Pear', 'Apple', 'Hourglass', 'Rectangle', 'Inverted Triangle'] },
  { name: 'Half-tuck', effect: 'Creates an asymmetrical line', suitableFor: ['Hourglass', 'Rectangle'] },
];

export function getEditRecommendations(bodyTypeNotes: string): EditRecommendation[] {
  const notes = bodyTypeNotes.toLowerCase();
  const mentionedShapes = BODY_SHAPES.filter(shape => notes.includes(shape.name.toLowerCase())).map(shape => shape.name);
  if (mentionedShapes.length === 0) return MINIMAL_EDITS;
  return MINIMAL_EDITS.filter(edit => edit.suitableFor.some(suit => mentionedShapes.includes(suit)));
}

export const GARMENT_DETAIL_DESCRIPTORS: string[] = [
  'Neckline style (e.g., V-neck, crew, scoop)',
  'Sleeve type (e.g., long, short, capped)',
  'Hemline shape (e.g., straight, curved, asymmetric)',
  'Silhouette (e.g., fitted, relaxed, A-line)',
  'Waist definition (e.g., high, natural, low rise)',
  'Garment length (e.g., mini, midi, maxi)',
  'Fit style (e.g., slim, regular, oversized)',
  'Closure type (e.g., zipper, buttons, drawstring)',
  'Pocket style (e.g., patch, welt, side seam)',
  'Collar style (e.g., shirt, polo, mandarin)',
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

  constructor() { this.loadFromStorage(); }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) { this.entries = []; return; }
      const parsed = JSON.parse(raw);
      this.entries = parsed.map((entry: any) => ({ ...entry, timestamp: new Date(entry.timestamp) }));
    } catch { this.entries = []; }
  }

  private saveToStorage(): void {
    try { localStorage.setItem(this.storageKey, JSON.stringify(this.entries)); } catch {}
  }

  recordAnalysis(bodyTypeNotes: string, bodyShapes: BodyShape[], edits: EditRecommendation[], garmentDetails: string[] = []): MemoryEntry {
    const entry: MemoryEntry = { id: this.generateId(), timestamp: new Date(), bodyTypeNotes, bodyShapes, edits, garmentDetails };
    this.entries.push(entry);
    this.saveToStorage();
    return entry;
  }

  getHistory(): MemoryEntry[] { return [...this.entries]; }

  getStyleEvolution(): string {
    if (this.entries.length === 0) return 'No analysis history yet.';
    const shapeCount: Record<string, number> = {};
    this.entries.forEach(entry => entry.bodyShapes.forEach(shape => {
      shapeCount[shape.name] = (shapeCount[shape.name] || 0) + 1;
    }));
    const sorted = Object.entries(shapeCount).sort((a, b) => b[1] - a[1]);
    const mostFrequent = sorted[0];
    return \`Your most frequent body shape assessment is "\${mostFrequent[0]}" (appeared \${mostFrequent[1]} time\${mostFrequent[1] > 1 ? 's' : ''}).\`;
  }
}`;

    // ─── Combined prompt function ──────────────────────────────
    const FILES = [
        { path: 'src/utils/colorQuantizer.ts', content: COLOR_QUANTIZER_TS },
        { path: 'src/utils/humanizer.ts', content: HUMANIZER_TS },
        { path: 'src/utils/enrichedAnalysis.ts', content: ENRICHED_ANALYSIS_TS },
    ];

    function buildFinalPrompt() {
        let prompt = `I need to add 3 utility files to this project. Create each file with the EXACT content provided below:

## File 1: src/utils/colorQuantizer.ts

\`\`\`typescript
${COLOR_QUANTIZER_TS}
\`\`\`

## File 2: src/utils/humanizer.ts

\`\`\`typescript
${HUMANIZER_TS}
\`\`\`

## File 3: src/utils/enrichedAnalysis.ts

\`\`\`typescript
${ENRICHED_ANALYSIS_TS}
\`\`\`

Please:
1. Create all 3 files in the src/utils/ directory
2. Import them where they are needed in the analysis pipeline
3. Run the TypeScript compiler to verify no errors
4. Do NOT modify any other files

This is critical for fixing the color analysis bug where white/cream outfits were detected as "Slate, Maroon, Grey" instead of "White, Ivory, Cream".`;
        return prompt;
    }

    // ── Injection Logic ────────────────────────────────────────
    function log(msg, level = 'info') {
        const colors = { info: '#888', success: '#00c896', error: '#ff4444', warn: '#ffaa00' };
        console.log(`%c[Lovable Push] ${msg}`, `color: ${colors[level] || colors.info}`);
    }

    async function sendToLovable(prompt) {
        log('Intercepting fetch to send file creation prompt...');
        
        // The Lovable chat uses specific fetch calls. We detect and override.
        const originalFetch = window.fetch;
        let responseReceived = false;

        // Override fetch to intercept Lovable's own chat response
        window.fetch = async function(resource, config) {
            const url = typeof resource === 'string' ? resource : (resource.url || '');
            
            // Let the normal flow happen for most calls
            const response = await originalFetch.call(this, resource, config);
            
            // If this is a chat response, log success
            if (url.includes('/api/chat') || url.includes('/api/generate')) {
                if (!responseReceived) {
                    responseReceived = true;
                    log('✅ File creation prompt sent successfully!', 'success');
                    log('⏳ Waiting for Lovable AI to process...', 'warn');
                }
            }
            
            return response;
        };

        // Now send the prompt via the Lovable chat
        try {
            log('Sending prompt to Lovable AI...');
            
            // Try to use the Lovable app's internal chat function if available
            // This depends on how Lovable exposes its chat
            const chatInput = document.querySelector('textarea, [contenteditable="true"], .chat-input');
            
            if (chatInput) {
                // If we find a chat input, use it
                log('Found chat input element');
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                    window.HTMLTextAreaElement.prototype, 'value'
                ).set;
                nativeInputValueSetter.call(chatInput, prompt);
                chatInput.dispatchEvent(new Event('input', { bubbles: true }));
                
                // Find and click send button
                setTimeout(() => {
                    const sendBtn = document.querySelector('button[type="submit"], .send-button, [aria-label="Send"]');
                    if (sendBtn) {
                        sendBtn.click();
                        log('✅ Prompt sent! Check Lovable for file creation status.', 'success');
                    } else {
                        log('⚠️ Could not find send button. Please press Enter to send manually.', 'warn');
                    }
                }, 500);
            } else {
                // Fallback: use fetch to call the Lovable API directly
                log('No chat input found. Trying direct API call...');
                
                const body = JSON.stringify({
                    messages: [{ role: 'user', content: prompt }],
                    projectId: '5deb8621-bcc7-408a-a556-13a42a1aa488'
                });
                
                const resp = await originalFetch.call(window, '/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: body
                });
                
                log(`API responded with ${resp.status}`, resp.ok ? 'success' : 'error');
                if (!resp.ok) {
                    log('⚠️ Direct API failed. Please paste the prompt manually into Lovable chat.', 'error');
                }
            }
        } catch (err) {
            log(`Error: ${err.message}`, 'error');
        }
    }

    // ── Main ────────────────────────────────────────────────────
    log('Luxor Hub v3.0 file push ready');
    log(`Files to create: ${FILES.map(f => f.path.split('/').pop()).join(', ')}`);
    log(`Total: ${FILES.length} files`);
    
    const prompt = buildFinalPrompt();
    
    log('File contents loaded. Ready to send to Lovable AI.');
    log('');
    log('📋 Option 1: Auto-send (recommended)', 'info');
    log('   Run: await sendToLovable(prompt)', 'info');
    log('');
    log('📋 Option 2: Manual paste', 'info');
    log('   Copy the prompt below and paste into Lovable chat:', 'info');
    log('');
    log('='.repeat(60));
    log('');
    
    // Show character count
    log(`Prompt length: ${prompt.length} characters`);
    
    // Try auto-send after a delay
    log('Auto-sending in 2 seconds...');
    setTimeout(() => {
        sendToLovable(prompt);
    }, 2000);

    // Expose to global scope
    window.__lovablePush = {
        files: FILES,
        prompt: prompt,
        send: () => sendToLovable(prompt),
        colorQuantizer: COLOR_QUANTIZER_TS,
        humanizer: HUMANIZER_TS,
        enrichedAnalysis: ENRICHED_ANALYSIS_TS,
    };
    
    log('');
    log('🔧 Available in console: window.__lovablePush', 'info');
    log('   - window.__lovablePush.send() - Resend prompt', 'info');
    log('   - window.__lovablePush.prompt - View prompt text', 'info');
    log('   - window.__lovablePush.colorQuantizer - View file', 'info');
    log('');
    log('🚀 Push in progress...', 'success');
})();
