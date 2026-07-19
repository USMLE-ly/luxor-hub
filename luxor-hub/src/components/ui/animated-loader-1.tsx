import React from 'react';

const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(180deg, #060f0d 0%, #0c2420 35%, #10352a 55%, #0a1f1a 80%, #060f0d 100%)' }}>

      {/* Layered radial glows */}
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(232,200,122,0.06) 0%, transparent 60%)' }} />
      <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(232,200,122,0.02) 0%, transparent 70%)' }} />

      {/* Animated square loader */}
      <div className="relative w-20 h-20 rotate-45 z-10 mb-10">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 left-0 w-6 h-6 m-0.5 animate-square"
            style={{
              animationDelay: `${-1.4285714286 * i}s`,
              background: 'linear-gradient(135deg, #E8C87A 0%, #c9a44e 100%)',
              boxShadow: '0 0 12px rgba(232,200,122,0.15)',
            }}
          />
        ))}
      </div>

      {/* Brand name with ® just above the R */}
      <div className="z-10 flex items-start animate-fade-in">
        <span className="text-white/90 font-display text-xl md:text-2xl tracking-[0.35em] uppercase font-light" style={{ textShadow: '0 0 30px rgba(232,200,122,0.06)' }}>
          LUXOR
        </span>
        <span style={{ fontSize: '0.22em', position: 'relative', top: '-0.65em', marginLeft: '1px', opacity: 0.45 }} className="font-sans font-normal text-[#E8C87A]">
          ®
        </span>
      </div>

      {/* Thin separator */}
      <div className="w-16 h-[1px] mt-5 mb-3 z-10" style={{ background: 'linear-gradient(90deg, transparent, rgba(232,200,122,0.15), transparent)' }} />

      {/* Tagline */}
      <span className="text-[9px] tracking-[0.45em] uppercase font-sans font-light z-10" style={{ color: 'rgba(232,200,122,0.25)' }}>
        Personal Style OS
      </span>

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
          62.5% { left: 28px; top: 56px; }
          73% { left: 28px; top: 56px; }
          75% { left: 0; top: 56px; }
          85.5% { left: 0; top: 56px; }
          87.5% { left: 0; top: 28px; }
          98% { left: 0; top: 28px; }
          100% { left: 0; top: 0; }
        }
        .animate-square {
          animation: square-animation 10s ease-in-out infinite both;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default Loader;
