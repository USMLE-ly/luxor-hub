import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SidePanelVideo, NativeVideo } from "@/components/ui/side-panel-video";
import { cn } from "@/lib/utils";
import featureDemo from "@/assets/feature-demo.mp4";

const Features = () => {
  const [videoOpen, setVideoOpen] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Auto-open on first scroll into view
  useEffect(() => {
    if (isInView && !videoOpen) {
      const timer = setTimeout(() => setVideoOpen(true), 400);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  const handleVideoOpen = () => setVideoOpen(!videoOpen);

  const renderVideoButton = (toggleFunction: () => void) => (
    <div
      className={cn(
        "flex items-center w-full justify-start pr-4 md:pl-4 py-1 md:py-1",
        videoOpen ? "pr-3" : ""
      )}
    >
      <p className="text-xl font-black tracking-tight sm:text-3xl">
        <span className="bg-gradient-to-t from-muted-foreground to-foreground bg-clip-text font-display text-xl font-bold text-transparent sm:text-5xl">
          Features
        </span>
      </p>
      <Button
        className="rounded-r-[33px] py-8 ml-2"
        onClick={toggleFunction}
        variant="secondary"
      >
        {videoOpen ? "close" : "open"}
      </Button>
    </div>
  );

  return (
    <section id="features" className="py-16 md:py-24 bg-muted/20" ref={sectionRef}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-10"
        >
          <p className="font-sans text-sm font-semibold text-primary tracking-widest uppercase mb-3">Features</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            Every Fashion Tool You Need.{" "}
            <span className="gold-text">One App.</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-sm text-muted-foreground leading-relaxed">
            From AI outfit analysis to trend forecasting, wardrobe management to virtual try-on — LEXOR® combines every fashion styling feature into a single intelligent platform.
          </p>
        </motion.div>

        {/* Side Panel Video */}
        <div className="min-h-[120px] flex flex-col justify-center">
          <SidePanelVideo
            panelOpen={videoOpen}
            handlePanelOpen={handleVideoOpen}
            renderButton={renderVideoButton}
          >
            <NativeVideo
              videoOpen={videoOpen}
              src={featureDemo}
            />
          </SidePanelVideo>
        </div>
      </div>
    </section>
  );
};

export default Features;
