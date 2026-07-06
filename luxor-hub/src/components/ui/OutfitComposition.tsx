import React from "react";

interface OutfitItem {
  url?: string;
  type?: string;
  label?: string;
  photo_url?: string;
}

interface OutfitCompositionProps {
  items: OutfitItem[];
  maxHeight?: string | number;
  minHeight?: string | number;
  className?: string;
}

/**
 * Renders a vertical split-screen layout for DressingRoom outfits,
 * matching the FlipGallery aesthetic (9:16 dark background, contain fit).
 * 
 * Handles outfit types:
 * - regular (top/mid/bottom) — 3 equal sections
 * - dress (top/bottom) — 2 equal sections  
 * - full_outfit — single full-height section
 * - fallback: just shows items in order
 */
export function OutfitComposition({ items, maxHeight, minHeight, className }: OutfitCompositionProps) {
  // Resolve best image URL from various key formats
  const resolveUrl = (item: OutfitItem): string | null => {
    return item?.url || item?.photo_url || null;
  };

  // Filter to items that have a valid image URL
  const validItems = items
    .map(item => ({ ...item, resolvedUrl: resolveUrl(item) }))
    .filter(item => item.resolvedUrl) as (OutfitItem & { resolvedUrl: string })[];

  if (validItems.length === 0) return null;

  // Order items: top → mid → bottom, preserving any extra items at the end
  const typeOrder = ['top', 'mid', 'bottom'];
  const orderedItems = [
    ...typeOrder.map(t => validItems.find(i => i.type === t)).filter(Boolean),
    ...validItems.filter(i => !typeOrder.includes(i.type || '')),
  ] as (OutfitItem & { resolvedUrl: string })[];

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    backgroundColor: '#0a0a0a',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    minHeight: typeof minHeight === 'number' ? minHeight : (minHeight as string) || '100px',
    ...(maxHeight ? { maxHeight: typeof maxHeight === 'number' ? maxHeight : maxHeight } : {}),
  };

  return (
    <div style={containerStyle} className={className}>
      {orderedItems.map((item, idx) => (
        <div
          key={idx}
          className={idx < orderedItems.length - 1 ? 'border-b border-[#1a1a1a]' : ''}
          style={{
            flex: 1,
            backgroundImage: `url(${item.resolvedUrl})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: '#0a0a0a',
          }}
        />
      ))}
    </div>
  );
}
