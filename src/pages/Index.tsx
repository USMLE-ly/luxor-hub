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
import { ContainerScroll } from "@/components/ui/container-scroll";
import { HeroSection } from "@/components/ui/feature-carousel";
import featureAppPreview from "@/assets/feature-outfit-gen.jpg";
import carouselApp1 from "@/assets/carousel-app-1.jpg";
import carouselApp2 from "@/assets/carousel-app-2.jpg";
import carouselApp3 from "@/assets/carousel-app-3.jpg";
import carouselApp4 from "@/assets/carousel-app-4.jpg";
import carouselApp5 from "@/assets/carousel-app-5.jpg";

const appImages = [
  { src: carouselApp1, alt: "AI Fashion outfit suggestions" },
  { src: carouselApp2, alt: "Color analysis and skin tone matching" },
  { src: carouselApp3, alt: "Digital wardrobe closet organizer" },
  { src: carouselApp4, alt: "Trend radar and style scoring" },
  { src: carouselApp5, alt: "AI stylist chat assistant" },
];

const Index = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] z-[100] origin-left gold-gradient"
        style={{ scaleX }}
      />
      <Navbar />
      <Hero />
      <SocialProofStrip />
      <HowItWorks />

      {/* App Preview with Container Scroll */}
      <ContainerScroll
        titleComponent={
          <div className="text-center">
            <p className="font-sans text-sm font-semibold text-primary tracking-widest uppercase mb-3">App Preview</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
              See AURELIA in <span className="gold-text">Action</span>
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

      <Features />

      {/* Feature Carousel */}
      <HeroSection
        title={
          <>
            Your AI Stylist, <span className="gold-text">Always On</span>
          </>
        }
        subtitle="Explore AURELIA's powerful features — from outfit generation to trend intelligence, all in the palm of your hand."
        images={appImages}
      />

      <BrandMarquee />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;
