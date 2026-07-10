import { motion } from "framer-motion";
import { CardCarousel } from "@/components/ui/card-carousel";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";

const VideoTestimonials = () => (
  <section className="relative py-24 overflow-hidden">
    <AnimatedGradientBackground
      Breathing={true}
      animationSpeed={0.01}
      breathingRange={6}
      startingGap={140}
      topOffset={15}
      gradientColors={[
        "hsl(240 10% 5%)",
        "hsl(280 30% 12%)",
        "hsl(43 50% 14%)",
        "hsl(280 30% 12%)",
        "hsl(240 10% 5%)",
      ]}
      gradientStops={[0, 25, 50, 75, 100]}
      containerClassName="rounded-none"
    />

    <div className="relative z-10 max-w-6xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <p className="font-sans text-sm font-semibold text-primary tracking-widest uppercase mb-3">
          Tutorials
        </p>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
          How To <span className="gold-text">Get Started</span>
        </h2>
        <p className="mt-4 max-w-lg mx-auto font-sans text-sm text-muted-foreground">
          Watch our quick walkthrough to see how LEXOR® works in practice.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <CardCarousel />
      </motion.div>
    </div>
  </section>
);

export default VideoTestimonials;
