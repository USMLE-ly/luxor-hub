import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";
import ScrollExpandMedia from "@/components/ui/scroll-expand-media";
import fashionHero from "@/assets/fashion-hero.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ScrollExpandMedia
        mediaType="image"
        mediaSrc={fashionHero}
        bgImageSrc={fashionHero}
        title="Your AI Stylist"
        scrollToExpand="Scroll to explore"
        textBlend
      >
        <Hero />
        <HowItWorks />
        <Features />
        <Pricing />
        <Footer />
      </ScrollExpandMedia>
    </div>
  );
};

export default Index;
