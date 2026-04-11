import { useRef, useState, useEffect } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { IPhoneMockup } from "@/components/ui/iphone-mockup";
import featureDemo from "@/assets/feature-demo.mp4";
import { useIsMobile } from "@/hooks/use-mobile";

const shimmerParticles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: 15 + Math.random() * 70,
  y: 20 + Math.random() * 60,
  size: 1.5 + Math.random() * 2.5,
  delay: Math.random() * 4,
  duration: 3 + Math.random() * 3,
}));

const featureNames = [
  "AI Outfit Analysis",
  "Virtual Try-On",
  "Trend Forecasting",
  "Wardrobe Management",
  "Style DNA Mapping",
  "Color Analysis",
];

const Features = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const isMobile = useIsMobile();
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % featureNames.length);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const mockupY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const glowOpacity = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0.2, 0.6, 0.3]);

  return (
    <section id="features" className="pt-16 md:pt-24 pb-4 md:pb-8 bg-muted/20 overflow-hidden" ref={sectionRef}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-6"
        >
          <p className="font-sans text-sm font-semibold text-primary tracking-widest uppercase mb-3">Features</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            Every Fashion Tool You Need.{" "}
            <span className="gold-text">One App.</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-sm text-muted-foreground leading-relaxed">
            AI outfit analysis, trend forecasting, wardrobe management, and virtual try-on — all in one app.
          </p>

          {/* Rotating feature text */}
          <div className="mt-4 h-7 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={activeFeature}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="font-sans text-sm font-medium tracking-wider uppercase text-primary/80"
              >
                {featureNames[activeFeature]}
              </motion.span>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* iPhone Mockup with Video + Parallax + Shimmer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          style={{ y: mockupY }}
          className="flex justify-center relative"
        >
          {/* Pulsing halo rings — sized relative to phone */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={isInView ? {
              opacity: [0, 0.25, 0.08, 0.25, 0],
              scale: [0.7, 1.05, 1.1, 1.05, 0.7],
            } : {}}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20 pointer-events-none"
            style={{ width: isMobile ? 200 : 320, height: isMobile ? 200 : 320 }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={isInView ? {
              opacity: [0, 0.15, 0.05, 0.15, 0],
              scale: [0.6, 1.15, 1.2, 1.15, 0.6],
            } : {}}
            transition={{ duration: 6, delay: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10 pointer-events-none"
            style={{ width: isMobile ? 260 : 400, height: isMobile ? 260 : 400 }}
          />

          {/* Floating shimmer particles */}
          {isInView && shimmerParticles.map((p) => (
            <motion.span
              key={p.id}
              initial={{ opacity: 0, y: 0 }}
              animate={{
                opacity: [0, 0.7, 0],
                y: [0, -20 - Math.random() * 30, -50],
                x: [0, (Math.random() - 0.5) * 24],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute rounded-full bg-primary pointer-events-none"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                filter: `blur(${p.size > 3.5 ? 1 : 0}px)`,
              }}
            />
          ))}

          <IPhoneMockup
            model="15-pro"
            color="space-black"
            scale={isMobile ? 0.55 : 0.75}
          >
            <video
              src={featureDemo}
              autoPlay
              loop
              muted
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </IPhoneMockup>

          {/* Luxury glow reflection — tighter */}
          <motion.div
            style={{ opacity: glowOpacity }}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1/2 h-12 rounded-full bg-primary/15 blur-2xl pointer-events-none"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
