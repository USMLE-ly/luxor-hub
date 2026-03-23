import { useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { captureUTMParams } from "@/lib/utmTracker";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import SocialProofStrip from "@/components/landing/SocialProofStrip";
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

const Index = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    captureUTMParams();
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden dark">
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] z-[100] origin-left gold-gradient"
        style={{ scaleX }}
      />
      <AnnouncementBanner />
      <Navbar />
      <Hero />
      <SocialProofStrip />
      <Features />
      <TabbedFeatures />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTABanner />
      <Footer />
      <StickyPricingBar />
    </div>
  );
};

export default Index;
