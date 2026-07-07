"use client";

import React from "react";
import {
  BarChart,
  BarSeries,
  Bar,
  GridlineSeries,
  Gridline,
  LinearYAxis,
  LinearYAxisTickSeries,
  LinearYAxisTickLabel,
  LinearXAxis,
  LinearXAxisTickSeries,
  LinearXAxisTickLabel,
} from "reaviz";
import { motion } from "framer-motion";
import {Check, Warning, Sparkle, Star} from "@phosphor-icons/react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface ImprovementItem {
  issue: string;
  suggestion?: string;
  priority?: string;
}

interface FashionReviewCardProps {
  overallScore: number;
  scoreBreakdown: Record<string, number>;
  strengths: string[];
  improvements: ImprovementItem[];
  honestSummary?: string;
}

/* ------------------------------------------------------------------ */
/*  Color helpers                                                      */
/* ------------------------------------------------------------------ */
const scoreBarColor = (val: number): string =>
  val >= 80 ? "#40E5D1" : val >= 60 ? "#FFD700" : "#e84045";

const scoreTextColor = (s: number): string =>
  s >= 80 ? "text-emerald-400" : s >= 60 ? "text-yellow-400" : "text-red-400";

const scoreRingColor = (s: number): string =>
  s >= 80 ? "stroke-emerald-400" : s >= 60 ? "stroke-yellow-400" : "stroke-red-400";

const scoreBg = (s: number): string =>
  s >= 80
    ? "bg-emerald-500/10 border-emerald-500/30"
    : s >= 60
    ? "bg-yellow-500/10 border-yellow-500/30"
    : "bg-red-500/10 border-red-500/30";

const capitalize = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function FashionReviewCard({
  overallScore,
  scoreBreakdown,
  strengths,
  improvements,
  honestSummary,
}: FashionReviewCardProps) {
  const chartData = Object.entries(scoreBreakdown).map(([key, value]) => ({
    key: capitalize(key),
    data: value,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="w-full rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 backdrop-blur-xl overflow-hidden"
    >
      {/* ── HEADER: Overall Score with arc ── */}
      <div className="relative px-6 pt-8 pb-6 flex items-center gap-6">
        {/* Circular score ring */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
            <motion.circle
              cx="50" cy="50" r="42"
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              className={scoreRingColor(overallScore)}
              strokeDasharray={264}
              initial={{ strokeDashoffset: 264 }}
              animate={{ strokeDashoffset: 264 - (overallScore / 100) * 264 }}
              transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
              style={{ filter: "drop-shadow(0 0 6px rgba(229,199,133,0.3))" }}
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e5c785" />
                <stop offset="100%" stopColor="#c4a055" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{overallScore}</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Overall Score</p>
          <p className="text-lg text-foreground/80 font-medium">
            {overallScore >= 80 ? "Excellent" : overallScore >= 60 ? "Good" : "Needs Work"}
          </p>
        </div>
      </div>

      {/* ── CHART: Score Breakdown ── */}
      {chartData.length > 0 && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 mb-3 px-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground/80">Score Breakdown</h3>
          </div>
          <div className="h-[220px] w-full">
            <BarChart
              data={chartData}
              height={220}
              series={
                <BarSeries
                  bar={<Bar gradient={null} cornerRadius={4} />}
                  colorScheme="cybertron"
                  layout="vertical"
                  padding={0.2}
                  groupPadding={8}
                />
              }
              gridlines={
                <GridlineSeries line={<Gridline strokeColor="rgba(255,255,255,0.05)" />} />
              }
              xAxis={
                <LinearXAxis
                  type="category"
                  tickSeries={
                    <LinearXAxisTickSeries
                      tickLabel={
                        <LinearXAxisTickLabel fill="rgba(255,255,255,0.5)" fontSize={10} rotation={-30} />
                      }
                    />
                  }
                />
              }
              yAxis={
                <LinearYAxis
                  type="value"
                  domain={[0, 100]}
                  tickSeries={
                    <LinearYAxisTickSeries
                      tickValues={[0, 20, 40, 60, 80, 100]}
                      tickLabel={
                        <LinearYAxisTickLabel fill="rgba(255,255,255,0.3)" fontSize={10} />
                      }
                    />
                  }
                />
              }
            />
          </div>
        </div>
      )}

      {/* ── STRENGTHS & IMPROVEMENTS SIDE BY SIDE ── */}
      <div className="flex flex-col lg:flex-row gap-4 px-6 pb-4">
        {Array.isArray(strengths) && strengths.length > 0 && (
          <div className="flex-1 min-w-0 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4">
            <h4 className="text-emerald-400 font-semibold text-sm mb-3 flex items-center gap-2">
              <Check className="w-4 h-4" /> Strengths
            </h4>
            <ul className="space-y-2">
              {strengths.slice(0, 4).map((s, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.3 }}
                  className="flex items-start gap-2 text-sm text-gray-300 leading-relaxed"
                >
                  <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                  <span>{s}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {Array.isArray(improvements) && improvements.length > 0 && (
          <div className="flex-1 min-w-0 rounded-xl border border-amber-500/20 bg-amber-950/20 p-4">
            <h4 className="text-amber-400 font-semibold text-sm mb-3 flex items-center gap-2">
              <Warning className="w-4 h-4" /> Improvements
            </h4>
            <ul className="space-y-2">
              {improvements.slice(0, 4).map((imp, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.3 }}
                  className="flex items-start gap-2 text-sm text-gray-300 leading-relaxed"
                >
                  <span className={
                    imp.priority === "high"
                      ? "text-red-400 shrink-0"
                      : imp.priority === "medium"
                      ? "text-amber-400 shrink-0"
                      : "text-blue-400 shrink-0"
                  }>
                    {imp.priority === "high" ? "🔴" : imp.priority === "medium" ? "🟡" : "🔵"}
                  </span>
                  <div className="flex-1">
                    <span>{imp.issue}</span>
                    {imp.suggestion && (
                      <p className="text-xs text-amber-300/70 mt-0.5">→ {imp.suggestion}</p>
                    )}
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ── HONEST SUMMARY ── */}
      {honestSummary && (
        <div className="px-6 pb-6">
          <div className="rounded-xl border border-white/10 bg-emerald/40 p-4">
            <p className="text-sm text-white/60 italic text-center leading-relaxed">
              &ldquo;{honestSummary}&rdquo;
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
