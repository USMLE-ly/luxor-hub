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
    // Show for 5 seconds, then fade out over 800ms
    const fadeTimer = setTimeout(() => setFading(true), 5000);
    const removeTimer = setTimeout(() => setShow(false), 5800);
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); };
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[99999]"
      style={{ pointerEvents: "none", transition: "opacity 0.8s ease-out", opacity: fading ? 0 : 1 }}
    >
      <LuxurySplashContent />
    </div>
  );
};

function LuxurySplashContent() {
  const [phase, setPhase] = useState<"wordmark" | "line" | "tagline" | "subtle">("wordmark");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("line"), 500);
    const t2 = setTimeout(() => setPhase("tagline"), 1200);
    const t3 = setTimeout(() => setPhase("subtle"), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ background: "linear-gradient(180deg, #060f0d 0%, #081a16 15%, #0c2420 35%, #10352a 55%, #0a1f1a 75%, #060f0d 100%)" }}>

      {/* Large ambient radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[700px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(232,200,122,0.07) 0%, rgba(232,200,122,0.02) 45%, transparent 70%)" }} />
      </div>

      {/* Secondary smaller glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[250px] h-[250px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(232,200,122,0.04) 0%, transparent 60%)", transform: "translateY(-10px)" }} />
      </div>

      {/* Floating gold particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(18)].map((_, i) => (
          <div key={i}
            className="absolute rounded-full"
            style={{
              width: `${1 + Math.random() * 2.5}px`,
              height: `${1 + Math.random() * 2.5}px`,
              left: `${8 + Math.random() * 84}%`,
              top: `${8 + Math.random() * 84}%`,
              background: `rgba(232,200,122,${0.08 + Math.random() * 0.18})`,
              animation: `splash-particle ${7 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * -12}s`,
            }}
          />
        ))}
      </div>

      {/* Wordmark */}
      <h1 className={`relative z-10 font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-[0.3em] transition-all duration-[1200ms] ease-out ${
          "opacity-100 translate-y-0"
        }`}
        style={{ textShadow: "0 0 80px rgba(232,200,122,0.06)" }}>
        <span className="text-white/90">LUXOR</span>
        <span className="inline-block align-super text-[0.4em] leading-none -ml-[0.1em]"
          style={{ color: "rgba(232,200,122,0.4)" }}>®</span>
      </h1>

      {/* Thin gold line */}
      <div className={`relative z-10 h-px mt-8 transition-all duration-1000 ease-out ${
          phase === "line" || phase === "tagline" || phase === "subtle" ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
        }`}
        style={{ width: "48px", backgroundColor: "rgba(232,200,122,0.25)" }} />

      {/* Tagline */}
      <p className={`relative z-10 font-sans text-[9px] sm:text-[10px] uppercase tracking-[0.5em] mt-6 font-light transition-all duration-1000 ease-out ${
          phase === "tagline" || phase === "subtle" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        style={{ color: "rgba(232,200,122,0.25)" }}>
        Your Personal Fashion Intelligence
      </p>



      <style>{`
        @keyframes splash-particle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
          25% { transform: translateY(-18px) translateX(6px); opacity: 0.5; }
          50% { transform: translateY(-10px) translateX(-4px); opacity: 0.3; }
          75% { transform: translateY(-25px) translateX(10px); opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

export default SplashScreen;
