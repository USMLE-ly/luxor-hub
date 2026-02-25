

## Plan: Apply Luxury PDF Design Language + Fix Video Size + Fix Truncated Analysis Text + Click-to-Expand Detected Items

### PDF Design Analysis

The 9 PDF template pages share consistent luxury design principles:

1. **Color Palette**: Deep teal/navy backgrounds (`#1B4D5C` to `#1A3A4A`) with warm copper/orange accents (`#D4845C`), clean whites, and muted warm tones. NOT gold-and-black.
2. **Typography**: Serif display headings (bold, large), clean sans-serif body text with generous letter-spacing (especially for uppercase labels like "CHAPTER", "AUTHOR NAME")
3. **Layout**: Two-column magazine-style layouts, generous whitespace, asymmetric image + text pairings, thin gold/copper horizontal rule dividers
4. **Cards**: Rounded corners, soft shadows, image-heavy with minimal text overlays
5. **Visual Hierarchy**: Large number markers ("01", "02"), subtle overlays on images, elegant cursive accents for section titles
6. **Overall Mood**: Editorial luxury, clean and airy with strategic dark sections

### Problems from Screenshot

The user's screenshot shows the Outfit Analysis page with:
1. **Detected Items text truncated** — "Ribbe...", "Wid...", "Pat...", "R...", "H..." — names are being cut off
2. **Strengths text truncated** — though chips show full text now, they're cramped
3. **Improvements text truncated** — "Try a suede loafer in ...", "Add a thin leather bel...", "Layer a subtle gold pe..." — text is being cut off
4. **Video size** — user says "Make the edit of video make the size as first time we did" — the original code in the provided context had `mediaWidth = 500 + scrollProgress * (isMobile ? 450 : 1050)` and `mediaHeight = 400 + scrollProgress * (isMobile ? 200 : 400)` which is currently what's set. The video seems correct now, but the user may be referring to how it looked originally before any changes.

### Changes

#### 1. Apply PDF Luxury Design Language to Landing Page

The PDF designs use a teal/navy + copper/orange color scheme, not gold-and-black. However, the user asked us to "use it in our website" — I'll adapt the design *principles* (editorial layouts, serif typography, generous whitespace, thin decorative dividers, magazine-style image placements) while keeping the existing gold-and-black brand palette since the user specifically chose gold previously.

Key design elements to apply:
- **Thin horizontal gold dividers** (seen in every PDF page as decorative rules)
- **Large serif chapter-style numbering** for How It Works steps (PDF pages show "01", "02" style)
- **More editorial whitespace** and cleaner card layouts
- **Subtle gradient overlays** on images
- **Elegant cursive or italic accent text** for section subtitles

**Files**: `src/components/landing/HowItWorks.tsx`, `src/components/landing/Features.tsx`, `src/components/landing/Pricing.tsx`, `src/components/landing/Footer.tsx`

#### 2. Fix Video Size (Keep at Original)

The current code already has `mediaWidth = 500` and `mediaHeight = 400` as starting values, which is the "first time" size. No change needed here — the values are already correct per the last diff.

#### 3. Fix Detected Items Truncation

**File**: `src/pages/OutfitAnalysis.tsx`

The screenshot clearly shows item names being cut to "Ribbe...", "Wid...", etc. The current code at line 885 has `flex-1` on the name span but the container is too narrow in the 3-column grid on mobile. Fix:
- Remove the flex row constraint that causes truncation
- Stack name, category, and color vertically in each item card
- Make items expandable (click-to-expand showing color, style, category details)

#### 4. Fix Improvements Text Truncation

The screenshot shows improvement suggestions cut off. The current code (lines 938-955) should show full text, but the 3-column grid makes each column too narrow on tablets. Fix:
- On mobile/tablet, make the bottom row stack to 1 column instead of 3
- Ensure no text overflow/truncation classes are applied

#### 5. Click-to-Expand Detail View for Detected Items

Add an expandable state per detected item. When clicked, the card expands to show:
- Full item name
- Color swatch + color name
- Style tag
- Category badge

Use Framer Motion `AnimatePresence` + `layoutId` for smooth expand/collapse.

### Files to Modify

- `src/pages/OutfitAnalysis.tsx` — Fix truncation in Detected Items (click-to-expand), fix Improvements column width, ensure full text display
- `src/components/landing/HowItWorks.tsx` — Apply PDF editorial design: large serif numbering, thin gold dividers, more whitespace
- `src/components/landing/Features.tsx` — Add thin gold decorative dividers, editorial spacing inspired by PDF
- `src/components/landing/Footer.tsx` — Add thin gold top rule divider (already has one), refine spacing to match PDF elegance
- `src/components/landing/Pricing.tsx` — Minor spacing refinements

### Technical Details

**Detected Items Click-to-Expand**: Each `motion.div` item gets an `onClick` handler toggling `expandedItem` state (index-based). When expanded, the card grows to show a detail panel with color name, style, and category in a clean layout. Uses `AnimatePresence` for enter/exit animations.

**Truncation Fix**: The 3-column grid (`grid md:grid-cols-3`) for the bottom row (Detected Items + Strengths + Improvements) causes items to be too narrow on tablet. Change to `grid md:grid-cols-2 lg:grid-cols-3` and ensure no `truncate` or `overflow-hidden` classes cut off text on the inner elements. The screenshot shows the sidebar is also visible, further reducing available width.

**PDF Design Adaptation**: The key visual elements from the PDF templates that translate well to web:
- Thin horizontal decorative rules (1px gold gradient lines) between sections
- Large display numbers ("01", "02", "03", "04") for the How It Works steps, styled in a light serif font with low opacity — matching the PDF's chapter numbering style
- Generous vertical padding (py-32+) already present
- Clean card borders with subtle shadows

