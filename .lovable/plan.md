

# Luxury Brand Integration + Animated Testimonial Card Stack

## Overview

Three workstreams: (1) integrate the brand guide typography (Cormorant Garamond + Josefin Sans) and extract usable assets from the 195-image zip, (2) re-implement the scroll-driven animated card stack for testimonials in its own isolated section, and (3) add stagger/parallax animations to the existing grid cards.

---

## 1. Brand Guide Typography Integration

**What**: The uploaded brand guide specifies two luxury fonts — **Cormorant Garamond** (display/headings) and **Josefin Sans** (body/UI). Currently the site uses Playfair Display + Inter.

**Changes**:
- **`src/index.css`** — Update the Google Fonts import to include `Cormorant+Garamond:wght@300;400;500;600;700` and `Josefin+Sans:wght@300;400;500;600;700`. Keep Playfair Display as a fallback. Update the `body` font-family to `'Josefin Sans'` and headings to `'Cormorant Garamond'`.
- **`tailwind.config.ts`** — Update `fontFamily.display` to `['"Cormorant Garamond"', 'serif']` and `fontFamily.sans` to `['"Josefin Sans"', 'sans-serif']`.

This gives the entire site a more refined, editorial luxury feel while requiring minimal code changes.

---

## 2. Extract & Integrate Zip Assets

**What**: Copy `Luxor_layers.zip` to the sandbox, unzip, and catalog the 195 images. Select key brand assets (logos, patterns, textures, lifestyle imagery) and copy them into `src/assets/brand/` for use across the site.

**Process**:
- Unzip to `/tmp/Luxor_layers/`
- List and categorize files by type (logos, patterns, backgrounds, product shots)
- Copy the most impactful assets (up to ~20 key images) into `src/assets/brand/`
- Use select images as section backgrounds, hero overlays, or card imagery where appropriate

---

## 3. Isolated Scroll-Driven Animated Card Stack

**What**: The current "What Our Clients Say" section uses a simple 2x2 grid. Re-implement the scroll-driven `CardStackScroll` + `CardTransformed` card stack in its own `<section>` **outside** the `AnimatedGradientBackground` overflow container, so sticky positioning works correctly.

**File**: `src/components/landing/Testimonials.tsx`

**Structure**:
```text
<section id="proof">                    ← Real Results section (existing)
  <AnimatedGradientBackground />
  <div z-10> ... screenshots ... </div>
</section>

<section>                               ← NEW isolated section
  <CardStackScroll className="h-[200vh]">
    <div className="sticky top-0 h-screen">
      <CardsContainer>
        {TESTIMONIALS.map((t, i) => (
          <CardTransformed variant="dark" index={i+2} arrayLength={4}>
            <ReviewStars />
            <blockquote>...</blockquote>
            <name/profession>
          </CardTransformed>
        ))}
      </CardsContainer>
    </div>
  </CardStackScroll>
</section>
```

Key decisions:
- `h-[200vh]` for tighter scroll (not 300vh)
- `variant="dark"` to match the dark theme
- No avatars — text-only cards with stars, quote, name, profession
- Section gets its own dark background, no `AnimatedGradientBackground` overlap

---

## 4. Stagger & Parallax on Grid Cards (Keep Both)

**What**: Keep the existing 2x2 grid as a visible fallback above the card stack, but enhance it with stagger and parallax effects.

**Changes to the grid cards**:
- Increase stagger delay from `index * 0.1` to `index * 0.15`
- Add a subtle scale animation: `initial={{ opacity: 0, y: 40, scale: 0.95 }}` → `whileInView={{ opacity: 1, y: 0, scale: 1 }}`
- Add hover parallax: `whileHover={{ y: -6, transition: { type: "spring", stiffness: 300 } }}`
- Add a subtle gold border glow on hover: `hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5`

---

## 5. Verify Everything

- Scroll the landing page end-to-end
- Confirm the grid cards appear after "Real Results"
- Confirm the card stack animates correctly below the grid
- Confirm new fonts render on headings and body text

---

## Technical Notes

- No new npm dependencies needed (Cormorant Garamond and Josefin Sans are Google Fonts loaded via CSS)
- The card stack uses existing `CardStackScroll`, `CardsContainer`, `CardTransformed` from `animated-cards-stack.tsx`
- The `.ai` and `.sketch` files are binary design files — not directly usable in code, but the PDF instructions extracted the key brand specs

