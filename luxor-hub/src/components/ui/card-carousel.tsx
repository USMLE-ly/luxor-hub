import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { motion } from "framer-motion";
import { Play, Pause, SpeakerHigh, SpeakerSlash, Spinner } from "@phosphor-icons/react";

import howto1 from "@/assets/videos/howto-1.mp4";
import howto2 from "@/assets/videos/howto-2.mp4";
import howto3 from "@/assets/videos/howto-3.mp4";

const videos = [
  { src: howto1, title: "How to Refinish — Step 1", alt: "Refinishing tutorial part 1" },
  { src: howto2, title: "How to Refinish — Step 2", alt: "Refinishing tutorial part 2" },
  { src: howto3, title: "How to Refinish — Step 3", alt: "Refinishing tutorial part 3" },
];

export const CardCarousel: React.FC = () => {
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [mutedMap, setMutedMap] = useState<Record<number, boolean>>({});
  const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const togglePlay = (idx: number) => {
    const video = videoRefs.current[idx];
    if (!video) return;
    if (video.paused) {
      video.play();
      setPlayingIdx(idx);
    } else {
      video.pause();
      setPlayingIdx(null);
    }
  };

  const toggleMute = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRefs.current[idx];
    if (!video) return;
    video.muted = !video.muted;
    setMutedMap((prev) => ({ ...prev, [idx]: video.muted }));
  };

  const swiperCSS = `
    .swiper {
      width: 100%;
      padding-bottom: 50px;
    }
    .swiper-slide {
      background-position: center;
      background-size: cover;
      width: 300px;
      transition: transform 0.4s ease;
    }
    .swiper-slide-active {
      transform: scale(1.08);
      z-index: 10;
    }
    .swiper-slide:not(.swiper-slide-active) {
      opacity: 0.5;
    }
    .swiper-3d .swiper-slide-shadow-left,
    .swiper-3d .swiper-slide-shadow-right {
      background: none;
    }
    .swiper-pagination-bullet {
      background: hsl(43 74% 49% / 0.4) !important;
      opacity: 0.5 !important;
    }
    .swiper-pagination-bullet-active {
      background: hsl(43 74% 49%) !important;
      opacity: 1 !important;
    }
    .swiper-button-next,
    .swiper-button-prev {
      color: hsl(43 74% 49%) !important;
    }
  `;

  return (
    <div className="relative w-full">
      <style>{swiperCSS}</style>

      <Swiper
        effect="coverflow"
        grabCursor
        centeredSlides
        slidesPerView="auto"
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 100,
          modifier: 2.5,
          slideShadows: false,
        }}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        modules={[Autoplay, EffectCoverflow, Pagination, Navigation]}
        className="w-full"
      >
        {videos.map((v, i) => (
          <SwiperSlide key={i} className="!w-[300px] md:!w-[380px]">
            <div className="relative rounded-2xl overflow-hidden border border-border/30 bg-card/40 backdrop-blur-sm shadow-xl group">
              {/* Loading spinner */}
              {loadingMap[i] && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-20">
                  <Spinner className="w-10 h-10 text-primary animate-spin" />
                </div>
              )}

              <video
                ref={(el) => { videoRefs.current[i] = el; }}
                src={v.src}
                className="w-full aspect-[9/16] object-cover"
                muted
                loop
                playsInline
                preload="metadata"
                onLoadStart={() => setLoadingMap((prev) => ({ ...prev, [i]: true }))}
                onLoadedData={() => setLoadingMap((prev) => ({ ...prev, [i]: false }))}
              />

              {/* Play/Pause button */}
              <div className="absolute inset-0 flex items-center justify-center bg-background/20 opacity-100 group-hover:opacity-100 transition-opacity z-10">
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

              {/* Mute toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => toggleMute(i, e)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center border border-border/30 hover:bg-background/90 transition z-20"
                aria-label={mutedMap[i] === false ? "Mute" : "Unmute"}
              >
                {mutedMap[i] === false ? (
                  <SpeakerHigh className="w-4 h-4 text-foreground" />
                ) : (
                  <SpeakerSlash className="w-4 h-4 text-foreground" />
                )}
              </motion.button>

              {/* Title overlay */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-background/90 to-transparent p-4 pt-12 z-10">
                <p className="font-sans text-sm font-semibold text-foreground">{v.title}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
