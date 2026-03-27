import React, { useRef } from "react";
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

const StatItem = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-center justify-center transition-transform hover:-translate-y-1 cursor-default">
    <span className="text-xl font-bold text-foreground sm:text-2xl">{value}</span>
    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium sm:text-xs">{label}</span>
  </div>
);

export default function GlassmorphismTrustHero() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

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
              Your AI Stylist<br />
              <span className="gold-text">
                That Actually
              </span><br />
              Knows You
            </h1>

            {/* Description */}
            <p className="hero-animate-fade-in hero-delay-300 max-w-xl text-lg text-muted-foreground leading-relaxed">
              Upload your closet. Get the perfect outfit every morning — weather-checked, calendar-aware, built from what you own.
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
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                    <Target className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold tracking-tight text-foreground">2,400+</div>
                    <div className="text-sm text-muted-foreground">Active Members</div>
                  </div>
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

            {/* Marquee Card */}
            <div className="hero-animate-fade-in hero-delay-500 relative overflow-hidden rounded-3xl border border-border/20 bg-card/30 py-8 backdrop-blur-xl">
              <h3 className="mb-6 px-8 text-sm font-medium text-muted-foreground">As Featured In</h3>

              <div
                className="relative flex overflow-hidden"
                style={{
                  maskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
                  WebkitMaskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
                }}
              >
                <div className="hero-animate-marquee flex gap-12 whitespace-nowrap px-4">
                  {[...CLIENTS, ...CLIENTS, ...CLIENTS].map((client, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 opacity-50 transition-all hover:opacity-100 hover:scale-105 cursor-default grayscale hover:grayscale-0"
                    >
                      <client.icon className="h-5 w-5 text-foreground" />
                      <span className="text-sm font-bold text-foreground tracking-[0.15em] font-display">
                        {client.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
