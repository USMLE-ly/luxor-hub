import { useState, useEffect } from "react";
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

const Onboarding = () => {
  const [gender, setGender] = useState<"female" | "male" | null>(null);
  const [currentStep, setCurrentStep] = useState(0); // 0 = gender step
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
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
      ? currentStepData.type === "notification" || currentStepData.type === "selfieIntro" || currentStepData.type === "selfieGuide"
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
          preferences: { ...cleanPrefs, aiAnalysis },
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm px-4 pt-4 pb-2">
        {currentStep > 0 && (
          <button onClick={() => setCurrentStep((s) => s - 1)} className="mb-2">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
        )}
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${
                i <= currentStep ? "bg-foreground" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-5 pt-8 pb-24 overflow-y-auto">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {isGenderStep ? (
                <GenderStep selected={gender} onSelect={setGender} />
              ) : currentStepData ? (
                <StepRenderer
                  step={currentStepData}
                  answers={answers}
                  onSelect={handleSelect}
                  gender={gender}
                />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom button - hide during generating */}
      {!isGenerating && (
        <div className="sticky bottom-0 z-20 bg-background/80 backdrop-blur-sm p-4">
          <Button
            onClick={() => setCurrentStep((s) => s + 1)}
            disabled={!canProceed || loading}
            className={`w-full h-14 rounded-xl font-semibold font-sans text-base ${
              currentStepData && ["notification", "selfieIntro", "selfieGuide"].includes(currentStepData.type)
                ? "bg-[hsl(0,70%,68%)] text-white hover:bg-[hsl(0,70%,62%)]"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
            variant="ghost"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
            ) : currentStepData?.type === "selfieIntro" ? (
              "CONTINUE"
            ) : (
              <>
                NEXT
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
