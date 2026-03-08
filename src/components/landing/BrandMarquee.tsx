import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";

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

const row1 = brands;
const row2 = [...brands].reverse();

function MarqueeRow({ items, direction = "left", baseSpeed = 30 }: { items: typeof brands; direction?: "left" | "right"; baseSpeed?: number }) {
  const duplicated = [...items, ...items, ...items];

  return (
    <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <motion.div
        className="flex shrink-0 gap-6"
        animate={{ x: direction === "left" ? [0, -(items.length * 140)] : [-(items.length * 140), 0] }}
        transition={{ duration: baseSpeed, ease: "linear", repeat: Infinity }}
      >
        {duplicated.map((brand, i) => (
          <div
            key={`${brand.name}-${i}`}
            className="relative flex flex-col items-center gap-2 group cursor-default shrink-0"
            style={{ width: "116px" }}
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border border-border bg-card p-1.5 group-hover:border-primary/40 group-hover:scale-110 transition-all duration-300">
              <img
                src={brand.img}
                alt={brand.name}
                className="w-full h-full object-cover rounded-xl grayscale group-hover:grayscale-0 transition-all duration-500"
                loading="lazy"
              />
            </div>
            {/* Glassmorphic tooltip on hover */}
            <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10">
              <div className="px-3 py-1 rounded-lg bg-card/80 backdrop-blur-md border border-border text-[10px] font-sans font-semibold text-foreground whitespace-nowrap shadow-lg">
                {brand.name}
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

const BrandMarquee = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const rawVelocity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const smoothVelocity = useSpring(rawVelocity, { stiffness: 100, damping: 30 });
  const tilt = useTransform(smoothVelocity, [0, 1], [0.5, -0.5]);

  return (
    <section ref={sectionRef} className="py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-10 text-center">
        <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Works with brands you love
        </p>
      </div>

      <motion.div style={{ perspective: 800 }} className="space-y-6">
        <motion.div style={{ rotateX: tilt }}>
          <MarqueeRow items={row1} direction="left" baseSpeed={35} />
        </motion.div>
        <motion.div style={{ rotateX: tilt }}>
          <MarqueeRow items={row2} direction="right" baseSpeed={40} />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default BrandMarquee;
