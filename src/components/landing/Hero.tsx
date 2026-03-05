import { motion } from "framer-motion";
import { Sparkles, Zap, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import MagneticButton from "@/components/ui/magnetic-button";

/* ── Image imports for marquee rows ──────────────────────────── */
import imgCoatBelted from "@/assets/cal-f-coat-belted.jpg";
import imgCoatElegant from "@/assets/cal-f-coat-elegant.jpg";
import imgCoatTrench from "@/assets/cal-f-coat-trench.jpg";
import imgDressMidi from "@/assets/cal-f-dress-midi.jpg";
import imgDressMini from "@/assets/cal-f-dress-mini.jpg";
import imgDressMaxi from "@/assets/cal-f-dress-maxi.jpg";
import imgJeansFlare from "@/assets/cal-f-jeans-flare.jpg";
import imgJeansWide from "@/assets/cal-f-jeans-wide.jpg";
import imgPantsTailored from "@/assets/cal-f-pants-tailored.jpg";
import imgPantsWide from "@/assets/cal-f-pants-wide.jpg";
import imgShirtClassic from "@/assets/cal-f-shirt-classic.jpg";
import imgShirtRuffle from "@/assets/cal-f-shirt-ruffle.jpg";
import imgTopCami from "@/assets/cal-f-top-cami.jpg";
import imgTopRuffle from "@/assets/cal-f-top-ruffle.jpg";
import imgSkirtMidi from "@/assets/cal-f-skirt-midi.jpg";
import imgSkirtPleated from "@/assets/cal-f-skirt-pleated.jpg";
import imgShoeHeels from "@/assets/cal-f-shoe-heels.jpg";
import imgShoeBoots from "@/assets/cal-f-shoe-boots.jpg";
import imgSunglassesCateye from "@/assets/cal-f-sunglasses-cateye.jpg";
import imgSunglassesOversized from "@/assets/cal-f-sunglasses-oversized.jpg";
import imgTshirtGraphic from "@/assets/cal-f-tshirt-graphic.jpg";
import imgTshirtOversized from "@/assets/cal-f-tshirt-oversized.jpg";
import imgAccBag from "@/assets/cal-f-acc-bag.jpg";
import imgAccJewelry from "@/assets/cal-f-acc-jewelry.jpg";

const row1 = [imgCoatBelted, imgDressMidi, imgShirtClassic, imgJeansFlare, imgTopCami, imgSkirtMidi, imgShoeHeels, imgSunglassesCateye, imgTshirtGraphic, imgAccBag, imgPantsTailored, imgDressMaxi];
const row2 = [imgCoatElegant, imgDressMini, imgShirtRuffle, imgJeansWide, imgTopRuffle, imgSkirtPleated, imgShoeBoots, imgSunglassesOversized, imgTshirtOversized, imgAccJewelry, imgPantsWide, imgCoatTrench];

/* ── Marquee row component ───────────────────────────────────── */
function MarqueeRow({ images, direction = "left", speed = 40 }: { images: string[]; direction?: "left" | "right"; speed?: number }) {
  const doubled = [...images, ...images];
  const totalWidth = images.length * 220; // approx width per card
  return (
    <div className="relative overflow-hidden w-full">
      <motion.div
        className="flex gap-3"
        animate={{ x: direction === "left" ? [0, -totalWidth] : [-totalWidth, 0] }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((src, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[180px] h-[240px] md:w-[200px] md:h-[270px] rounded-2xl overflow-hidden border border-border/30 shadow-lg"
          >
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Aurora glow layers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-primary/8 rounded-full blur-[180px]" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-[hsl(43,74%,49%)]/6 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[350px] h-[350px] bg-[hsl(270,40%,50%)]/5 rounded-full blur-[120px]" />
      </div>

      {/* ── Photo Marquee Rows ──────────────────────────────── */}
      <div className="absolute inset-0 flex flex-col justify-center gap-3 opacity-[0.18] pointer-events-none">
        <MarqueeRow images={row1} direction="left" speed={50} />
        <MarqueeRow images={row2} direction="right" speed={55} />
        <MarqueeRow images={[...row1].reverse()} direction="left" speed={45} />
      </div>

      {/* Gradient overlay on top of photos */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background/80 pointer-events-none" />

      {/* ── Hero Content ───────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-primary font-medium font-sans">
              <Sparkles className="w-4 h-4" />
              AI-Powered Personal Styling
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-8"
          >
            Your AI Stylist That{" "}
            <span className="gold-shimmer relative">
              Knows You
            </span>{" "}
            Better
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-base md:text-xl text-muted-foreground max-w-xl mb-12 font-sans mx-auto"
          >
            Upload your wardrobe. Get daily AI-curated outfits. Shop smarter. Look unstoppable — every single day.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <MagneticButton onClick={() => navigate("/auth")} strength={0.25}>
              <RainbowButton className="px-8 py-3 text-lg font-display font-semibold pointer-events-none">
                <Sparkles className="w-5 h-5 mr-2" />
                Start Free
              </RainbowButton>
            </MagneticButton>
            <MagneticButton
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              strength={0.2}
            >
              <InteractiveHoverButton
                text="How It Works"
                className="w-40 border-border pointer-events-none"
              />
            </MagneticButton>
          </motion.div>

          {/* Social proof badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-3 mt-10"
          >
            <motion.span
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs font-sans font-medium text-muted-foreground"
            >
              <Users className="w-3 h-3 text-primary" /> 10K+ Users
            </motion.span>
            <motion.span
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs font-sans font-medium text-muted-foreground"
            >
              <Zap className="w-3 h-3 text-primary" /> AI-Powered
            </motion.span>
            <motion.span
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs font-sans font-medium text-muted-foreground"
            >
              <Sparkles className="w-3 h-3 text-primary" /> 98% Satisfaction
            </motion.span>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};

export default Hero;
