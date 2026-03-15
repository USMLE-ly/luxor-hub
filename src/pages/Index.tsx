import { motion, useScroll, useSpring } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import SocialProofStrip from "@/components/landing/SocialProofStrip";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import BrandMarquee from "@/components/landing/BrandMarquee";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";
import CTABanner from "@/components/landing/CTABanner";
import AnnouncementBanner from "@/components/landing/AnnouncementBanner";
import ComparisonTable from "@/components/landing/ComparisonTable";
import StickyPricingBar from "@/components/landing/StickyPricingBar";
import { ContainerScroll } from "@/components/ui/container-scroll";
import featureAppPreview from "@/assets/feature-outfit-gen.jpg";

const Index = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <div className="min-h-screen overflow-x-hidden">
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] z-[100] origin-left gold-gradient"
        style={{ scaleX }}
      />
      <AnnouncementBanner />
      <Navbar />
      <Hero />
      <SocialProofStrip />
      <Features />
      <HowItWorks />

      {/* App Showcase */}
      <ContainerScroll
        titleComponent={
          <div className="text-center">
            <p className="font-sans text-sm font-semibold text-primary tracking-widest uppercase mb-3">App Preview</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
              Your Entire Wardrobe, <span className="gold-text">Reimagined</span>
            </h2>
          </div>
        }
      >
        <img
          src={featureAppPreview}
          alt="AURELIA app preview showing AI outfit generation"
          className="w-full h-full object-cover rounded-2xl"
          loading="lazy"
        />
      </ContainerScroll>

      <BrandMarquee />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTABanner />
      <Footer />
    </div>
  );
};

export default Index;
