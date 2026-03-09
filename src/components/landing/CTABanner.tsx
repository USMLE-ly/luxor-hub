import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";

const CTABanner = () => (
  <section className="relative py-24 overflow-hidden">
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
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Sparkles className="w-10 h-10 text-primary mx-auto mb-6" />
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
          Ready to Transform Your <span className="gold-text">Style</span>?
        </h2>
        <p className="font-sans text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-8">
          Join thousands of fashion-forward individuals and businesses already using AURELIA to elevate their wardrobe and revenue.
        </p>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Button size="lg" className="gradient-button text-base px-8 group animate-[pulse_3s_ease-in-out_infinite]">
              Get Started Free
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Button size="lg" variant="outline" className="text-base px-8 border-primary/30 hover:border-primary/60 hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
              Book a Demo
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

export default CTABanner;
