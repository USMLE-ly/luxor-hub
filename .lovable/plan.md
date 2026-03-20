

## Plan: Googolplex-Level App Pages Rewrite + Mannequin Fixes

Two workstreams: (A) Humanizer copy rewrite across 5 app pages, (B) 3D mannequin geometry fixes for dress positioning, shoe sizing, bag handling, and premium materials.

---

### A. Copy Rewrites (5 files)

**1. `src/pages/StyleDNA.tsx`**

All header/label rewrites:
- L197 `"My Style Formula"` → `"Your Blueprint for Looking Incredible"`
- L244 `"Calibrate your Style Formula"` → `"Sharpen Your Style Edge"`
- L248 description → `"The more you calibrate, the sharper your recommendations. Every swipe teaches the AI what makes you, you."`
- L293 `"Your Archetype"` → `"Who You Are, Styled"`
- L302 `"Style Score"` → `"Your Style Power"`
- L370 `"Tips for {faceShape} Face"` → `"How to Work Your {faceShape} Face"`
- L393 `"Tips for {bodyShape} Body"` → `"Dressing Your {bodyShape} Frame"`
- L449 `"Prints & Fabrics"` → `"Textures That Elevate You"`
- L490 `"Flattering Silhouettes"` → `"Silhouettes Made for Your Body"`
- L513 `"Color Usage Guide"` → `"Your Personal Color Playbook"`
- L541 `"AI Summary"` → `"What the AI Sees in You"`
- L555 `"Recommendations"` → `"Your Next Moves"`
- L577 `"Your Style Psyche"` → `"The Mind Behind Your Wardrobe"`
- L618 `"Your Style Evolution"` → `"Where Your Style Is Headed"`
- L621 prediction text → `"Based on your habits and goals, here's how you'll evolve over the next 1–3 years"`
- L668 `"Colors to Avoid"` → `"Colors Working Against You"`
- L689 empty state → `"Your full style blueprint is locked. Upload a selfie during onboarding and the AI will map your colors, body, and archetype in seconds."`

Face tips rewrite (L50-87) — punchier, no "-ing" chains:
- Oval: `"Most frames work — go bold or geometric"` / `"Side-swept bangs enhance balanced proportions"` / `"Crew and V-necks both work. Pick based on mood."`
- Round: `"Angular frames sharpen a round face instantly"` / `"V-necklines and open collars lengthen your face"` / `"Longer hair with crown volume creates a slimming effect"`
- Square: `"Round or oval frames soften a strong jawline"` / `"Scoop and round necklines balance angular features"` / `"Soft layers with a side part complement bone structure"`
- Heart: `"Cat-eye or bottom-heavy frames balance a wider forehead"` / `"Chin-length bobs and side-swept bangs add jaw width"` / `"V-neck and scoop-neck tops draw attention downward"`
- Oblong: `"Wide frames and aviators add horizontal balance"` / `"Bangs and chin-length cuts shorten your face visually"` / `"Boat-neck and crew-neck tops create width"`
- Diamond: `"Oval or rimless glasses highlight your cheekbones"` / `"V-neck and sweetheart necklines mirror your face geometry"` / `"Volume at forehead or chin balances your widest points"`

Body tips rewrite (L89-121):
- Hourglass: `"Wrap dresses were made for hourglass figures. Lean into fitted cuts."` / `"Belted coats and high-waisted trousers are your power moves"` / `"Structured fabrics hold your shape. Skip overly drapey material."`
- Pear: `"Boat-neck, off-shoulder, and statement collars broaden your shoulders"` / `"A-line skirts and straight-leg trousers skim the hip area"` / `"Dark bottoms paired with lighter tops create balanced proportions"`
- Inverted: `"V-necklines and vertical details soften broader shoulders"` / `"Flared or wide-leg pants add volume to balance your upper body"` / `"A-line and fuller skirts create proportional harmony"`
- Rectangle: `"Peplum tops, ruching, and belted pieces create curves at the waist"` / `"Layering adds dimension — jackets over fitted tops with textured bottoms"` / `"High-waisted bottoms with tucked-in tops define your midsection"`
- Apple: `"Empire waistlines and A-line silhouettes skim the midsection"` / `"V-necklines create a lengthening vertical line through your torso"` / `"Structured blazers define your shape without clinging"`
- Default: `"Focus on fit — well-tailored pieces always beat trendy but ill-fitting items"` / `"Use color blocking to highlight areas you love"` / `"Structured outer layers add dimension to any silhouette"`

**2. `src/pages/OutfitCalendar.tsx`**
- L917 `"Outfit Schedule"` → `"Your Week, Styled"`
- L920 `"Your curated weekly wardrobe — powered by AI & weather"` → `"Never open your closet wondering what to wear again"`
- L970 `"Today's Weather"` → `"What the Weather Demands"`
- L288 toast → `"Reminders on. You'll get a nudge at 8 PM the night before."`
- L468 toast → `"Your week is fully booked. You're ahead of everyone."`
- L516 toast → `"Done. ${eventsToInsert.length} outfits locked in."`

**3. `src/pages/OutfitAnalysis.tsx`**
- L544 `"AI Outfit Analysis"` → `"See What the World Sees"`  (keep `<span className="gold-text">Analysis</span>` → change to `<span className="gold-text">Sees</span>`)
- L546 description → `"Upload your outfit. The AI scores it, finds the strengths, and tells you exactly what to fix."`
- L605 `"How it works"` → `"Three steps. Honest feedback."`
- L608 steps → `"Snap or upload your look"` / `"AI breaks down every detail — color, fit, occasion match"` / `"Get a score and specific fixes"`
- L630 loading steps → `"Loading your look..."` / `"Reading the outfit..."` / `"Building your report..."`

**4. `src/pages/Chat.tsx`**
- L247 `"AI Stylist"` → `"Your Stylist"`
- L248 `"Your personal fashion advisor"` → `"Knows your closet. Knows your body. Ask anything."`
- L277 `"Hi! I'm your AI Stylist"` → `"What are we wearing today?"`
- L279 description → `"I have your entire closet memorized, I know your colors, and I track what's trending. Let's build something good."`
- L383 `"Styling your answer..."` → `"Putting your look together..."`
- L425 placeholder → `"What's the occasion?"`
- L26-33 quickPrompts → `"Style me for today"` / `"Date night outfit"` / `"Work-ready look"` / `"Something for a party"` / `"Does this work on me?"` / `"What am I missing?"`
- L35-42 vanishPlaceholders updated to match

**5. `src/pages/Closet.tsx`**
- L479 `"My Closet"` → `"Your Closet"`
- L555 `"New Item"` → `"Add Piece"`
- L556 `"Add manually"` → `"Upload or snap"`
- L561 `"Add Clothing Item"` → `"New Piece"`
- L576 `"Upload photo"` → `"Snap or upload"`
- L583 `"Auto-detect with AI"` → `"Let AI fill the details"`
- L307 toast → `"Added. Your closet just got stronger."`
- L282 toast → `"Details filled. Check and save."`
- L328 toast → `"Logged. +5 style points."`
- L819 `"New Item"` → `"Add Piece"`
- L635 `"Upload Items"` → `"Upload Pieces"` / L636 `"Scan with AI"` → `"Snap or upload"`

---

### B. Mannequin & Garment Geometry Fixes (2 files)

**`src/components/app/GarmentGeometry.ts`**

1. **Shoe geometry too small** — shoes at L346-374 use radii of 0.04-0.07 which barely wrap the foot (BoxGeometry 0.1 wide, 0.06 tall, 0.22 deep at L222). Fix: increase all shoe profile radii by ~30%, add sole thickness at the bottom of the profile. Boots get taller shaft (0.14 → 0.20).

2. **Dress positioned like a shirt** — the dress body geometry starts at Y=0.56 (neckline) and goes to negative hemY, but is placed at `position={[0, 0.45, 0]}` in Mannequin3D (same as tops). The profile already extends into negative Y for the skirt portion, but the 0.45 offset means the hem floats. Fix: shift dress mesh position from `[0, 0.45, 0]` to `[0, 0.30, 0]` in Mannequin3D, and adjust the dress profile to start higher (Y=0.72) so shoulders still align at the right body position.

3. **Bags map to "hat"** — `closetToMannequinCategory` at L82 maps `accessory: "hat"`, so all bags render on the head. Fix:
   - Add `"bag"` subtype to `GarmentSubtype` and `resolveSubtype` (detect "bag", "handbag", "purse", "tote" in name)
   - Add `createBagGeometry` — a simple BoxGeometry (0.12 × 0.15 × 0.05) with a handle arc (TorusGeometry)
   - In Mannequin3D, add `isBagCat` helper and a bag rendering branch that positions the bag at the left hand position (following the arm chain) instead of the head

**`src/components/app/Mannequin3D.tsx`**

4. **Premium mannequin polish**:
   - Upgrade body material from `MeshStandardMaterial` to `MeshPhysicalMaterial` with `clearcoat: 0.15`, `sheen: 0.3`, `sheenColor: "#E8D5B7"` for subtle skin-like luminosity
   - Increase torso segment count from 24 → 32 for smoother silhouette
   - Add a rim light: `<pointLight position={[-1, 2, -2]} intensity={0.2} color="#F5E6D3" />` for silhouette definition
   - Slightly reduce head scale (0.95x) for more elegant proportions
   - Dress mesh position fix: L391 `[0, 0.45, 0]` → `[0, 0.30, 0]`
   - Add bag rendering branch after hats section (L448-462)
   - Add `isBagCat` helper next to other category helpers (L86-99)

**`src/pages/Closet.tsx`**
   - L82: split accessory mapping — detect bags by name and map to `"bag"` category, keep other accessories as `"hat"`

---

### Files Modified (7 total)

| File | Type |
|------|------|
| `src/pages/StyleDNA.tsx` | Copy rewrite |
| `src/pages/OutfitCalendar.tsx` | Copy rewrite |
| `src/pages/OutfitAnalysis.tsx` | Copy rewrite |
| `src/pages/Chat.tsx` | Copy rewrite |
| `src/pages/Closet.tsx` | Copy rewrite + bag mapping fix |
| `src/components/app/Mannequin3D.tsx` | Dress position, bag rendering, premium materials, rim light |
| `src/components/app/GarmentGeometry.ts` | Shoe scale fix, bag geometry, bag subtype |

### What Does NOT Change
- No new dependencies
- No database changes
- No layout or structural changes
- All animations and interactions stay identical
- Pricing amounts unchanged

