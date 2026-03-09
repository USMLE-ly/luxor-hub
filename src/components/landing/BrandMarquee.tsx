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
    <p className="text-center text-xs font-sans text-muted-foreground tracking-widest uppercase mb-6">
      Integrated With
    </p>
    <div className="relative flex overflow-hidden" style={{ ["--gap" as string]: "5rem" }}>
      <div className="flex shrink-0 animate-marquee gap-20 [--duration:25s]">
        {brands.map((b, i) => (
          <img
            key={`a-${b.name}-${i}`}
            src={b.src}
            alt={b.name}
            className="h-8 w-auto opacity-40 hover:opacity-70 transition-opacity grayscale hover:grayscale-0 shrink-0"
          />
        ))}
      </div>
      <div className="flex shrink-0 animate-marquee gap-12 [--duration:25s]" aria-hidden="true">
        {brands.map((b, i) => (
          <img
            key={`b-${b.name}-${i}`}
            src={b.src}
            alt=""
            className="h-8 w-auto opacity-40 hover:opacity-70 transition-opacity grayscale hover:grayscale-0 shrink-0"
          />
        ))}
      </div>
    </div>
  </section>
);

export default BrandMarquee;
