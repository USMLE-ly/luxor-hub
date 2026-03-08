import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import AnnouncementBanner from "@/components/landing/AnnouncementBanner";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import CursorSpotlight from "@/components/ui/cursor-spotlight";
import SparkleParticles from "@/components/ui/sparkle-particles";
import SocialProofStrip from "@/components/landing/SocialProofStrip";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import AppPreview from "@/components/landing/AppPreview";
import BrandMarquee from "@/components/landing/BrandMarquee";
import IntegrationHero from "@/components/landing/IntegrationHero";
import Pricing from "@/components/landing/Pricing";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import ThemeShowcase from "@/components/landing/ThemeShowcase";
import Footer from "@/components/landing/Footer";

const ScrollProgressBar = () => {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${pct / 100})`;
      rafId = requestAnimationFrame(update);
    };
    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[3px] pointer-events-none">
      <div
        ref={barRef}
        className="h-full w-full origin-left bg-gradient-to-r from-primary via-primary/80 to-primary/60"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
};

const SectionReveal = ({ children, direction = "up" }: { children: React.ReactNode; direction?: "up" | "left" | "right" }) => {
  const variants = {
    up: { hidden: { opacity: 0, y: 60 }, visible: { opacity: 1, y: 0 } },
    left: { hidden: { opacity: 0, x: -60 }, visible: { opacity: 1, x: 0 } },
    right: { hidden: { opacity: 0, x: 60 }, visible: { opacity: 1, x: 0 } },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.23, 0.86, 0.39, 0.96] }}
      variants={variants[direction]}
    >
      {children}
    </motion.div>
  );
};

const GoldSectionDivider = () => (
  <div className="flex items-center gap-4 py-4 max-w-xs mx-auto">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/30" />
    <div className="w-1 h-1 rounded-full bg-primary/40" />
    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/30" />
  </div>
);

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.6]);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <CursorSpotlight />
      <ScrollProgressBar />
      <AnnouncementBanner />
      <Navbar />
      <motion.div ref={heroRef} style={{ y: heroY, opacity: heroOpacity }} className="relative">
        <SparkleParticles count={40} className="z-10" />
        <Hero />
      </motion.div>

      <SectionReveal>
        <SocialProofStrip />
      </SectionReveal>

      <SectionReveal direction="left">
        <HowItWorks />
      </SectionReveal>

      <GoldSectionDivider />

      <SectionReveal direction="right">
        <Features />
      </SectionReveal>

      <SectionReveal>
        <AppPreview />
      </SectionReveal>

      <GoldSectionDivider />

      <SectionReveal>
        <BrandMarquee />
      </SectionReveal>

      <SectionReveal direction="left">
        <IntegrationHero />
      </SectionReveal>

      <GoldSectionDivider />

      <SectionReveal direction="right">
        <div className="bg-muted/20">
          <Testimonials />
        </div>
      </SectionReveal>

      <SectionReveal>
        <Pricing />
      </SectionReveal>

      <GoldSectionDivider />

      <SectionReveal>
        <FAQ />
      </SectionReveal>

      <SectionReveal direction="right">
        <ThemeShowcase />
      </SectionReveal>

      <Footer />
    </div>
  );
};

export default Index;
