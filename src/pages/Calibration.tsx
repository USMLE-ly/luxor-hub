import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Check, Eye, Gift } from "lucide-react";
import SwipeParticles from "@/components/onboarding/SwipeParticles";
import { useGyroTilt } from "@/hooks/useGyroTilt";
import { haptic } from "@/lib/haptics";

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
import calShoeLoafers from "@/assets/cal-shoe-loafers-v2.jpg";
import calShoeChelsea from "@/assets/cal-shoe-chelsea-v2.jpg";
import calShoeSneakers from "@/assets/cal-shoe-sneakers-v2.jpg";
import calShoeDerby from "@/assets/cal-shoe-derby-v2.jpg";
import calSunglassesAviator from "@/assets/cal-sunglasses-aviator-v2.jpg";
import calSunglassesWayfarer from "@/assets/cal-sunglasses-wayfarer-v2.jpg";
import calSunglassesRound from "@/assets/cal-sunglasses-round-v2.jpg";
import calSunglassesSport from "@/assets/cal-sunglasses-sport-v2.jpg";
import calHatFedora from "@/assets/cal-hat-fedora.jpg";
import calHatBeanie from "@/assets/cal-hat-beanie.jpg";
import calHatCap from "@/assets/cal-hat-cap.jpg";
import calHatPanama from "@/assets/cal-hat-panama.jpg";

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
  phase: string;
}

const maleCalibrationSteps: CalibrationStep[] = [
  { question: "Which Jeans style do you prefer the most?", key: "jeansStyle", phase: "Bottoms",
    options: [
      { label: "Wide-leg", imageUrl: calJeansWide, style: "Casual" },
      { label: "Slim fit", imageUrl: calJeansSlim, style: "Casual" },
      { label: "Skinny", imageUrl: calJeansSkinny, style: "Casual" },
      { label: "Straight", imageUrl: calJeansStraight, style: "Casual" },
    ] },
  { question: "Which Trousers style do you prefer the most?", key: "trousersStyle", phase: "Bottoms",
    options: [
      { label: "Wide-leg", imageUrl: calTrousersWide, style: "Casual" },
      { label: "Straight", imageUrl: calTrousersStraight, style: "Casual" },
      { label: "Checked", imageUrl: calTrousersChecked, style: "Formal" },
      { label: "Tailored", imageUrl: calTrousersTailored, style: "Formal" },
    ] },
  { question: "Which Coat style do you prefer the most?", key: "coatStyle", phase: "Outerwear",
    options: [
      { label: "Double-breasted", imageUrl: calCoatDouble, style: "Formal" },
      { label: "Overcoat", imageUrl: calCoatOvercoat, style: "Formal" },
      { label: "Trench", imageUrl: calCoatTrench, style: "Formal" },
      { label: "Belted", imageUrl: calCoatBelted, style: "Casual" },
    ] },
  { question: "Which T-shirt style do you prefer the most?", key: "tshirtStyle", phase: "Tops",
    options: [
      { label: "Basic crew", imageUrl: calTshirtBasic, style: "Casual" },
      { label: "Graphic", imageUrl: calTshirtGraphic, style: "Casual" },
      { label: "V-neck", imageUrl: calTshirtVneck, style: "Casual" },
      { label: "Oversized", imageUrl: calTshirtOversized, style: "Casual" },
    ] },
  { question: "Which Shirt style do you prefer the most?", key: "shirtStyle", phase: "Tops",
    options: [
      { label: "Classic", imageUrl: calShirtClassic, style: "Formal" },
      { label: "Artsy", imageUrl: calShirtArtsy, style: "Casual" },
      { label: "Linen", imageUrl: calShirtLinen, style: "Casual" },
      { label: "Printed", imageUrl: calShirtPrinted, style: "Casual" },
    ] },
  { question: "Which Jacket style do you prefer the most?", key: "jacketStyle", phase: "Outerwear",
    options: [
      { label: "Biker", imageUrl: calJacketBiker, style: "Casual" },
      { label: "Bomber", imageUrl: calJacketBomber, style: "Casual" },
      { label: "Denim", imageUrl: calJacketDenim, style: "Casual" },
      { label: "Suede", imageUrl: calJacketSuede, style: "Formal" },
    ] },
  { question: "Which Footwear style do you prefer the most?", key: "footwearStyle", phase: "Shoes",
    options: [
      { label: "Loafers", imageUrl: calShoeLoafers, style: "Formal" },
      { label: "Chelsea boots", imageUrl: calShoeChelsea, style: "Formal" },
      { label: "Sneakers", imageUrl: calShoeSneakers, style: "Casual" },
      { label: "Derby shoes", imageUrl: calShoeDerby, style: "Formal" },
    ] },
  { question: "Which Sunglasses style do you prefer the most?", key: "sunglassesStyle", phase: "Accessories",
    options: [
      { label: "Aviator", imageUrl: calSunglassesAviator, style: "Casual" },
      { label: "Wayfarer", imageUrl: calSunglassesWayfarer, style: "Casual" },
      { label: "Round", imageUrl: calSunglassesRound, style: "Casual" },
      { label: "Sport", imageUrl: calSunglassesSport, style: "Casual" },
    ] },
  { question: "Which Hat style do you prefer the most?", key: "hatStyle", phase: "Accessories",
    options: [
      { label: "Fedora", imageUrl: calHatFedora, style: "Formal" },
      { label: "Beanie", imageUrl: calHatBeanie, style: "Casual" },
      { label: "Baseball cap", imageUrl: calHatCap, style: "Casual" },
      { label: "Panama", imageUrl: calHatPanama, style: "Formal" },
    ] },
];

const femaleCalibrationSteps: CalibrationStep[] = [
  { question: "Which Jeans style do you prefer the most?", key: "jeansStyle", phase: "Bottoms",
    options: [
      { label: "Wide-leg", imageUrl: calFJeansWide, style: "Casual" },
      { label: "Straight", imageUrl: calFJeansStraight, style: "Casual" },
      { label: "Flare", imageUrl: calFJeansFlare, style: "Casual" },
      { label: "Mom fit", imageUrl: calFJeansMom, style: "Casual" },
    ] },
  { question: "Which Pant style do you prefer the most?", key: "pantsStyle", phase: "Bottoms",
    options: [
      { label: "Tailored", imageUrl: calFPantsTailored, style: "Formal" },
      { label: "Wide-leg", imageUrl: calFPantsWide, style: "Casual" },
      { label: "Straight", imageUrl: calFPantsStraight, style: "Formal" },
      { label: "Feather-trim", imageUrl: calFPantsFeather, style: "Formal" },
    ] },
  { question: "Which Coat style do you prefer the most?", key: "coatStyle", phase: "Outerwear",
    options: [
      { label: "Trench", imageUrl: calFCoatTrench, style: "Formal" },
      { label: "Belted wrap", imageUrl: calFCoatBelted, style: "Formal" },
      { label: "Elegant", imageUrl: calFCoatElegant, style: "Formal" },
      { label: "Short coat", imageUrl: calFCoatShort, style: "Casual" },
    ] },
  { question: "Which T-shirt style do you prefer the most?", key: "tshirtStyle", phase: "Tops",
    options: [
      { label: "Ruffle detail", imageUrl: calFTshirtRuffle, style: "Casual" },
      { label: "Graphic", imageUrl: calFTshirtGraphic, style: "Casual" },
      { label: "Oversized", imageUrl: calFTshirtOversized, style: "Casual" },
      { label: "Gothic print", imageUrl: calFTshirtGothic, style: "Casual" },
    ] },
  { question: "Which Shirt style do you prefer the most?", key: "shirtStyle", phase: "Tops",
    options: [
      { label: "Ruffle", imageUrl: calFShirtRuffle, style: "Casual" },
      { label: "Classic", imageUrl: calFShirtClassic, style: "Formal" },
      { label: "Oxford stripe", imageUrl: calFShirtOxford, style: "Casual" },
      { label: "Sheer", imageUrl: calFShirtSheer, style: "Casual" },
    ] },
  { question: "Which Top style do you prefer the most?", key: "topStyle", phase: "Tops",
    options: [
      { label: "Camisole", imageUrl: calFTopCami, style: "Casual" },
      { label: "Ruffle", imageUrl: calFTopRuffle, style: "Casual" },
      { label: "Asymmetric", imageUrl: calFTopAsymmetric, style: "Casual" },
      { label: "Polo knit", imageUrl: calFTopPolo, style: "Casual" },
    ] },
  { question: "Which Dress style do you prefer the most?", key: "dressStyle", phase: "Dresses",
    options: [
      { label: "Midi", imageUrl: calFDressMidi, style: "Casual" },
      { label: "Maxi", imageUrl: calFDressMaxi, style: "Formal" },
      { label: "Mini", imageUrl: calFDressMini, style: "Formal" },
      { label: "Trench dress", imageUrl: calFDressTrench, style: "Casual" },
    ] },
  { question: "Which Skirt style do you prefer the most?", key: "skirtStyle", phase: "Dresses",
    options: [
      { label: "Mini", imageUrl: calFSkirtMini, style: "Casual" },
      { label: "Midi", imageUrl: calFSkirtMidi, style: "Formal" },
      { label: "Maxi", imageUrl: calFSkirtMaxi, style: "Casual" },
      { label: "Pleated", imageUrl: calFSkirtPleated, style: "Formal" },
    ] },
  { question: "Which Footwear style do you prefer the most?", key: "footwearStyle", phase: "Shoes",
    options: [
      { label: "Heels", imageUrl: calFShoeHeels, style: "Formal" },
      { label: "Flats", imageUrl: calFShoeFlats, style: "Casual" },
      { label: "Boots", imageUrl: calFShoeBoots, style: "Casual" },
      { label: "Sandals", imageUrl: calFShoeSandals, style: "Casual" },
    ] },
  { question: "Which Accessory do you gravitate towards?", key: "accessoryStyle", phase: "Accessories",
    options: [
      { label: "Bags", imageUrl: calFAccBag, style: "Casual" },
      { label: "Jewelry", imageUrl: calFAccJewelry, style: "Formal" },
      { label: "Scarves", imageUrl: calFAccScarf, style: "Casual" },
      { label: "Hats", imageUrl: calFAccHat, style: "Casual" },
    ] },
  { question: "Which Sunglasses style do you prefer the most?", key: "sunglassesStyle", phase: "Accessories",
    options: [
      { label: "Aviator", imageUrl: calFSunglassesAviator, style: "Casual" },
      { label: "Cat-eye", imageUrl: calFSunglassesCateye, style: "Formal" },
      { label: "Round", imageUrl: calFSunglassesRound, style: "Casual" },
      { label: "Oversized", imageUrl: calFSunglassesOversized, style: "Casual" },
    ] },
];

const styleTypes = [
  "Romantic-gamine", "Classic-natural", "Dramatic-classic", "Gamine-romantic",
  "Natural-dramatic", "Romantic-classic", "Classic-gamine", "Dramatic-natural",
];

const phaseMessages: Record<string, string> = {
  Bottoms: "Great taste in bottoms! Let's check outerwear next.",
  Outerwear: "Outerwear sorted! Now let's look at tops.",
  Tops: "Love your top picks! Time for shoes.",
  Shoes: "Nice footwear choices! Last up — accessories.",
  Dresses: "Beautiful dress taste! Now for shoes.",
  Accessories: "Almost done! Let's finalize your style.",
};

const pageVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "60%" : "-60%",
    opacity: 0,
    scale: 0.92,
    filter: "blur(6px)",
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
  },
  exit: (dir: number) => ({
    x: dir > 0 ? "-60%" : "60%",
    opacity: 0,
    scale: 0.92,
    filter: "blur(6px)",
  }),
};

const Calibration = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<"questions" | "interstitial" | "definingStyle" | "styleResult" | "progress">("questions");
  const [loading, setLoading] = useState(false);
  const [gender, setGender] = useState<"female" | "male">("male");
  const [styleType, setStyleType] = useState("");
  const [swipeDir, setSwipeDir] = useState(1);
  const [swipeVelocity, setSwipeVelocity] = useState({ x: 0, y: 0 });
  const [swipeTrigger, setSwipeTrigger] = useState(0);
  const [interstitialMsg, setInterstitialMsg] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const tilt = useGyroTilt();

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

  // Auto-transition from interstitial to questions
  useEffect(() => {
    if (phase === "interstitial") {
      const timer = setTimeout(() => {
        haptic("success");
        setPhase("questions");
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Confetti effect on progress screen
  useEffect(() => {
    if (phase !== "progress") return;
    const timer = setTimeout(() => {
      const canvas = document.createElement("canvas");
      canvas.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:100;pointer-events:none";
      document.body.appendChild(canvas);
      const ctx = canvas.getContext("2d")!;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const colors = ["hsl(142,60%,48%)", "hsl(43,74%,49%)", "#a855f7", "#fff", "hsl(270,60%,55%)"];
      const particles = Array.from({ length: 80 }, () => ({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height * 0.3,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 10 - 2,
        w: Math.random() * 8 + 4,
        h: Math.random() * 6 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 15,
        alpha: 1,
      }));

      let frame = 0;
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;
        particles.forEach(p => {
          p.vy += 0.25;
          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.rotSpeed;
          p.alpha = Math.max(0, p.alpha - 0.005);
          if (p.alpha <= 0) return;
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        });
        frame++;
        if (alive && frame < 200) requestAnimationFrame(animate);
        else { canvas.remove(); }
      };
      requestAnimationFrame(animate);
    }, 1800);
    return () => clearTimeout(timer);
  }, [phase]);

  const calibrationSteps = gender === "female" ? femaleCalibrationSteps : maleCalibrationSteps;
  const totalSteps = calibrationSteps.length;
  const currentStepData = calibrationSteps[currentStep];
  const canProceed = !!answers[currentStepData?.key];

  // Compute phase segments for segmented progress bar
  const phases = [...new Set(calibrationSteps.map(s => s.phase))];
  const phaseSegments = phases.map(p => {
    const stepsInPhase = calibrationSteps.filter(s => s.phase === p);
    const first = calibrationSteps.indexOf(stepsInPhase[0]);
    const last = calibrationSteps.indexOf(stepsInPhase[stepsInPhase.length - 1]);
    return { phase: p, first, last, count: stepsInPhase.length };
  });

  const handleSelect = (key: string, value: string) => {
    haptic("light");
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      haptic("medium");
      // Check if we're transitioning phases
      const currentPhase = calibrationSteps[currentStep].phase;
      const nextPhase = calibrationSteps[currentStep + 1].phase;
      if (currentPhase !== nextPhase && phaseMessages[currentPhase]) {
        setInterstitialMsg(phaseMessages[currentPhase]);
        setSwipeDir(1);
        setCurrentStep((s) => s + 1);
        setPhase("interstitial");
      } else {
        setSwipeDir(1);
        setCurrentStep((s) => s + 1);
      }
    } else {
      setPhase("definingStyle");
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      haptic("light");
      setSwipeDir(-1);
      setCurrentStep((s) => s - 1);
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

  // Phase interstitial screen
  if (phase === "interstitial") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-primary/8 blur-[80px]" />
        </div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 15 }}
          className="text-center relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
            className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-8 h-8 text-primary" />
          </motion.div>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-display text-lg font-bold text-foreground"
          >
            {interstitialMsg}
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // "Defining your Style Type..." loading screen
  if (phase === "definingStyle") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-primary/5 blur-[100px]" />
        </div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="w-20 h-20 mb-8 relative"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[hsl(15,80%,65%)] opacity-80" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[hsl(260,60%,70%)] opacity-80" />
          </motion.div>
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-primary/5 blur-[100px]" />
        </div>
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 20, delay: 0.1 }}
          className="w-full max-w-sm bg-card rounded-3xl shadow-xl p-6 border border-border"
        >
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute bottom-1/3 left-1/3 w-48 h-48 rounded-full bg-[hsl(142,60%,48%)]/5 blur-[80px]" />
        </div>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 14, delay: 0.2 }}
          className="relative w-32 h-32 mb-10"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            <svg viewBox="0 0 128 128" className="w-full h-full">
              <circle cx="64" cy="64" r="60" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" strokeDasharray="4 8" opacity="0.3" />
            </svg>
          </motion.div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", damping: 12 }}
            className="absolute inset-3 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, hsl(142,60%,48%), hsl(var(--primary)))",
              boxShadow: "0 0 40px hsl(142,60%,48%,0.3), 0 0 80px hsl(var(--primary)/0.15)",
            }}
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.7, type: "spring", stiffness: 300 }}
            >
              <Check className="w-12 h-12 text-white" strokeWidth={3} />
            </motion.div>
          </motion.div>
          {[0, 60, 120, 180, 240, 300].map((deg, i) => (
            <motion.div
              key={deg}
              className="absolute w-1.5 h-1.5 rounded-full bg-primary"
              style={{
                top: `${50 - 48 * Math.cos((deg * Math.PI) / 180)}%`,
                left: `${50 + 48 * Math.sin((deg * Math.PI) / 180)}%`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 0.8], opacity: [0, 1, 0.5] }}
              transition={{ delay: 0.8 + i * 0.1, duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
            />
          ))}
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="font-display text-2xl font-bold text-foreground mb-2 text-center"
        >
          Calibration in progress!
        </motion.h1>

        <motion.p
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground font-sans text-sm mb-8 text-center"
        >
          Your style profile is taking shape
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-sm mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="flex-1 h-12 rounded-2xl bg-card/60 backdrop-blur-sm overflow-hidden border border-border/30 relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "73%" }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.8 }}
                className="h-full rounded-2xl flex items-center justify-between px-4 relative overflow-hidden"
                style={{
                  background: "linear-gradient(90deg, hsl(142, 60%, 48%), hsl(var(--primary)))",
                }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }}
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 2.5, repeatDelay: 3 }}
                />
                <Check className="w-5 h-5 text-white relative z-10" strokeWidth={2.5} />
                <span className="text-sm font-bold text-white font-sans relative z-10">73%</span>
              </motion.div>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
              className="w-12 h-12 rounded-2xl flex items-center justify-center border border-border/30 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, hsl(var(--card)), hsl(var(--card)/0.6))" }}
            >
              <Gift className="w-5 h-5 text-primary relative z-10" />
              <motion.div
                className="absolute inset-0 bg-primary/10"
                animate={{ opacity: [0, 0.3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.8, type: "spring" }}
          className="px-5 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm mb-6"
        >
          <span className="text-sm font-semibold text-primary font-sans">🎉 73% Complete</span>
        </motion.div>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-muted-foreground font-sans text-center max-w-xs leading-relaxed text-sm"
        >
          Discover your Style Formula. Let's continue tomorrow — the more we know you, the better the results!
        </motion.p>

        <div className="fixed bottom-0 inset-x-0 p-5 bg-background/80 backdrop-blur-md border-t border-border/20">
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
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-primary/5 blur-[100px]"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Swipe particles canvas */}
      <SwipeParticles velocity={swipeVelocity} trigger={swipeTrigger} />

      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          {currentStep > 0 ? (
            <button onClick={handlePrev}>
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
          ) : (
            <button onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
          )}
          <h2 className="font-sans font-semibold text-foreground text-base">Calibration</h2>
          <span className="text-xs font-sans text-muted-foreground">{currentStep + 1}/{totalSteps}</span>
        </div>

        {/* Segmented phase progress bar */}
        <div className="flex gap-1 relative">
          {phaseSegments.map((seg, i) => {
            const segProgress = currentStep > seg.last
              ? 1
              : currentStep >= seg.first
              ? (currentStep - seg.first + (canProceed ? 1 : 0.5)) / seg.count
              : 0;
            return (
              <div key={seg.phase} className="flex-1 h-[5px] rounded-full bg-muted/60 overflow-hidden relative">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: "linear-gradient(90deg, hsl(142, 60%, 48%), hsl(var(--primary)))",
                  }}
                  initial={false}
                  animate={{ width: `${Math.min(segProgress * 100, 100)}%` }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                />
                {/* Shimmer */}
                {segProgress > 0 && segProgress < 1 && (
                  <motion.div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)" }}
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-1 px-0.5">
          {phaseSegments.map((seg) => (
            <span
              key={seg.phase}
              className={`text-[8px] font-sans ${
                currentStep >= seg.first ? "text-primary font-semibold" : "text-muted-foreground"
              }`}
            >
              {seg.phase}
            </span>
          ))}
        </div>
      </div>

      {/* Content with swipe */}
      <div className="flex-1 px-4 pt-4 pb-36">
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
              setSwipeVelocity({ x: info.velocity.x, y: info.velocity.y });
              setSwipeTrigger((t) => t + 1);
              const threshold = 50;
              if (info.offset.x < -threshold && canProceed) {
                haptic("medium");
                setSwipeDir(1);
                handleNext();
              } else if (info.offset.x > threshold && currentStep > 0) {
                haptic("light");
                setSwipeDir(-1);
                setCurrentStep((s) => s - 1);
              }
            }}
            style={{
              perspective: 800,
              transformStyle: "preserve-3d",
            }}
          >
            <motion.div
              style={{
                rotateX: tilt.rotateX,
                rotateY: tilt.rotateY,
              }}
            >
              <h2 className="font-display text-xl font-bold text-foreground text-center mb-6 px-2">
                {currentStepData.question}
              </h2>

              {/* 2x2 grid layout */}
              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                {currentStepData.options.map((option, index) => {
                  const isActive = answers[currentStepData.key] === option.label;
                  return (
                    <motion.button
                      key={option.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{
                        opacity: 1,
                        scale: isActive ? 1.05 : 1,
                      }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                      onClick={() => handleSelect(currentStepData.key, option.label)}
                      className="flex flex-col items-center gap-2"
                    >
                      <motion.div
                        className={`relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-secondary ${
                          isActive ? "ring-2 ring-primary shadow-[0_0_20px_hsl(var(--primary)/0.3)]" : ""
                        }`}
                        animate={{
                          boxShadow: isActive ? "0 8px 30px -8px hsl(var(--primary) / 0.4)" : "0 0 0 0 transparent",
                        }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        <img
                          src={option.imageUrl}
                          alt={option.label}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <AnimatePresence>
                          {isActive && (
                            <motion.div
                              className="absolute inset-0 bg-primary/10"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            />
                          )}
                        </AnimatePresence>
                        <div className="absolute bottom-2 right-2">
                          <motion.div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shadow-sm ${
                              isActive
                                ? "border-primary bg-primary"
                                : "border-white/80 bg-white/60 backdrop-blur-sm"
                            }`}
                            animate={{ scale: isActive ? [1, 1.3, 1] : 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            {isActive && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                              >
                                <Check className="w-3 h-3 text-white" />
                              </motion.div>
                            )}
                          </motion.div>
                        </div>
                      </motion.div>
                      <motion.span
                        className="font-sans text-xs font-medium"
                        animate={{
                          color: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                          scale: isActive ? 1.08 : 1,
                          fontWeight: isActive ? 700 : 500,
                        }}
                        transition={{ duration: 0.25 }}
                      >
                        {option.label}
                      </motion.span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom actions */}
      <div className="fixed bottom-0 inset-x-0 z-20 bg-background/80 backdrop-blur-md border-t border-border/20 p-4 space-y-2">
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
          {currentStep === totalSteps - 1 ? "FINISH" : "NEXT"}
          <motion.span
            className="ml-2 inline-flex"
            animate={canProceed ? { x: [0, 4, 0] } : {}}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowRight className="h-4 w-4" />
          </motion.span>
        </Button>
      </div>
    </div>
  );
};

export default Calibration;
