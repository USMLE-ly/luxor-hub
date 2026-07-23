import { Gallery4 } from "@/components/ui/gallery4";

const howItWorksItems = [
  {
    id: "scan-closet",
    title: "Photograph Your Closet",
    description: "Snap photos. AI tags every piece in under two minutes.",
    href: "#features",
    image: "/images/feature-closet-scanner.jpg",
  },
  {
    id: "style-dna",
    title: "Let the AI Learn You",
    description: "Body shape, color season, lifestyle — mapped in one session.",
    href: "#features",
    image: "/images/feature-style-dna.jpg",
  },
  {
    id: "daily-outfits",
    title: "Wake Up to Your Outfit",
    description: "A complete look every morning, weather-checked.",
    href: "#features",
    image: "/images/feature-outfit-gen.jpg",
  },
  {
    id: "ai-stylist",
    title: "Ask Anything",
    description: "\"What do I wear tonight?\" — answered in seconds.",
    href: "#features",
    image: "/images/feature-ai-chat.jpg",
  },
  {
    id: "smart-shopping",
    title: "Buy Only What You Need",
    description: "AI finds wardrobe gaps. Every pick fills one.",
    href: "#features",
    image: "/images/feature-shopping.jpg",
  },
  {
    id: "track-progress",
    title: "Watch Your Confidence Grow",
    description: "Style scores, cost-per-wear, and earned badges.",
    href: "#features",
    image: "/images/feature-analytics.jpg",
  },
];

const HowItWorks = () => (
  <div id="how-it-works" className="relative overflow-hidden">
    <Gallery4
      title="Three Steps. That\'s It."
      description="Scan your closet. Let AI learn you. Wake up to your outfit."
      items={howItWorksItems}
    />
  </div>
);

export default HowItWorks;
