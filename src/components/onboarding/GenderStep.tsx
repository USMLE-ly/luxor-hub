import { motion } from "framer-motion";
import { Check } from "lucide-react";
import femaleImg from "@/assets/onboarding-female.jpg";
import maleImg from "@/assets/onboarding-male.jpg";

interface GenderStepProps {
  selected: string | null;
  onSelect: (gender: "female" | "male") => void;
}

const GenderStep = ({ selected, onSelect }: GenderStepProps) => (
  <div>
    <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground text-center mb-8">
      Which department do you prefer to shop in?
    </h2>
    <div className="grid grid-cols-2 gap-4">
      {([
        { value: "female" as const, label: "Female", img: femaleImg },
        { value: "male" as const, label: "Male", img: maleImg },
      ]).map(({ value, label, img }) => (
        <motion.button
          key={value}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(value)}
          className={`rounded-2xl border-2 overflow-hidden transition-all ${
            selected === value
              ? "border-foreground shadow-lg"
              : "border-border bg-secondary/30 hover:border-muted-foreground/40"
          }`}
        >
          <div className="aspect-square overflow-hidden bg-muted">
            <img src={img} alt={label} className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center gap-2 p-3 justify-center">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              selected === value ? "border-foreground bg-foreground" : "border-muted-foreground/40"
            }`}>
              {selected === value && <Check className="h-3.5 w-3.5 text-background" />}
            </div>
            <span className="font-sans font-medium text-foreground">{label}</span>
          </div>
        </motion.button>
      ))}
    </div>
  </div>
);

export default GenderStep;
