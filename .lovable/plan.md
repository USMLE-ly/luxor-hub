

## Verification Results

**Landing page**: BackgroundBoxes grid renders behind the hero. GlowingEffect borders active on Features BentoGrid cards. Spotlight effect visible. 3D Spline robot loads (still the robot model -- separate issue). No JS errors.

**Pricing section**: Currently uses the original glassmorphism cards. CreativePricing component exists but is not integrated.

**Dashboard**: Uses basic glass stat cards. DisplayCards component exists but is not integrated.

## Implementation Plan

### Task 1: Replace Pricing Section with CreativePricing

**File**: `src/components/landing/Pricing.tsx`

Rewrite to use the `CreativePricing` component with AURELIA-branded tiers:
- Map existing Free/Pro/Elite tiers to `PricingTier` format (using euro prices converted: 0, 19, 99)
- Use `Crown`, `Sparkles`, `Star` icons matching the brand
- Custom props: `tag="Invest in Style"`, `title="Choose Your Plan"`, `description="From free styling to elite personal service"`
- Wrap in `useNavigate` so CTA buttons route to `/auth`
- Keep section id="pricing" for scroll navigation

### Task 2: Add DisplayCards to Dashboard

**File**: `src/pages/Dashboard.tsx`

Insert a `DisplayCards` component between the welcome header and stats grid:
- 3 stacked cards showing: "Closet Items" (count), "Style Score" (value), "Outfits Created" (count)
- Use gold/primary themed icon colors matching the brand
- Cards pull from the existing `stats` state object
- Import `DisplayCards` from `@/components/ui/display-cards`

### Task 3: Premium Landing Page Upgrades

**File**: `src/components/landing/Hero.tsx`
- Add `InteractiveHoverButton` for the "See How It Works" CTA (replacing plain outline button)
- Replace "Start Free" button with `RainbowButton` for maximum visual impact
- Add subtle floating animated badges using `motion` (e.g., "10K+ Users", "AI-Powered") as social proof chips

**File**: `src/components/landing/HowItWorks.tsx`
- Wrap each step card in a `GlowingEffect` container for mouse-tracking glow, matching the Features section treatment
- Add a connecting line/path between steps using CSS pseudo-elements for visual flow

**File**: `src/components/landing/Navbar.tsx`
- Replace "Get Started" button with `RainbowButton` for consistent premium CTA
- Add subtle logo glow animation on hover

**File**: `src/components/landing/Footer.tsx`
- Upgrade to a richer footer: add social links row, newsletter CTA, and "Built with AI" trust badge
- Add subtle top-border gold gradient

### Task 4: Dashboard Premium Overhaul

**File**: `src/pages/Dashboard.tsx`
- Wrap stat cards in `GlowingEffect` containers
- Add `DisplayCards` stack for the "Today's Quick Stats" visual showcase
- Add animated number counters for stats (count-up on mount)
- Add a "Quick Actions" row with `InteractiveHoverButton` components for common actions (Go to Closet, Analyze Outfit, Chat with AI)

### Task 5: Outfit Analysis Page Polish

**File**: `src/pages/OutfitAnalysis.tsx`
- Already has GlowingEffect and animated score ring
- Add `RainbowButton` for the "Analyze My Outfit" primary CTA
- Add staggered card reveal animations for the results section
- Add a shimmer/skeleton loading state during analysis with premium animation

### Task 6: Global Micro-Interactions & Motion System

**File**: `src/index.css`
- Add custom CSS for smooth page transitions
- Add `.hover-lift` utility: `transform: translateY(-2px); box-shadow: 0 8px 25px -5px rgba(0,0,0,0.1)`
- Add `.gold-shimmer` keyframe animation for premium text effects
- Add scroll-triggered fade-in utility classes

**File**: `tailwind.config.ts`
- Add `hover-lift`, `shimmer`, `float` animations
- Add `gold-shimmer` keyframes for text shine effects

### Task 7: Mobile-Specific Optimizations

**File**: `src/components/landing/Hero.tsx`
- Hide Spline 3D on mobile (below `lg`) and show a static gradient/image fallback for performance
- Stack CTAs vertically on mobile with full-width buttons
- Reduce heading size further on `sm` breakpoints

**File**: `src/components/landing/Features.tsx`
- Single column on mobile with reduced gap
- Disable GlowingEffect on touch devices (no hover)

### Execution Order
1. Pricing replacement (quick win, high visual impact)
2. Dashboard DisplayCards integration
3. Hero/Navbar premium buttons
4. HowItWorks GlowingEffect treatment
5. Footer upgrade
6. Dashboard GlowingEffect + quick actions
7. Global animations and mobile optimizations

