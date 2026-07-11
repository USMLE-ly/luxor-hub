import { motion } from "framer-motion";
import { useMemo } from "react";

export function GoldParticles() {
  const particles = useMemo(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      size: Math.random() * 2.5 + 1,
      duration: Math.random() * 10 + 14,
      delay: Math.random() * 10,
      drift: (Math.random() - 0.5) * 30,
    })), []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: "radial-gradient(circle, hsl(var(--gold) / 0.5), transparent)",
          }}
          animate={{
            y: [0, 80, 200],
            x: [0, p.drift * 0.5, p.drift],
            opacity: [0, 0.4, 0],
            scale: [0.5, 1, 0.6],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
