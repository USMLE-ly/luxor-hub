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