import { r as reactExports, e as useNavigate, j as jsxRuntimeExports } from "./index-CqA86RF3.js";
import { e as useAuth, h as haptic, B as Button, s as supabase } from "./AppContent-h4IlOpH8.js";
import { t as toast } from "./index-J9_vYcP0.js";
import { u as useGyroTilt, S as SwipeParticles } from "./useGyroTilt-Cen3QcK3.js";
import { e as calFJeansFlare, d as calFPantsTailored, b as calFCoatBelted, c as calFShirtClassic, a as calFTopCami, l as calFDressMidi, m as calFDressMini, f as calFSkirtMidi, g as calFShoeHeels, h as calFShoeBoots, i as calFAccBag, j as calFAccJewelry, k as calFSunglassesCateye } from "./cal-f-sunglasses-cateye-C5TrJiZ9.js";
import { m as motion } from "./proxy-ShtysCL3.js";
import { C as Check } from "./check-DTG3tuFV.js";
import { A as ArrowRight } from "./arrow-right-B1HpFnXV.js";
import { G as Gift } from "./gift-B0m0HZ9l.js";
import { A as ArrowLeft } from "./arrow-left-Cr_yeBaS.js";
import { A as AnimatePresence } from "./index-CwmenB4e.js";
import { E as Eye } from "./eye-BqpQG6MH.js";
const calTrousersWide = "/assets/cal-trousers-wide-neVQ8gYH.jpg";
const calTrousersStraight = "/assets/cal-trousers-straight-4V5HRhHU.jpg";
const calTrousersChecked = "/assets/cal-trousers-checked-Co3PF6SX.jpg";
const calTrousersTailored = "/assets/cal-trousers-tailored-HDUV_Ql5.jpg";
const calCoatDouble = "/assets/cal-coat-double-BP-7JJKe.jpg";
const calCoatOvercoat = "/assets/cal-coat-overcoat-BMf9o0LO.jpg";
const calCoatTrench = "/assets/cal-coat-trench-C5prJALB.jpg";
const calCoatBelted = "/assets/cal-coat-belted-DPYdra2D.jpg";
const calTshirtBasic = "/assets/cal-tshirt-basic-7yMEVNRQ.jpg";
const calTshirtGraphic = "/assets/cal-tshirt-graphic-C7NYwvdV.jpg";
const calTshirtVneck = "/assets/cal-tshirt-vneck-D30ctjyu.jpg";
const calTshirtOversized = "/assets/cal-tshirt-oversized-B-n5j3UH.jpg";
const calShirtClassic = "/assets/cal-shirt-classic-BhlxnoJm.jpg";
const calShirtArtsy = "/assets/cal-shirt-artsy-CYBXP-p3.jpg";
const calShirtLinen = "/assets/cal-shirt-linen-CI5BAqlX.jpg";
const calShirtPrinted = "/assets/cal-shirt-printed-DlHCv7hI.jpg";
const calJacketBiker = "/assets/cal-jacket-biker-D3OwSp9l.jpg";
const calJacketBomber = "/assets/cal-jacket-bomber-C1az7Ism.jpg";
const calJacketDenim = "/assets/cal-jacket-denim-BKVa8r17.jpg";
const calJacketSuede = "/assets/cal-jacket-suede-KyvOoQhd.jpg";
const calJeansSlim = "/assets/cal-jeans-slim-Bagky418.jpg";
const calJeansStraight = "/assets/cal-jeans-straight-DQfkDqYd.jpg";
const calJeansWide = "/assets/cal-jeans-wide-BctZ-GJP.jpg";
const calJeansSkinny = "/assets/cal-jeans-skinny-BYluYEg1.jpg";
const calShoeLoafers = "/assets/cal-shoe-loafers-v2-B2Br-jTR.jpg";
const calShoeChelsea = "/assets/cal-shoe-chelsea-v2-C9EjXVRx.jpg";
const calShoeSneakers = "/assets/cal-shoe-sneakers-v2-zG83R_ET.jpg";
const calShoeDerby = "/assets/cal-shoe-derby-v2-PJVo0a11.jpg";
const calSunglassesAviator = "/assets/cal-sunglasses-aviator-v2-vbK2oLkn.jpg";
const calSunglassesWayfarer = "/assets/cal-sunglasses-wayfarer-v2-CkyY7LTO.jpg";
const calSunglassesRound = "/assets/cal-sunglasses-round-v2-B46gBhVp.jpg";
const calSunglassesSport = "/assets/cal-sunglasses-sport-v2-ybqxEG7t.jpg";
const calHatFedora = "/assets/cal-hat-fedora-DMRZIpnJ.jpg";
const calHatBeanie = "/assets/cal-hat-beanie-IEZ9nFpp.jpg";
const calHatCap = "/assets/cal-hat-cap-JRSlKPgE.jpg";
const calHatPanama = "/assets/cal-hat-panama-5fZVU39v.jpg";
const calFJeansWide = "/assets/cal-f-jeans-wide-C9eE9Vte.jpg";
const calFJeansStraight = "/assets/cal-f-jeans-straight-1-Z8DVzv.jpg";
const calFJeansMom = "/assets/cal-f-jeans-mom-DsADE-c1.jpg";
const calFPantsWide = "/assets/cal-f-pants-wide-xVEW9Frk.jpg";
const calFPantsStraight = "/assets/cal-f-pants-straight-CK2KeThu.jpg";
const calFPantsFeather = "/assets/cal-f-pants-feather-DU8GgRBV.jpg";
const calFCoatTrench = "/assets/cal-f-coat-trench-D8Imndhw.jpg";
const calFCoatElegant = "/assets/cal-f-coat-elegant-B2Kr4lwh.jpg";
const calFCoatShort = "/assets/cal-f-coat-short-CttAJqRG.jpg";
const calFTshirtRuffle = "/assets/cal-f-tshirt-ruffle-BY45KeXK.jpg";
const calFTshirtGraphic = "/assets/cal-f-tshirt-graphic-BZtwE72s.jpg";
const calFTshirtOversized = "/assets/cal-f-tshirt-oversized-CtbSeg2l.jpg";
const calFTshirtGothic = "/assets/cal-f-tshirt-gothic-BnrEV_QT.jpg";
const calFShirtRuffle = "/assets/cal-f-shirt-ruffle-0ZVZRdPD.jpg";
const calFShirtOxford = "/assets/cal-f-shirt-oxford-DEzWAiYF.jpg";
const calFShirtSheer = "/assets/cal-f-shirt-sheer-CaDlPtC1.jpg";
const calFTopRuffle = "/assets/cal-f-top-ruffle-D1TkErBv.jpg";
const calFTopAsymmetric = "/assets/cal-f-top-asymmetric-BiEvQlQe.jpg";
const calFTopPolo = "/assets/cal-f-top-polo-BKqs94nm.jpg";
const calFDressMaxi = "/assets/cal-f-dress-maxi-CQMEWUnm.jpg";
const calFDressTrench = "/assets/cal-f-dress-trench-C5GAcUqZ.jpg";
const calFShoeFlats = "/assets/cal-f-shoe-flats-BhiTCqz7.jpg";
const calFShoeSandals = "/assets/cal-f-shoe-sandals-DOmqrBny.jpg";
const calFSkirtMini = "/assets/cal-f-skirt-mini-CZ6sG2AP.jpg";
const calFSkirtMaxi = "/assets/cal-f-skirt-maxi-BFZjztTx.jpg";
const calFSkirtPleated = "/assets/cal-f-skirt-pleated-o-SNeSHt.jpg";
const calFAccScarf = "/assets/cal-f-acc-scarf-BWSob3DL.jpg";
const calFAccHat = "/assets/cal-f-acc-hat-DPKG7drl.jpg";
const calFSunglassesAviator = "/assets/cal-f-sunglasses-aviator-CUB5eEAA.jpg";
const calFSunglassesRound = "/assets/cal-f-sunglasses-round-C20p-r10.jpg";
const calFSunglassesOversized = "/assets/cal-f-sunglasses-oversized-B2Pl__7K.jpg";
const styleInspo1 = "/assets/style-inspo-1-BFDO_0rG.jpg";
const styleInspo2 = "/assets/style-inspo-2-BbysJ3KB.jpg";
const styleInspo3 = "/assets/style-inspo-3-BS_1HNG2.jpg";
const maleCalibrationSteps = [
  {
    question: "Which Jeans style do you prefer the most?",
    key: "jeansStyle",
    phase: "Bottoms",
    options: [
      { label: "Wide-leg", imageUrl: calJeansWide, style: "Casual" },
      { label: "Slim fit", imageUrl: calJeansSlim, style: "Casual" },
      { label: "Skinny", imageUrl: calJeansSkinny, style: "Casual" },
      { label: "Straight", imageUrl: calJeansStraight, style: "Casual" }
    ]
  },
  {
    question: "Which Trousers style do you prefer the most?",
    key: "trousersStyle",
    phase: "Bottoms",
    options: [
      { label: "Wide-leg", imageUrl: calTrousersWide, style: "Casual" },
      { label: "Straight", imageUrl: calTrousersStraight, style: "Casual" },
      { label: "Checked", imageUrl: calTrousersChecked, style: "Formal" },
      { label: "Tailored", imageUrl: calTrousersTailored, style: "Formal" }
    ]
  },
  {
    question: "Which Coat style do you prefer the most?",
    key: "coatStyle",
    phase: "Outerwear",
    options: [
      { label: "Double-breasted", imageUrl: calCoatDouble, style: "Formal" },
      { label: "Overcoat", imageUrl: calCoatOvercoat, style: "Formal" },
      { label: "Trench", imageUrl: calCoatTrench, style: "Formal" },
      { label: "Belted", imageUrl: calCoatBelted, style: "Casual" }
    ]
  },
  {
    question: "Which T-shirt style do you prefer the most?",
    key: "tshirtStyle",
    phase: "Tops",
    options: [
      { label: "Basic crew", imageUrl: calTshirtBasic, style: "Casual" },
      { label: "Graphic", imageUrl: calTshirtGraphic, style: "Casual" },
      { label: "V-neck", imageUrl: calTshirtVneck, style: "Casual" },
      { label: "Oversized", imageUrl: calTshirtOversized, style: "Casual" }
    ]
  },
  {
    question: "Which Shirt style do you prefer the most?",
    key: "shirtStyle",
    phase: "Tops",
    options: [
      { label: "Classic", imageUrl: calShirtClassic, style: "Formal" },
      { label: "Artsy", imageUrl: calShirtArtsy, style: "Casual" },
      { label: "Linen", imageUrl: calShirtLinen, style: "Casual" },
      { label: "Printed", imageUrl: calShirtPrinted, style: "Casual" }
    ]
  },
  {
    question: "Which Jacket style do you prefer the most?",
    key: "jacketStyle",
    phase: "Outerwear",
    options: [
      { label: "Biker", imageUrl: calJacketBiker, style: "Casual" },
      { label: "Bomber", imageUrl: calJacketBomber, style: "Casual" },
      { label: "Denim", imageUrl: calJacketDenim, style: "Casual" },
      { label: "Suede", imageUrl: calJacketSuede, style: "Formal" }
    ]
  },
  {
    question: "Which Footwear style do you prefer the most?",
    key: "footwearStyle",
    phase: "Shoes",
    options: [
      { label: "Loafers", imageUrl: calShoeLoafers, style: "Formal" },
      { label: "Chelsea boots", imageUrl: calShoeChelsea, style: "Formal" },
      { label: "Sneakers", imageUrl: calShoeSneakers, style: "Casual" },
      { label: "Derby shoes", imageUrl: calShoeDerby, style: "Formal" }
    ]
  },
  {
    question: "Which Sunglasses style do you prefer the most?",
    key: "sunglassesStyle",
    phase: "Accessories",
    options: [
      { label: "Aviator", imageUrl: calSunglassesAviator, style: "Casual" },
      { label: "Wayfarer", imageUrl: calSunglassesWayfarer, style: "Casual" },
      { label: "Round", imageUrl: calSunglassesRound, style: "Casual" },
      { label: "Sport", imageUrl: calSunglassesSport, style: "Casual" }
    ]
  },
  {
    question: "Which Hat style do you prefer the most?",
    key: "hatStyle",
    phase: "Accessories",
    options: [
      { label: "Fedora", imageUrl: calHatFedora, style: "Formal" },
      { label: "Beanie", imageUrl: calHatBeanie, style: "Casual" },
      { label: "Baseball cap", imageUrl: calHatCap, style: "Casual" },
      { label: "Panama", imageUrl: calHatPanama, style: "Formal" }
    ]
  }
];
const femaleCalibrationSteps = [
  {
    question: "Which Jeans style do you prefer the most?",
    key: "jeansStyle",
    phase: "Bottoms",
    options: [
      { label: "Wide-leg", imageUrl: calFJeansWide, style: "Casual" },
      { label: "Straight", imageUrl: calFJeansStraight, style: "Casual" },
      { label: "Flare", imageUrl: calFJeansFlare, style: "Casual" },
      { label: "Mom fit", imageUrl: calFJeansMom, style: "Casual" }
    ]
  },
  {
    question: "Which Pant style do you prefer the most?",
    key: "pantsStyle",
    phase: "Bottoms",
    options: [
      { label: "Tailored", imageUrl: calFPantsTailored, style: "Formal" },
      { label: "Wide-leg", imageUrl: calFPantsWide, style: "Casual" },
      { label: "Straight", imageUrl: calFPantsStraight, style: "Formal" },
      { label: "Feather-trim", imageUrl: calFPantsFeather, style: "Formal" }
    ]
  },
  {
    question: "Which Coat style do you prefer the most?",
    key: "coatStyle",
    phase: "Outerwear",
    options: [
      { label: "Trench", imageUrl: calFCoatTrench, style: "Formal" },
      { label: "Belted wrap", imageUrl: calFCoatBelted, style: "Formal" },
      { label: "Elegant", imageUrl: calFCoatElegant, style: "Formal" },
      { label: "Short coat", imageUrl: calFCoatShort, style: "Casual" }
    ]
  },
  {
    question: "Which T-shirt style do you prefer the most?",
    key: "tshirtStyle",
    phase: "Tops",
    options: [
      { label: "Ruffle detail", imageUrl: calFTshirtRuffle, style: "Casual" },
      { label: "Graphic", imageUrl: calFTshirtGraphic, style: "Casual" },
      { label: "Oversized", imageUrl: calFTshirtOversized, style: "Casual" },
      { label: "Gothic print", imageUrl: calFTshirtGothic, style: "Casual" }
    ]
  },
  {
    question: "Which Shirt style do you prefer the most?",
    key: "shirtStyle",
    phase: "Tops",
    options: [
      { label: "Ruffle", imageUrl: calFShirtRuffle, style: "Casual" },
      { label: "Classic", imageUrl: calFShirtClassic, style: "Formal" },
      { label: "Oxford stripe", imageUrl: calFShirtOxford, style: "Casual" },
      { label: "Sheer", imageUrl: calFShirtSheer, style: "Casual" }
    ]
  },
  {
    question: "Which Top style do you prefer the most?",
    key: "topStyle",
    phase: "Tops",
    options: [
      { label: "Camisole", imageUrl: calFTopCami, style: "Casual" },
      { label: "Ruffle", imageUrl: calFTopRuffle, style: "Casual" },
      { label: "Asymmetric", imageUrl: calFTopAsymmetric, style: "Casual" },
      { label: "Polo knit", imageUrl: calFTopPolo, style: "Casual" }
    ]
  },
  {
    question: "Which Dress style do you prefer the most?",
    key: "dressStyle",
    phase: "Dresses",
    options: [
      { label: "Midi", imageUrl: calFDressMidi, style: "Casual" },
      { label: "Maxi", imageUrl: calFDressMaxi, style: "Formal" },
      { label: "Mini", imageUrl: calFDressMini, style: "Formal" },
      { label: "Trench dress", imageUrl: calFDressTrench, style: "Casual" }
    ]
  },
  {
    question: "Which Skirt style do you prefer the most?",
    key: "skirtStyle",
    phase: "Dresses",
    options: [
      { label: "Mini", imageUrl: calFSkirtMini, style: "Casual" },
      { label: "Midi", imageUrl: calFSkirtMidi, style: "Formal" },
      { label: "Maxi", imageUrl: calFSkirtMaxi, style: "Casual" },
      { label: "Pleated", imageUrl: calFSkirtPleated, style: "Formal" }
    ]
  },
  {
    question: "Which Footwear style do you prefer the most?",
    key: "footwearStyle",
    phase: "Shoes",
    options: [
      { label: "Heels", imageUrl: calFShoeHeels, style: "Formal" },
      { label: "Flats", imageUrl: calFShoeFlats, style: "Casual" },
      { label: "Boots", imageUrl: calFShoeBoots, style: "Casual" },
      { label: "Sandals", imageUrl: calFShoeSandals, style: "Casual" }
    ]
  },
  {
    question: "Which Accessory do you gravitate towards?",
    key: "accessoryStyle",
    phase: "Accessories",
    options: [
      { label: "Bags", imageUrl: calFAccBag, style: "Casual" },
      { label: "Jewelry", imageUrl: calFAccJewelry, style: "Formal" },
      { label: "Scarves", imageUrl: calFAccScarf, style: "Casual" },
      { label: "Hats", imageUrl: calFAccHat, style: "Casual" }
    ]
  },
  {
    question: "Which Sunglasses style do you prefer the most?",
    key: "sunglassesStyle",
    phase: "Accessories",
    options: [
      { label: "Aviator", imageUrl: calFSunglassesAviator, style: "Casual" },
      { label: "Cat-eye", imageUrl: calFSunglassesCateye, style: "Formal" },
      { label: "Round", imageUrl: calFSunglassesRound, style: "Casual" },
      { label: "Oversized", imageUrl: calFSunglassesOversized, style: "Casual" }
    ]
  }
];
const styleTypes = [
  "Romantic-gamine",
  "Classic-natural",
  "Dramatic-classic",
  "Gamine-romantic",
  "Natural-dramatic",
  "Romantic-classic",
  "Classic-gamine",
  "Dramatic-natural"
];
const phaseMessages = {
  Bottoms: "Great taste in bottoms! Let's check outerwear next.",
  Outerwear: "Outerwear sorted! Now let's look at tops.",
  Tops: "Love your top picks! Time for shoes.",
  Shoes: "Nice footwear choices! Last up — accessories.",
  Dresses: "Beautiful dress taste! Now for shoes.",
  Accessories: "Almost done! Let's finalize your style."
};
const pageVariants = {
  enter: (dir) => ({
    x: dir > 0 ? "60%" : "-60%",
    opacity: 0,
    scale: 0.92,
    filter: "blur(6px)"
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: "blur(0px)"
  },
  exit: (dir) => ({
    x: dir > 0 ? "-60%" : "60%",
    opacity: 0,
    scale: 0.92,
    filter: "blur(6px)"
  })
};
const Calibration = () => {
  const [currentStep, setCurrentStep] = reactExports.useState(0);
  const [answers, setAnswers] = reactExports.useState({});
  const [phase, setPhase] = reactExports.useState("questions");
  const [loading, setLoading] = reactExports.useState(false);
  const [gender, setGender] = reactExports.useState("male");
  const [styleType, setStyleType] = reactExports.useState("");
  const [swipeDir, setSwipeDir] = reactExports.useState(1);
  const [swipeVelocity, setSwipeVelocity] = reactExports.useState({ x: 0, y: 0 });
  const [swipeTrigger, setSwipeTrigger] = reactExports.useState(0);
  const [interstitialMsg, setInterstitialMsg] = reactExports.useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const tilt = useGyroTilt();
  reactExports.useEffect(() => {
    if (!user) return;
    const loadGender = async () => {
      const { data } = await supabase.from("style_profiles").select("preferences").eq("user_id", user.id).single();
      const prefs = data == null ? void 0 : data.preferences;
      if ((prefs == null ? void 0 : prefs.gender) === "female" || (prefs == null ? void 0 : prefs.gender) === "male") {
        setGender(prefs.gender);
      }
    };
    loadGender();
  }, [user]);
  reactExports.useEffect(() => {
    if (phase === "definingStyle") {
      const randomType = styleTypes[Math.floor(Math.random() * styleTypes.length)];
      const timer = setTimeout(() => {
        setStyleType(randomType);
        setPhase("styleResult");
      }, 3e3);
      return () => clearTimeout(timer);
    }
  }, [phase]);
  reactExports.useEffect(() => {
    if (phase === "interstitial") {
      const timer = setTimeout(() => {
        haptic("success");
        setPhase("questions");
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [phase]);
  reactExports.useEffect(() => {
    if (phase !== "progress") return;
    const timer = setTimeout(() => {
      const canvas = document.createElement("canvas");
      canvas.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:100;pointer-events:none";
      document.body.appendChild(canvas);
      const ctx = canvas.getContext("2d");
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
        alpha: 1
      }));
      let frame = 0;
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;
        particles.forEach((p) => {
          p.vy += 0.25;
          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.rotSpeed;
          p.alpha = Math.max(0, p.alpha - 5e-3);
          if (p.alpha <= 0) return;
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation * Math.PI / 180);
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        });
        frame++;
        if (alive && frame < 200) requestAnimationFrame(animate);
        else {
          canvas.remove();
        }
      };
      requestAnimationFrame(animate);
    }, 1800);
    return () => clearTimeout(timer);
  }, [phase]);
  const calibrationSteps = gender === "female" ? femaleCalibrationSteps : maleCalibrationSteps;
  const totalSteps = calibrationSteps.length;
  const currentStepData = calibrationSteps[currentStep];
  const canProceed = !!answers[currentStepData == null ? void 0 : currentStepData.key];
  const phases = [...new Set(calibrationSteps.map((s) => s.phase))];
  const phaseSegments = phases.map((p) => {
    const stepsInPhase = calibrationSteps.filter((s) => s.phase === p);
    const first = calibrationSteps.indexOf(stepsInPhase[0]);
    const last = calibrationSteps.indexOf(stepsInPhase[stepsInPhase.length - 1]);
    return { phase: p, first, last, count: stepsInPhase.length };
  });
  const handleSelect = (key, value) => {
    haptic("light");
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };
  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      haptic("medium");
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
      const { data: existing } = await supabase.from("style_profiles").select("preferences").eq("user_id", user.id).single();
      const currentPrefs = (existing == null ? void 0 : existing.preferences) || {};
      const { error } = await supabase.from("style_profiles").update({
        preferences: { ...currentPrefs, calibration: answers, calibrationProgress: 73, styleType }
      }).eq("user_id", user.id);
      if (error) throw error;
      setPhase("progress");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  const selectedOption = currentStepData == null ? void 0 : currentStepData.options.find(
    (o) => o.label === answers[currentStepData == null ? void 0 : currentStepData.key]
  );
  if (phase === "interstitial") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-primary/8 blur-[80px]" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { scale: 0.8, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 0.8, opacity: 0 },
          transition: { type: "spring", damping: 15 },
          className: "text-center relative z-10",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                initial: { scale: 0 },
                animate: { scale: 1 },
                transition: { delay: 0.1, type: "spring", stiffness: 300 },
                className: "w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-8 h-8 text-primary" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.p,
              {
                initial: { y: 10, opacity: 0 },
                animate: { y: 0, opacity: 1 },
                transition: { delay: 0.2 },
                className: "font-display text-lg font-bold text-foreground",
                children: interstitialMsg
              }
            )
          ]
        }
      )
    ] });
  }
  if (phase === "definingStyle") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-primary/5 blur-[100px]" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { scale: 0.8, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: { type: "spring", damping: 15 },
          className: "w-20 h-20 mb-8 relative",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.div,
              {
                animate: { rotate: 360 },
                transition: { duration: 3, repeat: Infinity, ease: "linear" },
                className: "absolute inset-0",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[hsl(15,80%,65%)] opacity-80" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[hsl(260,60%,70%)] opacity-80" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 flex items-center justify-center gap-0.5 z-10", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", className: "text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", className: "text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2", strokeDasharray: "4 2" }) })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.p,
        {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.3 },
          className: "font-sans text-lg text-foreground",
          children: "Defining your Style Type..."
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1.5 mt-6", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          animate: { opacity: [0.3, 1, 0.3] },
          transition: { duration: 1.2, repeat: Infinity, delay: i * 0.2 },
          className: "w-2 h-2 rounded-full bg-foreground/40"
        },
        i
      )) })
    ] });
  }
  if (phase === "styleResult") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-primary/5 blur-[100px]" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { y: 40, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { type: "spring", damping: 20, delay: 0.1 },
          className: "w-full max-w-sm bg-card rounded-3xl shadow-xl p-6 border border-border",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-full bg-[hsl(15,80%,65%)] flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "white", strokeWidth: "2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M4 4l6 6M10 4L4 10M14 14l6 6M20 14l-6 6" }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-full bg-[hsl(340,70%,70%)] flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "white", strokeWidth: "2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "4", y: "4", width: "16", height: "16", rx: "2", strokeDasharray: "4 2" }) }) })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-sm text-muted-foreground font-sans mb-1", children: "Your Style type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-center text-2xl font-display font-bold text-foreground mb-5", children: styleType }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 mb-5", children: [styleInspo1, styleInspo2, styleInspo3].map((src, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.div,
              {
                initial: { scale: 0.8, opacity: 0 },
                animate: { scale: 1, opacity: 1 },
                transition: { delay: 0.3 + i * 0.1 },
                className: "flex-1 aspect-[3/4] rounded-xl overflow-hidden relative",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src, alt: `Style inspiration ${i + 1}`, className: "w-full h-full object-cover" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" })
                ]
              },
              i
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-sm text-muted-foreground font-sans leading-relaxed", children: "Congratulations! Now you know exactly which prints and fabrics flatter you." })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed bottom-0 inset-x-0 p-5 bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: handleComplete,
          disabled: loading,
          className: "w-full h-14 rounded-2xl font-semibold font-sans text-base bg-foreground text-background hover:bg-foreground/90",
          children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            "CONTINUE ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4 ml-2" })
          ] })
        }
      ) })
    ] });
  }
  if (phase === "progress") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 pointer-events-none", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-primary/5 blur-[100px]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-1/3 left-1/3 w-48 h-48 rounded-full bg-[hsl(142,60%,48%)]/5 blur-[80px]" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { scale: 0, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: { type: "spring", damping: 14, delay: 0.2 },
          className: "relative w-32 h-32 mb-10",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                animate: { rotate: 360 },
                transition: { duration: 20, repeat: Infinity, ease: "linear" },
                className: "absolute inset-0",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 128 128", className: "w-full h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "64", cy: "64", r: "60", fill: "none", stroke: "hsl(var(--primary))", strokeWidth: "1", strokeDasharray: "4 8", opacity: "0.3" }) })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                initial: { scale: 0 },
                animate: { scale: 1 },
                transition: { delay: 0.4, type: "spring", damping: 12 },
                className: "absolute inset-3 rounded-full flex items-center justify-center",
                style: {
                  background: "linear-gradient(135deg, hsl(142,60%,48%), hsl(var(--primary)))",
                  boxShadow: "0 0 40px hsl(142,60%,48%,0.3), 0 0 80px hsl(var(--primary)/0.15)"
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    initial: { scale: 0, opacity: 0 },
                    animate: { scale: 1, opacity: 1 },
                    transition: { delay: 0.7, type: "spring", stiffness: 300 },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-12 h-12 text-white", strokeWidth: 3 })
                  }
                )
              }
            ),
            [0, 60, 120, 180, 240, 300].map((deg, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                className: "absolute w-1.5 h-1.5 rounded-full bg-primary",
                style: {
                  top: `${50 - 48 * Math.cos(deg * Math.PI / 180)}%`,
                  left: `${50 + 48 * Math.sin(deg * Math.PI / 180)}%`
                },
                initial: { scale: 0, opacity: 0 },
                animate: { scale: [0, 1.2, 0.8], opacity: [0, 1, 0.5] },
                transition: { delay: 0.8 + i * 0.1, duration: 1.5, repeat: Infinity, repeatType: "reverse" }
              },
              deg
            ))
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.h1,
        {
          initial: { y: 20, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { delay: 0.4 },
          className: "font-display text-2xl font-bold text-foreground mb-2 text-center",
          children: "Calibration in progress!"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.p,
        {
          initial: { y: 15, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { delay: 0.5 },
          className: "text-muted-foreground font-sans text-sm mb-8 text-center",
          children: "Your style profile is taking shape"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { y: 20, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { delay: 0.6 },
          className: "w-full max-w-sm mb-6",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-12 rounded-2xl bg-card/60 backdrop-blur-sm overflow-hidden border border-border/30 relative", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.div,
              {
                initial: { width: 0 },
                animate: { width: "73%" },
                transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.8 },
                className: "h-full rounded-2xl flex items-center justify-between px-4 relative overflow-hidden",
                style: {
                  background: "linear-gradient(90deg, hsl(142, 60%, 48%), hsl(var(--primary)))"
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    motion.div,
                    {
                      className: "absolute inset-0",
                      style: { background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" },
                      animate: { x: ["-100%", "200%"] },
                      transition: { duration: 2, repeat: Infinity, delay: 2.5, repeatDelay: 3 }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-5 h-5 text-white relative z-10", strokeWidth: 2.5 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold text-white font-sans relative z-10", children: "73%" })
                ]
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.div,
              {
                initial: { scale: 0 },
                animate: { scale: 1 },
                transition: { delay: 1.5, type: "spring", stiffness: 200 },
                className: "w-12 h-12 rounded-2xl flex items-center justify-center border border-border/30 relative overflow-hidden",
                style: { background: "linear-gradient(135deg, hsl(var(--card)), hsl(var(--card)/0.6))" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "w-5 h-5 text-primary relative z-10" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    motion.div,
                    {
                      className: "absolute inset-0 bg-primary/10",
                      animate: { opacity: [0, 0.3, 0] },
                      transition: { duration: 2, repeat: Infinity }
                    }
                  )
                ]
              }
            )
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { scale: 0.8, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: { delay: 1.8, type: "spring" },
          className: "px-5 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm mb-6",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-primary font-sans", children: "🎉 73% Complete" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.p,
        {
          initial: { y: 20, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { delay: 0.9 },
          className: "text-muted-foreground font-sans text-center max-w-xs leading-relaxed text-sm",
          children: "Discover your Style Formula. Let's continue tomorrow — the more we know you, the better the results!"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed bottom-0 inset-x-0 p-5 bg-background/80 backdrop-blur-md border-t border-border/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: () => navigate("/dashboard"),
          className: "w-full h-14 rounded-2xl font-semibold font-sans text-base bg-foreground text-background hover:bg-foreground/90",
          children: [
            "CONTINUE",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4 ml-2" })
          ]
        }
      ) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background flex flex-col relative overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        className: "absolute top-1/3 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-primary/5 blur-[100px]",
        animate: { scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] },
        transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SwipeParticles, { swipeVelocity, swipeTrigger }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky top-0 z-20 bg-background/80 backdrop-blur-md px-4 pt-4 pb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
        currentStep > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handlePrev, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-5 w-5 text-foreground" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate(-1), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-5 w-5 text-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-sans font-semibold text-foreground text-base", children: "Calibration" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-sans text-muted-foreground", children: [
          currentStep + 1,
          "/",
          totalSteps
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 relative", children: phaseSegments.map((seg, i) => {
        const segProgress = currentStep > seg.last ? 1 : currentStep >= seg.first ? (currentStep - seg.first + (canProceed ? 1 : 0.5)) / seg.count : 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 h-[5px] rounded-full bg-muted/60 overflow-hidden relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              className: "h-full rounded-full",
              style: {
                background: "linear-gradient(90deg, hsl(142, 60%, 48%), hsl(var(--primary)))"
              },
              initial: false,
              animate: { width: `${Math.min(segProgress * 100, 100)}%` },
              transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
            }
          ),
          segProgress > 0 && segProgress < 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              className: "absolute inset-0",
              style: { background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)" },
              animate: { x: ["-100%", "200%"] },
              transition: { duration: 1.5, repeat: Infinity, repeatDelay: 2 }
            }
          )
        ] }, seg.phase);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-between mt-1 px-0.5", children: phaseSegments.map((seg) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          className: `text-[8px] font-sans ${currentStep >= seg.first ? "text-primary font-semibold" : "text-muted-foreground"}`,
          children: seg.phase
        },
        seg.phase
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 px-4 pt-4 pb-36", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", custom: swipeDir, initial: false, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        custom: swipeDir,
        variants: pageVariants,
        initial: "enter",
        animate: "center",
        exit: "exit",
        transition: {
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1],
          filter: { duration: 0.3 }
        },
        drag: "x",
        dragConstraints: { left: 0, right: 0 },
        dragElastic: 0.12,
        onDragEnd: (_, info) => {
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
        },
        style: {
          perspective: 800,
          transformStyle: "preserve-3d"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            style: {
              rotateX: tilt.rotateX,
              rotateY: tilt.rotateY
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-bold text-foreground text-center mb-6 px-2", children: currentStepData.question }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3 max-w-sm mx-auto", children: currentStepData.options.map((option, index) => {
                const isActive = answers[currentStepData.key] === option.label;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  motion.button,
                  {
                    initial: { opacity: 0, scale: 0.9 },
                    animate: {
                      opacity: 1,
                      scale: isActive ? 1.05 : 1
                    },
                    whileTap: { scale: 0.95 },
                    transition: { duration: 0.3, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] },
                    onClick: () => handleSelect(currentStepData.key, option.label),
                    className: "flex flex-col items-center gap-2",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        motion.div,
                        {
                          className: `relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-secondary ${isActive ? "ring-2 ring-primary shadow-[0_0_20px_hsl(var(--primary)/0.3)]" : ""}`,
                          animate: {
                            boxShadow: isActive ? "0 8px 30px -8px hsl(var(--primary) / 0.4)" : "0 0 0 0 transparent"
                          },
                          transition: { duration: 0.3, ease: "easeOut" },
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "img",
                              {
                                src: option.imageUrl,
                                alt: option.label,
                                className: "w-full h-full object-cover",
                                loading: "lazy"
                              }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isActive && /* @__PURE__ */ jsxRuntimeExports.jsx(
                              motion.div,
                              {
                                className: "absolute inset-0 bg-primary/10",
                                initial: { opacity: 0 },
                                animate: { opacity: 1 },
                                exit: { opacity: 0 },
                                transition: { duration: 0.2 }
                              }
                            ) }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-2 right-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                              motion.div,
                              {
                                className: `w-6 h-6 rounded-full border-2 flex items-center justify-center shadow-sm ${isActive ? "border-primary bg-primary" : "border-white/80 bg-white/60 backdrop-blur-sm"}`,
                                animate: { scale: isActive ? [1, 1.3, 1] : 1 },
                                transition: { duration: 0.3 },
                                children: isActive && /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  motion.div,
                                  {
                                    initial: { scale: 0 },
                                    animate: { scale: 1 },
                                    transition: { type: "spring", stiffness: 500, damping: 15 },
                                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-3 h-3 text-white" })
                                  }
                                )
                              }
                            ) })
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        motion.span,
                        {
                          className: "font-sans text-xs font-medium",
                          animate: {
                            color: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                            scale: isActive ? 1.08 : 1,
                            fontWeight: isActive ? 700 : 500
                          },
                          transition: { duration: 0.25 },
                          children: option.label
                        }
                      )
                    ]
                  },
                  option.label
                );
              }) })
            ]
          }
        )
      },
      currentStep
    ) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed bottom-0 inset-x-0 z-20 bg-background/80 backdrop-blur-md border-t border-border/20 p-4 space-y-2", children: [
      canProceed && selectedOption && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: () => navigate("/closet"),
          variant: "outline",
          className: "w-full h-12 rounded-2xl font-sans text-sm border-border",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4 mr-2" }),
            "Preview on me"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: handleNext,
          disabled: !canProceed,
          className: `w-full h-14 rounded-2xl font-semibold font-sans text-base transition-all ${canProceed ? "bg-foreground text-background hover:bg-foreground/90" : "bg-muted text-muted-foreground"}`,
          variant: "ghost",
          children: [
            currentStep === totalSteps - 1 ? "FINISH" : "NEXT",
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.span,
              {
                className: "ml-2 inline-flex",
                animate: canProceed ? { x: [0, 4, 0] } : {},
                transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" })
              }
            )
          ]
        }
      )
    ] })
  ] });
};
export {
  Calibration as default
};
