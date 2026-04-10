import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { IPhoneMockup } from "@/components/ui/iphone-mockup";
import featureDemo from "@/assets/feature-demo.mp4";
import { useIsMobile } from "@/hooks/use-mobile";

const shimmerParticles = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: 40 + Math.random() * 50,
  size: 2 + Math.random() * 3,
  delay: Math.random() * 4,
  duration: 3 + Math.random() * 3,
}));

const Features = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const isMobile = useIsMobile();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const mockupY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const glowOpacity = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0.2, 0.6, 0.3]);

  return (
    <section id="features" className="pt-16 md:pt-24 pb-8 md:pb-12 bg-muted/20 overflow-hidden" ref={sectionRef}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-10"
        >
          <p className="font-sans text-sm font-semibold text-primary tracking-widest uppercase mb-3">Features</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            Every Fashion Tool You Need.{" "}
            <span className="gold-text">One App.</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-sm text-muted-foreground leading-relaxed">
            AI outfit analysis, trend forecasting, wardrobe management, and virtual try-on — all in one app.
          </p>
        </motion.div>

        {/* iPhone Mockup with Video + Parallax + Shimmer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          style={{ y: mockupY }}
          className="flex justify-center relative"
        >
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

          {/* Luxury glow reflection */}
          <motion.div
            style={{ opacity: glowOpacity }}
            className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-3/4 h-32 rounded-full bg-primary/15 blur-3xl pointer-events-none"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
