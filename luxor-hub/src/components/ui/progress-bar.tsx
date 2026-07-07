import { motion } from "framer-motion";

interface ProgressBarProps {
  /** 0-100 progress percentage */
  value: number;
  /** Optional label shown above the bar */
  label?: string;
  /** Sub-label for current stage description */
  stage?: string;
  /** Color variant */
  variant?: "default" | "purple" | "gold";
  /** Show pulsing animation when in progress */
  animated?: boolean;
  className?: string;
}

const variantColors = {
  default: "bg-primary",
  purple: "bg-purple-500",
  gold: "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300",
};

export function ProgressBar({
  value,
  label,
  stage,
  variant = "purple",
  animated = true,
  className = "",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={`w-full ${className}`}>
      {(label || stage) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-[10px] uppercase tracking-[0.15em] text-white/50 font-semibold">
              {label}
            </span>
          )}
          {stage && (
            <span className="text-[10px] text-white/40 truncate max-w-[60%] text-right">
              {stage}
            </span>
          )}
        </div>
      )}
      <div className="relative h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-full ${variantColors[variant]}`}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        />
        {animated && clamped > 0 && clamped < 100 && (
          <motion.div
            className="absolute inset-y-0 left-0 w-[30%] rounded-full bg-white/20"
            animate={{ x: ["-100%", "400%"] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>
    </div>
  );
}
