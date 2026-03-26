import { Gallery4 } from "@/components/ui/gallery4";
import featureStyleDna from "@/assets/feature-style-dna.jpg";
import featureClosetScanner from "@/assets/feature-closet-scanner.jpg";
import featureOutfitGen from "@/assets/feature-outfit-gen.jpg";
import featureAiChat from "@/assets/feature-ai-chat.jpg";
import featureShopping from "@/assets/feature-shopping.jpg";
import featureAnalytics from "@/assets/feature-analytics.jpg";

const howItWorksItems = [
  {
    id: "scan-closet",
    title: "Photograph Your Closet",
    description: "Snap a few photos. AI tags every piece in under two minutes.",
    href: "#features",
    image: featureClosetScanner,
  },
  {
    id: "style-dna",
    title: "Let the AI Learn You",
    description: "Body shape, color season, lifestyle — mapped in one session.",
    href: "#features",
    image: featureStyleDna,
  },
  {
    id: "daily-outfits",
    title: "Wake Up to Your Outfit",
    description: "A complete look every morning. Weather-checked, from your closet.",
    href: "#features",
    image: featureOutfitGen,
  },
  {
    id: "ai-stylist",
    title: "Ask Anything",
    description: "\"What do I wear tonight?\" Answers in seconds, with outfit mockups.",
    href: "#features",
    image: featureAiChat,
  },
  {
    id: "smart-shopping",
    title: "Buy Only What You Need",
    description: "AI finds the gaps. Every recommendation fills one.",
    href: "#features",
    image: featureShopping,
  },
  {
    id: "track-progress",
    title: "Watch Your Confidence Grow",
    description: "Track style scores, cost-per-wear, and earned badges.",
    href: "#features",
    image: featureAnalytics,
  },
];

const HowItWorks = () => (
  <div id="how-it-works">
    <Gallery4
      title="Three Steps. That's It."
      description="Scan your closet. Let AI learn you. Wake up to your outfit."
      items={howItWorksItems}
    />
  </div>
);

export default HowItWorks;
