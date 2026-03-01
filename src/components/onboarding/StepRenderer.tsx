import { Check } from "lucide-react";
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

const StepRenderer = ({ step, answers, onSelect }: StepRendererProps) => {
  const selected = answers[step.key] || [];
  const isSingle = step.type === "radio";

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
