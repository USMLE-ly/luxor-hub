import { useMemo } from "react";

export function GoldParticles() {
  const particles = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 10 + 16,
      delay: Math.random() * 10,
      drift: (Math.random() - 0.5) * 20,
    })), []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none will-change-transform">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            bottom: "-10%",
            width: p.size,
            height: p.size,
            background: "rgba(232,200,122,0.4)",
            animation: `gold-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            ["--drift" as string]: `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
