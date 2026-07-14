
# User Analysis Profile page

The uploaded zips are Figma/Sketch UX-Research templates (the `.sketch` extracts to a Persona card + Customer Journey framework). I'll port that framework into a new **User Analysis** page inside LUXOR, styled in our B&W + gold system, populated from the user's real data across onboarding, style DNA, closet, dressing room, analyses, chat, and calendar.

## Entry point
- Add an icon button (User + magnifying glass) in the Closet header/actions row, next to the mannequin controls.
- Route: `/user-analysis`. Gated by `PaywallGate` and `isReady`.

## Page structure (mirrors the sketch template)

**1. Persona hero card**
- Left: avatar (profile photo or generated silhouette), display name, age range, gender, location, plan tier, "member since".
- Right pull-quote: their strongest style statement (derived from Style DNA archetype + top mood).
- ABOUT block: 3-sentence auto-written bio from onboarding + activity.

**2. Identity grid** (data table, right column of the persona)
- Age range, height, body shape, face shape, size range/build, budget band, profession, lifestyle, brand tier preference.

**3. Needs / Frustrations / Goals / Product-fit**
- NEEDS: from `styleGoal` + `elevateStyle`.
- FRUSTRATIONS: from `styleChallenge` + `shoppingExperience`.
- GOALS: from `styleMood` + goal answers.
- HOW LUXOR HELPS: mapped to features they've used most.

**4. Personality sliders** (Introvert↔Extrovert, Sensing↔Intuition, Thinking↔Feeling, Judging↔Perceiving, plus a fashion axis: Classic↔Experimental, Minimal↔Maximal, Practical↔Expressive)
- Values derived deterministically from onboarding choices + council/chat tone + analysis history.

**5. Current feelings tag cloud**
- Chips like Confident / Curious / Playful / Refined — pulled from `styleMood` and recent chat sentiment.

**6. Style DNA panel**
- Primary archetype, secondary archetype, color season, dominant palette swatches (from `style_profiles` / `outfit_analyses.colors`), signature silhouettes.

**7. Activity KPIs** (skeleton loaders + empty states)
- Outfits analyzed count, avg style score, best score, favorite category mix (Elegant / Casual / Streetwear / Formal / Athleisure — computed from `outfit_analyses.category` and `outfits.occasion`), items in closet, looks generated in Dressing Room, calendar plans, chat sessions, council deliberations, weekly-challenge entries, badges earned, streak.

**8. Customer Journey timeline** (the sketch's core artifact, adapted to a style journey)
- Steps: Signed up → Onboarding → First closet upload → First analysis → First dressing-room look → First planned outfit → Council session → Today.
- Rows per step: Action, Thinking (auto-summary), Feeling (mini bar), Opportunity (what LUXOR should suggest next).

**9. Recommendations for you**
- 3 concrete next actions computed from gaps (e.g., "Log wears — you plan but rarely check in", "Try Council on your Friday looks").

## Data sources (read-only aggregation)
- `profiles`, `style_profiles`
- `clothing_items` (counts by category/color)
- `outfit_analyses` (score, category, colors, occasion)
- `outfits` + `outfit_items` + `wear_logs`
- `dressing_room_looks`
- `calendar_events`
- `chat_messages`, `council_conversations`
- `user_badges`, `style_points`, `challenge_entries`
- Onboarding answers already persisted on `style_profiles` / localStorage.

All queries scoped to `auth.uid()`; no schema changes needed (RLS already in place).

## Files to add
- `luxor-hub/src/pages/UserAnalysis.tsx` — the page.
- `luxor-hub/src/components/analysis/PersonaHero.tsx`
- `luxor-hub/src/components/analysis/IdentityGrid.tsx`
- `luxor-hub/src/components/analysis/NeedsFrustrations.tsx`
- `luxor-hub/src/components/analysis/PersonalitySliders.tsx`
- `luxor-hub/src/components/analysis/FeelingsCloud.tsx`
- `luxor-hub/src/components/analysis/StyleDnaPanel.tsx`
- `luxor-hub/src/components/analysis/ActivityKpis.tsx`
- `luxor-hub/src/components/analysis/JourneyTimeline.tsx`
- `luxor-hub/src/components/analysis/NextActions.tsx`
- `luxor-hub/src/lib/userAnalysis.ts` — pure aggregation + personality-slider math (deterministic).

## Files to edit
- `luxor-hub/src/AppContent.tsx` — register `/user-analysis` route inside `PaywallGate`.
- `luxor-hub/src/pages/Closet.tsx` — add the new icon button linking to `/user-analysis`.

## Design
- B&W surfaces, Cormorant Garamond headings, Josefin Sans body, gold hairline dividers and slider dots.
- Framer Motion `fadeUp` + `staggerChildren`; respects `prefers-reduced-motion`.
- `LoadingState` skeletons per section, `EmptyState` for users with no activity, `ErrorState` with retry per query.

## Out of scope
- No new tables, no new edge functions, no writes.
- No sharing/export in v1 (can follow up).

Confirm and I'll build it.
