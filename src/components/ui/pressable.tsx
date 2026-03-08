import { motion, HTMLMotionProps } from "framer-motion";
import { forwardRef, ReactNode } from "react";
import { haptic } from "@/lib/haptics";

interface PressableProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  hapticStyle?: "light" | "medium" | "heavy" | "success" | "selection";
  className?: string;
  onClick?: () => void;
}

/**
 * A wrapper component that adds press-scale animation and haptic feedback.
 * Use around buttons, cards, or any tappable element for a polished mobile feel.
 */
const Pressable = forwardRef<HTMLDivElement, PressableProps>(
  ({ children, hapticStyle = "light", onClick, className = "", ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        onClick={() => {
          haptic(hapticStyle);
          onClick?.();
        }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Pressable.displayName = "Pressable";

export default Pressable;
