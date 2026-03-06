import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Check, Eye } from "lucide-react";

// Male calibration images
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
import calSunglassesAviator from "@/assets/cal-sunglasses-aviator.jpg";
import calSunglassesWayfarer from "@/assets/cal-sunglasses-wayfarer.jpg";
import calSunglassesRound from "@/assets/cal-sunglasses-round.jpg";
import calSunglassesSport from "@/assets/cal-sunglasses-sport.jpg";

// Female calibration images
import calFJeansWide from "@/assets/cal-f-jeans-wide.jpg";
import calFJeansStraight from "@/assets/cal-f-jeans-straight.jpg";
import calFJeansFlare from "@/assets/cal-f-jeans-flare.jpg";
import calFJeansMom from "@/assets/cal-f-jeans-mom.jpg";
import calFPantsTailored from "@/assets/cal-f-pants-tailored.jpg";
import calFPantsWide from "@/assets/cal-f-pants-wide.jpg";
import calFPantsStraight from "@/assets/cal-f-pants-straight.jpg";
import calFPantsFeather from "@/assets/cal-f-pants-feather.jpg";
import calFCoatTrench from "@/assets/cal-f-coat-trench.jpg";
import calFCoatBelted from "@/assets/cal-f-coat-belted.jpg";
import calFCoatElegant from "@/assets/cal-f-coat-elegant.jpg";
import calFCoatShort from "@/assets/cal-f-coat-short.jpg";
import calFTshirtRuffle from "@/assets/cal-f-tshirt-ruffle.jpg";
import calFTshirtGraphic from "@/assets/cal-f-tshirt-graphic.jpg";
import calFTshirtOversized from "@/assets/cal-f-tshirt-oversized.jpg";
import calFTshirtGothic from "@/assets/cal-f-tshirt-gothic.jpg";
import calFShirtRuffle from "@/assets/cal-f-shirt-ruffle.jpg";
import calFShirtClassic from "@/assets/cal-f-shirt-classic.jpg";
import calFShirtOxford from "@/assets/cal-f-shirt-oxford.jpg";
import calFShirtSheer from "@/assets/cal-f-shirt-sheer.jpg";
import calFTopCami from "@/assets/cal-f-top-cami.jpg";
import calFTopRuffle from "@/assets/cal-f-top-ruffle.jpg";
import calFTopAsymmetric from "@/assets/cal-f-top-asymmetric.jpg";
import calFTopPolo from "@/assets/cal-f-top-polo.jpg";
import calFDressMidi from "@/assets/cal-f-dress-midi.jpg";
import calFDressMaxi from "@/assets/cal-f-dress-maxi.jpg";
import calFDressMini from "@/assets/cal-f-dress-mini.jpg";
import calFDressTrench from "@/assets/cal-f-dress-trench.jpg";
import calFShoeHeels from "@/assets/cal-f-shoe-heels.jpg";
import calFShoeFlats from "@/assets/cal-f-shoe-flats.jpg";
import calFShoeBoots from "@/assets/cal-f-shoe-boots.jpg";
import calFShoeSandals from "@/assets/cal-f-shoe-sandals.jpg";
import calFSkirtMini from "@/assets/cal-f-skirt-mini.jpg";
import calFSkirtMidi from "@/assets/cal-f-skirt-midi.jpg";
import calFSkirtMaxi from "@/assets/cal-f-skirt-maxi.jpg";
import calFSkirtPleated from "@/assets/cal-f-skirt-pleated.jpg";
import calFAccBag from "@/assets/cal-f-acc-bag.jpg";
import calFAccJewelry from "@/assets/cal-f-acc-jewelry.jpg";
import calFAccScarf from "@/assets/cal-f-acc-scarf.jpg";
import calFAccHat from "@/assets/cal-f-acc-hat.jpg";
import calFSunglassesAviator from "@/assets/cal-f-sunglasses-aviator.jpg";
import calFSunglassesCateye from "@/assets/cal-f-sunglasses-cateye.jpg";
import calFSunglassesRound from "@/assets/cal-f-sunglasses-round.jpg";
import calFSunglassesOversized from "@/assets/cal-f-sunglasses-oversized.jpg";

// Style inspiration images
import styleInspo1 from "@/assets/style-inspo-1.jpg";
import styleInspo2 from "@/assets/style-inspo-2.jpg";
import styleInspo3 from "@/assets/style-inspo-3.jpg";

interface CalibrationOption {
  label: string;
  imageUrl: string;
  style: "Casual" | "Formal";
}

interface CalibrationStep {
  question: string;
  key: string;
  options: CalibrationOption[];
}

const maleCalibrationSteps: CalibrationStep[] = [
  {
    question: "Which Jeans style do you prefer the most?",
    key: "jeansStyle",
    options: [
      { label: "Wide-leg", imageUrl: calJeansWide, style: "Casual" },
      { label: "Slim fit", imageUrl: calJeansSlim, style: "Casual" },
      { label: "Skinny", imageUrl: calJeansSkinny, style: "Casual" },
      { label: "Straight", imageUrl: calJeansStraight, style: "Casual" },
    ],
  },
  {
    question: "Which Trousers style do you prefer the most?",
    key: "trousersStyle",
    options: [
      { label: "Wide-leg", imageUrl: calTrousersWide, style: "Casual" },
      { label: "Straight", imageUrl: calTrousersStraight, style: "Casual" },
      { label: "Checked", imageUrl: calTrousersChecked, style: "Formal" },
      { label: "Tailored", imageUrl: calTrousersTailored, style: "Formal" },
    ],
  },
  {
    question: "Which Coat style do you prefer the most?",
    key: "coatStyle",
    options: [
      { label: "Double-breasted", imageUrl: calCoatDouble, style: "Formal" },
      { label: "Overcoat", imageUrl: calCoatOvercoat, style: "Formal" },
      { label: "Trench", imageUrl: calCoatTrench, style: "Formal" },
      { label: "Belted", imageUrl: calCoatBelted, style: "Casual" },
    ],
  },
  {
    question: "Which T-shirt style do you prefer the most?",
    key: "tshirtStyle",
    options: [
      { label: "Basic crew", imageUrl: calTshirtBasic, style: "Casual" },
      { label: "Graphic", imageUrl: calTshirtGraphic, style: "Casual" },
      { label: "V-neck", imageUrl: calTshirtVneck, style: "Casual" },
      { label: "Oversized", imageUrl: calTshirtOversized, style: "Casual" },
    ],
  },
  {
    question: "Which Shirt style do you prefer the most?",
    key: "shirtStyle",
    options: [
      { label: "Classic", imageUrl: calShirtClassic, style: "Formal" },
      { label: "Artsy", imageUrl: calShirtArtsy, style: "Casual" },
      { label: "Linen", imageUrl: calShirtLinen, style: "Casual" },
      { label: "Printed", imageUrl: calShirtPrinted, style: "Casual" },
    ],
  },
  {
    question: "Which Jacket style do you prefer the most?",
    key: "jacketStyle",
    options: [
      { label: "Biker", imageUrl: calJacketBiker, style: "Casual" },
      { label: "Bomber", imageUrl: calJacketBomber, style: "Casual" },
      { label: "Denim", imageUrl: calJacketDenim, style: "Casual" },
      { label: "Suede", imageUrl: calJacketSuede, style: "Formal" },
    ],
  },
  {
    question: "Which Footwear style do you prefer the most?",
    key: "footwearStyle",
    options: [
      { label: "Loafers", imageUrl: calShoeLoafers, style: "Formal" },
      { label: "Chelsea boots", imageUrl: calShoeChelsea, style: "Formal" },
      { label: "Sneakers", imageUrl: calShoeSneakers, style: "Casual" },
      { label: "Derby shoes", imageUrl: calShoeDerby, style: "Formal" },
    ],
  },
  {
    question: "Which Sunglasses style do you prefer the most?",
    key: "sunglassesStyle",
    options: [
      { label: "Aviator", imageUrl: calSunglassesAviator, style: "Casual" },
      { label: "Wayfarer", imageUrl: calSunglassesWayfarer, style: "Casual" },
      { label: "Round", imageUrl: calSunglassesRound, style: "Casual" },
      { label: "Sport", imageUrl: calSunglassesSport, style: "Casual" },
    ],
  },
];

const femaleCalibrationSteps: CalibrationStep[] = [
  {
    question: "Which Jeans style do you prefer the most?",
    key: "jeansStyle",
    options: [
      { label: "Wide-leg", imageUrl: calFJeansWide, style: "Casual" },
      { label: "Straight", imageUrl: calFJeansStraight, style: "Casual" },
      { label: "Flare", imageUrl: calFJeansFlare, style: "Casual" },
      { label: "Mom fit", imageUrl: calFJeansMom, style: "Casual" },
    ],
  },
  {
    question: "Which Pant style do you prefer the most?",
    key: "pantsStyle",
    options: [
      { label: "Tailored", imageUrl: calFPantsTailored, style: "Formal" },
      { label: "Wide-leg", imageUrl: calFPantsWide, style: "Casual" },
      { label: "Straight", imageUrl: calFPantsStraight, style: "Formal" },
      { label: "Feather-trim", imageUrl: calFPantsFeather, style: "Formal" },
    ],
  },
  {
    question: "Which Coat style do you prefer the most?",
    key: "coatStyle",
    options: [
      { label: "Trench", imageUrl: calFCoatTrench, style: "Formal" },
      { label: "Belted wrap", imageUrl: calFCoatBelted, style: "Formal" },
      { label: "Elegant", imageUrl: calFCoatElegant, style: "Formal" },
      { label: "Short coat", imageUrl: calFCoatShort, style: "Casual" },
    ],
  },
  {
    question: "Which T-shirt style do you prefer the most?",
    key: "tshirtStyle",
    options: [
      { label: "Ruffle detail", imageUrl: calFTshirtRuffle, style: "Casual" },
      { label: "Graphic", imageUrl: calFTshirtGraphic, style: "Casual" },
      { label: "Oversized", imageUrl: calFTshirtOversized, style: "Casual" },
      { label: "Gothic print", imageUrl: calFTshirtGothic, style: "Casual" },
    ],
  },
  {
    question: "Which Shirt style do you prefer the most?",
    key: "shirtStyle",
    options: [
      { label: "Ruffle", imageUrl: calFShirtRuffle, style: "Casual" },
      { label: "Classic", imageUrl: calFShirtClassic, style: "Formal" },
      { label: "Oxford stripe", imageUrl: calFShirtOxford, style: "Casual" },
      { label: "Sheer", imageUrl: calFShirtSheer, style: "Casual" },
    ],
  },
  {
    question: "Which Top style do you prefer the most?",
    key: "topStyle",
    options: [
      { label: "Camisole", imageUrl: calFTopCami, style: "Casual" },
      { label: "Ruffle", imageUrl: calFTopRuffle, style: "Casual" },
      { label: "Asymmetric", imageUrl: calFTopAsymmetric, style: "Casual" },
      { label: "Polo knit", imageUrl: calFTopPolo, style: "Casual" },
    ],
  },
  {
    question: "Which Dress style do you prefer the most?",
    key: "dressStyle",
    options: [
      { label: "Midi", imageUrl: calFDressMidi, style: "Casual" },
      { label: "Maxi", imageUrl: calFDressMaxi, style: "Formal" },
      { label: "Mini", imageUrl: calFDressMini, style: "Formal" },
      { label: "Trench dress", imageUrl: calFDressTrench, style: "Casual" },
    ],
  },
  {
    question: "Which Skirt style do you prefer the most?",
    key: "skirtStyle",
    options: [
      { label: "Mini", imageUrl: calFSkirtMini, style: "Casual" },
      { label: "Midi", imageUrl: calFSkirtMidi, style: "Formal" },
      { label: "Maxi", imageUrl: calFSkirtMaxi, style: "Casual" },
      { label: "Pleated", imageUrl: calFSkirtPleated, style: "Formal" },
    ],
  },
  {
    question: "Which Footwear style do you prefer the most?",
    key: "footwearStyle",
    options: [
      { label: "Heels", imageUrl: calFShoeHeels, style: "Formal" },
      { label: "Flats", imageUrl: calFShoeFlats, style: "Casual" },
      { label: "Boots", imageUrl: calFShoeBoots, style: "Casual" },
      { label: "Sandals", imageUrl: calFShoeSandals, style: "Casual" },
    ],
  },
  {
    question: "Which Accessory do you gravitate towards?",
    key: "accessoryStyle",
    options: [
      { label: "Bags", imageUrl: calFAccBag, style: "Casual" },
      { label: "Jewelry", imageUrl: calFAccJewelry, style: "Formal" },
      { label: "Scarves", imageUrl: calFAccScarf, style: "Casual" },
      { label: "Hats", imageUrl: calFAccHat, style: "Casual" },
    ],
  },
  {
    question: "Which Sunglasses style do you prefer the most?",
    key: "sunglassesStyle",
    options: [
      { label: "Aviator", imageUrl: calFSunglassesAviator, style: "Casual" },
      { label: "Cat-eye", imageUrl: calFSunglassesCateye, style: "Formal" },
      { label: "Round", imageUrl: calFSunglassesRound, style: "Casual" },
      { label: "Oversized", imageUrl: calFSunglassesOversized, style: "Casual" },
    ],
  },
];

const styleTypes = [
  "Romantic-gamine", "Classic-natural", "Dramatic-classic", "Gamine-romantic",
  "Natural-dramatic", "Romantic-classic", "Classic-gamine", "Dramatic-natural",
];

const Calibration = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<"questions" | "definingStyle" | "styleResult" | "progress">("questions");
  const [loading, setLoading] = useState(false);
  const [gender, setGender] = useState<"female" | "male">("male");
  const [styleType, setStyleType] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load gender from style profile
  useEffect(() => {
    if (!user) return;
    const loadGender = async () => {
      const { data } = await supabase
        .from("style_profiles")
        .select("preferences")
        .eq("user_id", user.id)
        .single();
      const prefs = data?.preferences as any;
      if (prefs?.gender === "female" || prefs?.gender === "male") {
        setGender(prefs.gender);
      }
    };
    loadGender();
  }, [user]);

  // Auto-transition from definingStyle to styleResult
  useEffect(() => {
    if (phase === "definingStyle") {
      const randomType = styleTypes[Math.floor(Math.random() * styleTypes.length)];
      const timer = setTimeout(() => {
        setStyleType(randomType);
        setPhase("styleResult");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const calibrationSteps = gender === "female" ? femaleCalibrationSteps : maleCalibrationSteps;
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
      setPhase("definingStyle");
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
          preferences: { ...currentPrefs, calibration: answers, calibrationProgress: 73, styleType },
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

  const selectedOption = currentStepData?.options.find(
    (o) => o.label === answers[currentStepData?.key]
  );

  // "Defining your Style Type..." loading screen
  if (phase === "definingStyle") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="w-20 h-20 mb-8 relative"
        >
          {/* Two overlapping circles like reference */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[hsl(15,80%,65%)] opacity-80" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[hsl(260,60%,70%)] opacity-80" />
          </motion.div>
          {/* Icons overlay */}
          <div className="absolute inset-0 flex items-center justify-center gap-0.5 z-10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground">
              <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" />
            </svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground">
              <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="4 2" />
            </svg>
          </div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-sans text-lg text-foreground"
        >
          Defining your Style Type...
        </motion.p>
        {/* Subtle pulsing dots */}
        <div className="flex gap-1.5 mt-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              className="w-2 h-2 rounded-full bg-foreground/40"
            />
          ))}
        </div>
      </div>
    );
  }

  // Style Type result card
  if (phase === "styleResult") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 20, delay: 0.1 }}
          className="w-full max-w-sm bg-card rounded-3xl shadow-xl p-6 border border-border"
        >
          {/* Icon pair */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-1">
              <div className="w-9 h-9 rounded-full bg-[hsl(15,80%,65%)] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M4 4l6 6M10 4L4 10M14 14l6 6M20 14l-6 6" />
                </svg>
              </div>
              <div className="w-9 h-9 rounded-full bg-[hsl(340,70%,70%)] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <rect x="4" y="4" width="16" height="16" rx="2" strokeDasharray="4 2" />
                </svg>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground font-sans mb-1">Your Style type</p>
          <h2 className="text-center text-2xl font-display font-bold text-foreground mb-5">{styleType}</h2>

          {/* Style inspiration images */}
          <div className="flex gap-2 mb-5">
            {[styleInspo1, styleInspo2, styleInspo3].map((src, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex-1 aspect-[3/4] rounded-xl overflow-hidden relative"
              >
                <img src={src} alt={`Style inspiration ${i + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" />
              </motion.div>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground font-sans leading-relaxed">
            Congratulations! Now you know exactly which prints and fabrics flatter you.
          </p>
        </motion.div>

        <div className="fixed bottom-0 inset-x-0 p-5 bg-background">
          <Button
            onClick={handleComplete}
            disabled={loading}
            className="w-full h-14 rounded-2xl font-semibold font-sans text-base bg-foreground text-background hover:bg-foreground/90"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
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
      <div className="min-h-screen bg-background flex flex-col items-center px-6 pt-16">
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 12, delay: 0.2 }}
          className="w-28 h-28 mb-8 rounded-full border-4 border-primary flex items-center justify-center"
        >
          <motion.div
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Check className="w-14 h-14 text-primary" strokeWidth={3} />
          </motion.div>
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
            <div className="flex-1 h-10 rounded-full bg-secondary/80 overflow-hidden border border-border/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "73%" }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.6 }}
                className="h-full rounded-full flex items-center justify-between px-4"
                style={{
                  background: "linear-gradient(90deg, hsl(142, 60%, 48%), hsl(var(--primary)))",
                }}
              >
                <Check className="w-5 h-5 text-primary-foreground" />
                <span className="text-sm font-bold text-primary-foreground">73%</span>
              </motion.div>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-border/50 flex items-center justify-center">
              <Gift className="w-5 h-5 text-primary" />
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

        <div className="fixed bottom-0 inset-x-0 p-5 bg-background">
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
      <div className="flex-1 px-4 pt-6 pb-36">
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

            {/* 3+1 grid layout matching reference */}
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
              {currentStepData.options.slice(0, 3).map((option, index) => {
                const isActive = answers[currentStepData.key] === option.label;
                return (
                  <motion.button
                    key={option.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => handleSelect(currentStepData.key, option.label)}
                    className="flex flex-col items-center"
                  >
                    <div
                      className={`relative w-full aspect-[3/4] rounded-xl overflow-hidden transition-all bg-secondary ${
                        isActive ? "ring-2 ring-primary shadow-lg" : ""
                      }`}
                    >
                      <img
                        src={option.imageUrl}
                        alt={option.label}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute bottom-2 right-2">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shadow-sm transition-all ${
                            isActive
                              ? "border-primary bg-primary"
                              : "border-white/80 bg-white/60 backdrop-blur-sm"
                          }`}
                        >
                          {isActive && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
            {/* 4th item centered below */}
            {currentStepData.options[3] && (
              <div className="flex justify-center mt-3 max-w-md mx-auto">
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => handleSelect(currentStepData.key, currentStepData.options[3].label)}
                  className="flex flex-col items-center"
                  style={{ width: "calc(33.333% - 4px)" }}
                >
                  <div
                    className={`relative w-full aspect-[3/4] rounded-xl overflow-hidden transition-all bg-secondary ${
                      answers[currentStepData.key] === currentStepData.options[3].label
                        ? "ring-2 ring-primary shadow-lg"
                        : ""
                    }`}
                  >
                    <img
                      src={currentStepData.options[3].imageUrl}
                      alt={currentStepData.options[3].label}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute bottom-2 right-2">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shadow-sm transition-all ${
                          answers[currentStepData.key] === currentStepData.options[3].label
                            ? "border-primary bg-primary"
                            : "border-white/80 bg-white/60 backdrop-blur-sm"
                        }`}
                      >
                        {answers[currentStepData.key] === currentStepData.options[3].label && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom actions */}
      <div className="fixed bottom-0 inset-x-0 z-20 bg-background border-t border-border p-4 space-y-2">
        {canProceed && selectedOption && (
          <Button
            onClick={() => navigate("/closet")}
            variant="outline"
            className="w-full h-12 rounded-2xl font-sans text-sm border-border"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview on me
          </Button>
        )}
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
