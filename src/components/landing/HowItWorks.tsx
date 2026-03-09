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
    title: "Scan Your Closet",
    description:
      "Snap photos of your clothes. Our AI identifies each item, color, and fabric instantly — building your digital wardrobe in seconds.",
    href: "#features",
    image: featureClosetScanner,
  },
  {
    id: "style-dna",
    title: "AI Analyzes Your Style",
    description:
      "AURELIA learns your preferences, body shape, and lifestyle to build your unique Style DNA — a living profile that evolves with you.",
    href: "#features",
    image: featureStyleDna,
  },
  {
    id: "daily-outfits",
    title: "Get Daily Outfits",
    description:
      "Receive personalized outfit suggestions each morning — weather-aware, occasion-ready, and perfectly matched to your mood.",
    href: "#features",
    image: featureOutfitGen,
  },
  {
    id: "ai-stylist",
    title: "Chat with Your Stylist",
    description:
      "Ask AURELIA anything about fashion. Get instant advice on what to wear, how to style pieces, and what to buy next.",
    href: "#features",
    image: featureAiChat,
  },
  {
    id: "smart-shopping",
    title: "Shop Smarter",
    description:
      "Discover pieces that perfectly complement your existing wardrobe. No more impulse buys — only intentional additions.",
    href: "#features",
    image: featureShopping,
  },
  {
    id: "track-progress",
    title: "Track Your Style Evolution",
    description:
      "See your style score grow, earn badges, and watch your fashion confidence soar with detailed analytics.",
    href: "#features",
    image: featureAnalytics,
  },
];

const HowItWorks = () => (
  <div id="how-it-works">
    <Gallery4
      title="Three Steps to Effortless Style"
      description="From scanning your closet to AI-powered daily outfits — AURELIA transforms how you dress in minutes."
      items={howItWorksItems}
    />
  </div>
);

export default HowItWorks;
