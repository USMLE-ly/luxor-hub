

# Premium Auth Pages Upgrade

## What Changes

Elevate the Sign In, Sign Up, Forgot Password, and Reset Password pages to a luxury editorial standard matching the LEXOR® brand.

## Visual Upgrades (All 3 Pages)

### 1. Animated Gold Gradient Divider
- Add a thin animated gold shimmer line between the logo and the form
- Uses the same gold gradient animation (hsl 38-48) from the onboarding style formula

### 2. Golden Gradient Toggle Links
- "Don't have an account? **Sign up**" and "Forgot your password?" become gold gradient text with hover glow
- Replace plain muted text with styled gold-accented links that feel premium

### 3. Premium Input Focus States
- Add a subtle gold border glow on input focus (golden box-shadow ring)
- Inputs get a slight inner gold shimmer on focus

### 4. Decorative Brand Element
- Add a subtle gold decorative line/ornament above and below the LEXOR® logo in the card
- Small crown or diamond accent next to the subtitle text

### 5. Enhanced Card Container
- Add a subtle animated gold border (thin 1px with shimmer sweep)
- Increase glassmorphism depth with a second backdrop layer
- Add a faint gold radial gradient at the top of the card

### 6. Button Upgrade
- Remove Sparkles icon (per brand rules)
- Add subtle gold shimmer sweep animation across the submit button on idle
- Enhance hover state with a brighter gold glow

### 7. Floating Gold Particles
- Add a few floating gold particle dots in the background (matching splash screen aesthetic)
- Subtle, slow-moving, low opacity

## Files Modified

- **`src/pages/Auth.tsx`** — Premium card styling, gold gradient toggle links, animated decorations, floating particles, enhanced input focus
- **`src/pages/ForgotPassword.tsx`** — Same premium treatment, remove Sparkles icon, gold accents
- **`src/pages/ResetPassword.tsx`** — Same premium treatment, remove Sparkles icon, gold accents

## Technical Details

- All animations use framer-motion (already imported)
- Gold gradient values: `hsl(38, 72%, 42%)` to `hsl(48, 80%, 58%)` (existing brand tokens)
- No new dependencies needed
- CSS shimmer animation via Tailwind `@keyframes` or inline motion

