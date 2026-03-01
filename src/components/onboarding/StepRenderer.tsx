import { useState } from "react";
import { Check, Camera, Smartphone } from "lucide-react";
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
          {/* Person taking selfie illustration */}
          <circle cx="85" cy="55" r="25" /> {/* Head */}
          <path d="M60,80 Q60,130 70,160 L100,160 Q110,130 110,80" /> {/* Body */}
          <path d="M110,90 Q130,70 140,60 L145,55" /> {/* Arm holding phone */}
          <rect x="135" y="45" width="18" height="30" rx="3" /> {/* Phone */}
          {/* Sparkles */}
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
      {/* Placeholder image area */}
      <div className="w-full aspect-[3/4] rounded-2xl bg-secondary/50 mb-6 flex items-center justify-center overflow-hidden">
        <div className="text-center">
          <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <Smartphone className="w-8 h-8 text-muted-foreground mx-auto" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-[hsl(0,70%,68%)] font-sans text-sm mb-2">Step {step.stepNumber}</p>
        <h2 className="font-display text-xl font-bold text-foreground">{step.question}</h2>
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
                className={`flex items-center gap-4 p-3 rounded-xl border transition-all text-left ${
                  isActive
                    ? "border-primary bg-primary/5"
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
                <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  isActive ? "border-primary" : "border-muted-foreground/40"
                }`}>
                  {isActive && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
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
      <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground text-center mb-6">
        {step.question}
      </h2>
      <div className="flex flex-col gap-3">
        {step.options.map((option) => {
          const isActive = selected.includes(option);
          return (
            <button
              key={option}
              onClick={() => onSelect(step.key, option, isSingle)}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                isActive
                  ? "border-primary bg-primary/5"
                  : "border-border bg-secondary/30 hover:border-muted-foreground/40"
              }`}
            >
              <span className="font-sans text-sm text-foreground pr-4">{option}</span>
              {isSingle ? (
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  isActive ? "border-primary" : "border-muted-foreground/40"
                }`}>
                  {isActive && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
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
