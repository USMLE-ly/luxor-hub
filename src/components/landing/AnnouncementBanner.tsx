import { useState } from "react";
import { X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DISMISSED_KEY = "aurelia-banner-dismissed";

export default function AnnouncementBanner() {
  const [visible, setVisible] = useState(
    () => sessionStorage.getItem(DISMISSED_KEY) !== "1"
  );

  const dismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 36, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="relative z-[60] overflow-hidden bg-[hsl(var(--primary)/0.08)] border-b border-primary/10 backdrop-blur-md"
        >
          {/* Shimmer sweep */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute inset-y-0 w-[200px] bg-gradient-to-r from-transparent via-primary/10 to-transparent -skew-x-12"
              animate={{ x: ["-200px", "calc(100vw + 200px)"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
            />
          </div>

          <div className="relative h-9 flex items-center justify-center px-10">
            <div className="flex items-center gap-2 text-xs font-sans font-medium">
              <Sparkles className="w-3 h-3 text-primary shrink-0" />
              <span className="gold-text font-semibold">Early Access</span>
              <span className="text-muted-foreground hidden sm:inline">—</span>
              <span className="text-muted-foreground hidden sm:inline">50% off Pro for the first 1,000 users</span>
            </div>

            <button
              onClick={dismiss}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
