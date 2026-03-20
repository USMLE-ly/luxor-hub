import { motion } from "framer-motion";
import { Check, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type FeatureRow = {
  name: string;
  starter: boolean | string;
  pro: boolean | string;
  elite: boolean | string;
};

type Category = {
  label: string;
  rows: FeatureRow[];
};

const categories: Category[] = [
  {
    label: "AI Features",
    rows: [
      { name: "Daily outfit suggestions", starter: true, pro: true, elite: true },
      { name: "AI Stylist Chat", starter: false, pro: true, elite: true },
      { name: "Advanced Style DNA", starter: false, pro: true, elite: true },
      { name: "Outfit analysis & scoring", starter: "Basic", pro: true, elite: true },
      { name: "Virtual try-on", starter: false, pro: false, elite: true },
      { name: "1-on-1 AI consultations", starter: false, pro: false, elite: true },
    ],
  },
  {
    label: "Wardrobe Tools",
    rows: [
      { name: "Closet scanner", starter: true, pro: true, elite: true },
      { name: "Closet item limit", starter: "200", pro: "Unlimited", elite: "Unlimited" },
      { name: "Outfit calendar", starter: false, pro: true, elite: true },
      { name: "Mood board builder", starter: false, pro: true, elite: true },
      { name: "Personal style reports", starter: false, pro: false, elite: true },
    ],
  },
  {
    label: "Shopping",
    rows: [
      { name: "Shopping recommendations", starter: false, pro: true, elite: true },
      { name: "Trend intelligence", starter: false, pro: false, elite: true },
      { name: "Fashion design studio", starter: false, pro: false, elite: true },
    ],
  },
  {
    label: "Support",
    rows: [
      { name: "Community access", starter: true, pro: true, elite: true },
      { name: "Priority AI processing", starter: false, pro: true, elite: true },
      { name: "Priority support", starter: false, pro: false, elite: true },
    ],
  },
];

const plans = ["Starter", "Pro", "Elite"] as const;

function CellValue({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="w-4 h-4 text-primary mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />;
  return <span className="text-xs font-sans font-medium text-foreground">{value}</span>;
}

export default function ComparisonTable() {
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(categories.map((c) => [c.label, true]))
  );

  const toggle = (label: string) =>
    setOpen((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-12"
        >
          <p className="font-sans text-sm font-semibold text-primary tracking-widest uppercase mb-3">
            Compare Plans
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            Feature <span className="gold-text">Breakdown</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="glass rounded-2xl overflow-x-auto"
        >
          {/* Header row */}
          <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-0 border-b border-border px-3 sm:px-4 py-4">
            <div className="font-sans text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Feature</div>
            {plans.map((p) => (
              <div key={p} className="text-center">
                <span className={cn(
                  "font-sans text-[11px] sm:text-sm font-bold",
                  p === "Pro" ? "gold-text" : "text-foreground"
                )}>
                  {p}
                </span>
              </div>
            ))}
          </div>

          {/* Category groups */}
          {categories.map((cat) => (
            <div key={cat.label}>
              <button
                onClick={() => toggle(cat.label)}
                className="w-full grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-0 px-3 sm:px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors border-b border-border"
              >
                <span className="font-sans text-xs font-bold text-foreground flex items-center gap-2 col-span-4">
                  <ChevronDown
                    className={cn(
                      "w-3.5 h-3.5 text-muted-foreground transition-transform duration-200",
                      open[cat.label] ? "rotate-0" : "-rotate-90"
                    )}
                  />
                  {cat.label}
                </span>
              </button>

              <div
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  open[cat.label] ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                )}
              >
                {cat.rows.map((row, i) => (
                  <div
                    key={row.name}
                    className={cn(
                      "grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-0 px-3 sm:px-4 py-3 border-b border-border/50 text-center",
                      i % 2 === 0 ? "bg-transparent" : "bg-muted/10"
                    )}
                  >
                    <span className="text-left text-xs font-sans text-muted-foreground">
                      {row.name}
                    </span>
                    <CellValue value={row.starter} />
                    <CellValue value={row.pro} />
                    <CellValue value={row.elite} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
