import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface Ranking {
  label: string;
  model: string;
  avgScore: number;
  reasons: string[];
}

interface CouncilResponseCardProps {
  model: string;
  response: string;
  ranking?: Ranking;
  rank?: number; // 1-based position
}

export function CouncilResponseCard({ model, response, ranking, rank }: CouncilResponseCardProps) {
  const [expanded, setExpanded] = useState(false);

  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "border rounded-xl overflow-hidden transition-colors",
        rank === 1 ? "border-primary/40 bg-primary/5" : "border-border bg-card"
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-left"
      >
        <div className="flex items-center gap-2">
          {medal && <span className="text-sm">{medal}</span>}
          <span className="text-xs font-sans font-semibold text-foreground">{model}</span>
          {ranking && (
            <span className="text-[10px] font-sans px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {ranking.avgScore}/10
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-muted-foreground transition-transform",
            expanded && "rotate-180"
          )}
        />
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="px-3 pb-3 border-t border-border"
        >
          <div className="pt-2 prose prose-sm prose-invert max-w-none [&>p]:my-1 [&>ul]:my-1 text-xs">
            <ReactMarkdown>{response}</ReactMarkdown>
          </div>
          {ranking?.reasons?.length ? (
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-[10px] text-muted-foreground font-sans font-medium mb-1">Ranking Reasons:</p>
              {ranking.reasons.map((r, i) => (
                <p key={i} className="text-[10px] text-muted-foreground font-sans italic">• {r}</p>
              ))}
            </div>
          ) : null}
        </motion.div>
      )}
    </motion.div>
  );
}
