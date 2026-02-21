import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Sparkles, Check } from "lucide-react";

interface StepProps {
  question: string;
  subtitle: string;
  options: string[];
  selected: string[];
  onSelect: (option: string) => void;
  multiSelect?: boolean;
}

const StepCard = ({ question, subtitle, options, selected, onSelect, multiSelect = true }: StepProps) => (
  <div>
    <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-2">{question}</h2>
    <p className="text-muted-foreground font-sans text-sm mb-8">{subtitle}</p>
    <div className="grid grid-cols-2 gap-3">
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            onClick={() => onSelect(option)}
            className={`relative p-4 rounded-xl border text-left font-sans text-sm transition-all ${
              isSelected
                ? "border-primary bg-primary/10 text-foreground"
                : "border-glass-border bg-secondary/50 text-muted-foreground hover:border-muted-foreground/50"
            }`}
          >
            {isSelected && <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />}
            {option}
          </button>
        );
      })}
    </div>
  </div>
);

const steps = [
  {
    question: "What's your style vibe?",
    subtitle: "Select all that resonate with you.",
    options: ["Minimalist", "Streetwear", "Classic", "Bold & Avant-Garde", "Bohemian", "Sporty", "Preppy", "Romantic"],
    key: "styles",
  },
  {
    question: "What occasions do you dress for?",
    subtitle: "Select your typical lifestyle contexts.",
    options: ["Corporate / Office", "Casual Everyday", "Social Events", "Fitness & Active", "Date Night", "Travel", "Creative / Artistic", "Formal / Black Tie"],
    key: "occasions",
  },
  {
    question: "Your go-to colors?",
    subtitle: "Pick the colors you gravitate toward.",
    options: ["Black & Dark Tones", "Neutrals & Earth", "Bold Primaries", "Pastels & Soft", "Jewel Tones", "Monochrome", "Warm Tones", "Cool Tones"],
    key: "colors",
  },
  {
    question: "What patterns do you prefer?",
    subtitle: "Choose your pattern preferences.",
    options: ["Solid / Plain", "Stripes", "Plaid / Check", "Floral", "Graphic / Print", "Abstract", "Animal Print", "Geometric"],
    key: "patterns",
  },
  {
    question: "What's your budget range?",
    subtitle: "Select the range that fits best.",
    options: ["Thrift & Budget", "Mid-Range", "Premium", "Luxury / Designer"],
    key: "budget",
    singleSelect: true,
  },
  {
    question: "Your body type?",
    subtitle: "This helps us recommend better fits.",
    options: ["Slim / Lean", "Athletic / Fit", "Average", "Curvy / Full", "Tall", "Petite"],
    key: "bodyType",
    singleSelect: true,
  },
  {
    question: "What are your fashion goals?",
    subtitle: "What do you want to achieve with your wardrobe?",
    options: ["Look more polished", "Build a capsule wardrobe", "Experiment more", "Dress for confidence", "Sustainable fashion", "Stay on trend", "Develop a signature look", "Save time getting dressed"],
    key: "goals",
  },
];

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSelect = (option: string) => {
    const key = steps[currentStep].key;
    const isSingle = (steps[currentStep] as any).singleSelect;
    setAnswers((prev) => {
      const current = prev[key] || [];
      if (isSingle) return { ...prev, [key]: [option] };
      if (current.includes(option)) return { ...prev, [key]: current.filter((o) => o !== option) };
      return { ...prev, [key]: [...current, option] };
    });
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Generate archetype from preferences
      const styleChoices = answers.styles || [];
      const archetype = styleChoices.length > 0
        ? `${styleChoices[0]} ${answers.occasions?.[0]?.split(" ")[0] || "Modern"} Style`
        : "Modern Classic Style";

      const { error } = await supabase
        .from("style_profiles")
        .update({
          preferences: answers,
          archetype,
          onboarding_completed: true,
          style_score: 25,
        })
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("Your Style DNA has been created!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const canProceed = (answers[step.key] || []).length > 0;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold-dark/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Progress bar */}
        <div className="flex gap-1.5 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${
                i <= currentStep ? "gold-gradient" : "bg-secondary"
              }`}
            />
          ))}
        </div>

        <p className="text-muted-foreground font-sans text-xs mb-4 uppercase tracking-wider">
          Step {currentStep + 1} of {steps.length}
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <StepCard
              question={step.question}
              subtitle={step.subtitle}
              options={step.options}
              selected={answers[step.key] || []}
              onSelect={handleSelect}
              multiSelect={!(step as any).singleSelect}
            />
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3 mt-8">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep((s) => s - 1)}
              className="border-glass-border font-sans"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <Button
            onClick={isLast ? handleComplete : () => setCurrentStep((s) => s + 1)}
            disabled={!canProceed || loading}
            className="flex-1 gold-gradient text-primary-foreground font-semibold font-sans"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : isLast ? (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate My Style DNA
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
