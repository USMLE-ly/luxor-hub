import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";

const CTABanner = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <AnimatedGradientBackground
        Breathing={true}
        animationSpeed={0.02}
        breathingRange={10}
        startingGap={120}
        topOffset={30}
        gradientColors={[
          "hsl(240 10% 4%)",
          "hsl(43 80% 18%)",
          "hsl(35 70% 25%)",
          "hsl(43 80% 18%)",
          "hsl(240 10% 4%)",
        ]}
        gradientStops={[0, 30, 50, 70, 100]}
        containerClassName="rounded-none"
      />

      <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Ready to <span className="gold-text">Look Incredible</span>?
          </h2>
          <p className="font-sans text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-3">
            Your spot is waiting.
          </p>
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.div
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px hsl(43 74% 49% / 0.4)" }}
              whileTap={{ scale: 0.97 }}
              className="rounded-xl"
            >
              <Button
                size="lg"
                className="gradient-button text-base px-8 group will-change-transform"
                onClick={() => navigate("/auth")}
              >
                Join LEXOR® Now
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>
          <p className="mt-4 font-sans text-xs text-muted-foreground">
            Start free — upgrade anytime.
          </p>
          <p className="mt-2 font-sans text-xs text-muted-foreground">
            30-day money-back guarantee. Zero risk.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTABanner;
