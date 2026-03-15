"use client"

import type React from "react"
import { Warp } from "@paper-design/shaders-react"

interface Feature {
  title: string
  description: string
  icon: React.ReactNode
  tab?: string
}

interface FeatureShaderCardsProps {
  features: Feature[]
  onLearnMore?: (tab: string) => void
}

const shaderConfigs = [
  {
    proportion: 0.3, softness: 0.8, distortion: 0.15, swirl: 0.6, swirlIterations: 8,
    shape: "checks" as const, shapeScale: 0.08,
    colors: ["hsl(43, 74%, 30%)", "hsl(35, 90%, 55%)", "hsl(30, 80%, 35%)", "hsl(40, 100%, 65%)"],
  },
  {
    proportion: 0.4, softness: 1.2, distortion: 0.2, swirl: 0.9, swirlIterations: 12,
    shape: "stripes" as const, shapeScale: 0.12,
    colors: ["hsl(30, 60%, 20%)", "hsl(43, 74%, 49%)", "hsl(35, 70%, 30%)", "hsl(45, 90%, 60%)"],
  },
  {
    proportion: 0.35, softness: 0.9, distortion: 0.18, swirl: 0.7, swirlIterations: 10,
    shape: "checks" as const, shapeScale: 0.1,
    colors: ["hsl(25, 80%, 25%)", "hsl(40, 100%, 55%)", "hsl(35, 90%, 30%)", "hsl(43, 74%, 49%)"],
  },
  {
    proportion: 0.45, softness: 1.1, distortion: 0.22, swirl: 0.8, swirlIterations: 15,
    shape: "edge" as const, shapeScale: 0.09,
    colors: ["hsl(30, 100%, 35%)", "hsl(50, 100%, 65%)", "hsl(40, 90%, 40%)", "hsl(45, 100%, 75%)"],
  },
  {
    proportion: 0.38, softness: 0.95, distortion: 0.16, swirl: 0.85, swirlIterations: 11,
    shape: "checks" as const, shapeScale: 0.11,
    colors: ["hsl(20, 70%, 25%)", "hsl(35, 85%, 50%)", "hsl(43, 74%, 35%)", "hsl(40, 100%, 60%)"],
  },
  {
    proportion: 0.42, softness: 1.0, distortion: 0.19, swirl: 0.75, swirlIterations: 9,
    shape: "dots" as const, shapeScale: 0.13,
    colors: ["hsl(43, 74%, 25%)", "hsl(30, 80%, 50%)", "hsl(35, 90%, 35%)", "hsl(45, 100%, 65%)"],
  },
]

export default function FeatureShaderCards({ features, onLearnMore }: FeatureShaderCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {features.map((feature, index) => {
        const config = shaderConfigs[index % shaderConfigs.length]
        return (
          <div key={index} className="relative h-72 sm:h-80 group">
            {/* Shader background */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-60 group-hover:opacity-80 transition-opacity duration-500">
              <Warp
                style={{ height: "100%", width: "100%" }}
                proportion={config.proportion}
                softness={config.softness}
                distortion={config.distortion}
                swirl={config.swirl}
                swirlIterations={config.swirlIterations}
                shape={config.shape}
                shapeScale={config.shapeScale}
                scale={1}
                rotation={0}
                speed={0.5}
                colors={config.colors}
              />
            </div>

            {/* Content overlay */}
            <div className="relative z-10 p-6 sm:p-8 rounded-2xl h-full flex flex-col bg-background/85 dark:bg-card/90 border border-border/50 backdrop-blur-sm group-hover:border-primary/30 transition-all duration-300">
              <div className="mb-4 text-primary drop-shadow-sm">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm font-light leading-relaxed flex-grow">{feature.description}</p>
              {feature.tab && onLearnMore && (
                <button
                  onClick={() => onLearnMore(feature.tab!)}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <span>Learn more</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
