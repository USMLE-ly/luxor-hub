import { motion } from "framer-motion";
import { Sparkles, Zap, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight";
import { Boxes } from "@/components/ui/background-boxes";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

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

          {/* Right content — 3D Spline Scene (hidden on mobile) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="hidden lg:block flex-1 relative w-full h-[700px]"
          >
            <SplineScene
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
            />
          </motion.div>

          {/* Mobile fallback — gradient visual */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="lg:hidden w-full h-[300px] relative mt-8 rounded-2xl overflow-hidden"
          >
            <div className="absolute inset-0 gold-gradient opacity-20 rounded-2xl" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Sparkles className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse-gold" />
                <p className="font-display text-2xl font-bold gold-text">AI Stylist Ready</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
