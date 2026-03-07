import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import proof1 from "@/assets/proof-1.jpg";
import proof2 from "@/assets/proof-2.jpeg";
import proof3 from "@/assets/proof-3.jpg";
import proof4 from "@/assets/proof-4.png";
import proof5 from "@/assets/proof-5.jpg";
import proof6 from "@/assets/proof-6.png";

const proofImages = [
  { src: proof1, alt: "Revenue proof - $673K total sales", label: "$673,912", caption: "Total Sales — 90 Days" },
  { src: proof2, alt: "Revenue proof - $81K total sales", label: "$81,452", caption: "Revenue — 5 Months" },
  { src: proof3, alt: "Stripe payout - €48,579", label: "€48,579", caption: "Stripe Payout" },
  { src: proof4, alt: "Revenue proof - $105K total sales", label: "$105,525", caption: "Total Sales — 90 Days" },
  { src: proof5, alt: "Revenue proof - €390K gross sales", label: "€390,033", caption: "Gross Sales — 30 Days" },
  { src: proof6, alt: "Revenue proof - $10K total sales", label: "$10,349", caption: "Total Sales — 90 Days" },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 400 : -400,
    opacity: 0,
    scale: 0.9,
    rotateY: direction > 0 ? 8 : -8,
  }),
  center: { zIndex: 1, x: 0, opacity: 1, scale: 1, rotateY: 0 },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 400 : -400,
    opacity: 0,
    scale: 0.9,
    rotateY: direction < 0 ? 8 : -8,
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
      className="relative py-32 bg-background text-foreground overflow-hidden"
    >
      {/* Premium Background */}
      <div className="absolute inset-0">
        {/* Subtle radial glow behind the card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/[0.06] rounded-full blur-[120px]" />
        <motion.div
          className="absolute top-[20%] left-[10%] w-64 h-64 bg-primary/10 rounded-full blur-[100px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[20%] right-[10%] w-72 h-72 bg-accent/10 rounded-full blur-[100px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Fine grain texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
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
        <motion.div className="text-center mb-16" variants={fadeInUp}>
          <motion.div
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary/[0.08] border border-primary/20 backdrop-blur-md mb-8"
            whileHover={{ scale: 1.05, borderColor: "hsl(var(--primary) / 0.4)" }}
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
              <Sparkles className="h-4 w-4 text-primary" />
            </motion.div>
            <span className="text-sm font-semibold tracking-wide text-primary">Proven Results</span>
          </motion.div>

          <motion.h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold mb-6 tracking-tight" variants={fadeInUp}>
            <span className="text-foreground">Real Revenue.</span>
            <br />
            <motion.span
              className="gold-text"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              style={{ backgroundSize: "200% 200%" }}
            >
              Real Results.
            </motion.span>
          </motion.h2>

          <motion.p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed" variants={fadeInUp}>
            Our clients don't just look good — they build empires. Here's the proof.
          </motion.p>
        </motion.div>

        {/* Premium Proof Card Slider */}
        <div className="relative max-w-5xl mx-auto">
          <div className="relative h-[480px] sm:h-[560px] md:h-[620px]" style={{ perspective: "1200px" }}>
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 280, damping: 28 },
                  opacity: { duration: 0.4 },
                  scale: { duration: 0.4 },
                  rotateY: { duration: 0.5 },
                }}
                className="absolute inset-0"
              >
                {/* Premium glass card wrapper */}
                <div className="relative h-full rounded-[2rem] overflow-hidden group">
                  {/* Outer glow border */}
                  <div className="absolute -inset-[1px] rounded-[2rem] bg-gradient-to-br from-primary/40 via-primary/10 to-accent/30" />
                  
                  {/* Inner card */}
                  <div className="relative h-full m-[1px] rounded-[calc(2rem-1px)] overflow-hidden bg-card/80 backdrop-blur-xl">
                    {/* Top bar with label */}
                    <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-background/90 to-transparent">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Live Revenue</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                        <TrendingUp className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-bold text-primary">{proofImages[currentIndex].label}</span>
                      </div>
                    </div>

                    {/* Screenshot image */}
                    <img
                      src={proofImages[currentIndex].src}
                      alt={proofImages[currentIndex].alt}
                      className="w-full h-full object-contain pt-14 pb-16 px-4"
                    />

                    {/* Bottom caption bar */}
                    <div className="absolute bottom-0 left-0 right-0 z-20 px-6 py-4 bg-gradient-to-t from-background/90 to-transparent">
                      <p className="text-center text-sm font-medium text-muted-foreground tracking-wide">
                        {proofImages[currentIndex].caption}
                      </p>
                    </div>

                    {/* Shimmer effect on hover */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/[0.04] to-transparent -translate-x-full"
                      animate={{ translateX: ["-100%", "200%"] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Premium Navigation Controls */}
          <div className="flex justify-center items-center gap-8 mt-10">
            <motion.button
              onClick={prevSlide}
              className="p-4 rounded-2xl bg-card/60 backdrop-blur-md border border-border text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Previous"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>

            <div className="flex gap-2.5 items-center">
              {proofImages.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1);
                    setCurrentIndex(index);
                  }}
                  className="relative"
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={`Go to image ${index + 1}`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                    index === currentIndex 
                      ? "bg-primary scale-125 shadow-[0_0_12px_hsl(var(--primary)/0.6)]" 
                      : "bg-muted-foreground/20 hover:bg-muted-foreground/40"
                  }`} />
                  {index === currentIndex && (
                    <motion.div
                      className="absolute inset-0 rounded-full border border-primary/40"
                      initial={{ scale: 1, opacity: 1 }}
                      animate={{ scale: 2.5, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </motion.button>
              ))}
            </div>

            <motion.button
              onClick={nextSlide}
              className="p-4 rounded-2xl bg-card/60 backdrop-blur-md border border-border text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Next"
            >
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Testimonials;
