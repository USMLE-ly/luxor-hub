import { motion, useInView, type Variants } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

type RevealMode = "word" | "char" | "blur";

interface TextRevealProps {
  children: string;
  mode?: RevealMode;
  className?: string;
  delay?: number;
  once?: boolean;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
}

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 12, filter: "blur(0px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.4, delay: i * 0.04, ease: [0.23, 0.86, 0.39, 0.96] },
  }),
};

const charVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: i * 0.02, ease: "easeOut" },
  }),
};

const blurVariants: Variants = {
  hidden: { opacity: 0, filter: "blur(8px)" },
  visible: (i: number) => ({
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.5, delay: i * 0.05, ease: "easeOut" },
  }),
};

const modeMap: Record<RevealMode, Variants> = {
  word: wordVariants,
  char: charVariants,
  blur: blurVariants,
};

export function TextReveal({
  children,
  mode = "word",
  className,
  delay = 0,
  once = true,
  as: Tag = "span",
}: TextRevealProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once, margin: "-60px" });
  const variants = modeMap[mode];

  const units = mode === "char" ? children.split("") : children.split(" ");

  return (
    <Tag ref={ref as any} className={cn("inline", className)} aria-label={children}>
      {units.map((unit, i) => (
        <motion.span
          key={`${unit}-${i}`}
          custom={i + delay}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={variants}
          className="inline-block whitespace-pre"
          aria-hidden="true"
        >
          {unit}
          {mode !== "char" && i < units.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </Tag>
  );
}
