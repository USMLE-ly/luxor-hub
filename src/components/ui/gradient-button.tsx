import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const gradientButtonVariants = cva(
  [
    "gradient-button",
    "inline-flex items-center justify-center",
    "rounded-[12px] min-w-[132px] px-6 py-3",
    "text-sm leading-[19px] font-[600] text-white",
    "font-sans font-bold",
    "border-b-4 select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        default: "border-b-[hsl(43_74%_32%)]",
        variant: "gradient-button-variant border-b-[rgba(255,255,255,0.1)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof gradientButtonVariants> {
  asChild?: boolean
}

const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const shadowColor = variant === "variant"
      ? "rgba(255,255,255,0.08)"
      : "hsl(43 74% 32%)"

    return (
      <motion.button
        className={cn(gradientButtonVariants({ variant, className }))}
        ref={ref}
        initial={{ boxShadow: `0 5px 0 0 ${shadowColor}`, y: 0 }}
        whileHover={{
          scale: 1.03,
          boxShadow: `0 7px 0 0 ${shadowColor}`,
          transition: { duration: 0.1 },
        }}
        whileTap={{
          scale: 0.97,
          y: 4,
          boxShadow: `0 1px 0 0 ${shadowColor}`,
          transition: { duration: 0.08 },
        }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        {...(props as any)}
      />
    )
  }
)
GradientButton.displayName = "GradientButton"

export { GradientButton, gradientButtonVariants }
