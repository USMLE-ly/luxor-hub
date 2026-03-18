import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface RainbowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function RainbowButton({
  children,
  className,
  ...props
}: RainbowButtonProps) {
  return (
    <motion.button
      whileHover={{
        scale: 1.03,
        y: -2,
        boxShadow: "0 7px 0 0 rgba(0,0,0,0.25), 0 12px 30px -4px rgba(0,0,0,0.3)",
        transition: { duration: 0.1 },
      }}
      whileTap={{
        scale: 0.97,
        y: 4,
        boxShadow: "0 1px 0 0 rgba(0,0,0,0.25), 0 2px 8px -2px rgba(0,0,0,0.1)",
        transition: { duration: 0.08 },
      }}
      initial={{
        boxShadow: "0 4px 0 0 rgba(0,0,0,0.2), 0 6px 20px -4px rgba(0,0,0,0.2)",
      }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={cn(
        "group relative inline-flex h-11 animate-rainbow cursor-pointer items-center justify-center rounded-xl border-0 bg-[length:200%] px-8 py-2 font-medium text-primary-foreground transition-colors [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        "before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:bg-[length:200%] before:[filter:blur(calc(0.8*1rem))]",
        "bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] text-white",
        "dark:bg-[linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] dark:text-black",
        className
      )}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
