import Navbar from "@/components/landing/Navbar";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";
import LuminaSlider from "@/components/ui/lumina-interactive-list";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <LuminaSlider />
      <HowItWorks />
      <Features />
      <Testimonials />
      <Pricing />
      <Footer />
    </div>
  );
};

export default Index;
