import { type ReactNode } from "react";
import { motion } from "framer-motion";

export function GoldDivider() {
  return (
    <div className="relative h-px w-24 mx-auto my-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(43,80%,58%)] to-transparent opacity-40" />
      <motion.div
        className="absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-[hsl(43,80%,68%)] to-transparent"
        animate={{ x: ["-3rem", "6rem"] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export function PremiumCardWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="relative rounded-2xl">
      {/* Animated gold border shimmer */}
      <div className="absolute -inset-px rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(43,80%,58%,0.15)] via-transparent to-[hsl(43,80%,58%,0.08)]" />
        <motion.div
          className="absolute inset-0"
          style={{
            background: "conic-gradient(from 0deg, transparent, hsl(43 80% 58% / 0.3), transparent, transparent)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </div>
      {/* Inner card */}
      <div className="relative glass rounded-2xl p-8 backdrop-blur-xl bg-background/60">
        {/* Top gold radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-[hsl(43,80%,58%,0.06)] rounded-full blur-2xl pointer-events-none" />
        {children}
      </div>
    </div>
  );
}

export function GoldShimmerButton({ children, ...props }: React.ComponentProps<"button"> & { children: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-xl">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
      />
      {children}
    </div>
  );
}
