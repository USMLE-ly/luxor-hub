"use client"

import { Palette, ScanFaceIcon, Shirt, Lightbulb, Check, X, Circle } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
export type CellData = { header: string; value: string | string[] | null }
export type RowData = { category: string; columns: CellData[] }

interface InfoCardsTableProps {
  rows: RowData[]
}

/* ------------------------------------------------------------------ */
/*  Color Utility — maps fashion color names to vivid hex              */
/* ------------------------------------------------------------------ */
const getColorHex = (str: string): string => {
  const colorMap: Record<string, string> = {
    coral: "#FF7F50", gold: "#FFD700", navy: "#000080", peach: "#FFDAB9",
    ivory: "#FFFFF0", "warm pink": "#FFB6C1", beige: "#F5F5DC", black: "#000000",
    tan: "#D2B48C", camel: "#C19A6B", "cool grey": "#8F9E9E", "warm brown": "#8B6B4D",
    "rose gold": "#B76E79", silver: "#C0C0C0", "soft white": "#F8F8F8",
    "olive green": "#556B2F", cream: "#FFFDD0", teal: "#008080", terracotta: "#E2725B",
    white: "#FFFFFF", gray: "#808080", grey: "#808080", brown: "#8B4513",
    blue: "#4169E1", red: "#DC143C", pink: "#FF69B4", purple: "#9370DB",
    green: "#2E8B57", yellow: "#FFD700", orange: "#FF8C00", burgundy: "#800020",
    maroon: "#800000", blush: "#FFE4E1", khaki: "#C3B091", olive: "#556B2F",
    indigo: "#4B0082", charcoal: "#36454F", taupe: "#483C32", mauve: "#E0B0FF",
    emerald: "#50C878", cobalt: "#0047AB", slate: "#708090", ebony: "#555D50",
    mocha: "#4A3728", rust: "#B7410E", lavender: "#E6E6FA", mint: "#98FF98",
    champagne: "#F7E7CE", nude: "#E3BC9A", pastel: "#FFD1DC", neon: "#39FF14",
  }
  const key = str.toLowerCase().trim()
  return colorMap[key] || ""
}

/* ------------------------------------------------------------------ */
/*  Icon helper                                                        */
/* ------------------------------------------------------------------ */
const categoryIcon = (cat: string): React.ReactNode => {
  const lower = cat.toLowerCase()
  if (lower.includes("color")) return <Palette className="w-4 h-4" />
  if (lower.includes("face")) return <ScanFaceIcon className="w-4 h-4" />
  if (lower.includes("body")) return <Shirt className="w-4 h-4" />
  return <Lightbulb className="w-4 h-4" />
}

/* ------------------------------------------------------------------ */
/*  Bullet‑point splitter for long text                                 */
/* ------------------------------------------------------------------ */
const MAX_BULLETS = 4

/** Split a descriptive text into 3–4 concise bullet phrases. */
const splitIntoBullets = (text: string): string[] => {
  // Try splitting by sentence boundaries
  let parts = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  // If only 1 long sentence, try splitting by commas / semicolons
  if (parts.length <= 1 && text.length > 60) {
    parts = text
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
  }

  // If still just one chunk, try key phrase boundaries
  if (parts.length <= 1 && text.length > 40) {
    parts = text
      .split(/\s+(?:that|which|where|with|for|to|and)\s+/i)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
  }

  // Cap at MAX_BULLETS
  if (parts.length > MAX_BULLETS) {
    parts = parts.slice(0, MAX_BULLETS)
    parts[MAX_BULLETS - 1] = parts[MAX_BULLETS - 1] + "…"
  }

  return parts
}

/** Check whether a header is a long‑text type that benefits from bullets */
const shouldShowBullets = (header: string): boolean => {
  const lower = header.toLowerCase()
  return lower === "why" || lower === "explanation" || lower === "description" || lower === "note"
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function InfoCardsTable({ rows = [] }: InfoCardsTableProps) {
  if (!rows.length) return null

  const allHeaders = Array.from(new Set(rows.flatMap((r) => r.columns.map((c) => c.header))))

  const hasData = (cell: CellData | undefined): boolean => {
    if (!cell) return false
    const { value } = cell
    if (value === null || value === undefined) return false
    if (typeof value === "string") return value.trim().length > 0 && value.trim() !== "-"
    if (Array.isArray(value)) return value.length > 0
    return false
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-white/10 bg-zinc-900/60 backdrop-blur-xl">
      <div className="min-w-[900px]">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="border-b border-white/10 hover:bg-transparent">
              <TableHead className="w-44 text-white/60 font-semibold text-xs uppercase tracking-wider py-4 pl-5">
                Category
              </TableHead>
              {allHeaders.map((h) => (
                <TableHead
                  key={h}
                  className="text-white/60 font-semibold text-xs uppercase tracking-wider text-center py-4 px-4 min-w-[110px]"
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.map((row, rowIdx) => {
              const isEven = rowIdx % 2 === 0
              return (
                <TableRow
                  key={row.category}
                  className={cn(
                    "border-b border-white/5 transition-colors hover:bg-white/5",
                    isEven && "bg-white/[0.02]"
                  )}
                >
                  {/* Category */}
                  <TableCell className="font-semibold text-white/80 py-4 pl-5 border-r border-white/5 align-top">
                    <div className="flex items-center gap-2.5">
                      <span className="text-primary/80 shrink-0">{categoryIcon(row.category)}</span>
                      <span className="text-sm whitespace-nowrap">{row.category}</span>
                    </div>
                  </TableCell>

                  {/* Cells */}
                  {allHeaders.map((header) => {
                    const cell = row.columns.find((c) => c.header === header)
                    const populated = hasData(cell)
                    const raw = cell?.value
                    const items = Array.isArray(raw) ? raw : (typeof raw === "string" && raw ? [raw] : [])
                    const useBullets = shouldShowBullets(header) && populated && items.length === 1 && items[0].length > 50
                    const bulletPoints = useBullets ? splitIntoBullets(items[0]) : []

                    return (
                      <TableCell
                        key={header}
                        className={cn("py-4 px-4 border-r border-white/5 last:border-r-0 align-top")}
                      >
                        <div className="flex items-start gap-2 min-h-[28px]">
                          {/* Indicator icon */}
                          <span className="shrink-0 mt-0.5">
                            {populated ? (
                              <Check className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <X className="w-4 h-4 text-red-500" />
                            )}
                          </span>

                          {/* Values */}
                          {populated && items.length > 0 && !useBullets && (
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-snug">
                              {items.map((item, vi) => {
                                const hex = getColorHex(item)
                                return (
                                  <span
                                    key={vi}
                                    style={hex ? { color: hex, fontWeight: 500 } : { color: "#e2e8f0", fontWeight: 400 }}
                                    className="whitespace-nowrap"
                                  >
                                    {item}
                                  </span>
                                )
                              })}
                            </div>
                          )}

                          {/* Bullet points for long text */}
                          {populated && useBullets && (
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm leading-snug">
                              {bulletPoints.map((bp, bi) => (
                                <span key={bi} className="inline-flex items-center gap-1.5 text-white/80">
                                  <Circle className="w-1.5 h-1.5 fill-white/40 text-white/40 shrink-0" />
                                  {bp}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
