import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import proof1 from "@/assets/proof-1.jpg";
import proof2 from "@/assets/proof-2.jpeg";
import proof3 from "@/assets/proof-3.jpg";
import proof4 from "@/assets/proof-4.png";
import proof5 from "@/assets/proof-5.jpg";
import proof6 from "@/assets/proof-6.png";

const proofImages = [
  { src: proof1, alt: "Revenue proof - $673K total sales" },
  { src: proof2, alt: "Revenue proof - $81K total sales" },
  { src: proof3, alt: "Stripe payout - €48,579" },
  { src: proof4, alt: "Revenue proof - $105K total sales" },
  { src: proof5, alt: "Revenue proof - €390K gross sales" },
  { src: proof6, alt: "Revenue proof - $10K total sales" },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 600 : -600,
    opacity: 0,
    scale: 0.85,
  }),
  center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 600 : -600,
    opacity: 0,
    scale: 0.85,
  }),
};

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.23, 0.86, 0.39, 0.96] as [number, number, number, number] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const stats = [
  { number: "50K+", label: "Style-Confident Members" },
  { number: "98%", label: "Satisfaction Rate" },
  { number: "2M+", label: "Outfits Generated" },
  { number: "30min", label: "Saved Daily" },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % proofImages.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + proofImages.length) % proofImages.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % proofImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="testimonials"
      className="relative py-32 bg-gradient-to-br from-background via-accent/20 to-background text-foreground overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-accent/[0.05] to-primary/[0.08]"
          animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: "400% 400%" }}
        />
        <motion.div
          className="absolute top-1/3 left-[20%] w-72 h-72 bg-primary/15 rounded-full blur-3xl"
          animate={{ x: [0, 150, 0], y: [0, 80, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/3 right-[20%] w-80 h-80 bg-accent/15 rounded-full blur-3xl"
          animate={{ x: [0, -100, 0], y: [0, -60, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-foreground/30 rounded-full"
            style={{ left: `${15 + i * 7}%`, top: `${25 + i * 5}%` }}
            animate={{ y: [0, -50, 0], opacity: [0.2, 1, 0.2], scale: [1, 2, 1] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
          />
        ))}
      </div>

      <motion.div
        ref={containerRef}
        className="relative z-10 max-w-7xl mx-auto px-6"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Header */}
        <motion.div className="text-center mb-20" variants={fadeInUp}>
          <motion.div
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-foreground/[0.08] border border-border backdrop-blur-sm mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
              <Sparkles className="h-4 w-4 text-primary" />
            </motion.div>
            <span className="text-sm font-medium text-muted-foreground">✨ Proven Results</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </motion.div>

          <motion.h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold mb-8 tracking-tight" variants={fadeInUp}>
            <span className="text-foreground">Real</span>
            <br />
            <motion.span
              className="gold-text"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              style={{ backgroundSize: "200% 200%" }}
            >
              Success Stories
            </motion.span>
          </motion.h2>

          <motion.p className="text-xl sm:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed" variants={fadeInUp}>
            Join thousands already transforming their personal style with AURELIA's AI-powered wardrobe intelligence.
          </motion.p>
        </motion.div>

        {/* Proof Image Slider */}
        <div className="relative max-w-4xl mx-auto mb-16">
          <div className="relative h-[400px] sm:h-[500px] md:h-[550px]">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.3 },
                  scale: { duration: 0.3 },
                }}
                className="absolute inset-0"
              >
                <div className="relative h-full rounded-3xl overflow-hidden border border-border shadow-2xl">
                  <img
                    src={proofImages[currentIndex].src}
                    alt={proofImages[currentIndex].alt}
                    className="w-full h-full object-contain bg-card"
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-center items-center gap-6 mt-8">
            <motion.button
              onClick={prevSlide}
              className="p-3 rounded-full glass border border-border text-foreground hover:border-primary/40 transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Previous"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>

            <div className="flex gap-3">
              {proofImages.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1);
                    setCurrentIndex(index);
                  }}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentIndex ? "bg-primary scale-125" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>

            <motion.button
              onClick={nextSlide}
              className="p-3 rounded-full glass border border-border text-foreground hover:border-primary/40 transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Next"
            >
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Stats Section */}
        <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-8" variants={staggerContainer}>
          {stats.map((stat, index) => (
            <motion.div key={index} className="text-center group" variants={fadeInUp} whileHover={{ scale: 1.05 }}>
              <motion.div
                className="text-3xl md:text-4xl font-bold gold-text mb-2"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
              >
                {stat.number}
              </motion.div>
              <div className="text-muted-foreground text-sm font-medium group-hover:text-foreground/80 transition-colors">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Testimonials;
