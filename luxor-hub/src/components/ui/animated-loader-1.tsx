import React from 'react';

const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a1f1a 0%, #10352a 40%, #0d2b22 100%)' }}>

      {/* Subtle radial glow behind animation */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #E8C87A 0%, transparent 70%)' }} />

      {/* Animated square loader */}
      <div className="relative w-24 h-24 rotate-45 z-10 mb-10">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 left-0 w-7 h-7 m-0.5 animate-square"
            style={{
              animationDelay: `${-1.4285714286 * i}s`,
              background: 'linear-gradient(135deg, #E8C87A 0%, #d4a84a 50%, #E8C87A 100%)',
              boxShadow: '0 0 8px rgba(232,200,122,0.3)',
            }}
          />
        ))}
      </div>

      {/* Brand name with proper ® superscript */}
      <div className="z-10 flex items-start animate-fade-in">
        <span className="text-[#E8C87A] font-display text-2xl md:text-3xl tracking-[0.35em] uppercase font-light">
          LUXOR
        </span>
        <span className="text-[#E8C87A]/70 text-[10px] md:text-xs font-sans mt-[2px] ml-[1px] font-light">
          ®
        </span>
      </div>

      {/* Thin separator line */}
      <div className="w-12 h-[1px] bg-[#E8C87A]/20 mt-4 mb-3 z-10" />

      {/* Tagline */}
      <span className="text-[#E8C87A]/30 text-[9px] tracking-[0.4em] uppercase font-sans z-10">
        Personal Style OS
      </span>

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
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Loader;
