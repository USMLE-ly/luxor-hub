import React from 'react';

/**
 * Three organic splash/splatter clip-path masks.
 * Each gives a luxury, fluid aesthetic to clothing item previews.
 */

export const SplashMaskDefs: React.FC = () => (
  <svg
    style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: 0, height: 0 }}
    aria-hidden="true"
  >
    <defs>
      {/* Splash 1 — broad organic blob, slightly asymmetric */}
      <clipPath id="clip-splash1" clipPathUnits="objectBoundingBox">
        <path
          d="M0.52,0.01 C0.68,-0.01,0.85,0.03,0.93,0.12 C0.99,0.20,0.98,0.34,0.97,0.46
             C0.96,0.56,0.99,0.66,0.95,0.76 C0.91,0.85,0.82,0.91,0.72,0.95
             C0.63,0.98,0.52,0.99,0.42,0.98 C0.31,0.97,0.20,0.99,0.12,0.93
             C0.04,0.87,0.01,0.76,0.02,0.65 C0.03,0.54,0.01,0.43,0.04,0.33
             C0.07,0.22,0.13,0.13,0.22,0.07 C0.31,0.02,0.42,0.02,0.52,0.01Z"
        />
      </clipPath>

      {/* Splash 2 — vertically elongated droplet with organic drips */}
      <clipPath id="clip-splash2" clipPathUnits="objectBoundingBox">
        <path
          d="M0.48,0.02 C0.60,-0.01,0.78,0.01,0.88,0.09 C0.97,0.17,0.99,0.30,0.97,0.42
             C0.95,0.53,0.99,0.63,0.96,0.73 C0.93,0.82,0.85,0.90,0.74,0.95
             C0.64,0.99,0.53,0.98,0.43,0.97 C0.33,0.96,0.23,0.99,0.15,0.94
             C0.07,0.89,0.02,0.78,0.03,0.67 C0.04,0.56,0.01,0.45,0.04,0.35
             C0.07,0.25,0.12,0.15,0.20,0.09 C0.28,0.03,0.38,0.04,0.48,0.02Z"
        />
      </clipPath>

      {/* Splash 3 — wide fluid splash with organic tendrils */}
      <clipPath id="clip-splash3" clipPathUnits="objectBoundingBox">
        <path
          d="M0.50,0.03 C0.63,0.00,0.79,0.02,0.89,0.10 C0.96,0.17,0.98,0.28,0.97,0.40
             C0.96,0.51,1.00,0.61,0.97,0.72 C0.94,0.82,0.87,0.90,0.77,0.95
             C0.67,0.99,0.56,0.97,0.45,0.96 C0.34,0.95,0.24,0.99,0.15,0.95
             C0.07,0.90,0.03,0.80,0.03,0.69 C0.03,0.58,0.00,0.47,0.04,0.37
             C0.07,0.28,0.14,0.18,0.23,0.11 C0.32,0.05,0.40,0.05,0.50,0.03Z"
        />
      </clipPath>
    </defs>
  </svg>
);

/**
 * Returns the clip-path URL for a given section index.
 * Cycles through 3 splash shapes.
 */
export const getSplashClipPath = (idx: number): string => {
  const clips = ['clip-splash1', 'clip-splash2', 'clip-splash3'];
  return `url(#${clips[idx % clips.length]})`;
};
