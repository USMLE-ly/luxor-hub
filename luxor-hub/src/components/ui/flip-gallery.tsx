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
const flipTiming = { duration: FLIP_SPEED, iterations: 1 };

// Flip down animations for top, mid, bottom
const flipAnimationTop = [
  { transform: 'rotateX(0)' },
  { transform: 'rotateX(-90deg)' },
  { transform: 'rotateX(-90deg)' }
];
const flipAnimationMid = [
  { transform: 'rotateX(0)' },
  { transform: 'rotateX(-90deg)' },
  { transform: 'rotateX(-90deg)' }
];
const flipAnimationBottom = [
  { transform: 'rotateX(90deg)' },
  { transform: 'rotateX(90deg)' },
  { transform: 'rotateX(0)' }
];

// Flip up animations (Reverse)
const flipAnimationTopReverse = [
  { transform: 'rotateX(-90deg)' },
  { transform: 'rotateX(-90deg)' },
  { transform: 'rotateX(0)' }
];
const flipAnimationMidReverse = [
  { transform: 'rotateX(-90deg)' },
  { transform: 'rotateX(-90deg)' },
  { transform: 'rotateX(0)' }
];
const flipAnimationBottomReverse = [
  { transform: 'rotateX(0)' },
  { transform: 'rotateX(90deg)' },
  { transform: 'rotateX(90deg)' }
];

export default function FlipGallery({ outfits, onGenerate, onDismiss, isLoading }: FlipGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [outfits]);

  useEffect(() => {
    if (!containerRef.current || outfits.length === 0) return;
    const currentOutfit = outfits[currentIndex];

    const topEl = containerRef.current.querySelector('.unite.top') as HTMLElement;
    if (topEl) topEl.style.backgroundImage = `url('${currentOutfit.top}')`;
    const midEl = containerRef.current.querySelector('.unite.mid') as HTMLElement;
    if (midEl) midEl.style.backgroundImage = `url('${currentOutfit.mid}')`;
    const botEl = containerRef.current.querySelector('.unite.bottom') as HTMLElement;
    if (botEl) botEl.style.backgroundImage = `url('${currentOutfit.bottom}')`;
  }, [currentIndex, outfits]);

  const updateGallery = (nextIndex: number, isReverse: boolean = false) => {
    const gallery = containerRef.current;
    if (!gallery || outfits.length === 0) return;

    const topAnim = isReverse ? flipAnimationTopReverse : flipAnimationTop;
    const midAnim = isReverse ? flipAnimationMidReverse : flipAnimationMid;
    const botAnim = isReverse ? flipAnimationBottomReverse : flipAnimationBottom;

    gallery.querySelector('.overlay-top')?.animate(topAnim, flipTiming);
    gallery.querySelector('.overlay-mid')?.animate(midAnim, flipTiming);
    gallery.querySelector('.overlay-bottom')?.animate(botAnim, flipTiming);

    setTimeout(() => {
      setCurrentIndex(nextIndex);
    }, FLIP_SPEED / 2);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % outfits.length;
    updateGallery(nextIndex);
  };

  const handlePrev = () => {
    const nextIndex = (currentIndex - 1 + outfits.length) % outfits.length;
    updateGallery(nextIndex, true);
  };

  // --- EMPTY STATE (No Outfits Generated) ---
  if (outfits.length === 0) {
    return (
      <div className='relative w-full h-[400px] md:h-[500px]' style={{ perspective: '800px', background: '#0a0a0a' }}>
        {/* 3 Split Background placeholders */}
        <div className='absolute w-full h-[33.333%] top-0 bg-[#181818] border-b border-black z-0'></div>
        <div className='absolute w-full h-[33.333%] top-[33.333%] bg-[#111] border-b border-black z-0'></div>
        <div className='absolute w-full h-[33.333%] bottom-0 bg-[#0a0a0a] z-0'></div>

        {/* 2 black divider lines */}
        <div className='absolute top-[33.333%] left-0 w-full h-[4px] bg-black z-10 -translate-y-1/2'></div>
        <div className='absolute top-[66.666%] left-0 w-full h-[4px] bg-black z-10 -translate-y-1/2'></div>

        {/* Generate Button (Bottom Left) */}
        <div className='absolute bottom-[-1rem] left-[-0.5rem] z-20'>
          <button
            onClick={onGenerate}
            disabled={isLoading}
            className='bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isLoading ? 'Consulting MiMo...' : 'Generate Outfit'}
          </button>
        </div>

        {/* Arrows (Bottom Right - grayed out) */}
        <div className='absolute bottom-[-1rem] right-0 z-20 flex gap-2'>
          <button disabled className='text-white/20 cursor-not-allowed'><ChevronLeft size={20} /></button>
          <button disabled className='text-white/20 cursor-not-allowed'><ChevronRight size={20} /></button>
        </div>
      </div>
    );
  }

  // --- POPULATED STATE (Outfits Generated) ---
  return (
    <div className='relative w-full h-[400px] md:h-[500px]' style={{ perspective: '800px', background: '#000' }}>
      <div id='flip-gallery' ref={containerRef} className='relative w-full h-full'>
        {(() => {
          const outfit = outfits[currentIndex];
          const otype = outfit?.type || 'regular';

          if (otype === 'full_outfit') {
            // Full outfit: 1 image, 100% height
            return (
              <div className='unite full bg-cover bg-no-repeat bg-center'
                style={{ backgroundImage: `url('${outfit.top}')`, height: '100%', top: 0, left: 0, width: '100%', position: 'absolute' }}></div>
            );
          } else if (otype === 'dress') {
            // Dress: 1-split + shoes = 2 images (dress 50%, shoes 50%)
            return (
              <>
                <div className='dress-top bg-cover bg-no-repeat bg-center'
                  style={{ backgroundImage: `url('${outfit.top}')`, top: 0, left: 0, width: '100%', height: '50%', position: 'absolute' }}></div>
                {outfit.bottom && (
                  <div className='dress-bottom bg-cover bg-no-repeat bg-center'
                    style={{ backgroundImage: `url('${outfit.bottom}')`, bottom: 0, left: 0, width: '100%', height: '50%', position: 'absolute' }}></div>
                )}
                <style>{`
                  #flip-gallery::after { content: ''; position: absolute; background: black; width: 100%; height: 4px; top: 50%; left: 0; transform: translateY(-50%); z-index: 1; }
                  #flip-gallery::before { display: none; }
                `}</style>
              </>
            );
          } else {
            // Regular: 2-split = 3 sections (top 33%, bottom 33%, shoes 33%)
            return (
              <>
                <div className='unite top bg-cover bg-no-repeat bg-center'
                  style={{ backgroundImage: `url('${outfit.top}')` }}></div>
                <div className='unite mid bg-cover bg-no-repeat bg-center'
                  style={{ backgroundImage: `url('${outfit.mid}')` }}></div>
                {outfit.bottom && (
                  <div className='unite bottom bg-cover bg-no-repeat bg-center'
                    style={{ backgroundImage: `url('${outfit.bottom}')` }}></div>
                )}
              </>
            );
          }
        })()}
      </div>

      {/* Controls: Dismiss and Arrows */}
      <div className='flex justify-between items-center w-full mt-3 px-1'>
        <button onClick={onDismiss} className='text-sm text-white/60 hover:text-white transition-colors'>
          Dismiss
        </button>
        {outfits.length > 1 && (
          <div className='flex gap-3'>
            <button onClick={handlePrev} className='text-white/60 hover:text-white transition-colors'>
              <ChevronLeft size={20} />
            </button>
            <button onClick={handleNext} className='text-white/60 hover:text-white transition-colors'>
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      <style>{`
        #flip-gallery { position: relative; }
        #flip-gallery::after {
          content: ''; position: absolute; background-color: black; width: 100%; height: 4px;
          top: 33.333%; left: 0; transform: translateY(-50%); z-index: 1;
        }
        #flip-gallery::before {
          content: ''; position: absolute; background-color: black; width: 100%; height: 4px;
          top: 66.666%; left: 0; transform: translateY(-50%); z-index: 1;
        }
        #flip-gallery > .unite {
          position: absolute; width: 100%; height: 33.333%; overflow: hidden;
          background-size: cover; background-position: center;
        }
        .top, .overlay-top { top: 0; transform-origin: bottom; }
        .mid, .overlay-mid { top: 33.333%; transform-origin: bottom; }
        .bottom, .overlay-bottom { bottom: 0; transform-origin: top; }
      `}</style>
    </div>
  );
}
