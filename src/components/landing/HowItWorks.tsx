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
    description:
      "Open your wardrobe, snap a few photos. LUXOR identifies every piece, tags colors and fabrics, and builds your digital closet in under two minutes.",
    href: "#features",
    image: featureClosetScanner,
  },
  {
    id: "style-dna",
    title: "Let the AI Learn You",
    description:
      "LUXOR studies your body shape, color season, lifestyle, and taste. Within hours it knows what flatters you better than most personal stylists.",
    href: "#features",
    image: featureStyleDna,
  },
  {
    id: "daily-outfits",
    title: "Wake Up to Your Outfit",
    description:
      "Every morning, a complete look waits on your screen. Weather-checked, calendar-aware, pulled from clothes you already own. The decision is made.",
    href: "#features",
    image: featureOutfitGen,
  },
  {
    id: "ai-stylist",
    title: "Ask Anything",
    description:
      "\"What do I wear to a rooftop dinner?\" \"Does this jacket work with these shoes?\" LUXOR answers in seconds, with outfit mockups attached.",
    href: "#features",
    image: featureAiChat,
  },
  {
    id: "smart-shopping",
    title: "Buy Only What You Need",
    description:
      "LUXOR tells you the exact pieces missing from your wardrobe. Every recommendation fills a gap. No impulse buys, no regret purchases.",
    href: "#features",
    image: featureShopping,
  },
  {
    id: "track-progress",
    title: "Watch Your Confidence Grow",
    description:
      "Track your style score, see cost-per-wear data, earn badges, and watch the compliments roll in. Numbers don't lie.",
    href: "#features",
    image: featureAnalytics,
  },
];

const HowItWorks = () => (
  <div id="how-it-works">
    <Gallery4
      title="From Closet Chaos to Compliments. Three Minutes."
      description="Scan your wardrobe. Let the AI learn you. Wake up knowing what to wear. That's it."
      items={howItWorksItems}
    />
  </div>
);

export default HowItWorks;
