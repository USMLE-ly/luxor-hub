

## Plan: Googolplex-Level Landing Page Rewrite — Emotional Seduction, Zero AI-isms

The entire landing page gets rewritten through two lenses simultaneously: **persuasion psychology** (pain → desire → proof → urgency → commitment) and the **Humanizer anti-AI filter** from the uploaded SKILL.md (no rule-of-three, no "testament", no copula avoidance, no promotional fluff, no negative parallelisms). Every CTA shifts from "free trial" to paid commitment. Copy reads like it was written by a sharp, opinionated fashion insider — not a marketing bot.

---

### The Emotional Arc (Section by Section)

```text
Announcement Banner     → FOMO + Scarcity ("Only 237 founding spots left")
         ↓
Hero Slides             → Pain Amplification + Identity Promise
         ↓
Social Proof Strip      → Reframed Stats as Emotional Outcomes
         ↓
Features (Orbital)      → "What happens when..." desire triggers
         ↓
Tabbed Features         → Before/After emotional storytelling
         ↓
How It Works            → "3 minutes from chaos to compliments"
         ↓
App Showcase            → "This is tomorrow morning for you"
         ↓
Testimonials/Proof      → "They didn't believe it either"
         ↓
Pricing                 → Investment framing, cost-of-inaction math
         ↓
Comparison Table        → (unchanged structure)
         ↓
FAQ                     → Objection crushing, no free trial mentions
         ↓
CTA Banner              → Identity close: "You already know"
         ↓
Sticky Bar              → "Join Now" — founding member framing
```

---

### File-by-File Changes

**1. `src/components/landing/AnnouncementBanner.tsx`**
- Slot 1: "50% off Pro for the first 1,000 users" → "Founding member pricing closes when the timer hits zero"
- Slot 2: "Join 10K+ Members" → "847 people joined this week"
- "Early Access" badge stays (works for scarcity)

**2. `src/components/landing/Hero.tsx`** (slides array + CTAs only)
- 6 slide rewrites — pain-first, then desire:
  - "Your Style, Perfected" → "Stop Guessing. Start Turning Heads."
  - "AI Outfit Generator" → "Wake Up Knowing Exactly What to Wear"
  - "Color Intelligence" → "The Colors That Make People Look Twice"
  - "Smart Wardrobe" → "You Own $3,000 in Clothes You Never Wear"
  - "Trend Radar" → "Be First. Not a Follower."
  - "Capsule Builder" → "Own Less. Look Richer."
- Descriptions rewritten: specific, punchy, no "-ing" chains, no "leveraging"
- Primary CTA: "Start Free Trial" → "Claim Your Spot"
- Secondary CTA: "How It Works" stays (low-commitment scroll action)

**3. `src/components/landing/SocialProofStrip.tsx`**
- Stats reframed as emotional outcomes:
  - "Professional Stylists" → "People Who Stopped Wasting Money on Wrong Clothes"
  - "Revenue Generated" → "Saved on Impulse Buys"
  - "Satisfaction Rate" → "Would Never Go Back"
  - "Avg. Outfit Time" → "Morning Decision Time"
- Keeps animated counters, gold accents, media badges

**4. `src/components/landing/Features.tsx`**
- Section heading: "Everything You Need to Look Your Best" → "What Happens When AI Understands Your Body Better Than You Do"
- Subheading: removes generic "Click any node to explore" → specific benefit line
- Timeline node descriptions rewritten with emotional outcomes (not technical process)

**5. `src/components/landing/TabbedFeatures.tsx`**
- Tab headlines become desire-driven:
  - "Your Personal AI Stylist" → "Imagine Never Second-Guessing an Outfit Again"
  - "Your Digital Closet" → "Stop Buying Clothes You'll Never Wear"
  - "Shop Smarter, Not More" → "Every Purchase Becomes Your Best Purchase"
- Feature card descriptions rewritten: specific feelings, not feature specs
- Section heading: "Explore Every Capability" → "Three Ways AURELIA Changes Your Morning"

**6. `src/components/landing/HowItWorks.tsx`**
- Title: "Three Steps to Effortless Style" → "From Closet Chaos to Compliments. Three Minutes."
- Description line shortened and made visceral
- Each step title and description rewritten with transformation language

**7. `src/pages/Index.tsx`**
- ContainerScroll title: "Your Entire Wardrobe, Reimagined" → "This Is What Tomorrow Morning Looks Like"

**8. `src/components/landing/Testimonials.tsx`**
- Section heading: "Real Revenue, Real Proof" → "They Didn't Believe It Either"
- Subheading: drops "We don't make empty promises" (defensive) → "Unedited screenshots. Real numbers. Actual businesses."
- Captions rewritten with before/after emotional arcs

**9. `src/components/landing/Pricing.tsx`**
- Heading: "Invest in Your Best Self" → "What's Looking Incredible Actually Worth to You?"
- Subheading: adds cost-of-inaction line: "The average person wastes $1,200/year on clothes they barely wear. AURELIA pays for itself in the first month."
- All tier CTAs: "Start Now" / "Start Free Trial" / "Go Elite" → "Join Now" / "Claim Your Spot" / "Go Elite" (Elite stays — it's already commitment-framed)
- Urgency copy: "127 stylists signed up this week" → "This price won't last. 237 founding spots remain."
- Remove "7-day free trial" language from the urgency micro-copy
- Trust badges and payment icons stay

**10. `src/components/landing/FAQ.tsx`**
- "Can I try AURELIA before committing?" → rewrite answer: "Every plan comes with a 30-day money-back guarantee. If AURELIA doesn't change how you get dressed, we'll refund every penny. No questions."
- Other answers: tighten, add specificity, remove "Absolutely." openers (AI tell)
- No structural changes

**11. `src/components/landing/CTABanner.tsx`**
- Heading: "Ready to Transform Your Style?" → "You Already Know You Deserve This"
- Sub-copy: "Join 12,000+ stylists..." → "12,847 people stopped settling for average. Your spot is waiting."
- CTA: "Start Your Free Trial" → "Join AURELIA Now"
- Remove "No credit card required · Cancel anytime · 7-day free trial"
- Replace with: "30-day money-back guarantee. Zero risk."

**12. `src/components/landing/StickyPricingBar.tsx`**
- Title: "Start Your Free Trial" → "Join AURELIA Now"
- Subtitle: "7 days free · Cancel anytime" → "Founding member pricing — limited spots"
- Button: "Try Free" → "Get Started"

---

### Humanizer Anti-AI Rules Applied Throughout

All copy passes through these filters from the uploaded SKILL.md:

| Pattern to Kill | Example Before | Replacement Style |
|---|---|---|
| Rule of three | "innovation, inspiration, insights" | Use 2 or 4 items |
| "Testament/landscape/journey" | "a testament to modern fashion" | Cut entirely |
| Negative parallelism | "It's not just X, it's Y" | State Y directly |
| Copula avoidance | "serves as... features... boasts" | Use "is" and "has" |
| Promotional fluff | "nestled within breathtaking..." | Flat, specific claim |
| "-ing" chain analyses | "symbolizing... reflecting..." | Active verbs, past tense |
| "Additionally/Moreover/Furthermore" | Sentence openers | Cut or use "Also" / restructure |
| Em dash overuse | "fashion — reimagined — for you" | One per paragraph max |

---

### What Does NOT Change
- Zero layout or structural changes
- All animations, WebGL, Three.js, GSAP, framer-motion untouched
- No new components, no new dependencies
- No database changes
- Pricing amounts ($9/$29/$99) unchanged

### Files Modified (12 total)
`AnnouncementBanner.tsx`, `Hero.tsx`, `SocialProofStrip.tsx`, `Features.tsx`, `TabbedFeatures.tsx`, `HowItWorks.tsx`, `Testimonials.tsx`, `Pricing.tsx`, `FAQ.tsx`, `CTABanner.tsx`, `StickyPricingBar.tsx`, `Index.tsx`

