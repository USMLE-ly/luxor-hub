import { useState } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/app/AppLayout";
import { Heart, ExternalLink, ShoppingBag, Sparkles, Filter, ChevronRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  brand: string;
  price: string;
  category: string;
  matchScore: number;
  color: string;
  imageEmoji: string;
  tags: string[];
}

const mockProducts: Product[] = [
  { id: "1", name: "Slim Fit Chinos", brand: "COS", price: "€79", category: "Bottoms", matchScore: 96, color: "hsl(35,40%,60%)", imageEmoji: "👖", tags: ["Versatile", "Smart Casual"] },
  { id: "2", name: "Merino Crew Neck", brand: "Uniqlo", price: "€39", category: "Tops", matchScore: 94, color: "hsl(210,20%,35%)", imageEmoji: "🧶", tags: ["Essential", "Cold Winter"] },
  { id: "3", name: "Oxford Button-Down", brand: "Arket", price: "€59", category: "Tops", matchScore: 92, color: "hsl(210,80%,90%)", imageEmoji: "👔", tags: ["Classic", "Workwear"] },
  { id: "4", name: "Leather Chelsea Boots", brand: "Mango", price: "€129", category: "Shoes", matchScore: 91, color: "hsl(20,30%,25%)", imageEmoji: "👢", tags: ["Investment", "Timeless"] },
  { id: "5", name: "Wool Overcoat", brand: "Massimo Dutti", price: "€199", category: "Outerwear", matchScore: 89, color: "hsl(0,0%,20%)", imageEmoji: "🧥", tags: ["Cold Winter", "Statement"] },
  { id: "6", name: "Cashmere Scarf", brand: "COS", price: "€89", category: "Accessories", matchScore: 88, color: "hsl(0,0%,40%)", imageEmoji: "🧣", tags: ["Luxury Feel", "Gift Idea"] },
  { id: "7", name: "Canvas Sneakers", brand: "Veja", price: "€115", category: "Shoes", matchScore: 87, color: "hsl(0,0%,95%)", imageEmoji: "👟", tags: ["Sustainable", "Casual"] },
  { id: "8", name: "Tailored Blazer", brand: "Zara", price: "€89", category: "Outerwear", matchScore: 85, color: "hsl(220,10%,30%)", imageEmoji: "🥼", tags: ["Versatile", "Elevated"] },
];

const categories = ["All", "Tops", "Bottoms", "Shoes", "Outerwear", "Accessories"];

const Inspiration = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [liked, setLiked] = useState<Set<string>>(new Set());

  const filtered = activeCategory === "All"
    ? mockProducts
    : mockProducts.filter((p) => p.category === activeCategory);

  const toggleLike = (id: string) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <AppLayout>
      <div className="px-5 py-5 max-w-lg mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
          <h1 className="font-display text-2xl font-bold text-foreground">My Shop</h1>
          <p className="text-muted-foreground font-sans text-xs mt-0.5">Personalized picks based on your Style DNA</p>
        </motion.div>

        {/* AI Match Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl bg-primary/5 border border-primary/20 p-4 mb-5 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-sans font-semibold text-foreground text-sm">AI-Powered Picks</p>
            <p className="text-xs text-muted-foreground font-sans">Matched to your color type, style preferences & closet gaps</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </motion.div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-sans whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "bg-foreground text-background font-semibold"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border bg-card overflow-hidden group"
            >
              {/* Image placeholder */}
              <div
                className="aspect-[3/4] relative flex items-center justify-center"
                style={{ backgroundColor: product.color }}
              >
                <span className="text-4xl">{product.imageEmoji}</span>

                {/* Match score */}
                <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-primary" />
                  <span className="text-[10px] font-bold text-foreground font-sans">{product.matchScore}%</span>
                </div>

                {/* Like */}
                <button
                  onClick={() => toggleLike(product.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center"
                >
                  <Heart
                    className={`w-3.5 h-3.5 transition-colors ${liked.has(product.id) ? "text-red-500 fill-red-500" : "text-foreground"}`}
                  />
                </button>

                {/* Shop link overlay */}
                <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex items-center gap-1.5 bg-foreground text-background px-3 py-1.5 rounded-full text-xs font-sans font-semibold">
                    <ShoppingBag className="w-3 h-3" /> Shop Now
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-[10px] text-muted-foreground font-sans uppercase tracking-wider">{product.brand}</p>
                <p className="font-sans text-xs font-medium text-foreground mt-0.5 truncate">{product.name}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="font-sans font-bold text-sm text-foreground">{product.price}</span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </div>
                {/* Tags */}
                <div className="flex gap-1 mt-2 flex-wrap">
                  {product.tags.map((tag) => (
                    <span key={tag} className="text-[9px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded-full font-sans">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Closet Gap Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 mb-4"
        >
          <h2 className="font-sans font-semibold text-foreground text-sm mb-3">Fill Your Closet Gaps</h2>
          <div className="space-y-2">
            {[
              { label: "You're missing a statement coat", emoji: "🧥", count: 5 },
              { label: "Add a versatile pair of loafers", emoji: "👞", count: 3 },
              { label: "Complete looks with a quality belt", emoji: "🪹", count: 4 },
            ].map((gap, i) => (
              <button
                key={i}
                className="w-full flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left hover:border-primary/40 transition-colors"
              >
                <span className="text-xl">{gap.emoji}</span>
                <div className="flex-1">
                  <p className="font-sans text-xs font-medium text-foreground">{gap.label}</p>
                  <p className="text-[10px] text-muted-foreground font-sans">{gap.count} options from €49</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Inspiration;
