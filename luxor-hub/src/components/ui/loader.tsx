import { motion } from "framer-motion";

export function ClassicLoader() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer spinning ring with gold accent */}
      <motion.div
        className="absolute w-12 h-12 rounded-full border-2 border-gold/20 border-t-gold"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, ease: "linear" }}
      />
      {/* Middle ring */}
      <motion.div
        className="absolute w-8 h-8 rounded-full border-2 border-emerald/20 border-b-emerald"
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, ease: "linear" }}
      />
      {/* Inner dot */}
      <motion.div
        className="w-2 h-2 rounded-full bg-gold"
        animate={{ scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 1.5, ease: [0.77, 0, 0.175, 1] }}
      />
    </div>
  );
}

export function ModifiedClassicLoader() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex items-center justify-center">
        <motion.div
          className="w-6 h-6 rounded-full border-2 border-gold/20 border-t-gold"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, ease: "linear" }}
        />
      </div>
      <span className="text-xs text-muted-foreground font-sans">Loading...</span>
    </div>
  );
}
