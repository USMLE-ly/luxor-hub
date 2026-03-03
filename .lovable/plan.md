

## Plan: Fix Runtime Errors, Professional Mannequin Upgrade, and Onboarding Polish

This addresses three critical issues from the screenshots: the analyze-item edge function crash, onboarding click/selection bugs, and mannequin quality upgrade.

---

### 1. Fix analyze-item Edge Function Error (Runtime 500)

The screenshot shows `supabase/functions/analyze-item/index.ts` returning a 500 "AI service error". The function looks correct structurally, but the error handling swallows details. 

**Fix**: Add better error logging and response forwarding. The likely cause is the `throw new Error("AI service error")` on line 82 which doesn't include the response body. Will capture and log the actual gateway error text before throwing.

**File**: `supabase/functions/analyze-item/index.ts`

---

### 2. Fix Onboarding Selection Not Registering

The user reports "when I click anything on onboarding page appears as nothing clicked." The issue is in `Onboarding.tsx` line 165: the NEXT button always calls `setCurrentStep(s => s + 1)` regardless of step type. But the `canProceed` logic on lines 30-44 correctly gates this. The real problem is likely that clicking an option card doesn't trigger visual feedback properly because the `onSelect` handler in `StepRenderer` works on `step.key` but the `selected` array reads from `answers[step.key]` — this should work.

After reviewing more carefully: the `handleSelect` function signature is `(key, option, singleSelect)` and in StepRenderer line 530 for radio/checkbox, `onClick={() => onSelect(step.key, option, isSingle)}` looks correct. The visual state reads from `selected = answers[step.key]` (line 409). This chain should work.

However, for "How well do you know your style?" (checkbox type), the `canProceed` check requires `(answers[currentStepData.key] || []).length > 0` which needs at least one checkbox checked. The issue may be that checkboxes look unselected visually due to the dark theme. Will investigate and ensure the active state contrast is strong enough.

**Likely root cause**: The `selected === value` check in GenderStep uses strict equality but `onSelect` passes `"female"` or `"male"` correctly. The gender step should work. Let me check if there's a state persistence issue — the `useState<"female" | "male" | null>(null)` in Onboarding.tsx is the source of truth, and GenderStep receives `selected={gender}`. This looks correct.

**Fix approach**: Add more visible active states (stronger borders, background fills) and ensure click handlers fire correctly on mobile with proper touch targets. Also verify the `How well do you know your style?` step uses checkbox type correctly.

**Files**: `src/components/onboarding/StepRenderer.tsx`, `src/pages/Onboarding.tsx`

---

### 3. Professional Mannequin Upgrade

The current mannequin uses primitive capsule/sphere geometries creating a toy-like segmented look. The user wants a smooth, anatomically accurate fashion mannequin.

**Approach**: Build a much higher quality mannequin using `THREE.LatheGeometry` for smooth body contours. This technique rotates a profile curve around the Y-axis, producing smooth continuous surfaces similar to museum mannequins. Different profile curves for male vs female proportions.

Key improvements:
- **Smooth continuous body** using LatheGeometry with anatomical profile curves (no visible joints/gaps)
- **8-head female / 8.5-head male proportions** matching fashion design standards
- **Matte clay material** (`MeshStandardMaterial` with beige/clay color, high roughness, zero metalness)
- **Studio lighting** with 3-point light setup and soft shadows
- **Body DNA sliders** panel: Height, Shoulder Width, Waist, Hips — real-time mesh morphing via scale transforms on body segments
- **Pose presets**: Neutral standing, Fashion pose, Walking (via joint rotations on grouped body segments)
- **Tracing mode**: Toggle overlay with opacity slider, user can upload reference image behind mannequin
- **Measurement display**: Show proportional guidelines as wireframe overlays

**Architecture**:
- Rebuild `src/components/app/Mannequin3D.tsx` with LatheGeometry-based torso, arms, legs
- Body built from ~8 LatheGeometry segments (head, neck, torso-upper, torso-lower, upper-arm x2, forearm x2, thigh x2, calf x2) with smooth transitions
- Each segment grouped under a joint node for posing
- Body DNA sliders modify scale of joint groups in real-time

**File**: `src/components/app/Mannequin3D.tsx` (full rewrite)

---

### 4. Mannequin View UI Upgrade

Update `src/pages/MannequinView.tsx` with the requested UI layout:
- **Left panel**: Gender toggle + Body DNA sliders (Height, Weight, Shoulder, Waist, Hips)
- **Right panel**: Pose presets (Neutral, Walking, Fashion, Sitting)
- **Bottom toolbar**: Quick access to DNA, Analysis, AI Stylist, Closet, Trace Mode
- **Tracing mode**: Upload image overlay with opacity control

On mobile, panels collapse to bottom sheets.

**File**: `src/pages/MannequinView.tsx`

---

### 5. Onboarding Visual Polish (Match Reference Screenshots)

The reference screenshots show:
- Clean white backgrounds with generous spacing
- Body shape cards with anatomical illustrations and radio indicators on the right
- Size grid with 5-column layout and rounded pill buttons
- Age range as simple radio list cards
- Selfie guide steps with full-bleed photos and bottom card overlay with coral/pink CTA button

Current implementation already matches most of this. Key polish:
- Ensure body shape SVGs are more detailed/anatomical (add body outline strokes, skin-tone fills matching reference)
- Selfie guide steps: make the placeholder area show actual instructional imagery (camera icon placeholder is fine since real photos would be from the user's camera)
- Ensure NEXT button matches reference: full-width, rounded, light gray background with dark text (already implemented)

**Files**: `src/components/onboarding/StepRenderer.tsx`

---

### Summary of Changes

| Action | File | Description |
|--------|------|-------------|
| Edit | `supabase/functions/analyze-item/index.ts` | Fix 500 error with better error handling |
| Rewrite | `src/components/app/Mannequin3D.tsx` | Professional LatheGeometry mannequin with poses, sliders, tracing |
| Edit | `src/pages/MannequinView.tsx` | Add Body DNA panel, pose controls, tracing mode UI |
| Edit | `src/components/onboarding/StepRenderer.tsx` | Polish active states, improve body shape SVGs |
| Edit | `src/pages/Onboarding.tsx` | Ensure click handlers work on mobile |

No new dependencies needed — Three.js LatheGeometry, BufferGeometry, and existing React Three Fiber packages handle everything.

