import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import AIFashionEditorial from "@/components/landing/AIFashionEditorial";

const DeepDive = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background dark">
      <Helmet>
        <title>How AI Fashion Styling Works — Deep Dive | LEXOR®</title>
        <meta
          name="description"
          content="Five steps from cluttered closet to daily AI-picked outfits. How LEXOR® digitizes your wardrobe, learns your style, and dresses you for the weather."
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "How AI Fashion Styling Works — Deep Dive",
            "description": "Five steps from cluttered closet to daily AI-picked outfits. How LEXOR® digitizes your wardrobe, learns your style, and dresses you for the weather.",
            "author": { "@type": "Organization", "name": "LEXOR®", "url": "https://luxor.ly" },
            "publisher": { "@type": "Organization", "name": "LEXOR®", "url": "https://luxor.ly" },
            "mainEntityOfPage": { "@type": "WebPage", "@id": "https://luxor.ly/deep-dive" },
          })}
        </script>
        <link rel="canonical" href="https://luxor.ly/deep-dive" />
        <meta property="og:title" content="How AI Fashion Styling Works — Deep Dive | LEXOR®" />
        <meta property="og:description" content="Five steps from cluttered closet to daily AI-picked outfits." />
        <meta property="og:url" content="https://luxor.ly/deep-dive" />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="How AI Fashion Styling Works — Deep Dive | LEXOR®" />
      </Helmet>

      <Navbar />

      <div className="pt-24 pb-4 max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
      </div>

      <AIFashionEditorial />

      <Footer />
    </div>
  );
};

export default DeepDive;
