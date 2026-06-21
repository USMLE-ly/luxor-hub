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