import type { OutfitImages } from "./flip-gallery";

export function getSections(o: OutfitImages): { sections: string[]; count: number } {
  let raw: string[];
  if (o.type === 'full_outfit') raw = [o.top];
  else if (o.type === 'dress') raw = [o.top, o.bottom];
  else raw = [o.top, o.mid, o.bottom];
  // Only include sections with valid image URLs — skip empty slots
  const sections = raw.filter((url) => url && url.startsWith('http'));
  return { sections, count: Math.max(sections.length, 1) };
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
