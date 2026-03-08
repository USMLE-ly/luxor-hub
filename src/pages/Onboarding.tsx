import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft } from "lucide-react";
import GenderStep from "@/components/onboarding/GenderStep";
import StepRenderer from "@/components/onboarding/StepRenderer";
import { getStepsForGender, type OnboardingStep } from "@/components/onboarding/onboardingSteps";
import SwipeParticles from "@/components/onboarding/SwipeParticles";

// Haptic feedback utility
const triggerHaptic = () => {
  // Vibration API for mobile devices
  if (navigator.vibrate) {
    navigator.vibrate(12);
  }
  // Audio tick for all devices
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 1800;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.06);
    setTimeout(() => ctx.close(), 100);
  } catch {}
};

const Onboarding = () => {
  const [gender, setGender] = useState<"female" | "male" | null>(null);
  const [currentStep, setCurrentStep] = useState(0); // 0 = gender step
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [aiResults, setAiResults] = useState<Record<string, any>>({});
  const [swipeDir, setSwipeDir] = useState<1 | -1>(1);
  const [swipeVelocity, setSwipeVelocity] = useState({ x: 0, y: 0 });
  const [swipeTrigger, setSwipeTrigger] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  const steps: OnboardingStep[] = gender ? getStepsForGender(gender) : [];
  const totalSteps = steps.length + 1; // +1 for gender
  const isGenderStep = currentStep === 0;
  const stepIndex = currentStep - 1;
  const currentStepData = !isGenderStep ? steps[stepIndex] : null;
  

  const isGenerating = currentStepData?.type === "generating";

  const canProceed = isGenderStep
    ? !!gender
    : currentStepData
      ? currentStepData.type === "notification" || currentStepData.type === "selfieIntro" || currentStepData.type === "selfieGuide" || currentStepData.type === "detectionResult"
        ? true
        : currentStepData.type === "cameraCapture"
          ? !!(answers[currentStepData.key]?.[0])
          : currentStepData.type === "height"
            ? !!(answers.heightFt?.[0] || answers.heightCm?.[0])
            : currentStepData.type === "generating"
              ? false
              : currentStepData.type === "sizeGrid"
                ? currentStepData.subGroups?.some((g) => (answers[`${currentStepData.key}_${g.label.toLowerCase()}`] || []).length > 0) ?? false
                : (answers[currentStepData.key] || []).length > 0
      : false;

  // Auto-trigger completion when generating step is reached
  useEffect(() => {
    if (isGenerating) {
      const timer = setTimeout(() => {
        handleComplete();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [isGenerating]);

  // Trigger AI analysis when moving to a detection result step
  useEffect(() => {
    if (!currentStepData || currentStepData.type !== "detectionResult") return;
    const mode = currentStepData.detectionMode;
    if (!mode) return;

    // Skip if already have results for this mode
    if (aiResults[mode]) return;

    const runAnalysis = async () => {
      try {
        if (mode === "face") {
          const selfieImage = answers.selfieCapture?.[0];
          if (!selfieImage) return;
          const { data, error } = await supabase.functions.invoke("analyze-style-dna", {
            body: { selfieImage, mode: "face" },
          });
          if (!error && data && !data.error) {
            setAiResults((prev) => ({ ...prev, face: data }));
          }
        } else if (mode === "body") {
          const fullBodyImage = answers.fullBodyCapture?.[0];
          if (!fullBodyImage) return;
          const { data, error } = await supabase.functions.invoke("analyze-style-dna", {
            body: { fullBodyImage, preferences: { gender }, mode: "body" },
          });
          if (!error && data && !data.error) {
            setAiResults((prev) => ({ ...prev, body: data }));
          }
        }
      } catch (err) {
        console.warn(`AI ${mode} analysis failed:`, err);
      }
    };

    runAnalysis();
  }, [currentStep, currentStepData?.type, currentStepData?.detectionMode]);

  const handleSelect = (key: string, option: string, singleSelect: boolean) => {
    setAnswers((prev) => {
      const current = prev[key] || [];
      if (singleSelect) return { ...prev, [key]: [option] };
      if (current.includes(option)) return { ...prev, [key]: current.filter((o) => o !== option) };
      return { ...prev, [key]: [...current, option] };
    });
  };

  const handleComplete = async () => {
    if (!user || !gender) return;
    setLoading(true);
    try {
      const selfieImage = answers.selfieCapture?.[0] || null;
      const fullBodyImage = answers.fullBodyCapture?.[0] || null;
      const prefsForAI = { ...answers, gender };
      // Remove base64 images from preferences to keep DB clean
      const { selfieCapture, fullBodyCapture, ...cleanPrefs } = prefsForAI as any;

      // Include previously collected AI face/body results
      const faceShapeData = aiResults.face ? {
        faceShape: aiResults.face.faceShape,
        faceShapeDescription: aiResults.face.faceShapeDescription,
      } : {};
      const bodyShapeData = aiResults.body ? {
        bodyShape: aiResults.body.bodyShape,
        bodyShapeTraits: aiResults.body.bodyShapeTraits,
      } : {};

      let archetype = `${(answers.styleGoal?.[0] || "Stylish").split(" ").slice(0, 3).join(" ")} ${gender === "female" ? "Femme" : "Masc"} Profile`;
      let styleScore = 25;
      let aiAnalysis = null;

      // Try AI analysis if we have photos
      if (selfieImage || fullBodyImage) {
        try {
          const { data: fnData, error: fnError } = await supabase.functions.invoke("analyze-style-dna", {
            body: { selfieImage, fullBodyImage, preferences: cleanPrefs },
          });
          if (!fnError && fnData && !fnData.error) {
            aiAnalysis = fnData;
            archetype = fnData.archetype || archetype;
            styleScore = fnData.styleScore || styleScore;
          }
        } catch (aiErr) {
          console.warn("AI analysis failed, continuing with defaults:", aiErr);
        }
      }

      const { error } = await supabase
        .from("style_profiles")
        .update({
          preferences: { ...cleanPrefs, ...faceShapeData, ...bodyShapeData, aiAnalysis },
          archetype,
          onboarding_completed: true,
          style_score: styleScore,
        })
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("Your Style DNA has been created!");
      navigate("/calibration");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const progress = ((currentStep) / (totalSteps - 1)) * 100;

  // Premium page transition variants
  const pageVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: dir * 60,
      scale: 0.96,
      filter: "blur(4px)",
    }),
    center: {
      opacity: 1,
      x: 0,
      scale: 1,
      filter: "blur(0px)",
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir * -60,
      scale: 0.96,
      filter: "blur(4px)",
    }),
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden relative">
      {/* Swipe-reactive particles */}
      <SwipeParticles swipeVelocity={swipeVelocity} swipeTrigger={swipeTrigger} />

      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, hsl(var(--primary)), transparent 70%)" }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.04, 0.07, 0.04] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Premium progress bar */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl px-5 pt-5 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <AnimatePresence mode="wait">
            {currentStep > 0 && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                onClick={() => { triggerHaptic(); setSwipeDir(-1); setCurrentStep((s) => s - 1); }}
                className="p-1.5 rounded-full hover:bg-secondary/60 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-foreground" />
              </motion.button>
            )}
          </AnimatePresence>
          <div className="flex-1" />
          <motion.span
            key={currentStep}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-sans text-muted-foreground tabular-nums"
          >
            {currentStep + 1} / {totalSteps}
          </motion.span>
        </div>
        {/* Smooth animated progress track */}
        <div className="relative h-1 w-full rounded-full bg-muted/50 overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))" }}
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
          {/* Shimmer effect on progress */}
          <motion.div
            className="absolute inset-y-0 w-16 rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)" }}
            animate={{ left: ["-10%", "110%"] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-5 pt-6 pb-24 overflow-y-auto relative z-10">
        <div className="w-full max-w-lg">
          {/* Swipe hint */}
          <AnimatePresence>
            {currentStep === 0 && gender && (
              <motion.div
                className="fixed bottom-24 left-0 right-0 flex justify-center z-30 pointer-events-none"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.8, duration: 0.4 }}
              >
                <motion.div
                  className="flex items-center gap-2 bg-foreground/90 backdrop-blur-sm text-background px-4 py-2 rounded-full shadow-lg"
                  animate={{ x: [0, -8, 8, 0] }}
                  transition={{ duration: 1.8, repeat: 2, repeatDelay: 1, ease: "easeInOut" }}
                >
                  <span className="text-xs">←</span>
                  <span className="text-xs font-sans font-medium">Swipe to navigate</span>
                  <span className="text-xs">→</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait" custom={swipeDir} initial={false}>
            <motion.div
              key={currentStep}
              custom={swipeDir}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
                filter: { duration: 0.3 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.12}
              onDragEnd={(_, info) => {
                const threshold = 50;
                if (info.offset.x < -threshold && canProceed && !isGenerating) {
                  triggerHaptic();
                  setSwipeDir(1);
                  setCurrentStep((s) => s + 1);
                } else if (info.offset.x > threshold && currentStep > 0) {
                  triggerHaptic();
                  setSwipeDir(-1);
                  setCurrentStep((s) => s - 1);
                }
              }}
            >
              {isGenderStep ? (
                <GenderStep selected={gender} onSelect={setGender} />
              ) : currentStepData ? (
                <StepRenderer
                  step={currentStepData}
                  answers={answers}
                  onSelect={handleSelect}
                  gender={gender}
                  aiResults={aiResults}
                />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom button with premium animation */}
      <AnimatePresence>
        {!isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="sticky bottom-0 z-20 bg-gradient-to-t from-background via-background/95 to-transparent p-4 pt-8"
          >
            <motion.div
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Button
                onClick={() => { triggerHaptic(); setSwipeDir(1); setCurrentStep((s) => s + 1); }}
                disabled={!canProceed || loading}
                className={`w-full h-14 rounded-xl font-semibold font-sans text-base transition-all duration-300 ${
                  canProceed
                    ? currentStepData && ["notification", "selfieIntro", "selfieGuide"].includes(currentStepData.type)
                      ? "bg-primary text-primary-foreground shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.5)]"
                      : "bg-foreground text-background shadow-[0_4px_20px_-4px_hsl(var(--foreground)/0.3)]"
                    : "bg-muted text-muted-foreground"
                }`}
                variant="ghost"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                ) : currentStepData?.type === "selfieIntro" ? (
                  "CONTINUE"
                ) : (
                  <span className="flex items-center gap-2">
                    NEXT
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </motion.span>
                  </span>
                )}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Onboarding;
