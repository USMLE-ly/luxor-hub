import React from 'react';

const AnimatedLoader: React.FC = () => {
  const squares = Array.from({ length: 9 });

  return (
    <div className="w-full min-h-screen flex items-center justify-center relative overflow-hidden bg-[#10352a]">
      {squares.map((_, i) => (
        <div
          key={i}
          className="absolute top-0 left-0 w-7 h-7 m-0.5 animate-square bg-[#E8C87A]"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
      <style>{`
        @keyframes square-animation {
          0% { top: 0; left: 0; }
          12.5% { top: 0; left: calc(100% - 2.75rem); }
          25% { top: calc(100% - 2.75rem); left: calc(100% - 2.75rem); }
          37.5% { top: calc(100% - 2.75rem); left: 0; }
          50% { top: calc(50% - 1.375rem); left: calc(50% - 1.375rem); }
          62.5% { top: 0; left: calc(50% - 1.375rem); }
          75% { top: calc(100% - 2.75rem); left: calc(50% - 1.375rem); }
          87.5% { top: calc(50% - 1.375rem); left: 0; }
          100% { top: calc(50% - 1.375rem); left: calc(100% - 2.75rem); }
        }
        .animate-square {
          animation: square-animation 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AnimatedLoader;
