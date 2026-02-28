

## Plan: Right-align CTAs, Parallax Features, Newsletter Backend

### 1. Move hero CTA buttons to extreme right
**File: `src/components/ui/lumina-slider.css`**
- Change `.lumina-hero-overlay` from `left: 5%` → `right: 5%`, `align-items: flex-start` → `align-items: flex-end`
- Mobile: keep `right: 6%`, `align-items: flex-end`

### 2. Add parallax to Features bento grid cards
**File: `src/components/landing/Features.tsx`**
- Already implemented — each `FeatureCard` already has `useScroll` + `useTransform` producing a `illustrationY` parallax on the illustration images
- Add a subtle whole-card vertical parallax: wrap each card's outer motion with a `useTransform` that shifts the entire card 15px down→up as it scrolls through viewport, creating a staggered float effect

### 3. Newsletter backend
**Database migration:**
- Create `newsletter_subscribers` table with `id`, `email` (unique), `subscribed_at`, and RLS policy allowing anonymous inserts (public signup form)

**File: `src/components/landing/Footer.tsx`**
- Import Supabase client
- On form submit, insert email into `newsletter_subscribers` table
- Show success/error toast feedback

### 4. Verify via browser testing
- Scroll desktop and mobile viewports to confirm button positioning, back-to-top, pricing animations, and parallax effects

### Technical details
- The `newsletter_subscribers` table uses a permissive INSERT policy for anon role (public form) but restricts SELECT/UPDATE/DELETE to authenticated admin users
- Parallax on feature cards uses the existing Framer Motion `useScroll`/`useTransform` pattern already in the codebase
- No new dependencies needed

