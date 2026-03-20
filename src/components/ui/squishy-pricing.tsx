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
}: SquishyPricingCardProps) => {
  const hasFeatures = features && features.length > 0;
  return (
    <motion.div
      whileHover="hover"
      transition={{ duration: 1, ease: "backInOut" }}
      variants={{ hover: { scale: 1.05 } }}
      className={`relative ${hasFeatures ? 'h-auto min-h-[28rem] sm:min-h-[32rem]' : 'h-[22rem] sm:h-96'} w-[calc(100vw-2rem)] max-w-[20rem] sm:w-80 shrink-0 overflow-hidden rounded-xl p-6 sm:p-8 ${background} shadow-lg hover:shadow-xl transition-shadow flex flex-col`}
    >
      <div className="relative z-10 text-white">
        <span className="mb-2 block w-fit rounded-full bg-white/20 backdrop-blur-sm px-3 py-0.5 text-sm font-medium text-white border border-white/20">
          {label}
        </span>
        <motion.span
          initial={{ scale: 0.85 }}
          variants={{ hover: { scale: 1 } }}
          transition={{ duration: 1, ease: "backInOut" }}
          className="my-1 block origin-top-left font-mono text-4xl sm:text-5xl font-black leading-[1.1]"
        >
          ${monthlyPrice}/mo
        </motion.span>
        <p className="text-xs sm:text-sm text-white/80 mt-1">{description}</p>
      </div>

      {hasFeatures && (
        <ul className="relative z-10 mt-4 space-y-1.5 flex-1">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-white/90">
              <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-white" />
              <span className="text-xs font-sans leading-tight">{f}</span>
            </li>
          ))}
        </ul>
      )}

      <div className={`${hasFeatures ? 'relative mt-4' : 'absolute bottom-4 left-4 right-4'} z-20`}>
        {footer ? (
          footer
        ) : cta ? (
          <button
            onClick={onCtaClick}
            className="w-full rounded-lg border-2 border-white bg-white py-2 text-center font-mono font-black uppercase text-neutral-800 backdrop-blur-sm transition-all duration-200 hover:bg-white/10 hover:text-white hover:border-white/80 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent active:scale-95"
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
