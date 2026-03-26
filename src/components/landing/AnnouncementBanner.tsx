import { useState, useEffect, useCallback } from "react";
import { X, Diamond } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DISMISSED_KEY = "luxor-banner-dismissed";
const TIMER_END_KEY = "luxor-countdown-end";
const COUNTDOWN_HOURS = 24;

function getOrCreateEndTime(): number {
  const stored = localStorage.getItem(TIMER_END_KEY);
  if (stored) {
    const end = parseInt(stored, 10);
    if (end > Date.now()) return end;
  }
  const end = Date.now() + COUNTDOWN_HOURS * 60 * 60 * 1000;
  localStorage.setItem(TIMER_END_KEY, String(end));
  return end;
}

function formatTime(ms: number) {
  if (ms <= 0) return { h: "00", m: "00", s: "00" };
  const totalSec = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const s = String(totalSec % 60).padStart(2, "0");
  return { h, m, s };
}

export default function AnnouncementBanner() {
  const [visible, setVisible] = useState(
    () => sessionStorage.getItem(DISMISSED_KEY) !== "1"
  );
  const [remaining, setRemaining] = useState(() => getOrCreateEndTime() - Date.now());
  const [infoIndex, setInfoIndex] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => {
      const diff = getOrCreateEndTime() - Date.now();
      setRemaining(diff > 0 ? diff : 0);
    }, 1000);
    return () => clearInterval(id);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => setInfoIndex((i) => (i + 1) % 2), 4000);
    return () => clearInterval(id);
  }, [visible]);

  const dismiss = useCallback(() => {
    sessionStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  }, []);

  const { h, m, s } = formatTime(remaining);

  const infoSlots = [
    <>
      <span className="text-muted-foreground">—</span>
      <span className="text-muted-foreground">Lock in founding pricing</span>
    </>,
  ];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 40, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="relative z-[60] overflow-hidden bg-muted/50 border-b border-border"
        >
          <div className="relative h-10 flex items-center justify-center px-10 gap-3">
            <div className="flex items-center gap-2 text-xs font-sans font-medium">
              <Diamond className="w-3 h-3 text-foreground shrink-0" />
              <span className="font-semibold text-foreground">Early Access</span>

              <span className="inline-flex items-center gap-0.5 font-mono text-[11px] text-foreground font-bold tracking-wider">
                <span>{h}</span>
                <span className="countdown-colon">:</span>
                <span>{m}</span>
                <span className="countdown-colon">:</span>
                <span>{s}</span>
              </span>

              <span className="hidden sm:inline-flex items-center gap-2">
                {infoSlots[0]}
              </span>

              <span className="sm:hidden inline-flex items-center gap-2">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={infoIndex}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    className="inline-flex items-center gap-2"
                  >
                    {infoSlots[infoIndex]}
                  </motion.span>
                </AnimatePresence>
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
