"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useDebouncedDimensions } from "@/components/hooks/use-debounced-dimensions";

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
  text = "HOVER!",
  colors = ["ffad70", "f7d297", "edb9a1", "e697ac", "b38dca", "9c76db", "705cb5", "43428e", "2c2142"],
  className = "",
  animationForce = 80,
  particleDensity = 4,
}: ParticleTextEffectProps) {
  const [containerRef, dims] = useDebouncedDimensions<HTMLDivElement>(150);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000, isOver: false });
  const animRef = useRef<number>(0);

  const getColor = useCallback((i: number) => {
    return `#${colors[i % colors.length]}`;
  }, [colors]);

  const write = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !text || dims.width === 0 || dims.height === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = dims.width;
    const h = dims.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "white";
    const fontSize = Math.max(Math.min(h * 0.45, 48), 16);
    ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Word wrap
    const words = text.split(" ");
    const maxWidth = w * 0.9;
    let line = "";
    let y = h / 2 - (Math.ceil(words.length / 2) - 1) * fontSize * 0.7;
    const lineHeight = fontSize * 0.75;

    for (const word of words) {
      const testLine = line + word + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line) {
        ctx.fillText(line.trim(), w / 2, y);
        line = word + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), w / 2, y);

    // Sample pixels into particles
    const imageData = ctx.getImageData(0, 0, w, h);
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
            size: Math.random() * 2 + 1.2,
            color: getColor(newParticles.length),
            alpha: Math.random() * 0.4 + 0.6,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
          });
        }
      }
    }
    particlesRef.current = newParticles;
  }, [text, dims.width, dims.height, particleDensity, getColor]);

  // Initialize canvas when dimensions are ready
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dims.width === 0 || dims.height === 0) return;
    canvas.width = dims.width;
    canvas.height = dims.height;
    write();
  }, [dims.width, dims.height, write]);

  // Animation loop (runs continuously)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) { animId = requestAnimationFrame(animate); return; }
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const isOver = mouseRef.current.isOver;
      const force = animationForce;

      for (const p of particlesRef.current) {
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        p.vx += dx * 0.03;
        p.vy += dy * 0.03;

        if (isOver) {
          const mdx = p.x - mx;
          const mdy = p.y - my;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < force && mdist > 0) {
            const repForce = ((force - mdist) / force) * 4;
            p.vx += (mdx / mdist) * repForce;
            p.vy += (mdy / mdist) * repForce;
          }
        }

        p.vx *= 0.9;
        p.vy *= 0.9;
        p.x += p.vx;
        p.y += p.vy;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [animationForce]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        isOver: true,
      };
    }
  }, []);

  const handlePointerLeave = useCallback(() => {
    mouseRef.current = { x: -1000, y: -1000, isOver: false };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      />
    </div>
  );
}
