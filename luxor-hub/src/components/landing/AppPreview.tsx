import { useNavigate } from "react-router-dom";
import { ContainerScroll } from "@/components/ui/container-scroll";
import { GradientButton } from "@/components/ui/gradient-button";
import { Diamond } from "@phosphor-icons/react";
import heroAppMockup from "@/assets/hero-app-mockup.jpg";

const AppPreview = () => {
  const navigate = useNavigate();
  return (
    <section className="relative overflow-hidden bg-background">
      <ContainerScroll
        titleComponent={
          <div className="flex flex-col items-center gap-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-sans font-medium tracking-wide">
              <Diamond className="w-4 h-4" /> App Preview
            </span>
            <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight">
              Your Style Command Center
            </h2>
            <p className="text-muted-foreground font-sans text-lg max-w-2xl">
              Everything you need to master your personal style — powered by AI, designed for you.
            </p>
            <GradientButton onClick={() => navigate("/auth")} className="mt-2">
              <Diamond className="w-4 h-4 mr-2" />
              Try Free — No Card Needed
            </GradientButton>
          </div>
        }
      >
        {/* App mockup image */}
        <div className="h-full w-full overflow-hidden rounded-xl">
          <img
            src={heroAppMockup}
            alt="Luxor App Preview"
            className="w-full h-full object-cover object-top"
            loading="lazy"
          />
        </div>
      </ContainerScroll>
    </section>
  );
};

export default AppPreview;
