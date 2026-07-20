import { useState, useEffect, useCallback } from "react";
import {X, Diamond} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

const DISMISSED_KEY = "luxor-banner-dismissed";

export default function AnnouncementBanner() {
  const [visible, setVisible] = useState(
    () => sessionStorage.getItem(DISMISSED_KEY) !== "1"
  );

  // infoIndex removed — only 1 info slot, no cycling needed

  const dismiss = useCallback(() => {
    sessionStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  }, []);

  const infoSlots = [
    <>
      <span className="text-muted-foreground">—</span>
      <span className="text-muted-foreground">AI-powered styling for your wardrobe</span>
    </>,
  ];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 40, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.77, 0, 0.175, 1] }}
          className="relative z-[60] overflow-hidden bg-muted/50 border-b border-border"
        >
          <div className="relative h-10 flex items-center justify-center px-10 gap-3">
            <div className="flex items-center gap-2 text-xs font-sans font-medium">
              <Diamond className="w-3 h-3 text-foreground shrink-0" />
              <span className="font-semibold text-foreground">Early Access</span>

              <span className="hidden sm:inline-flex items-center gap-2">
                {infoSlots[0]}
              </span>

              <span className="sm:hidden inline-flex items-center gap-2">
                {infoSlots[0]}
              </span>
            </div>

            <button
              onClick={dismiss}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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
