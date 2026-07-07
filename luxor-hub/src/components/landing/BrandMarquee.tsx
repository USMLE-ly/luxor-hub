const brands = [
  { name: "Zara", src: "/logos/zara.png" },
  { name: "ASOS", src: "/logos/asos.png" },
  { name: "Shopify", src: "/logos/shopify.png" },
  { name: "Pinterest", src: "/logos/pinterest.png" },
  { name: "Instagram", src: "/logos/instagram.png" },
  { name: "TikTok", src: "/logos/tiktok.png" },
];

const BrandMarquee = () => (
  <section className="py-16 border-y border-border overflow-hidden">
    <p className="text-center text-xs font-sans text-muted-foreground tracking-widest uppercase mb-8">
      Trusted By Leading Brands
    </p>
    <div className="relative flex overflow-hidden marquee-fade-mask">
      <div className="flex shrink-0 animate-marquee items-center [--duration:35s]">
        {brands.map((b, i) => (
          <div
            key={`a-${b.name}-${i}`}
            className="flex items-center justify-center w-[140px] mx-6 shrink-0"
          >
            <img
              src={b.src}
              alt={b.name}
              className="h-7 w-auto max-w-[120px] object-contain opacity-40 hover:opacity-70 transition-opacity grayscale hover:grayscale-0"
            />
          </div>
        ))}
      </div>
      <div className="flex shrink-0 animate-marquee items-center [--duration:35s]" aria-hidden="true">
        {brands.map((b, i) => (
          <div
            key={`b-${b.name}-${i}`}
            className="flex items-center justify-center w-[140px] mx-6 shrink-0"
          >
            <img
              src={b.src}
              alt=""
              className="h-7 w-auto max-w-[120px] object-contain opacity-40 hover:opacity-70 transition-opacity grayscale hover:grayscale-0"
            />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default BrandMarquee;
