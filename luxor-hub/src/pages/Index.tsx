import React, { useEffect, Suspense } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { captureUTMParams } from "@/lib/utmTracker";

// Lazy-load ALL landing sections — none render until scrolled into view
const Navbar = React.lazy(() => import("@/components/landing/Navbar"));
const Hero = React.lazy(() => import("@/components/landing/Hero"));
const SocialProofStrip = React.lazy(() => import("@/components/landing/SocialProofStrip"));
const BrandMarquee = React.lazy(() => import("@/components/landing/BrandMarquee"));
const TabbedFeatures = React.lazy(() => import("@/components/landing/TabbedFeatures"));
const Features = React.lazy(() => import("@/components/landing/Features"));
const AIFashionEditorial = React.lazy(() => import("@/components/landing/AIFashionEditorial"));
const HowItWorks = React.lazy(() => import("@/components/landing/HowItWorks"));
const VideoTestimonials = React.lazy(() => import("@/components/landing/VideoTestimonials"));
const AppPreview = React.lazy(() => import("@/components/landing/AppPreview"));
const Pricing = React.lazy(() => import("@/components/landing/Pricing"));
const FAQ = React.lazy(() => import("@/components/landing/FAQ"));
const CTABanner = React.lazy(() => import("@/components/landing/CTABanner"));
const Footer = React.lazy(() => import("@/components/landing/Footer"));
const ScrollToTop = React.lazy(() => import("@/components/landing/ScrollToTop"));
const AnnouncementBanner = React.lazy(() => import("@/components/landing/AnnouncementBanner"));

const Section = ({ children }: { children: React.ReactNode }) => (
  <React.Suspense fallback={<div className="min-h-[200px]" />}>
    {children}
  </React.Suspense>
);

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
        className="fixed top-0 left-0 right-0 h-[2px] z-[100] origin-left scroll-progress-bar"
        style={{ scaleX, opacity }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-gold/40 via-gold to-gold/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </motion.div>

      <Section><AnnouncementBanner /></Section>
      <Section><Navbar /></Section>
      <Section><Hero /></Section>
      <Section><TabbedFeatures /></Section>

      <Section><SocialProofStrip /></Section>
      <Section><BrandMarquee /></Section>

      <Section><AppPreview /></Section>
      <Section><Features /></Section>
      <Section><AIFashionEditorial /></Section>
      <Section><HowItWorks /></Section>
      <Section><VideoTestimonials /></Section>
      <Section><Pricing /></Section>
      <Section><FAQ /></Section>
      <Section><CTABanner /></Section>
      <Section><Footer /></Section>
      <Section><ScrollToTop /></Section>
    </div>
  );
};

export default Index;
