import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import heroVideo from "@/assets/hero-video.mp4";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex flex-col bg-background overflow-hidden pt-28 pb-12 md:pt-32 md:pb-20">
      <AnimatedGradientBackground
        Breathing
        startingGap={120}
        animationSpeed={0.03}
        breathingRange={4}
        topOffset={-20}
        gradientColors={["hsl(var(--background))", "#1a1a2e", "#16213e", "#0f3460", "#1a1a2e", "#0d0d0d", "hsl(var(--background))"]}
        gradientStops={[20, 40, 55, 65, 75, 88, 100]}
      />
      <div className="max-w-6xl mx-auto px-4 w-full flex-1 flex flex-col justify-center relative z-10">
        {/* Copy — centered */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center space-y-5 max-w-2xl mx-auto mb-8 md:mb-10"
        >
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
            Your AI Stylist That Actually Knows{" "}
            <span className="gold-text">Your Body</span>
          </h1>

          <p className="font-sans text-base md:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            Upload your closet. Get the perfect outfit every morning — weather-checked, calendar-aware, built from what you own.
          </p>

          <p className="font-sans text-sm text-muted-foreground/70">
            Trusted by 2,400+ members
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-1">
            <Button
              size="lg"
              className="text-base px-8 group"
              onClick={() => navigate("/auth")}
            >
              Try Free — No Card Needed
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="text-base text-muted-foreground"
              onClick={() =>
                document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              See How It Works
              <ChevronDown className="ml-1 w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Video */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="relative w-full max-w-3xl mx-auto rounded-2xl overflow-hidden border border-border shadow-2xl"
        >
          <video
            src={heroVideo}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-auto"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
