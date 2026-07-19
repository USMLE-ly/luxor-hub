import React, { useState, useEffect } from 'react';

interface LoaderProps {
  /** Total estimated seconds for the countdown */
  estimatedSeconds?: number;
  /** Callback when countdown finishes or page loads */
  onComplete?: () => void;
}

const Loader: React.FC<LoaderProps> = ({ estimatedSeconds = 5, onComplete }) => {
  const [remaining, setRemaining] = useState(estimatedSeconds);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
      setProgress((prev) => Math.min(prev + (100 / estimatedSeconds), 95));
    }, 1000);
    return () => clearInterval(interval);
  }, [estimatedSeconds]);

  // Complete callback when countdown hits zero
  useEffect(() => {
    if (remaining === 0 && onComplete) {
      onComplete();
    }
  }, [remaining, onComplete]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeDisplay = minutes > 0
    ? `${minutes}:${seconds.toString().padStart(2, '0')}`
    : `${seconds}s`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#10352a] overflow-hidden">
      {/* Animated square loader */}
      <div className="relative w-24 h-24 rotate-45 z-10 mb-8">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 left-0 w-7 h-7 m-0.5 animate-square bg-[#E8C87A]"
            style={{ animationDelay: `${-1.4285714286 * i}s` }}
          />
        ))}
      </div>

      {/* Brand name */}
      <div className="text-[#E8C87A] font-display text-lg tracking-[0.3em] uppercase mb-4 z-10">
        LUXOR®
      </div>

      {/* Countdown timer */}
      <div className="text-[#E8C87A]/80 font-mono text-3xl font-light tracking-wider z-10 mb-3">
        {timeDisplay}
      </div>

      {/* Progress bar */}
      <div className="w-48 h-[2px] bg-[#E8C87A]/10 rounded-full overflow-hidden z-10">
        <div
          className="h-full bg-[#E8C87A] rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Loading text */}
      <div className="text-[#E8C87A]/40 text-[10px] tracking-[0.2em] uppercase mt-3 z-10">
        {remaining > 0 ? 'Preparing your experience' : 'Almost ready'}
      </div>

      <style>{`
        @keyframes square-animation {
          0% { left: 0; top: 0; }
          10.5% { left: 0; top: 0; }
          12.5% { left: 32px; top: 0; }
          23% { left: 32px; top: 0; }
          25% { left: 64px; top: 0; }
          35.5% { left: 64px; top: 0; }
          37.5% { left: 64px; top: 32px; }
          48% { left: 64px; top: 32px; }
          50% { left: 32px; top: 32px; }
          60.5% { left: 32px; top: 32px; }
          62.5% { left: 32px; top: 64px; }
          73% { left: 32px; top: 64px; }
          75% { left: 0; top: 64px; }
          85.5% { left: 0; top: 64px; }
          87.5% { left: 0; top: 32px; }
          98% { left: 0; top: 32px; }
          100% { left: 0; top: 0; }
        }
        .animate-square {
          animation: square-animation 10s ease-in-out infinite both;
        }
      `}</style>
    </div>
  );
};

export default Loader;
