import { useNavigate } from "react-router-dom";
import { PulseFitHero } from "@/components/ui/pulse-fit-hero";
import proofImg1 from "@/assets/proof-1.jpg";
import proofImg2 from "@/assets/proof-2.jpeg";
import proofImg3 from "@/assets/proof-3.jpg";
import proofImg4 from "@/assets/proof-4.png";
import styleInspo1 from "@/assets/style-inspo-1.jpg";
import styleInspo2 from "@/assets/style-inspo-2.jpg";
import styleInspo3 from "@/assets/style-inspo-3.jpg";
import featureStyleDna from "@/assets/feature-style-dna.jpg";
import featureOutfit from "@/assets/feature-outfit-gen.jpg";
import featureCloset from "@/assets/feature-closet-scanner.jpg";
import featureShopping from "@/assets/feature-shopping.jpg";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <PulseFitHero
      logo=""
      navigation={[]}
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
      disclaimer="*No credit card required · Cancel anytime"
      socialProof={{
        avatars: [proofImg1, proofImg2, proofImg3, proofImg4],
        text: "Join over 10,000+ style-conscious people",
      }}
      programs={[
        {
          image: featureStyleDna,
          category: "STYLE DNA",
          title: "Discover Your Unique Style Profile",
        },
        {
          image: styleInspo1,
          category: "CAPSULE WARDROBE",
          title: "Build a 30-Piece Capsule",
        },
        {
          image: featureCloset,
          category: "CLOSET SCAN",
          title: "Digitize Your Wardrobe Instantly",
        },
        {
          image: styleInspo2,
          category: "COLOR ANALYSIS",
          title: "Find Your Perfect Palette",
        },
        {
          image: featureOutfit,
          category: "AI OUTFITS",
          title: "Smart Daily Outfit Generator",
        },
        {
          image: styleInspo3,
          category: "BODY SHAPE",
          title: "Flattering Fits For You",
        },
        {
          image: featureShopping,
          category: "SHOP SMARTER",
          title: "Curated Picks From Top Brands",
        },
      ]}
    />
  );
};

export default Hero;
