import React, { useEffect, useState } from 'react';

const LoadingScreen = () => {
  const [canDismiss, setCanDismiss] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setCanDismiss(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #060f0d 0%, #0c2420 25%, #10352a 50%, #0c2420 75%, #060f0d 100%)",
        transition: canDismiss ? "opacity 0.5s ease-out" : "none",
        opacity: canDismiss ? 0 : 1,
        pointerEvents: canDismiss ? "none" : "auto",
      }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(232,200,122,0.06) 0%, rgba(232,200,122,0.02) 40%, transparent 70%)" }} />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div key={i}
            className="absolute rounded-full"
            style={{
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              background: `rgba(232,200,122,${0.1 + Math.random() * 0.15})`,
              animation: `float-particle ${6 + Math.random() * 8}s ease-in-out infinite`,
              animationDelay: `${Math.random() * -10}s`,
            }}
          />
        ))}
      </div>

      {/* Moving diamond grid */}
      <div className="relative w-28 h-28 rotate-45 mb-8">
        {[...Array(8)].map((_, i) => (
          <div key={i}
            className="absolute rounded-[3px]"
            style={{
              width: '22px',
              height: '22px',
              margin: '3px',
              background: 'linear-gradient(135deg, #E8C87A 0%, #d4a843 100%)',
              boxShadow: '0 0 12px rgba(232,200,122,0.3)',
              animation: 'luxor-square 4s cubic-bezier(0.4,0,0.2,1) infinite both',
              animationDelay: `${-1 * i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Brand text */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <h1 className="font-display text-3xl sm:text-4xl font-light tracking-[0.35em] text-white/80"
          style={{ textShadow: "0 0 40px rgba(232,200,122,0.08)" }}>
          LUXOR
        </h1>
        <div className="w-8 h-px" style={{ backgroundColor: "rgba(232,200,122,0.2)" }} />
        <p className="text-[10px] uppercase tracking-[0.5em] font-light animate-pulse"
          style={{ color: "rgba(232,200,122,0.3)" }}>
          Loading your style...
        </p>
      </div>

      <style>{`
        @keyframes luxor-square {
          0%   { transform: translate(0, 0) scale(1);   opacity: 0.3; }
          12%  { transform: translate(0, 0) scale(1.1); opacity: 1; }
          25%  { transform: translate(28px, 0) scale(1); opacity: 0.3; }
          37%  { transform: translate(28px, 0) scale(1.1); opacity: 1; }
          50%  { transform: translate(28px, 28px) scale(1); opacity: 0.3; }
          62%  { transform: translate(28px, 28px) scale(1.1); opacity: 1; }
          75%  { transform: translate(0, 28px) scale(1); opacity: 0.3; }
          87%  { transform: translate(0, 28px) scale(1.1); opacity: 1; }
          100% { transform: translate(0, 0) scale(1);   opacity: 0.3; }
        }
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { transform: translateY(-15px) translateX(5px); opacity: 0.6; }
          50% { transform: translateY(-8px) translateX(-3px); opacity: 0.4; }
          75% { transform: translateY(-20px) translateX(8px); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
