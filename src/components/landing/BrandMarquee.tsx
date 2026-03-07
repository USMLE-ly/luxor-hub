import { Marquee } from "@/components/ui/marquee";

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

const BrandMarquee = () => {
  return (
    <section className="py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-10 text-center">
        <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Works with brands you love
        </p>
      </div>

      <Marquee pauseOnHover className="[--duration:35s]">
        {brands.map((brand) => (
          <div
            key={brand.name}
            className="mx-8 flex flex-col items-center gap-2 group cursor-default"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border border-border bg-card p-1.5 group-hover:border-primary/40 transition-colors duration-300">
              <img
                src={brand.img}
                alt={brand.name}
                className="w-full h-full object-cover rounded-xl grayscale group-hover:grayscale-0 transition-all duration-500"
                loading="lazy"
              />
            </div>
            <span className="text-[11px] font-sans font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
              {brand.name}
            </span>
          </div>
        ))}
      </Marquee>
    </section>
  );
};

export default BrandMarquee;
