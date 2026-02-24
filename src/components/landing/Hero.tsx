import { motion } from "framer-motion";
import { Sparkles, Zap, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Spotlight } from "@/components/ui/spotlight";
import { Boxes } from "@/components/ui/background-boxes";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import ParticleCanvas from "@/components/ui/particle-canvas";
import fashionHero from "@/assets/fashion-hero.jpg";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Boxes */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-background z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
        <Boxes />
      </div>

      {/* Spotlight effect */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="hsl(43, 74%, 49%)"
      />

      {/* Particle canvas background */}
      <div className="absolute inset-0 z-[1] pointer-events-auto">
        <ParticleCanvas
          particleColor={{ h: 43, s: 74, l: 49 }}
          maxParticles={60}
          connectionDistance={110}
        />
      </div>

      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold-dark/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center min-h-[80vh]">
          {/* Left content */}
          <div className="flex-1 text-center lg:text-left py-12 lg:py-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-primary font-medium font-sans">
                <Sparkles className="w-4 h-4" />
                AI-Powered Personal Styling
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-8"
            >
              Your AI Stylist That{" "}
              <span className="gold-text">Knows You</span>{" "}
              Better
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-base md:text-xl text-muted-foreground max-w-xl mb-12 font-sans mx-auto lg:mx-0"
            >
              Upload your wardrobe. Get daily AI-curated outfits. Shop smarter. 
              Look unstoppable — every single day.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4"
            >
              <RainbowButton
                onClick={() => navigate("/auth")}
                className="px-8 py-3 text-lg font-display font-semibold"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Free
              </RainbowButton>
              <InteractiveHoverButton
                text="How It Works"
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                className="w-40 border-border"
              />
            </motion.div>

            {/* Social proof badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-10"
            >
              <motion.span
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs font-sans font-medium text-muted-foreground"
              >
                <Users className="w-3 h-3 text-primary" /> 10K+ Users
              </motion.span>
              <motion.span
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs font-sans font-medium text-muted-foreground"
              >
                <Zap className="w-3 h-3 text-primary" /> AI-Powered
              </motion.span>
              <motion.span
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs font-sans font-medium text-muted-foreground"
              >
                <Sparkles className="w-3 h-3 text-primary" /> 98% Satisfaction
              </motion.span>
            </motion.div>
          </div>

          {/* Right content — Fashion Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="hidden lg:flex flex-1 items-center justify-center relative"
          >
            <div className="relative w-full max-w-lg">
              {/* Glow behind image */}
              <div className="absolute -inset-4 bg-primary/20 rounded-3xl blur-3xl" />
              <img
                src={fashionHero}
                alt="AI Fashion Stylist — elegant woman in luxury outfit with flowing golden hair"
                className="relative w-full h-auto rounded-2xl object-cover shadow-2xl"
                loading="eager"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-background/60 via-transparent to-transparent" />
            </div>
          </motion.div>

          {/* Mobile fallback */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="lg:hidden w-full max-w-sm mx-auto mt-8 relative"
          >
            <div className="absolute -inset-2 bg-primary/15 rounded-2xl blur-2xl" />
            <img
              src={fashionHero}
              alt="AI Fashion Stylist"
              className="relative w-full h-auto rounded-2xl object-cover shadow-xl"
              loading="eager"
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-background/70 via-transparent to-transparent" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
