import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { DoubleBezel } from "@/components/ui/double-bezel";
import { cn } from "@/lib/utils";

interface LuxuryEmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  variant?: "default" | "compact" | "editorial";
}

export function LuxuryEmptyState({
  icon,
  title,
  description,
  action,
  className,
  variant = "default",
}: LuxuryEmptyStateProps) {
  if (variant === "editorial") {
    return (
      <div className={cn("relative py-24 text-center", className)}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 rounded-full border border-gold/5" />
          <div className="absolute w-48 h-48 rounded-full border border-gold/3" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="relative z-10"
        >
          {icon && (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
              className="mb-6"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-gold/5 flex items-center justify-center ring-1 ring-gold/10">
                {icon}
              </div>
            </motion.div>
          )}
          <h3 className="font-display text-2xl md:text-3xl text-foreground mb-2">{title}</h3>
          {description && (
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6 font-sans leading-relaxed">
              {description}
            </p>
          )}
          {action && <div className="flex justify-center">{action}</div>}
        </motion.div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}
      >
        {icon && (
          <div className="w-12 h-12 rounded-full bg-emerald/20 flex items-center justify-center mb-3 ring-1 ring-white/5">
            {icon}
          </div>
        )}
        <p className="text-foreground font-sans text-sm font-medium mb-1">{title}</p>
        {description && <p className="text-muted-foreground text-xs font-sans max-w-xs">{description}</p>}
        {action && <div className="mt-4">{action}</div>}
      </motion.div>
    );
  }

  // Default variant
  return (
    <DoubleBezel radius="xl" glow="none" className={cn("w-full", className)}>
      <div className="py-16 px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        >
          {icon && (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
              className="mb-5"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gold/5 flex items-center justify-center ring-1 ring-gold/10">
                {icon}
              </div>
            </motion.div>
          )}
          <h3 className="font-display text-xl text-foreground mb-2">{title}</h3>
          {description && (
            <p className="text-muted-foreground text-sm max-w-sm mx-auto font-sans leading-relaxed mb-6">
              {description}
            </p>
          )}
          {action && <div className="flex justify-center">{action}</div>}
        </motion.div>
      </div>
    </DoubleBezel>
  );
}

/**
 * Pre-built empty states for common scenarios
 */
export function EmptyWardrobe({ onAdd }: { onAdd?: () => void }) {
  return (
    <LuxuryEmptyState
      variant="editorial"
      icon={
        <svg className="w-7 h-7 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
        </svg>
      }
      title="Your closet is an empty canvas"
      description="Snap a photo of your clothes and let AI build your digital wardrobe in seconds."
      action={
        onAdd && (
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-sm font-medium font-sans hover:opacity-90 transition-opacity"
          >
            Add Your First Piece
          </button>
        )
      }
    />
  );
}

export function EmptyOutfits({ onGenerate }: { onGenerate?: () => void }) {
  return (
    <LuxuryEmptyState
      variant="editorial"
      icon={
        <svg className="w-7 h-7 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      }
      title="No outfits generated yet"
      description="Tell us the occasion and let AI create a complete look from your closet."
      action={
        onGenerate && (
          <button
            onClick={onGenerate}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-sm font-medium font-sans hover:opacity-90 transition-opacity"
          >
            Generate Your First Outfit
          </button>
        )
      }
    />
  );
}

export function EmptySearch({ query }: { query?: string }) {
  return (
    <LuxuryEmptyState
      variant="compact"
      icon={
        <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      }
      title={query ? `No results for "${query}"` : "No items found"}
      description="Try adjusting your search or filters"
    />
  );
}
