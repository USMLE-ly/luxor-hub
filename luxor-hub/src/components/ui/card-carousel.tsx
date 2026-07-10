import React, { useRef, useState, useEffect, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
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
  const [activeIdx, setActiveIdx] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [playingIdx, setPlayingIdx] = useState<number | null>(0);
  const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});
  const [posters, setPosters] = useState<Record<number, string>>({});
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const swiperRef = useRef<any>(null);

  const handleLoadedMetadata = useCallback((idx: number) => {
    setLoadingMap((prev) => ({ ...prev, [idx]: false }));
    const video = videoRefs.current[idx];
    if (!video) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 300;
      canvas.height = video.videoHeight || 533;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
        setPosters((prev) => ({ ...prev, [idx]: dataUrl }));
      }
    } catch { /* ignore CORS */ }
  }, []);

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
  `;

  return (
    <div className="relative w-full">
      <style>{swiperCSS}</style>

      {/* Global mute toggle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleMute}
        className="absolute top-3 right-3 z-30 w-10 h-10 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center border border-border/30 hover:bg-background/90 transition"
        aria-label={isMuted ? "Unmute all" : "Mute all"}
      >
        {isMuted ? (
          <SpeakerSlash className="w-4 h-4 text-foreground" />
        ) : (
          <SpeakerHigh className="w-4 h-4 text-foreground" />
        )}
      </motion.button>

      <Swiper
        slidesPerView={1.3}
        centeredSlides
        spaceBetween={16}
        grabCursor
        loop
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        onSlideChange={handleSlideChange}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          // Force loop initialization and start first video
          swiper.update();
          setTimeout(() => {
            const v = videoRefs.current[0];
            if (v) {
              v.play().catch(() => {});
              setPlayingIdx(0);
            }
          }, 300);
        }}
        modules={[Autoplay, Pagination, Navigation]}
        className="card-swiper w-full"
      >
        {videos.map((v, i) => (
          <SwiperSlide key={i}>
            <div className="relative rounded-2xl overflow-hidden border border-border/30 bg-card/40 backdrop-blur-sm shadow-xl group">
              {/* Loading spinner */}
              {loadingMap[i] && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-20">
                  <Spinner className="w-10 h-10 text-primary animate-spin" />
                </div>
              )}

              {/* Poster overlay */}
              {posters[i] && playingIdx !== i && (
                <img
                  src={posters[i]}
                  alt={v.alt}
                  className="w-full aspect-[9/16] object-cover absolute inset-0 z-10"
                />
              )}

              <video
                ref={(el) => { videoRefs.current[i] = el; }}
                src={v.src}
                className="w-full aspect-[9/16] object-cover"
                muted={isMuted}
                loop
                playsInline
                preload="metadata"
                onLoadStart={() => setLoadingMap((prev) => ({ ...prev, [i]: true }))}
                onLoadedMetadata={() => handleLoadedMetadata(i)}
              />

              {/* Play/Pause overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-background/20 opacity-100 group-hover:opacity-100 transition-opacity z-15">
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

              {/* Title */}
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
