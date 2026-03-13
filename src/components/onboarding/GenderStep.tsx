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
          className={`rounded-2xl overflow-hidden transition-all ${
            selected === value
              ? "shadow-[0_0_0_3px_hsl(43,74%,49%),0_0_24px_-4px_hsl(43,74%,49%,0.4)]"
              : "border-2 border-border bg-secondary/30 hover:border-muted-foreground/40"
          }`}
        >
          <div className="aspect-square overflow-hidden bg-muted relative">
            <img src={img} alt={label} className="w-full h-full object-cover" />
            {/* Frosted glass overlay */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 via-black/20 to-transparent backdrop-blur-[2px]" />
            <span className="absolute bottom-3 left-0 right-0 text-center text-white font-sans font-semibold text-sm tracking-wide">
              {label}
            </span>
          </div>
          <div className="flex items-center gap-2 p-3 justify-center">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              selected === value
                ? "border-primary bg-primary"
                : "border-muted-foreground/40"
            }`}>
              {selected === value && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
            </div>
            <span className="font-sans font-medium text-foreground">{label}</span>
          </div>
        </motion.button>
      ))}
    </div>
  </div>
);

export default GenderStep;
