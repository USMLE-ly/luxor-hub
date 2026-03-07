import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const productDatabase = [
  { id: "t1", name: "Merino Wool Crew Neck", brand: "Uniqlo", price: "€39.90", category: "Tops", color: "Navy", imageUrl: "/products/merino-wool-crew.jpg", tags: ["Essential", "All Season"], affiliateUrl: "https://www.uniqlo.com", colorFamily: "cool", style: "classic" },
  { id: "t2", name: "Oxford Button-Down Shirt", brand: "Arket", price: "€59.00", category: "Tops", color: "Light Blue", imageUrl: "/products/oxford-shirt.jpg", tags: ["Classic", "Workwear"], affiliateUrl: "https://www.arket.com", colorFamily: "cool", style: "classic" },
  { id: "t3", name: "Cashmere V-Neck Sweater", brand: "COS", price: "€89.00", category: "Tops", color: "Charcoal", imageUrl: "/products/cashmere-vneck.jpg", tags: ["Luxury", "Winter"], affiliateUrl: "https://www.cos.com", colorFamily: "neutral", style: "minimalist" },
  { id: "t4", name: "Linen Camp Collar Shirt", brand: "Massimo Dutti", price: "€69.95", category: "Tops", color: "Ecru", imageUrl: "/products/linen-camp-shirt.jpg", tags: ["Summer", "Resort"], affiliateUrl: "https://www.massimodutti.com", colorFamily: "warm", style: "relaxed" },
  { id: "t5", name: "Heavyweight Cotton Tee", brand: "COS", price: "€29.00", category: "Tops", color: "Black", imageUrl: "/products/cotton-tee.jpg", tags: ["Essential", "Layering"], affiliateUrl: "https://www.cos.com", colorFamily: "neutral", style: "minimalist" },
  { id: "b1", name: "Slim Fit Chinos", brand: "COS", price: "€79.00", category: "Bottoms", color: "Khaki", imageUrl: "/products/slim-chinos.jpg", tags: ["Versatile", "Smart Casual"], affiliateUrl: "https://www.cos.com", colorFamily: "warm", style: "classic" },
  { id: "b2", name: "Tailored Wool Trousers", brand: "Zara", price: "€49.95", category: "Bottoms", color: "Charcoal", imageUrl: "/products/wool-trousers.jpg", tags: ["Office", "Elevated"], affiliateUrl: "https://www.zara.com", colorFamily: "neutral", style: "classic" },
  { id: "b3", name: "Straight Leg Jeans", brand: "Arket", price: "€69.00", category: "Bottoms", color: "Indigo", imageUrl: "/products/straight-jeans.jpg", tags: ["Everyday", "Timeless"], affiliateUrl: "https://www.arket.com", colorFamily: "cool", style: "classic" },
  { id: "b4", name: "Relaxed Fit Corduroy", brand: "Uniqlo", price: "€39.90", category: "Bottoms", color: "Brown", imageUrl: "/products/corduroy-pants.jpg", tags: ["Autumn", "Texture"], affiliateUrl: "https://www.uniqlo.com", colorFamily: "warm", style: "relaxed" },
  { id: "s1", name: "Leather Chelsea Boots", brand: "Mango", price: "€129.00", category: "Shoes", color: "Dark Brown", imageUrl: "/products/chelsea-boots.jpg", tags: ["Investment", "Timeless"], affiliateUrl: "https://www.mango.com", colorFamily: "warm", style: "classic" },
  { id: "s2", name: "Minimalist Canvas Sneakers", brand: "Veja", price: "€115.00", category: "Shoes", color: "White", imageUrl: "/products/canvas-sneakers.jpg", tags: ["Sustainable", "Casual"], affiliateUrl: "https://www.veja-store.com", colorFamily: "neutral", style: "minimalist" },
  { id: "s3", name: "Penny Loafers", brand: "Massimo Dutti", price: "€99.95", category: "Shoes", color: "Burgundy", imageUrl: "/products/penny-loafers.jpg", tags: ["Smart Casual", "Versatile"], affiliateUrl: "https://www.massimodutti.com", colorFamily: "cool", style: "classic" },
  { id: "s4", name: "Suede Desert Boots", brand: "Clarks", price: "€89.00", category: "Shoes", color: "Sand", imageUrl: "/products/desert-boots.jpg", tags: ["Classic", "Autumn"], affiliateUrl: "https://www.clarks.com", colorFamily: "warm", style: "classic" },
  { id: "o1", name: "Wool Overcoat", brand: "Massimo Dutti", price: "€199.00", category: "Outerwear", color: "Camel", imageUrl: "/products/wool-overcoat.jpg", tags: ["Statement", "Winter"], affiliateUrl: "https://www.massimodutti.com", colorFamily: "warm", style: "classic" },
  { id: "o2", name: "Cotton Trench Coat", brand: "COS", price: "€175.00", category: "Outerwear", color: "Beige", imageUrl: "/products/trench-coat.jpg", tags: ["Classic", "Rain"], affiliateUrl: "https://www.cos.com", colorFamily: "warm", style: "classic" },
  { id: "o3", name: "Quilted Puffer Jacket", brand: "Arket", price: "€149.00", category: "Outerwear", color: "Black", imageUrl: "/products/puffer-jacket.jpg", tags: ["Warmth", "Urban"], affiliateUrl: "https://www.arket.com", colorFamily: "neutral", style: "minimalist" },
  { id: "a1", name: "Cashmere Scarf", brand: "COS", price: "€89.00", category: "Accessories", color: "Grey", imageUrl: "/products/cashmere-scarf.jpg", tags: ["Luxury", "Gift Idea"], affiliateUrl: "https://www.cos.com", colorFamily: "neutral", style: "minimalist" },
  { id: "a2", name: "Leather Belt", brand: "Massimo Dutti", price: "€49.95", category: "Accessories", color: "Dark Brown", imageUrl: "/products/leather-belt.jpg", tags: ["Essential", "Finishing Touch"], affiliateUrl: "https://www.massimodutti.com", colorFamily: "warm", style: "classic" },
  { id: "a3", name: "Minimalist Watch", brand: "Daniel Wellington", price: "€179.00", category: "Accessories", color: "Silver", imageUrl: "/products/minimalist-watch.jpg", tags: ["Statement", "Everyday"], affiliateUrl: "https://www.danielwellington.com", colorFamily: "cool", style: "minimalist" },
];

// Color season to color family compatibility map
const seasonColorMap: Record<string, string[]> = {
  "deep winter": ["cool", "neutral"],
  "cold winter": ["cool", "neutral"],
  "bright winter": ["cool", "neutral"],
  "light spring": ["warm", "neutral"],
  "warm spring": ["warm"],
  "bright spring": ["warm", "neutral"],
  "light summer": ["cool", "neutral"],
  "soft summer": ["cool", "neutral", "warm"],
  "cool summer": ["cool", "neutral"],
  "soft autumn": ["warm", "neutral"],
  "warm autumn": ["warm"],
  "deep autumn": ["warm", "neutral"],
};

// Archetype to style compatibility
const archetypeStyleMap: Record<string, string[]> = {
  "classic": ["classic", "minimalist"],
  "minimalist": ["minimalist", "classic"],
  "romantic": ["relaxed", "classic"],
  "dramatic": ["classic", "minimalist"],
  "natural": ["relaxed", "classic"],
  "creative": ["relaxed", "minimalist"],
  "rebel": ["minimalist", "relaxed"],
  "elegant": ["classic", "minimalist"],
};

function computeMatchScore(product: typeof productDatabase[0], colorSeason: string, bodyShape: string, archetype: string, closetCategories: string[]): number {
  let score = 60; // baseline

  // Color compatibility (40% weight)
  const seasonKey = colorSeason.toLowerCase();
  const compatibleFamilies = seasonColorMap[seasonKey] || ["neutral"];
  if (compatibleFamilies.includes(product.colorFamily)) {
    score += 16; // strong match
  } else {
    score += 4; // partial
  }

  // Style archetype fit (30% weight)
  const archetypeKey = archetype?.toLowerCase() || "";
  const compatibleStyles = archetypeStyleMap[archetypeKey] || ["classic"];
  if (compatibleStyles.includes(product.style)) {
    score += 12;
  } else {
    score += 4;
  }

  // Wardrobe gap fill (30% weight)
  const productCatLower = product.category.toLowerCase();
  const catCount = closetCategories.filter(c => c.toLowerCase() === productCatLower).length;
  if (catCount === 0) {
    score += 12; // fills a gap
  } else if (catCount < 3) {
    score += 8; // still useful
  } else {
    score += 3; // already well-covered
  }

  // Bonus for essentials/timeless
  if (product.tags.includes("Essential") || product.tags.includes("Timeless")) score += 3;

  return Math.min(99, Math.max(50, score));
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    
    // Support both GET (query params) and POST (body)
    let category = "All", colorSeason = "", bodyShape = "", archetype = "", closetCategories: string[] = [];
    
    if (req.method === "POST") {
      try {
        const body = await req.json();
        category = body.category || "All";
        colorSeason = body.colorSeason || "";
        bodyShape = body.bodyShape || "";
        archetype = body.archetype || "";
        closetCategories = (body.closetCategories || "").split?.(",")?.filter?.(Boolean) || [];
      } catch { /* fallback to query params */ }
    }
    
    if (!colorSeason) {
      category = url.searchParams.get("category") || category;
      colorSeason = url.searchParams.get("colorSeason") || "";
      bodyShape = url.searchParams.get("bodyShape") || "";
      archetype = url.searchParams.get("archetype") || "";
      closetCategories = (url.searchParams.get("closetCategories") || "").split(",").filter(Boolean);
    }

    let filtered = productDatabase;
    if (category && category !== "All") {
      filtered = filtered.filter(p => p.category === category);
    }

    const scored = filtered.map(p => ({
      ...p,
      matchScore: computeMatchScore(p, colorSeason, bodyShape, archetype, closetCategories),
    }));

    scored.sort((a, b) => b.matchScore - a.matchScore);

    return new Response(JSON.stringify({ products: scored }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("shop-products error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
