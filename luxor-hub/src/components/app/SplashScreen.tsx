import { useEffect, useState } from "react";

const SESSION_KEY = "luxor_splash_shown";

const SplashScreen = () => {
  const [show, setShow] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem(SESSION_KEY);
    if (!alreadyShown) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setShow(true);
    }
  }, []);

  useEffect(() => {
    if (!show) return;
    const fadeTimer = setTimeout(() => setFading(true), 3000);
    const removeTimer = setTimeout(() => setShow(false), 3600);
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); };
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] transition-opacity duration-500"
      style={{ pointerEvents: "none", opacity: fading ? 0 : 1 }}
    >
      <LuxurySplashContent />
    </div>
  );
};

/* Inline LUXOR branded splash — no external dependency */
function LuxurySplashContent() {
  const [phase, setPhase] = useState<"logo" | "wordmark" | "tagline">("logo");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("wordmark"), 300);
    const t2 = setTimeout(() => setPhase("tagline"), 800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#10352a]">
      {/* Wordmark */}
      {phase !== "logo" && (
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-light tracking-[0.3em] text-white/90 mt-4"
            style={{ textShadow: "0 0 40px rgba(232,200,122,0.08)" }}>
          LUXOR<span className="inline-block align-super text-[0.45em] leading-none -ml-[0.1em] text-[#E8C87A]/60">®</span>
        </h1>
      )}

      {/* Tagline */}
      {phase === "tagline" && (
        <p className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.45em] mt-5 font-light text-[#E8C87A]/30">
          Your Personal Fashion Intelligence
        </p>
      )}

    </div>
  );
}

export default SplashScreen;
