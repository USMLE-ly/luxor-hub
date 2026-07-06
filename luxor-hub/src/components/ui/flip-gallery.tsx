import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { MarketingBadges } from '@/components/ui/marketing-badges';

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
  onGenerate: () => void;
  onDismiss: () => void;
  onAddToCalendar?: (outfit: OutfitImages) => void;
  isLoading: boolean;
  onOutfitChange?: (outfit: OutfitImages) => void;
}

/* ------------------------------------------------------------------ */
/*  Helper – resolves sections array + count from an OutfitImages obj  */
/* ------------------------------------------------------------------ */
function getSections(o: OutfitImages): { sections: string[]; count: number } {
  if (o.type === 'full_outfit') {
    return { sections: [o.top], count: 1 };
  }
  if (o.type === 'dress') {
    return { sections: [o.top, o.bottom], count: 2 };
  }
  return { sections: [o.top, o.mid, o.bottom], count: 3 };
}

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
  left: '10%',
  width: '80%',
  height: '1px',
  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
  transform: 'translateY(-50%)',
  zIndex: 10,
};

const CONTROL_BOTTOM_LEFT: React.CSSProperties = {
  position: 'absolute',
  bottom: '16px',
  left: '16px',
  zIndex: 20,
};

const CONTROL_BOTTOM_RIGHT: React.CSSProperties = {
  position: 'absolute',
  bottom: '16px',
  right: '16px',
  zIndex: 20,
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
};

const PURPLE_BTN: React.CSSProperties = {
  backgroundColor: '#9333ea',
  color: 'white',
  padding: '8px 16px',
  borderRadius: '6px',
  fontWeight: 500,
  fontSize: '14px',
  border: 'none',
  cursor: 'pointer',
};

const DISABLED_ARROW: React.CSSProperties = {
  color: 'rgba(255,255,255,0.2)',
  cursor: 'not-allowed',
  background: 'none',
  border: 'none',
  padding: 0,
};

const ACTIVE_ARROW: React.CSSProperties = {
  color: 'rgba(255,255,255,0.7)',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  padding: 0,
};

const DISMISS_BTN: React.CSSProperties = {
  fontSize: '14px',
  color: 'rgba(255,255,255,0.7)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
};

const IMG_STYLE: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  objectPosition: 'center',
  display: 'block',
};

const FLIP_SPEED = 400;
const DOMINO_DELAY = 150;

/* ------------------------------------------------------------------ */
/*  Preload a single image URL into browser cache                      */
/* ------------------------------------------------------------------ */
const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // Don't hang UI on broken image
    img.src = url;
  });
};

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export default function FlipGallery({ outfits, onGenerate, onDismiss, onAddToCalendar, isLoading, onOutfitChange }: FlipGalleryProps) {
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
      if (!ctx) return '#0a0a0a';
      
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
      
      if (count === 0) return '#0a0a0a';
      
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
      if (brightness < 40 && isGray) return '#0a0a0a';
      if (brightness < 80 && isGray) return '#1a1a1a';
      
      // For colored backgrounds, return the average color
      return `rgb(${Math.round(avgR)}, ${Math.round(avgG)}, ${Math.round(avgB)})`;
    } catch {
      return '#0a0a0a';
    }
  }, []);

  useEffect(() => { setCurrentIndex(0); setFlipState('idle'); }, [outfits]);

  useEffect(() => {
    if (outfits.length > 0 && onOutfitChange) {
      onOutfitChange(outfits[currentIndex]);
    }
  }, [currentIndex, outfits, onOutfitChange]);

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
      const img = new Image();
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
    let transform = 'rotateX(0deg)';
    if (flipState === 'out') {
      transform = 'rotateX(-90deg)';
    }
    const outfitsKey = outfits[currentIndex]?.top + '-' + outfits[currentIndex]?.mid + '-' + outfits[currentIndex]?.bottom;
    const sectionKey = outfitsKey + '-' + idx;
    const bgColor = sectionBgColors[sectionKey] || '#0a0a0a';
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
      backgroundColor: bgColor,
      backgroundImage: url?.startsWith('http') ? `url('${url}')` : 'none',
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      borderRadius: '12px',
      zIndex: 1,
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
      {/* Spinner overlay — shown only on initial load, does NOT unmount gallery */}
      {!imagesReady && outfits.length > 0 && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: '#0a0a0a',
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
      {sections.map((url, idx) => {
        return (
        <div key={idx} style={getSectionStyle(idx)} />
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

      {/* Custom Bottom Controls — Dismiss right, arrows left, no overlap */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '8px',
        right: '8px',
        zIndex: 20,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pointerEvents: 'none',
      }}>
        {/* Arrows — left edge */}
        <div style={{ display: 'flex', gap: '12px', pointerEvents: 'auto' }}>
          {outfits.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                style={{
                  backgroundColor: preloadingDir === 'prev' ? '#3b82f6' : '#60a5fa',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: preloadingDir === 'prev' ? 'default' : 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  transition: 'transform 0.2s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => { if (preloadingDir !== 'prev') e.currentTarget.style.transform = 'scale(1.1)'; }}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {preloadingDir === 'prev' ? (
                  <div style={{
                    width: '20px', height: '20px',
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.2)',
                    borderTopColor: '#ffffff',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                ) : (
                  <ChevronLeft size={20} />
                )}
              </button>
              <button
                onClick={handleNext}
                style={{
                  backgroundColor: preloadingDir === 'next' ? '#3b82f6' : '#60a5fa',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: preloadingDir === 'next' ? 'default' : 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  transition: 'transform 0.2s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => { if (preloadingDir !== 'next') e.currentTarget.style.transform = 'scale(1.1)'; }}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {preloadingDir === 'next' ? (
                  <div style={{
                    width: '20px', height: '20px',
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.2)',
                    borderTopColor: '#ffffff',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                ) : (
                  <ChevronRight size={20} />
                )}
              </button>
            </>
          )}
        </div>

        {/* Dismiss + Calendar — right edge */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', pointerEvents: 'auto' }}>
          {onAddToCalendar && (
            <button
              onClick={() => onAddToCalendar(outfits[currentIndex])}
              style={{
                background: 'linear-gradient(135deg, #9ca3af, #6b7280)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                transition: 'transform 0.2s ease',
              }}
              title="Add to Calendar"
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <CalendarDays size={18} />
            </button>
          )}
          <button
            onClick={onDismiss}
            style={{
              background: 'linear-gradient(135deg, #e5c785, #d4b06a)',
              color: '#1e293b',
              border: 'none',
              borderRadius: '9999px',
              padding: '10px 24px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
