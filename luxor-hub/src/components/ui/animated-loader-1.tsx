import React from 'react';

const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      {/* Animated square loader */}
      <div className="relative w-12 h-12 rotate-45 mb-6">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 left-0 w-4 h-4 m-0.5 animate-square"
            style={{
              animationDelay: `${-1.4285714286 * i}s`,
              background: 'linear-gradient(135deg, #E8C87A 0%, #c9a44e 100%)',
              boxShadow: '0 0 8px rgba(232,200,122,0.15)',
            }}
          />
        ))}
      </div>

      {/* Brand name */}
      <div className="flex items-start">
        <span className="text-white/90 font-display text-sm tracking-[0.35em] uppercase font-light">
          LUXOR
        </span>
        <span className="inline-block align-super text-[0.45em] leading-none -ml-[0.1em] text-[#E8C87A]/60">®</span>
      </div>

      <style>{`
        @keyframes square-animation {
          0% { left: 0; top: 0; }
          10.5% { left: 0; top: 0; }
          12.5% { left: 28px; top: 0; }
          23% { left: 28px; top: 0; }
          25% { left: 56px; top: 0; }
          35.5% { left: 56px; top: 0; }
          37.5% { left: 56px; top: 28px; }
          48% { left: 56px; top: 28px; }
          50% { left: 28px; top: 28px; }
          60.5% { left: 28px; top: 28px; }
          62.5% { left: 56px; top: 56px; }
          73% { left: 56px; top: 56px; }
          75% { left: 0; top: 56px; }
          85.5% { left: 0; top: 56px; }
          87.5% { left: 0; top: 28px; }
          98% { left: 0; top: 28px; }
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
