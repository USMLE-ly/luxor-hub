import { r as reactExports, j as jsxRuntimeExports } from "./index-BJjnbSuc.js";
import { c as cn, h as haptic, a as cva } from "./AppContent-4cFLEqQ4.js";
import { m as motion } from "./proxy-DPNpeU0t.js";
const gradientButtonVariants = cva(
  [
    "gradient-button",
    "inline-flex items-center justify-center",
    "rounded-[12px] min-w-[132px] px-6 py-3",
    "text-sm leading-[19px] font-[600] text-white",
    "font-sans font-bold",
    "border-b-4 select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    "disabled:pointer-events-none disabled:opacity-50"
  ],
  {
    variants: {
      variant: {
        default: "border-b-[hsl(43_74%_32%)]",
        variant: "gradient-button-variant border-b-[rgba(255,255,255,0.1)]"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
const GradientButton = reactExports.forwardRef(
  ({ className, variant, asChild = false, onClick, ...props }, ref) => {
    const shadowColor = variant === "variant" ? "rgba(255,255,255,0.08)" : "hsl(43 74% 32%)";
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.button,
      {
        className: cn(gradientButtonVariants({ variant, className })),
        ref,
        initial: { boxShadow: `0 5px 0 0 ${shadowColor}`, y: 0 },
        whileHover: {
          scale: 1.03,
          boxShadow: `0 7px 0 0 ${shadowColor}`,
          transition: { duration: 0.1 }
        },
        whileTap: {
          scale: 0.97,
          y: 4,
          boxShadow: `0 1px 0 0 ${shadowColor}`,
          transition: { duration: 0.08 }
        },
        transition: { type: "spring", stiffness: 400, damping: 20 },
        onClick: (e) => {
          haptic("medium");
          onClick == null ? void 0 : onClick(e);
        },
        ...props
      }
    );
  }
);
GradientButton.displayName = "GradientButton";
export {
  GradientButton as G
};
