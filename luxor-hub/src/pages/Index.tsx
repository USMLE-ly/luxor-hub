import { useEffect, useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { captureUTMParams } from "@/lib/utmTracker";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";

import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import TabbedFeatures from "@/components/landing/TabbedFeatures";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";
import CTABanner from "@/components/landing/CTABanner";
import AnnouncementBanner from "@/components/landing/AnnouncementBanner";
import StickyPricingBar from "@/components/landing/StickyPricingBar";
import ScrollToTop from "@/components/landing/ScrollToTop";

const Index = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 25, restDelta: 0.001 });
  const opacity = useTransform(scrollYProgress, [0, 0.03], [1, 0]);

  useEffect(() => {
    captureUTMParams();
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden dark">
      {/* Premium scroll progress bar with gold gradient */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] z-[100] origin-left"
        style={{ scaleX, opacity }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-gold/40 via-gold to-gold/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </motion.div>

      <AnnouncementBanner />
      <Navbar />
      <Hero />
      
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <TabbedFeatures />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.1 }}
      >
        <Features />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.15 }}
      >
        <HowItWorks />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <Testimonials />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.25 }}
      >
        <Pricing />
      </motion.div>
      
      <FAQ />
      <CTABanner />
      <Footer />
      <StickyPricingBar />
      <ScrollToTop />
    </div>
  );
};

export default Index;