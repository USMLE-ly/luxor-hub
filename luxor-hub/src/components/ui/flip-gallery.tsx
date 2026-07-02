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

const FLIP_SPEED = 750;

export default function FlipGallery({ outfits, onGenerate, onDismiss, isLoading }: FlipGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset index when outfits change
  useEffect(() => {
    setCurrentIndex(0);
  }, [outfits]);

  // Apply background images via inline styles (bypass Tailwind JIT)
  useEffect(() => {
    if (!containerRef.current || outfits.length === 0) return;
    const currentOutfit = outfits[currentIndex];
    if (!currentOutfit || typeof currentOutfit === 'string') {
      console.warn("[FlipGallery] Invalid outfit:", currentOutfit);
      return;
    }
    const topEl = containerRef.current.querySelector('.unite.top') as HTMLElement;
    const midEl = containerRef.current.querySelector('.unite.mid') as HTMLElement;
    const botEl = containerRef.current.querySelector('.unite.bottom') as HTMLElement;
    if (topEl && currentOutfit.top) topEl.style.backgroundImage = `url('${currentOutfit.top}')`;
    if (midEl && currentOutfit.mid) midEl.style.backgroundImage = `url('${currentOutfit.mid}')`;
    if (botEl && currentOutfit.bottom) botEl.style.backgroundImage = `url('${currentOutfit.bottom}')`;
  }, [currentIndex, outfits]);

  // Flip animation
  const flipTo = (nextIndex: number) => {
    const gallery = containerRef.current;
    if (!gallery || outfits.length === 0) return;
    const units = gallery.querySelectorAll('.unite');
    units.forEach((el) => {
      (el as HTMLElement).style.transform = 'rotateX(-90deg)';
      (el as HTMLElement).style.transition = 'transform 350ms ease-in-out';
    });
    setTimeout(() => {
      setCurrentIndex(nextIndex);
    }, FLIP_SPEED / 2);
  };

  const handleNext = () => flipTo((currentIndex + 1) % outfits.length);
  const handlePrev = () => flipTo((currentIndex - 1 + outfits.length) % outfits.length);

  // ============= EMPTY STATE =============
  if (outfits.length === 0) {
    return (
      <div style={{
        position: 'relative', width: '100%', height: '400px',
        perspective: '800px', backgroundColor: '#0a0a0a', overflow: 'hidden'
      }} className="md:h-[500px]">
        {/* 3 dark strips — inline styles only */}
        <div style={{ position: 'absolute', top: 0, height: '33.333%', width: '100%', backgroundColor: '#1A1A1A', borderBottom: '1px solid black', zIndex: 0 }} />
        <div style={{ position: 'absolute', top: '33.333%', height: '33.333%', width: '100%', backgroundColor: '#0a0a0a', borderBottom: '1px solid black', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: 0, height: '33.333%', width: '100%', backgroundColor: '#0a0a0a', zIndex: 0 }} />

        {/* 2 divider lines */}
        <div style={{ position: 'absolute', top: '33.333%', left: 0, width: '100%', height: '4px', backgroundColor: '#000', zIndex: 10, transform: 'translateY(-50%)' }} />
        <div style={{ position: 'absolute', top: '66.666%', left: 0, width: '100%', height: '4px', backgroundColor: '#000', zIndex: 10, transform: 'translateY(-50%)' }} />

        {/* Generate button — bottom-left (FIXED: inside frame, not clipped) */}
        <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', zIndex: 20 }}>
          <button
            onClick={onGenerate}
            disabled={isLoading}
            style={{
              backgroundColor: '#9333ea', color: 'white', padding: '8px 16px',
              borderRadius: '6px', fontWeight: 500, fontSize: '14px',
              border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1,
            }}
            className="hover:bg-purple-700 transition-colors"
          >
            {isLoading ? 'Consulting MiMo...' : 'Generate Outfit'}
          </button>
        </div>

        {/* Grayed arrows — bottom-right */}
        <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', zIndex: 20, display: 'flex', gap: '8px' }}>
          <button disabled style={{ color: 'rgba(255,255,255,0.2)', cursor: 'not-allowed', background: 'none', border: 'none' }}><ChevronLeft size={20} /></button>
          <button disabled style={{ color: 'rgba(255,255,255,0.2)', cursor: 'not-allowed', background: 'none', border: 'none' }}><ChevronRight size={20} /></button>
        </div>
      </div>
    );
  }

  // ============= POPULATED STATE =============
  const currentOutfit = outfits[currentIndex];
  if (!currentOutfit || typeof currentOutfit === 'string') return null;

  const type = currentOutfit.type || 'regular';
  // Build sections array based on type
  // regular -> [top, mid, bottom] = 3 sections, 2 dividers
  // dress   -> [top, bottom]       = 2 sections, 1 divider (top=dress, bottom=shoes)
  // full_outfit -> [top]            = 1 section, 0 dividers
  let sections: string[];
  if (type === 'full_outfit') {
    sections = [currentOutfit.top];
  } else if (type === 'dress') {
    sections = [currentOutfit.top, currentOutfit.bottom]; // dress + shoes
  } else {
    sections = [currentOutfit.top, currentOutfit.mid, currentOutfit.bottom];
  }

  const sectionCount = sections.length;
  const pct = 100 / sectionCount;

  return (
    <div style={{
      position: 'relative', width: '100%', height: '400px',
      perspective: '800px', backgroundColor: '#000', overflow: 'hidden'
    }} className="md:h-[500px]">
      <div id="flip-gallery" ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
        {sections.map((url, idx) => (
          <div
            key={idx}
            className={`unite ${type === 'regular' ? (idx === 0 ? 'top' : idx === 1 ? 'mid' : 'bottom') : ''}`}
            style={{
              position: 'absolute', top: `${idx * pct}%`, height: `${pct}%`, width: '100%',
              backgroundImage: url ? `url('${url}')` : undefined,
              backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
              overflow: 'hidden', transformOrigin: idx === sectionCount - 1 ? 'top' : 'bottom',
              transition: 'transform 350ms ease-in-out',
            }}
          />
        ))}

        {/* Dynamic dividers */}
        {Array.from({ length: sectionCount - 1 }).map((_, i) => (
          <div
            key={`d-${i}`}
            style={{
              position: 'absolute', top: `${pct * (i + 1)}%`, left: 0, width: '100%', height: '4px',
              backgroundColor: '#000', transform: 'translateY(-50%)', zIndex: 10,
            }}
          />
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '12px', padding: '0 4px' }}>
        <button onClick={onDismiss} style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer' }}
          className="hover:text-white transition-colors">Dismiss</button>
        {outfits.length > 1 && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handlePrev} style={{ color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer' }}
              className="hover:text-white transition-colors"><ChevronLeft size={20} /></button>
            <button onClick={handleNext} style={{ color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer' }}
              className="hover:text-white transition-colors"><ChevronRight size={20} /></button>
          </div>
        )}
      </div>
    </div>
  );
}
