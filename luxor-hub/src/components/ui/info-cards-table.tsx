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
    /* Extended palette for AI-generated colour names */
    "soft pink": "#FFB6C1", "dusty blue": "#7CB9E8", "muted lavender": "#C9A0DC",
    "bright orange": "#FFA500", "acid yellow": "#DFFF00", "neon green": "#39FF14",
    rose_gold: "#B76E79", "soft brown": "#A67B5B", "deep burgundy": "#8B0033",
    "midnight blue": "#191970", "forest green": "#228B22", crimson: "#DC143C",
    magenta: "#FF00FF", cyan: "#00FFFF", aqua: "#00FFFF", violet: "#8A2BE2",
    plum: "#DDA0DD", "coral pink": "#F88379", "baby blue": "#89CFF0",
    "dusty rose": "#C08080", "pale pink": "#FADADD", "hot pink": "#FF69B4",
    "salmon pink": "#FF91A4", "burnt orange": "#CC5500", "mustard yellow": "#FFDB58",
    "lemon yellow": "#FFF44F", "lime green": "#32CD32", "sage green": "#BCB88A",
    "mint green": "#98FF98", "sky blue": "#87CEEB", "steel blue": "#4682B4",
    "royal blue": "#4169E1", "navy blue": "#000080", "wine red": "#722F37",
    "brick red": "#CB4154", "copper brown": "#B87333", "chocolate brown": "#7B3F00",
    "dark brown": "#654321", "light brown": "#A0522D", "sand brown": "#C2B280",
    "golden yellow": "#FFDF00", "pale yellow": "#FFFACD", "cream white": "#FFFDD0",
    "off white": "#FAF9F6", "ivory white": "#FFFFF0", "charcoal grey": "#36454F",
    "dark grey": "#A9A9A9", "light grey": "#D3D3D3", "pale grey": "#E8E8E8",
    "warm grey": "#808080", "true red": "#FF0000",
    "cherry red": "#DE3163", "ruby red": "#9B111E", "raspberry": "#E30B5C",
    "fuchsia pink": "#FF00FF", "lilac purple": "#C8A2C8", "orchid purple": "#DA70D6",
    "deep purple": "#800080", "aubergine": "#614051", "mauve pink": "#E0B0FF",
    "pale blue": "#AFEEEE", "powder blue": "#B0E0E6", "ice blue": "#99FFFF",
    "silver grey": "#C0C0C0", "pewter grey": "#8BA8B0", "gunmetal grey": "#2C3539",
    "bronze brown": "#CD7F32", "copper red": "#B87333", "rust orange": "#B7410E",
    cinnamon: "#D2691E", "honey brown": "#D4A017", caramel: "#AF6E4D",
    "champagne gold": "#F7E7CE", "antique gold": "#CFB53B", "pale gold": "#E6BE8A",
    "pearl white": "#F5F5F5", "bone white": "#F9F6EE", "linen white": "#FAF0E6",
  }
  const key = str.toLowerCase().trim().replace(/_/g, " ")
  return colorMap[key] || colorMap[key.replace(/\s+/g, " ")] || "#808080"
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
const COLOR_COLUMNS = new Set(["Best Colors", "Avoid", "Accessories", "Shoes", "Jewelry"])

const renderCellValue = (header: string, value: string | string[] | null) => {
  // ── Empty / null → Red X ──
  if (value === null || value === undefined) return null
  if (typeof value === "string" && (value.trim() === "" || value.trim() === "-")) return null
  if (Array.isArray(value) && value.length === 0) return null

  // Normalise input
  const items = Array.isArray(value) ? value : [value]

  // ── Color columns (Best Colors, Avoid, Accessories, Shoes, Jewelry) → color circles, no checkmarks ──
  if (COLOR_COLUMNS.has(header)) {
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm leading-snug">
        {items.map((item, vi) => {
          const hex = getColorHex(item)
          return (
            <div key={vi} className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full shrink-0 border border-white/20" style={{ backgroundColor: hex || "#808080" }} />
              <span className="text-white text-sm capitalize">{item}</span>
            </div>
          )
        })}
      </div>
    )
  }

  // ── All other cells → split text into sentence bullets with green check ──
  const text = items.join(" ")
  const sentences = text.match(/[^.!?]+[.!?]+/g) || (text.length > 0 ? [text + "."] : [])
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 items-start text-sm">
      {sentences.map((s, idx) => (
        <div key={idx} className="flex items-start gap-1.5">
          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span className="text-white/90">{s.trim()}</span>
        </div>
      ))}
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
    <div className="relative w-full overflow-x-auto rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md shadow-lg shadow-black/20">
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
                        className={cn(
                          "py-4 px-4 border-r border-white/5 last:border-r-0 align-top",
                          header.toLowerCase() === "why" && "min-w-[300px]",
                          !COLOR_COLUMNS.has(header) && header.toLowerCase() !== "why" && "min-w-[200px]"
                        )}
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
