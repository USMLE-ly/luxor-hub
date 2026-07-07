"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface MarketingBadgesProps {
  onDismiss?: () => void
  onPrev?: () => void
  onNext?: () => void
  onGenerate?: () => void
  isLoading?: boolean
  hasMultiple?: boolean
  hasOutfits?: boolean
}

interface Badge {
  id: string
  label: string
  color: string
  size: "sm" | "md" | "lg"
  rotation: number
  zIndex: number
  offsetX: number
  offsetY: number
}

const sizeClasses = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-10 py-4 text-lg",
}

export function MarketingBadges({
  onDismiss,
  onPrev,
  onNext,
  onGenerate,
  isLoading,
  hasMultiple = false,
  hasOutfits = false,
}: MarketingBadgesProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [clickedId, setClickedId] = useState<string | null>(null)

  const badges: Badge[] = hasOutfits
    ? [
        { id: "dismiss", label: "Dismiss", color: "from-gold to-gold/60", size: "md", rotation: -2, zIndex: 10, offsetX: -60, offsetY: 0 },
        ...(hasMultiple ? [
          { id: "prev", label: "←", color: "from-blue-400 to-blue-500", size: "sm", rotation: 0, zIndex: 11, offsetX: 30, offsetY: -15 },
          { id: "next", label: "→", color: "from-blue-400 to-blue-500", size: "sm", rotation: 0, zIndex: 12, offsetX: 60, offsetY: 0 },
        ] : []),
      ]
    : [
        { id: "generate", label: isLoading ? "Consulting MiMo..." : "Generate Outfit", color: "from-gold to-gold/60", size: "md", rotation: 1, zIndex: 10, offsetX: 0, offsetY: 0 },
      ]

  const handleClick = (id: string) => {
    setClickedId(clickedId === id ? null : id)
    if (id === "dismiss" && onDismiss) onDismiss()
    else if (id === "prev" && onPrev) onPrev()
    else if (id === "next" && onNext) onNext()
    else if (id === "generate" && onGenerate) onGenerate()
  }

  return (
    <div className="relative flex h-[60px] w-full items-center justify-center pointer-events-none">
      {badges.map((badge) => {
        const isHovered = hoveredId === badge.id
        const isClicked = clickedId === badge.id
        const isOtherHovered = hoveredId !== null && hoveredId !== badge.id
        const isGen = badge.id === "generate"

        return (
          <div
            key={badge.id}
            className={cn(
              "absolute cursor-pointer select-none rounded-full font-semibold transition-all duration-500 ease-out",
              "bg-gradient-to-b shadow-lg pointer-events-auto",
              badge.color,
              sizeClasses[badge.size],
              "hover:shadow-2xl",
            )}
            style={{
              opacity: isGen && isLoading ? 0.6 : 1,
              transform: `
                translate(${badge.offsetX}px, ${badge.offsetY}px) 
                rotate(${isHovered ? 0 : badge.rotation}deg)
                scale(${isClicked ? 1.15 : isHovered ? 1.08 : isOtherHovered ? 0.95 : 1})
                translateY(${isHovered ? -8 : 0}px)
              `,
              zIndex: isHovered || isClicked ? 100 : badge.zIndex,
              boxShadow: isHovered
                ? "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 12px 24px -8px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.3)"
                : isClicked
                  ? "0 30px 60px -15px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.4)"
                  : "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 4px 10px -2px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.2)",
            }}
            onMouseEnter={() => setHoveredId(badge.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => handleClick(badge.id)}
          >
            <span
              className={cn(
                "relative block transition-transform duration-300",
                "text-slate-800 drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]",
              )}
              style={{ transform: isHovered ? "translateY(-1px)" : "translateY(0)" }}
            >
              {badge.label}
            </span>
            <div
              className="pointer-events-none absolute inset-0 rounded-full opacity-50"
              style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%)" }}
            />
          </div>
        )
      })}
    </div>
  )
}
