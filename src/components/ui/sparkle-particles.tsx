import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  fadeDir: number;
  life: number;
}

interface SparkleParticlesProps {
  count?: number;
  className?: string;
}

const SparkleParticles = ({ count = 50, className = "" }: SparkleParticlesProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const spawn = (): Particle => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.4 - 0.1,
        size: Math.random() * 2 + 0.5,
        opacity: 0,
        fadeDir: 1,
        life: Math.random() * 200 + 100,
      };
    };

    particlesRef.current = Array.from({ length: count }, spawn);

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        if (p.fadeDir === 1) {
          p.opacity = Math.min(p.opacity + 0.015, 0.8);
          if (p.opacity >= 0.8) p.fadeDir = -1;
        } else {
          p.opacity -= 0.008;
        }

        if (p.life <= 0 || p.opacity <= 0 || p.y < -10 || p.x < -10 || p.x > w + 10) {
          Object.assign(p, spawn());
        }

        // Gold sparkle with glow
        const goldH = 43;
        const goldS = 74;
        const goldL = 49 + Math.random() * 16;
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.shadowBlur = p.size * 4;
        ctx.shadowColor = `hsl(${goldH}, ${goldS}%, ${goldL}%)`;
        ctx.fillStyle = `hsl(${goldH}, ${goldS}%, ${goldL}%)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ mask: "radial-gradient(ellipse at center, black 40%, transparent 80%)" }}
    />
  );
};

export default SparkleParticles;
