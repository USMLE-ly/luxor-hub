import { useEffect, useRef } from "react";

const CursorSpotlight = () => {
  const ref = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -500, y: -500 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    if (prefersReduced || isCoarse) return;

    const el = ref.current;
    if (!el) return;

    let targetX = -500;
    let targetY = -500;

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const animate = () => {
      pos.current.x += (targetX - pos.current.x) * 0.15;
      pos.current.y += (targetY - pos.current.y) * 0.15;
      el.style.transform = `translate(${pos.current.x - 200}px, ${pos.current.y - 200}px)`;
      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="fixed top-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none z-[1] will-change-transform"
      style={{
        background: "radial-gradient(circle, hsl(43 74% 49% / 0.04) 0%, transparent 70%)",
      }}
    />
  );
};

export default CursorSpotlight;
