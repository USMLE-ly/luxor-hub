import { useState, useEffect, useRef, useCallback } from 'react';

import { getSections, SECTION_BASE, DIVIDER_STYLE, FLIP_SPEED, DOMINO_DELAY, preloadImage } from "./flip-gallery-helpers";
import { MarketingBadges } from '@/components/ui/marketing-badges';
import { getSplashClipPath, SplashMaskDefs } from './image-masking';

export interface OutfitImages {
  top: string;
  mid: string;
  bottom: string;
  type?: 'regular' | 'dress' | 'full_outfit';
  accessory_note?: string;
  stylist_reasoning?: string[];
}

interface FlipGalleryProps {
  outfits: OutfitImages[];
  isLoading: boolean;
  onOutfitChange?: (outfit: OutfitImages) => void;
  onIndexChange?: (index: number, total: number) => void;
}

/* ------------------------------------------------------------------ */
/*  Helper – resolves sections array + count from an OutfitImages obj  */
/* ------------------------------------------------------------------ */


/* ------------------------------------------------------------------ */
/*  Style constants                                                    */
/* ------------------------------------------------------------------ */

const SECTION_BASE: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
};

const DIVIDER_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: '8%',
  width: '84%',
  height: '1px',
  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), rgba(255,255,255,0.06), transparent)',
  transform: 'translateY(-50%)',
  zIndex: 10,
  boxShadow: '0 0 8px rgba(255,255,255,0.04)',
};


const FLIP_SPEED = 400;
const DOMINO_DELAY = 150;

/* ------------------------------------------------------------------ */
/*  Preload a single image URL into browser cache                      */
/* ------------------------------------------------------------------ */
const preloadImage = (url: string | undefined | null): Promise<void> => {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // Don't hang UI on broken image
    if (!url) { resolve(); return; }
    img.src = url;
  });
};

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export default function FlipGallery({ outfits, isLoading, onOutfitChange, onIndexChange }: FlipGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipState, setFlipState] = useState<'idle' | 'out' | 'in'>('idle');
  const [preloadingDir, setPreloadingDir] = useState<'next' | 'prev' | null>(null);
  const [imagesReady, setImagesReady] = useState(false);
  const [animDirection, setAnimDirection] = useState<'next' | 'prev'>('next');
  const flipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [sectionBgColors, setSectionBgColors] = useState<Record<string, string>>({});

  // ── Extract dominant edge color from an image for background expansion ──
  const extractEdgeColor = useCallback((img: HTMLImageElement): string => {
    try {
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '#1D3937';
      
      const w = Math.min(img.naturalWidth, 200);
      const h = Math.min(img.naturalHeight, 200);
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
      
      // Sample edge pixels: corners + midpoints of each edge
      const positions = [
        [0, 0], [w/2, 0], [w-1, 0],           // top edge
        [0, h/2], [w-1, h/2],                  // sides
        [0, h-1], [w/2, h-1], [w-1, h-1],      // bottom edge
      ];
      
      let totalR = 0, totalG = 0, totalB = 0, count = 0;
      for (const [x, y] of positions) {
        const p = ctx.getImageData(x, y, 1, 1).data;
        // Exclude very dark pixels (likely the clothing itself at edges)
        if (p[0] > 30 || p[1] > 30 || p[2] > 30) {
          totalR += p[0]; totalG += p[1]; totalB += p[2]; count++;
        }
      }
      
      if (count === 0) return '#1D3937';
      
      const avgR = totalR / count;
      const avgG = totalG / count;
      const avgB = totalB / count;
      
      // Determine if the background is white, light, dark, or colored
      const brightness = (avgR + avgG + avgB) / 3;
      const isGray = Math.abs(avgR - avgG) < 15 && Math.abs(avgG - avgB) < 15;
      
      if (brightness > 220 && isGray) return '#ffffff';
      if (brightness > 180 && isGray) {
        const hex = Math.round(brightness);
        return `rgb(${hex}, ${hex}, ${hex})`;
      }
      if (brightness < 40 && isGray) return '#1D3937';
      if (brightness < 80 && isGray) return '#195042';
      
      // For colored backgrounds, return the average color
      return `rgb(${Math.round(avgR)}, ${Math.round(avgG)}, ${Math.round(avgB)})`;
    } catch {
      return '#1D3937';
    }
  }, []);

  useEffect(() => { setCurrentIndex(0); setFlipState('idle'); }, [outfits]);

  useEffect(() => {
    if (outfits.length > 0 && onOutfitChange) {
      onOutfitChange(outfits[currentIndex]);
    }
  }, [currentIndex, outfits, onOutfitChange]);

  useEffect(() => {
    if (outfits.length > 0 && onIndexChange) {
      onIndexChange(currentIndex, outfits.length);
    }
  }, [currentIndex, outfits.length, onIndexChange]);

  useEffect(() => {
    return () => {
      if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
    };
  }, []);


  // ── Extract edge colors from outfit images (background expansion) ──
  const extractColorsRef = useRef<AbortController | null>(null);
  useEffect(() => {
    if (!outfits[currentIndex]) return;
    extractColorsRef.current?.abort();
    const ctrl = new AbortController();
    extractColorsRef.current = ctrl;

    const outfit = outfits[currentIndex];
    const { sections } = getSections(outfit);
    const outfitsKey = outfit.top + '-' + outfit.mid + '-' + outfit.bottom;

    sections.forEach((url, idx) => {
      if (!url?.startsWith('http')) return;
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (ctrl.signal.aborted) return;
        const sectionKey = outfitsKey + '-' + idx;
        const bgColor = extractEdgeColor(img);
        setSectionBgColors(prev => ({ ...prev, [sectionKey]: bgColor }));
      };
      img.onerror = () => {}; // ignore
      img.src = url;
    });

    return () => ctrl.abort();
  }, [currentIndex, outfits]);

  // ── Preload FIRST outfit before showing (prevents piece-by-piece on initial load) ──
  useEffect(() => {
    if (outfits.length === 0) {
      setImagesReady(false);
      return;
    }
    setImagesReady(false);
    const outfit = outfits[0] || outfits[currentIndex];
    if (!outfit) return;
    Promise.all([
      preloadImage(outfit.top),
      preloadImage(outfit.mid),
      preloadImage(outfit.bottom),
    ]).then(() => {
      setImagesReady(true);
    });
  // Only run when outfits array reference changes (new generation), NOT on currentIndex change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outfits]);

  // ── Wait for preloaded images before flipping back in ──
  const pendingPreloadRef = useRef<Promise<void> | null>(null);

  // ── Domino flip state machine ──
  const flipSectionCountRef = useRef(3);

  useEffect(() => {
    if (flipState === 'idle') return;

    // Capture sectionCount at trigger time via ref to avoid deps change
    const sectionCount = flipSectionCountRef.current;

    if (flipState === 'out') {
      const delay = (sectionCount - 1) * DOMINO_DELAY + FLIP_SPEED + 50;
      flipTimeoutRef.current = setTimeout(async () => {
        // Swap to the next outfit while sections are hidden (rotated out)
        setCurrentIndex(prev => {
          if (animDirection === 'next') return (prev + 1) % outfits.length;
          return (prev - 1 + outfits.length) % outfits.length;
        });

        // Wait for preloaded images to be ready (should be instant if cache hit)
        if (pendingPreloadRef.current) {
          try { await pendingPreloadRef.current; } catch {}
        }

        // Small RAF to ensure DOM paints new backgroundImage before flip-in
        await new Promise(resolve => requestAnimationFrame(resolve));
        setFlipState('in');
      }, delay);
    }

    if (flipState === 'in') {
      flipTimeoutRef.current = setTimeout(() => {
        setFlipState('idle');
      }, (sectionCount - 1) * DOMINO_DELAY + FLIP_SPEED);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipState, animDirection]);



  const triggerFlip = (direction: 'next' | 'prev') => {
    if (flipState !== 'idle') return;
    setAnimDirection(direction);
    // Capture sectionCount at flip start so the state machine doesn't depend on currentIndex
    flipSectionCountRef.current = currentIndex !== undefined && outfits[currentIndex]
      ? getSections(outfits[currentIndex]).count
      : 3;
    setFlipState('out');
  };

  const handleNext = () => {
    if (flipState !== 'idle' || outfits.length === 0 || preloadingDir !== null) return;
    const nextIndex = (currentIndex + 1) % outfits.length;
    const nextOutfit = outfits[nextIndex];
    if (!nextOutfit) return;
    setPreloadingDir('next');
    // Use requestAnimationFrame to let React paint the spinner before preloading
    requestAnimationFrame(() => {
      pendingPreloadRef.current = Promise.all([
        preloadImage(nextOutfit.top),
        preloadImage(nextOutfit.mid),
        preloadImage(nextOutfit.bottom),
      ]).then(() => {
        setPreloadingDir(null);
        triggerFlip('next');
      });
    });
  };

  const handlePrev = () => {
    if (flipState !== 'idle' || outfits.length === 0 || preloadingDir !== null) return;
    const nextIndex = (currentIndex - 1 + outfits.length) % outfits.length;
    const nextOutfit = outfits[nextIndex];
    if (!nextOutfit) return;
    setPreloadingDir('prev');
    requestAnimationFrame(() => {
      pendingPreloadRef.current = Promise.all([
        preloadImage(nextOutfit.top),
        preloadImage(nextOutfit.mid),
        preloadImage(nextOutfit.bottom),
      ]).then(() => {
        setPreloadingDir(null);
        triggerFlip('prev');
      });
    });
  };


  // Listen for external navigation events from parent (DressingRoom arrows)
  useEffect(() => {
    const handleExternalPrev = () => handlePrev();
    const handleExternalNext = () => handleNext();
    window.addEventListener('flip-gallery-prev', handleExternalPrev);
    window.addEventListener('flip-gallery-next', handleExternalNext);
    return () => {
      window.removeEventListener('flip-gallery-prev', handleExternalPrev);
      window.removeEventListener('flip-gallery-next', handleExternalNext);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handlePrev, handleNext]);

  /* ======================= EMPTY STATE ======================= */
  if (outfits.length === 0) {
    return (
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        aspectRatio: '9 / 16',
        perspective: '800px',
        overflow: 'hidden',
      }}>
        <div style={{ ...SECTION_BASE, top: 0, height: '33.333%', backgroundColor: '#111111', borderBottom: '1px solid rgba(255,255,255,0.06)', zIndex: 0 }} />
        <div style={{ ...SECTION_BASE, top: '33.333%', height: '33.333%', backgroundColor: '#111111', borderBottom: '1px solid rgba(255,255,255,0.06)', zIndex: 0 }} />
        <div style={{ ...SECTION_BASE, bottom: 0, height: '33.333%', backgroundColor: '#111111', zIndex: 0 }} />

        <div style={{ position: 'absolute', bottom: '8px', left: 0, right: 0, zIndex: 20 }}>
          <MarketingBadges onGenerate={onGenerate} isLoading={isLoading} />
        </div>
      </div>
    );
  }

  /* ===================== POPULATED STATE ===================== */
  const outfit = outfits[currentIndex];
  if (!outfit || typeof outfit === 'string') {
    console.warn('[FlipGallery] Invalid outfit data at index', currentIndex, outfit);
    return null;
  }

  const { sections, count: sectionCount } = getSections(outfit);

  const getSectionStyle = (idx: number): React.CSSProperties => {
    const isAnimating = flipState !== 'idle';
    let transform = 'rotateX(0deg) scale(1)';
    if (flipState === 'out') {
      transform = 'rotateX(-90deg) scale(0.92)';
    }
    const outfitsKey = outfits[currentIndex]?.top + '-' + outfits[currentIndex]?.mid + '-' + outfits[currentIndex]?.bottom;
    const sectionKey = outfitsKey + '-' + idx;
    const bgColor = sectionBgColors[sectionKey] || '#1D3937';
    const url = sections[idx];
    
    return {
      position: 'absolute',
      left: 0,
      width: '100%',
      top: `${(idx / sectionCount) * 100}%`,
      height: `${(1 / sectionCount) * 100}%`,
      transform,
      transition: isAnimating ? `transform ${FLIP_SPEED}ms cubic-bezier(0.65, 0, 0.35, 1)` : 'none',
      transitionDelay: isAnimating ? `${idx * DOMINO_DELAY}ms` : '0ms',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      backgroundImage: 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      clipPath: getSplashClipPath(idx),
      borderRadius: '2.5rem',
      zIndex: 2,
      // Glassmorphism — dark translucent so bleed blur shows through
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      boxShadow: isAnimating && flipState === 'in'
        ? 'inset 0 0 40px rgba(255,255,255,0.06), 0 0 20px rgba(229,199,133,0.08)'
        : 'inset 0 0 0px rgba(255,255,255,0)',
    };
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      aspectRatio: '9 / 16',
      perspective: '800px',
      overflow: 'hidden',
    }}>

      {/* SVG splash mask definitions */}
      <SplashMaskDefs />

      {/* Spinner overlay — shown only on initial load, does NOT unmount gallery */}
      {!imagesReady && outfits.length > 0 && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: '#1D3937',
          borderRadius: '12px',
        }}>
          <div style={{
            width: '40px', height: '40px',
            borderRadius: '50%',
            border: '3px solid rgba(255,255,255,0.08)',
            borderTopColor: '#e5c785',
            animation: 'spin 0.8s linear infinite',
          }} />
        </div>
      )}
      {/* Per-section bleed blur — blurred image that extends OUTSIDE the clip-path */}
      {sections.map((url, idx) => {
        if (!url || !url.startsWith('http')) return null;
        const bleedHeight = `${(1 / sectionCount) * 100}%`;
        const bleedTop = `${(idx / sectionCount) * 100}%`;
        return (
          <div key={`bleed-${idx}`} style={{
            position: 'absolute',
            left: '-30%',
            width: '160%',
            top: `calc(${bleedTop} - 15%)`,
            height: `calc(${bleedHeight} + 30%)`,
            backgroundImage: `url('${url}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(25px) brightness(0.35) saturate(1.3)',
            zIndex: 0,
            opacity: 0.8,
          }} />
        );
      })}

      {sections.map((url, idx) => {
        const hasValidImage = url && url.startsWith('http');
        const labels = ['Top', 'Mid', 'Bottom'];
        return (
        <div key={idx} style={getSectionStyle(idx)}>
          {/* Inner rounded glass background - survives the clip-path cut */}
          {hasValidImage && (
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '1rem',
              backgroundColor: 'rgba(15,20,25,0.55)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.06)',
              zIndex: 0,
            }} />
          )}
          {/* Glassmorphism overlay — frosted glass on top of the image */}
          {hasValidImage && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 40%, rgba(0,0,0,0.15) 100%)',
              pointerEvents: 'none',
              zIndex: 2,
            }} />
          )}

          {/* Splash clip-path golden edge glow */}
          {hasValidImage && (
            <div style={{
              position: 'absolute',
              inset: 0,
              clipPath: getSplashClipPath(idx),
              boxShadow: 'inset 0 0 25px rgba(229,199,133,0.10)',
              pointerEvents: 'none',
              zIndex: 3,
            }} />
          )}
          {/* Clothing image — fills the splash-clipped section */}
          {hasValidImage && (
            <img
              src={url}
              alt={labels[idx] || 'Outfit item'}
              style={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
          )}
          {!hasValidImage && (
            <div className="flex flex-col items-center justify-center gap-1 opacity-40">
              <span className="text-2xl">{idx === 0 ? '👕' : idx === 1 ? '👗' : '👟'}</span>
              <span className="text-[10px] text-white/60 font-sans">{labels[idx] || 'Item'}</span>
            </div>
          )}

        </div>
        );
      })}

      {Array.from({ length: sectionCount - 1 }).map((_, i) => (
        <div
          key={`d-${i}`}
          style={{
            ...DIVIDER_STYLE,
            top: `${((i + 1) / sectionCount) * 100}%`,
          }}
        />
      ))}


    </div>
  );
}
