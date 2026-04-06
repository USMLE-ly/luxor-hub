import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Tag, ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import NewsletterSignup from "@/components/blog/NewsletterSignup";
import ShareButtons from "@/components/blog/ShareButtons";

const articles: Record<string, {
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  ogDescription: string;
  body: string[];
}> = {
  "ai-outfit-recommendation-how-it-works": {
    title: "How AI Outfit Recommendation Engines Actually Work in 2026",
    excerpt: "AI outfit engines go beyond color matching.",
    category: "Technology",
    readTime: "8 min read",
    date: "April 3, 2026",
    ogDescription: "How AI outfit recommendation engines analyze body proportions, fabric compatibility, and weather to build personalized daily looks.",
    body: [
      "AI has reshaped how people get dressed. What once needed a personal stylist now happens inside an app in under a second.",
      "At the core sits a neural network trained on millions of fashion images. But image recognition is only the start. LEXOR® layers contextual signals on top: calendar events, local forecast, dress codes, and mood.",
      "The algorithm maps your wardrobe into a style space. Each garment is encoded across 40+ attributes — silhouette, color temperature, pattern density, fabric drape, seasonal weight. When you request an outfit, the model finds combinations that maximize harmony while respecting weather and dress code constraints.",
      "What separates AI styling from a static lookbook is the feedback loop. Every time you accept or skip a suggestion, the system recalibrates. Within two weeks, most users say recommendations feel like their own choices — just faster.",
      "Your wardrobe data never leaves encrypted storage. The model runs without exposing individual preferences. Personal styling at scale, without sacrificing privacy.",
    ],
  },
  "capsule-wardrobe-guide-minimalist-fashion": {
    title: "The Complete Capsule Wardrobe Guide: Build a Minimalist Closet That Works",
    excerpt: "A capsule wardrobe isn't about owning less — it's about owning better.",
    category: "Style Guide",
    readTime: "10 min read",
    date: "March 28, 2026",
    ogDescription: "Build a capsule wardrobe with AI — audit your closet, find versatile staples, and maximize outfit combinations from fewer pieces.",
    body: [
      "The capsule wardrobe concept dates back to the 1970s but has never been more relevant. Fast fashion left the average person with 100+ garments, yet most people wear fewer than 20% of what they own.",
      "Start with an honest audit. Photograph every item — LEXOR® does this automatically, categorizing by type, color, season, and versatility. Patterns emerge fast: duplicate black tees, unworn blazers, zero transitional layers.",
      "A working capsule is 30–40 pieces that interlock. Every top pairs with at least three bottoms. AI tools calculate combinatorial coverage — how many unique outfits your capsule produces and where the gaps are.",
      "Color cohesion beats trend-chasing. Pick a neutral base (navy, charcoal, ivory), add two accent colors that match your skin tone. LEXOR®'s color analysis maps your complexion to a personalized palette.",
      "Users who switch to a capsule get dressed 70% faster and spend 35% less on clothing annually.",
    ],
  },
  "what-to-wear-to-work-office-outfit-ideas": {
    title: "What to Wear to Work: Smart Office Outfit Ideas for Every Dress Code",
    excerpt: "From business formal to creative casual — decode your workplace style.",
    category: "Office Style",
    readTime: "7 min read",
    date: "March 20, 2026",
    ogDescription: "Smart office outfit ideas for every dress code — from business formal to creative casual. Build a work wardrobe that looks polished.",
    body: [
      "Office dress codes have fragmented. The suit-and-tie era gave way to business casual, which split into 'smart casual,' 'creative professional,' and the vague 'dress appropriately.' Figuring out what to wear each morning is real friction.",
      "Build a flexible work wardrobe around three tiers. Tier one: polished staples — tailored trousers, structured blazers, quality button-downs. Tier two: smart-casual bridges — chinos, knit polos, loafers. These cover 80% of workdays. Tier three: creative accents that show personality without crossing lines.",
      "Navy and charcoal project authority. Pastels read approachable. Jewel tones signal confidence. LEXOR® factors in your industry and meeting schedule to pick the right register each day.",
      "Seasonal transitions trip up even good dressers. AI handles this by checking the hourly forecast and picking pieces that work at 7 AM and 2 PM.",
      "A $200 blazer worn 100 times costs $2 per wear. A $30 trend piece worn twice costs $15 per wear. AI analytics make cost-per-wear visible for every item in your closet.",
    ],
  },
  "color-analysis-for-fashion-find-your-season": {
    title: "Color Analysis for Fashion: How to Find Your Season and Dress in Your Best Shades",
    excerpt: "Seasonal color analysis is a proven framework for finding your best hues.",
    category: "Color Theory",
    readTime: "9 min read",
    date: "March 12, 2026",
    ogDescription: "Find your color season and dress in shades that make your skin glow. AI-powered seasonal color analysis explained step by step.",
    body: [
      "Color analysis divides human coloring into seasonal archetypes — Spring, Summer, Autumn, Winter — based on undertone, value, and chroma. Knowing your season turns shopping from guesswork into precision.",
      "The traditional method uses fabric drapes under neutral light. AI has made it instant. LEXOR® uses your selfie to map skin undertone, eye color, and hair shade, then outputs your season with 30+ complementary colors.",
      "Colors that match your natural coloring make your skin look healthier and your appearance more intentional. Clashing colors create subtle discord people register as 'something's off.'",
      "Springs shine in coral and golden yellow. Winters command attention in cobalt and crisp white. Autumns glow in olive and burnt orange. Summers look effortless in dusty rose and sage.",
      "The biggest mistake is chasing trendy colors regardless of season. AI styling filters trends through your personal palette so you stay current without losing harmony.",
    ],
  },
  "wardrobe-management-app-comparison": {
    title: "Best Wardrobe Management Apps in 2026: Features, Pricing, and Honest Reviews",
    excerpt: "We compare the top digital closet apps — from basic cataloging to full AI styling.",
    category: "Reviews",
    readTime: "12 min read",
    date: "March 5, 2026",
    ogDescription: "Compare the best wardrobe management apps of 2026. Features, pricing, and honest reviews of digital closet tools and AI styling platforms.",
    body: [
      "The wardrobe app market has exploded. By 2026, there are over twenty options — but quality varies. Some are glorified photo albums. Others, like LEXOR®, are AI platforms that learn and evolve with your style.",
      "Baseline features every app should have: photo upload with background removal, category tagging, outfit creation, and search. What separates the best is intelligence — does it help you dress better, or just organize what you own?",
      "LEXOR® leads in AI outfit generation (weather + calendar), Style DNA profiling, cost-per-wear analytics, wardrobe gap detection, and a social layer for sharing looks. The free tier works for casual users; Pro unlocks full AI capability.",
      "When evaluating any app, ask: Does it cut decision fatigue? Does it save money? Does it improve over time? Static tools plateau. You want a system that learns with every interaction.",
      "Privacy is non-negotiable. Your wardrobe is intimate data. Look for end-to-end encryption and clear data policies. LEXOR® uses encrypted cloud storage with zero third-party sharing.",
    ],
  },
};

const articleSlugs = Object.keys(articles);

const BlogArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? articles[slug] : undefined;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const updateProgress = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  if (!article) return <Navigate to="/blog" replace />;

  const currentIndex = articleSlugs.indexOf(slug!);
  const nextSlug = currentIndex < articleSlugs.length - 1 ? articleSlugs[currentIndex + 1] : null;
  const prevSlug = currentIndex > 0 ? articleSlugs[currentIndex - 1] : null;

  return (
    <>
      <Helmet>
        <title>{article.title} | LEXOR® Blog</title>
        <meta name="description" content={article.ogDescription} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.ogDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://luxor.ly/blog/${slug}`} />
        <meta property="og:site_name" content="LEXOR®" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.ogDescription} />
        <link rel="canonical" href={`https://luxor.ly/blog/${slug}`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": article.title,
            "description": article.ogDescription,
            "datePublished": article.date,
            "author": { "@type": "Organization", "name": "LEXOR®", "url": "https://luxor.ly" },
            "publisher": { "@type": "Organization", "name": "LEXOR®", "url": "https://luxor.ly" },
            "mainEntityOfPage": { "@type": "WebPage", "@id": `https://luxor.ly/blog/${slug}` },
            "articleSection": article.category,
          })}
        </script>
      </Helmet>

      {/* Reading progress bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-primary z-[60] transition-all duration-150"
        style={{ width: `${progress}%` }}
      />

      <div className="min-h-screen bg-background dark">
        <nav className="sticky top-0 z-50 border-b border-border/20 bg-background/80 backdrop-blur-xl">
          <div className="max-w-3xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14">
            <Link to="/blog" className="flex items-center gap-2 text-foreground font-display font-bold text-lg tracking-tight">
              <ArrowLeft className="w-4 h-4" />
              Blog
            </Link>
            <Link to="/auth" className="text-xs font-semibold uppercase tracking-wider text-primary hover:text-primary/80 transition-colors">
              Try Free →
            </Link>
          </div>
        </nav>

        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-20">
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <div className="flex flex-wrap items-center gap-3 mb-5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-primary font-medium">
                <Tag className="w-3 h-3" />
                {article.category}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                {article.readTime}
              </span>
              <span>{article.date}</span>
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground tracking-tight leading-tight">
              {article.title}
            </h1>
            <div className="mt-6">
              <ShareButtons title={article.title} slug={slug!} />
            </div>
          </motion.header>

          <div className="space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed">
            {article.body.map((p, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.05 }}
              >
                {p}
              </motion.p>
            ))}
          </div>

          {/* Navigation */}
          <div className="mt-16 pt-8 border-t border-border/20 flex justify-between items-center gap-4">
            {prevSlug ? (
              <Link to={`/blog/${prevSlug}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous
              </Link>
            ) : <div />}
            {nextSlug ? (
              <Link to={`/blog/${nextSlug}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                Next
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : <div />}
          </div>

          {/* Newsletter */}
          <div className="mt-16">
            <NewsletterSignup />
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-16 text-center rounded-2xl border border-border/20 bg-card/30 backdrop-blur-sm p-8"
          >
            <Sparkles className="w-5 h-5 text-primary mx-auto mb-3" />
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground tracking-tight mb-3">
              Ready to Try AI Styling?
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Thousands use LEXOR® to dress smarter every day.
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-3 font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Start Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </article>
      </div>
    </>
  );
};

export default BlogArticle;
