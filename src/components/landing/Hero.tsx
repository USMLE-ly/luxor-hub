import { motion } from "framer-motion";
import { Sparkles, Zap, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import MagneticButton from "@/components/ui/magnetic-button";
import { useEffect, useState } from "react";

/* ── Typewriter hook ──────────────────────────────────────────── */
function useTypewriter(text: string, speed = 60, startDelay = 800) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) clearInterval(interval);
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [text, speed, startDelay]);
  return displayed;
}

const Hero = () => {
  const navigate = useNavigate();
  const tagline = useTypewriter(
    "Upload your wardrobe. Get daily AI-curated outfits. Shop smarter. Look unstoppable — every single day.",
    35,
    600,
  );

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Subtle glow behind hero content */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
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
            className="text-base md:text-xl text-muted-foreground max-w-xl mb-12 font-sans mx-auto min-h-[3.5rem]"
          >
            {tagline}
            <span className="inline-block w-[2px] h-[1.1em] bg-primary/70 ml-0.5 align-text-bottom animate-pulse" />
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <MagneticButton onClick={() => navigate("/auth")} strength={0.25}>
              <RainbowButton className="px-8 py-3 text-lg font-display font-semibold pointer-events-none">
                <Sparkles className="w-5 h-5 mr-2" />
                Start Free
              </RainbowButton>
            </MagneticButton>
            <MagneticButton
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              strength={0.2}
            >
              <InteractiveHoverButton
                text="How It Works"
                className="w-40 border-border pointer-events-none"
              />
            </MagneticButton>
          </motion.div>

          {/* Social proof badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-3 mt-10"
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
      </div>
    </section>
  );
};

export default Hero;
