import { motion } from "framer-motion";

const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: -10 - Math.random() * 20,
  size: Math.random() * 3 + 1.5,
  duration: Math.random() * 10 + 12,
  delay: Math.random() * 8,
}));

export function GoldParticles() {
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
            background: "radial-gradient(circle, hsl(0 0% 85% / 0.7), hsl(0 0% 65% / 0.2))",
          }}
          animate={{
            y: [0, 120, 250],
            x: [0, Math.random() * 30 - 15, Math.random() * 20 - 10],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
