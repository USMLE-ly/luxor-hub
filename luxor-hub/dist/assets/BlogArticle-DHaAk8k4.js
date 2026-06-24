import { r as reactExports, j as jsxRuntimeExports, h as useParams, N as Navigate, L as Link } from "./index-DbMNM3HR.js";
import { d as createLucideIcon, H as Helmet } from "./AppContent-_r6To3FT.js";
import { T as Tag, N as NewsletterSignup } from "./NewsletterSignup-oMGqYHSf.js";
import { T as Twitter } from "./twitter-0cmkcCgC.js";
import { C as Check } from "./check-Y0AmOnPb.js";
import { L as Link2 } from "./link-2-D0nVn6t_.js";
import { A as ArrowLeft } from "./arrow-left-Bq7O7GHe.js";
import { L as List } from "./list-BeobO3MX.js";
import { m as motion } from "./proxy-BW1EVREd.js";
import { C as Clock } from "./clock-Lq0xdoc2.js";
import { A as ArrowRight } from "./arrow-right-CR94i8Nv.js";
import "./circle-check-big-BF3RD5Y-.js";
import "./mail-DRLdBxbb.js";
import "./loader-circle-BwBuuCzi.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Linkedin = createLucideIcon("Linkedin", [
  [
    "path",
    {
      d: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z",
      key: "c2jq9f"
    }
  ],
  ["rect", { width: "4", height: "12", x: "2", y: "9", key: "mk3on5" }],
  ["circle", { cx: "4", cy: "4", r: "2", key: "bt5ra8" }]
]);
const ShareButtons = ({ title, slug }) => {
  const [copied, setCopied] = reactExports.useState(false);
  const url = `https://luxor.ly/blog/${slug}`;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2e3);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground mr-1", children: "Share" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "a",
      {
        href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
        target: "_blank",
        rel: "noopener noreferrer",
        className: "inline-flex items-center justify-center w-8 h-8 rounded-full border border-border/30 text-muted-foreground hover:text-foreground hover:border-border/60 transition-colors",
        "aria-label": "Share on Twitter",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Twitter, { className: "w-3.5 h-3.5" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "a",
      {
        href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        target: "_blank",
        rel: "noopener noreferrer",
        className: "inline-flex items-center justify-center w-8 h-8 rounded-full border border-border/30 text-muted-foreground hover:text-foreground hover:border-border/60 transition-colors",
        "aria-label": "Share on LinkedIn",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Linkedin, { className: "w-3.5 h-3.5" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: copyLink,
        className: "inline-flex items-center justify-center w-8 h-8 rounded-full border border-border/30 text-muted-foreground hover:text-foreground hover:border-border/60 transition-colors",
        "aria-label": "Copy link",
        children: copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-3.5 h-3.5 text-primary" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "w-3.5 h-3.5" })
      }
    )
  ] });
};
const articles = {
  "ai-outfit-recommendation-how-it-works": {
    title: "How AI Outfit Recommendation Engines Actually Work in 2026",
    excerpt: "AI outfit engines go beyond color matching.",
    category: "Technology",
    readTime: "8 min read",
    date: "April 3, 2026",
    ogDescription: "How AI outfit recommendation engines analyze body proportions, fabric compatibility, and weather to build personalized daily looks.",
    ogImage: "/og/og-ai-outfit.jpg",
    sections: [
      { heading: "The Rise of AI Styling", body: "AI has reshaped how people get dressed. What once needed a personal stylist now happens inside an app in under a second." },
      { heading: "How the Neural Network Works", body: "At the core sits a neural network trained on millions of fashion images. But image recognition is only the start. LEXOR® layers contextual signals on top: calendar events, local forecast, dress codes, and mood." },
      { heading: "Wardrobe Encoding", body: "The algorithm maps your wardrobe into a style space. Each garment is encoded across 40+ attributes — silhouette, color temperature, pattern density, fabric drape, seasonal weight. When you request an outfit, the model finds combinations that maximize harmony while respecting weather and dress code constraints." },
      { heading: "The Feedback Loop", body: "What separates AI styling from a static lookbook is the feedback loop. Every time you accept or skip a suggestion, the system recalibrates. Within two weeks, most users say recommendations feel like their own choices — just faster." },
      { heading: "Privacy & Security", body: "Your wardrobe data never leaves encrypted storage. The model runs without exposing individual preferences. Personal styling at scale, without sacrificing privacy." }
    ]
  },
  "capsule-wardrobe-guide-minimalist-fashion": {
    title: "The Complete Capsule Wardrobe Guide: Build a Minimalist Closet That Works",
    excerpt: "A capsule wardrobe isn't about owning less — it's about owning better.",
    category: "Style Guide",
    readTime: "10 min read",
    date: "March 28, 2026",
    ogDescription: "Build a capsule wardrobe with AI — audit your closet, find versatile staples, and maximize outfit combinations from fewer pieces.",
    ogImage: "/og/og-capsule-wardrobe.jpg",
    sections: [
      { heading: "Why Capsule Wardrobes Matter", body: "The capsule wardrobe concept dates back to the 1970s but has never been more relevant. Fast fashion left the average person with 100+ garments, yet most people wear fewer than 20% of what they own." },
      { heading: "Auditing Your Closet", body: "Start with an honest audit. Photograph every item — LEXOR® does this automatically, categorizing by type, color, season, and versatility. Patterns emerge fast: duplicate black tees, unworn blazers, zero transitional layers." },
      { heading: "Building Combinatorial Coverage", body: "A working capsule is 30–40 pieces that interlock. Every top pairs with at least three bottoms. AI tools calculate combinatorial coverage — how many unique outfits your capsule produces and where the gaps are." },
      { heading: "Color Cohesion Over Trends", body: "Color cohesion beats trend-chasing. Pick a neutral base (navy, charcoal, ivory), add two accent colors that match your skin tone. LEXOR®'s color analysis maps your complexion to a personalized palette." },
      { heading: "The Results", body: "Users who switch to a capsule get dressed 70% faster and spend 35% less on clothing annually." }
    ]
  },
  "what-to-wear-to-work-office-outfit-ideas": {
    title: "What to Wear to Work: Smart Office Outfit Ideas for Every Dress Code",
    excerpt: "From business formal to creative casual — decode your workplace style.",
    category: "Office Style",
    readTime: "7 min read",
    date: "March 20, 2026",
    ogDescription: "Smart office outfit ideas for every dress code — from business formal to creative casual. Build a work wardrobe that looks polished.",
    ogImage: "/og/og-office-style.jpg",
    sections: [
      { heading: "The Dress Code Dilemma", body: "Office dress codes have fragmented. The suit-and-tie era gave way to business casual, which split into 'smart casual,' 'creative professional,' and the vague 'dress appropriately.' Figuring out what to wear each morning is real friction." },
      { heading: "The Three-Tier System", body: "Build a flexible work wardrobe around three tiers. Tier one: polished staples — tailored trousers, structured blazers, quality button-downs. Tier two: smart-casual bridges — chinos, knit polos, loafers. These cover 80% of workdays. Tier three: creative accents that show personality without crossing lines." },
      { heading: "Color Psychology at Work", body: "Navy and charcoal project authority. Pastels read approachable. Jewel tones signal confidence. LEXOR® factors in your industry and meeting schedule to pick the right register each day." },
      { heading: "Seasonal Transitions", body: "Seasonal transitions trip up even good dressers. AI handles this by checking the hourly forecast and picking pieces that work at 7 AM and 2 PM." },
      { heading: "Cost Per Wear", body: "A $200 blazer worn 100 times costs $2 per wear. A $30 trend piece worn twice costs $15 per wear. AI analytics make cost-per-wear visible for every item in your closet." }
    ]
  },
  "color-analysis-for-fashion-find-your-season": {
    title: "Color Analysis for Fashion: How to Find Your Season and Dress in Your Best Shades",
    excerpt: "Seasonal color analysis is a proven framework for finding your best hues.",
    category: "Color Theory",
    readTime: "9 min read",
    date: "March 12, 2026",
    ogDescription: "Find your color season and dress in shades that make your skin glow. AI-powered seasonal color analysis explained step by step.",
    ogImage: "/og/og-color-analysis.jpg",
    sections: [
      { heading: "Understanding Seasonal Archetypes", body: "Color analysis divides human coloring into seasonal archetypes — Spring, Summer, Autumn, Winter — based on undertone, value, and chroma. Knowing your season turns shopping from guesswork into precision." },
      { heading: "AI-Powered Color Matching", body: "The traditional method uses fabric drapes under neutral light. AI has made it instant. LEXOR® uses your selfie to map skin undertone, eye color, and hair shade, then outputs your season with 30+ complementary colors." },
      { heading: "Why Matching Matters", body: "Colors that match your natural coloring make your skin look healthier and your appearance more intentional. Clashing colors create subtle discord people register as 'something's off.'" },
      { heading: "Your Season's Best Shades", body: "Springs shine in coral and golden yellow. Winters command attention in cobalt and crisp white. Autumns glow in olive and burnt orange. Summers look effortless in dusty rose and sage." },
      { heading: "Filtering Trends Through Your Palette", body: "The biggest mistake is chasing trendy colors regardless of season. AI styling filters trends through your personal palette so you stay current without losing harmony." }
    ]
  },
  "wardrobe-management-app-comparison": {
    title: "Best Wardrobe Management Apps in 2026: Features, Pricing, and Honest Reviews",
    excerpt: "We compare the top digital closet apps — from basic cataloging to full AI styling.",
    category: "Reviews",
    readTime: "12 min read",
    date: "March 5, 2026",
    ogDescription: "Compare the best wardrobe management apps of 2026. Features, pricing, and honest reviews of digital closet tools and AI styling platforms.",
    ogImage: "/og/og-wardrobe-apps.jpg",
    sections: [
      { heading: "The Market Landscape", body: "The wardrobe app market has exploded. By 2026, there are over twenty options — but quality varies. Some are glorified photo albums. Others, like LEXOR®, are AI platforms that learn and evolve with your style." },
      { heading: "Baseline Features", body: "Baseline features every app should have: photo upload with background removal, category tagging, outfit creation, and search. What separates the best is intelligence — does it help you dress better, or just organize what you own?" },
      { heading: "Where LEXOR® Leads", body: "LEXOR® leads in AI outfit generation (weather + calendar), Style DNA profiling, cost-per-wear analytics, wardrobe gap detection, and a social layer for sharing looks. The free tier works for casual users; Pro unlocks full AI capability." },
      { heading: "How to Evaluate", body: "When evaluating any app, ask: Does it cut decision fatigue? Does it save money? Does it improve over time? Static tools plateau. You want a system that learns with every interaction." },
      { heading: "Privacy Is Non-Negotiable", body: "Privacy is non-negotiable. Your wardrobe is intimate data. Look for end-to-end encryption and clear data policies. LEXOR® uses encrypted cloud storage with zero third-party sharing." }
    ]
  }
};
const articleSlugs = Object.keys(articles);
const BlogArticle = () => {
  const { slug } = useParams();
  const article = slug ? articles[slug] : void 0;
  const [progress, setProgress] = reactExports.useState(0);
  const [activeSection, setActiveSection] = reactExports.useState(0);
  const [tocOpen, setTocOpen] = reactExports.useState(false);
  const sectionRefs = reactExports.useRef([]);
  reactExports.useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);
  reactExports.useEffect(() => {
    const updateProgress = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setProgress(window.scrollY / totalHeight * 100);
      }
      for (let i = sectionRefs.current.length - 1; i >= 0; i--) {
        const el = sectionRefs.current[i];
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(i);
          break;
        }
      }
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);
  if (!article) return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/blog", replace: true });
  const currentIndex = articleSlugs.indexOf(slug);
  const nextSlug = currentIndex < articleSlugs.length - 1 ? articleSlugs[currentIndex + 1] : null;
  const prevSlug = currentIndex > 0 ? articleSlugs[currentIndex - 1] : null;
  const totalMin = parseInt(article.readTime) || 5;
  const remainingMin = Math.max(1, Math.ceil(totalMin * (1 - progress / 100)));
  const ogImageUrl = `https://luxor-hub.lovable.app${article.ogImage}`;
  const scrollToSection = (index) => {
    var _a;
    (_a = sectionRefs.current[index]) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth", block: "start" });
    setTocOpen(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Helmet, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("title", { children: [
        article.title,
        " | LEXOR® Blog"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("meta", { name: "description", content: article.ogDescription }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("meta", { property: "og:title", content: article.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("meta", { property: "og:description", content: article.ogDescription }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("meta", { property: "og:type", content: "article" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("meta", { property: "og:url", content: `https://luxor.ly/blog/${slug}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("meta", { property: "og:site_name", content: "LEXOR®" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("meta", { property: "og:image", content: ogImageUrl }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("meta", { property: "og:image:width", content: "1200" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("meta", { property: "og:image:height", content: "630" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("meta", { name: "twitter:card", content: "summary_large_image" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("meta", { name: "twitter:title", content: article.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("meta", { name: "twitter:description", content: article.ogDescription }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("meta", { name: "twitter:image", content: ogImageUrl }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("link", { rel: "canonical", href: `https://luxor.ly/blog/${slug}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("script", { type: "application/ld+json", children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.title,
        "description": article.ogDescription,
        "datePublished": article.date,
        "author": { "@type": "Organization", "name": "LEXOR®", "url": "https://luxor.ly" },
        "publisher": { "@type": "Organization", "name": "LEXOR®", "url": "https://luxor.ly" },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `https://luxor.ly/blog/${slug}` },
        "articleSection": article.category,
        "image": ogImageUrl
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed top-0 left-0 right-0 z-[60]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "h-1 bg-primary transition-all duration-150",
          style: { width: `${progress}%` }
        }
      ),
      progress > 2 && progress < 98 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-3 top-2 text-[10px] font-medium text-muted-foreground bg-background/80 backdrop-blur-sm rounded-full px-2 py-0.5 border border-border/20", children: [
        remainingMin,
        " min left"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background dark", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "sticky top-0 z-50 border-b border-border/20 bg-background/80 backdrop-blur-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/blog", className: "flex items-center gap-2 text-foreground font-display font-bold text-lg tracking-tight", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-4 h-4" }),
          "Blog"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setTocOpen(!tocOpen),
              className: "lg:hidden flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(List, { className: "w-4 h-4" }),
                "Contents"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", className: "text-xs font-semibold uppercase tracking-wider text-primary hover:text-primary/80 transition-colors", children: "Try Free →" })
        ] })
      ] }) }),
      tocOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:hidden sticky top-14 z-40 bg-background/95 backdrop-blur-xl border-b border-border/20 px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "space-y-1", children: article.sections.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => scrollToSection(i),
          className: `block w-full text-left text-xs py-1.5 px-2 rounded transition-colors ${activeSection === i ? "text-primary bg-primary/10 font-medium" : "text-muted-foreground hover:text-foreground"}`,
          children: s.heading
        },
        i
      )) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl mx-auto flex", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "hidden lg:block w-56 shrink-0 sticky top-20 self-start pt-12 pr-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3", children: "Contents" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "space-y-1 border-l border-border/20", children: article.sections.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => scrollToSection(i),
              className: `block w-full text-left text-xs py-1.5 pl-3 pr-1 border-l-2 -ml-px transition-colors ${activeSection === i ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"}`,
              children: s.heading
            },
            i
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "flex-1 min-w-0 px-4 sm:px-6 py-12 md:py-20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.header,
            {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.5 },
              className: "mb-10",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3 mb-5 text-xs text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-primary font-medium", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: "w-3 h-3" }),
                    article.category
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3" }),
                    article.readTime
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: article.date })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl md:text-5xl font-bold text-foreground tracking-tight leading-tight", children: article.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShareButtons, { title: article.title, slug }) })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-8", children: article.sections.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.section,
            {
              ref: (el) => {
                sectionRefs.current[i] = el;
              },
              initial: { opacity: 0, y: 12 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.4, delay: 0.2 + i * 0.05 },
              className: "scroll-mt-24",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg md:text-xl font-semibold text-foreground mb-3", children: s.heading }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base md:text-lg text-muted-foreground leading-relaxed", children: s.body })
              ]
            },
            i
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-16 pt-8 border-t border-border/20 flex justify-between items-center gap-4", children: [
            prevSlug ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: `/blog/${prevSlug}`, className: "text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-3.5 h-3.5" }),
              "Previous"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
            nextSlug ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: `/blog/${nextSlug}`, className: "text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5", children: [
              "Next",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-3.5 h-3.5" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", {})
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NewsletterSignup, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { opacity: 0, y: 20 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true },
              transition: { duration: 0.5 },
              className: "mt-16 text-center rounded-2xl border border-border/20 bg-card/30 backdrop-blur-sm p-8",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl md:text-2xl font-bold text-foreground tracking-tight mb-3", children: "Ready to Try AI Styling?" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-6 max-w-md mx-auto", children: "Thousands use LEXOR® to dress smarter every day." }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Link,
                  {
                    to: "/auth",
                    className: "inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-3 font-semibold text-sm hover:bg-primary/90 transition-colors",
                    children: [
                      "Start Free",
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-4 h-4" })
                    ]
                  }
                )
              ]
            }
          )
        ] })
      ] })
    ] })
  ] });
};
export {
  BlogArticle as default
};
