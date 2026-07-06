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
  aspectRatio?: string;
  showDividers?: boolean;
}

const GLASS_DIVIDER: React.CSSProperties = {
  position: 'absolute',
  left: '8%',
  width: '84%',
  height: '1px',
  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), rgba(255,255,255,0.06), transparent)',
  zIndex: 10,
  boxShadow: '0 0 8px rgba(255,255,255,0.04)',
};

/**
 * Renders a vertical split-screen layout for outfits,
 * matching the FlipGallery premium aesthetic (dark background,
 * contain fit, glass dividers, section expansion).
 *
 * Outfit types:
 * - regular (top/mid/bottom) — 3 equal sections
 * - dress (top/bottom) — 2 equal sections  
 * - full_outfit — single full-height section
 * - fallback: items in order
 */
export function OutfitComposition({ items, maxHeight, minHeight, className, aspectRatio, showDividers = true }: OutfitCompositionProps) {
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
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    backgroundColor: '#0a0a0a',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    minHeight: typeof minHeight === 'number' ? minHeight : (minHeight as string) || '100px',
    ...(maxHeight ? { maxHeight: typeof maxHeight === 'number' ? maxHeight : maxHeight } : {}),
    ...(aspectRatio ? { aspectRatio } : {}),
    boxShadow: 'inset 0 0 30px rgba(255,255,255,0.02)',
  };

  return (
    <div style={containerStyle} className={className}>
      {orderedItems.map((item, idx) => (
        <React.Fragment key={idx}>
          <div
            style={{
              flex: 1,
              backgroundImage: `url(${item.resolvedUrl})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundColor: '#0a0a0a',
            }}
          />
          {showDividers && idx < orderedItems.length - 1 && (
            <div style={GLASS_DIVIDER} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
