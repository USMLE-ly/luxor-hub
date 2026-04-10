import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { IPhoneMockup } from "@/components/ui/iphone-mockup";
import featureDemo from "@/assets/feature-demo.mp4";
import { useIsMobile } from "@/hooks/use-mobile";

const Features = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const isMobile = useIsMobile();

  return (
    <section id="features" className="py-16 md:py-24 bg-muted/20" ref={sectionRef}>
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

        {/* iPhone Mockup with Video */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="flex justify-center"
        >
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
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
