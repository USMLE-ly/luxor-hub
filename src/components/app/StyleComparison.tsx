import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeftRight, Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SavedAnalysis {
  id: string;
  image_url: string;
  overall_style: string;
  style_score: number;
  summary: string;
  occasion_ratings: any;
  color_palette: any;
  strengths: any;
  improvements: any;
  seasonal_fit: string;
  created_at: string;
}

interface StyleComparisonProps {
  history: SavedAnalysis[];
}

export function StyleComparison({ history }: StyleComparisonProps) {
  const [leftId, setLeftId] = useState<string>("");
  const [rightId, setRightId] = useState<string>("");

  const left = history.find((h) => h.id === leftId);
  const right = history.find((h) => h.id === rightId);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-400";
  };

  const diffIcon = (a: number, b: number) => {
    if (a > b) return <TrendingUp className="w-3 h-3 text-green-500" />;
    if (a < b) return <TrendingDown className="w-3 h-3 text-red-400" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  if (history.length < 2) {
    return (
      <div className="text-center py-16">
        <ArrowLeftRight className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">You need at least 2 saved analyses to compare.</p>
      </div>
    );
  }

  const timeLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-6">
      {/* Selectors */}
      <div className="grid grid-cols-2 gap-4">
        {[{ value: leftId, set: setLeftId, label: "Outfit A" }, { value: rightId, set: setRightId, label: "Outfit B" }].map((s) => (
          <div key={s.label}>
            <label className="text-xs text-muted-foreground font-sans mb-1.5 block">{s.label}</label>
            <select
              value={s.value}
              onChange={(e) => s.set(e.target.value)}
              className="w-full rounded-lg border border-border bg-background text-foreground text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Select analysis...</option>
              {history.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.overall_style} ({h.style_score}/100) — {timeLabel(h.created_at)}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {left && right && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Side-by-side overview */}
          <div className="grid grid-cols-2 gap-4">
            {[left, right].map((item, idx) => (
              <Card key={item.id} className={`glass-card overflow-hidden ${left && right && item.style_score >= (idx === 0 ? right.style_score : left.style_score) ? "ring-1 ring-primary/40" : ""}`}>
                <CardContent className="p-4 space-y-3">
                  <img src={item.image_url} alt={item.overall_style} className="w-full h-40 object-cover rounded-lg" />
                  <div className="text-center">
                    <p className="font-display font-bold text-foreground">{item.overall_style}</p>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <span className={`text-2xl font-bold ${getScoreColor(item.style_score)}`}>{item.style_score}</span>
                      <span className="text-xs text-muted-foreground">/100</span>
                    </div>
                    <Badge variant="outline" className="mt-1 text-xs">{item.seasonal_fit}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Winner banner */}
          {left.style_score !== right.style_score && (
            <Card className="glass-card border-primary/30">
              <CardContent className="p-4 flex items-center gap-3">
                <Trophy className="w-6 h-6 text-primary flex-shrink-0" />
                <div>
                  <p className="font-display font-bold text-foreground">
                    {left.style_score > right.style_score ? left.overall_style : right.overall_style} wins!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Scoring {Math.abs(left.style_score - right.style_score)} points higher overall
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Occasion comparison */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="font-display text-foreground flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-primary" /> Occasion Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(left.occasion_ratings as any[]).map((lr: any, i: number) => {
                const rr = (right.occasion_ratings as any[])?.[i];
                if (!rr) return null;
                return (
                  <div key={lr.occasion} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground font-medium">{lr.occasion}</span>
                      <div className="flex items-center gap-3">
                        <span className={getScoreColor(lr.score)}>{lr.score}%</span>
                        {diffIcon(lr.score, rr.score)}
                        <span className={getScoreColor(rr.score)}>{rr.score}%</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Progress value={lr.score} className="h-1.5" />
                      <Progress value={rr.score} className="h-1.5" />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Strengths comparison */}
          <div className="grid grid-cols-2 gap-4">
            {[{ item: left, label: "A" }, { item: right, label: "B" }].map(({ item, label }) => (
              <Card key={item.id} className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-display text-foreground">Strengths ({label})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(item.strengths as string[]).slice(0, 3).map((s, i) => (
                    <p key={i} className="text-xs text-muted-foreground">• {s}</p>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
