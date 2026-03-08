import { motion } from "framer-motion";

const moods = [
  { emoji: "😊", label: "Happy", value: "happy" },
  { emoji: "💪", label: "Confident", value: "confident" },
  { emoji: "😌", label: "Relaxed", value: "relaxed" },
  { emoji: "😔", label: "Low", value: "low" },
  { emoji: "🤩", label: "Excited", value: "excited" },
];

interface MoodSelectorProps {
  selected: string | null;
  onSelect: (mood: string) => void;
}

export function MoodSelector({ selected, onSelect }: MoodSelectorProps) {
  return (
    <div className="flex gap-1.5 py-2 px-1 overflow-x-auto scrollbar-none">
      {moods.map((mood) => (
        <motion.button
          key={mood.value}
          whileTap={{ scale: 0.9 }}
          onClick={() => onSelect(selected === mood.value ? "" : mood.value)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all flex-shrink-0 ${
            selected === mood.value
              ? "bg-primary/15 border-primary/40 shadow-[0_0_8px_hsl(var(--primary)/0.15)]"
              : "bg-card border-border hover:border-primary/20"
          }`}
        >
          <span className="text-base">{mood.emoji}</span>
          <span className="text-[11px] font-sans text-foreground">{mood.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
