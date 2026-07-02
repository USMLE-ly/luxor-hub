import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FlipGalleryProps {
  images: string[];
  onGenerate: () => void;
  onDismiss: () => void;
  isLoading: boolean;
}

const FLIP_SPEED = 750;
const flipTiming = { duration: FLIP_SPEED, iterations: 1 };

const flipAnimationTop = [
  { transform: 'rotateX(0)' },
  { transform: 'rotateX(-90deg)' },
  { transform: 'rotateX(-90deg)' }
];
const flipAnimationBottom = [
  { transform: 'rotateX(90deg)' },
  { transform: 'rotateX(90deg)' },
  { transform: 'rotateX(0)' }
];
const flipAnimationTopReverse = [
  { transform: 'rotateX(-90deg)' },
  { transform: 'rotateX(-90deg)' },
  { transform: 'rotateX(0)' }
];
const flipAnimationBottomReverse = [
  { transform: 'rotateX(0)' },
  { transform: 'rotateX(90deg)' },
  { transform: 'rotateX(90deg)' }
];

export default function FlipGallery({ images, onGenerate, onDismiss, isLoading }: FlipGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [images]);

  useEffect(() => {
    if (!containerRef.current || images.length === 0) return;
    const uniteElements = containerRef.current.querySelectorAll('.unite');
    uniteElements.forEach((el) => {
      (el as HTMLElement).style.backgroundImage = `url('${images[currentIndex]}')`;
    });
  }, [currentIndex, images]);

  const updateGallery = (nextIndex: number, isReverse: boolean = false) => {
    const gallery = containerRef.current;
    if (!gallery || images.length === 0) return;
    const topAnim = isReverse ? flipAnimationTopReverse : flipAnimationTop;
    const bottomAnim = isReverse ? flipAnimationBottomReverse : flipAnimationBottom;
    gallery.querySelector('.overlay-top')?.animate(topAnim, flipTiming);
    gallery.querySelector('.overlay-bottom')?.animate(bottomAnim, flipTiming);
    setTimeout(() => {
      setCurrentIndex(nextIndex);
    }, FLIP_SPEED / 2);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % images.length;
    updateGallery(nextIndex);
  };

  const handlePrev = () => {
    const nextIndex = (currentIndex - 1 + images.length) % images.length;
    updateGallery(nextIndex, true);
  };

  // --- EMPTY STATE (No Outfits Generated) ---
  if (images.length === 0) {
    return (
      <div id="flip-gallery-empty" className='relative w-full h-[400px] md:h-[500px]' style={{ perspective: '800px' }}>
        {/* Split-screen dark placeholders */}
        <div className='top unite bg-black'></div>
        <div className='bottom unite bg-black'></div>
        <div className='overlay-top unite bg-black'></div>
        <div className='overlay-bottom unite bg-black'></div>

        {/* Black divider line */}
        <div className='divider-line absolute top-1/2 left-0 w-full h-[4px] bg-black z-10 -translate-y-1/2'></div>

        {/* Generate button where "Joshua Hibbert" was (bottom-left) */}
        <div className='absolute bottom-[-1rem] left-[-0.5rem] z-20'>
          <button
            onClick={onGenerate}
            disabled={isLoading}
            className='bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isLoading ? 'Consulting MiMo...' : 'Generate Outfit'}
          </button>
        </div>

        {/* Grayed-out arrows (bottom-right) */}
        <div className='absolute bottom-[-1rem] right-0 z-20 flex gap-2'>
          <button disabled className='text-white/20 cursor-not-allowed'><ChevronLeft size={20} /></button>
          <button disabled className='text-white/20 cursor-not-allowed'><ChevronRight size={20} /></button>
        </div>

        <style>{`
          #flip-gallery-empty { position: relative; }
          #flip-gallery-empty .unite { position: absolute; width: 100%; height: 50%; overflow: hidden; }
          #flip-gallery-empty .top, #flip-gallery-empty .overlay-top { top: 0; transform-origin: bottom; }
          #flip-gallery-empty .bottom, #flip-gallery-empty .overlay-bottom { bottom: 0; transform-origin: top; }
        `}</style>
      </div>
    );
  }

  // --- POPULATED STATE ---
  return (
    <div className='relative bg-white/10 border border-white/25 p-2 w-full max-w-[300px] mx-auto'>
      <div
        id='flip-gallery'
        ref={containerRef}
        className='relative w-full h-[400px] md:h-[500px] text-center'
        style={{ perspective: '800px' }}
      >
        <div className='top unite bg-cover bg-no-repeat'></div>
        <div className='bottom unite bg-cover bg-no-repeat'></div>
        <div className='overlay-top unite bg-cover bg-no-repeat'></div>
        <div className='overlay-bottom unite bg-cover bg-no-repeat'></div>
      </div>

      <div className='flex justify-between items-center w-full mt-3 px-1'>
        <button onClick={onDismiss} className='text-sm text-white/60 hover:text-white transition-colors'>
          Dismiss
        </button>
        {images.length > 1 && (
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
        #flip-gallery::after {
          content: '';
          position: absolute;
          background-color: black;
          width: 100%;
          height: 4px;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          z-index: 1;
        }
        #flip-gallery > * {
          position: absolute;
          width: 100%;
          height: 50%;
          overflow: hidden;
          background-size: cover;
          background-position: center;
        }
        .top, .overlay-top { top: 0; transform-origin: bottom; }
        .bottom, .overlay-bottom { bottom: 0; transform-origin: top; }
      `}</style>
    </div>
  );
}
