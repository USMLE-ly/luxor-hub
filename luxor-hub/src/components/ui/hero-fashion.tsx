"use client";
import { motion } from "motion/react";

interface FashionHeroProps {
  styleName?: string;
  styleScore?: number | null;
  strengths?: string[];
  itemsDetected?: string[];
  actualColors?: string[];
  audit?: string;
  tweakPlan?: string;
  imageUrl?: string;
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
  itemsDetected = [],
  actualColors = [],
  audit = "",
  tweakPlan = "",
  imageUrl,
  vibeType,
  topType = "",
  bottomType = "",
  footwear = "",
  accessories = "",
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
                  className="rounded-2xl shadow-2xl w-full object-cover filter brightness-105 max-h-[500px]"
                />
                {/* Score ring overlaid top-right */}
                {!isNA && (
                  <div className="absolute top-4 right-4 z-10 drop-shadow-lg bg-black/20 backdrop-blur-sm rounded-full p-1">
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
                </div>
              </div>
            ) : null}

            {/* Absolutely nothing shown when neither imageUrl nor vibeType — no placeholder */}
          </div>

          {/* Content Side */}
          <div className="md:order-1 flex flex-col justify-between">
            <div className="flex flex-col h-full justify-between gap-4">
              {/* Header - title only, score is overlaid on the image */}
              <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight tracking-tighter">
                {styleName}
              </h1>

              {/* Items detected - detailed labels with color dots */}
              {(topType || bottomType || footwear) && (
                <div className="space-y-1.5 text-sm">
                  {topType && <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-[10px] min-w-[40px] uppercase tracking-wider">Top</span>
                    <span className={`w-2.5 h-2.5 rounded-full inline-block ${colorSwatchMap[topType.split(' ')[0]] || 'bg-gray-400'}`} />
                    <span className="text-foreground/90">{topType}</span>
                  </div>}
                  {bottomType && <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-[10px] min-w-[40px] uppercase tracking-wider">Bottom</span>
                    <span className={`w-2.5 h-2.5 rounded-full inline-block ${colorSwatchMap[bottomType.split(' ')[0]] || 'bg-gray-400'}`} />
                    <span className="text-foreground/90">{bottomType}</span>
                  </div>}
                  {footwear && <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-[10px] min-w-[40px] uppercase tracking-wider">Shoes</span>
                    <span className={`w-2.5 h-2.5 rounded-full inline-block ${colorSwatchMap[footwear.split(' ')[0]] || 'bg-gray-400'}`} />
                    <span className="text-foreground/90">{footwear}</span>
                  </div>}
                  {accessories && accessories !== "None" && <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-[10px] min-w-[40px] uppercase tracking-wider">Acc</span>
                    <span className={`w-2.5 h-2.5 rounded-full inline-block ${colorSwatchMap[accessories.split(' ')[0]] || 'bg-gray-400'}`} />
                    <span className="text-foreground/90">{accessories}</span>
                  </div>}
                </div>
              )}
              {/* Fallback plain items */}
              {!(topType || bottomType || footwear) && itemsDetected.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {itemsDetected.map((item, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-zinc-800/60 border border-zinc-700/50 text-xs text-foreground/80">
                      {item}
                    </span>
                  ))}
                </div>
              )}

              {/* Colors are embedded in each item label below — no standalone section needed */}

              {/* Strengths list */}
              <ul className="space-y-2 tracking-tighter text-base text-foreground/80">
                {strengths.length > 0 ? strengths.map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0.8 }}
                    whileHover={{ opacity: 1, y: -2, transition: { duration: 0.3, ease: "easeOut" } }}
                    className="flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500/70 flex-shrink-0" />
                    {item}
                  </motion.li>
                )) : (
                  <li className="text-muted-foreground/50">No strengths detected</li>
                )}
              </ul>

              {/* Audit / Tweak */}
              <div className="space-y-3 mt-auto pt-4 border-t border-zinc-800/60">
                {audit && (
                  <p className="text-sm text-foreground/70 leading-relaxed">{audit}</p>
                )}
                {tweakPlan && (
                  <p className="text-sm text-purple-400/80 italic">
                    <span className="font-semibold text-purple-400">Tweak:</span> {tweakPlan}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
