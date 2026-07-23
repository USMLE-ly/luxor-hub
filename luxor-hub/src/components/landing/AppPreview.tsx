import { ContainerScroll } from "@/components/ui/container-scroll";
import { Diamond } from "@phosphor-icons/react";
import outfitGen from "@/assets/feature-outfit-gen.jpg";

const AppPreview = () => {
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
          </div>
        }
      >
        <div className="h-full w-full overflow-hidden rounded-xl">
          <img
            src={outfitGen}
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
