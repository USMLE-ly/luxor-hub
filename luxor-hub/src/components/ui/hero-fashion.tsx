"use client";
import { motion } from "motion/react";
import { AnimatedGradient } from "@/components/ui/animated-gradient-with-svg";
import { MarkerHighlight } from "@/components/ui/marker-highlight";
import { ShimmerBgText } from "@/components/ui/shimmer-bg-text";
import { humanizeText, humanizeTextArray } from "@/lib/humanizer";

/** Clothing & accessory keywords to detect in tweak text for yellow highlighting */
const TWEAK_KEYWORDS = [
  'blazer','jacket','cardigan','coat','vest','hoodie','sweater','shirt','blouse','top',
  'trousers','pants','jeans','shorts','skirt','dress','jumpsuit','romper',
  'loafers','sneakers','boots','heels','pumps','sandals','flats','mules','oxfords',
  'necklace','earring','bracelet','ring','watch','belt','scarf','bag','handbag',
  'clutch','tote','backpack','hat','sunglasses','gloves',
  'crop top','tank top','t-shirt','blazer','suit','vest',
  'wide-leg','slim-fit','high-waisted','tailored','oversized','structured',
  'leather','suede','denim','silk','cotton','linen','cashmere','wool','lace','satin',
  'gold','silver','rose gold','tortoiseshell','pearl',
  'polka dot','striped','floral','plaid','checkered',
  'navy','cream','beige','khaki','olive','burgundy','camel','charcoal','taupe',
  'black','white','gray','brown','tan','blush','mauve','terracotta','indigo',
];

/** Render tweak text with ALL matching clothing terms highlighted in yellow */
function renderHighlightedTweak(text: string) {
  if (!text) {
    const fallback = "Consider adding a structured blazer for a more polished look.";
    return <span>{fallback}</span>;
  }
  
  // Build a regex from all keywords, longest first to match multi-word phrases
  const sorted = [...TWEAK_KEYWORDS].sort((a, b) => b.length - a.length);
  const escaped = sorted.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp('(' + escaped.join('|') + ')', 'gi');
  
  const parts = text.split(pattern);
  const result: React.ReactNode[] = [];
  
  if (!Array.isArray(parts)) return <span>{text}</span>;
  parts.forEach((part, i) => {
    if (!part) return;
    const isKeyword = sorted.some(k => k.toLowerCase() === part.toLowerCase());
    if (isKeyword) {
      result.push(
        <MarkerHighlight
          key={i}
          highlight={part}
          markerColor="#facc15"
          baseColor="#ffffff"
          highlightedTextColor="#171717"
          speed={1.2}
          fontSize={18}
          fontWeight={500}
          className="inline-block align-middle"
        />
      );
    } else {
      result.push(<span key={i}>{part}</span>);
    }
  });
  
  // If no keywords were found, highlight the first actionable phrase (after "Add", "Try", "Swap")
  if (result.length <= 1) {
    const match = text.match(/(?:Add|adding|Try|Swap|Pair|Wear|Opt|Go|Choose)\s+(?:a\s+|an\s+|the\s+)?([a-zA-Z\s-]+?)(?:\s+(?:to|for|and|if|or|with|instead|when)|$)/i);
    if (match) {
      const phrase = match[1].trim();
      const idx = text.toLowerCase().indexOf(phrase.toLowerCase());
      if (idx >= 0) {
        const before = text.substring(0, idx);
        const after = text.substring(idx + phrase.length);
        return (
          <span>
            {before}
            <MarkerHighlight
              highlight={phrase}
              markerColor="#facc15"
              baseColor="#ffffff"
              highlightedTextColor="#171717"
              speed={1.2}
              fontSize={18}
              fontWeight={500}
              className="inline-block align-middle"
            />
            {after}
          </span>
        );
      }
    }
  }
  
  return <span>{result}</span>;
}

interface FashionHeroProps {
  aiSourceLabel?: string;
  styleName?: string;
  styleScore?: number | null;
  strengths?: string[];
  improvements?: { issue: string; suggestion: string; priority: string }[];
  itemsDetected?: string[];
  actualColors?: string[];
  audit?: string;
  tweakPlan?: string;
  tweakImageUrl?: string;
  imageUrl?: string;
  generatedImageUrl?: string | null;
  vibeType?: string;
  topType?: string;
  bottomType?: string;
  footwear?: string;
  accessories?: string;
}

const colorSwatchMap: Record<string, string> = {
  "Pink": "bg-pink-500", "Red": "bg-red-500", "Blue": "bg-blue-500",
  "Black": "bg-gray-900", "White": "bg-white border border-zinc-600",
  "Cream": "bg-yellow-100", "Green": "bg-green-500", "Brown": "bg-amber-800",
  "Gold": "bg-yellow-500", "Silver": "bg-gray-300", "Navy": "bg-blue-900",
  "Tan": "bg-amber-200", "Beige": "bg-amber-100", "Yellow": "bg-yellow-400",
  "Grey": "bg-gray-400", "Orange": "bg-orange-500", "Teal": "bg-teal-500",
  "Burgundy": "bg-red-900", "Blush": "bg-pink-200", "Khaki": "bg-amber-200",
  "Olive": "bg-green-700", "Purple": "bg-purple-600", "Maroon": "bg-red-800",
};

const vibeEmojis: Record<string, string> = {
  "Casual": "👕", "Formal": "🤵", "Business": "💼", "Sporty": "🏃",
  "Date Night": "🌹", "Party": "🎉", "Bohemian": "🌸", "Streetwear": "🧢",
  "Minimalist": "⬜", "Vintage": "📻",
};

export function FashionHero({
  styleName = "Your Style",
  styleScore,
  strengths = [],
  improvements = [],
  itemsDetected = [],
  actualColors = [],
  audit = "",
  tweakPlan = "",

  imageUrl,
  generatedImageUrl,
  vibeType,
  topType = "",
  bottomType = "",
  footwear = "",
  accessories = "",
  aiSourceLabel,
}: FashionHeroProps) {
  const isNA = styleScore === null || styleScore === undefined || styleScore === 0;
  const showMindMap = !imageUrl && vibeType;

  return (
    <div className="w-full">
      <div className="container mx-auto px-2 py-6 md:py-12">
        <div className="grid md:grid-cols-2 gap-6 relative overflow-x-hidden">
          {/* Image / Mind Map Side */}
          <div className="md:order-2 relative">
            <div className="absolute -z-10 w-72 h-72 rounded-full bg-purple-500/20 blur-3xl opacity-30 -top-10 -left-10" />
            {imageUrl ? (
              <div className="relative">
                <img
                  src={imageUrl}
                  alt="Uploaded outfit"
                  className="w-full h-auto max-h-[75vh] md:max-h-[85vh] object-contain rounded-2xl shadow-2xl"
                />
                {/* Score ring overlaid top-right */}
                {!isNA && (
                  <div className="absolute top-2 right-2 z-10 drop-shadow-lg bg-black/20 backdrop-blur-sm rounded-full p-0.5">
                    <div className="relative w-20 h-20 md:w-24 md:h-24">
                      <svg width="100%" height="100%" viewBox="0 0 100 100" className="-rotate-90">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="6" />
                        <motion.circle
                          cx="50" cy="50" r="42" fill="none"
                          stroke="url(#goldArcOverlay)" strokeWidth="6" strokeLinecap="round"
                          strokeDasharray={264}
                          initial={{ strokeDashoffset: 264 }}
                          animate={{ strokeDashoffset: 264 - (styleScore! / 100) * 264 }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                        <defs>
                          <linearGradient id="goldArcOverlay" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#C6A55C" />
                            <stop offset="100%" stopColor="#E8D5A3" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl md:text-2xl font-bold gold-text">{styleScore}</span>
                        <span className="text-[8px] text-white/80">/ 100</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : showMindMap ? (
              /* ---- Style Mind Map & Vibe ---- */
              <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-xl p-6 h-full min-h-[300px] flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🧠</span>
                  <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Style Mind Map</h3>
                </div>

                {/* Vibe Type */}
                <div className="flex items-center gap-3 bg-zinc-800/40 rounded-xl p-4 border border-zinc-700/40">
                  <span className="text-3xl">{vibeEmojis[vibeType] || "✨"}</span>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Vibe Classification</p>
                    <p className="text-lg font-bold gold-text">{vibeType}</p>
                  </div>
                </div>

                {/* Style Score Ring */}
                {!isNA && (
                  <div className="flex items-center gap-4 bg-zinc-800/40 rounded-xl p-4 border border-zinc-700/40">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
                        <circle cx="32" cy="32" r="26" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                        <motion.circle
                          cx="32" cy="32" r="26" fill="none"
                          stroke="url(#goldArcMind)" strokeWidth="4" strokeLinecap="round"
                          strokeDasharray={163.36}
                          initial={{ strokeDashoffset: 163.36 }}
                          animate={{ strokeDashoffset: 163.36 - (styleScore! / 100) * 163.36 }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                        <defs>
                          <linearGradient id="goldArcMind" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#C6A55C" />
                            <stop offset="100%" stopColor="#E8D5A3" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold gold-text">{styleScore}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Style Score</p>
                      <p className="text-sm text-foreground/80">{styleName}</p>
                      {aiSourceLabel && aiSourceLabel !== "AI Analysis" && <span className="inline-flex items-center gap-1 mt-1 text-[10px] uppercase tracking-widest text-purple-400/70"><span className="w-1.5 h-1.5 rounded-full bg-purple-500/60"/>{aiSourceLabel}</span>}
                    </div>
                  </div>
                )}

                {/* Breakdown */}
                <div className="flex-1 bg-zinc-800/40 rounded-xl p-4 border border-zinc-700/40">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Breakdown</p>
                  {audit && (
                    <p className="text-sm text-foreground/70 leading-relaxed mb-3">&ldquo;{audit}&rdquo;</p>
                  )}
                  {tweakPlan && (
                    <div className="flex items-start gap-2 text-sm text-purple-400/80">
                      <span className="text-purple-400 mt-0.5">💡</span>
                      <span className="italic">{tweakPlan}</span>
                    </div>
                  )}
                  {/* Tweak visualization below tweak text */}
                  {tweakPlan && generatedImageUrl && (
                    <div className="relative w-full max-h-[250px] overflow-hidden rounded-xl border border-white/10 mt-4">
                      <img
                        src={generatedImageUrl}
                        alt="Tweak Visualization"
                        className="w-full h-full object-cover object-center rounded-xl"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Absolutely nothing shown when neither imageUrl nor vibeType — no placeholder */}
          </div>

          {/* Content Side — Multi-Color Animated Blocks */}
          <div className="md:order-1 flex flex-col justify-between">
            <motion.div
              className="relative flex-1 flex flex-col gap-3 h-full w-full bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-3 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* SECTION 1: TITLE (Marker Highlight) */}
              <div className="relative w-full flex items-center justify-start py-3 overflow-hidden rounded-xl border border-white/10 flex-shrink-0 bg-gradient-to-r from-purple-900/50 via-blue-900/50 to-cyan-900/50 px-4">
                <div className="text-3xl md:text-4xl lg:text-5xl italic tracking-tight drop-shadow-lg leading-none">
                  <MarkerHighlight
                    before=""
                    highlight={styleName || "Modern Classic"}
                    after=""
                    markerColor="#facc15"
                    baseColor="#ffffff"
                    highlightedTextColor="#ffffff"
                    fontSize={48}
                    fontWeight={700}
                    speed={1.2}
                    className="inline-block"
                  />
                </div>
              </div>

              {/* SECTION 2: ITEMS (Sky Blue Gradient + Shimmer) */}
              <div className="relative w-full overflow-hidden rounded-xl border border-white/10">
                <AnimatedGradient colors={["#0ea5e9", "#38bdf8", "#bae6fd"]} speed={0.05} blur="medium" />
                <div className="relative z-10 p-4 backdrop-blur-sm h-auto w-full">
                  <h3 className="text-xs uppercase tracking-[0.15em] text-white/60 mb-3 font-semibold">
                    <ShimmerBgText>ITEMS</ShimmerBgText>
                  </h3>
                  <div className="space-y-2.5 pb-2">
                    {(topType && topType !== 'None' || bottomType && bottomType !== 'None' || footwear && footwear !== 'None') ? (
                      <>
                        {topType && (
                          <div className="flex items-center gap-3 text-sm md:text-base font-medium text-white bg-transparent">
                            <span className={`w-2 h-2 rounded-full ${colorSwatchMap[topType.split(' ')[0]] || 'bg-white/80'} shadow-[0_0_8px_rgba(255,255,255,0.5)] flex-shrink-0`} />
                            <ShimmerBgText><span className="capitalize tracking-wide leading-tight">{topType}</span></ShimmerBgText>
                          </div>
                        )}
                        {bottomType && (
                          <div className="flex items-center gap-3 text-sm md:text-base font-medium text-white bg-transparent">
                            <span className={`w-2 h-2 rounded-full ${colorSwatchMap[bottomType.split(' ')[0]] || 'bg-white/80'} shadow-[0_0_8px_rgba(255,255,255,0.5)] flex-shrink-0`} />
                            <ShimmerBgText><span className="capitalize tracking-wide leading-tight">{bottomType}</span></ShimmerBgText>
                          </div>
                        )}
                        {footwear && footwear !== "None" && (
                          <div className="flex items-center gap-3 text-sm md:text-base font-medium text-white bg-transparent">
                            <span className={`w-2 h-2 rounded-full ${colorSwatchMap[footwear.split(' ')[0]] || 'bg-white/80'} shadow-[0_0_8px_rgba(255,255,255,0.5)] flex-shrink-0`} />
                            <ShimmerBgText><span className="capitalize tracking-wide leading-tight">{footwear}</span></ShimmerBgText>
                          </div>
                        )}
                        {(accessories && accessories !== "None") && (
                          <div className="flex items-center gap-3 text-sm md:text-base font-medium text-white bg-transparent">
                            <span className={`w-2 h-2 rounded-full ${colorSwatchMap[accessories.split(' ')[0]] || 'bg-white/80'} shadow-[0_0_8px_rgba(255,255,255,0.5)] flex-shrink-0`} />
                            <ShimmerBgText><span className="capitalize tracking-wide leading-tight">{accessories}</span></ShimmerBgText>
                          </div>
                        )}
                      </>
                    ) : Array.isArray(itemsDetected) && itemsDetected.length > 0 ? (
                      Array.isArray(itemsDetected) && itemsDetected.filter(item => item && item !== "None").map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm md:text-base font-medium text-white bg-transparent">
                          <span className="w-2 h-2 rounded-full bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.5)] flex-shrink-0" />
                          <ShimmerBgText><span className="capitalize tracking-wide leading-tight">{item}</span></ShimmerBgText>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-white/40">No items detected</p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 3: STRENGTHS (Pink/Orange Gradient + Shimmer) */}
              <div className="relative w-full overflow-hidden rounded-xl border border-white/10">
                <AnimatedGradient colors={["#ec4899", "#f472b6", "#fbcfe8"]} speed={0.06} blur="medium" />
                <div className="relative z-10 p-4 backdrop-blur-sm h-auto w-full">
                  <h3 className="text-xs uppercase tracking-[0.15em] text-white/60 mb-3 font-semibold">
                    <ShimmerBgText>STRENGTHS</ShimmerBgText>
                  </h3>
                  <div className="space-y-2 pb-2">
                    {Array.isArray(strengths) && strengths.length > 0 ? strengths.map((s, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-sm text-white/90 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] mt-1.5 flex-shrink-0" />
                        <ShimmerBgText><span className="tracking-wide">{humanizeText(s)}</span></ShimmerBgText>
                      </div>
                    )) : (
                      <p className="text-xs text-white/40">No strengths detected</p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 4: TWEAK VISUALIZER (Purple/Cyan Gradient + Marker Highlight + Image) */}
              <div className="relative w-full overflow-hidden rounded-xl border border-white/10 flex-shrink-0">
                <AnimatedGradient colors={["#8b5cf6", "#a78bfa", "#c4b5fd"]} speed={0.07} blur="medium" />
                <div className="relative z-10 p-4 backdrop-blur-sm h-auto w-full">
                  <h3 className="text-xs uppercase tracking-[0.15em] text-white/60 mb-1.5 font-semibold">TWEAK</h3>
                  
                  {/* Text advice with marker highlight — image removed */}
                  <div className="flex-1 w-full">
                    {(() => {
                      const text = tweakPlan || "Consider adding a structured blazer for a more polished look.";
                      return (
                        <p className="text-sm italic text-white/90 leading-relaxed tracking-wide">
                          {renderHighlightedTweak(humanizeText(text))}
                        </p>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* SECTION 4.5: HONEST IMPROVEMENTS (Red/Amber) */}
              {Array.isArray(improvements) && improvements.length > 0 && (
                <div className="relative w-full overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-950/30 via-red-950/20 to-amber-950/30">
                  <div className="relative z-10 p-4 backdrop-blur-sm">
                    <h3 className="text-xs uppercase tracking-[0.15em] text-amber-400/80 mb-3 font-semibold flex items-center gap-1.5">
                      <span>\u26A0</span> HONEST FEEDBACK
                    </h3>
                    <div className="space-y-3">
                      {Array.isArray(improvements) && improvements.map((imp, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <span className={
                            imp.priority === "high" ? "text-red-400" :
                            imp.priority === "medium" ? "text-amber-400" : "text-blue-400"
                          }>
                            {imp.priority === "high" ? "\uD83D\uDD34" : imp.priority === "medium" ? "\uD83D\uDFE1" : "\uD83D\uDD35"}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm text-white/90 leading-relaxed">{imp.issue}</p>
                            {imp.suggestion && (
                              <p className="text-xs text-amber-300/70 mt-0.5">\u2192 {imp.suggestion}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 5: AUDIT (Neutral/Dark) */}
              {audit && (
                <div className="relative min-h-[45px] overflow-hidden rounded-xl border border-white/10 bg-gradient-to-r from-black/60 via-zinc-900/60 to-black/60 flex-shrink-0">
                  <div className="relative z-10 p-3 backdrop-blur-sm h-full w-full flex items-center">
                    <p className="text-xs text-white/50 leading-relaxed tracking-wide">{audit}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
