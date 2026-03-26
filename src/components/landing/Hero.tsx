import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroMockup from "@/assets/hero-app-mockup.jpg";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex items-center bg-background overflow-hidden pt-28 pb-16 md:pt-32 md:pb-24">
      <div className="max-w-6xl mx-auto px-4 w-full">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left — Copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-6"
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
              Your AI Stylist That Actually Knows{" "}
              <span className="gold-text">Your Body</span>
            </h1>

            <p className="font-sans text-base md:text-lg text-muted-foreground max-w-md leading-relaxed">
              Upload your closet. Get the perfect outfit every morning — weather-checked, calendar-aware, built from what you own.
            </p>

            <p className="font-sans text-sm text-muted-foreground/70">
              Trusted by 2,400+ members
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
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

          {/* Right — Product Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="relative flex justify-center md:justify-end"
          >
            <img
              src={heroMockup}
              alt="LEXOR AI stylist app showing today's outfit recommendation with weather"
              width={800}
              height={1024}
              className="w-full max-w-sm md:max-w-md rounded-2xl"
              fetchPriority="high"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
