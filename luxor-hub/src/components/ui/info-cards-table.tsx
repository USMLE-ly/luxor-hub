"use client"

import { Palette, ScanFaceIcon, Shirt, Lightbulb } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export interface TableRowItem {
  category: string
  icon: React.ReactNode
  subFeatures: { label: string; value: string | string[] }[]
}

interface InfoCardsTableProps {
  items: TableRowItem[]
}

export default function InfoCardsTable({ items = [] }: InfoCardsTableProps) {
  if (!items.length) return null

  // Compute all unique sub-feature labels across all rows
  const allSubLabels = Array.from(
    new Set(items.flatMap((row) => row.subFeatures.map((sf) => sf.label)))
  )

  return (
    <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-900/60 backdrop-blur-xl">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="border-b border-white/10 hover:bg-transparent">
            <TableHead className="w-44 text-white/60 font-semibold text-xs uppercase tracking-wider py-4 pl-5">
              Category
            </TableHead>
            {allSubLabels.map((label) => (
              <TableHead
                key={label}
                className="text-white/60 font-semibold text-xs uppercase tracking-wider text-center py-4 px-3 min-w-[100px]"
              >
                {label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((row, rowIdx) => {
            const isEven = rowIdx % 2 === 0
            return (
              <TableRow
                key={row.category}
                className={cn(
                  "border-b border-white/5 transition-colors hover:bg-white/5",
                  isEven && "bg-white/[0.02]"
                )}
              >
                {/* Category cell with icon */}
                <TableCell className="font-semibold text-white/80 py-4 pl-5 border-r border-white/5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-primary/80 shrink-0">{row.icon}</span>
                    <span className="text-sm">{row.category}</span>
                  </div>
                </TableCell>

                {/* Sub-feature cells */}
                {allSubLabels.map((label) => {
                  const subFeature = row.subFeatures.find((sf) => sf.label === label)
                  const value = subFeature?.value

                  // Determine if it's an array or string
                  const displayVal = Array.isArray(value) ? value : value ? [value] : []
                  const isEmpty = !displayVal.length

                  return (
                    <TableCell
                      key={label}
                      className={cn(
                        "text-center py-4 px-3 border-r border-white/5 last:border-r-0",
                        isEmpty && "text-white/20"
                      )}
                    >
                      {isEmpty ? (
                        <span className="flex items-center justify-center gap-1 text-xs">—</span>
                      ) : (
                        <div className="flex flex-wrap justify-center gap-1.5">
                          {displayVal.map((v, vi) => (
                            <span
                              key={vi}
                              className="inline-block px-2.5 py-1 rounded-full text-[11px] leading-tight font-medium bg-white/5 border border-white/10 text-white/80"
                            >
                              {v}
                            </span>
                          ))}
                        </div>
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
