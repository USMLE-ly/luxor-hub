import { motion } from 'framer-motion';
import React from 'react';
import { Check } from 'lucide-react';

// --- Types --- //
export interface SquishyPricingCardProps {
  label: string;
  monthlyPrice: string;
  description: string;
  features?: string[];
  cta?: string;
  background: string;
  BGComponent: React.FC;
  onCtaClick?: () => void;
  footer?: React.ReactNode;
  popular?: boolean;
}

export const SquishyPricingCard = ({
  label,
  monthlyPrice,
  description,
  features,
  cta,
  background,
  BGComponent,
  onCtaClick,
  footer,
  popular,
}: SquishyPricingCardProps) => {
  const hasFeatures = features && features.length > 0;
  return (
    <motion.div
      whileHover="hover"
      transition={{ duration: 1, ease: "backInOut" }}
      variants={{ hover: { scale: 1.05 } }}
      className={`relative ${hasFeatures ? 'h-auto min-h-[30rem] sm:min-h-[34rem]' : 'h-[22rem] sm:h-96'} w-[calc(100vw-2rem)] max-w-[20rem] sm:w-80 shrink-0 overflow-hidden rounded-2xl p-6 sm:p-8 ${background} transition-shadow flex flex-col ${popular ? 'shadow-[0_8px_40px_-8px_hsl(43,74%,49%,0.4)] ring-1 ring-white/20' : 'shadow-[0_4px_24px_-4px_rgba(0,0,0,0.3)]'}`}
    >
      {/* Premium glass overlay */}
      <div className="absolute inset-0 z-[1] rounded-2xl bg-gradient-to-b from-white/[0.12] via-transparent to-black/[0.15] pointer-events-none" />
      
      {/* Popular badge */}
      {popular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 px-4 py-1 rounded-b-lg bg-white/90 backdrop-blur-sm">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-900 font-sans">Most Popular</span>
        </div>
      )}

      <div className="relative z-10 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
        <span className="mb-3 block w-fit rounded-full bg-black/20 backdrop-blur-md px-4 py-1 text-xs font-bold uppercase tracking-[0.12em] text-white border border-white/20 font-sans">
          {label}
        </span>
        <motion.div
          initial={{ scale: 0.85 }}
          variants={{ hover: { scale: 1 } }}
          transition={{ duration: 1, ease: "backInOut" }}
          className="my-2 origin-top-left"
        >
          <span className="font-display text-[2.75rem] sm:text-[3.25rem] font-bold leading-none tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
            ${monthlyPrice}
          </span>
          <span className="text-sm font-bold font-sans text-white/90 ml-1 drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]">/month</span>
        </motion.div>
        <p className="text-xs sm:text-sm text-white font-medium mt-1 font-sans leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]">{description}</p>
      </div>

      {hasFeatures && (
        <>
          <div className="relative z-10 my-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <ul className="relative z-10 space-y-2.5 flex-1">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-2.5 text-white/90">
                <div className="w-4 h-4 mt-0.5 flex-shrink-0 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                </div>
                <span className="text-xs font-sans leading-relaxed tracking-wide">{f}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className={`${hasFeatures ? 'relative mt-5' : 'absolute bottom-4 left-4 right-4'} z-20`}>
        {footer ? (
          footer
        ) : cta ? (
          <button
            onClick={onCtaClick}
            className="w-full rounded-xl border border-white/30 bg-white/95 py-2.5 text-center text-sm font-bold uppercase tracking-[0.08em] text-neutral-900 backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-[0_4px_20px_rgba(255,255,255,0.3)] focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-[0.97] font-sans"
          >
            {cta}
          </button>
        ) : null}
      </div>

      <BGComponent />
    </motion.div>
  );
};

// --- Background SVG Components --- //
export const BGComponent1 = () => (
  <motion.svg
    width="320"
    height="384"
    viewBox="0 0 320 384"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    variants={{ hover: { scale: 1.5 } }}
    transition={{ duration: 1, ease: "backInOut" }}
    className="absolute inset-0 z-0"
  >
    <motion.circle
      variants={{ hover: { scaleY: 0.5, y: -25 } }}
      transition={{ duration: 1, ease: "backInOut", delay: 0.2 }}
      cx="160.5"
      cy="114.5"
      r="101.5"
      fill="rgba(0, 0, 0, 0.2)"
      className="dark:fill-white/10"
    />
    <motion.ellipse
      variants={{ hover: { scaleY: 2.25, y: -25 } }}
      transition={{ duration: 1, ease: "backInOut", delay: 0.2 }}
      cx="160.5"
      cy="265.5"
      rx="101.5"
      ry="43.5"
      fill="rgba(0, 0, 0, 0.2)"
      className="dark:fill-white/10"
    />
  </motion.svg>
);

export const BGComponent2 = () => (
  <motion.svg
    width="320"
    height="384"
    viewBox="0 0 320 384"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    variants={{ hover: { scale: 1.05 } }}
    transition={{ duration: 1, ease: "backInOut" }}
    className="absolute inset-0 z-0"
  >
    <motion.rect
      x="14"
      width="153"
      height="153"
      rx="15"
      fill="rgba(0, 0, 0, 0.2)"
      className="dark:fill-white/10"
      variants={{ hover: { y: 219, rotate: "90deg", scaleX: 2 } }}
      style={{ y: 12 }}
      transition={{ delay: 0.2, duration: 1, ease: "backInOut" }}
    />
    <motion.rect
      x="155"
      width="153"
      height="153"
      rx="15"
      fill="rgba(0, 0, 0, 0.2)"
      className="dark:fill-white/10"
      variants={{ hover: { y: 12, rotate: "90deg", scaleX: 2 } }}
      style={{ y: 219 }}
      transition={{ delay: 0.2, duration: 1, ease: "backInOut" }}
    />
  </motion.svg>
);

export const BGComponent3 = () => (
  <motion.svg
    width="320"
    height="384"
    viewBox="0 0 320 384"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    variants={{ hover: { scale: 1.25 } }}
    transition={{ duration: 1, ease: "backInOut" }}
    className="absolute inset-0 z-0"
  >
    <motion.path
      variants={{ hover: { y: -50 } }}
      transition={{ delay: 0.3, duration: 1, ease: "backInOut" }}
      d="M148.893 157.531C154.751 151.673 164.249 151.673 170.107 157.531L267.393 254.818C273.251 260.676 273.251 270.173 267.393 276.031L218.75 324.674C186.027 357.397 132.973 357.397 100.25 324.674L51.6068 276.031C45.7489 270.173 45.7489 260.676 51.6068 254.818L148.893 157.531Z"
      fill="rgba(0, 0, 0, 0.2)"
      className="dark:fill-white/10"
    />
    <motion.path
      variants={{ hover: { y: -50 } }}
      transition={{ delay: 0.2, duration: 1, ease: "backInOut" }}
      d="M148.893 99.069C154.751 93.2111 164.249 93.2111 170.107 99.069L267.393 196.356C273.251 202.213 273.251 211.711 267.393 217.569L218.75 266.212C186.027 298.935 132.973 298.935 100.25 266.212L51.6068 217.569C45.7489 211.711 45.7489 202.213 51.6068 196.356L148.893 99.069Z"
      fill="rgba(0, 0, 0, 0.2)"
      className="dark:fill-white/10"
    />
    <motion.path
      variants={{ hover: { y: -50 } }}
      transition={{ delay: 0.1, duration: 1, ease: "backInOut" }}
      d="M148.893 40.6066C154.751 34.7487 164.249 34.7487 170.107 40.6066L267.393 137.893C273.251 143.751 273.251 153.249 267.393 159.106L218.75 207.75C186.027 240.473 132.973 240.473 100.25 207.75L51.6068 159.106C45.7489 153.249 45.7489 143.751 51.6068 137.893L148.893 40.6066Z"
      fill="rgba(0, 0, 0, 0.2)"
      className="dark:fill-white/10"
    />
  </motion.svg>
);
