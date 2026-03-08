import { motion, AnimatePresence, useInView } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import proof1 from "@/assets/proof-1.jpg";
import proof2 from "@/assets/proof-2.jpeg";
import proof3 from "@/assets/proof-3.jpg";
import proof4 from "@/assets/proof-4.png";
import proof5 from "@/assets/proof-5.jpg";
import proof6 from "@/assets/proof-6.png";

const proofImages = [
  { src: proof1, alt: "Revenue proof - $673K total sales", label: "$673,912", caption: "Total Sales — 90 Days", name: "Alex M.", role: "Fashion Entrepreneur" },
  { src: proof2, alt: "Revenue proof - $81K total sales", label: "$81,452", caption: "Revenue — 5 Months", name: "Sarah K.", role: "Style Consultant" },
  { src: proof3, alt: "Stripe payout - €48,579", label: "€48,579", caption: "Stripe Payout", name: "Marco R.", role: "E-Commerce Owner" },
  { src: proof4, alt: "Revenue proof - $105K total sales", label: "$105,525", caption: "Total Sales — 90 Days", name: "Priya D.", role: "Brand Stylist" },
  { src: proof5, alt: "Revenue proof - €390K gross sales", label: "€390,033", caption: "Gross Sales — 30 Days", name: "Elena V.", role: "Fashion Director" },
  { src: proof6, alt: "Revenue proof - $10K total sales", label: "$10,349", caption: "Total Sales — 90 Days", name: "Jordan T.", role: "Personal Stylist" },
];

const totalRevenue = 1309850;

function useCountUp(target: number, duration = 2500, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      setValue(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return value;
}

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0, scale: 0.92 }),
  center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
  exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 300 : -300, opacity: 0, scale: 0.92 }),
};

const Testimonials = React.forwardRef<HTMLElement>((_, ref) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const counterRef = useRef<HTMLDivElement>(null);
  const counterInView = useInView(counterRef, { once: true });
  const count = useCountUp(totalRevenue, 2500, counterInView);

  const nextSlide = () => { setDirection(1); setCurrentIndex((p) => (p + 1) % proofImages.length); };
  const prevSlide = () => { setDirection(-1); setCurrentIndex((p) => (p - 1 + proofImages.length) % proofImages.length); };

  useEffect(() => {
    const timer = setInterval(() => { setDirection(1); setCurrentIndex((p) => (p + 1) % proofImages.length); }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Adjacent card indices for stacked effect
  const prevIdx = (currentIndex - 1 + proofImages.length) % proofImages.length;
  const nextIdx = (currentIndex + 1) % proofImages.length;

  return (
    <section id="testimonials" className="relative py-28 bg-background text-foreground overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/[0.06] rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <motion.div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary/[0.08] border border-primary/20 backdrop-blur-md mb-8">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold tracking-wide text-primary">Proven Results</span>
          </motion.div>

          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold mb-6 tracking-tight">
            <span className="text-foreground">Our </span>
            <span className="gold-text">Success Stories</span>
          </h2>

          {/* Running total counter */}
          <div ref={counterRef} className="mt-6">
            <p className="text-sm font-sans text-muted-foreground uppercase tracking-widest mb-1">Total Verified Revenue</p>
            <p className="font-display text-3xl md:text-4xl font-bold gold-text">
              ${count.toLocaleString()}+
            </p>
          </div>
        </motion.div>

        {/* Stacked Card Slider */}
        <div className="relative max-w-5xl mx-auto">
          <div className="relative h-[480px] sm:h-[560px] md:h-[620px]">
            {/* Background stacked cards */}
            <div className="absolute inset-x-8 inset-y-4 rounded-[2rem] bg-card/30 border border-border/30 backdrop-blur-sm transform rotate-[-2deg] scale-[0.94]" />
            <div className="absolute inset-x-4 inset-y-2 rounded-[2rem] bg-card/40 border border-border/40 backdrop-blur-sm transform rotate-[1deg] scale-[0.97]" />

            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ x: { type: "spring", stiffness: 280, damping: 28 }, opacity: { duration: 0.35 }, scale: { duration: 0.35 } }}
                className="absolute inset-0"
              >
                <div className="relative h-full rounded-[2rem] overflow-hidden group">
                  <div className="absolute -inset-[1px] rounded-[2rem] bg-gradient-to-br from-primary/40 via-primary/10 to-accent/30" />
                  
                  <div className="relative h-full m-[1px] rounded-[calc(2rem-1px)] overflow-hidden bg-card/80 backdrop-blur-xl">
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

                    <img src={proofImages[currentIndex].src} alt={proofImages[currentIndex].alt} className="w-full h-full object-contain pt-14 pb-24 px-4" />

                    {/* Bottom bar with avatar + caption */}
                    <div className="absolute bottom-0 left-0 right-0 z-20 px-6 py-5 bg-gradient-to-t from-background/95 via-background/80 to-transparent">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-sans font-bold text-xs">
                          {proofImages[currentIndex].name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-sans font-semibold text-foreground">{proofImages[currentIndex].name}</p>
                          <p className="text-xs font-sans text-muted-foreground">{proofImages[currentIndex].role} · {proofImages[currentIndex].caption}</p>
                        </div>
                      </div>
                    </div>

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

          {/* Navigation */}
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
                  onClick={() => { setDirection(index > currentIndex ? 1 : -1); setCurrentIndex(index); }}
                  className="relative"
                  whileHover={{ scale: 1.3 }}
                  aria-label={`Go to image ${index + 1}`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                    index === currentIndex 
                      ? "bg-primary scale-125 shadow-[0_0_12px_hsl(var(--primary)/0.6)]" 
                      : "bg-muted-foreground/20 hover:bg-muted-foreground/40"
                  }`} />
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

          {/* Keyboard hint */}
          <p className="text-center text-xs text-muted-foreground/50 font-sans mt-4 hidden md:block">
            Use ← → arrows to navigate
          </p>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
