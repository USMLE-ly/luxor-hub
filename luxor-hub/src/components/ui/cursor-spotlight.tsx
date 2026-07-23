import { useEffect, useRef } from "react";

const CursorSpotlight = () => {
  const ref = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -500, y: -500 });
  const rafRef = useRef<number>(0);
  const activeRef = useRef(false);

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
      if (!activeRef.current) return;
      pos.current.x += (targetX - pos.current.x) * 0.15;
      pos.current.y += (targetY - pos.current.y) * 0.15;
      el.style.transform = `translate(${pos.current.x - 200}px, ${pos.current.y - 200}px)`;
      rafRef.current = requestAnimationFrame(animate);
    };

    // Only run RAF when hero is in viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !activeRef.current) {
          activeRef.current = true;
          window.addEventListener("mousemove", onMove, { passive: true });
          rafRef.current = requestAnimationFrame(animate);
        } else if (!entry.isIntersecting && activeRef.current) {
          activeRef.current = false;
          window.removeEventListener("mousemove", onMove);
          cancelAnimationFrame(rafRef.current);
          el.style.transform = "translate(-500px, -500px)";
        }
      },
      { threshold: 0.1 }
    );

    // Observe the hero parent section
    const heroSection = el.closest("section") || el.parentElement;
    if (heroSection) observer.observe(heroSection);

    return () => {
      activeRef.current = false;
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute left-0 top-0 z-[1] h-[400px] w-[400px] rounded-full opacity-[0.07] will-change-transform"
      style={{
        background: "radial-gradient(circle, hsl(var(--gold) / 0.4), transparent 70%)",
        filter: "blur(60px)",
        transform: "translate(-500px, -500px)",
      }}
    />
  );
};

export default CursorSpotlight;
