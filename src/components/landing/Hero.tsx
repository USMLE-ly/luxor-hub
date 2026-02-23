import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Spotlight } from "@/components/ui/spotlight";
import heroCharacter from "@/assets/hero-character.jpg";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="hsl(43, 74%, 49%)"
      />

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
              className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-8"
            >
              Your AI Stylist That{" "}
              <span className="gold-text">Knows You</span>{" "}
              Better
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-lg md:text-xl text-muted-foreground max-w-xl mb-12 font-sans"
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
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="gold-gradient text-primary-foreground font-semibold px-8 py-6 text-lg rounded-xl gold-glow hover:opacity-90 transition-opacity"
              >
                Start Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                className="px-8 py-6 text-lg rounded-xl border-glass-border hover:bg-card/60"
              >
                See How It Works
              </Button>
            </motion.div>
          </div>

          {/* Right content — Hero Character */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="flex-1 relative w-full h-[500px] lg:h-[700px] flex items-center justify-center"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 rounded-2xl" />
              <motion.img
                src={heroCharacter}
                alt="AI Fashion Stylist — elegant fairy-haired model"
                className="w-full h-full object-cover object-top rounded-2xl shadow-2xl"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
