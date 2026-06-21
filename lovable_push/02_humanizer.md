# 🗣️ BATCH 2/4: Humanizer — Remove AI Writing Patterns

## Context
All the AI-generated analysis text (style descriptions, VICE critique, improvements, strengths, recommendations) sounds obviously AI-written. We need to strip AI patterns and add natural personality.

## Changes Required

### 1. Create a Humanizer Utility Module
Create a new file `luxorHumanizer.ts` with these functions:

```typescript
// luxorHumanizer.ts — Humanizer for removing AI writing patterns
// Based on Wikipedia:Signs of AI writing

// ─── Pattern Replacements ─────────────────────────────────

const SIGNIFICANCE_PATTERNS: [RegExp, string][] = [
  [/\bstands?\s+as\s+a\b/g, 'is a'],
  [/\bserves?\s+as\s+a\b/g, 'acts as'],
  [/\b(vital|significant|crucial|pivotal|key)\s+(role|moment|factor)\b/g, 'important'],
  [/\b(underscores|highlights?)\s+its\s+(importance|significance)\b/g, 'shows how'],
  [/\breflects?\s+broader\b/g, 'relates to wider'],
  [/\bcharacterized\s+by\b/g, 'built around'],
  [/\bsymbolizing\s+its\s+(ongoing|enduring|lasting)\b/g, 'pointing to'],
  [/\brevolutioniz(e|ing)\b/g, 'change'],
]

const AI_VOCAB: Record<string, string> = {
  leverage: 'use',
  leveraging: 'using',
  holistic: 'full',
  robust: 'solid',
  seamless: 'smooth',
  seamlessly: 'smoothly',
  scalable: 'growable',
  actionable: 'useful',
  ecosystem: 'system',
  delve: 'explore',
  'delve into': 'look at',
  navigate: 'handle',
  intricate: 'detailed',
  multifaceted: 'varied',
  bespoke: 'custom',
  paradigm: 'model',
  synergy: 'collaboration',
  groundbreaking: 'notable',
  'cutting-edge': 'modern',
  'game-changer': 'big step',
}

const VAGUE_ATTRIBUTIONS: [RegExp, string][] = [
  [/\bit\s+is\s+widely\s+believed\b/g, 'many people think'],
  [/\bsome\s+(say|argue|claim|believe)\b/g, 'some think'],
  [/\bit\s+could\s+be\s+argued\b/g, 'you could argue'],
  [/\bit\s+is\s+worth\s+noting\b/g, 'notably'],
  [/\bimportantly\b/g, ''],
  [/\bnotably\b/g, ''],
]

const AUTHORITY_TROPES: [RegExp, string][] = [
  [/\bthe\s+real\s+question\s+is\b/g, 'the question is'],
  [/\bat\s+its\s+core\b/g, ''],
  [/\bin\s+reality\b/g, ''],
  [/\bwhat\s+really\s+matters\b/g, 'what matters'],
  [/\bfundamentally\b/g, ''],
]

// ─── Core Humanizer ───────────────────────────────────────

export function humanize(text: string, style: 'analysis' | 'vice' | 'description' = 'analysis'): string {
  if (!text || text.length < 20) return text
  const original = text

  text = applyPatterns(text, SIGNIFICANCE_PATTERNS)
  text = applyPatterns(text, VAGUE_ATTRIBUTIONS)
  text = applyPatterns(text, AUTHORITY_TROPES)
  text = replaceAIVocab(text)

  // Clean up
  text = text.replace(/  +/g, ' ').replace(/\.\s+\./g, '.')
  
  // Add natural sentence variety for descriptions
  if (style === 'description' && text.length > 60) {
    text = addSentenceVariety(text)
  }

  return text.length < original.length * 0.3 ? original : text.trim()
}

function applyPatterns(text: string, patterns: [RegExp, string][]): string {
  let result = text
  for (const [regex, replacement] of patterns) {
    result = result.replace(regex, replacement)
  }
  return result
}

function replaceAIVocab(text: string): string {
  let result = text
  for (const [word, replacement] of Object.entries(AI_VOCAB)) {
    result = result.replace(new RegExp('\\b' + word + '\\b', 'gi'), replacement)
  }
  return result
}

function addSentenceVariety(text: string): string {
  // Break up sentences that are too uniform
  const starters = ['Look,', 'The thing is,', '', '', '', '']
  const sentences = text.split(/(?<=[.!?])\s+/)
  
  for (let i = 1; i < sentences.length - 1; i += 2) {
    const starter = starters[Math.floor(Math.random() * starters.length)]
    if (starter && sentences[i]) {
      sentences[i] = starter + ' ' + sentences[i][0].toLowerCase() + sentences[i].slice(1)
    }
  }
  
  return sentences.join(' ')
}

// ─── Humanize an entire analysis result ────────────────────

export function humanizeAnalysis(analysis: any): any {
  if (!analysis || typeof analysis !== 'object') return analysis
  
  // Text fields
  const textFields: Record<string, string> = {
    styleDescription: 'description',
    bodyTypeNotes: 'analysis',
    reasoning: 'vice',
    recommendation: 'analysis',
  }
  
  for (const [field, style] of Object.entries(textFields)) {
    if (typeof analysis[field] === 'string') {
      analysis[field] = humanize(analysis[field], style as any)
    }
  }
  
  // List fields
  if (Array.isArray(analysis.strengths)) {
    analysis.strengths = analysis.strengths.map((s: string) => typeof s === 'string' ? humanize(s, 'analysis') : s)
  }
  if (Array.isArray(analysis.signals)) {
    analysis.signals = analysis.signals.map((s: string) => typeof s === 'string' ? humanize(s, 'vice') : s)
  }
  
  return analysis
}
```

### 2. Integrate into the Analysis Endpoint
In the analysis API call handler, call `humanizeAnalysis()` before returning the response:

```typescript
// In your analysis API handler:
const analysis = await analyzeOutfit(imageUrl)
const humanized = humanizeAnalysis(analysis)
return res.json(humanized)
```

## Test Cases
- Input: "This look stands as a testament to minimalist design principles, leveraging holistic synergy."
- Output: "This look is a minimalist design principles, using complete collaboration."

- Input: "The ensemble serves as a vital key to understanding transitional fashion."
- Output: "The ensemble acts as important to understanding transitional fashion."

- Input: "VICE-style critique: This is a DO. Score: 65/100. Tonal control and confidence."
- Output: "VICE critique: This is a DO. Score: 65/100. Tonal control and confidence."
