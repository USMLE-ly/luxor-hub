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
      {/* Golden diamond loader */}
      <div className="relative w-16 h-16 rotate-45 mb-8">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 left-0 w-5 h-5 m-0.5 animate-square bg-[#E8C87A]"
            style={{ animationDelay: `${-1.4285714286 * i}s` }}
          />
        ))}
      </div>

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

      <style>{`
        @keyframes square-animation {
          0% { left: 0; top: 0; } 10.5% { left: 0; top: 0; }
          12.5% { left: 24px; top: 0; } 23% { left: 24px; top: 0; }
          25% { left: 48px; top: 0; } 35.5% { left: 48px; top: 0; }
          37.5% { left: 48px; top: 24px; } 48% { left: 48px; top: 24px; }
          50% { left: 24px; top: 24px; } 60.5% { left: 24px; top: 24px; }
          62.5% { left: 24px; top: 48px; } 73% { left: 24px; top: 48px; }
          75% { left: 0; top: 48px; } 85.5% { left: 0; top: 48px; }
          87.5% { left: 0; top: 24px; } 98% { left: 0; top: 24px; }
          100% { left: 0; top: 0; }
        }
        .animate-square {
          animation: square-animation 10s ease-in-out infinite both;
        }
      `}</style>
    </div>
  );
}

export default SplashScreen;
