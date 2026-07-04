"use client"

import { cn } from "@/lib/utils"

interface CircularProgressProps {
  progress?: number
  label?: string
  size?: number
  strokeWidth?: number
  className?: string
}

export function CircularProgress({
  progress = 0,
  label = "Consulting MiMo...",
  size = 120,
  strokeWidth = 8,
  className,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference
  const center = size / 2

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div className="relative flex items-center justify-center">
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          aria-label="Generation progress"
        >
          {/* Background ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          {/* Progress ring — golden gradient matching iPhone frame */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#goldenProgress)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500 ease-out"
            style={{
              filter: "drop-shadow(0 0 8px rgba(229, 199, 133, 0.5))",
            }}
          />
          {/* Subtle pulse ring — golden */}
          <circle
            cx={center}
            cy={center}
            r={radius - 2}
            fill="none"
            stroke="rgba(229, 199, 133, 0.15)"
            strokeWidth={strokeWidth + 4}
            className="animate-ping"
            style={{ animationDuration: "2s" }}
          />
          <defs>
            <linearGradient id="goldenProgress" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e5c785" />
              <stop offset="50%" stopColor="#d4b06a" />
              <stop offset="100%" stopColor="#c4a055" />
            </linearGradient>
          </defs>
        </svg>
        {/* Percentage text centered inside the ring */}
        <span className="absolute text-sm font-semibold text-amber-200/90" style={{ fontSize: size > 100 ? '16px' : '12px' }}>
          {Math.round(progress)}%
        </span>
      </div>
      {/* Label below the circle */}
      <span className="text-sm text-amber-200/70 font-medium animate-pulse tracking-wide">
        {label}
      </span>
    </div>
  )
}
