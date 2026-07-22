import { motion } from "framer-motion";
import { Flame, Trophy, Target, Calendar } from "@phosphor-icons/react";

interface StreakInfo {
  current_streak: number;
  longest_streak: number;
  total_login_days: number;
  last_login_date: string | null;
  next_milestone_days: number;
  next_milestone_credits: number;
  next_milestone_label: string;
}

const MILESTONES = [
  { days: 1, credits: 2 },
  { days: 3, credits: 5 },
  { days: 7, credits: 10 },
  { days: 14, credits: 20 },
  { days: 30, credits: 50 },
  { days: 60, credits: 100 },
  { days: 100, credits: 250 },
];

export function StreakCalendar({ streak }: { streak: StreakInfo }) {
  const { current_streak, longest_streak, total_login_days, next_milestone_days } = streak;
  const progressToNext = next_milestone_days > 0 ? Math.min((current_streak / next_milestone_days) * 100, 100) : 0;

  return (
    <motion.div
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="rounded-2xl border border-[var(--accent)]/20 bg-gradient-to-br from-[var(--accent)]/10 to-[var(--accent)]/5 p-5"
    >
      {/* Streak counter */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/20 flex items-center justify-center">
            <Flame className="w-6 h-6 text-[var(--accent)]" weight="fill" />
          </div>
          <div>
            <p className="text-3xl font-serif text-[var(--text)]">{current_streak}</p>
            <p className="text-xs font-sans text-[var(--text-muted)]">day streak</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-right">
          <div>
            <p className="text-sm font-sans font-semibold text-[var(--text)]">{longest_streak}</p>
            <p className="text-[10px] font-sans text-[var(--text-muted)]">best</p>
          </div>
          <div>
            <p className="text-sm font-sans font-semibold text-[var(--text)]">{total_login_days}</p>
            <p className="text-[10px] font-sans text-[var(--text-muted)]">total</p>
          </div>
        </div>
      </div>

      {/* Progress to next milestone */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-sans text-[var(--text-muted)]">
            Next: {streak.next_milestone_label}
          </span>
          <span className="text-[11px] font-sans font-semibold text-[var(--accent)]">
            +{streak.next_milestone_credits} credits at {next_milestone_days}d
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-[var(--surface)]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressToNext}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-warm)]"
          />
        </div>
      </div>

      {/* Milestone roadmap */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {MILESTONES.map((m) => {
          const reached = current_streak >= m.days;
          const isNext = m.days === next_milestone_days;
          return (
            <div
              key={m.days}
              className={`flex-shrink-0 flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-all ${
                reached
                  ? "bg-[var(--accent)]/10"
                  : isNext
                  ? "bg-[var(--accent)]/5 border border-[var(--accent)]/20"
                  : "opacity-40"
              }`}
            >
              <span className={`text-[10px] font-sans font-semibold ${reached ? "text-[var(--accent)]" : isNext ? "text-[var(--text)]" : "text-[var(--text-muted)]"}`}>
                {m.days}d
              </span>
              <span className={`text-[9px] font-sans ${reached ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`}>
                +{m.credits}
              </span>
              {reached && <Trophy className="w-3 h-3 text-[var(--accent)]" weight="fill" />}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
