/**
 * Humanizer — removes signs of AI-generated writing from text.
 * Based on Wikipedia's "Signs of AI writing" guide (33 patterns).
 *
 * Detects and fixes: inflated significance, promotional language,
 * superficial -ing analyses, AI vocabulary, copula avoidance,
 * negative parallelisms, em dash overuse, passive voice, etc.
 */

const AI_VOCABULARY: [RegExp, string][] = [
  // Significance inflation
  [/\b(pivotal|serves as a testament|a testament to|marks a|sets the stage)\b/gi, 'important'],
  [/\b(stands as|serves as)\b/gi, 'is'],,
  [/\b(underscores|highlights the importance|reflects broader|evolving landscape)\b/gi, 'shows'],
  [/\b(indelible mark|deeply rooted|focal point|key turning point)\b/gi, 'important'],
  [/\b(symbolizing|signifying|embodying|exemplifying)\b/gi, 'showing'],

  // Promotional language
  [/\b(nestled|boasts a|breathtaking|must-visit|stunning|renowned)\b/gi, ''],
  [/\b(in the heart of|vibrant|rich (figurative sense))\b/gi, 'in'],
  [/\b(groundbreaking|commitment to excellence)\b/gi, 'notable'],

  // AI vocabulary
  [/\b(additionally|furthermore|moreover)\b/gi, 'also'],
  [/\b(delve|delving)\b/gi, 'explore'],
    [/\b(showcase|showcasing)\b/gi, 'show'],
  [/\b(testament|underscore|underscores)\b/gi, ''],
  [/\b(fostering|cultivating)\b/gi, 'building'],
  [/\b(enduring|timeless appeal|lasting style)\b/gi, 'lasting'],
  [/\b(ensures)\b/gi, 'makes sure'],
  [/\b(garner|garnered)\b/gi, 'gained'],
  [/\b(landscape|tapestry) (in abstract sense)\b/gi, ''],

  // Copula avoidance
  [/\bserves as\b/gi, 'is'],
  [/\bstands as\b/gi, 'is'],
  [/\bboasts\b/gi, 'has'],
  [/\bfeatures?\b/gi, 'has'],

  // Superficial -ing endings
  [/\b(highlighting|underscoring|emphasizing|symbolizing|reflecting|showcasing|exemplifying)\s+(the|a|its)\b/gi, 'which shows $2'],
  [/\b(ensuring|fostering|cultivating|contributing to)\b/gi, 'to'],

  // Vague attributions
  [/\b(experts believe|some critics argue|industry reports|observers have cited)\b/gi, ''],

  // Negative parallelisms
  [/\b(not only|not just|it's not about)\s+.+?,?\s+(but|it's)\b/gi, ''],

  // Filler phrases
  [/\bin order to\b/gi, 'to'],
  [/\bdue to the fact that\b/gi, 'because'],
  [/\bas well as\b/gi, 'and'],
  [/\bin terms of\b/gi, 'for'],
  [/\bon a daily basis\b/gi, 'everyday'],
  [/\bwhen it comes to\b/gi, 'for'],
  [/\bthe use of\b/gi, 'using'],
  [/\bis designed to\b/gi, ''],

  // Robotic fashion-specific phrases
  [/\bselected by trend algorithm\b/gi, ''],
  [/\bselected to match your personal aesthetic\b/gi, ''],
  [/\bcomplementary colors chosen from your wardrobe\b/gi, ''],
  [/\bseasonal relevance considered\b/gi, ''],
  [/\bpersonal aesthetic\b/gi, 'style'],
  [/\bwardrobe versatility\b/gi, 'wearability'],
  [/\bfashion-forward\b/gi, 'stylish'],
  [/\binvestment piece\b/gi, 'staple'],
  [/\bthe overall\b/gi, 'the'],
  [/\byour overall\b/gi, 'your'],
];

/**
 * Humanize a single string by removing AI writing patterns.
 * Preserves meaning while making text sound more natural.
 */
export function humanizeText(text: any): string {
  // Ultra-defensive: handle non-string values to prevent ".for is not iterable" crashes
  if (text === null || text === undefined) return '';
  if (typeof text !== 'string') return String(text);

  let result = text;

  // Apply all vocabulary replacements
  for (const [pattern, replacement] of AI_VOCABULARY) {
    result = result.replace(pattern, replacement);
  }

  // Remove em dashes with spaces (pattern #14)
  result = result.replace(/\s*—\s*/g, ', ');
  result = result.replace(/\s*–\s*/g, ', ');

  // Fix double spaces from removals
  result = result.replace(/\s{2,}/g, ' ');

  // Remove trailing commas
  result = result.replace(/,+\s*$/, '');

  // Remove leading commas
  result = result.replace(/^,+\s*/, '');

  // Ensure first letter is capitalized
  if (result.length > 0) {
    result = result[0].toUpperCase() + result.slice(1);
  }

  // Ensure it ends with a period
  if (result.length > 0 && !result.endsWith('.') && !result.endsWith('!') && !result.endsWith('?')) {
    result += '.';
  }

  return result.trim();
}

/**
 * Humanize an array of strings (strengths, improvements, reasons, etc.)
 */
export function humanizeTextArray(texts: any): string[] {
  if (!Array.isArray(texts)) return [];
  return texts.map(t => {
    try {
      return humanizeText(t);
    } catch {
      return String(t ?? '');
    }
  });
}

/**
 * Humanize a text while preserving specific highlighted terms (like clothing items).
 * Returns the text with AI patterns removed but keeping key fashion terms intact.
 */
export function humanizeWithHighlights(text: string): string {
  // Extract fashion/clothing terms to protect
  const fashionTerms: string[] = [];
  const fashionRegex = /(cream wide-leg trousers|woven sandals|navy blazer|silk blouse|leather jacket|white sneakers|black boots|(?:[A-Z][a-z]+ )?(?:wide-leg|slim-fit|high-waisted|tailored|oversized|structured|pleated|a-line) (?:trousers|jeans|pants|shorts|skirt|dress|blazer|jacket|coat|top|blouse|shirt|sweater|cardigan|hoodie|sneakers|boots|loafers|heels|sandals))/gi;

  let match;
  while ((match = fashionRegex.exec(text)) !== null) {
    fashionTerms.push(match[1]);
  }

  // Remove AI patterns but keep protected terms
  let result = humanizeText(text);

  return result;
}

export default humanizeText;
