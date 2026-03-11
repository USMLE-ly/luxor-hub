

## Premium Landing Page Rebuild — Top 1% Execution

### Critical Issues Identified

1. **Navbar**: No active state indicator on first load, logo lacks icon/mark, "Get Started" and "Log In" both go to `/auth` (redundant)
2. **Hero**: CTA buttons have `pointer-events-auto` but parent has `pointer-events: none` — fragile. Scroll indicator uses `animate-bounce` (cheap feel). No Ken Burns zoom on static slides
3. **Social Proof**: Missing "As seen in" media logos (Vogue, Forbes etc.) — stats alone lack authority
4. **Features Grid**: Dashed border aesthetic feels dev-tool, not luxury. No feature expansion/detail on click
5. **Pricing**: PricingInteraction selection indicator height is hardcoded `88px` — breaks if content height varies. Card backgrounds are white-only, ignoring dark mode in the component
6. **Proof Section**: Hero card spans full width but image is same height as others — wasted space. No horizontal scroll on mobile
7. **CTA Banner**: "Book a Demo" button leads nowhere
8. **Footer**: Newsletter insert uses `as any` cast — table may not exist
9. **Mobile**: Hero slide nav titles hidden but no replacement indicator. Proof cards stack vertically with no visual break
10. **Motion**: `will-change` missing on heavy animated elements. Multiple competing gradient backgrounds create paint storms

---

### Upgrade Plan (11 files)

#### 1. `src/components/landing/Navbar.tsx`
- Add a gold diamond/sparkle icon mark before "AURELIA" text
- Change "Log In" to scroll to pricing on desktop (differentiate from "Get Started")
- Add `will-change: transform` to the nav-underline layoutId motion div
- Mobile sheet: close sheet on nav link click (currently stays open)

#### 2. `src/components/landing/Hero.tsx`
- Replace `animate-bounce` scroll indicator with a custom smooth CSS animation (translateY 0→6px with ease-in-out, 2s duration)
- Add Ken Burns subtle zoom: scale the current texture from 1.0 to 1.05 over the slide duration using a CSS transform on the canvas wrapper
- Stagger CTA buttons: first button appears immediately, second 200ms later using inline `style={{ animationDelay }}`
- Remove `pointer-events: none` from `.slide-content` parent — apply it only to non-interactive children

#### 3. `src/components/landing/SocialProofStrip.tsx`
- Add a row of media logos above stats: "As Featured In" with Vogue, GQ, Forbes, Elle as grayscale text badges (no images needed — use styled `<span>` elements)
- Increase stat font size on desktop from `text-3xl md:text-4xl` to `text-4xl md:text-5xl`
- Add a subtle gold underline accent below each stat value

#### 4. `src/components/landing/Features.tsx`
- Replace dashed grid border with subtle card separation: remove `divide-x divide-y divide-dashed border border-dashed`, add individual `glass` cards with `gap-4` in grid
- Each card gets `premium-card hover-lift` classes for gold glow on hover
- Add a "Learn more →" micro-link at bottom of each card description (scrolls to how-it-works)

#### 5. `src/components/landing/Testimonials.tsx`
- Hero proof card: increase image height to `h-72 md:h-80` and add a semi-transparent gold gradient overlay
- Mobile: convert remaining proof cards to horizontal scroll container (`flex overflow-x-auto snap-x snap-mandatory`) instead of stacking vertically
- Add subtle card rotation on hover: `hover:rotate-[0.5deg]` for organic feel

#### 6. `src/components/landing/Pricing.tsx`
- Feature cards: add staggered hover — when hovering a tier card, slightly dim the others (opacity transition)
- Add "Save X%" badge next to yearly prices in the PricingInteraction component
- Add annual savings callout below the period toggle: "Save up to 20% annually"

#### 7. `src/components/ui/pricing-interaction.tsx`
- Fix hardcoded `h-[88px]` selection indicator — use `ref` measurement or remove the absolute indicator, use border-color transition instead (already partially there)
- Add yearly savings badge: when period is 1, show a green "Save X%" pill next to each price

#### 8. `src/components/landing/CTABanner.tsx`
- Remove "Book a Demo" button (leads nowhere, breaks trust)
- Add floating gold particle dots behind CTA using CSS pseudo-elements with `animate-pulse` at staggered delays
- Add urgency micro-copy: "Join 12,000+ stylists already using AURELIA"

#### 9. `src/components/landing/Footer.tsx`
- Remove `as any` casts on supabase insert — add proper error handling or remove newsletter functionality if table doesn't exist
- Add a "Back to top" smooth scroll at mobile bottom
- Add LinkedIn icon to social links

#### 10. `src/components/landing/BrandMarquee.tsx`
- Add fade masks on left/right edges (CSS gradient mask-image) for premium infinite scroll feel
- Add LinkedIn logo to brand list

#### 11. `src/index.css`
- Add custom scroll indicator keyframe replacing `animate-bounce`:
  ```css
  @keyframes scroll-hint {
    0%, 100% { transform: translateY(0); opacity: 0.6; }
    50% { transform: translateY(6px); opacity: 0.3; }
  }
  ```
- Add `will-change: transform` to `.premium-card`, `.gradient-button`
- Mobile: reduce hero `.slide-content` bottom from `22%` to `25%` to prevent CTA overlap with nav
- Add horizontal scroll snap utilities for mobile proof cards

---

### Execution Priority
1. Hero polish (scroll indicator, CTA stagger, pointer-events fix)
2. Features grid redesign (dashed → glass cards)
3. Navbar mobile sheet fix + logo mark
4. Social proof authority upgrade
5. Pricing indicator fix + savings badges
6. Proof section mobile horizontal scroll
7. CTA cleanup + urgency copy
8. Brand marquee fade masks
9. Footer cleanup
10. CSS optimizations

