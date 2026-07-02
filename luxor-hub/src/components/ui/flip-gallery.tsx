import { useEffect, useRef, useState } from 'react';
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

/**
 * Returns section config based on outfit type:
 *   regular -> 3 sections (top, mid, bottom) each 33.333% height, 2 divider lines
 *   dress   -> 2 sections (top=dress, bottom=shoes) each 50% height, 1 divider line
 *   full_outfit -> 1 section (top=full) 100% height, 0 divider lines
 */
function getSections(outfit: OutfitImages | undefined): { images: string[]; dividerCount: number } {
  const type = outfit?.type || 'regular';
  if (type === 'full_outfit') {
    return { images: [outfit?.top || ''], dividerCount: 0 };
  }
  if (type === 'dress') {
    return { images: [outfit?.top || '', outfit?.bottom || ''], dividerCount: 1 };
  }
  // regular
  return { images: [outfit?.top || '', outfit?.mid || '', outfit?.bottom || ''], dividerCount: 2 };
}

export default function FlipGallery({ outfits, onGenerate, onDismiss, isLoading }: FlipGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset index when outfits change
  useEffect(() => {
    setCurrentIndex(0);
  }, [outfits]);

  // Debug: log current outfit
  useEffect(() => {
    if (outfits.length > 0 && currentIndex < outfits.length) {
      console.log("[FlipGallery] Rendering outfit:", outfits[currentIndex]);
    }
  }, [currentIndex, outfits]);

  // ============= EMPTY STATE =============
  if (outfits.length === 0) {
    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '400px',
          perspective: '800px',
          background: '#0a0a0a',
          overflow: 'hidden',
        }}
        className="md:h-[500px]"
      >
        {/* 3 background strips — pure inline styles, no Tailwind arbitrary values */}
        <div style={{ position: 'absolute', width: '100%', height: '33.333%', top: 0, background: '#1A1A1A', borderBottom: '1px solid #000', zIndex: 0 }} />
        <div style={{ position: 'absolute', width: '100%', height: '33.333%', top: '33.333%', background: '#0a0a0a', borderBottom: '1px solid #000', zIndex: 0 }} />
        <div style={{ position: 'absolute', width: '100%', height: '33.333%', bottom: 0, background: '#0a0a0a', zIndex: 0 }} />

        {/* 2 divider lines */}
        <div style={{ position: 'absolute', top: '33.333%', left: 0, width: '100%', height: '4px', background: '#000', zIndex: 10, transform: 'translateY(-50%)' }} />
        <div style={{ position: 'absolute', top: '66.666%', left: 0, width: '100%', height: '4px', background: '#000', zIndex: 10, transform: 'translateY(-50%)' }} />

        {/* Generate button — bottom left */}
        <div style={{ position: 'absolute', bottom: '-1rem', left: '-0.5rem', zIndex: 20 }}>
          <button
            onClick={onGenerate}
            disabled={isLoading}
            style={{
              background: isLoading ? undefined : '#9333ea',
              backgroundColor: isLoading ? undefined : '#9333ea',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: 500,
              fontSize: '14px',
              opacity: isLoading ? 0.5 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              border: 'none',
            }}
            className="hover:bg-purple-700 transition-colors"
          >
            {isLoading ? 'Consulting MiMo...' : 'Generate Outfit'}
          </button>
        </div>

        {/* Arrows — bottom right (grayed) */}
        <div style={{ position: 'absolute', bottom: '-1rem', right: 0, zIndex: 20, display: 'flex', gap: '8px' }}>
          <button disabled style={{ color: 'rgba(255,255,255,0.2)', cursor: 'not-allowed', background: 'none', border: 'none' }}>
            <ChevronLeft size={20} />
          </button>
          <button disabled style={{ color: 'rgba(255,255,255,0.2)', cursor: 'not-allowed', background: 'none', border: 'none' }}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // ============= POPULATED STATE =============
  const outfit = outfits[currentIndex];
  const { images, dividerCount } = getSections(outfit);

  // Calculate section heights (percentage)
  const sectionCount = images.length;
  const sectionHeight = sectionCount > 0 ? 100 / sectionCount : 100;
  const heights = images.map(() => sectionHeight);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '400px',
        perspective: '800px',
        background: '#000',
        overflow: 'hidden',
      }}
      className="md:h-[500px]"
    >
      {/* Reference div for background image management */}
      <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Image sections */}
        {images.map((url, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              width: '100%',
              height: `${heights[idx]}%`,
              top: `${heights.slice(0, idx).reduce((a, b) => a + b, 0)}%`,
              backgroundImage: url ? `url('${url}')` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              overflow: 'hidden',
            }}
          />
        ))}

        {/* Divider lines between sections */}
        {Array.from({ length: dividerCount }).map((_, idx) => {
          const dividerPos = ((idx + 1) * 100) / sectionCount;
          return (
            <div
              key={`divider-${idx}`}
              style={{
                position: 'absolute',
                top: `${dividerPos}%`,
                left: 0,
                width: '100%',
                height: '4px',
                background: '#000',
                zIndex: 10,
                transform: 'translateY(-50%)',
              }}
            />
          );
        })}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '12px', padding: '0 4px' }}>
        <button
          onClick={onDismiss}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '14px', cursor: 'pointer' }}
          className="hover:text-white transition-colors"
        >
          Dismiss
        </button>
        {outfits.length > 1 && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => {
              const next = (currentIndex - 1 + outfits.length) % outfits.length;
              setCurrentIndex(next);
            }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
              className="hover:text-white transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => {
              const next = (currentIndex + 1) % outfits.length;
              setCurrentIndex(next);
            }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
              className="hover:text-white transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
