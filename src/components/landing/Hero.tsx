import { useNavigate } from "react-router-dom";
import { PulseFitHero } from "@/components/ui/pulse-fit-hero";
import proofImg1 from "@/assets/proof-1.jpg";
import proofImg2 from "@/assets/proof-2.jpeg";
import proofImg3 from "@/assets/proof-3.jpg";
import proofImg4 from "@/assets/proof-4.png";
import styleInspo1 from "@/assets/style-inspo-1.jpg";
import styleInspo2 from "@/assets/style-inspo-2.jpg";
import styleInspo3 from "@/assets/style-inspo-3.jpg";
import featureOutfit from "@/assets/feature-outfit-gen.jpg";
import featureShopping from "@/assets/feature-shopping.jpg";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <PulseFitHero
      logo="STYLIST"
      navigation={[
        { label: "Features", onClick: () => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }) },
        { label: "How It Works", onClick: () => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" }) },
        { label: "Testimonials", onClick: () => document.getElementById("testimonials")?.scrollIntoView({ behavior: "smooth" }) },
        { label: "Pricing", hasDropdown: true, onClick: () => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" }) },
      ]}
      ctaButton={{
        label: "Sign In",
        onClick: () => navigate("/auth"),
      }}
      title="Your AI-powered personal stylist."
      subtitle="Get outfit recommendations tailored to your body, style, and lifestyle. Scan your closet, discover new looks, and never wonder what to wear again."
      primaryAction={{
        label: "Get Started Free",
        onClick: () => navigate("/onboarding"),
      }}
      secondaryAction={{
        label: "See how it works",
        onClick: () => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" }),
      }}
      disclaimer="*No credit card required"
      socialProof={{
        avatars: [proofImg1, proofImg2, proofImg3, proofImg4],
        text: "Join over 10,000+ style-conscious people",
      }}
      programs={[
        {
          image: styleInspo1,
          category: "TRENDING",
          title: "Minimalist Capsule Wardrobe",
        },
        {
          image: styleInspo2,
          category: "SEASONAL",
          title: "Spring Transition Looks",
        },
        {
          image: styleInspo3,
          category: "CURATED",
          title: "Date Night Essentials",
        },
        {
          image: featureOutfit,
          category: "AI POWERED",
          title: "Smart Outfit Generator",
        },
        {
          image: featureShopping,
          category: "DISCOVER",
          title: "Shop Your Style DNA",
        },
      ]}
    />
  );
};

export default Hero;
