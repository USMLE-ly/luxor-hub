import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal";
import { IPhoneMockup } from "@/components/ui/iphone-mockup";
import { useIsMobile } from "@/hooks/use-mobile";

const shimmerParticles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: 15 + Math.random() * 70,
  y: 20 + Math.random() * 60,
  size: 1.5 + Math.random() * 2.5,
  delay: Math.random() * 4,
  duration: 3 + Math.random() * 3,
}));

const phones = [
  { video: "/videos/feature-demo.mp4", label: "Manual Upload" },
  { video: "/videos/closet-demo.mp4", label: "Smart Closet" },
  { video: "/videos/recommendation-demo.mp4", label: "AI Recommendations" },
  { video: "/videos/auto-calendar-demo.mp4", label: "Auto Calendar" },
  { video: "/videos/analysis-demo.mp4", label: "Style Analysis", landscape: true },
];

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
  const phoneRowRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<HTMLVideoElement[]>([]);
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

  const phoneScale = isMobile ? 0.55 : 0.72;

  const playVideosInView = useCallback(() => {
    videoRefs.current.forEach((video) => {
      if (video && video.paused) {
        video.play().catch(() => {});
      }
    });
  }, []);

  useEffect(() => {
    const row = phoneRowRef.current;
    if (!row) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            playVideosInView();
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(row);
    return () => observer.disconnect();
  }, [playVideosInView]);

  return (
    <section id="features" className="pt-16 md:pt-24 pb-0 bg-muted/20" ref={sectionRef}>
      <div className="max-w-6xl mx-auto px-4">
        <StaggerContainer>
          <StaggerItem>
            <p className="font-sans text-sm font-semibold text-primary tracking-widest uppercase mb-3 text-center">Features</p>
          </StaggerItem>
          <StaggerItem>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground text-center">
              Every Fashion Tool You Need.{" "}
              <span className="gold-text">One App.</span>
            </h2>
          </StaggerItem>
          <StaggerItem>
            <p className="mt-4 max-w-2xl mx-auto text-sm text-muted-foreground leading-relaxed text-center">
              AI outfit analysis, trend forecasting, wardrobe management, and virtual try-on — all in one app.
            </p>
          </StaggerItem>

          <StaggerItem>
            <div className="mt-4 h-7 flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeFeature}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  className="font-sans text-sm font-medium tracking-wider uppercase text-primary/80"
                >
                  {featureNames[activeFeature]}
                </motion.span>
              </AnimatePresence>
            </div>
          </StaggerItem>
        </StaggerContainer>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
          style={{ y: mockupY }}
          className="relative mb-8 md:mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={isInView ? {
              opacity: [0, 0.25, 0.08, 0.25, 0],
              scale: [0.7, 1.05, 1.1, 1.05, 0.7],
            } : {}}
            transition={{ duration: 1.5, ease: [0.77, 0, 0.175, 1] }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20 pointer-events-none"
            style={{ width: isMobile ? 200 : 320, height: isMobile ? 200 : 320 }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={isInView ? {
              opacity: [0, 0.15, 0.05, 0.15, 0],
              scale: [0.6, 1.15, 1.2, 1.15, 0.6],
            } : {}}
            transition={{ duration: 1.5, delay: 0.5, ease: [0.77, 0, 0.175, 1] }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10 pointer-events-none"
            style={{ width: isMobile ? 260 : 400, height: isMobile ? 260 : 400 }}
          />

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
                ease: [0.77, 0, 0.175, 1],
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

          <div
            ref={phoneRowRef}
            className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory px-4 relative z-[1] scrollbar-hide"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {phones.map((phone, i) => {
              const isLandscape = phone.landscape;
              const landscapeMt = isLandscape ? 'mt-[165px]' : '';
              return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.12, ease: [0.23, 1, 0.32, 1] }}
                className="flex flex-col items-center snap-center flex-shrink-0"
              >
                <span className="font-sans text-[10px] font-medium tracking-wider uppercase text-primary/70 text-center w-full mb-1.5">
                  {phone.label}
                </span>

                <div className={isLandscape ? `flex items-center ${landscapeMt}` : ''}>
                  <IPhoneMockup
                    model="15-pro"
                    color="space-black"
                    scale={phoneScale}
                    orientation={isLandscape ? 'landscape' : 'portrait'}
                  >
                    <video
                      ref={(el) => { if (el) videoRefs.current[i] = el; }}
                      src={phone.video}
                      preload="metadata"
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </IPhoneMockup>
                </div>
              </motion.div>
            )})}
          </div>

          <motion.div
            style={{ opacity: glowOpacity }}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1/2 h-12 rounded-full bg-primary/15 blur-2xl pointer-events-none"
          />

          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none z-10" />
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
