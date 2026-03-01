import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";

// Import generated product images
import calTrousersWide from "@/assets/cal-trousers-wide.jpg";
import calTrousersStraight from "@/assets/cal-trousers-straight.jpg";
import calTrousersChecked from "@/assets/cal-trousers-checked.jpg";
import calTrousersTailored from "@/assets/cal-trousers-tailored.jpg";
import calCoatDouble from "@/assets/cal-coat-double.jpg";
import calCoatOvercoat from "@/assets/cal-coat-overcoat.jpg";
import calCoatTrench from "@/assets/cal-coat-trench.jpg";
import calCoatBelted from "@/assets/cal-coat-belted.jpg";
import calTshirtBasic from "@/assets/cal-tshirt-basic.jpg";
import calTshirtGraphic from "@/assets/cal-tshirt-graphic.jpg";
import calTshirtVneck from "@/assets/cal-tshirt-vneck.jpg";
import calTshirtOversized from "@/assets/cal-tshirt-oversized.jpg";
import calShirtClassic from "@/assets/cal-shirt-classic.jpg";
import calShirtArtsy from "@/assets/cal-shirt-artsy.jpg";
import calShirtLinen from "@/assets/cal-shirt-linen.jpg";
import calShirtPrinted from "@/assets/cal-shirt-printed.jpg";
import calJacketBiker from "@/assets/cal-jacket-biker.jpg";
import calJacketBomber from "@/assets/cal-jacket-bomber.jpg";
import calJacketDenim from "@/assets/cal-jacket-denim.jpg";
import calJacketSuede from "@/assets/cal-jacket-suede.jpg";
import calJeansSlim from "@/assets/cal-jeans-slim.jpg";
import calJeansStraight from "@/assets/cal-jeans-straight.jpg";
import calJeansWide from "@/assets/cal-jeans-wide.jpg";
import calJeansSkinny from "@/assets/cal-jeans-skinny.jpg";
import calShoeLoafers from "@/assets/cal-shoe-loafers.jpg";
import calShoeChelsea from "@/assets/cal-shoe-chelsea.jpg";
import calShoeSneakers from "@/assets/cal-shoe-sneakers.jpg";
import calShoeDerby from "@/assets/cal-shoe-derby.jpg";

interface CalibrationStep {
  question: string;
  key: string;
  options: { label: string; imageUrl: string }[];
}

const calibrationSteps: CalibrationStep[] = [
  {
    question: "Which Trousers style do you prefer the most?",
    key: "trousersStyle",
    options: [
      { label: "Wide-leg", imageUrl: calTrousersWide },
      { label: "Straight", imageUrl: calTrousersStraight },
      { label: "Checked", imageUrl: calTrousersChecked },
      { label: "Tailored", imageUrl: calTrousersTailored },
    ],
  },
  {
    question: "Which Coat style do you prefer the most?",
    key: "coatStyle",
    options: [
      { label: "Double-breasted", imageUrl: calCoatDouble },
      { label: "Overcoat", imageUrl: calCoatOvercoat },
      { label: "Trench", imageUrl: calCoatTrench },
      { label: "Belted", imageUrl: calCoatBelted },
    ],
  },
  {
    question: "Which T-shirt style do you prefer the most?",
    key: "tshirtStyle",
    options: [
      { label: "Basic crew", imageUrl: calTshirtBasic },
      { label: "Graphic", imageUrl: calTshirtGraphic },
      { label: "V-neck", imageUrl: calTshirtVneck },
      { label: "Oversized", imageUrl: calTshirtOversized },
    ],
  },
  {
    question: "Which Shirt style do you prefer the most?",
    key: "shirtStyle",
    options: [
      { label: "Classic", imageUrl: calShirtClassic },
      { label: "Artsy", imageUrl: calShirtArtsy },
      { label: "Linen", imageUrl: calShirtLinen },
      { label: "Printed", imageUrl: calShirtPrinted },
    ],
  },
  {
    question: "Which Jacket style do you prefer the most?",
    key: "jacketStyle",
    options: [
      { label: "Biker", imageUrl: calJacketBiker },
      { label: "Bomber", imageUrl: calJacketBomber },
      { label: "Denim", imageUrl: calJacketDenim },
      { label: "Suede", imageUrl: calJacketSuede },
    ],
  },
  {
    question: "Which Jeans style do you prefer the most?",
    key: "jeansStyle",
    options: [
      { label: "Slim fit", imageUrl: calJeansSlim },
      { label: "Straight", imageUrl: calJeansStraight },
      { label: "Wide-leg", imageUrl: calJeansWide },
      { label: "Skinny", imageUrl: calJeansSkinny },
    ],
  },
  {
    question: "Which Footwear style do you prefer the most?",
    key: "footwearStyle",
    options: [
      { label: "Loafers", imageUrl: calShoeLoafers },
      { label: "Chelsea boots", imageUrl: calShoeChelsea },
      { label: "Sneakers", imageUrl: calShoeSneakers },
      { label: "Derby shoes", imageUrl: calShoeDerby },
    ],
  },
];

const Calibration = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<"questions" | "allSet" | "progress">("questions");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const totalSteps = calibrationSteps.length;
  const currentStepData = calibrationSteps[currentStep];
  const canProceed = !!answers[currentStepData?.key];

  const handleSelect = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      setPhase("allSet");
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: existing } = await supabase
        .from("style_profiles")
        .select("preferences")
        .eq("user_id", user.id)
        .single();

      const currentPrefs = (existing?.preferences as any) || {};
      const { error } = await supabase
        .from("style_profiles")
        .update({
          preferences: { ...currentPrefs, calibration: answers, calibrationProgress: 73 },
        })
        .eq("user_id", user.id);

      if (error) throw error;
      setPhase("progress");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (phase === "allSet") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-20 h-20 rounded-full border-[3px] border-primary flex items-center justify-center mb-8"
        >
          <Check className="w-8 h-8 text-primary" />
        </motion.div>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="font-display text-3xl font-bold text-foreground mb-3"
        >
          You're all set
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground font-sans text-center"
        >
          We'll use them to personalize your app experience
        </motion.p>
        <div className="fixed bottom-0 inset-x-0 p-5 bg-background">
          <Button
            onClick={handleComplete}
            disabled={loading}
            className="w-full h-14 rounded-2xl font-semibold font-sans text-base bg-muted text-foreground hover:bg-muted/80"
            variant="ghost"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
            ) : (
              <>CONTINUE <ArrowRight className="h-4 w-4 ml-2" /></>
            )}
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "progress") {
    return (
      <div className="min-h-screen bg-[hsl(120,30%,94%)] flex flex-col items-center px-6 pt-16">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-48 h-48 mb-8 flex items-center justify-center"
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle cx="100" cy="100" r="75" fill="hsl(0,0%,95%)" opacity="0.3" />
            <rect x="85" y="30" width="30" height="80" rx="3" fill="hsl(0,0%,20%)" />
            <rect x="80" y="25" width="40" height="15" rx="3" fill="hsl(0,0%,15%)" />
            <rect x="90" y="15" width="20" height="15" rx="2" fill="hsl(0,0%,10%)" />
            <rect x="93" y="5" width="14" height="12" rx="2" fill="hsl(0,0%,8%)" />
            <rect x="65" y="110" width="70" height="8" rx="2" fill="hsl(0,0%,25%)" />
            <ellipse cx="100" cy="160" rx="55" ry="12" fill="hsl(0,0%,18%)" />
            <rect x="55" y="118" width="90" height="42" rx="5" fill="hsl(0,0%,22%)" />
            <path d="M60,115 Q70,130 65,145 Q60,155 70,158 L130,158 Q140,155 135,145 Q130,130 140,115 Z" fill="hsl(130,60%,50%)" />
          </svg>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="font-display text-2xl font-bold text-foreground mb-8 text-center"
        >
          Great! Calibration in progress!
        </motion.h1>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-sm mb-4"
        >
          <div className="flex items-center gap-2">
            <div className="flex-1 h-10 rounded-full bg-background overflow-hidden">
              <div
                className="h-full rounded-full flex items-center justify-between px-4"
                style={{
                  width: "73%",
                  background: "linear-gradient(90deg, hsl(130,60%,50%), hsl(170,70%,55%))",
                }}
              >
                <Check className="w-5 h-5 text-background" />
                <span className="text-sm font-bold text-background">73%</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
              <span className="text-lg">🎁</span>
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="font-sans font-bold text-foreground mb-6"
        >
          Wow! 73% progress!
        </motion.p>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-muted-foreground font-sans text-center max-w-xs leading-relaxed mb-12"
        >
          Discover your Style Formula. Let's continue tomorrow - the more we know you, the better the results!
        </motion.p>

        <div className="fixed bottom-0 inset-x-0 p-5 bg-[hsl(120,30%,94%)]">
          <Button
            onClick={() => navigate("/dashboard")}
            className="w-full h-14 rounded-2xl font-semibold font-sans text-base bg-foreground text-background hover:bg-foreground/90"
          >
            CONTINUE
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          {currentStep > 0 ? (
            <button onClick={() => setCurrentStep((s) => s - 1)}>
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
          ) : (
            <button onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
          )}
          <h2 className="font-sans font-semibold text-foreground text-base">Calibration</h2>
          <div className="w-5" />
        </div>
        <div className="h-[3px] rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full bg-foreground rounded-full"
            initial={false}
            animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-6 pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="font-display text-xl font-bold text-foreground text-center mb-6 px-2">
              {currentStepData.question}
            </h2>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
              {currentStepData.options.map((option) => {
                const isActive = answers[currentStepData.key] === option.label;
                return (
                  <button
                    key={option.label}
                    onClick={() => handleSelect(currentStepData.key, option.label)}
                    className="flex-shrink-0 flex flex-col items-center"
                    style={{ width: "calc(25% - 6px)", minWidth: "80px" }}
                  >
                    <div
                      className={`relative w-full aspect-[3/4] rounded-lg overflow-hidden mb-1.5 transition-all bg-secondary ${
                        isActive ? "ring-2 ring-[hsl(43,74%,49%)]" : ""
                      }`}
                    >
                      <img
                        src={option.imageUrl}
                        alt={option.label}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute bottom-1.5 right-1.5">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shadow-sm ${
                            isActive
                              ? "border-[hsl(43,74%,49%)] bg-[hsl(43,74%,49%)]"
                              : "border-white/80 bg-white/80"
                          }`}
                        >
                          {isActive && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="fixed bottom-0 inset-x-0 z-20 bg-background p-5">
        <Button
          onClick={handleNext}
          disabled={!canProceed}
          className={`w-full h-14 rounded-2xl font-semibold font-sans text-base transition-all ${
            canProceed
              ? "bg-foreground text-background hover:bg-foreground/90"
              : "bg-muted text-muted-foreground"
          }`}
          variant="ghost"
        >
          NEXT
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default Calibration;
