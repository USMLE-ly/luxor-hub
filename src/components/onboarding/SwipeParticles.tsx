import { useEffect, useRef, useCallback } from "react";

interface SwipeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  life: number;
  maxLife: number;
  hue: number;
}

interface SwipeParticlesProps {
  /** Call with velocity to burst particles on swipe */
  swipeVelocity: { x: number; y: number };
  swipeTrigger: number; // increment to trigger burst
}

const SwipeParticles = ({ swipeVelocity, swipeTrigger }: SwipeParticlesProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<SwipeParticle[]>([]);
  const ambientRef = useRef<SwipeParticle[]>([]);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef(0);

  // Initialize ambient floating particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      // Create ambient particles
      const count = Math.min(Math.floor((canvas.width * canvas.height) / 25000), 15);
      ambientRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.2 - 0.1,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.15 + 0.05,
        life: 1,
        maxLife: 1,
        hue: 38 + (Math.random() - 0.5) * 20,
      }));
    };

    resize();
    window.addEventListener("resize", resize);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = (now: number) => {
      rafRef.current = requestAnimationFrame(draw);
      if (now - lastTimeRef.current < 33) return; // ~30fps
      lastTimeRef.current = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw ambient particles
      for (const p of ambientRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 55%, ${p.alpha})`;
        ctx.fill();
      }

      // Draw and update swipe burst particles
      const alive: SwipeParticle[] = [];
      for (const p of particlesRef.current) {
        p.life -= 1 / 60;
        if (p.life <= 0) continue;

        const t = p.life / p.maxLife;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.vy += 0.02; // slight gravity

        const currentAlpha = p.alpha * t;
        const currentRadius = p.radius * (0.3 + 0.7 * t);

        // Glow effect
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentRadius * 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 75%, 60%, ${currentAlpha * 0.15})`;
        ctx.fill();

        // Core particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${currentAlpha})`;
        ctx.fill();

        alive.push(p);
      }
      particlesRef.current = alive;
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Burst particles on swipe
  useEffect(() => {
    if (swipeTrigger === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const speed = Math.sqrt(swipeVelocity.x ** 2 + swipeVelocity.y ** 2);
    const count = Math.min(Math.floor(speed * 0.03) + 12, 40);

    const newParticles: SwipeParticle[] = Array.from({ length: count }, () => {
      const angle = Math.atan2(swipeVelocity.y, swipeVelocity.x) + (Math.random() - 0.5) * 1.8;
      const v = (Math.random() * 0.5 + 0.5) * Math.min(speed * 0.008, 6);
      const life = Math.random() * 1.2 + 0.6;
      return {
        x: cx + (Math.random() - 0.5) * canvas.width * 0.6,
        y: cy + (Math.random() - 0.5) * canvas.height * 0.3,
        vx: Math.cos(angle) * v,
        vy: Math.sin(angle) * v,
        radius: Math.random() * 2.5 + 1,
        alpha: Math.random() * 0.6 + 0.3,
        life,
        maxLife: life,
        hue: 35 + Math.random() * 25, // gold spectrum
      };
    });

    particlesRef.current.push(...newParticles);

    // Also push ambient particles in swipe direction
    for (const p of ambientRef.current) {
      p.vx += swipeVelocity.x * 0.003;
      p.vy += swipeVelocity.y * 0.001;
    }
  }, [swipeTrigger]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[5]"
      aria-hidden
    />
  );
};

export default SwipeParticles;
