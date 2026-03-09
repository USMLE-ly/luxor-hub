import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import CursorSpotlight from "@/components/ui/cursor-spotlight";
import SparkleParticles from "@/components/ui/sparkle-particles";

const Hero = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden"
    >
      {/* Parallax background image */}
      <motion.div className="absolute inset-0" style={{ y: bgY, scale: bgScale }}>
        <img
          src={heroImage}
          alt=""
          className="w-full h-full object-cover"
          loading="eager"
        />
      </motion.div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/40 to-transparent" />

      {/* Cursor spotlight */}
      <CursorSpotlight />

      {/* Sparkle particles */}
      <SparkleParticles count={30} />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center pt-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-sans text-muted-foreground mb-8"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          AI-Powered Personal Styling
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight mb-6"
        >
          Your Style,{" "}
          <span className="gold-shimmer-text">Perfected</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="font-sans text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-balance"
        >
          AURELIA analyzes your wardrobe, understands your body, and generates 
          outfits that make you look and feel extraordinary — every single day.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => navigate("/auth")}
            className="gradient-button h-12 px-8 rounded-xl font-sans font-semibold text-sm tracking-wide flex items-center gap-2 gold-glow"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start Free Trial</span>
          </button>
          <button
            onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            className="gradient-button gradient-button-variant h-12 px-8 rounded-xl font-sans font-semibold text-sm tracking-wide flex items-center gap-2"
          >
            <span>See How It Works</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-14 flex items-center justify-center gap-3"
        >
          <div className="flex -space-x-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-background bg-muted"
                style={{
                  backgroundImage: `url(https://i.pravatar.cc/64?img=${i + 10})`,
                  backgroundSize: "cover",
                }}
              />
            ))}
          </div>
          <p className="text-sm font-sans text-muted-foreground">
            <span className="font-semibold text-foreground">12,000+</span> stylists trust AURELIA
          </p>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
