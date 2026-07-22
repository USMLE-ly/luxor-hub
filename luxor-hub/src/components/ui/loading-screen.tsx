import React from "react";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(180deg, #060f0d 0%, #0c2420 30%, #10352a 55%, #0a1f1a 80%, #060f0d 100%)" }}>

      {/* Subtle radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(232,200,122,0.04) 0%, transparent 70%)" }} />
      </div>

      {/* Golden diamond loader */}
      <div className="relative w-20 h-20 rotate-45 mb-8">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 left-0 w-5.5 h-5.5 m-0.5 rounded-[2px]"
            style={{
              backgroundColor: "#E8C87A",
              animation: `luxor-square 10s ease-in-out ${-1.4285714286 * i}s infinite both`,
              boxShadow: "0 0 12px rgba(232,200,122,0.15)",
            }}
          />
        ))}
      </div>

      {/* Loading text */}
      <p className="relative z-10 text-[10px] sm:text-[11px] uppercase tracking-[0.5em] font-light"
        style={{ color: "rgba(232,200,122,0.25)" }}>
        Loading
      </p>

      <style>{`
        @keyframes luxor-square {
          0%   { left: 0;    top: 0;    }
          10%  { left: 0;    top: 0;    }
          12%  { left: 22px; top: 0;    }
          22%  { left: 22px; top: 0;    }
          24%  { left: 44px; top: 0;    }
          34%  { left: 44px; top: 0;    }
          36%  { left: 44px; top: 22px; }
          46%  { left: 44px; top: 22px; }
          48%  { left: 22px; top: 22px; }
          58%  { left: 22px; top: 22px; }
          60%  { left: 22px; top: 44px; }
          70%  { left: 22px; top: 44px; }
          72%  { left: 0;    top: 44px; }
          82%  { left: 0;    top: 44px; }
          84%  { left: 0;    top: 22px; }
          94%  { left: 0;    top: 22px; }
          96%  { left: 0;    top: 0;    }
          100% { left: 0;    top: 0;    }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
