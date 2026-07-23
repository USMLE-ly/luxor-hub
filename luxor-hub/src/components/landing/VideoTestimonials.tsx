import { motion } from "framer-motion";
import { CardCarousel } from "@/components/ui/card-carousel";

const VideoTestimonials = () => (
  <section className="relative py-24 md:py-32 overflow-hidden">
    {/* Premium layered dark background */}
    <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f0d] via-[#0d1a14] to-[#0a0f0d]" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(43,60%,12%,0.3)_0%,_transparent_70%)]" />
    <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNFNEM4N0EiIGZpbGwtb3BhY2l0eT0iMSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')]" />
    {/* Subtle gold accent line at top */}
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E8C87A]/20 to-transparent" />

    <div className="relative z-10 max-w-6xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <p className="font-sans text-xs font-semibold text-[#E8C87A]/70 tracking-[0.25em] uppercase mb-4">
          Tutorials
        </p>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-white">
          How To <span className="text-[#E8C87A]">Get Started</span>
        </h2>
        <p className="mt-4 max-w-lg mx-auto font-sans text-sm text-white/40">
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
