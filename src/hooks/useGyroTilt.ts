import { useEffect, useRef, useState, useCallback } from "react";

interface TiltValues {
  rotateX: number;
  rotateY: number;
}

/**
 * Provides subtle parallax tilt values from device gyroscope (mobile)
 * or mouse position (desktop). Values in degrees, clamped to maxTilt.
 */
export function useGyroTilt(maxTilt = 8) {
  const [tilt, setTilt] = useState<TiltValues>({ rotateX: 0, rotateY: 0 });
  const frameRef = useRef<number>(0);
  const targetRef = useRef<TiltValues>({ rotateX: 0, rotateY: 0 });
  const currentRef = useRef<TiltValues>({ rotateX: 0, rotateY: 0 });
  const hasGyro = useRef(false);
  const initialBeta = useRef<number | null>(null);
  const initialGamma = useRef<number | null>(null);

  // Smooth lerp animation loop
  const animate = useCallback(() => {
    const lerp = 0.08;
    const curr = currentRef.current;
    const target = targetRef.current;

    curr.rotateX += (target.rotateX - curr.rotateX) * lerp;
    curr.rotateY += (target.rotateY - curr.rotateY) * lerp;

    // Only update state if values changed meaningfully
    if (
      Math.abs(curr.rotateX - tilt.rotateX) > 0.05 ||
      Math.abs(curr.rotateY - tilt.rotateY) > 0.05
    ) {
      setTilt({ rotateX: curr.rotateX, rotateY: curr.rotateY });
    }

    frameRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    frameRef.current = requestAnimationFrame(animate);

    // Gyroscope handler (mobile)
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null) return;
      hasGyro.current = true;

      // Calibrate to initial position
      if (initialBeta.current === null) {
        initialBeta.current = e.beta;
        initialGamma.current = e.gamma;
      }

      const beta = e.beta - (initialBeta.current ?? 0); // front-back tilt
      const gamma = e.gamma - (initialGamma.current ?? 0); // left-right tilt

      const clamp = (v: number) => Math.max(-maxTilt, Math.min(maxTilt, v));

      targetRef.current = {
        rotateX: clamp(-beta * 0.3),
        rotateY: clamp(gamma * 0.3),
      };
    };

    // Mouse fallback (desktop)
    const handleMouse = (e: MouseEvent) => {
      if (hasGyro.current) return;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const x = (e.clientX - cx) / cx; // -1 to 1
      const y = (e.clientY - cy) / cy; // -1 to 1

      targetRef.current = {
        rotateX: -y * maxTilt * 0.5,
        rotateY: x * maxTilt * 0.5,
      };
    };

    window.addEventListener("deviceorientation", handleOrientation, true);
    window.addEventListener("mousemove", handleMouse, { passive: true });

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("deviceorientation", handleOrientation, true);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, [animate, maxTilt]);

  return tilt;
}
