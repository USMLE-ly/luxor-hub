import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold-dark/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
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
          className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight mb-8"
        >
          Your AI Stylist That{" "}
          <span className="gold-text">Knows You</span>{" "}
          Better Than You Know Yourself
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 font-sans"
        >
          Upload your wardrobe. Get daily AI-curated outfits. Shop smarter. 
          Look unstoppable — every single day.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
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

        {/* Hero image */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="mt-20 relative"
        >
          <div className="rounded-2xl overflow-hidden gold-glow max-w-4xl mx-auto">
            <img
              src={heroImage}
              alt="AURELIA AI Fashion Platform — futuristic wardrobe display with elegant clothing"
              className="w-full h-auto object-cover rounded-2xl"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent rounded-2xl" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
