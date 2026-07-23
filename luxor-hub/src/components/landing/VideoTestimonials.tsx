import { motion } from "framer-motion";
import { CardCarousel } from "@/components/ui/card-carousel";

const VideoTestimonials = () => (
  <section className="relative py-24 md:py-32 overflow-hidden">
    {/* Dark green background matching landing --background: 176 33% 17% */}
    <div className="absolute inset-0 bg-[hsl(176,33%,17%)]" />
    {/* Subtle gold radial glow from center */}
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(47,23%,48%,0.08)_0%,_transparent_70%)]" />
    {/* Gold accent line at top */}
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(47,23%,48%,0.25)] to-transparent" />

    <div className="relative z-10 max-w-6xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <p className="font-sans text-xs font-semibold tracking-[0.25em] uppercase mb-4"
           style={{ color: "hsl(47,23%,48%,0.7)" }}>
          Tutorials
        </p>
        <h2 className="font-display text-3xl md:text-5xl font-bold"
            style={{ color: "hsl(40,18%,88%)" }}>
          How To <span style={{ color: "hsl(47,23%,48%)" }}>Get Started</span>
        </h2>
        <p className="mt-4 max-w-lg mx-auto font-sans text-sm"
           style={{ color: "hsl(40,10%,65%)" }}>
          Watch our quick walkthrough to see how LUXOR works in practice.
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
