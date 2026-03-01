import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";

interface CalibrationStep {
  question: string;
  key: string;
  options: { label: string; imageUrl: string }[];
}

// Using reliable, high-quality product images from picsum and placeholder services
const calibrationSteps: CalibrationStep[] = [
  {
    question: "Which Trousers style do you prefer the most?",
    key: "trousersStyle",
    options: [
      { label: "Wide-leg", imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=300&h=400&fit=crop&crop=center" },
      { label: "Straight", imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=400&fit=crop&crop=center" },
      { label: "Checked", imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=400&fit=crop&crop=center" },
      { label: "Tailored", imageUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=300&h=400&fit=crop&crop=center" },
    ],
  },
  {
    question: "Which Coat style do you prefer the most?",
    key: "coatStyle",
    options: [
      { label: "Double-breasted", imageUrl: "https://images.unsplash.com/photo-1544923246-77307dd270cf?w=300&h=400&fit=crop&crop=center" },
      { label: "Overcoat", imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&h=400&fit=crop&crop=center" },
      { label: "Trench", imageUrl: "https://images.unsplash.com/photo-1608063615781-e2ef8c73d114?w=300&h=400&fit=crop&crop=center" },
      { label: "Belted", imageUrl: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=300&h=400&fit=crop&crop=center" },
    ],
  },
  {
    question: "Which T-shirt style do you prefer the most?",
    key: "tshirtStyle",
    options: [
      { label: "Basic crew", imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=400&fit=crop&crop=center" },
      { label: "Graphic", imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&h=400&fit=crop&crop=center" },
      { label: "V-neck", imageUrl: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=300&h=400&fit=crop&crop=center" },
      { label: "Oversized", imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=300&h=400&fit=crop&crop=center" },
    ],
  },
  {
    question: "Which Shirt style do you prefer the most?",
    key: "shirtStyle",
    options: [
      { label: "Classic", imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300&h=400&fit=crop&crop=center" },
      { label: "Artsy", imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=400&fit=crop&crop=center" },
      { label: "Linen", imageUrl: "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=300&h=400&fit=crop&crop=center" },
      { label: "Printed", imageUrl: "https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?w=300&h=400&fit=crop&crop=center" },
    ],
  },
  {
    question: "Which Jacket style do you prefer the most?",
    key: "jacketStyle",
    options: [
      { label: "Biker", imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=400&fit=crop&crop=center" },
      { label: "Bomber", imageUrl: "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=300&h=400&fit=crop&crop=center" },
      { label: "Denim", imageUrl: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=300&h=400&fit=crop&crop=center" },
      { label: "Suede", imageUrl: "https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=300&h=400&fit=crop&crop=center" },
    ],
  },
  {
    question: "Which Jeans style do you prefer the most?",
    key: "jeansStyle",
    options: [
      { label: "Slim fit", imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=300&h=400&fit=crop&crop=center" },
      { label: "Straight", imageUrl: "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=300&h=400&fit=crop&crop=center" },
      { label: "Wide-leg", imageUrl: "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=300&h=400&fit=crop&crop=center" },
      { label: "Skinny", imageUrl: "https://images.unsplash.com/photo-1475178626620-a4d074967571?w=300&h=400&fit=crop&crop=center" },
    ],
  },
  {
    question: "Which Footwear style do you prefer the most?",
    key: "footwearStyle",
    options: [
      { label: "Loafers", imageUrl: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=300&h=400&fit=crop&crop=center" },
      { label: "Chelsea boots", imageUrl: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=300&h=400&fit=crop&crop=center" },
      { label: "Sneakers", imageUrl: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=300&h=400&fit=crop&crop=center" },
      { label: "Derby shoes", imageUrl: "https://images.unsplash.com/photo-1614252234498-1ab7ec5b1e7c?w=300&h=400&fit=crop&crop=center" },
    ],
  },
];

const Calibration = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<"questions" | "allSet" | "progress">("questions");
  const [loading, setLoading] = useState(false);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());
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

  // Color map for fallback backgrounds
  const categoryColors: Record<string, string> = {
    trousersStyle: "hsl(220,10%,85%)",
    coatStyle: "hsl(30,30%,80%)",
    tshirtStyle: "hsl(0,0%,88%)",
    shirtStyle: "hsl(210,40%,90%)",
    jacketStyle: "hsl(20,20%,75%)",
    jeansStyle: "hsl(215,40%,75%)",
    footwearStyle: "hsl(25,15%,78%)",
  };

  if (phase === "allSet") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-20 h-20 rounded-full border-[3px] border-[hsl(0,70%,68%)] flex items-center justify-center mb-8"
        >
          <Check className="w-8 h-8 text-[hsl(0,70%,68%)]" />
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
        {/* Progress bar - matches the reference exactly */}
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

            {/* Horizontal scroll like the reference app */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
              {currentStepData.options.map((option) => {
                const isActive = answers[currentStepData.key] === option.label;
                const hasError = imgErrors.has(`${currentStep}-${option.label}`);
                return (
                  <button
                    key={option.label}
                    onClick={() => handleSelect(currentStepData.key, option.label)}
                    className="flex-shrink-0 flex flex-col items-center"
                    style={{ width: "calc(25% - 6px)", minWidth: "80px" }}
                  >
                    <div
                      className={`relative w-full aspect-[3/4] rounded-lg overflow-hidden mb-1.5 transition-all ${
                        isActive ? "ring-2 ring-[hsl(43,74%,49%)]" : ""
                      }`}
                      style={{ backgroundColor: hasError ? categoryColors[currentStepData.key] : "hsl(0,0%,93%)" }}
                    >
                      {!hasError ? (
                        <img
                          src={option.imageUrl}
                          alt={option.label}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={() => setImgErrors(prev => new Set(prev).add(`${currentStep}-${option.label}`))}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xs text-muted-foreground font-sans text-center px-1">{option.label}</span>
                        </div>
                      )}
                      {/* Radio button at bottom-right like the reference */}
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

      {/* Bottom button - matches reference with light gray background */}
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
