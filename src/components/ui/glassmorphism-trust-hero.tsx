import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useScroll, useTransform, motion } from "framer-motion";
import {
  ArrowRight,
  Play,
  Target,
  Crown,
  Star,
  Hexagon,
  Triangle,
  Command,
  Ghost,
  Gem,
  Cpu,
  ChevronDown,
} from "lucide-react";
import heroVideo from "@/assets/hero-video.mp4";

const CLIENTS = [
  { name: "VOGUE", icon: Hexagon },
  { name: "GLAMOUR", icon: Triangle },
  { name: "BAZAAR", icon: Command },
  { name: "ELLE", icon: Ghost },
  { name: "GQ", icon: Gem },
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
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTestimonialIdx((i) => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div ref={heroRef} className="relative w-full bg-background text-foreground overflow-hidden font-sans">
      <style>{`
        @keyframes heroFadeSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroKenBurns {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        @keyframes heroMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .hero-animate-fade-in {
          animation: heroFadeSlideIn 0.8s ease-out forwards;
          opacity: 0;
        }
        .hero-animate-marquee {
          animation: heroMarquee 60s linear infinite;
        }
        .hero-delay-100 { animation-delay: 0.1s; }
        .hero-delay-200 { animation-delay: 0.2s; }
        .hero-delay-300 { animation-delay: 0.3s; }
        .hero-delay-400 { animation-delay: 0.4s; }
        .hero-delay-500 { animation-delay: 0.5s; }
      `}</style>

      {/* Background video with parallax */}
      <motion.div className="absolute inset-0 z-0" style={{ y: videoY }}>
        <video
          src={heroVideo}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-[120%] object-cover"
          style={{ animation: "heroKenBurns 20s ease-in-out infinite" }}
        />
        <div className="absolute inset-0 bg-background/40" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: "radial-gradient(ellipse at 30% 20%, hsl(var(--primary) / 0.2), transparent 60%), radial-gradient(ellipse at 70% 80%, hsl(var(--accent) / 0.15), transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: "inset 0 0 120px 60px hsl(var(--background))" }}
        />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6 md:pt-32 md:pb-20 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-start">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-8 pt-8">

            {/* Badge */}
            <div className="hero-animate-fade-in hero-delay-100">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/30 bg-card/50 px-3 py-1.5 backdrop-blur-md transition-colors hover:bg-card/80">
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  AI-Powered Styling
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
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
            <div className="hero-animate-fade-in hero-delay-400 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate("/auth")}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-8 py-4 text-sm font-semibold text-background transition-all hover:scale-[1.02] hover:opacity-90 active:scale-[0.98]"
              >
                Try Free — No Card Needed
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() =>
                  document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })
                }
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-border/30 bg-card/30 px-8 py-4 text-sm font-semibold text-foreground backdrop-blur-sm transition-colors hover:bg-card/50 hover:border-border/50"
              >
                See How It Works
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-5 space-y-6 lg:mt-12">

            {/* Stats Card */}
            <div className="hero-animate-fade-in hero-delay-500 relative overflow-hidden rounded-3xl border border-border/20 bg-card/30 p-8 backdrop-blur-xl shadow-2xl">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

              <div className="relative z-10">
              <div className="mb-8">
                  <div className="text-3xl font-bold tracking-tight text-foreground">2,400+</div>
                  <div className="text-sm text-muted-foreground">Active Members</div>
              </div>

                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Outfit Match Accuracy</span>
                    <span className="text-foreground font-medium">96%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted/30">
                    <div className="h-full w-[96%] rounded-full gold-gradient" />
                  </div>
                </div>

                <div className="h-px w-full bg-border/20 mb-6" />

                <div className="grid grid-cols-3 gap-4 text-center">
                  <StatItem value="12K+" label="Outfits Built" />
                  <StatItem value="24/7" label="AI Stylist" />
                  <StatItem value="4.9★" label="Rating" />
                </div>

                <div className="mt-8 flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-border/20 bg-card/30 px-3 py-1 text-[10px] font-medium tracking-wide text-muted-foreground">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    LIVE
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-border/20 bg-card/30 px-3 py-1 text-[10px] font-medium tracking-wide text-muted-foreground">
                    <Crown className="w-3 h-3 text-yellow-500" />
                    PREMIUM
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial Card */}
            <div
              className="hero-animate-fade-in hero-delay-500 relative overflow-hidden rounded-3xl border border-border/20 bg-card/30 p-6 backdrop-blur-xl touch-pan-y"
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
                          <Star key={j} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
