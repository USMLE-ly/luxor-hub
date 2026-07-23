import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { GoldParticles } from "@/components/app/GoldParticles";
import NumberTicker from "@/components/ui/number-ticker";

const LiveCounter = ({ base = 2400, range = 120, intervalMs = 3000 }: { base?: number; range?: number; intervalMs?: number }) => {
  const [count, setCount] = useState(base);
  useEffect(() => {
    const tick = () => {
      setCount((prev) => {
        const delta = Math.floor(Math.random() * 7) - 3; // -3 to +3
        const next = prev + delta;
        const min = base - range / 2;
        const max = base + range / 2;
        return Math.max(min, Math.min(max, next));
      });
    };
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [base, range, intervalMs]);
  return <span>{count.toLocaleString()}+</span>;
};
import Pressable from "@/components/ui/pressable";
import { DoubleBezel, DoubleBezelCard } from "@/components/ui/double-bezel";
import CursorSpotlight from "@/components/ui/cursor-spotlight";
import { ProgressiveImage } from "@/components/ui/progressive-image";
// ThreeGarmentShowcase removed — heavy Three.js freezes mobile devices
import {ArrowRight, Play, Target, Crown, Star, Hexagon, Triangle, Command, Ghost, Diamond, Cpu, CaretDown, } from "@phosphor-icons/react";
// Hero video served from public/ folder

const FloatingCircle = ({
  size,
  top,
  left,
  gradient,
  duration,
  delay,
}: {
  size: number;
  top: string;
  left: string;
  gradient: string;
  duration: number;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 0.6 }}
    transition={{
      opacity: { duration: 2, delay },
    }}
    className="absolute rounded-full pointer-events-none border border-white/[0.08] backdrop-blur-[2px] floating-circle"
    style={{
      width: size,
      height: size,
      top,
      left,
      background: gradient,
    }}
  />
);

const CLIENTS = [
  { name: "VOGUE", icon: Hexagon },
  { name: "GLAMOUR", icon: Triangle },
  { name: "BAZAAR", icon: Command },
  { name: "ELLE", icon: Ghost },
  { name: "GQ", icon: Diamond },
  { name: "WIRED", icon: Cpu },
];

const TESTIMONIALS = [
  { quote: "I save 20 minutes every morning. Haven't second-guessed an outfit in weeks.", name: "Jessica M.", detail: "Premium · NYC", stars: 5 },
  { quote: "Stopped buying clothes I never wear. The AI knows my style better than I do.", name: "David R.", detail: "Style Plan · London", stars: 5 },
  { quote: "Everyone asks how I always look put together. This is why.", name: "Aisha K.", detail: "Premium · Dubai", stars: 5 },
];

const StatItem = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-center justify-center transition-transform hover:-translate-y-1 cursor-default">
    <span className="text-xl font-bold text-foreground sm:text-2xl">{value}</span>
    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium sm:text-xs">{label}</span>
  </div>
);

export default function GlassmorphismTrustHero() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);

  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTestimonialIdx((i) => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div ref={heroRef} className="relative w-full bg-background text-foreground overflow-hidden font-sans">
      <CursorSpotlight />

      {/* Background video with parallax + scale */}
      <div className="absolute inset-0 z-0">
        <video
          src="/videos/hero-video.mp4"
          preload="auto"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-[120%] object-cover"
          style={{ animation: "heroKenBurns 20s ease-in-out infinite" }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, hsl(var(--background) / 0.55), hsl(var(--background) / 0.35))" }} />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: "radial-gradient(ellipse at 30% 20%, hsl(var(--gold) / 0.15), transparent 60%), radial-gradient(ellipse at 70% 80%, hsl(var(--forest) / 0.25), transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: "inset 0 0 120px 60px hsl(var(--background))" }}
        />
      </div>

      {/* Floating premium circles */}
      <GoldParticles />
      {/* Luxury floating garment accent — CSS-only, zero JS */}
      <div className="absolute right-[-2%] top-[8%] w-[40%] h-[70%] z-[1] pointer-events-none opacity-50 hidden lg:flex items-center justify-center">
        <div className="relative w-[280px] h-[360px]">
          <div className="absolute inset-0 rounded-[40%] border border-gold/10 animate-[spin_20s_linear_infinite]" />
          <div className="absolute inset-[15%] rounded-[45%] border border-gold/15 animate-[spin_15s_linear_infinite_reverse]" />
          <div className="absolute inset-[30%] rounded-full bg-gradient-to-br from-gold/20 via-gold/5 to-transparent animate-pulse" />
          <div className="absolute inset-0 rounded-[40%] bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent" />
        </div>
      </div>
      <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
        <FloatingCircle size={320} top="-5%" left="-8%" gradient="radial-gradient(circle, hsl(var(--gold) / 0.08) 0%, transparent 70%)" duration={14} delay={0} />
        <FloatingCircle size={200} top="15%" left="75%" gradient="radial-gradient(circle, hsl(var(--accent) / 0.08) 0%, transparent 70%)" duration={12} delay={1} />
        <FloatingCircle size={400} top="55%" left="60%" gradient="radial-gradient(circle, hsl(var(--gold) / 0.05) 0%, transparent 70%)" duration={16} delay={2} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6 md:pt-32 md:pb-20 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-start">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-8 pt-8">

            {/* Badge */}
            <div className="hero-animate-fade-in hero-delay-100">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/30 bg-card/50 px-3 py-1.5 backdrop-blur-md transition-colors hover:bg-card/80">
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  AI-Powered Styling
                  <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                </span>
              </div>
            </div>

            {/* Heading */}
            <h1
              className="hero-animate-fade-in hero-delay-200 font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-medium tracking-tighter leading-[0.9]"
              style={{
                maskImage: "linear-gradient(180deg, black 0%, black 80%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(180deg, black 0%, black 80%, transparent 100%)",
              }}
            >
             Your AI Fashion Stylist<br />
              <span className="gold-text">
                That Actually
              </span><br />
              Knows You
            </h1>

            {/* Description */}
            <p className="hero-animate-fade-in hero-delay-300 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              Upload your closet. Get a weather-checked outfit every morning — built from what you already own.
            </p>

            {/* CTA Buttons */}
            <ScrollReveal direction="up" delay={0.4} className="flex flex-col sm:flex-row gap-4">
              <motion.button
                onClick={() => navigate("/auth")}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-8 py-4 text-sm font-semibold text-background transition-colors hover:opacity-90"
              >
                <span>Try Free — No Card Needed</span>
                <motion.span
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.5, ease: [0.77, 0, 0.175, 1] }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </motion.button>

              <motion.button
                onClick={() =>
                  document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })
                }
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-border/30 bg-card/30 px-8 py-4 text-sm font-semibold text-foreground backdrop-blur-sm transition-colors hover:bg-card/50 hover:border-border/50"
              >
                See How It Works
                <CaretDown className="w-4 h-4" />
              </motion.button>
            </ScrollReveal>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-5 space-y-6 lg:mt-12">

            {/* Stats Card */}
            <DoubleBezelCard radius="xl" glow="gold" className="backdrop-blur-xl">
            <ScrollReveal direction="up" delay={0.5}>
              <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

              <div className="relative z-10">
              <div className="mb-8">
                  <div className="text-3xl font-bold tracking-tight text-foreground"><LiveCounter base={2400} range={140} intervalMs={2800} /></div>
                  <div className="text-sm text-muted-foreground">Active Members</div>
              </div>

                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Outfit Match Accuracy</span>
                    <span className="text-foreground font-medium"><NumberTicker value={96} suffix="%" /></span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted/30">
                    <div className="h-full w-[96%] rounded-full" style={{ background: "linear-gradient(90deg, hsl(var(--gold) / 0.6), hsl(var(--gold)))" }} />
                  </div>
                </div>

                <div className="h-px w-full bg-border/20 mb-6" />

                <div className="grid grid-cols-3 gap-4 text-center">
                  <StatItem value="12K+" label="Outfits Built" />
                  <StatItem value="24/7" label="AI Stylist" />
                  <StatItem value="4.9★" label="Rating" />
                </div>

                <div className="mt-8 flex flex-wrap gap-2">
                  <Pressable hapticStyle="selection">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-border/20 bg-card/30 px-3 py-1 text-[10px] font-medium tracking-wide text-muted-foreground cursor-pointer">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold/60 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
                    </span>
                    LIVE
                  </div>
                  </Pressable>
                  <Pressable hapticStyle="selection">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-border/20 bg-card/30 px-3 py-1 text-[10px] font-medium tracking-wide text-muted-foreground cursor-pointer">
                    <Crown className="w-3 h-3 text-gold" />
                    PREMIUM
                  </div>
                  </Pressable>
                </div>
              </div>
            </ScrollReveal>
            </DoubleBezelCard>

            {/* Testimonial Card */}
            <DoubleBezelCard radius="xl" glow="gold" className="backdrop-blur-xl">
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="p-6 touch-pan-y"
              onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
              onTouchEnd={(e) => {
                const diff = touchStartX.current - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 40) {
                  setTestimonialIdx((prev) => diff > 0 ? (prev + 1) % TESTIMONIALS.length : (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
                }
              }}
            >
              <div className="absolute -top-2 left-4 text-3xl text-primary/40 font-serif select-none">"</div>
              <div className="relative min-h-[110px]">
                {TESTIMONIALS.map((t, i) => (
                  <div
                    key={i}
                    className="transition-all duration-700 ease-in-out pl-4"
                    style={{
                      opacity: i === testimonialIdx ? 1 : 0,
                      position: i === testimonialIdx ? "relative" : "absolute",
                      top: i === testimonialIdx ? undefined : 0,
                      left: i === testimonialIdx ? undefined : 0,
                      right: i === testimonialIdx ? undefined : 0,
                    }}
                  >
                    <p className="text-sm text-muted-foreground leading-relaxed italic">
                      {t.quote}
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <div>
                        <div className="text-xs font-semibold text-foreground">{t.name}</div>
                        <div className="text-[10px] text-muted-foreground">{t.detail}</div>
                      </div>
                      <div className="ml-auto flex gap-0.5">
                        {[...Array(t.stars)].map((_, j) => (
                          <Star key={j} className="w-3 h-3 text-gold fill-gold" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Dot Indicators */}
              <div className="flex justify-center gap-2 mt-5">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTestimonialIdx(i)}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i === testimonialIdx
                        ? "w-6 bg-primary"
                        : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                    aria-label={`Show testimonial ${i + 1}`}
                  />
                ))}
              </div>
            </motion.div>
          </DoubleBezelCard>
        </div>
      </div>
    </div>
  </div>
  );
}
