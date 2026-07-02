import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface OutfitImages {
  top: string;
  mid: string;
  bottom: string;
  type?: 'regular' | 'dress' | 'full_outfit';
  accessory_note?: string;
}

interface FlipGalleryProps {
  outfits: OutfitImages[];
  onGenerate: () => void;
  onDismiss: () => void;
  isLoading: boolean;
}

/* ------------------------------------------------------------------ */
/*  Helper – resolves sections array + count from an OutfitImages obj  */
/* ------------------------------------------------------------------ */
function getSections(o: OutfitImages): { sections: string[]; count: number } {
  if (o.type === 'full_outfit') {
    return { sections: [o.top], count: 1 };
  }
  if (o.type === 'dress') {
    // dress image on top half, shoes on bottom half
    return { sections: [o.top, o.bottom], count: 2 };
  }
  // regular: top | bottom (mid) | shoes (bottom)
  return { sections: [o.top, o.mid, o.bottom], count: 3 };
}

/* ------------------------------------------------------------------ */
/*  Inline style objects (avoids Tailwind JIT issues entirely)         */
/* ------------------------------------------------------------------ */

const FRAME_STYLE: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  maxWidth: '340px',
  margin: '0 auto',
  backgroundColor: '#1A1A1A',
  border: '1px solid #2A2A2A',
  padding: '8px',
};

/* 9:16 aspect ratio: height is computed from width automatically     */
const INNER_STYLE: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  aspectRatio: '9 / 16',
  perspective: '800px',
  backgroundColor: '#0a0a0a',
  overflow: 'hidden',
};

const SECTION_BASE: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  width: '100%',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
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

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export default function FlipGallery({ outfits, onGenerate, onDismiss, isLoading }: FlipGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset to first when list changes
  useEffect(() => { setCurrentIndex(0); }, [outfits]);

  const handleNext = () => setCurrentIndex((currentIndex + 1) % outfits.length);
  const handlePrev = () => setCurrentIndex((currentIndex - 1 + outfits.length) % outfits.length);

  /* ======================= EMPTY STATE ======================= */
  if (outfits.length === 0) {
    return (
      <div style={FRAME_STYLE}>
        <div style={INNER_STYLE}>
          {/* UNIFORM dark gray strips — all same #1A1A1A color */}
          <div style={{ ...SECTION_BASE, top: 0, height: '33.333%', backgroundColor: '#1A1A1A', borderBottom: '4px solid #000', zIndex: 0 }} />
          <div style={{ ...SECTION_BASE, top: '33.333%', height: '33.333%', backgroundColor: '#1A1A1A', borderBottom: '4px solid #000', zIndex: 0 }} />
          <div style={{ ...SECTION_BASE, bottom: 0, height: '33.333%', backgroundColor: '#1A1A1A', zIndex: 0 }} />

          {/* Generate button */}
          <div style={CONTROL_BOTTOM_LEFT}>
            <button
              onClick={onGenerate}
              disabled={isLoading}
              style={{
                ...PURPLE_BTN,
                opacity: isLoading ? 0.5 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? 'Consulting MiMo...' : 'Generate Outfit'}
            </button>
          </div>

          {/* Grayed arrows */}
          <div style={CONTROL_BOTTOM_RIGHT}>
            <button disabled style={DISABLED_ARROW}><ChevronLeft size={20} /></button>
            <button disabled style={DISABLED_ARROW}><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>
    );
  }

  /* ===================== POPULATED STATE ===================== */
  const outfit = outfits[currentIndex];
  // Defensive: if data is somehow a flat string, skip rendering
  if (!outfit || typeof outfit === 'string') {
    console.warn('[FlipGallery] Invalid outfit data at index', currentIndex, outfit);
    return null;
  }

  const { sections, count: sectionCount } = getSections(outfit);

  return (
    <div style={FRAME_STYLE}>
      <div style={INNER_STYLE}>
        {/* Render sections with background images from closet */}
        {sections.map((url, idx) => (
          <div
            key={idx}
            style={{
              ...SECTION_BASE,
              top: `${(idx / sectionCount) * 100}%`,
              height: `${(1 / sectionCount) * 100}%`,
              backgroundImage: url?.startsWith('http') ? `url('${url}')` : undefined,
              backgroundColor: url?.startsWith('http') ? 'transparent' : '#111',
            }}
          />
        ))}

        {/* Black dividers between sections */}
        {Array.from({ length: sectionCount - 1 }).map((_, i) => (
          <div
            key={`d-${i}`}
            style={{
              ...DIVIDER_STYLE,
              top: `${((i + 1) / sectionCount) * 100}%`,
            }}
          />
        ))}

        {/* Controls */}
        <div style={CONTROL_BOTTOM_LEFT}>
          <button onClick={onDismiss} style={DISMISS_BTN}>Dismiss</button>
        </div>
        {outfits.length > 1 && (
          <div style={CONTROL_BOTTOM_RIGHT}>
            <button onClick={handlePrev} style={ACTIVE_ARROW}><ChevronLeft size={20} /></button>
            <button onClick={handleNext} style={ACTIVE_ARROW}><ChevronRight size={20} /></button>
          </div>
        )}
      </div>
    </div>
  );
}
