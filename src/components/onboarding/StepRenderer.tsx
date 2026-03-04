import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Camera, Smartphone, Video, User, FlipHorizontal } from "lucide-react";
import type { OnboardingStep } from "./onboardingSteps";
import FaceShapeIllustration from "@/components/app/FaceShapeIllustration";
import BodyShapeIllustration from "@/components/app/BodyShapeIllustration";

// Brand logo imports
import brandZara from "@/assets/brand-zara.jpg";
import brandHm from "@/assets/brand-hm.jpg";
import brandGap from "@/assets/brand-gap.jpg";
import brandMango from "@/assets/brand-mango.jpg";
import brandCos from "@/assets/brand-cos.jpg";
import brandGanni from "@/assets/brand-ganni.jpg";
import brandIsabelmarant from "@/assets/brand-isabelmarant.jpg";
import brandReformation from "@/assets/brand-reformation.jpg";
import brandGucci from "@/assets/brand-gucci.jpg";
import brandFendi from "@/assets/brand-fendi.jpg";
import brandValentino from "@/assets/brand-valentino.jpg";
import brandChanel from "@/assets/brand-chanel.jpg";

const brandLogoMap: Record<string, string> = {
  "brand-zara": brandZara,
  "brand-hm": brandHm,
  "brand-gap": brandGap,
  "brand-mango": brandMango,
  "brand-cos": brandCos,
  "brand-ganni": brandGanni,
  "brand-isabelmarant": brandIsabelmarant,
  "brand-reformation": brandReformation,
  "brand-gucci": brandGucci,
  "brand-fendi": brandFendi,
  "brand-valentino": brandValentino,
  "brand-chanel": brandChanel,
};
import selfieIntroImg from "@/assets/selfie-intro.jpg";
import selfieIntroMaleImg from "@/assets/selfie-intro-male.jpg";
import selfieStep1Img from "@/assets/selfie-step1.jpg";
import selfieStep2Img from "@/assets/selfie-step2.jpg";
import selfieStep3Img from "@/assets/selfie-step3.jpg";
import selfieStep4Img from "@/assets/selfie-step4.jpg";
import selfieStep5Img from "@/assets/selfie-step5.jpg";
import selfieStep1MaleImg from "@/assets/selfie-step1-male.jpg";
import selfieStep2MaleImg from "@/assets/selfie-step2-male.jpg";
import selfieStep3MaleImg from "@/assets/selfie-step3-male.jpg";
import selfieStep4MaleImg from "@/assets/selfie-step4-male.jpg";
import selfieStep5MaleImg from "@/assets/selfie-step5-male.jpg";

// Body shape illustrations
import bodyFemaleHourglass from "@/assets/body-female-hourglass.png";
import bodyFemaleTriangle from "@/assets/body-female-triangle.png";
import bodyFemaleInvTriangle from "@/assets/body-female-invtriangle.png";
import bodyFemaleRectangle from "@/assets/body-female-rectangle.png";
import bodyFemaleRound from "@/assets/body-female-round.png";
import bodyMaleRectangle from "@/assets/body-male-rectangle.png";
import bodyMaleTriangle from "@/assets/body-male-triangle.png";
import bodyMaleInvTriangle from "@/assets/body-male-invtriangle.png";
import bodyMaleOval from "@/assets/body-male-oval.png";
import bodyMaleTrapezoid from "@/assets/body-male-trapezoid.png";

const selfieStepImages: Record<string, Record<number, string>> = {
  female: { 1: selfieStep1Img, 2: selfieStep2Img, 3: selfieStep3Img, 4: selfieStep4Img, 5: selfieStep5Img },
  male: { 1: selfieStep1MaleImg, 2: selfieStep2MaleImg, 3: selfieStep3MaleImg, 4: selfieStep4MaleImg, 5: selfieStep5MaleImg },
};

const selfieIntroImages: Record<string, string> = {
  female: selfieIntroImg,
  male: selfieIntroMaleImg,
};

const bodyShapeImages: Record<string, Record<string, string>> = {
  female: {
    Hourglass: bodyFemaleHourglass,
    Triangle: bodyFemaleTriangle,
    "Inverted triangle": bodyFemaleInvTriangle,
    Rectangle: bodyFemaleRectangle,
    Round: bodyFemaleRound,
  },
  male: {
    Rectangle: bodyMaleRectangle,
    Triangle: bodyMaleTriangle,
    "Inverted triangle": bodyMaleInvTriangle,
    Oval: bodyMaleOval,
    Trapezoid: bodyMaleTrapezoid,
  },
};

interface StepRendererProps {
  step: OnboardingStep;
  answers: Record<string, string[]>;
  onSelect: (key: string, option: string, singleSelect: boolean) => void;
  gender?: "female" | "male" | null;
  aiResults?: Record<string, any>;
}

const HeightStep = ({ answers, onSelect }: { answers: Record<string, string[]>; onSelect: StepRendererProps["onSelect"] }) => {
  const [unit, setUnit] = useState<"inch" | "cm">(answers.heightUnit?.[0] === "cm" ? "cm" : "inch");
  const ft = answers.heightFt?.[0] || "";
  const inches = answers.heightIn?.[0] || "";
  const cm = answers.heightCm?.[0] || "";

  const handleUnitChange = (newUnit: "inch" | "cm") => {
    setUnit(newUnit);
    onSelect("heightUnit", newUnit, true);
  };

  return (
    <div>
      <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground text-center mb-6">
        Your height
      </h2>
      <div className="flex justify-center gap-2 mb-8">
        <button
          onClick={() => handleUnitChange("inch")}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
            unit === "inch"
              ? "bg-[hsl(0,70%,68%)] text-white"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          INCH
        </button>
        <button
          onClick={() => handleUnitChange("cm")}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
            unit === "cm"
              ? "bg-[hsl(0,70%,68%)] text-white"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          CM
        </button>
      </div>

      {unit === "inch" ? (
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="flex items-center border-b border-border pb-2">
              <input
                type="number"
                placeholder=""
                value={ft}
                onChange={(e) => onSelect("heightFt", e.target.value, true)}
                className="flex-1 bg-transparent text-foreground text-lg outline-none font-sans"
              />
              <span className="text-muted-foreground text-sm font-sans ml-2">FT</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center border-b border-border pb-2">
              <input
                type="number"
                placeholder=""
                value={inches}
                onChange={(e) => onSelect("heightIn", e.target.value, true)}
                className="flex-1 bg-transparent text-foreground text-lg outline-none font-sans"
              />
              <span className="text-muted-foreground text-sm font-sans ml-2">IN</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center border-b border-border pb-2">
          <input
            type="number"
            placeholder=""
            value={cm}
            onChange={(e) => onSelect("heightCm", e.target.value, true)}
            className="flex-1 bg-transparent text-foreground text-lg outline-none font-sans"
          />
          <span className="text-muted-foreground text-sm font-sans ml-2">CM</span>
        </div>
      )}
    </div>
  );
};

const NotificationStep = ({ step }: { step: OnboardingStep }) => {
  return (
    <div className="flex flex-col items-center text-center pt-8">
      <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-3">
        {step.question}
      </h2>
      <p className="text-muted-foreground font-sans mb-12">{step.description}</p>

      <div className="border border-border rounded-2xl p-6 max-w-xs w-full shadow-sm bg-card">
        <h3 className="font-sans font-semibold text-foreground text-sm mb-1">
          "Style DNA" Would Like to Send You Notifications
        </h3>
        <p className="text-muted-foreground text-xs font-sans mb-4">
          Notifications may include alerts, sounds and icon badges. These can be configured in Settings.
        </p>
        <div className="flex border-t border-border">
          <button className="flex-1 py-2 text-sm font-sans text-blue-500 border-r border-border">
            Don't Allow
          </button>
          <button className="flex-1 py-2 text-sm font-sans text-blue-500 font-semibold">
            Allow
          </button>
        </div>
      </div>
      <div className="mt-3 text-[hsl(0,70%,68%)] text-2xl">↗</div>
    </div>
  );
};

const SelfieIntroStep = ({ step, gender }: { step: OnboardingStep; gender?: "female" | "male" | null }) => {
  const introImg = selfieIntroImages[gender || "female"];
  return (
    <div className="flex flex-col items-center text-center pt-12">
      <div className="w-48 h-48 mb-8 flex items-center justify-center">
        <img src={introImg} alt="Style analysis" className="w-full h-full object-contain" />
      </div>
      <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-3">
        {step.question}
      </h2>
      <p className="text-muted-foreground font-sans">{step.description}</p>
    </div>
  );
};

const SelfieGuideStep = ({ step, gender }: { step: OnboardingStep; gender?: "female" | "male" | null }) => {
  const images = selfieStepImages[gender || "female"];
  const stepImg = step.stepNumber ? images[step.stepNumber] : null;
  return (
    <div className="flex flex-col items-center">
      <div className="w-full aspect-[3/4] rounded-2xl bg-secondary/50 mb-6 flex items-center justify-center overflow-hidden relative">
        {stepImg ? (
          <img src={stepImg} alt={step.question} className="w-full h-full object-contain" />
        ) : (
          <div className="text-center">
            <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <Smartphone className="w-8 h-8 text-muted-foreground mx-auto" />
          </div>
        )}
        {step.stepNumber === 5 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg viewBox="0 0 224 288" className="w-56 h-72" fill="none">
              <ellipse cx="112" cy="144" rx="100" ry="130" stroke="hsl(120, 60%, 55%)" strokeWidth="4" strokeDasharray="8 6" fill="none" />
            </svg>
          </div>
        )}
      </div>
      <div className="text-center">
        <p className="text-[hsl(0,70%,68%)] font-sans text-sm mb-2">Step {step.stepNumber}</p>
        <h2 className="font-display text-xl font-bold text-foreground">{step.question}</h2>
      </div>
    </div>
  );
};

const LightingIndicator = () => {
  const [level, setLevel] = useState(0.5);

  useEffect(() => {
    const interval = setInterval(() => {
      setLevel(0.4 + Math.random() * 0.4);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const quality = level > 0.6 ? "Good" : level > 0.4 ? "Fair" : "Low";
  const color = level > 0.6 ? "hsl(120,60%,55%)" : level > 0.4 ? "hsl(40,90%,55%)" : "hsl(0,70%,55%)";

  return (
    <div className="absolute top-4 right-4 z-10 pointer-events-none">
      <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5">
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: color }} />
        <span className="text-white/90 text-[10px] font-sans font-medium tracking-wider uppercase">{quality} light</span>
      </div>
    </div>
  );
};

const faceLandmarks = [
  // Forehead
  { x: 50, y: 28 },
  // Eyebrows
  { x: 36, y: 36 }, { x: 44, y: 34 }, { x: 56, y: 34 }, { x: 64, y: 36 },
  // Eyes
  { x: 38, y: 42 }, { x: 42, y: 41 }, { x: 58, y: 41 }, { x: 62, y: 42 },
  // Nose
  { x: 50, y: 46 }, { x: 48, y: 52 }, { x: 50, y: 54 }, { x: 52, y: 52 },
  // Mouth
  { x: 43, y: 62 }, { x: 47, y: 64 }, { x: 50, y: 65 }, { x: 53, y: 64 }, { x: 57, y: 62 },
  // Jaw
  { x: 32, y: 48 }, { x: 34, y: 58 }, { x: 38, y: 68 }, { x: 44, y: 73 },
  { x: 50, y: 75 }, { x: 56, y: 73 }, { x: 62, y: 68 }, { x: 66, y: 58 }, { x: 68, y: 48 },
];

const bodyLandmarks = [
  // Head
  { x: 50, y: 8 },
  // Shoulders
  { x: 35, y: 20 }, { x: 65, y: 20 },
  // Elbows
  { x: 28, y: 38 }, { x: 72, y: 38 },
  // Wrists
  { x: 25, y: 52 }, { x: 75, y: 52 },
  // Torso
  { x: 42, y: 28 }, { x: 58, y: 28 }, { x: 44, y: 42 }, { x: 56, y: 42 },
  // Hips
  { x: 40, y: 50 }, { x: 60, y: 50 },
  // Knees
  { x: 42, y: 68 }, { x: 58, y: 68 },
  // Ankles
  { x: 42, y: 85 }, { x: 58, y: 85 },
];

const AnalyzingOverlay = ({ isSelfie }: { isSelfie: boolean }) => {
  const landmarks = isSelfie ? faceLandmarks : bodyLandmarks;
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleCount((prev) => Math.min(prev + 1, landmarks.length));
    }, 80);
    return () => clearInterval(interval);
  }, [landmarks.length]);

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {/* Scanning line */}
      <motion.div
        className="absolute left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent, hsl(120,60%,55%), transparent)" }}
        initial={{ top: "10%" }}
        animate={{ top: ["10%", "85%", "10%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
      {/* Landmark dots */}
      {landmarks.slice(0, visibleCount).map((pt, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.8)]"
          style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0.6, 1, 0.6], scale: 1 }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.05 }}
        />
      ))}
      {/* Analyzing text */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <span className="text-white font-sans text-sm font-semibold tracking-wide">Analyzing...</span>
      </div>
    </div>
  );
};

const CameraCaptureStep = ({ step, answers, onSelect }: { step: OnboardingStep; answers: Record<string, string[]>; onSelect: StepRendererProps["onSelect"] }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(answers[step.key]?.[0] || null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    step.cameraMode === "selfie" ? "user" : "environment"
  );

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 1920 },
        },
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setCameraError("Camera access denied. Please enable camera permissions.");
    }
  }, [facingMode]);

  useEffect(() => {
    if (!capturedImage) {
      startCamera();
    }
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [facingMode]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(dataUrl);
    setIsAnalyzing(true);
    stream?.getTracks().forEach((t) => t.stop());

    // Simulate analysis then save
    setTimeout(() => {
      setIsAnalyzing(false);
      onSelect(step.key, dataUrl, true);
    }, 3000);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setIsAnalyzing(false);
    onSelect(step.key, "", true);
    startCamera();
  };

  const toggleCamera = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const isSelfie = step.cameraMode === "selfie";

  return (
    <div className="flex flex-col items-center">
      <h2 className="font-display text-2xl font-bold text-foreground text-center mb-2">
        {step.question}
      </h2>
      <p className="text-muted-foreground font-sans text-sm text-center mb-4">{step.description}</p>

      <div className="relative w-full rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: isSelfie ? "3/4" : "9/16" }}>
        {cameraError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6">
            <Camera className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-sm opacity-80">{cameraError}</p>
            <button
              onClick={startCamera}
              className="mt-4 px-4 py-2 rounded-full bg-white/20 text-sm"
            >
              Try Again
            </button>
          </div>
        ) : capturedImage ? (
          <>
            <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
            {isAnalyzing && <AnalyzingOverlay isSelfie={isSelfie} />}
          </>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
            />
            {/* Lighting quality indicator */}
            <LightingIndicator />
            {/* Guide overlay */}
            {isSelfie && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* Professional face scanning frame */}
                <div className="relative w-56 h-72">
                  {/* Corner brackets */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/70 rounded-tl-2xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/70 rounded-tr-2xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/70 rounded-bl-2xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/70 rounded-br-2xl" />
                  {/* Subtle oval guide */}
                  <svg viewBox="0 0 224 288" className="w-full h-full" fill="none">
                    <ellipse cx="112" cy="144" rx="90" ry="120" stroke="white" strokeWidth="1" strokeDasharray="6 4" opacity="0.35" />
                  </svg>
                  {/* Center crosshair */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-4 h-[1px] bg-white/40" />
                    <div className="w-[1px] h-4 bg-white/40 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                </div>
                {/* Instruction text */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                  <span className="text-white/80 text-xs font-sans tracking-wide bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">Position your face within the frame</span>
                </div>
              </div>
            )}
            {!isSelfie && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* Professional body scanning frame */}
                <div className="relative w-44 h-[22rem]">
                  {/* Corner brackets */}
                  <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-white/70 rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-white/70 rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-white/70 rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-white/70 rounded-br-xl" />
                  {/* Subtle body silhouette guide */}
                  <svg viewBox="0 0 176 352" className="w-full h-full" fill="none">
                    <path d="M88,30 C88,30 70,30 70,50 C70,65 75,70 65,100 C55,130 50,140 50,170 C50,200 55,220 55,250 C55,280 50,310 50,330 M88,30 C88,30 106,30 106,50 C106,65 101,70 111,100 C121,130 126,140 126,170 C126,200 121,220 121,250 C121,280 126,310 126,330" stroke="white" strokeWidth="1" strokeDasharray="6 4" opacity="0.25" />
                    <circle cx="88" cy="18" r="12" stroke="white" strokeWidth="1" strokeDasharray="4 3" opacity="0.25" />
                  </svg>
                </div>
                {/* Instruction text */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                  <span className="text-white/80 text-xs font-sans tracking-wide bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">Stand back and fit your full body</span>
                </div>
              </div>
            )}
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex items-center gap-4 mt-6">
        {capturedImage && !isAnalyzing ? (
          <button
            onClick={handleRetake}
            className="px-6 py-3 rounded-full bg-secondary text-foreground font-sans font-semibold text-sm"
          >
            Retake
          </button>
        ) : !capturedImage ? (
          <>
            <button
              onClick={toggleCamera}
              className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center"
            >
              <FlipHorizontal className="w-5 h-5 text-foreground" />
            </button>
            <button
              onClick={handleCapture}
              className="w-16 h-16 rounded-full border-4 border-foreground/30 bg-white flex items-center justify-center"
            >
              <div className="w-12 h-12 rounded-full bg-[hsl(0,70%,68%)]" />
            </button>
            <div className="w-12" />
          </>
        ) : null}
      </div>
    </div>
  );
};

const GeneratingStep = ({ step }: { step: OnboardingStep }) => {
  const [progress, setProgress] = useState<number[]>([0, 0, 0, 0, 0]);
  const labels = [
    "Building your Color Palette",
    "Crafting your Style Guide",
    "Analyzing your preferences",
    "Finding the best matches",
    "Generating personal outfits",
  ];

  useEffect(() => {
    let currentStep = 0;
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = [...prev];
        if (currentStep < 5) {
          next[currentStep] = Math.min(next[currentStep] + Math.random() * 15 + 5, 100);
          if (next[currentStep] >= 100) {
            next[currentStep] = 100;
            currentStep++;
          }
        }
        return next;
      });
      if (currentStep >= 5) clearInterval(interval);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center pt-8">
      <div className="w-48 h-48 mb-6 flex items-center justify-center">
        <svg viewBox="0 0 200 160" className="w-full h-full" fill="none" stroke="hsl(var(--foreground))" strokeWidth="1">
          {/* Clothes rack */}
          <line x1="40" y1="20" x2="40" y2="140" strokeWidth="2" />
          <line x1="160" y1="20" x2="160" y2="140" strokeWidth="2" />
          <line x1="30" y1="20" x2="170" y2="20" strokeWidth="3" />
          {/* Hangers with clothes */}
          <path d="M60,20 L60,30 Q60,50 50,70 L70,70 Q60,50 60,30" fill="hsl(0,0%,95%)" />
          <path d="M80,20 L80,35 Q75,55 70,75 L90,75 Q85,55 80,35" fill="hsl(0,50%,70%)" />
          <path d="M100,20 L100,30 Q100,50 95,80 L105,80 Q100,50 100,30" fill="hsl(210,30%,75%)" />
          <path d="M120,20 L120,35 Q115,55 110,75 L130,75 Q125,55 120,35" fill="hsl(210,20%,85%)" />
          <path d="M140,20 L140,30 Q140,50 135,70 L145,70 Q140,50 140,30" fill="hsl(220,20%,30%)" />
        </svg>
      </div>

      <h2 className="font-display text-2xl font-bold text-foreground text-center mb-8">
        {step.question}
      </h2>

      <div className="w-full space-y-4">
        {labels.map((label, i) => (
          <div key={label}>
            <div className="flex justify-between mb-1">
              <span className={`font-sans text-sm ${progress[i] > 0 && progress[i] < 100 ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                {label}
              </span>
              <span className="font-sans text-sm text-muted-foreground">{Math.round(progress[i])}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-200"
                style={{
                  width: `${progress[i]}%`,
                  background: progress[i] > 0 ? "linear-gradient(90deg, hsl(30,90%,60%), hsl(350,70%,65%))" : undefined,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const faceShapes = [
  { shape: "Oval", icon: "⬮", description: "Balanced proportions with a gently rounded jawline" },
  { shape: "Round", icon: "⬤", description: "Equal width and length with soft angles" },
  { shape: "Square", icon: "⬜", description: "Strong jawline with equal width forehead" },
  { shape: "Heart", icon: "♡", description: "Wider forehead tapering to a narrow chin" },
  { shape: "Oblong", icon: "⏐", description: "Longer than wide with a straight cheek line" },
  { shape: "Diamond", icon: "◇", description: "Narrow forehead and jaw, wide cheekbones" },
];

const bodyShapeResults: Record<string, { label: string; traits: string[] }[]> = {
  female: [
    { label: "Hourglass", traits: ["Balanced shoulders & hips", "Defined waist", "Curvy silhouette"] },
    { label: "Triangle", traits: ["Narrower shoulders", "Wider hips", "Defined lower body"] },
    { label: "Inverted Triangle", traits: ["Broader shoulders", "Narrower hips", "Athletic upper body"] },
    { label: "Rectangle", traits: ["Balanced proportions", "Straight silhouette", "Even distribution"] },
    { label: "Round", traits: ["Fuller midsection", "Proportionate limbs", "Soft curves"] },
  ],
  male: [
    { label: "Rectangle", traits: ["Even proportions", "Straight torso", "Balanced build"] },
    { label: "Triangle", traits: ["Narrower shoulders", "Wider waist", "Solid lower body"] },
    { label: "Inverted Triangle", traits: ["Broad shoulders", "Narrow waist", "V-shaped torso"] },
    { label: "Oval", traits: ["Fuller midsection", "Rounded torso", "Proportionate limbs"] },
    { label: "Trapezoid", traits: ["Wide shoulders", "Slightly narrow waist", "Athletic build"] },
  ],
};

const DetectionResultStep = ({ step, answers, gender, aiResults }: { step: OnboardingStep; answers: Record<string, string[]>; gender?: "female" | "male" | null; aiResults?: Record<string, any> }) => {
  const isFace = step.detectionMode === "face";
  const [revealed, setRevealed] = useState(false);
  const isLoading = isFace ? !aiResults?.face : !aiResults?.body;

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setRevealed(true);
        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate([15, 50, 25]);
        // Subtle chime via Web Audio API
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const playTone = (freq: number, start: number, dur: number) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.12, ctx.currentTime + start);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
            osc.connect(gain).connect(ctx.destination);
            osc.start(ctx.currentTime + start);
            osc.stop(ctx.currentTime + start + dur);
          };
          playTone(880, 0, 0.15);
          playTone(1320, 0.1, 0.2);
        } catch (_) {}
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Use AI results if available, fall back to deterministic mock
  const faceAI = aiResults?.face;
  const bodyAI = aiResults?.body;

  const detectedFaceShape = faceAI
    ? faceShapes.find((f) => f.shape === faceAI.faceShape) || { shape: faceAI.faceShape, icon: "◎", description: faceAI.description || "" }
    : faceShapes[Math.abs((answers.ageRange?.[0]?.charCodeAt(0) || 0) + (answers.styleGoal?.[0]?.length || 0)) % faceShapes.length];

  // Override description with AI description if available
  const faceDescription = faceAI?.description || detectedFaceShape.description;

  const genderKey = gender || "female";
  const bodyShapes = bodyShapeResults[genderKey];
  const detectedBodyShape = bodyAI
    ? { label: bodyAI.bodyShape, traits: bodyAI.traits || [] }
    : bodyShapes[Math.abs((answers.budget?.[0]?.charCodeAt(0) || 0) + (answers.styleChallenge?.[0]?.length || 0)) % bodyShapes.length];

  const capturedImage = isFace ? answers.selfieCapture?.[0] : answers.fullBodyCapture?.[0];

  if (isFace) {
    return (
      <div className="flex flex-col items-center">
        <motion.h2
          className="font-display text-2xl lg:text-3xl font-bold text-foreground text-center mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {isLoading ? "Analyzing your face..." : step.question}
        </motion.h2>
        <motion.p
          className="text-muted-foreground font-sans text-sm text-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {isLoading ? "Our AI is studying your facial proportions" : step.description}
        </motion.p>

        {/* Face photo with shape overlay */}
        <motion.div
          className="relative w-40 h-40 rounded-full overflow-hidden mb-6 ring-4 ring-primary/30"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {capturedImage ? (
            <img src={capturedImage} alt="Your selfie" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
              <User className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
          {isLoading && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </motion.div>

        {/* Morphing face illustration during analysis */}
        {isLoading && (
          <FaceShapeIllustration shape="oval" size={80} morphing className="mb-4" />
        )}

        {/* Detected shape */}
        <AnimatePresence>
          {revealed && !isLoading && (
            <motion.div
              className="flex flex-col items-center gap-2 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <FaceShapeIllustration shape={detectedFaceShape.shape} size={90} className="mb-2" />
              <h3 className="font-display text-3xl font-bold text-foreground">{detectedFaceShape.shape}</h3>
              <p className="text-muted-foreground font-sans text-sm text-center max-w-xs">{faceDescription}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* All face shapes reference */}
        {!isLoading && (
          <motion.div
            className="w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: revealed ? 1 : 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-muted-foreground font-sans text-xs text-center mb-3 uppercase tracking-wider">Face shape guide</p>
            <div className="grid grid-cols-3 gap-2">
              {faceShapes.map((fs) => (
                <div
                  key={fs.shape}
                  className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                    fs.shape === detectedFaceShape.shape
                      ? "bg-foreground text-background"
                      : "bg-secondary/60 text-muted-foreground"
                  }`}
                >
                  <span className="text-lg mb-1">{fs.icon}</span>
                  <span className="font-sans text-xs font-medium">{fs.shape}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  // Body shape result
  return (
    <div className="flex flex-col items-center">
      <motion.h2
        className="font-display text-2xl lg:text-3xl font-bold text-foreground text-center mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {isLoading ? "Analyzing your body shape..." : step.question}
      </motion.h2>
      <motion.p
        className="text-muted-foreground font-sans text-sm text-center mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {isLoading ? "Our AI is studying your body proportions" : step.description}
      </motion.p>

      {/* Body photo */}
      <motion.div
        className="relative w-32 h-52 rounded-2xl overflow-hidden mb-6 ring-4 ring-primary/30"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {capturedImage ? (
          <img src={capturedImage} alt="Your body" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <User className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        {isLoading && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </motion.div>

      {/* Morphing body illustration during analysis */}
      {isLoading && (
        <BodyShapeIllustration shape="rectangle" size={100} morphing className="mb-4" />
      )}

      {/* Detected body shape */}
      <AnimatePresence>
        {revealed && !isLoading && (
          <motion.div
            className="flex flex-col items-center gap-2 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <BodyShapeIllustration shape={detectedBodyShape.label} size={100} className="mb-2" />
            <h3 className="font-display text-3xl font-bold text-foreground">{detectedBodyShape.label}</h3>
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              {detectedBodyShape.traits.map((trait, i) => (
                <motion.span
                  key={trait}
                  className="px-3 py-1 rounded-full bg-secondary text-foreground font-sans text-xs font-medium"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.15 }}
                >
                  {trait}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* All body shapes */}
      {!isLoading && (
        <motion.div
          className="w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: revealed ? 1 : 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-muted-foreground font-sans text-xs text-center mb-3 uppercase tracking-wider">Body shape guide</p>
          <div className="flex flex-col gap-2">
            {bodyShapes.map((bs) => (
              <div
                key={bs.label}
                className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                  bs.label === detectedBodyShape.label
                    ? "bg-foreground text-background"
                    : "bg-secondary/60 text-muted-foreground"
                }`}
              >
                <span className="font-sans text-sm font-medium">{bs.label}</span>
                {bs.label === detectedBodyShape.label && (
                  <Check className="h-4 w-4" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

const StepRenderer = ({ step, answers, onSelect, gender, aiResults }: StepRendererProps) => {
  const selected = answers[step.key] || [];
  const isSingle = step.type === "radio";

  if (step.type === "height") {
    return <HeightStep answers={answers} onSelect={onSelect} />;
  }

  if (step.type === "notification") {
    return <NotificationStep step={step} />;
  }

  if (step.type === "selfieIntro") {
    return <SelfieIntroStep step={step} gender={gender} />;
  }

  if (step.type === "selfieGuide") {
    return <SelfieGuideStep step={step} gender={gender} />;
  }

  if (step.type === "cameraCapture") {
    return <CameraCaptureStep step={step} answers={answers} onSelect={onSelect} />;
  }

  if (step.type === "generating") {
    return <GeneratingStep step={step} />;
  }

  if (step.type === "detectionResult") {
    return <DetectionResultStep step={step} answers={answers} gender={gender} aiResults={aiResults} />;
  }

  if (step.type === "sizeGrid" && step.subGroups) {
    return (
      <div>
        <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground text-center mb-6">
          {step.question}
        </h2>
        {step.subGroups.map((group) => {
          const groupKey = `${step.key}_${group.label.toLowerCase()}`;
          const groupSelected = answers[groupKey] || [];
          return (
            <div key={group.label} className="mb-6">
              <h3 className="font-sans font-semibold text-foreground text-center mb-3">{group.label}</h3>
              <div className="grid grid-cols-5 gap-2">
                {group.options.map((size, sizeIdx) => {
                  const isActive = groupSelected.includes(size);
                  return (
                    <motion.button
                      key={size}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.25, delay: sizeIdx * 0.02, ease: [0.22, 1, 0.36, 1] }}
                      onClick={() => onSelect(groupKey, size, false)}
                      className={`py-3 px-1 rounded-xl text-sm font-sans font-medium transition-all active:scale-95 ${
                        isActive
                          ? "bg-foreground text-background shadow-md"
                          : "bg-secondary text-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {size}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (step.type === "bodyShape") {
    return (
      <div>
        <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground text-center mb-6">
          {step.question}
        </h2>
        <div className="flex flex-col gap-3">
          {step.options.map((option, index) => {
            const isActive = selected.includes(option);
            const genderKey = gender || "female";
            const shapeImg = bodyShapeImages[genderKey]?.[option];
            return (
              <motion.button
                key={option}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => onSelect(step.key, option, true)}
                className={`flex items-center gap-4 p-3 rounded-2xl transition-all text-left active:scale-[0.98] ${
                  isActive
                    ? "bg-secondary ring-2 ring-foreground"
                    : "bg-secondary/50"
                }`}
              >
                {shapeImg ? (
                  <img src={shapeImg} alt={option} className="w-14 h-20 object-contain flex-shrink-0" />
                ) : (
                  <div className="w-14 h-20 bg-muted rounded-lg flex-shrink-0" />
                )}
                <span className="font-sans font-medium text-foreground">{option}</span>
                <div className={`ml-auto w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isActive ? "border-foreground bg-foreground" : "border-muted-foreground/30 bg-background"
                }`}>
                  {isActive && <Check className="h-3.5 w-3.5 text-background" />}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  // checkbox or radio list
  return (
    <div>
      {step.subtitle && (
        <p className="text-muted-foreground font-sans text-sm text-center mb-1">{step.subtitle}</p>
      )}
      <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground text-center mb-6">
        {step.question}
      </h2>
      <div className="flex flex-col gap-3">
        {step.options.map((option, index) => {
          const isActive = selected.includes(option);
          const logos = step.brandLogos?.[option];
          const brands = step.brandLabels?.[option];
          return (
            <motion.button
              key={option}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => onSelect(step.key, option, isSingle)}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all text-left active:scale-[0.98] ${
                isActive
                  ? "bg-secondary ring-2 ring-foreground"
                  : "bg-secondary/50"
              }`}
            >
              <div className="flex-1 pr-2">
                <span className="font-sans text-sm text-foreground">{option}</span>
                {logos ? (
                  <div className="flex items-center gap-4 mt-2">
                    {logos.map((logo) => (
                      <img
                        key={logo.name}
                        src={brandLogoMap[logo.image]}
                        alt={logo.name}
                        className="h-10 w-auto object-contain rounded-md bg-background border border-border shadow-sm transition-transform duration-200 hover:scale-110 active:scale-95"
                      />
                    ))}
                  </div>
                ) : brands ? (
                  <div className="flex flex-wrap gap-3 mt-1.5">
                    {brands.map((brand) => (
                      <span key={brand} className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                        {brand}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              {isSingle ? (
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isActive ? "border-foreground bg-foreground" : "border-muted-foreground/30 bg-background"
                }`}>
                  {isActive && <Check className="h-3.5 w-3.5 text-background" />}
                </div>
              ) : (
                <div className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isActive ? "border-foreground bg-foreground" : "border-muted-foreground/30 bg-background"
                }`}>
                  {isActive && <Check className="h-3 w-3 text-background" />}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default StepRenderer;
