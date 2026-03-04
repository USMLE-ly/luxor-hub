

## Plan: Restore Hero, Fix Onboarding Selection UI, Add Closet Occasion Tabs, Handle WebGL Error

### Issues Identified

1. **Landing page missing Hero**: `Index.tsx` replaced the `Hero` component with `LuminaSlider` which depends on GSAP/THREE via CDN and is causing WebGL context errors. Need to restore the original `Hero` component.

2. **Onboarding radio indicators**: The reference screenshots show a clean circular radio indicator on the right side of each option card. Current implementation already has this but needs visual polish — the filled circle should be more prominent when selected.

3. **WebGL error on landing**: The `LuminaSlider` component uses global `gsap` and `THREE` via CDN script tags, causing `THREE.WebGLRenderer: Error creating WebGL context`. This blocks the entire landing page.

4. **Closet page missing occasion-based outfit tabs**: Reference shows "My Closet Outfits" section with Everyday, Weekend, Work, Party tabs with colored icons.

---

### Changes

#### 1. Restore Hero on Landing Page (`src/pages/Index.tsx`)
- Replace `LuminaSlider` with the existing `Hero` component import
- Remove the LuminaSlider import to eliminate WebGL dependency on landing

#### 2. Fix Onboarding Selection Feedback (`src/components/onboarding/StepRenderer.tsx`)
- For `bodyShape` type: ensure the circular radio indicator on the right fills with primary color when selected (already implemented but verify contrast)
- For generic radio/checkbox type: same — make the filled dot larger and more visible
- Add a subtle background color change on the entire card when selected (already has `bg-primary/10` — increase to `bg-primary/15`)

#### 3. Add Occasion Tabs to Closet (`src/pages/Closet.tsx`)
- Add "My Closet Outfits" section between the progress bars and the category filter pills
- Four tabs: Everyday (green icon), Weekend (pink icon), Work (orange icon), Party (purple icon)
- Each shows "0 OUTFITS" count based on items with matching `occasion` field
- Below tabs: 2-column grid with outfit preview cards and an "Add your items" placeholder card with hanger SVG

#### 4. Add Subcategory Filter Pills per Section (`src/pages/Closet.tsx`)
- Upper Body: All Upper Body, Jackets, Tops, Dresses, Coats, Blouses, Jumpsuits
- Lower Body: All Lower Body, Skirts, Jeans, Shorts, Pants
- Shoes: All Shoes, Shoes
- Accessories: All Accessories, Accessories, Jewelry, Bags
- Each section gets a horizontal scroll of pills matching the reference design

---

### Summary

| Action | File |
|--------|------|
| Edit | `src/pages/Index.tsx` — restore Hero component |
| Edit | `src/components/onboarding/StepRenderer.tsx` — polish radio indicators |
| Edit | `src/pages/Closet.tsx` — add occasion tabs + subcategory pills per section |

