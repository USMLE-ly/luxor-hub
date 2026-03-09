import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/* ── Gold floating particles ── */
const GoldParticles = ({ count = 30 }: { count?: number }) => {
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 4,
      opacity: Math.random() * 0.4 + 0.1,
    })),
    [count]
  );

  return (
    <div className="absolute inset-0 z-[3] pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, hsl(43 80% 65% / ${p.opacity}) 0%, transparent 70%)`,
            boxShadow: `0 0 ${p.size * 2}px hsl(43 74% 49% / ${p.opacity * 0.5})`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() > 0.5 ? 10 : -10, 0],
            opacity: [p.opacity, p.opacity * 1.8, p.opacity],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

interface ProgramCard {
  image: string;
  category: string;
  title: string;
  onClick?: () => void;
}

interface PulseFitHeroProps {
  logo?: string;
  navigation?: { label: string; hasDropdown?: boolean; onClick?: () => void }[];
  ctaButton?: {
    label: string;
    onClick: () => void;
  };
  title: string;
  subtitle: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  disclaimer?: string;
  socialProof?: {
    avatars: string[];
    text: string;
  };
  programs?: ProgramCard[];
  className?: string;
  children?: React.ReactNode;
}

export function PulseFitHero({
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  disclaimer,
  socialProof,
  programs = [],
  className,
  children,
}: PulseFitHeroProps) {
  return (
    <section
      className={cn(
        "relative w-full flex flex-col overflow-hidden",
        className
      )}
      role="banner"
      aria-label="Hero section"
    >
      {/* Dark luxury background */}
      <div className="absolute inset-0 z-0" style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 0%, hsl(43 74% 49% / 0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 20%, hsl(43 74% 49% / 0.05) 0%, transparent 50%), radial-gradient(ellipse 60% 50% at 20% 30%, hsl(43 74% 49% / 0.04) 0%, transparent 50%), linear-gradient(180deg, hsl(240 10% 4%) 0%, hsl(240 10% 7%) 50%, hsl(240 10% 5%) 100%)"
      }} />

      {/* Grain texture overlay */}
      <div className="absolute inset-0 z-[1] opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundSize: "128px 128px",
      }} />

      {/* Gold floating particles */}
      <GoldParticles count={25} />

      {/* Subtle gold line accents */}
      <div className="absolute top-0 left-0 right-0 h-px z-[2]" style={{
        background: "linear-gradient(90deg, transparent 0%, hsl(43 74% 49% / 0.3) 50%, transparent 100%)"
      }} />

      {/* Main Content */}
      {children ? (
        <div className="relative z-10 flex-1 flex items-center justify-center w-full">
          {children}
        </div>
      ) : (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-16 pb-8 md:pt-24 md:pb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col items-center text-center max-w-4xl gap-8"
          >
            {/* Gold shimmer sweep title */}
            <h1
              className="font-bold hero-gold-shimmer"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(36px, 6vw, 72px)",
                lineHeight: "1.1",
                letterSpacing: "-0.02em",
                backgroundImage: "linear-gradient(105deg, hsl(43 74% 49%) 0%, hsl(43 80% 65%) 20%, hsl(40 90% 80%) 40%, hsl(43 80% 65%) 60%, hsl(43 74% 49%) 80%, hsl(43 80% 65%) 100%)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {title}
            </h1>

            <p
              className="max-w-xl"
              style={{
                fontSize: "clamp(16px, 2vw, 20px)",
                lineHeight: "1.6",
                color: "hsl(240 5% 55%)",
              }}
            >
              {subtitle}
            </p>

            {(primaryAction || secondaryAction) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center gap-4"
              >
                {primaryAction && (
                  <button
                    onClick={primaryAction.onClick}
                    className="flex flex-row items-center gap-2 px-8 py-4 rounded-full transition-all hover:scale-105 text-lg font-medium"
                    style={{
                      background: "linear-gradient(135deg, hsl(43 74% 49%) 0%, hsl(43 70% 35%) 100%)",
                      color: "hsl(240 10% 4%)",
                      boxShadow: "0 4px 24px hsl(43 74% 49% / 0.25), 0 0 0 1px hsl(43 74% 49% / 0.15)",
                    }}
                  >
                    {primaryAction.label}
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M7 10H13M13 10L10 7M13 10L10 13"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}

                {secondaryAction && (
                  <button
                    onClick={secondaryAction.onClick}
                    className="px-8 py-4 rounded-full transition-all hover:scale-105 text-lg font-medium backdrop-blur-xl"
                    style={{
                      background: "hsl(240 8% 12% / 0.6)",
                      border: "1px solid hsl(43 74% 49% / 0.2)",
                      color: "hsl(40 20% 85%)",
                    }}
                  >
                    {secondaryAction.label}
                  </button>
                )}
              </motion.div>
            )}

            {disclaimer && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                style={{
                  color: "hsl(240 5% 45%)",
                  fontStyle: "italic",
                  fontSize: "13px",
                }}
              >
                {disclaimer}
              </motion.p>
            )}

            {socialProof && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="flex flex-row items-center gap-3"
              >
                <div className="flex flex-row -space-x-2">
                  {socialProof.avatars.map((avatar, index) => (
                    <img
                      key={index}
                      src={avatar}
                      alt={`User ${index + 1}`}
                      className="rounded-full w-10 h-10 object-cover"
                      style={{
                        border: "2px solid hsl(240 10% 8%)",
                        boxShadow: "0 0 8px hsl(43 74% 49% / 0.15)",
                      }}
                    />
                  ))}
                </div>
                <span style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "hsl(240 5% 55%)",
                }}>
                  {socialProof.text}
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}

      {/* Program Cards Carousel */}
      {programs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="relative z-10 w-full overflow-hidden py-10 md:py-16"
        >
          {/* Gold-tinted gradient edges */}
          <div
            className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none w-[100px] md:w-[150px]"
            style={{
              background: "linear-gradient(90deg, hsl(240 10% 5%) 0%, transparent 100%)",
            }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none w-[100px] md:w-[150px]"
            style={{
              background: "linear-gradient(270deg, hsl(240 10% 5%) 0%, transparent 100%)",
            }}
          />

          <motion.div
            className="flex items-center gap-6 pl-6"
            animate={{
              x: [0, -((programs.length * 380) / 2)],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: programs.length * 4,
                ease: "linear",
              },
            }}
          >
            {[...programs, ...programs].map((program, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -10 }}
                transition={{ duration: 0.3 }}
                onClick={program.onClick}
                className="flex-shrink-0 cursor-pointer relative overflow-hidden"
                style={{
                  width: "356px",
                  height: "480px",
                  borderRadius: "24px",
                  border: "1px solid hsl(43 74% 49% / 0.1)",
                  boxShadow: "0 8px 40px hsl(0 0% 0% / 0.4), 0 0 0 1px hsl(43 74% 49% / 0.05)",
                }}
              >
                <img
                  src={program.image}
                  alt={program.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Dark gradient overlay with gold tint */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(180deg, rgba(0, 0, 0, 0) 30%, rgba(0, 0, 0, 0.75) 100%)",
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-2">
                  <span
                    className="uppercase tracking-widest"
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "hsl(43 80% 65%)",
                      letterSpacing: "0.15em",
                    }}
                  >
                    {program.category}
                  </span>
                  <h3
                    className="leading-tight"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "22px",
                      fontWeight: 600,
                      color: "hsl(40 20% 95%)",
                    }}
                  >
                    {program.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Bottom gold line */}
      <div className="absolute bottom-0 left-0 right-0 h-px z-[2]" style={{
        background: "linear-gradient(90deg, transparent 0%, hsl(43 74% 49% / 0.15) 50%, transparent 100%)"
      }} />
    </section>
  );
}
