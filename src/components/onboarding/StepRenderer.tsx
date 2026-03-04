import { useState, useRef, useCallback, useEffect } from "react";
import { Check, Camera, Smartphone, Video, User, FlipHorizontal } from "lucide-react";
import type { OnboardingStep } from "./onboardingSteps";

interface StepRendererProps {
  step: OnboardingStep;
  answers: Record<string, string[]>;
  onSelect: (key: string, option: string, singleSelect: boolean) => void;
}

const bodyShapeSvgs: Record<string, string> = {
  Hourglass: "M30,10 Q30,10 25,25 Q20,40 25,55 Q30,70 30,70 L50,70 Q50,70 55,55 Q60,40 55,25 Q50,10 50,10 Z",
  Triangle: "M35,10 L30,10 L20,70 L60,70 L50,10 L45,10 Z",
  "Inverted triangle": "M20,10 L60,10 L50,70 L30,70 Z",
  Rectangle: "M28,10 L52,10 L52,70 L28,70 Z",
  Round: "M30,10 Q20,25 20,40 Q20,55 30,70 L50,70 Q60,55 60,40 Q60,25 50,10 Z",
  Oval: "M30,10 Q20,25 20,40 Q20,55 30,70 L50,70 Q60,55 60,40 Q60,25 50,10 Z",
  Trapezoid: "M25,10 L55,10 L60,70 L20,70 Z",
};

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

const SelfieIntroStep = ({ step }: { step: OnboardingStep }) => {
  return (
    <div className="flex flex-col items-center text-center pt-12">
      <div className="w-48 h-48 mb-8 flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="w-full h-full" fill="none" stroke="hsl(var(--foreground))" strokeWidth="1.5">
          <circle cx="85" cy="55" r="25" />
          <path d="M60,80 Q60,130 70,160 L100,160 Q110,130 110,80" />
          <path d="M110,90 Q130,70 140,60 L145,55" />
          <rect x="135" y="45" width="18" height="30" rx="3" />
          <path d="M155,40 L157,35 L159,40 L164,42 L159,44 L157,49 L155,44 L150,42 Z" fill="hsl(40,80%,55%)" stroke="none" />
          <path d="M145,30 L146,27 L147,30 L150,31 L147,32 L146,35 L145,32 L142,31 Z" fill="hsl(40,80%,55%)" stroke="none" />
        </svg>
      </div>
      <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-3">
        {step.question}
      </h2>
      <p className="text-muted-foreground font-sans">{step.description}</p>
    </div>
  );
};

const SelfieGuideStep = ({ step }: { step: OnboardingStep }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="w-full aspect-[3/4] rounded-2xl bg-secondary/50 mb-6 flex items-center justify-center overflow-hidden relative">
        {step.stepNumber === 5 ? (
          /* Step 5: show green dashed oval preview */
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="w-56 h-72 relative">
              <svg viewBox="0 0 224 288" className="w-full h-full" fill="none">
                <ellipse cx="112" cy="144" rx="100" ry="130" stroke="hsl(120, 60%, 55%)" strokeWidth="4" strokeDasharray="8 6" fill="none" />
              </svg>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <Smartphone className="w-8 h-8 text-muted-foreground mx-auto" />
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

const CameraCaptureStep = ({ step, answers, onSelect }: { step: OnboardingStep; answers: Record<string, string[]>; onSelect: StepRendererProps["onSelect"] }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(answers[step.key]?.[0] || null);
  const [cameraError, setCameraError] = useState<string | null>(null);
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
    
    // Mirror for selfie
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(dataUrl);
    onSelect(step.key, dataUrl, true);
    stream?.getTracks().forEach((t) => t.stop());
  };

  const handleRetake = () => {
    setCapturedImage(null);
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
          <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
            />
            {/* Guide overlay */}
            {isSelfie && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg viewBox="0 0 224 288" className="w-56 h-72" fill="none">
                  <ellipse cx="112" cy="144" rx="100" ry="130" stroke="hsl(120, 60%, 55%)" strokeWidth="4" strokeDasharray="8 6" fill="none" />
                </svg>
              </div>
            )}
            {!isSelfie && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-40 h-80 border-2 border-white/40 rounded-2xl" />
              </div>
            )}
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex items-center gap-4 mt-6">
        {capturedImage ? (
          <button
            onClick={handleRetake}
            className="px-6 py-3 rounded-full bg-secondary text-foreground font-sans font-semibold text-sm"
          >
            Retake
          </button>
        ) : (
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
            <div className="w-12" /> {/* Spacer */}
          </>
        )}
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

const StepRenderer = ({ step, answers, onSelect }: StepRendererProps) => {
  const selected = answers[step.key] || [];
  const isSingle = step.type === "radio";

  if (step.type === "height") {
    return <HeightStep answers={answers} onSelect={onSelect} />;
  }

  if (step.type === "notification") {
    return <NotificationStep step={step} />;
  }

  if (step.type === "selfieIntro") {
    return <SelfieIntroStep step={step} />;
  }

  if (step.type === "selfieGuide") {
    return <SelfieGuideStep step={step} />;
  }

  if (step.type === "cameraCapture") {
    return <CameraCaptureStep step={step} answers={answers} onSelect={onSelect} />;
  }

  if (step.type === "generating") {
    return <GeneratingStep step={step} />;
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
                {group.options.map((size) => {
                  const isActive = groupSelected.includes(size);
                  return (
                    <button
                      key={size}
                      onClick={() => onSelect(groupKey, size, true)}
                      className={`py-2.5 px-1 rounded-lg text-sm font-sans font-medium transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {size}
                    </button>
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
          {step.options.map((option) => {
            const isActive = selected.includes(option);
            return (
              <button
                key={option}
                onClick={() => onSelect(step.key, option, true)}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left active:scale-[0.98] ${
                  isActive
                    ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/20"
                    : "border-border bg-secondary/30 hover:border-muted-foreground/40"
                }`}
              >
                <svg width="50" height="80" viewBox="0 0 80 80" className="flex-shrink-0">
                  <path
                    d={bodyShapeSvgs[option] || bodyShapeSvgs.Rectangle}
                    fill="hsl(20, 40%, 88%)"
                    stroke="hsl(20, 20%, 60%)"
                    strokeWidth="1.5"
                  />
                </svg>
                <span className="font-sans font-medium text-foreground">{option}</span>
                <div className={`ml-auto w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isActive ? "border-primary bg-primary" : "border-muted-foreground/40"
                }`}>
                  {isActive && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
                </div>
              </button>
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
        {step.options.map((option) => {
          const isActive = selected.includes(option);
          const brands = step.brandLabels?.[option];
          return (
            <button
              key={option}
              onClick={() => onSelect(step.key, option, isSingle)}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left active:scale-[0.98] ${
                isActive
                  ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/20"
                  : "border-border bg-secondary/30 hover:border-muted-foreground/40"
              }`}
            >
              <div className="flex-1 pr-2">
                <span className="font-sans text-sm text-foreground">{option}</span>
                {brands && (
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {brands.map((brand) => (
                      <span key={brand} className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                        {brand}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {isSingle ? (
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isActive ? "border-primary bg-primary" : "border-muted-foreground/40"
                }`}>
                  {isActive && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
                </div>
              ) : (
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                  isActive ? "border-primary bg-primary" : "border-muted-foreground/40"
                }`}>
                  {isActive && <Check className="h-3 w-3 text-primary-foreground" />}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StepRenderer;
