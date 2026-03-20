import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  Sparkles, Palette, Star, ArrowRight, CheckCircle2, ShieldCheck,
  Scissors, Shirt, Check, Dna, User, ScanFace, Glasses, Gem, Gift,
  Layers, Shapes, Paintbrush, Briefcase, Heart, TrendingUp, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/app/AppLayout";
import { GradientButton } from "@/components/ui/gradient-button";
import FaceShapeIllustration from "@/components/app/FaceShapeIllustration";
import BodyShapeIllustration from "@/components/app/BodyShapeIllustration";

interface StyleDNAData {
  colorSeason: string;
  undertone: string;
  bestColors: string[];
  colorsToAvoid: string[];
  archetype: string;
  styleScore: number;
  recommendations: string[];
  summary: string;
  recommendedPrints?: string[];
  recommendedFabrics?: string[];
  flatteringSilhouettes?: string[];
  colorUsageTips?: { color: string; usage: string }[];
  styleEvolution?: { stage: string; timeframe: string; changes: string[]; trigger: string }[];
}

const colorNameToHsl: Record<string, string> = {
  "Navy": "hsl(220, 60%, 25%)", "Burgundy": "hsl(345, 60%, 30%)", "Forest Green": "hsl(140, 50%, 25%)",
  "Charcoal": "hsl(0, 0%, 30%)", "Olive": "hsl(80, 40%, 35%)", "Rust": "hsl(15, 70%, 45%)",
  "Teal": "hsl(180, 50%, 35%)", "Cream": "hsl(40, 60%, 90%)", "Camel": "hsl(30, 50%, 55%)",
  "Slate Blue": "hsl(210, 30%, 50%)", "Terracotta": "hsl(15, 55%, 50%)", "Sage": "hsl(130, 20%, 55%)",
  "Ivory": "hsl(40, 40%, 92%)", "Stone": "hsl(30, 15%, 60%)", "Dusty Rose": "hsl(350, 30%, 65%)",
  "Lavender": "hsl(270, 40%, 70%)", "Coral": "hsl(16, 80%, 65%)", "Mustard": "hsl(45, 80%, 50%)",
  "Black": "hsl(0, 0%, 10%)", "White": "hsl(0, 0%, 95%)", "Red": "hsl(0, 70%, 50%)",
  "Blue": "hsl(210, 70%, 50%)", "Green": "hsl(120, 50%, 40%)", "Beige": "hsl(35, 40%, 80%)",
  "Brown": "hsl(25, 50%, 35%)", "Gray": "hsl(0, 0%, 50%)", "Pink": "hsl(340, 60%, 65%)",
  "Orange": "hsl(25, 80%, 55%)", "Yellow": "hsl(50, 80%, 55%)", "Purple": "hsl(270, 50%, 45%)",
};

function getColorHsl(name: string): string {
  return colorNameToHsl[name] || `hsl(${Math.abs(name.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % 360}, 50%, 50%)`;
}

function getFaceShapeTips(shape: string): string[] {
  const s = shape.toLowerCase();
  if (s.includes("oval")) return [
    "Most frames work — go bold or geometric",
    "Side-swept bangs enhance balanced proportions",
    "Crew and V-necks both work. Pick based on mood.",
  ];
  if (s.includes("round")) return [
    "Angular frames sharpen a round face instantly",
    "V-necklines and open collars lengthen your face",
    "Longer hair with crown volume creates a slimming effect",
  ];
  if (s.includes("square")) return [
    "Round or oval frames soften a strong jawline",
    "Scoop and round necklines balance angular features",
    "Soft layers with a side part complement bone structure",
  ];
  if (s.includes("heart") || s.includes("inverted triangle")) return [
    "Cat-eye or bottom-heavy frames balance a wider forehead",
    "Chin-length bobs and side-swept bangs add jaw width",
    "V-neck and scoop-neck tops draw attention downward",
  ];
  if (s.includes("oblong") || s.includes("long") || s.includes("rectangle")) return [
    "Wide frames and aviators add horizontal balance",
    "Bangs and chin-length cuts shorten your face visually",
    "Boat-neck and crew-neck tops create width",
  ];
  if (s.includes("diamond")) return [
    "Oval or rimless glasses highlight your cheekbones",
    "V-neck and sweetheart necklines mirror your face geometry",
    "Volume at forehead or chin balances your widest points",
  ];
  return [
    "Choose frames that contrast your face's dominant lines",
    "Necklines that mirror your face shape create visual harmony",
    "Add volume where your face is narrowest for balance",
  ];
}

function getBodyShapeTips(shape: string): string[] {
  const s = shape.toLowerCase();
  if (s.includes("hourglass")) return [
    "Wrap dresses were made for hourglass figures. Lean into fitted cuts.",
    "Belted coats and high-waisted trousers are your power moves",
    "Structured fabrics hold your shape. Skip overly drapey material.",
  ];
  if (s.includes("pear") || s.includes("triangle")) return [
    "Boat-neck, off-shoulder, and statement collars broaden your shoulders",
    "A-line skirts and straight-leg trousers skim the hip area",
    "Dark bottoms paired with lighter tops create balanced proportions",
  ];
  if (s.includes("inverted") || s.includes("trapezoid")) return [
    "V-necklines and vertical details soften broader shoulders",
    "Flared or wide-leg pants add volume to balance your upper body",
    "A-line and fuller skirts create proportional harmony",
  ];
  if (s.includes("rectangle") || s.includes("athletic")) return [
    "Peplum tops, ruching, and belted pieces create curves at the waist",
    "Layering adds dimension — jackets over fitted tops with textured bottoms",
    "High-waisted bottoms with tucked-in tops define your midsection",
  ];
  if (s.includes("round") || s.includes("oval") || s.includes("apple")) return [
    "Empire waistlines and A-line silhouettes skim the midsection",
    "V-necklines create a lengthening vertical line through your torso",
    "Structured blazers define your shape without clinging",
  ];
  return [
    "Focus on fit — well-tailored pieces always beat trendy but ill-fitting items",
    "Use color blocking to highlight areas you love",
    "Structured outer layers add dimension to any silhouette",
  ];
}

const StyleDNA = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [dna, setDna] = useState<StyleDNAData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("style_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (data) {
        setProfile(data);
        const prefs = data.preferences as any;
        if (prefs?.aiAnalysis) setDna(prefs.aiAnalysis);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user, authLoading, navigate]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const archetype = profile?.archetype || "Style Explorer";
  const styleScore = profile?.style_score || 25;
  const calibrationProgress = (profile?.preferences as any)?.calibrationProgress || 0;
  const prefs = profile?.preferences as any;
  const faceShape = prefs?.faceShape || null;
  const faceShapeDescription = prefs?.faceShapeDescription || null;
  const bodyShape = prefs?.bodyShape || null;
  const bodyShapeTraits = prefs?.bodyShapeTraits || [];
  const colorSeason = dna?.colorSeason || "—";
  const styleType = archetype;
  const bodyType = bodyShape || "—";
  const lifestyle = prefs?.lifestyle?.[0] || null;
  const profession = prefs?.profession?.[0] || null;
  const styleMood = prefs?.styleMood || [];
  const styleEvolution = dna?.styleEvolution || [];

  return (
    <AppLayout>
      <div className="pb-8 overflow-x-hidden">
        {/* ===== HERO FORMULA CARD ===== */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-4 mt-5 rounded-2xl border border-border/60 overflow-hidden relative bg-card/60 backdrop-blur-xl"
        >
          {/* Shimmer sweep */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(105deg, transparent 40%, hsl(var(--primary) / 0.06) 50%, transparent 60%)" }}
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ duration: 2.5, delay: 0.8, ease: "easeInOut" }}
          />

          <div className="p-5 relative z-10">
            {/* Header row */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold text-foreground">Your Blueprint for Looking Incredible</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/color-type")}
                className="rounded-full text-xs px-4 h-8 border-border/60"
              >
                View <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>

            {/* Three columns */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button onClick={() => navigate("/color-type")} className="text-left group">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shadow-[0_0_8px_hsl(var(--primary)/0.15)]">
                    <Palette className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-[10px] font-sans text-muted-foreground">Color type</span>
                </div>
                <p className="font-sans font-bold text-foreground text-sm leading-tight">{colorSeason}</p>
              </button>
              <button onClick={() => navigate("/calibration")} className="text-left group">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors shadow-[0_0_8px_hsl(var(--destructive)/0.15)]">
                    <Scissors className="w-3.5 h-3.5 text-destructive" />
                  </div>
                  <span className="text-[10px] font-sans text-muted-foreground">Style Type</span>
                </div>
                <p className="font-sans font-bold text-foreground text-sm leading-tight">{styleType}</p>
              </button>
              <div className="text-left">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center shadow-[0_0_8px_hsl(var(--accent)/0.15)]">
                    <Shirt className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <span className="text-[10px] font-sans text-muted-foreground">Body Type</span>
                </div>
                <p className="font-sans font-bold text-foreground text-sm leading-tight">{bodyType}</p>
              </div>
            </div>

            {/* Decorative divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-5" />

            {/* Calibration Section */}
            <div className="text-center space-y-3">
              <h3 className="font-display text-lg font-bold text-foreground">
                Sharpen Your Style Edge
              </h3>
              <p className="text-muted-foreground text-xs font-sans max-w-[280px] mx-auto">
                The more you calibrate, the sharper your recommendations. Every swipe teaches the AI what makes you, you.
              </p>

              {/* Progress bar */}
              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1 h-9 rounded-full bg-secondary/80 overflow-hidden relative border border-border/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(calibrationProgress || 30, 10)}%` }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
                    className="h-full rounded-full flex items-center justify-between px-3"
                    style={{
                      background: "linear-gradient(90deg, hsl(142, 60%, 48%), hsl(var(--primary)))",
                    }}
                  >
                    <Check className="w-4 h-4 text-primary-foreground" />
                    <span className="text-xs font-bold text-primary-foreground">{calibrationProgress || 30}%</span>
                  </motion.div>
                </div>
                <div className="w-9 h-9 rounded-full bg-primary/10 border border-border/50 flex items-center justify-center flex-shrink-0">
                  <Gift className="w-4 h-4 text-primary" />
                </div>
              </div>

              {/* Start CTA */}
              <GradientButton
                onClick={() => navigate("/calibration")}
                className="w-full rounded-full h-12 text-base"
              >
                Start <ArrowRight className="w-4 h-4 ml-2" />
              </GradientButton>
            </div>
          </div>
        </motion.div>

        <div className="px-4 mt-6 space-y-4">
          {/* ===== ARCHETYPE CARD ===== */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <p className="text-xs font-sans uppercase tracking-widest text-muted-foreground">Who You Are, Styled</p>
            </div>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">{archetype}</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">{styleScore}</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-sans">Your Style Power</p>
                  <div className="flex gap-0.5 mt-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${s <= Math.round(styleScore / 20) ? "text-[hsl(45,80%,55%)] fill-[hsl(45,80%,55%)]" : "text-muted"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ===== FACE & BODY SHAPE DETAILS ===== */}
          {(faceShape || bodyShape) && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-border bg-card p-5 space-y-5"
            >
              {faceShape && (
                <div className="flex items-start gap-4">
                  <FaceShapeIllustration shape={faceShape} size={100} />
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 mb-2">
                      <ScanFace className="w-5 h-5 text-[hsl(200,50%,60%)]" />
                      <h3 className="font-display text-base font-bold text-foreground">{faceShape}</h3>
                    </div>
                    {faceShapeDescription && (
                      <p className="text-sm font-sans text-muted-foreground leading-relaxed">{faceShapeDescription}</p>
                    )}
                  </div>
                </div>
              )}
              {faceShape && bodyShape && <div className="border-t border-border" />}
              {bodyShape && (
                <div className="flex items-start gap-4">
                  <BodyShapeIllustration shape={bodyShape} size={120} />
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-5 h-5 text-[hsl(270,40%,65%)]" />
                      <h3 className="font-display text-base font-bold text-foreground">{bodyShape}</h3>
                    </div>
                    {bodyShapeTraits.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {bodyShapeTraits.map((trait: string, i: number) => (
                          <span key={i} className="px-3 py-1 rounded-full bg-secondary text-xs font-sans text-foreground">{trait}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Face Shape Tips */}
          {faceShape && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <Glasses className="w-5 h-5 text-[hsl(200,50%,60%)]" />
                <h3 className="font-display text-base font-bold text-foreground">How to Work Your {faceShape} Face</h3>
              </div>
              <div className="space-y-3">
                {getFaceShapeTips(faceShape).map((tip, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[hsl(200,50%,60%)] mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-sans text-muted-foreground leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Body Shape Tips */}
          {bodyShape && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <Gem className="w-5 h-5 text-[hsl(270,40%,65%)]" />
                <h3 className="font-display text-base font-bold text-foreground">Dressing Your {bodyShape} Frame</h3>
              </div>
              <div className="space-y-3">
                {getBodyShapeTips(bodyShape).map((tip, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[hsl(270,40%,65%)] mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-sans text-muted-foreground leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Color palette preview */}
          {dna && (
            <>
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
                onClick={() => navigate("/color-type")}
                className="w-full rounded-2xl border border-border bg-card p-5 text-left hover:bg-secondary/20 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-primary" />
                    <h3 className="font-display text-base font-bold text-foreground">{dna.colorSeason}</h3>
                  </div>
                  <span className="text-xs font-sans text-muted-foreground capitalize">{dna.undertone} undertone</span>
                </div>
                <div className="flex gap-1.5 mb-3">
                  {dna.bestColors.slice(0, 8).map((color) => (
                    <div
                      key={color}
                      className="flex-1 h-8 rounded-lg border border-border"
                      style={{ backgroundColor: getColorHsl(color) }}
                      title={color}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground font-sans">Tap to view full palette</p>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </motion.button>

              {/* ===== RECOMMENDED PRINTS & FABRICS ===== */}
              {(dna.recommendedPrints?.length || dna.recommendedFabrics?.length) ? (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.36 }}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Layers className="w-5 h-5 text-[hsl(15,80%,55%)]" />
                    <h3 className="font-display text-base font-bold text-foreground">Textures That Elevate You</h3>
                  </div>
                  {dna.recommendedPrints && dna.recommendedPrints.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[10px] font-sans uppercase tracking-widest text-muted-foreground mb-2">Recommended Prints</p>
                      <div className="flex flex-wrap gap-2">
                        {dna.recommendedPrints.map((print, i) => (
                          <span key={i} className="px-3 py-1.5 rounded-full bg-secondary text-xs font-sans text-foreground flex items-center gap-1.5">
                            <Paintbrush className="w-3 h-3 text-[hsl(15,80%,55%)]" />
                            {print}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {dna.recommendedFabrics && dna.recommendedFabrics.length > 0 && (
                    <div>
                      <p className="text-[10px] font-sans uppercase tracking-widest text-muted-foreground mb-2">Best Fabrics</p>
                      <div className="flex flex-wrap gap-2">
                        {dna.recommendedFabrics.map((fabric, i) => (
                          <span key={i} className="px-3 py-1.5 rounded-full bg-secondary text-xs font-sans text-foreground flex items-center gap-1.5">
                            <Layers className="w-3 h-3 text-[hsl(45,80%,55%)]" />
                            {fabric}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : null}

              {/* ===== FLATTERING SILHOUETTES ===== */}
              {dna.flatteringSilhouettes && dna.flatteringSilhouettes.length > 0 && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.37 }}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Shapes className="w-5 h-5 text-[hsl(270,40%,65%)]" />
                    <h3 className="font-display text-base font-bold text-foreground">Silhouettes Made for Your Body</h3>
                  </div>
                  <div className="space-y-3">
                    {dna.flatteringSilhouettes.map((sil, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-4 h-4 text-[hsl(270,40%,65%)] mt-0.5 flex-shrink-0" />
                        <p className="text-sm font-sans text-muted-foreground leading-relaxed">{sil}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ===== COLOR USAGE TIPS ===== */}
              {dna.colorUsageTips && dna.colorUsageTips.length > 0 && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.38 }}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Palette className="w-5 h-5 text-[hsl(45,80%,55%)]" />
                    <h3 className="font-display text-base font-bold text-foreground">Your Personal Color Playbook</h3>
                  </div>
                  <div className="space-y-2.5">
                    {dna.colorUsageTips.map((tip, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div
                          className="w-6 h-6 rounded-full border border-border flex-shrink-0"
                          style={{ backgroundColor: getColorHsl(tip.color) }}
                        />
                        <div className="flex-1">
                          <span className="text-xs font-sans font-semibold text-foreground">{tip.color}</span>
                          <span className="text-xs font-sans text-muted-foreground ml-1.5">— {tip.usage}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* AI Summary */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <h3 className="font-display text-base font-bold text-foreground">What the AI Sees in You</h3>
                </div>
                <p className="text-muted-foreground font-sans text-sm leading-relaxed">{dna.summary}</p>
              </motion.div>

              {/* Recommendations */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-primary" />
                  <h3 className="font-display text-base font-bold text-foreground">Your Next Moves</h3>
                </div>
                <div className="space-y-3">
                  {dna.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm font-sans text-muted-foreground leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Psychographic Profile */}
              {(lifestyle || profession || styleMood.length > 0) && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="w-4 h-4 text-primary" />
                    <h3 className="font-display text-base font-bold text-foreground">The Mind Behind Your Wardrobe</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {lifestyle && (
                      <div className="p-3 rounded-xl bg-secondary/50">
                        <p className="text-[10px] text-muted-foreground font-sans uppercase tracking-wider mb-1">Lifestyle</p>
                        <p className="text-sm font-sans font-semibold text-foreground">{lifestyle}</p>
                      </div>
                    )}
                    {profession && (
                      <div className="p-3 rounded-xl bg-secondary/50">
                        <p className="text-[10px] text-muted-foreground font-sans uppercase tracking-wider mb-1">Profession</p>
                        <p className="text-sm font-sans font-semibold text-foreground">{profession}</p>
                      </div>
                    )}
                  </div>
                  {styleMood.length > 0 && (
                    <div>
                      <p className="text-[10px] text-muted-foreground font-sans uppercase tracking-wider mb-2">Style Mood Goals</p>
                      <div className="flex flex-wrap gap-1.5">
                        {styleMood.map((mood: string) => (
                          <span key={mood} className="text-xs font-sans bg-primary/10 text-primary px-3 py-1 rounded-full">
                            {mood}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Style Evolution Prediction */}
              {styleEvolution.length > 0 && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.55 }}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <h3 className="font-display text-base font-bold text-foreground">Where Your Style Is Headed</h3>
                  </div>
                  <p className="text-xs text-muted-foreground font-sans mb-4">
                    Based on your habits and goals, here's how you'll evolve over the next 1–3 years
                  </p>
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-primary/50 to-primary/10" />
                    <div className="space-y-4">
                      {styleEvolution.map((stage, i) => (
                        <motion.div
                          key={stage.stage}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + i * 0.1 }}
                          className="flex gap-4 pl-1"
                        >
                          <div className="w-7 h-7 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center flex-shrink-0 z-10">
                            <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                          </div>
                          <div className="rounded-xl border border-border bg-secondary/30 p-3 flex-1 -mt-0.5">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-semibold text-foreground font-sans">{stage.stage}</p>
                              <span className="text-[10px] text-muted-foreground font-sans">{stage.timeframe}</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {stage.changes.map((change, j) => (
                                <span key={j} className="text-[10px] font-sans bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                  {change}
                                </span>
                              ))}
                            </div>
                            <p className="text-[10px] text-muted-foreground font-sans italic flex items-start gap-1">
                              <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" /> {stage.trigger}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Colors to Avoid */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <p className="text-xs font-sans uppercase tracking-widest text-muted-foreground mb-3">Colors Working Against You</p>
                <div className="flex flex-wrap gap-2">
                  {dna.colorsToAvoid.map((color) => (
                    <div key={color} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10">
                      <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: getColorHsl(color) }} />
                      <span className="text-xs font-sans text-foreground">{color}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}

          {!dna && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-border bg-card p-6 text-center"
            >
              <p className="text-muted-foreground font-sans mb-4">
                Your full style blueprint is locked. Upload a selfie during onboarding and the AI will map your colors, body, and archetype in seconds.
              </p>
              <Button onClick={() => navigate("/onboarding")} className="rounded-xl">
                Complete Onboarding
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default StyleDNA;
