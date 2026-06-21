# 🧠 BATCH 4/4: Knowledge Graph, Supermemory & Enhanced VICE Critique

## Context
The VICE critique needs to use color-family grouping for accurate palette restraint detection, and we need to persist the analysis data in a supermemory-style knowledge store. The knowledge graph (179 fashion concepts) should be queryable.

## Changes Required

### 1. Add Color Family Grouping for VICE Critique
The VICE critique has a bug: tonal variations of white (White, Cream, Off-White, Ecru) are being counted as separate colors, triggering a false "Too many colors" penalty.

```typescript
// Color family groups — similar colors count as one
const COLOR_FAMILIES: Record<string, string[]> = {
  White: ['white', 'ivory', 'cream', 'off-white', 'alabaster', 'ecru', 'snow', 'pearl', 'bone', 'champagne'],
  Grey: ['light grey', 'mid grey', 'grey', 'dark grey', 'silver', 'charcoal', 'stone', 'ash', 'pewter', 'iron', 'flannel grey', 'heather', 'slate grey', 'jet'],
  Black: ['black', 'obsidian', 'jet black'],
  Beige: ['beige', 'tan', 'camel', 'sand', 'linen', 'natural', 'bisque'],
  Brown: ['brown', 'chocolate', 'chestnut', 'taupe', 'mocha', 'caramel', 'umber'],
  Blue: ['blue', 'navy', 'indigo', 'slate', 'royal blue', 'sky blue', 'cobalt', 'sapphire', 'ultramarine', 'midnight blue', 'steel blue', 'denim', 'periwinkle'],
  Green: ['green', 'olive', 'sage', 'forest', 'emerald', 'mint', 'kelly green', 'chartreuse', 'hunter green', 'pine', 'celadon', 'khaki'],
  Red: ['red', 'crimson', 'scarlet', 'poppy', 'fire engine', 'burgundy', 'wine', 'merlot', 'bordeaux', 'raspberry', 'amaranth'],
  Pink: ['rose', 'coral', 'salmon', 'peach', 'blush', 'dusty rose', 'baby pink'],
  Purple: ['purple', 'violet', 'lavender', 'lilac', 'plum'],
  Yellow: ['yellow', 'gold', 'mustard', 'ochre', 'saffron'],
}

function getColorFamily(name: string): string {
  const lower = name.toLowerCase()
  for (const [family, members] of Object.entries(COLOR_FAMILIES)) {
    if (members.includes(lower)) return family
  }
  return name // fallback
}
```

### 2. Update the VICE Critique Logic
Use the color family grouping in the VICE critique so that tonal variations don't trigger false penalties:

```typescript
function viceCritique(analysis: any): ViceResult {
  const colors = analysis.colorPalette?.colors || []
  const sortedColors = colors.sort((a, b) => b.brightness - a.brightness)
  
  // Use top 4 colors grouped by FAMILY
  const topFamilies = new Set(sortedColors.slice(0, 4).map(c => getColorFamily(c.base)))
  const allFamilies = new Set(colors.map(c => getColorFamily(c.base)))
  
  let score = 50
  const signals: string[] = []

  // Don't penalize tonal variations in the same family
  if (allFamilies.size >= 6) {
    score -= 8
    signals.push("Too many color families — feels busy")
  } else if (topFamilies.size <= 2) {
    score += 7
    signals.push("Restrained palette = natural style, not manufactured")
  } else if (topFamilies.size === 3) {
    score += 3
    signals.push("Controlled 3-color palette = well-edited")
  }

  // Rest of critique logic...
  return { verdict, score, signals }
}
```

### 3. Add a /memory-graph API Endpoint

```typescript
// New API endpoint: GET /memory-graph
// Responds with knowledge graph summary

app.get('/memory-graph', (req, res) => {
  const graph = JSON.parse(fs.readFileSync('./knowledge_graph.json', 'utf8'))
  
  const groups: Record<string, number> = {}
  for (const node of graph.nodes) {
    const g = node.group || 'unknown'
    groups[g] = (groups[g] || 0) + 1
  }
  
  res.json({
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    groups,
    nodeSample: graph.nodes.slice(0, 50).map(n => ({ id: n.id, label: n.label, group: n.group })),
  })
})

// POST /memory-graph — search the graph
app.post('/memory-graph', (req, res) => {
  const query = req.body.query?.toLowerCase() || ''
  const graph = JSON.parse(fs.readFileSync('./knowledge_graph.json', 'utf8'))
  
  const results = graph.nodes
    .filter(n => n.label?.toLowerCase().includes(query) || n.id?.toLowerCase().includes(query))
    .slice(0, 10)
    .map(n => ({
      id: n.id,
      label: n.label,
      group: n.group,
      neighbors: graph.edges
        .filter(e => (e.source === n.id || e.target === n.id))
        .slice(0, 8)
        .map(e => ({ id: e.source === n.id ? e.target : e.source, relation: e.label }))
    }))
  
  res.json({ query, results, totalNodes: graph.nodes.length })
})
```

### 4. Store Analysis History (Supermemory)
Create a persistent store for user analysis history:

```typescript
interface MemoryEntry {
  timestamp: number
  style: string
  score: number
  season: string
  colors: string[]
  garments: string[]
  viceVerdict: string
}

class LuxorMemoryStore {
  private store: any = {}
  
  constructor() {
    try {
      this.store = JSON.parse(localStorage.getItem('luxor_memory') || '{}')
    } catch { this.store = {} }
  }
  
  recordAnalysis(userId: string, analysis: any) {
    const entry: MemoryEntry = {
      timestamp: Date.now(),
      style: analysis.overallStyle,
      score: analysis.styleScore,
      season: analysis.seasonalFit,
      colors: analysis.colorPalette?.colors?.slice(0, 4).map(c => c.name) || [],
      garments: analysis.detectedGarments?.slice(0, 3).map(g => g.type) || [],
      viceVerdict: analysis.viceVerdict || '',
    }
    
    if (!this.store[userId]) this.store[userId] = []
    this.store[userId].push(entry)
    localStorage.setItem('luxor_memory', JSON.stringify(this.store))
    return entry
  }
  
  getHistory(userId: string, limit = 10): MemoryEntry[] {
    return (this.store[userId] || []).slice(-limit)
  }
}
```

## Test Cases
- Before fix: White/cream outfit → VICE says "Too many colors" ❌ (White + Cream + Off-White + Light Grey counted as 4)
- After fix: White/cream outfit → VICE says "Restrained palette" ✅ (White + Grey = 2 families)
- GET /memory-graph returns 179 nodes, 160 edges
- POST /memory-graph with query "minimalism" returns related concepts
- Memory store persists analysis history across sessions
