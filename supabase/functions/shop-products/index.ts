import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Curated product database with real affiliate-style data
const productDatabase = [
  // Tops
  { id: "t1", name: "Merino Wool Crew Neck", brand: "Uniqlo", price: "€39.90", category: "Tops", color: "Navy", imageUrl: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=500&fit=crop", tags: ["Essential", "All Season"], affiliateUrl: "https://www.uniqlo.com" },
  { id: "t2", name: "Oxford Button-Down Shirt", brand: "Arket", price: "€59.00", category: "Tops", color: "Light Blue", imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=500&fit=crop", tags: ["Classic", "Workwear"], affiliateUrl: "https://www.arket.com" },
  { id: "t3", name: "Cashmere V-Neck Sweater", brand: "COS", price: "€89.00", category: "Tops", color: "Charcoal", imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=500&fit=crop", tags: ["Luxury", "Winter"], affiliateUrl: "https://www.cos.com" },
  { id: "t4", name: "Linen Camp Collar Shirt", brand: "Massimo Dutti", price: "€69.95", category: "Tops", color: "Ecru", imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop", tags: ["Summer", "Resort"], affiliateUrl: "https://www.massimodutti.com" },
  { id: "t5", name: "Heavyweight Cotton Tee", brand: "COS", price: "€29.00", category: "Tops", color: "Black", imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop", tags: ["Essential", "Layering"], affiliateUrl: "https://www.cos.com" },
  // Bottoms
  { id: "b1", name: "Slim Fit Chinos", brand: "COS", price: "€79.00", category: "Bottoms", color: "Khaki", imageUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=500&fit=crop", tags: ["Versatile", "Smart Casual"], affiliateUrl: "https://www.cos.com" },
  { id: "b2", name: "Tailored Wool Trousers", brand: "Zara", price: "€49.95", category: "Bottoms", color: "Charcoal", imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop", tags: ["Office", "Elevated"], affiliateUrl: "https://www.zara.com" },
  { id: "b3", name: "Straight Leg Jeans", brand: "Arket", price: "€69.00", category: "Bottoms", color: "Indigo", imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop", tags: ["Everyday", "Timeless"], affiliateUrl: "https://www.arket.com" },
  { id: "b4", name: "Relaxed Fit Corduroy", brand: "Uniqlo", price: "€39.90", category: "Bottoms", color: "Brown", imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=500&fit=crop", tags: ["Autumn", "Texture"], affiliateUrl: "https://www.uniqlo.com" },
  // Shoes
  { id: "s1", name: "Leather Chelsea Boots", brand: "Mango", price: "€129.00", category: "Shoes", color: "Dark Brown", imageUrl: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=400&h=500&fit=crop", tags: ["Investment", "Timeless"], affiliateUrl: "https://www.mango.com" },
  { id: "s2", name: "Minimalist Canvas Sneakers", brand: "Veja", price: "€115.00", category: "Shoes", color: "White", imageUrl: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=400&h=500&fit=crop", tags: ["Sustainable", "Casual"], affiliateUrl: "https://www.veja-store.com" },
  { id: "s3", name: "Penny Loafers", brand: "Massimo Dutti", price: "€99.95", category: "Shoes", color: "Burgundy", imageUrl: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400&h=500&fit=crop", tags: ["Smart Casual", "Versatile"], affiliateUrl: "https://www.massimodutti.com" },
  { id: "s4", name: "Suede Desert Boots", brand: "Clarks", price: "€89.00", category: "Shoes", color: "Sand", imageUrl: "https://images.unsplash.com/photo-1614252234498-1ab7ec5b1e7c?w=400&h=500&fit=crop", tags: ["Classic", "Autumn"], affiliateUrl: "https://www.clarks.com" },
  // Outerwear
  { id: "o1", name: "Wool Overcoat", brand: "Massimo Dutti", price: "€199.00", category: "Outerwear", color: "Camel", imageUrl: "https://images.unsplash.com/photo-1544923246-77307dd270cf?w=400&h=500&fit=crop", tags: ["Statement", "Winter"], affiliateUrl: "https://www.massimodutti.com" },
  { id: "o2", name: "Cotton Trench Coat", brand: "COS", price: "€175.00", category: "Outerwear", color: "Beige", imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop", tags: ["Classic", "Rain"], affiliateUrl: "https://www.cos.com" },
  { id: "o3", name: "Quilted Puffer Jacket", brand: "Arket", price: "€149.00", category: "Outerwear", color: "Black", imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop", tags: ["Warmth", "Urban"], affiliateUrl: "https://www.arket.com" },
  // Accessories
  { id: "a1", name: "Cashmere Scarf", brand: "COS", price: "€89.00", category: "Accessories", color: "Grey", imageUrl: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=400&h=500&fit=crop", tags: ["Luxury", "Gift Idea"], affiliateUrl: "https://www.cos.com" },
  { id: "a2", name: "Leather Belt", brand: "Massimo Dutti", price: "€49.95", category: "Accessories", color: "Dark Brown", imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop", tags: ["Essential", "Finishing Touch"], affiliateUrl: "https://www.massimodutti.com" },
  { id: "a3", name: "Minimalist Watch", brand: "Daniel Wellington", price: "€179.00", category: "Accessories", color: "Silver", imageUrl: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=500&fit=crop", tags: ["Statement", "Everyday"], affiliateUrl: "https://www.danielwellington.com" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category") || "All";
    const colorSeason = url.searchParams.get("colorSeason") || "";

    let filtered = productDatabase;
    if (category && category !== "All") {
      filtered = filtered.filter(p => p.category === category);
    }

    // Assign match scores based on color season compatibility
    const scored = filtered.map(p => {
      // Simple scoring algorithm based on color season + category
      let score = 80 + Math.floor(Math.random() * 18);
      // Boost scores for season-appropriate items
      if (colorSeason.toLowerCase().includes("winter") && p.tags.some(t => t.includes("Winter"))) score = Math.min(99, score + 5);
      if (colorSeason.toLowerCase().includes("summer") && p.tags.some(t => t.includes("Summer"))) score = Math.min(99, score + 5);
      if (p.tags.includes("Essential") || p.tags.includes("Timeless")) score = Math.min(99, score + 3);
      return { ...p, matchScore: score };
    });

    // Sort by match score
    scored.sort((a, b) => b.matchScore - a.matchScore);

    return new Response(JSON.stringify({ products: scored }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("shop-products error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
