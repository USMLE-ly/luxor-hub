import { motion } from "framer-motion";
import { Play, Star } from "lucide-react";
import { useState } from "react";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";

const videoTestimonials = [
  {
    name: "Isabella Martinez",
    role: "Fashion Influencer · 240K Followers",
    thumbnail: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    quote: "LUXOR's AI understood my aesthetic instantly. My followers noticed the upgrade before I even told them.",
    rating: 5,
  },
  {
    name: "James Chen",
    role: "Tech CEO & Style Enthusiast",
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    quote: "I went from wearing the same 3 outfits to a full capsule wardrobe. Game-changer for busy professionals.",
    rating: 5,
  },
  {
    name: "Amara Okafor",
    role: "Boutique Owner · Lagos & London",
    thumbnail: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=300&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    quote: "My boutique revenue jumped 340% after integrating LUXOR's recommendations into our styling service.",
    rating: 5,
  },
];

const VideoTestimonials = () => {
  const [activeVideo, setActiveVideo] = useState<number | null>(null);

  return (
    <section className="relative py-24 overflow-hidden">
      <AnimatedGradientBackground
        Breathing={true}
        animationSpeed={0.01}
        breathingRange={6}
        startingGap={140}
        topOffset={15}
        gradientColors={[
          "hsl(240 10% 5%)",
          "hsl(280 30% 12%)",
          "hsl(43 50% 14%)",
          "hsl(280 30% 12%)",
          "hsl(240 10% 5%)",
        ]}
        gradientStops={[0, 25, 50, 75, 100]}
        containerClassName="rounded-none"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="font-sans text-sm font-semibold text-primary tracking-widest uppercase mb-3">
            Video Reviews
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            Hear It From <span className="gold-text">Our Users</span>
          </h2>
          <p className="mt-4 max-w-lg mx-auto font-sans text-sm text-muted-foreground">
            Real people, real transformations. Watch how LUXOR changed their style and their business.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {videoTestimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="glass rounded-2xl overflow-hidden premium-card group"
            >
              {/* Video / Thumbnail area */}
              <div className="relative aspect-video overflow-hidden">
                {activeVideo === i ? (
                  <iframe
                    src={`${t.videoUrl}?autoplay=1`}
                    className="absolute inset-0 w-full h-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title={`${t.name} video review`}
                  />
                ) : (
                  <>
                    <img
                      src={t.thumbnail}
                      alt={t.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-background/40 flex items-center justify-center">
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveVideo(i)}
                        className="w-16 h-16 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-[0_0_30px_hsl(43_74%_49%/0.4)]"
                      >
                        <Play className="w-7 h-7 text-primary-foreground ml-1" fill="currentColor" />
                      </motion.button>
                    </div>
                  </>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="font-sans text-sm text-foreground leading-relaxed mb-4 italic">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3 pt-3 border-t border-border/30">
                  <img
                    src={t.thumbnail}
                    alt={t.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/20"
                    loading="lazy"
                  />
                  <div>
                    <p className="font-sans text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="font-sans text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoTestimonials;
