"use client"

import { Palette, ScanFaceIcon, Shirt, Lightbulb, Check, X } from "lucide-react"
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
/*  Color utility — maps fashion colour names → vivid hex              */
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
  return colorMap[str.toLowerCase().trim()] || ""
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

/** Capitalize first letter */
const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)

/* ------------------------------------------------------------------ */
/*  Cell renderers                                                     */
/* ------------------------------------------------------------------ */

/** Color circle component */
const ColorCircle = ({ name }: { name: string }) => {
  const hex = getColorHex(name)
  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className="inline-block w-4 h-4 rounded-full shrink-0"
        style={{ backgroundColor: hex || "#666", border: hex ? "none" : "1px dashed #888" }}
      />
      <span className="text-white text-sm whitespace-nowrap">{capitalize(name)}</span>
    </div>
  )
}

/** Render a value that may be colour names → circles, a string, or null */
const renderCellValue = (header: string, value: string | string[] | null) => {
  // ── Empty / null → Red X ──
  if (value === null || value === undefined) return null
  if (typeof value === "string" && (value.trim() === "" || value.trim() === "-")) return null
  if (Array.isArray(value) && value.length === 0) return null

  // Normalise input
  const items = Array.isArray(value) ? value : [value]

  // ── "Why" column → sentence bullets with green check ──
  if (header.toLowerCase() === "why") {
    const text = items.join(" ")
    const sentences = text.match(/[^.!?]+[.!?]+/g) || (text.length > 0 ? [text + "."] : [])
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm leading-snug">
        {sentences.map((s, idx) => (
          <span key={idx} className="inline-flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="text-white/80">{s.trim()}</span>
          </span>
        ))}
      </div>
    )
  }

  // ── All other cells → detect colour names (render as circles) or plain text ──
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm leading-snug">
      {items.map((item, vi) => {
        const hex = getColorHex(item)
        // If it's a recognised colour → colour circle
        if (hex) return <ColorCircle key={vi} name={item} />
        // Otherwise → plain white text
        return <span key={vi} className="text-white/80 whitespace-nowrap">{item}</span>
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function InfoCardsTable({ rows = [] }: InfoCardsTableProps) {
  if (!rows.length) return null

  const allHeaders = Array.from(new Set(rows.flatMap((r) => r.columns.map((c) => c.header))))

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
                  <TableCell className="font-semibold text-white/80 py-4 pl-5 border-r border-white/5 align-top">
                    <div className="flex items-center gap-2.5">
                      <span className="text-primary/80 shrink-0">{categoryIcon(row.category)}</span>
                      <span className="text-sm whitespace-nowrap">{row.category}</span>
                    </div>
                  </TableCell>

                  {allHeaders.map((header) => {
                    const cell = row.columns.find((c) => c.header === header)
                    const rendered = renderCellValue(header, cell?.value ?? null)

                    return (
                      <TableCell
                        key={header}
                        className={cn("py-4 px-4 border-r border-white/5 last:border-r-0 align-top")}
                      >
                        <div className="flex items-start justify-center gap-2 min-h-[28px]">
                          {rendered ?? (
                            <X className="w-5 h-5 text-red-500 shrink-0" />
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
