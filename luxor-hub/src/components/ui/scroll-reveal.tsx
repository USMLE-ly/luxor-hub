import { motion, type HTMLMotionProps } from "framer-motion";
import { type ReactNode, forwardRef } from "react";
import { cn } from "@/lib/utils";

/* Premium spring presets for luxury feel */
const SPRING_GENTLE = { type: "spring" as const, stiffness: 100, damping: 24, mass: 0.9 } as const;
const SPRING_SNAPPY = { type: "spring" as const, stiffness: 180, damping: 22, mass: 0.7 } as const;
const SPRING_HOVER = { type: "spring" as const, stiffness: 350, damping: 16, mass: 0.5 } as const;

interface ScrollRevealProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
}

export const ScrollReveal = forwardRef<HTMLDivElement, ScrollRevealProps>(
  ({ children, className, delay = 0, direction = "up", distance = 40, ...props }, ref) => {
    const directionOffset = {
      up: { y: distance },
      down: { y: -distance },
      left: { x: distance },
      right: { x: -distance },
      none: {},
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, ...directionOffset[direction] }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ ...SPRING_GENTLE, delay }}
        className={cn(className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
ScrollReveal.displayName = "ScrollReveal";

/* ── Stagger container for list animations ────────────── */
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.05,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: staggerDelay },
        },
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

/* ── Stagger item ─────────────────────────────────────── */
export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.98, filter: "blur(4px)" },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          transition: SPRING_SNAPPY,
        },
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

/* ── Magnetic hover card ──────────────────────────────── */
export function MagneticCard({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & HTMLMotionProps<"div">) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -6 }}
      whileTap={{ scale: 0.97 }}
      transition={SPRING_HOVER}
      className={cn("cursor-pointer", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/* ── Fade-in (simplest reveal, no direction) ──────────── */
export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
