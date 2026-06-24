import { r as reactExports, j as jsxRuntimeExports } from "./index-he9NPeB4.js";
const SwipeParticles = ({ swipeVelocity, swipeTrigger }) => {
  const canvasRef = reactExports.useRef(null);
  const particlesRef = reactExports.useRef([]);
  const ambientRef = reactExports.useRef([]);
  const rafRef = reactExports.useRef(0);
  const lastTimeRef = reactExports.useRef(0);
  reactExports.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const count = Math.min(Math.floor(canvas.width * canvas.height / 25e3), 15);
      ambientRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.2 - 0.1,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.15 + 0.05,
        life: 1,
        maxLife: 1,
        hue: 38 + (Math.random() - 0.5) * 20
      }));
    };
    resize();
    window.addEventListener("resize", resize);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const draw = (now) => {
      rafRef.current = requestAnimationFrame(draw);
      if (now - lastTimeRef.current < 33) return;
      lastTimeRef.current = now;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
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
      const alive = [];
      for (const p of particlesRef.current) {
        p.life -= 1 / 60;
        if (p.life <= 0) continue;
        const t = p.life / p.maxLife;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.vy += 0.02;
        const currentAlpha = p.alpha * t;
        const currentRadius = p.radius * (0.3 + 0.7 * t);
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentRadius * 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 75%, 60%, ${currentAlpha * 0.15})`;
        ctx.fill();
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
  reactExports.useEffect(() => {
    if (swipeTrigger === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const speed = Math.sqrt(swipeVelocity.x ** 2 + swipeVelocity.y ** 2);
    const count = Math.min(Math.floor(speed * 0.03) + 12, 40);
    const newParticles = Array.from({ length: count }, () => {
      const angle = Math.atan2(swipeVelocity.y, swipeVelocity.x) + (Math.random() - 0.5) * 1.8;
      const v = (Math.random() * 0.5 + 0.5) * Math.min(speed * 8e-3, 6);
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
        hue: 35 + Math.random() * 25
        // gold spectrum
      };
    });
    particlesRef.current.push(...newParticles);
    for (const p of ambientRef.current) {
      p.vx += swipeVelocity.x * 3e-3;
      p.vy += swipeVelocity.y * 1e-3;
    }
  }, [swipeTrigger]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "canvas",
    {
      ref: canvasRef,
      className: "fixed inset-0 w-full h-full pointer-events-none z-[5]",
      "aria-hidden": true
    }
  );
};
function useGyroTilt(maxTilt = 8) {
  const [tilt, setTilt] = reactExports.useState({ rotateX: 0, rotateY: 0 });
  const frameRef = reactExports.useRef(0);
  const targetRef = reactExports.useRef({ rotateX: 0, rotateY: 0 });
  const currentRef = reactExports.useRef({ rotateX: 0, rotateY: 0 });
  const hasGyro = reactExports.useRef(false);
  const initialBeta = reactExports.useRef(null);
  const initialGamma = reactExports.useRef(null);
  const animate = reactExports.useCallback(() => {
    const lerp = 0.08;
    const curr = currentRef.current;
    const target = targetRef.current;
    curr.rotateX += (target.rotateX - curr.rotateX) * lerp;
    curr.rotateY += (target.rotateY - curr.rotateY) * lerp;
    if (Math.abs(curr.rotateX - tilt.rotateX) > 0.05 || Math.abs(curr.rotateY - tilt.rotateY) > 0.05) {
      setTilt({ rotateX: curr.rotateX, rotateY: curr.rotateY });
    }
    frameRef.current = requestAnimationFrame(animate);
  }, []);
  reactExports.useEffect(() => {
    frameRef.current = requestAnimationFrame(animate);
    const handleOrientation = (e) => {
      if (e.beta === null || e.gamma === null) return;
      hasGyro.current = true;
      if (initialBeta.current === null) {
        initialBeta.current = e.beta;
        initialGamma.current = e.gamma;
      }
      const beta = e.beta - (initialBeta.current ?? 0);
      const gamma = e.gamma - (initialGamma.current ?? 0);
      const clamp = (v) => Math.max(-maxTilt, Math.min(maxTilt, v));
      targetRef.current = {
        rotateX: clamp(-beta * 0.3),
        rotateY: clamp(gamma * 0.3)
      };
    };
    const handleMouse = (e) => {
      if (hasGyro.current) return;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const x = (e.clientX - cx) / cx;
      const y = (e.clientY - cy) / cy;
      targetRef.current = {
        rotateX: -y * maxTilt * 0.5,
        rotateY: x * maxTilt * 0.5
      };
    };
    window.addEventListener("deviceorientation", handleOrientation, true);
    window.addEventListener("mousemove", handleMouse, { passive: true });
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("deviceorientation", handleOrientation, true);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, [animate, maxTilt]);
  return tilt;
}
export {
  SwipeParticles as S,
  useGyroTilt as u
};
