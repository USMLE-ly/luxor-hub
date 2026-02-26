import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  hue: number;
}

interface ParticleCanvasProps {
  className?: string;
  particleColor?: { h: number; s: number; l: number };
  maxParticles?: number;
  connectionDistance?: number;
}

const ParticleCanvas = ({
  className = "",
  particleColor,
  maxParticles,
  connectionDistance = 100,
}: ParticleCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const baseHue = particleColor?.h ?? 43;
    const baseSat = particleColor?.s ?? 74;
    const baseLight = particleColor?.l ?? 49;

    const init = () => {
      const mobile = window.innerWidth < 768;
      const count = Math.min(
        Math.floor((canvas.width * canvas.height) / (mobile ? 20000 : 12000)),
        maxParticles ?? (mobile ? 20 : 30)
      );
      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.32,
        vy: (Math.random() - 0.5) * 0.32,
        radius: Math.random() * 1.6 + 0.4,
        alpha: Math.random() * 0.4 + 0.1,
        hue: baseHue + (Math.random() - 0.5) * 30,
      }));
    };

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      init();
    };

    let lastDrawTime = 0;
    const draw = (now: number) => {
      rafRef.current = requestAnimationFrame(draw);
      if (now - lastDrawTime < 50) return; // ~20fps
      lastDrawTime = now;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const ps = particlesRef.current;
      const m = mouseRef.current;

      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        const dx = m.x - p.x;
        const dy = m.y - p.y;
        const d = Math.sqrt(dx * dx + dy * dy);

        if (d < 120 && d > 0) {
          const f = (120 - d) / 120;
          p.vx -= (dx / d) * f * 0.022;
          p.vy -= (dy / d) * f * 0.022;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.vy *= 0.99;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},${baseSat}%,${baseLight}%,${p.alpha})`;
        ctx.fill();

        for (let j = i + 1; j < ps.length; j++) {
          const q = ps[j];
          const ddx = p.x - q.x;
          const ddy = p.y - q.y;
          const d2 = Math.sqrt(ddx * ddx + ddy * ddy);
          if (d2 < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `hsla(${(p.hue + q.hue) / 2},${baseSat}%,${baseLight}%,${(1 - d2 / connectionDistance) * 0.08})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    resize();
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, [particleColor, maxParticles, connectionDistance]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      aria-hidden
    />
  );
};

export default ParticleCanvas;
