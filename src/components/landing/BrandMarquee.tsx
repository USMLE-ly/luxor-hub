import { Marquee } from "@/components/ui/marquee";
import { Star } from "lucide-react";

import brandChanel from "@/assets/brand-chanel.jpg";
import brandCos from "@/assets/brand-cos.jpg";
import brandFendi from "@/assets/brand-fendi.jpg";
import brandGanni from "@/assets/brand-ganni.jpg";
import brandGap from "@/assets/brand-gap.jpg";
import brandGucci from "@/assets/brand-gucci.jpg";
import brandHm from "@/assets/brand-hm.jpg";
import brandIsabel from "@/assets/brand-isabelmarant.jpg";
import brandMango from "@/assets/brand-mango.jpg";
import brandReformation from "@/assets/brand-reformation.jpg";
import brandValentino from "@/assets/brand-valentino.jpg";
import brandZara from "@/assets/brand-zara.jpg";

const brands = [
  { name: "Chanel", img: brandChanel },
  { name: "COS", img: brandCos },
  { name: "Fendi", img: brandFendi },
  { name: "Ganni", img: brandGanni },
  { name: "GAP", img: brandGap },
  { name: "Gucci", img: brandGucci },
  { name: "H&M", img: brandHm },
  { name: "Isabel Marant", img: brandIsabel },
  { name: "Mango", img: brandMango },
  { name: "Reformation", img: brandReformation },
  { name: "Valentino", img: brandValentino },
  { name: "Zara", img: brandZara },
];

const reviews = [
  { name: "Sarah M.", body: "This app completely transformed how I get dressed every morning. My style score went from 62 to 91!", rating: 5 },
  { name: "James K.", body: "The AI styling suggestions are scarily accurate. It knows my taste better than I do.", rating: 5 },
  { name: "Priya R.", body: "Finally an app that understands body types and color theory. Game changer for my wardrobe.", rating: 5 },
  { name: "Alex T.", body: "I've saved hundreds on impulse buys since using the closet analytics. Worth every penny.", rating: 5 },
  { name: "Luna C.", body: "The outfit generator paired with my actual closet items is pure magic. I feel like I have a personal stylist.", rating: 5 },
  { name: "Marcus D.", body: "Clean design, smart recommendations, and the calibration process is actually fun.", rating: 4 },
];

const ReviewCard = ({ name, body, rating }: typeof reviews[0]) => (
  <div className="w-72 shrink-0 rounded-2xl border border-border bg-card p-5 flex flex-col gap-3 hover-lift">
    <div className="flex items-center gap-1">
      {Array.from({ length: rating }).map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
      ))}
    </div>
    <p className="text-sm font-sans text-foreground leading-relaxed">{body}</p>
    <p className="text-xs font-sans font-semibold text-muted-foreground">{name}</p>
  </div>
);

const BrandMarquee = () => {
  return (
    <section className="py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
          Trusted by fashion lovers worldwide
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
          Brands We <span className="gold-shimmer">Love</span>
        </h2>
      </div>

      {/* Brand logos marquee */}
      <Marquee pauseOnHover className="[--duration:30s] mb-16">
        {brands.map((brand) => (
          <div
            key={brand.name}
            className="mx-6 flex flex-col items-center gap-2 group cursor-default"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border border-border bg-card p-1 group-hover:border-primary/40 transition-colors">
              <img
                src={brand.img}
                alt={brand.name}
                className="w-full h-full object-cover rounded-xl grayscale group-hover:grayscale-0 transition-all duration-300"
              />
            </div>
            <span className="text-[10px] font-sans font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {brand.name}
            </span>
          </div>
        ))}
      </Marquee>

      {/* Reviews marquee */}
      <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
        <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
          What our users say
        </p>
      </div>

      <Marquee pauseOnHover className="[--duration:45s] mb-4">
        {reviews.map((review, i) => (
          <ReviewCard key={i} {...review} />
        ))}
      </Marquee>

      <Marquee pauseOnHover reverse className="[--duration:45s]">
        {[...reviews].reverse().map((review, i) => (
          <ReviewCard key={i} {...review} />
        ))}
      </Marquee>
    </section>
  );
};

export default BrandMarquee;
