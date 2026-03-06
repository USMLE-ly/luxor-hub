import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Heart, ExternalLink, ShoppingBag, Sparkles, ChevronRight, Loader2, Camera, Search } from "lucide-react";

interface Product {
  id: string;
  name: string;
  brand: string;
  price: string;
  category: string;
  matchScore: number;
  color: string;
  imageUrl: string;
  tags: string[];
  affiliateUrl: string;
}

const categories = ["All", "Tops", "Bottoms", "Shoes", "Outerwear", "Accessories"];

const brandLogos = [
  { name: "Amazon", emoji: "📦" },
  { name: "Zara", emoji: "👗" },
  { name: "H&M", emoji: "🏷️" },
  { name: "ASOS", emoji: "🛍️" },
  { name: "Uniqlo", emoji: "👘" },
  { name: "Nike", emoji: "👟" },
];

const Inspiration = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [colorSeason, setColorSeason] = useState("");
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    supabase
      .from("style_profiles")
      .select("preferences")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        const prefs = data?.preferences as any;
        setColorSeason(prefs?.aiAnalysis?.colorSeason || "");
      });
  }, [user]);

  useEffect(() => {
    fetchProducts();
  }, [activeCategory, colorSeason]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("shop-products", {
        body: null,
        headers: { "Content-Type": "application/json" },
      });

      // The edge function uses query params, so let's call it via fetch for proper params
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shop-products?category=${activeCategory}&colorSeason=${colorSeason}`;
      const resp = await fetch(url, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
      });
      
      if (!resp.ok) throw new Error("Failed to fetch products");
      const result = await resp.json();
      setProducts(result.products || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

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

        {/* Check if item is a Match */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          onClick={() => navigate("/outfit-analysis")}
          className="w-full rounded-2xl bg-foreground text-background p-4 mb-5 flex items-center gap-3 text-left hover:opacity-90 transition-opacity"
        >
          <div className="w-10 h-10 rounded-xl bg-background/10 flex items-center justify-center flex-shrink-0">
            <Camera className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="font-sans font-semibold text-sm">Check if item is a Match</p>
            <p className="text-xs opacity-70 font-sans">Scan any item to see if it fits your Style DNA</p>
          </div>
          <ChevronRight className="w-4 h-4 opacity-50" />
        </motion.button>

        {/* Browse Matches Online */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-5"
        >
          <h2 className="font-sans font-semibold text-foreground text-sm mb-3">Browse Matches online</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
            {brandLogos.map((brand) => (
              <div key={brand.name} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-xl">
                  {brand.emoji}
                </div>
                <span className="text-[10px] font-sans text-muted-foreground">{brand.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Match Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl bg-primary/5 border border-primary/20 p-4 mb-5 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-sans font-semibold text-foreground text-sm">Shop My Style Formula</p>
            <p className="text-xs text-muted-foreground font-sans">
              {colorSeason ? `Matched to your ${colorSeason} palette` : "Personalized picks based on your DNA"}
            </p>
          </div>
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

        {/* Products */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-xl border border-border bg-card overflow-hidden group"
              >
                {/* Image */}
                <div className="aspect-[3/4] relative bg-secondary">
                  {!imgErrors.has(product.id) ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={() => setImgErrors(prev => new Set(prev).add(product.id))}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}

                  {/* Match score */}
                  <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-primary" />
                    <span className="text-[10px] font-bold text-foreground font-sans">{product.matchScore}%</span>
                  </div>

                  {/* Like */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleLike(product.id); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 transition-colors ${liked.has(product.id) ? "text-red-500 fill-red-500" : "text-foreground"}`}
                    />
                  </button>

                  {/* Shop overlay with compatibility check */}
                  <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <a
                      href={product.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-foreground text-background px-3 py-1.5 rounded-full text-xs font-sans font-semibold"
                    >
                      <ShoppingBag className="w-3 h-3" /> Shop Now
                    </a>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/chat?prefill=${encodeURIComponent(`Is this a good match for me? ${product.name} by ${product.brand} in ${product.color} (${product.category})`)}`);
                      }}
                      className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-sans font-semibold"
                    >
                      <Sparkles className="w-3 h-3" /> Check Match
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-[10px] text-muted-foreground font-sans uppercase tracking-wider">{product.brand}</p>
                  <p className="font-sans text-xs font-medium text-foreground mt-0.5 truncate">{product.name}</p>
              <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-sans font-bold text-sm text-foreground">{product.price}</span>
                      <span className="font-sans text-[10px] text-muted-foreground line-through">
                        ${(parseFloat(product.price.replace(/[^0-9.]/g, "")) * 1.35).toFixed(0)}
                      </span>
                    </div>
                    <a href={product.affiliateUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    </a>
                  </div>
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
        )}

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
              { label: "You're missing a statement coat", emoji: "🧥", count: 5, price: "€99" },
              { label: "Add a versatile pair of loafers", emoji: "👞", count: 3, price: "€79" },
              { label: "Complete looks with a quality belt", emoji: "⌚", count: 4, price: "€49" },
            ].map((gap, i) => (
              <button
                key={i}
                onClick={() => setActiveCategory(i === 0 ? "Outerwear" : i === 1 ? "Shoes" : "Accessories")}
                className="w-full flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left hover:border-primary/40 transition-colors"
              >
                <span className="text-xl">{gap.emoji}</span>
                <div className="flex-1">
                  <p className="font-sans text-xs font-medium text-foreground">{gap.label}</p>
                  <p className="text-[10px] text-muted-foreground font-sans">{gap.count} options from {gap.price}</p>
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
