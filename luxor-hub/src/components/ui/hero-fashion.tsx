"use client";
import { motion } from "motion/react";
import { AnimatedGradient } from "@/components/ui/animated-gradient-with-svg";
import { ParticleTextEffect } from "@/components/ui/interactive-text-particle";

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

          {/* Content Side — Multi-Color Animated Blocks */}
          <div className="md:order-1 flex flex-col justify-between">
            <motion.div
              className="relative flex-1 flex flex-col gap-3 h-full w-full bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-3 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* SECTION 1: TITLE (Interactive Particle Text) */}
              <div className="relative w-full h-20 md:h-28 flex items-center justify-center overflow-hidden bg-black/40 rounded-xl border border-white/10 flex-shrink-0">
                <ParticleTextEffect
                  text={styleName || "MODERN CLASSIC"}
                  colors={['ff6b6b', 'feca57', '48dbfb', '1dd1a1']}
                  className="absolute inset-0 w-full h-full"
                  animationForce={100}
                  particleDensity={6}
                />
              </div>

              {/* SECTION 2: ITEMS DETECTED (Sky Blue Gradient) */}
              <div className="relative flex-1 min-h-[80px] overflow-hidden rounded-xl border border-white/10">
                <AnimatedGradient colors={["#0ea5e9", "#38bdf8", "#bae6fd"]} speed={0.05} blur="medium" />
                <div className="relative z-10 p-3 backdrop-blur-sm h-full w-full">
                  <h3 className="text-[10px] uppercase tracking-widest text-white/60 mb-1.5 font-bold">Items</h3>
                  <div className="space-y-1">
                    {(topType || bottomType || footwear) ? (
                      <>
                        {topType && (
                          <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-white">
                            <span className={`w-2 h-2 rounded-full ${colorSwatchMap[topType.split(' ')[0]] || 'bg-white/60'} shadow-[0_0_6px_rgba(255,255,255,0.5)]`} />
                            <span className="capitalize">{topType}</span>
                          </div>
                        )}
                        {bottomType && (
                          <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-white">
                            <span className={`w-2 h-2 rounded-full ${colorSwatchMap[bottomType.split(' ')[0]] || 'bg-white/60'} shadow-[0_0_6px_rgba(255,255,255,0.5)]`} />
                            <span className="capitalize">{bottomType}</span>
                          </div>
                        )}
                        {footwear && (
                          <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-white">
                            <span className={`w-2 h-2 rounded-full ${colorSwatchMap[footwear.split(' ')[0]] || 'bg-white/60'} shadow-[0_0_6px_rgba(255,255,255,0.5)]`} />
                            <span className="capitalize">{footwear}</span>
                          </div>
                        )}
                        {accessories && accessories !== "None" && (
                          <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-white">
                            <span className={`w-2 h-2 rounded-full ${colorSwatchMap[accessories.split(' ')[0]] || 'bg-white/60'} shadow-[0_0_6px_rgba(255,255,255,0.5)]`} />
                            <span className="capitalize">{accessories}</span>
                          </div>
                        )}
                      </>
                    ) : itemsDetected.length > 0 ? (
                      itemsDetected.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs md:text-sm font-medium text-white">
                          <span className="w-2 h-2 rounded-full bg-white/60 shadow-[0_0_6px_rgba(255,255,255,0.5)]" />
                          <span className="capitalize">{item}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-white/40">No items detected</p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 3: STRENGTHS (Pink/Orange Gradient) */}
              <div className="relative flex-1 min-h-[80px] overflow-hidden rounded-xl border border-white/10">
                <AnimatedGradient colors={["#ec4899", "#f472b6", "#fbcfe8"]} speed={0.06} blur="medium" />
                <div className="relative z-10 p-3 backdrop-blur-sm h-full w-full">
                  <h3 className="text-[10px] uppercase tracking-widest text-white/60 mb-1.5 font-bold">Strengths</h3>
                  <div className="space-y-1">
                    {strengths.length > 0 ? strengths.map((s, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-white/90">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] mt-1 flex-shrink-0" />
                        <span>{s}</span>
                      </div>
                    )) : (
                      <p className="text-xs text-white/40">No strengths detected</p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 4: TWEAK (Purple/Cyan Gradient) */}
              <div className="relative min-h-[60px] overflow-hidden rounded-xl border border-white/10 flex-shrink-0">
                <AnimatedGradient colors={["#8b5cf6", "#a78bfa", "#c4b5fd"]} speed={0.07} blur="medium" />
                <div className="relative z-10 p-3 backdrop-blur-sm h-full w-full flex flex-col justify-center">
                  <h3 className="text-[10px] uppercase tracking-widest text-white/60 mb-0.5 font-bold">Tweak</h3>
                  <p className="text-xs italic text-white/90 leading-relaxed">
                    {tweakPlan || "Consider adding a structured blazer for a more polished look."}
                  </p>
                </div>
              </div>

              {/* SECTION 5: AUDIT (Neutral/Dark) */}
              {audit && (
                <div className="relative min-h-[40px] overflow-hidden rounded-xl border border-white/10 bg-black/60 flex-shrink-0">
                  <div className="relative z-10 p-2.5 backdrop-blur-sm h-full w-full flex items-center">
                    <p className="text-[11px] text-white/50 leading-relaxed">{audit}</p>
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
