import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoldParticles } from "@/components/app/GoldParticles";
import {
  ContainerAnimated,
  ContainerInset,
  ContainerScroll,
  ContainerStagger,
} from "@/components/ui/hero-video";
import "@/components/ui/starfield.css";
import heroVideo from "@/assets/hero-video.mp4";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <>
    <ContainerScroll className="bg-background text-center overflow-hidden">
      {/* Starfield */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="starfield-layer starfield-small" />
        <div className="starfield-layer starfield-medium" />
        <div className="starfield-layer starfield-large" />
        <div className="shooting-star shooting-star-1" />
        <div className="shooting-star shooting-star-2" />
        <div className="shooting-star shooting-star-3" />
      </div>
      <GoldParticles />

      <ContainerStagger className="pt-24 md:pt-32 z-10">
        <ContainerAnimated animation="top">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
            Your AI Stylist That Actually Knows{" "}
            <span className="gold-text">Your Body</span>
          </h1>
        </ContainerAnimated>

        <ContainerAnimated animation="blur" className="mt-5">
          <p className="font-sans text-base md:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            Upload your closet. Get the perfect outfit every morning — weather-checked, calendar-aware, built from what you own.
          </p>
        </ContainerAnimated>

        <ContainerAnimated animation="blur" className="mt-3">
          <p className="font-sans text-sm text-muted-foreground/70">
            Trusted by 2,400+ members
          </p>
        </ContainerAnimated>

        <ContainerAnimated animation="bottom" className="flex flex-wrap justify-center gap-3 mt-5">
          <Button
            size="lg"
            className="text-base px-8 group"
            onClick={() => navigate("/auth")}
          >
            Try Free — No Card Needed
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="text-base text-muted-foreground"
            onClick={() =>
              document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })
            }
          >
            See How It Works
            <ChevronDown className="ml-1 w-4 h-4" />
          </Button>
        </ContainerAnimated>
      </ContainerStagger>

      <ContainerInset insetYRange={[20, 0]} insetXRange={[25, 0]} roundednessRange={[40, 16]} className="mx-4 md:mx-8 z-10">
        <video
          src={heroVideo}
          autoPlay
          loop
          muted
          playsInline
          className="relative z-10 block h-auto max-h-full w-full max-w-full object-contain align-middle"
        />
      </ContainerInset>

    </ContainerScroll>

    <div className="relative z-10 py-10 md:py-14 overflow-hidden bg-background border-t border-border/30">
      <p className="text-center text-[10px] md:text-xs font-sans text-muted-foreground/40 tracking-[0.25em] uppercase mb-5">
        As Featured In
      </p>
      <div className="relative flex overflow-hidden marquee-fade-mask" style={{ ["--gap" as string]: "3rem" }}>
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex shrink-0 animate-marquee gap-12 [--duration:20s]"
            aria-hidden={copy === 1 || undefined}
          >
            {["VOGUE", "GLAMOUR", "BAZAAR", "ELLE", "GQ", "WIRED", "ALLURE"].map((name) => (
              <span
                key={name}
                className="text-sm md:text-lg font-display tracking-[0.2em] text-muted-foreground/20 select-none whitespace-nowrap"
              >
                {name}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  </>
  );
};

export default Hero;
