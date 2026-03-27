import { Component as HorizonHero } from "@/components/ui/horizon-hero-section";

const Hero = () => {
  return (
    <>
      <HorizonHero />

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
