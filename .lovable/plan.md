

# Remove Testimonial Section, Add iPhone Glow, Fix Gap

## Changes

### 1. Remove "What Our Clients Say" entirely
**File**: `src/components/landing/Testimonials.tsx`
- Delete the entire "Testimonial Grid" section (lines 185-235) — the 2x2 grid with heading "What Our Clients Say"
- Delete the entire "Scroll-driven animated card stack" section (lines 237-285) — the CardStackScroll with sticky cards
- Keep only the "Real Results. Real Revenue." section (lines 97-183)
- Remove unused imports: `CardStackScroll`, `CardsContainer`, `CardTransformed`, `ReviewStars`, and the `TESTIMONIALS` array

### 2. Add subtle glow/reflection below iPhone mockup
**File**: `src/components/landing/Features.tsx`
- Add a radial gradient glow element below the mockup: a `div` with `bg-gradient-radial from-primary/15 via-primary/5 to-transparent` positioned below the phone, blurred (`blur-3xl`), creating a luxury reflection effect
- Reduce bottom padding of the section from `py-16 md:py-24` to `py-16 md:py-20` to tighten spacing

### 3. Fix large gap between Features and HowItWorks
**File**: `src/components/landing/Features.tsx`
- Change section padding from `py-16 md:py-24` to `pt-16 md:pt-24 pb-8 md:pb-12`

**File**: `src/components/landing/HowItWorks.tsx`
- Reduce top padding if needed (check current values)

### 4. Publish
- Use publish tools to push all changes live

