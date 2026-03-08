import { motion, useInView } from "framer-motion";
import { useRef, useState, useCallback } from "react";
import { GripVertical, Sparkles, Star, TrendingUp, Palette } from "lucide-react";
import { TextReveal } from "@/components/ui/animated-text-reveal";

const MockDashboard = ({ mode }: { mode: "light" | "dark" }) => {
  const isDark = mode === "dark";
  const bg = isDark ? "bg-[hsl(240,10%,6%)]" : "bg-[hsl(40,30%,97%)]";
  const card = isDark ? "bg-[hsl(240,8%,10%)] border-[hsl(240,6%,16%)]" : "bg-[hsl(40,25%,99%)] border-[hsl(40,18%,85%)]";
  const text = isDark ? "text-[hsl(40,20%,95%)]" : "text-[hsl(30,10%,12%)]";
  const muted = isDark ? "text-[hsl(240,5%,55%)]" : "text-[hsl(30,8%,46%)]";
  const primary = "text-[hsl(43,74%,49%)]";
  const primaryBg = "bg-[hsl(43,74%,49%)]/10";

  return (
    <div className={`${bg} p-5 space-y-4 w-full h-full`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${primaryBg} flex items-center justify-center`}>
            <Sparkles className={`w-4 h-4 ${primary}`} />
          </div>
          <div>
            <p className={`text-sm font-display font-bold ${text}`}>Style DNA</p>
            <p className={`text-[10px] ${muted}`}>Your profile</p>
          </div>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${primary} ${primaryBg}`}>92</div>
      </div>
      <div className="space-y-2.5">
        {[
          { label: "Warm Autumn", sub: "Color Type", icon: Palette },
          { label: "Modern Classic", sub: "Style Type", icon: Star },
          { label: "Inverted Triangle", sub: "Body Type", icon: TrendingUp },
        ].map((item) => (
          <div key={item.label} className={`${card} border rounded-xl p-3 flex items-center gap-3`}>
            <div className={`w-8 h-8 rounded-lg ${primaryBg} flex items-center justify-center shrink-0`}>
              <item.icon className={`w-3.5 h-3.5 ${primary}`} />
            </div>
            <div>
              <p className={`text-xs font-semibold ${text}`}>{item.label}</p>
              <p className={`text-[10px] ${muted}`}>{item.sub}</p>
            </div>
          </div>
        ))}
      </div>
      <div className={`${card} border rounded-xl p-3`}>
        <div className="flex items-center justify-between mb-2">
          <p className={`text-[10px] uppercase tracking-wider font-semibold ${muted}`}>Today's Outfit</p>
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
        </div>
        <div className="flex gap-2">
          {["bg-gradient-to-br from-amber-600 to-amber-400", "bg-gradient-to-br from-slate-700 to-slate-500", "bg-gradient-to-br from-stone-600 to-stone-400"].map((g, i) => (
            <div key={i} className={`w-10 h-10 rounded-lg ${g}`} />
          ))}
          <div className={`w-10 h-10 rounded-lg ${primaryBg} flex items-center justify-center`}>
            <span className={`text-[10px] font-bold ${primary}`}>+3</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ThemeShowcase = () => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [dragging, setDragging] = useState(false);

  const updateSlider = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(5, Math.min(95, pct)));
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateSlider(e.clientX);
  }, [updateSlider]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    updateSlider(e.clientX);
  }, [dragging, updateSlider]);

  const onPointerUp = useCallback(() => setDragging(false), []);

  return (
    <section ref={ref} className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/10 to-transparent" />

      <div className="relative max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-sans font-semibold uppercase tracking-[0.25em] text-primary mb-4 block">
            Design System
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Beautiful in <span className="gold-text">Every Light</span>
          </h2>
          <p className="text-muted-foreground font-sans max-w-md mx-auto">
            Drag the handle to compare light and dark themes in real-time.
          </p>
        </motion.div>

        {/* Comparison Slider */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative max-w-sm mx-auto"
        >
          {/* Gold animated border */}
          <div className="absolute -inset-[2px] rounded-[1.75rem] bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20 animate-[spin_8s_linear_infinite] opacity-40 blur-[1px]" />

          <div
            ref={containerRef}
            className="relative rounded-2xl overflow-hidden border border-border h-[420px] touch-none select-none cursor-col-resize bg-card"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            {/* Light mode (full width, behind) */}
            <div className="absolute inset-0">
              <MockDashboard mode="light" />
            </div>

            {/* Dark mode (clipped from right) */}
            <div
              className="absolute inset-0"
              style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
            >
              <MockDashboard mode="dark" />
            </div>

            {/* Divider handle */}
            <div
              className="absolute top-0 bottom-0 z-20 flex items-center justify-center"
              style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
            >
              <div className="w-px h-full bg-primary/60" />
              <div className="absolute w-10 h-10 rounded-full bg-card/90 backdrop-blur-md border-2 border-primary shadow-[0_0_16px_hsl(var(--primary)/0.3)] flex items-center justify-center">
                <GripVertical className="w-4 h-4 text-primary" />
              </div>
            </div>

            {/* Labels */}
            <div className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-md bg-card/80 backdrop-blur-sm text-[10px] font-sans font-semibold text-muted-foreground border border-border">
              Light
            </div>
            <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-md bg-[hsl(240,10%,8%)]/80 backdrop-blur-sm text-[10px] font-sans font-semibold text-[hsl(40,20%,70%)] border border-[hsl(240,6%,16%)]">
              Dark
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center text-xs text-muted-foreground/60 font-sans mt-10 tracking-wide"
        >
          Gold-and-charcoal glassmorphic system • HSL design tokens • Consistent across themes
        </motion.p>
      </div>
    </section>
  );
};

export default ThemeShowcase;
