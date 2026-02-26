import { motion } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const GoldDivider = () => (
  <div className="flex items-center gap-4 my-10 max-w-xs mx-auto">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/40" />
    <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/40" />
  </div>
);

const testimonials = [
  {
    quote: "AURELIA transformed how I approach my wardrobe. The AI suggestions are eerily accurate — it's like having a personal stylist who knows me better than I know myself.",
    name: "Sophia Chen",
    title: "Creative Director",
    number: "01",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face",
  },
  {
    quote: "I used to spend 30 minutes every morning deciding what to wear. Now it takes seconds. The outfit generator considers weather, my calendar, and my mood.",
    name: "Marcus Rivera",
    title: "Startup Founder",
    number: "02",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face",
  },
  {
    quote: "The closet scanner alone is worth it. I discovered I had pieces that paired beautifully together — combinations I never would have tried on my own.",
    name: "Aisha Patel",
    title: "Fashion Editor",
    number: "03",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face",
  },
  {
    quote: "As a busy professional, AURELIA saved me hours every week. The style DNA feature captured my aesthetic perfectly — I've never felt more confident.",
    name: "James Thornton",
    title: "Investment Banker",
    number: "04",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face",
  },
  {
    quote: "The community feed is incredibly inspiring. Seeing how others style similar pieces gave me so many new ideas. It's like Pinterest meets a personal stylist.",
    name: "Elena Vasquez",
    title: "Interior Designer",
    number: "05",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face",
  },
];

const Testimonials = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  return (
    <section className="relative py-32 px-4 overflow-hidden" id="testimonials">
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url('/patterns/linear-texture.svg')`,
          backgroundSize: "400px 400px",
          backgroundRepeat: "repeat",
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <p className="text-primary font-sans font-semibold text-sm tracking-widest uppercase mb-4">
            Voices of Style
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            What Our <span className="gold-text">Members</span> Say
          </h2>
        </motion.div>

        <GoldDivider />

        {/* Carousel */}
        <div className="relative mt-16">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {testimonials.map((t, i) => (
                <div key={i} className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] px-4">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className="relative group h-full"
                  >
                    <span className="font-display text-7xl font-bold text-primary/10 absolute -top-6 -left-2 select-none pointer-events-none">
                      {t.number}
                    </span>

                    <div className="relative glass rounded-2xl p-8 pt-10 border border-border hover:border-primary/30 transition-colors h-full flex flex-col">
                      <Quote className="w-5 h-5 text-primary/40 mb-4" />

                      <p className="text-sm leading-relaxed text-muted-foreground font-sans flex-1 italic">
                        "{t.quote}"
                      </p>

                      <div className="h-px w-12 bg-gradient-to-r from-primary/50 to-transparent my-6" />

                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-primary/20">
                          <AvatarImage src={t.avatar} alt={t.name} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {t.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-display text-sm font-semibold text-foreground">{t.name}</p>
                          <p className="text-xs text-muted-foreground font-sans tracking-wide uppercase mt-0.5">
                            {t.title}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={scrollPrev}
              className="w-10 h-10 rounded-full glass border border-border hover:border-primary/40 flex items-center justify-center transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === selectedIndex ? "bg-primary w-6" : "bg-muted-foreground/30"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={scrollNext}
              className="w-10 h-10 rounded-full glass border border-border hover:border-primary/40 flex items-center justify-center transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
