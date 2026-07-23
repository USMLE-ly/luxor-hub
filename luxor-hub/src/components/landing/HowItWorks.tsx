import { Gallery4 } from "@/components/ui/gallery4";
import transparencyBg from "@/assets/brand/transparency.png";
// Feature images loaded as URLs (tree-shakeable, lazy by browser)
const featureStyleDna = "/images/feature-demo.jpg";
const featureClosetScanner = "/images/closet-demo.jpg";
const featureOutfitGen = "/images/recommendation-demo.jpg";
const featureAiChat = "/images/analysis-demo.jpg";
const featureShopping = "/images/auto-calendar-demo.jpg";
const featureAnalytics = "/images/feature-demo.jpg";

const howItWorksItems = [
  {
    id: "scan-closet",
    title: "Photograph Your Closet",
    description: "Snap photos. AI tags every piece in under two minutes.",
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
    description: "A complete look every morning, weather-checked.",
    href: "#features",
    image: featureOutfitGen,
  },
  {
    id: "ai-stylist",
    title: "Ask Anything",
    description: "\"What do I wear tonight?\" — answered in seconds.",
    href: "#features",
    image: featureAiChat,
  },
  {
    id: "smart-shopping",
    title: "Buy Only What You Need",
    description: "AI finds wardrobe gaps. Every pick fills one.",
    href: "#features",
    image: featureShopping,
  },
  {
    id: "track-progress",
    title: "Watch Your Confidence Grow",
    description: "Style scores, cost-per-wear, and earned badges.",
    href: "#features",
    image: featureAnalytics,
  },
];

const HowItWorks = () => (
  <div id="how-it-works" className="relative overflow-hidden">
    <img loading="lazy" src={transparencyBg} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-[0.03] pointer-events-none select-none z-0" />
    <Gallery4
      title="Three Steps. That's It."
      description="Scan your closet. Let AI learn you. Wake up to your outfit."
      items={howItWorksItems}
    />
  </div>
);

export default HowItWorks;
