import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import {
  Sparkles, Palette, Shirt, ShieldCheck, Star, Eye
} from "lucide-react";

interface CosmicAuditProps {
  styleName: string;
  styleScore: number;
  colors: string[];
  items: { name: string; category: string; color: string }[];
  strengths: string[];
  audit: string;
  seasonalFit?: string;
}

export function CosmicAudit({
  styleName, styleScore, colors, items, strengths, audit, seasonalFit
}: CosmicAuditProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-400";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <div className="relative rounded-[1.5rem] border-[0.75px] border-border p-3">
        <GlowingEffect spread={45} glow={true} disabled={false} proximity={56} inactiveZone={0.01} borderWidth={3} />
        <Card className="glass-card overflow-hidden border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="font-display flex items-center gap-2 text-foreground text-lg">
              <div className="w-0.5 h-5 gold-gradient rounded-full mr-1" />
              <Eye className="w-5 h-5 text-primary" /> Cosmic Audit
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              The eternal verdict from the fashion deities.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Style Name + Score */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Style Essence</p>
                <p className="font-display text-xl font-bold text-foreground mt-0.5">{styleName}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Divine Score</p>
                <p className={`font-display text-2xl font-bold ${getScoreColor(styleScore)} mt-0.5`}>
                  {styleScore}<span className="text-sm text-muted-foreground">/100</span>
                </p>
              </div>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* Audit Summary */}
            {audit && (
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm text-foreground leading-relaxed italic">
                  &ldquo;{audit}&rdquo;
                </p>
              </div>
            )}

            {/* Seasonal Fit */}
            {seasonalFit && (
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Seasonal alignment: <span className="text-foreground font-medium">{seasonalFit}</span>
                </span>
              </div>
            )}

            <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Actual Colors */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Colors</span>
                </div>
                <div className="flex gap-1.5">
                  {colors.map((c, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full border border-border shadow-sm"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">{colors.length} hues detected</p>
              </div>

              {/* Detected Items */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Shirt className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Items</span>
                </div>
                <div className="space-y-1">
                  {items.slice(0, 4).map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-primary/40" />
                      <span className="text-xs text-muted-foreground truncate">{item.name}</span>
                    </div>
                  ))}
                  {items.length > 4 && (
                    <p className="text-[10px] text-muted-foreground">+{items.length - 4} more</p>
                  )}
                </div>
              </div>

              {/* Strengths */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-semibold text-foreground">Strengths</span>
                </div>
                <div className="space-y-1">
                  {strengths.slice(0, 3).map((s, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <Star className="w-3 h-3 text-green-500 flex-shrink-0" />
                      <span className="text-xs text-muted-foreground truncate">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
