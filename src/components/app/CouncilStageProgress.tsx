import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CouncilStageProgressProps {
  currentStage: number; // 0 = idle, 1 = consulting, 2 = ranking, 3 = synthesizing
  stageStatus: "idle" | "start" | "complete";
}

const stages = [
  { label: "Consulting", icon: "🧠" },
  { label: "Ranking", icon: "⚖️" },
  { label: "Synthesizing", icon: "✨" },
];

export function CouncilStageProgress({ currentStage, stageStatus }: CouncilStageProgressProps) {
  if (currentStage === 0) return null;

  return (
    <div className="flex items-center justify-center gap-1 py-3">
      {stages.map((stage, i) => {
        const stageNum = i + 1;
        const isComplete = currentStage > stageNum || (currentStage === stageNum && stageStatus === "complete");
        const isActive = currentStage === stageNum && stageStatus === "start";
        const isPending = currentStage < stageNum;

        return (
          <div key={stage.label} className="flex items-center gap-1">
            <div className="flex flex-col items-center gap-1">
              <motion.div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-colors",
                  isComplete && "border-primary bg-primary/20",
                  isActive && "border-primary bg-primary/10",
                  isPending && "border-border bg-card"
                )}
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={isActive ? { duration: 1.5, repeat: Infinity } : {}}
              >
                {isComplete ? "✓" : stage.icon}
              </motion.div>
              <span
                className={cn(
                  "text-[9px] font-sans font-medium",
                  isComplete && "text-primary",
                  isActive && "text-primary",
                  isPending && "text-muted-foreground"
                )}
              >
                {stage.label}
              </span>
            </div>
            {i < stages.length - 1 && (
              <div
                className={cn(
                  "w-8 h-0.5 rounded-full mb-4 transition-colors",
                  currentStage > stageNum + 1 || (currentStage === stageNum + 1)
                    ? "bg-primary/50"
                    : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
