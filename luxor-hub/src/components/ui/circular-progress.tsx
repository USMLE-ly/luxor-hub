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
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
          style={{
            filter: "drop-shadow(0 0 8px rgba(168, 85, 247, 0.5))",
          }}
        />
        {/* Pulse ring */}
        <circle
          cx={center}
          cy={center}
          r={radius - 2}
          fill="none"
          stroke="rgba(168, 85, 247, 0.2)"
          strokeWidth={strokeWidth + 4}
          className="animate-ping"
          style={{ animationDuration: "2s" }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>
        </defs>
      </svg>
      {/* Label below the circle */}
      <span className="text-sm text-purple-300/80 font-medium animate-pulse">
        {label}
      </span>
    </div>
  )
}
