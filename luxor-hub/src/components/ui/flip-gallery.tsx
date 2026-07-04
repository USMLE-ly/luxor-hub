import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  left: 0,
  width: '100%',
  height: '4px',
  backgroundColor: '#000',
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
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export default function FlipGallery({ outfits, onGenerate, onDismiss, isLoading, onOutfitChange }: FlipGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipState, setFlipState] = useState<'idle' | 'out' | 'in'>('idle');
  const [animDirection, setAnimDirection] = useState<'next' | 'prev'>('next');
  const flipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // ── Domino flip state machine ──
  useEffect(() => {
    if (flipState === 'idle') return;

    const sectionCount = outfits[currentIndex]
      ? getSections(outfits[currentIndex]).count
      : 3;

    if (flipState === 'out') {
      const delay = (sectionCount - 1) * DOMINO_DELAY + FLIP_SPEED + 50;
      flipTimeoutRef.current = setTimeout(() => {
        setCurrentIndex(prev => {
          if (animDirection === 'next') return (prev + 1) % outfits.length;
          return (prev - 1 + outfits.length) % outfits.length;
        });
        setFlipState('in');
      }, delay);
    }

    if (flipState === 'in') {
      flipTimeoutRef.current = setTimeout(() => {
        setFlipState('idle');
      }, (sectionCount - 1) * DOMINO_DELAY + FLIP_SPEED);
    }
  }, [flipState, animDirection, outfits, currentIndex]);

  const triggerFlip = (direction: 'next' | 'prev') => {
    if (flipState !== 'idle') return;
    setAnimDirection(direction);
    setFlipState('out');
  };

  const handleNext = () => triggerFlip('next');
  const handlePrev = () => triggerFlip('prev');

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
        <div style={{ ...SECTION_BASE, top: 0, height: '33.333%', backgroundColor: '#1A1A1A', borderBottom: '4px solid #000', zIndex: 0 }} />
        <div style={{ ...SECTION_BASE, top: '33.333%', height: '33.333%', backgroundColor: '#1A1A1A', borderBottom: '4px solid #000', zIndex: 0 }} />
        <div style={{ ...SECTION_BASE, bottom: 0, height: '33.333%', backgroundColor: '#1A1A1A', zIndex: 0 }} />

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
    return {
      position: 'absolute',
      left: 0,
      width: '100%',
      top: `${(idx / sectionCount) * 100}%`,
      height: `${(1 / sectionCount) * 100}%`,
      transform,
      transition: isAnimating ? `transform ${FLIP_SPEED}ms ease-in-out` : 'none',
      transitionDelay: isAnimating ? `${idx * DOMINO_DELAY}ms` : '0ms',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1A1A1A',
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
      {sections.map((url, idx) => {
        console.log(`[FLIP-GALLERY] Attempting to load background image: ${url}`);
        return (
        <div key={idx} style={getSectionStyle(idx)}>
          {url?.startsWith('http') ? (
            <img
              src={url}
              alt={`Outfit ${currentIndex + 1} section ${idx + 1}`}
              style={IMG_STYLE}
              onError={(e) => {
                const target = e.currentTarget;
                console.warn(`[FLIP-GALLERY] Image load FAILED for: ${url}`);
                if (target.src !== 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7') {
                  target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                }
              }}
              onLoad={() => console.log(`[FLIP-GALLERY] Image loaded OK: ${url}`)}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', backgroundColor: '#1A1A1A' }} />
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

      <div style={{ position: 'absolute', bottom: '8px', left: 0, right: 0, zIndex: 20 }}>
        <MarketingBadges
          onDismiss={onDismiss}
          onPrev={handlePrev}
          onNext={handleNext}
          hasMultiple={outfits.length > 1}
          hasOutfits={true}
        />
      </div>
    </div>
  );
}
