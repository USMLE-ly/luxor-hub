import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import { motion } from "framer-motion";
import AuroraBackground from "@/components/ui/aurora-background";

interface ScrollExpandMediaProps {
  mediaType?: "video" | "image";
  mediaSrc: string;
  posterSrc?: string;
  bgImageSrc?: string;
  title?: string;
  scrollToExpand?: string;
  textBlend?: boolean;
  children?: ReactNode;
}

const ScrollExpandMedia = ({
  mediaType = "image",
  mediaSrc,
  posterSrc,
  title,
  scrollToExpand = "Scroll to explore",
  textBlend,
  children,
}: ScrollExpandMediaProps) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [, forceRender] = useState(0);

  // Use refs for scroll state to avoid re-registering listeners
  const progressRef = useRef(0);
  const expandedRef = useRef(false);
  const contentRef = useRef(false);
  const touchStartRef = useRef(0);

  useEffect(() => {
    progressRef.current = 0;
    expandedRef.current = false;
    contentRef.current = false;
    forceRender(n => n + 1);
  }, [mediaType]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const updateProgress = useCallback((newProgress: number) => {
    progressRef.current = newProgress;
    if (newProgress >= 1) {
      expandedRef.current = true;
      contentRef.current = true;
    } else if (newProgress < 0.75) {
      contentRef.current = false;
    }
    forceRender(n => n + 1);
  }, []);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (expandedRef.current && e.deltaY < 0 && window.scrollY <= 5) {
        expandedRef.current = false;
        forceRender(n => n + 1);
        e.preventDefault();
      } else if (!expandedRef.current) {
        e.preventDefault();
        const delta = e.deltaY * 0.0012;
        const next = Math.min(Math.max(progressRef.current + delta, 0), 1);
        updateProgress(next);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartRef.current - touchY;
      if (expandedRef.current && deltaY < -20 && window.scrollY <= 5) {
        expandedRef.current = false;
        forceRender(n => n + 1);
        e.preventDefault();
      } else if (!expandedRef.current) {
        e.preventDefault();
        const factor = deltaY < 0 ? 0.008 : 0.005;
        const next = Math.min(Math.max(progressRef.current + deltaY * factor, 0), 1);
        updateProgress(next);
        touchStartRef.current = touchY;
      }
    };

    const handleTouchEnd = () => { touchStartRef.current = 0; };
    const handleScroll = () => { if (!expandedRef.current) window.scrollTo(0, 0); };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [updateProgress]);

  const scrollProgress = progressRef.current;
  const showContent = contentRef.current;
  const mediaWidth = 500 + scrollProgress * (isMobile ? 450 : 1050);
  const mediaHeight = 400 + scrollProgress * (isMobile ? 200 : 400);
  const textTranslateX = scrollProgress * (isMobile ? 180 : 150);
  const firstWord = title ? title.split(" ")[0] : "";
  const restOfTitle = title ? title.split(" ").slice(1).join(" ") : "";

  return (
    <div className="overflow-x-hidden">
      <section className="relative flex flex-col items-center justify-start min-h-[100dvh]">
        <div className="relative w-full flex flex-col items-center min-h-[100dvh]">
          <motion.div
            className="absolute inset-0 z-0 h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 - scrollProgress * 0.5 }}
            transition={{ duration: 0.1 }}
          >
            <AuroraBackground />
            <div className="absolute inset-0 bg-background/10" />
          </motion.div>

          <div className="container mx-auto flex flex-col items-center justify-start relative z-10">
            <div className="flex flex-col items-center justify-center w-full h-[100dvh] relative">
              <div
                className="absolute z-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl will-change-[width,height]"
                style={{
                  width: `${mediaWidth}px`,
                  height: `${mediaHeight}px`,
                  maxWidth: "95vw",
                  maxHeight: "85vh",
                  boxShadow: "0px 0px 50px hsl(var(--foreground) / 0.15)",
                }}
              >
                {mediaType === "video" ? (
                  <div className="relative w-full h-full pointer-events-none">
                    {!videoLoaded && (
                      <div className="absolute inset-0 rounded-xl bg-muted animate-pulse flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                      </div>
                    )}
                    <video
                      src={mediaSrc}
                      poster={posterSrc}
                      autoPlay muted loop playsInline
                      onLoadedData={() => setVideoLoaded(true)}
                      className={`w-full h-full object-cover rounded-xl transition-opacity duration-500 ${videoLoaded ? "opacity-100" : "opacity-0"}`}
                    />
                    <motion.div
                      className="absolute inset-0 bg-background/30 rounded-xl"
                      animate={{ opacity: 0.5 - scrollProgress * 0.3 }}
                    />
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                    <img src={mediaSrc} alt={title || "Media content"} className="w-full h-full object-cover rounded-xl" />
                    <motion.div className="absolute inset-0 bg-background/50 rounded-xl" animate={{ opacity: 0.7 - scrollProgress * 0.3 }} />
                  </div>
                )}

                <div className="flex flex-col items-center text-center relative z-10 mt-4">
                  {scrollToExpand && (
                    <p className="text-sm text-muted-foreground font-medium" style={{ transform: `translateX(${textTranslateX}vw)` }}>
                      {scrollToExpand}
                    </p>
                  )}
                </div>
              </div>

              {title && (
                <div className={`flex items-center justify-center text-center gap-4 w-full relative z-10 flex-col ${textBlend ? "mix-blend-difference" : ""}`}>
                  <motion.h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground" style={{ transform: `translateX(-${textTranslateX}vw)` }}>
                    {firstWord}
                  </motion.h2>
                  <motion.h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground" style={{ transform: `translateX(${textTranslateX}vw)` }}>
                    {restOfTitle}
                  </motion.h2>
                </div>
              )}
            </div>

            <motion.section
              className="flex flex-col w-full px-8 py-10 md:px-16 lg:py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: showContent ? 1 : 0 }}
              transition={{ duration: 0.7 }}
            >
              {children}
            </motion.section>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ScrollExpandMedia;
