"use client";

import React, { useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  color: string;
  alpha: number;
  vx: number;
  vy: number;
}

interface ParticleTextEffectProps {
  text?: string;
  colors?: string[];
  className?: string;
  animationForce?: number;
  particleDensity?: number;
}

export function ParticleTextEffect({
  text = "",
  colors = ["ff6b6b", "feca57", "48dbfb", "1dd1a1"],
  className = "",
  animationForce = 100,
  particleDensity = 6,
}: ParticleTextEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animRef = useRef<number>(0);

  const getColor = useCallback((i: number, total: number) => {
    const c = colors[i % colors.length];
    return `#${c}`;
  }, [colors]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !text) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        canvas.style.width = rect.width + "px";
        canvas.style.height = rect.height + "px";
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };
    resize();
    window.addEventListener("resize", resize);

    // Generate particles from text using temporary canvas
    const generateParticles = () => {
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = w;
      tempCanvas.height = h;
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return;

      tempCtx.fillStyle = "white";
      tempCtx.font = `bold ${Math.min(h * 0.5, 48)}px system-ui, sans-serif`;
      tempCtx.textAlign = "center";
      tempCtx.textBaseline = "middle";
      
      // Word wrap
      const words = text.split(" ");
      const maxWidth = w * 0.9;
      let line = "";
      let y = h / 2;
      const lineHeight = Math.min(h * 0.55, 52);
      
      for (const word of words) {
        const testLine = line + word + " ";
        const metrics = tempCtx.measureText(testLine);
        if (metrics.width > maxWidth && line) {
          tempCtx.fillText(line.trim(), w / 2, y);
          line = word + " ";
          y += lineHeight * 0.7;
        } else {
          line = testLine;
        }
      }
      tempCtx.fillText(line.trim(), w / 2, y);

      const imageData = tempCtx.getImageData(0, 0, w, h);
      const data = imageData.data;
      const newParticles: Particle[] = [];
      const density = particleDensity;

      for (let py = 0; py < h; py += density) {
        for (let px = 0; px < w; px += density) {
          const idx = (py * w + px) * 4;
          if (data[idx + 3] > 128) {
            newParticles.push({
              x: Math.random() * w,
              y: Math.random() * h,
              targetX: px,
              targetY: py,
              size: Math.random() * 2 + 1,
              color: getColor(newParticles.length, 100),
              alpha: Math.random() * 0.5 + 0.5,
              vx: (Math.random() - 0.5) * 2,
              vy: (Math.random() - 0.5) * 2,
            });
          }
        }
      }
      particlesRef.current = newParticles;
    };

    generateParticles();

    const animate = () => {
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const force = animationForce;

      for (const p of particlesRef.current) {
        // Move toward target
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        p.vx += dx * 0.03;
        p.vy += dy * 0.03;

        // Mouse repulsion
        const mdx = p.x - mx;
        const mdy = p.y - my;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < force && mdist > 0) {
          const repForce = (force - mdist) / force * 3;
          p.vx += (mdx / mdist) * repForce;
          p.vy += (mdy / mdist) * repForce;
        }

        // Damping
        p.vx *= 0.92;
        p.vy *= 0.92;

        p.x += p.vx;
        p.y += p.vy;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };
    const handleLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };
    canvas.addEventListener("mousemove", handleMouse);
    canvas.addEventListener("mouseleave", handleLeave);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouse);
      canvas.removeEventListener("mouseleave", handleLeave);
    };
  }, [text, colors, animationForce, particleDensity, getColor]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: text ? "block" : "none" }}
    />
  );
}
