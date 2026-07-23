import React, { useRef, useState, useEffect, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { motion } from "framer-motion";
import { Play, Pause, SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";

const videos = [
  { src: "/videos/howto-1.mp4", poster: "/images/feature-demo-poster.jpg", title: "How to Upload — Step 1", alt: "Upload tutorial part 1" },
  { src: "/videos/howto-2.mp4", poster: "/images/closet-demo-poster.jpg", title: "How to Upload — Step 2", alt: "Upload tutorial part 2" },
  { src: "/videos/howto-3.mp4", poster: "/images/analysis-demo-poster.jpg", title: "How to Upload — Step 3", alt: "Upload tutorial part 3" },
];

export const CardCarousel: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [playingIdx, setPlayingIdx] = useState<number | null>(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const swiperRef = useRef<any>(null);

  const togglePlay = useCallback((idx: number) => {
    const video = videoRefs.current[idx];
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setPlayingIdx(idx);
    } else {
      video.pause();
      setPlayingIdx(null);
    }
  }, []);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted((prev) => {
      const next = !prev;
      videoRefs.current.forEach((v) => { if (v) v.muted = next; });
      return next;
    });
  }, []);

  const handleSlideChange = useCallback((swiper: any) => {
    const newIdx = swiper.realIndex;
    setActiveIdx(newIdx);
    videoRefs.current.forEach((v, i) => {
      if (v) {
        if (i === newIdx) {
          v.currentTime = 0;
          v.play().catch(() => {});
          setPlayingIdx(i);
        } else {
          v.pause();
        }
      }
    });
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((v) => {
      if (v) v.muted = isMuted;
    });
  }, [isMuted]);

  const swiperCSS = `
    .card-swiper { width: 100%; padding-bottom: 50px; }
    .card-swiper .swiper-slide { transition: transform 0.5s cubic-bezier(0.23,1,0.32,1), opacity 0.5s ease; }
    .card-swiper .swiper-slide-active { transform: scale(1.08); z-index: 10; }
    .card-swiper .swiper-slide-prev,
    .card-swiper .swiper-slide-next { opacity: 0.6; }
    .card-swiper .swiper-slide:not(.swiper-slide-active):not(.swiper-slide-prev):not(.swiper-slide-next) { opacity: 0.3; }
    .card-swiper .swiper-pagination-bullet { background: hsl(43 74% 49% / 0.4) !important; opacity: 0.5 !important; }
    .card-swiper .swiper-pagination-bullet-active { background: hsl(43 74% 49%) !important; opacity: 1 !important; }
    .card-swiper .swiper-button-next,
    .card-swiper .swiper-button-prev { color: hsl(43 74% 49%) !important; }
    .card-swiper .swiper-slide > div { aspect-ratio: 9/16; }
  `;

  return (
    <div className="relative w-full">
      <style>{swiperCSS}</style>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleMute}
        className="absolute top-3 right-3 z-30 w-10 h-10 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center border border-border/30 hover:bg-background/90 transition"
        aria-label={isMuted ? "Unmute all" : "Mute all"}
      >
        {isMuted ? <SpeakerSlash className="w-4 h-4 text-foreground" /> : <SpeakerHigh className="w-4 h-4 text-foreground" />}
      </motion.button>

      <Swiper
        slidesPerView={1.3}
        centeredSlides
        spaceBetween={16}
        grabCursor
        loop={false}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        onSlideChange={handleSlideChange}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          swiper.update();
          setTimeout(() => {
            const v = videoRefs.current[0];
            if (v) { v.play().catch(() => {}); setPlayingIdx(0); }
          }, 300);
        }}
        modules={[Autoplay, Pagination, Navigation]}
        className="card-swiper w-full"
      >
        {videos.map((v, i) => (
          <SwiperSlide key={i}>
            <div className="relative rounded-2xl overflow-hidden border border-border/30 bg-card/40 backdrop-blur-sm shadow-xl group" style={{ aspectRatio: '9/16' }}>
              <div className="absolute inset-0 bg-background/80 z-0" />

              <video
                ref={(el) => { videoRefs.current[i] = el; }}
                src={v.src}
                autoPlay
                muted={isMuted}
                loop
                playsInline
                preload="auto"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }}
              />

              <div className="absolute inset-0 flex items-center justify-center bg-background/20 transition-opacity" style={{ zIndex: 2 }}>
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => togglePlay(i)}
                  className="w-16 h-16 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-[0_0_30px_hsl(43_74%_49%/0.4)]"
                >
                  {playingIdx === i ? (
                    <Pause className="w-6 h-6 text-primary-foreground" fill="currentColor" />
                  ) : (
                    <Play className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" />
                  )}
                </motion.button>
              </div>

              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-background/90 to-transparent p-4 pt-12" style={{ zIndex: 2 }}>
                <p className="font-sans text-sm font-semibold text-foreground">{v.title}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
