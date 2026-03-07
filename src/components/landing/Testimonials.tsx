import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Quote, Star, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

const testimonials = [
  {
    name: "Sophia Chen",
    role: "Creative Director",
    company: "Atelier Studio",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "AURELIA transformed how I approach my wardrobe. The AI suggestions are eerily accurate — it's like having a personal stylist who knows me better than I know myself.",
    results: ["300% faster styling", "Zero outfit repeats", "Perfect colour matches"],
  },
  {
    name: "Marcus Rivera",
    role: "Startup Founder",
    company: "NovaTech",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "I used to spend 30 minutes every morning deciding what to wear. Now it takes seconds. The outfit generator considers weather, my calendar, and my mood.",
    results: ["30 min saved daily", "Weather-aware looks", "Calendar-synced outfits"],
  },
  {
    name: "Aisha Patel",
    role: "Fashion Editor",
    company: "Vogue Digital",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "The closet scanner alone is worth it. I discovered pieces that paired beautifully together — combinations I never would have tried on my own.",
    results: ["Hidden pairings found", "Full closet utilised", "AI-powered combos"],
  },
  {
    name: "James Thornton",
    role: "Investment Banker",
    company: "Goldman & Co",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "As a busy professional, AURELIA saved me hours every week. The style DNA feature captured my aesthetic perfectly — I've never felt more confident.",
    results: ["Hours saved weekly", "Style DNA mapped", "Confidence boost"],
  },
  {
    name: "Elena Vasquez",
    role: "Interior Designer",
    company: "Maison Studio",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "The community feed is incredibly inspiring. Seeing how others style similar pieces gave me so many new ideas. It's like Pinterest meets a personal stylist.",
    results: ["Endless inspiration", "Community driven", "Style evolution"],
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
    scale: 0.8,
    rotateY: direction > 0 ? 45 : -45,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    rotateY: 0,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
    scale: 0.8,
    rotateY: direction < 0 ? 45 : -45,
  }),
};

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.23, 0.86, 0.39, 0.96] },
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

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextTestimonial = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[currentIndex];

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
            <span className="text-sm font-medium text-muted-foreground">✨ Voices of Style</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </motion.div>

          <motion.h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold mb-8 tracking-tight" variants={fadeInUp}>
            <span className="text-foreground">What Our</span>
            <br />
            <motion.span
              className="gold-text"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              style={{ backgroundSize: "200% 200%" }}
            >
              Members Say
            </motion.span>
          </motion.h2>

          <motion.p className="text-xl sm:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed" variants={fadeInUp}>
            Join thousands already transforming their personal style with AURELIA's AI-powered wardrobe intelligence.
          </motion.p>
        </motion.div>

        {/* Main Testimonial Display */}
        <div className="relative max-w-6xl mx-auto mb-16">
          <div className="relative h-[520px] sm:h-[460px] md:h-[400px]" style={{ perspective: "1000px" }}>
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
                  opacity: { duration: 0.4 },
                  scale: { duration: 0.4 },
                  rotateY: { duration: 0.6 },
                }}
                className="absolute inset-0"
              >
                <div className="relative h-full glass rounded-3xl border border-border p-8 md:p-12 overflow-hidden group">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-accent/[0.05] to-primary/[0.08] rounded-3xl"
                    animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    style={{ backgroundSize: "300% 300%" }}
                  />

                  <motion.div
                    className="absolute top-8 right-8 opacity-20"
                    animate={{ rotate: [0, 10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <Quote className="w-16 h-16 text-primary" />
                  </motion.div>

                  <div className="relative z-10 h-full flex flex-col md:flex-row items-center gap-8">
                    {/* User Info */}
                    <div className="flex-shrink-0 text-center md:text-left">
                      <motion.div className="relative mb-6" whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}>
                        <div className="w-24 h-24 mx-auto md:mx-0 rounded-full overflow-hidden border-4 border-primary/20 relative">
                          <img src={current.avatar} alt={current.name} className="w-full h-full object-cover" />
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20"
                            animate={{ opacity: [0, 0.3, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                          />
                        </div>
                        <motion.div
                          className="absolute inset-0 border-2 border-primary/30 rounded-full"
                          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </motion.div>

                      <h3 className="text-2xl font-display font-bold text-foreground mb-2">{current.name}</h3>
                      <p className="text-primary mb-1 font-medium">{current.role}</p>
                      <p className="text-muted-foreground mb-4">{current.company}</p>

                      <div className="flex justify-center md:justify-start gap-1 mb-6">
                        {[...Array(current.rating)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1, duration: 0.3 }}
                          >
                            <Star className="w-5 h-5 fill-primary text-primary" />
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <motion.blockquote
                        className="text-xl md:text-2xl text-foreground/90 leading-relaxed mb-8 font-light italic"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                      >
                        "{current.text}"
                      </motion.blockquote>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {current.results.map((result, i) => (
                          <motion.div
                            key={i}
                            className="bg-foreground/[0.05] rounded-lg p-3 border border-border backdrop-blur-sm"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                            whileHover={{ backgroundColor: "hsl(var(--primary) / 0.1)" }}
                          >
                            <span className="text-sm text-muted-foreground font-medium">{result}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-center items-center gap-6 mt-8">
            <motion.button
              onClick={prevTestimonial}
              className="p-3 rounded-full glass border border-border text-foreground hover:border-primary/40 transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Previous testimonial"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>

            <div className="flex gap-3">
              {testimonials.map((_, index) => (
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
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <motion.button
              onClick={nextTestimonial}
              className="p-3 rounded-full glass border border-border text-foreground hover:border-primary/40 transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Next testimonial"
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
