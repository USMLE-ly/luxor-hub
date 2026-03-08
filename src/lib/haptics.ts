/**
 * Haptic feedback utility for mobile PWA experience.
 * Uses the Vibration API where available, falls back silently.
 */

type HapticStyle = "light" | "medium" | "heavy" | "success" | "error" | "selection";

const patterns: Record<HapticStyle, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [10, 50, 20],
  error: [30, 50, 30, 50, 30],
  selection: 5,
};

export const haptic = (style: HapticStyle = "light") => {
  if (!navigator.vibrate) return;
  try {
    const pattern = patterns[style];
    navigator.vibrate(pattern);
  } catch {
    // Silently fail on unsupported devices
  }
};

/**
 * Wraps a click handler with haptic feedback.
 */
export const withHaptic = <T extends (...args: any[]) => any>(
  handler: T,
  style: HapticStyle = "light"
): ((...args: Parameters<T>) => ReturnType<T>) => {
  return (...args: Parameters<T>) => {
    haptic(style);
    return handler(...args);
  };
};
