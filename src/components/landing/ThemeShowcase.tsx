import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Sun, Moon, Sparkles, Star, TrendingUp, Palette } from "lucide-react";

const MockCard = ({ label, icon: Icon }: { label: string; icon: React.ElementType }) => (
  <div className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm p-4 flex items-center gap-3">
    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <div className="min-w-0">
      <p className="text-sm font-semibold text-foreground truncate">{label}</p>
      <p className="text-xs text-muted-foreground">AI-powered</p>
    </div>
  </div>
);

const MockDashboard = ({ mode }: { mode: "light" | "dark" }) => {
  const isDark = mode === "dark";
  const bg = isDark ? "bg-[hsl(240,10%,6%)]" : "bg-[hsl(40,30%,97%)]";
  const card = isDark ? "bg-[hsl(240,8%,10%)] border-[hsl(240,6%,16%)]" : "bg-[hsl(40,25%,99%)] border-[hsl(40,18%,85%)]";
  const text = isDark ? "text-[hsl(40,20%,95%)]" : "text-[hsl(30,10%,12%)]";
  const muted = isDark ? "text-[hsl(240,5%,55%)]" : "text-[hsl(30,8%,46%)]";
  const primary = "text-[hsl(43,74%,49%)]";
  const primaryBg = isDark ? "bg-[hsl(43,74%,49%)]/10" : "bg-[hsl(43,74%,49%)]/10";
  const border = isDark ? "border-[hsl(240,6%,16%)]" : "border-[hsl(40,18%,85%)]";

  return (
    <div className={`${bg} rounded-2xl ${border} border p-5 space-y-4 w-full max-w-sm shadow-2xl`}>
      {/* Header */}
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
        <div className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${primary} ${primaryBg}`}>
          92
        </div>
      </div>

      {/* Style cards */}
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

      {/* Bottom bar */}
      <div className={`${card} border rounded-xl p-3`}>
        <div className="flex items-center justify-between mb-2">
          <p className={`text-[10px] uppercase tracking-wider font-semibold ${muted}`}>Today's Outfit</p>
          <div className={`w-1.5 h-1.5 rounded-full bg-green-400`} />
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
  const [hoveredSide, setHoveredSide] = useState<"light" | "dark" | null>(null);

  return (
    <section ref={ref} className="relative py-24 md:py-32 overflow-hidden">
      {/* Subtle bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/10 to-transparent" />

      <div className="relative max-w-5xl mx-auto px-4">
        {/* Header */}
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
            A meticulously crafted design system that adapts seamlessly between light and dark themes.
          </p>
        </motion.div>

        {/* Comparison */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Light */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col items-center gap-5"
            onMouseEnter={() => setHoveredSide("light")}
            onMouseLeave={() => setHoveredSide(null)}
          >
            <div className="flex items-center gap-2 text-sm font-sans font-semibold text-muted-foreground">
              <Sun className="w-4 h-4 text-primary" />
              <span>Light Mode</span>
            </div>
            <motion.div
              animate={{ scale: hoveredSide === "light" ? 1.02 : 1 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              {/* Glow */}
              <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-2xl" />
              <MockDashboard mode="light" />
            </motion.div>
          </motion.div>

          {/* Dark */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="flex flex-col items-center gap-5"
            onMouseEnter={() => setHoveredSide("dark")}
            onMouseLeave={() => setHoveredSide(null)}
          >
            <div className="flex items-center gap-2 text-sm font-sans font-semibold text-muted-foreground">
              <Moon className="w-4 h-4 text-primary" />
              <span>Dark Mode</span>
            </div>
            <motion.div
              animate={{ scale: hoveredSide === "dark" ? 1.02 : 1 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-2xl" />
              <MockDashboard mode="dark" />
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center text-xs text-muted-foreground/60 font-sans mt-12 tracking-wide"
        >
          Gold-and-charcoal glassmorphic system • HSL design tokens • Consistent across themes
        </motion.p>
      </div>
    </section>
  );
};

export default ThemeShowcase;
