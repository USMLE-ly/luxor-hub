import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Tag, ArrowRight, Sparkles } from "lucide-react";
import { useEffect } from "react";
import NewsletterSignup from "@/components/blog/NewsletterSignup";

const articles = [
  {
    slug: "ai-outfit-recommendation-how-it-works",
    title: "How AI Outfit Recommendation Engines Actually Work in 2026",
    excerpt:
      "AI outfit engines go beyond color matching. They analyze body proportions, fabric compatibility, weather, and personal taste to build daily looks.",
    category: "Technology",
    readTime: "8 min read",
    date: "April 3, 2026",
    body: [
      "AI has reshaped how people get dressed. What once needed a personal stylist now happens inside an app in under a second.",
      "At the core sits a neural network trained on millions of fashion images. But image recognition is only the start. LEXOR® layers contextual signals on top: calendar events, local forecast, dress codes, and mood.",
      "The algorithm maps your wardrobe into a style space. Each garment is encoded across 40+ attributes — silhouette, color temperature, pattern density, fabric drape, seasonal weight. When you request an outfit, the model finds combinations that maximize harmony while respecting weather and dress code constraints.",
      "What separates AI styling from a static lookbook is the feedback loop. Every time you accept or skip a suggestion, the system recalibrates. Within two weeks, most users say recommendations feel like their own choices — just faster.",
      "Your wardrobe data never leaves encrypted storage. The model runs without exposing individual preferences. Personal styling at scale, without sacrificing privacy.",
    ],
  },
  {
    slug: "capsule-wardrobe-guide-minimalist-fashion",
    title: "The Complete Capsule Wardrobe Guide: Build a Minimalist Closet That Works",
    excerpt:
      "A capsule wardrobe isn't about owning less — it's about owning better. Audit your closet, find versatile staples, and use AI to maximize outfit combinations.",
    category: "Style Guide",
    readTime: "10 min read",
    date: "March 28, 2026",
    body: [
      "The capsule wardrobe concept dates back to the 1970s but has never been more relevant. Fast fashion left the average person with 100+ garments, yet most people wear fewer than 20% of what they own.",
      "Start with an honest audit. Photograph every item — LEXOR® does this automatically, categorizing by type, color, season, and versatility. Patterns emerge fast: duplicate black tees, unworn blazers, zero transitional layers.",
      "A working capsule is 30–40 pieces that interlock. Every top pairs with at least three bottoms. AI tools calculate combinatorial coverage — how many unique outfits your capsule produces and where the gaps are.",
      "Color cohesion beats trend-chasing. Pick a neutral base (navy, charcoal, ivory), add two accent colors that match your skin tone. LEXOR®'s color analysis maps your complexion to a personalized palette.",
      "Users who switch to a capsule get dressed 70% faster and spend 35% less on clothing annually.",
    ],
  },
  {
    slug: "what-to-wear-to-work-office-outfit-ideas",
    title: "What to Wear to Work: Smart Office Outfit Ideas for Every Dress Code",
    excerpt:
      "From business formal to creative casual, navigating office dress codes is tricky. Here's how to decode your workplace style and build a rotation that looks polished without feeling stiff.",
    category: "Office Style",
    readTime: "7 min read",
    date: "March 20, 2026",
    body: [
      "Office dress codes have evolved dramatically. The rigid suit-and-tie era gave way to business casual, which then fragmented into 'smart casual', 'creative professional', and the ambiguous 'dress appropriately'. For many professionals, figuring out what to wear each morning is a genuine source of stress.",
      "The key is building a flexible work wardrobe around three tiers. Tier one: polished staples — tailored trousers, structured blazers, quality button-downs. These are your board-meeting pieces. Tier two: smart-casual bridges — chinos, knit polos, loafers, midi skirts. These handle 80% of normal workdays. Tier three: creative accents — statement accessories, textured layers, interesting footwear that shows personality without crossing lines.",
      "Color strategy matters in professional settings. Navy and charcoal project authority. Soft pastels read approachable. Bold jewel tones signal confidence. AI styling tools like LEXOR® factor in your industry norms and meeting schedule to recommend the right register each day.",
      "Seasonal transitions trip up even stylish dressers. The shift from winter to spring demands layering intelligence — a skill AI handles effortlessly by checking the hourly forecast and selecting pieces that work at 7 AM and 2 PM alike.",
      "Investment-per-wear is the metric that matters. A $200 blazer worn 100 times costs $2 per wear. A $30 trend piece worn twice costs $15 per wear. Smart work wardrobes prioritize cost-per-wear, and AI analytics make this visible for every item in your closet.",
    ],
  },
  {
    slug: "color-analysis-for-fashion-find-your-season",
    title: "Color Analysis for Fashion: How to Find Your Season and Dress in Your Best Shades",
    excerpt:
      "Seasonal color analysis isn't just a TikTok trend — it's a proven framework for identifying which hues make your skin glow and which wash you out. Here's the science behind it.",
    category: "Color Theory",
    readTime: "9 min read",
    date: "March 12, 2026",
    body: [
      "Color analysis divides human coloring into seasonal archetypes — Spring, Summer, Autumn, Winter — based on three dimensions: undertone (warm vs. cool), value (light vs. dark), and chroma (muted vs. clear). Knowing your season transforms shopping from guesswork into precision.",
      "The traditional method involves draping fabric swatches against your face under neutral lighting. AI has accelerated this dramatically. LEXOR®'s color analysis uses your selfie to map skin undertone, eye color, and hair shade, then outputs your seasonal type along with a personalized palette of 30+ complementary colors.",
      "Why does it matter? Wearing colors that harmonize with your natural coloring creates visual coherence — your skin looks healthier, your eyes pop, your overall appearance looks intentional. Wearing clashing colors creates subtle discord that viewers register as 'something's off' without knowing why.",
      "Each season has signature strengths. Springs shine in warm, clear tones: coral, warm turquoise, golden yellow. Winters command attention in high-contrast combinations: true red, cobalt blue, crisp white against jet black. Autumns glow in earthy warmth: olive, burnt orange, chocolate. Summers look effortless in soft, cool tones: dusty rose, periwinkle, sage.",
      "The most common mistake is chasing trendy colors regardless of season. A Pantone Color of the Year might look stunning on a Deep Winter but terrible on a Soft Summer. AI styling tools filter trend recommendations through your personal palette, ensuring you stay current without sacrificing harmony.",
    ],
  },
  {
    slug: "wardrobe-management-app-comparison",
    title: "Best Wardrobe Management Apps in 2026: Features, Pricing, and Honest Reviews",
    excerpt:
      "We compare the top digital closet apps — from basic cataloging tools to full AI styling platforms — so you can choose the right one for your lifestyle and budget.",
    category: "Reviews",
    readTime: "12 min read",
    date: "March 5, 2026",
    body: [
      "The wardrobe management app market has exploded. In 2024, fewer than five apps offered meaningful AI styling. By 2026, there are over twenty — but quality varies wildly. Some are glorified photo albums. Others, like LEXOR®, are genuine AI fashion platforms that learn, recommend, and evolve with your style.",
      "The baseline features every closet app should offer: photo upload with background removal, category tagging, outfit creation, and basic search. These are table stakes. What separates the best from the rest is intelligence — does the app actually help you dress better, or just organize what you already own?",
      "LEXOR® leads in several categories: AI outfit generation that factors in weather and calendar; Style DNA profiling across 40+ dimensions; cost-per-wear analytics; wardrobe gap identification; and a social layer for sharing looks and getting community feedback. The free tier is generous enough for casual users, while the Pro tier unlocks full AI capability.",
      "When evaluating any wardrobe app, ask three questions. First: does it reduce decision fatigue? If you still spend 15 minutes choosing clothes, the app isn't working. Second: does it save money? The best apps pay for themselves by preventing redundant purchases. Third: does it improve over time? Static tools plateau fast — you want a system that learns your preferences with every interaction.",
      "Privacy should be non-negotiable. Your wardrobe is intimate data. Look for apps with end-to-end encryption, local-first processing, and clear data retention policies. LEXOR® stores wardrobe data in encrypted cloud storage with zero third-party sharing, and the AI model processes recommendations without exposing individual user patterns.",
    ],
  },
];

const Blog = () => {
  useEffect(() => {
    document.title = "Fashion Blog — AI Styling Tips & Wardrobe Guides | LEXOR®";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "Expert fashion advice powered by AI. Read guides on capsule wardrobes, color analysis, office outfits, wardrobe management, and AI outfit recommendations from LEXOR®.");
    
    // OG tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", "Fashion Blog — AI Styling Tips & Wardrobe Guides | LEXOR®");
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", "Expert fashion advice powered by AI. Guides on capsule wardrobes, color analysis, and AI outfit recommendations.");
    let twitterCard = document.querySelector('meta[name="twitter:card"]');
    if (!twitterCard) {
      twitterCard = document.createElement("meta");
      twitterCard.setAttribute("name", "twitter:card");
      twitterCard.setAttribute("content", "summary_large_image");
      document.head.appendChild(twitterCard);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background dark">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/20 bg-background/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14">
          <Link to="/" className="flex items-center gap-2 text-foreground font-display font-bold text-lg tracking-tight">
            <ArrowLeft className="w-4 h-4" />
            LEXOR®
          </Link>
          <Link
            to="/auth"
            className="text-xs font-semibold uppercase tracking-wider text-primary hover:text-primary/80 transition-colors"
          >
            Try Free →
          </Link>
        </div>
      </nav>

      {/* Header */}
      <header className="py-16 md:py-24 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border/30 bg-card/40 px-3 py-1.5 backdrop-blur-md mb-6">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Fashion Intelligence
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground tracking-tight mb-4">
            The LEXOR® Fashion Blog
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Expert guides on AI fashion styling, capsule wardrobes, color analysis, and smarter dressing — backed by data, written for real people.
          </p>
        </motion.div>
      </header>

      {/* Article List */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pb-24">
        <div className="space-y-10">
          {articles.map((article, i) => (
            <motion.article
              key={article.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              id={article.slug}
              className="group"
            >
              <div className="rounded-2xl border border-border/20 bg-card/30 backdrop-blur-sm p-6 md:p-8 hover:border-primary/20 transition-colors">
                <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-muted-foreground">
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

                <h2 className="font-display text-xl md:text-2xl font-bold text-foreground tracking-tight mb-3 group-hover:text-primary transition-colors">
                  {article.title}
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-5">
                  {article.excerpt}
                </p>

                {/* Full article body rendered for SEO */}
                <div className="space-y-4 text-sm text-muted-foreground/80 leading-relaxed">
                  {article.body.slice(0, 2).map((paragraph, j) => (
                    <p key={j}>{paragraph}</p>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-border/10 flex items-center justify-between">
                  <Link
                    to={`/blog/${article.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    Read Full Article
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/auth"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Try LEXOR® Free
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16">
          <NewsletterSignup />
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 text-center"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-4">
            Ready to Dress Smarter?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Join thousands of people using AI to build better wardrobes, save money, and feel confident every day.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-3 font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            Start Free — No Card Needed
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </main>
    </div>
  );
};

export default Blog;
