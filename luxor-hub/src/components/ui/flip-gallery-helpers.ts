import type { OutfitImages } from "./flip-gallery";

export function getSections(o: OutfitImages): { sections: string[]; count: number } {
  if (o.type === 'full_outfit') return { sections: [o.top], count: 1 };
  if (o.type === 'dress') return { sections: [o.top, o.bottom], count: 2 };
  return { sections: [o.top, o.mid, o.bottom], count: 3 };
}

export const SECTION_BASE: React.CSSProperties = {
  position: 'absolute', left: 0, width: '100%',
  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
};

export const DIVIDER_STYLE: React.CSSProperties = {
  position: 'absolute', left: '8%', width: '84%', height: '1px',
  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), rgba(255,255,255,0.06), transparent)',
  transform: 'translateY(-50%)', zIndex: 10, boxShadow: '0 0 8px rgba(255,255,255,0.04)',
};

export const FLIP_SPEED = 400;
export const DOMINO_DELAY = 150;

export const preloadImage = (url: string | undefined | null): Promise<void> => {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    if (!url) { resolve(); return; }
    img.src = url;
  });
};
