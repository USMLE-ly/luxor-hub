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
      className="fixed inset-0 z-[99999] transition-opacity duration-700 ease-out"
      style={{ pointerEvents: "none", opacity: fading ? 0 : 1 }}
    >
      <LuxurySplashContent />
    </div>
  );
};

function LuxurySplashContent() {
  const [phase, setPhase] = useState<"logo" | "wordmark" | "tagline">("logo");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("wordmark"), 200);
    const t2 = setTimeout(() => setPhase("tagline"), 700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ background: "linear-gradient(180deg, #060f0d 0%, #0c2420 30%, #10352a 55%, #0a1f1a 80%, #060f0d 100%)" }}>

      {/* Subtle radial glow behind text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(232,200,122,0.05) 0%, transparent 65%)" }} />
      </div>

      {/* Wordmark */}
      <h1 className={`relative z-10 font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-[0.3em] transition-all duration-700 ease-out ${
          phase !== "logo" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        style={{ textShadow: "0 0 60px rgba(232,200,122,0.06)" }}>
        <span className="text-white/90">LUXOR</span>
        <span className="inline-block align-super text-[0.4em] leading-none -ml-[0.1em]"
          style={{ color: "rgba(232,200,122,0.5)" }}>®</span>
      </h1>

      {/* Thin gold line accent */}
      <div className={`relative z-10 w-12 h-px mt-6 transition-all duration-700 ease-out delay-100 ${
          phase !== "logo" ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
        }`}
        style={{ backgroundColor: "rgba(232,200,122,0.2)" }} />

      {/* Tagline */}
      <p className={`relative z-10 font-sans text-[9px] sm:text-[10px] uppercase tracking-[0.5em] mt-5 font-light transition-all duration-700 ease-out ${
          phase === "tagline" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
        style={{ color: "rgba(232,200,122,0.25)" }}>
        Your Personal Fashion Intelligence
      </p>
    </div>
  );
}

export default SplashScreen;
