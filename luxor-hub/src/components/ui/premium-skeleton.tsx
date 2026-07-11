import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PremiumSkeletonProps {
  className?: string;
  variant?: "shimmer" | "pulse" | "shine";
}

export function PremiumSkeleton({ className, variant = "shimmer" }: PremiumSkeletonProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-emerald/30", className)}>
      {variant === "shimmer" && (
        <motion.div
          className="absolute inset-0 -skew-x-12"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)",
          }}
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 1.5, ease: [0.77, 0, 0.175, 1] }}
        />
      )}
      {variant === "shine" && (
        <motion.div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(90deg, transparent 30%, rgba(145,133,90,0.06) 50%, transparent 70%)",
            backgroundSize: "200% 100%",
          }}
          animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
          transition={{ duration: 2.5, ease: [0.77, 0, 0.175, 1] }}
        />
      )}
      {variant === "pulse" && (
        <motion.div
          className="absolute inset-0 bg-emerald/20"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, ease: [0.77, 0, 0.175, 1] }}
        />
      )}
    </div>
  );
}

export function PremiumCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/5 bg-emerald/20 backdrop-blur-sm p-6 space-y-4">
      <PremiumSkeleton className="h-48 w-full rounded-xl" />
      <div className="space-y-2">
        <PremiumSkeleton className="h-4 w-3/4" variant="shimmer" />
        <PremiumSkeleton className="h-3 w-1/2" variant="shine" />
      </div>
      <div className="flex gap-2">
        <PremiumSkeleton className="h-8 w-20 rounded-lg" variant="shimmer" />
        <PremiumSkeleton className="h-8 w-16 rounded-lg" variant="pulse" />
      </div>
    </div>
  );
}

export function PremiumTextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <PremiumSkeleton
          key={i}
          className={`h-3 rounded-lg ${i === lines - 1 ? "w-2/3" : "w-full"}`}
          variant={i % 2 === 0 ? "shimmer" : "shine"}
        />
      ))}
    </div>
  );
}

export function PremiumProfileSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-emerald/20">
      <PremiumSkeleton className="w-14 h-14 rounded-full" variant="shine" />
      <div className="space-y-2 flex-1">
        <PremiumSkeleton className="h-4 w-1/3" variant="shimmer" />
        <PremiumSkeleton className="h-3 w-1/2" variant="pulse" />
      </div>
    </div>
  );
}
