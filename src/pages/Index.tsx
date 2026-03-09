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

const Index = () => (
  <div className="min-h-screen overflow-x-hidden">
    <Navbar />
    <Hero />
    <SocialProofStrip />
    <HowItWorks />
    <Features />
    <BrandMarquee />
    <Testimonials />
    <Pricing />
    <FAQ />
    <Footer />
  </div>
);

export default Index;
