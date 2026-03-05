import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  Sparkles, Palette, Star, ArrowRight, CheckCircle2, ShieldCheck,
  Scissors, Shirt, Check, Dna, User, ScanFace, Glasses, Gem, Gift,
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
    "Most frame shapes work — experiment with bold or geometric sunglasses",
    "Side-swept bangs and layered cuts enhance your balanced proportions",
    "Crew-neck and V-neck tops both complement your face shape equally well",
  ];
  if (s.includes("round")) return [
    "Angular sunglasses and rectangular frames add definition",
    "V-necklines and open collars elongate your face visually",
    "Longer hairstyles with volume at the crown create a lengthening effect",
  ];
  if (s.includes("square")) return [
    "Round or oval sunglasses soften your strong jawline beautifully",
    "Scoop and round necklines balance angular features",
    "Soft, layered hairstyles with side parts complement your bone structure",
  ];
  if (s.includes("heart") || s.includes("inverted triangle")) return [
    "Cat-eye or bottom-heavy frames balance a wider forehead",
    "Chin-length bobs and side-swept bangs add width at the jaw",
    "V-neck and scoop-neck tops draw attention downward harmoniously",
  ];
  if (s.includes("oblong") || s.includes("long") || s.includes("rectangle")) return [
    "Wide frames and aviator sunglasses add horizontal balance",
    "Bangs and chin-length cuts help shorten the appearance of your face",
    "Boat-neck and crew-neck tops create the illusion of width",
  ];
  if (s.includes("diamond")) return [
    "Oval frames or rimless glasses highlight your cheekbones",
    "V-neck and sweetheart necklines mirror your face's natural geometry",
    "Volume at the forehead or chin balances your widest points",
  ];
  return [
    "Choose sunglasses that contrast your face's dominant lines",
    "Necklines that mirror your face shape create visual harmony",
    "Hairstyles adding volume where your face is narrowest create balance",
  ];
}

function getBodyShapeTips(shape: string): string[] {
  const s = shape.toLowerCase();
  if (s.includes("hourglass")) return [
    "Fitted silhouettes and wrap dresses celebrate your balanced proportions",
    "Defined waistlines are your best friend — belted coats and high-waisted trousers",
    "Structured fabrics hold your shape better than overly drapey materials",
  ];
  if (s.includes("pear") || s.includes("triangle")) return [
    "Boat-neck, off-shoulder, and statement-collar tops broaden your shoulders",
    "A-line skirts and straight-leg trousers skim over the hip area elegantly",
    "Dark bottoms paired with lighter or patterned tops create balanced proportions",
  ];
  if (s.includes("inverted") || s.includes("trapezoid")) return [
    "V-necklines and vertical details soften broader shoulders",
    "Flared or wide-leg pants add volume to balance your upper body",
    "A-line and fuller skirts create proportional harmony with your frame",
  ];
  if (s.includes("rectangle") || s.includes("athletic")) return [
    "Create curves with peplum tops, ruching, and belted pieces at the waist",
    "Layering adds dimension — try jackets over fitted tops with textured bottoms",
    "High-waisted bottoms paired with tucked-in tops define your midsection",
  ];
  if (s.includes("round") || s.includes("oval") || s.includes("apple")) return [
    "Empire waistlines and A-line silhouettes skim over the midsection gracefully",
    "V-necklines create a lengthening vertical line through your torso",
    "Structured blazers and jackets define your shape without clinging",
  ];
  return [
    "Focus on fit — well-tailored pieces always look better than trendy but ill-fitting items",
    "Use color blocking strategically to highlight areas you love",
    "Layering with structured outer pieces adds dimension to any silhouette",
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

  return (
    <AppLayout>
      <div className="pb-8">
        {/* ===== HERO FORMULA CARD ===== */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-4 mt-5 rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(165deg, hsl(30 60% 96%), hsl(25 70% 92%), hsl(35 50% 90%))",
          }}
        >
          <div className="p-5">
            {/* Header row */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-bold text-foreground">My Style Formula</h2>
              <button
                onClick={() => navigate("/color-type")}
                className="flex items-center gap-1 px-4 py-2 rounded-full text-xs font-sans font-semibold text-background bg-foreground hover:opacity-90 transition-opacity"
              >
                View <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Three columns: Color type / Style Type / Body Type */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "hsl(45, 80%, 65%)" }}>
                    <Palette className="w-3 h-3 text-background" />
                  </div>
                  <span className="text-[10px] font-sans text-muted-foreground">Color type</span>
                </div>
                <p className="font-display text-sm font-bold text-foreground leading-tight">{colorSeason}</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(15,80%,60%), hsl(45,80%,60%))" }}>
                    <Scissors className="w-3 h-3 text-background" />
                  </div>
                  <span className="text-[10px] font-sans text-muted-foreground">Style Type</span>
                </div>
                <p className="font-display text-sm font-bold text-foreground leading-tight">{styleType}</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "hsl(270, 40%, 65%)" }}>
                    <User className="w-3 h-3 text-background" />
                  </div>
                  <span className="text-[10px] font-sans text-muted-foreground">Body Type</span>
                </div>
                <p className="font-display text-sm font-bold text-foreground leading-tight">{bodyType}</p>
              </div>
            </div>

            {/* Calibration egg illustration area */}
            <div className="flex flex-col items-center mb-5">
              <div className="w-32 h-32 rounded-full flex items-center justify-center mb-4" style={{
                background: "radial-gradient(circle at 40% 35%, hsl(30, 80%, 65%), hsl(15, 70%, 50%), hsl(25, 60%, 35%))",
                boxShadow: "0 12px 40px -10px hsla(15, 70%, 40%, 0.4)",
              }}>
                <Dna className="w-12 h-12 text-background/80" />
              </div>
              <h3 className="font-display text-base font-bold text-foreground text-center">Calibrate your Style Formula</h3>
              <p className="text-xs font-sans text-muted-foreground text-center mt-1 max-w-[280px]">
                Like or dislike your Style Formula outfits to help the AI learn your style identity better
              </p>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 h-8 rounded-full bg-background/60 overflow-hidden relative">
                <div
                  className="h-full rounded-full flex items-center justify-between px-3 transition-all duration-700"
                  style={{
                    width: `${Math.max(calibrationProgress || 30, 10)}%`,
                    background: "linear-gradient(90deg, hsl(15, 80%, 55%), hsl(45, 85%, 60%))",
                  }}
                >
                  <Check className="w-4 h-4 text-background" />
                  <span className="text-xs font-bold text-background">{calibrationProgress || 30}%</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-background/60 flex items-center justify-center">
                <Gift className="w-4 h-4 text-[hsl(0,65%,55%)]" />
              </div>
            </div>

            {/* Start CTA */}
            <button
              onClick={() => navigate("/calibration")}
              className="w-full py-3.5 rounded-full font-sans font-bold text-sm text-background flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{ background: "hsl(220, 15%, 18%)" }}
            >
              Start <ArrowRight className="w-4 h-4" />
            </button>
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
              <p className="text-xs font-sans uppercase tracking-widest text-muted-foreground">Your Archetype</p>
            </div>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">{archetype}</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">{styleScore}</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-sans">Style Score</p>
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
                <h3 className="font-display text-base font-bold text-foreground">Tips for {faceShape} Face</h3>
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
                <h3 className="font-display text-base font-bold text-foreground">Tips for {bodyShape} Body</h3>
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

              {/* AI Summary */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <h3 className="font-display text-base font-bold text-foreground">AI Summary</h3>
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
                  <h3 className="font-display text-base font-bold text-foreground">Recommendations</h3>
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

              {/* Colors to Avoid */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <p className="text-xs font-sans uppercase tracking-widest text-muted-foreground mb-3">Colors to Avoid</p>
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
                Complete the onboarding with selfie capture to unlock your full AI Color & Style analysis.
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
