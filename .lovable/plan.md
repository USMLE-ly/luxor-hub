
# Luxor stabilization plan

## What we are (and aren't) doing

- **NOT** replacing Supabase with Qdrant. Qdrant is a vector DB with no auth/RLS/storage. Supabase stays as the source of truth for users, closet, outfits, calendar, storage, subscriptions.
- **Qdrant is added alongside** for semantic similarity only (dedupe closet uploads, "find similar", style matching).
- Wiping is scoped to **your user account's rows + photos** — everything else is untouched.
- GitHub sync is automatic once your repo is connected via (+) → GitHub. No manual push step.

---

## Step 0 — Fix the failing build (blocking)

`package.json` at project root is missing the `build:dev` script Lovable's CI expects. Add:

```json
"build:dev": "vite build --mode development"
```

No other package changes.

---

## Step 1 — Diagnose closet-disappears + new-tab-logout (evidence first)

Run Playwright against the preview to get facts before changing code:

1. Log in, upload one clothing photo, wait for "saved" state.
2. Query `clothing_items` for my `user_id` — did the row actually land? Check `clothing-photos` bucket for the file.
3. Read `localStorage` keys (`sb-*-auth-token`, `luxor_paid`, any closet caches) and `document.cookie`.
4. Open a second tab to `luxor.ly`, screenshot: am I logged out? Is the `sb-*-auth-token` key present?
5. Wait / re-visit after refresh, compare state.

Expected root causes (to be confirmed by the run):

- **A. localStorage-only writes:** closet upload path may set state + localStorage but not insert into `clothing_items`. When Brave clears localStorage, items vanish.
- **B. Auth race:** `AppLayout` reads `user` before `getSession()` resolves, RLS returns nothing, UI shows empty and redirects to `/auth` on new tab.
- **C. Storage partitioning:** `preview--*.lovable.app` and `luxor.ly` are different origins, so a session on one doesn't exist on the other. Expected behavior — will explain, not "fix".

## Step 2 — Fix persistence + auth-race

Based on Step 1 findings, apply the minimum set of these:

- Add `useAuthReady` hook (uses `getSession()` + `onAuthStateChange`, exposes `isReady`).
- Gate `AppLayout` redirect and all data queries on `isReady`, not just `!loading`.
- Audit every closet upload / outfit / calendar write path and ensure it inserts into Supabase before setting local state. Remove localStorage as a source of truth for closet items (keep it only as a warm cache keyed by `user.id`).
- On mount after auth is ready, run a background reconciliation: pull `clothing_items` for the user and overwrite local cache.
- `usePlanTier`: stop reading arbitrary strings from localStorage as tier; only trust the `subscriptions` table (localStorage kept as read-through cache only).

## Step 3 — Wipe your test data (scoped, reversible-in-schema)

I will show you the exact SQL before running, targeting only `auth.uid() = <your user id>`:

- Delete rows in `clothing_items`, `outfits`, `outfit_items`, `user_looks`, `saved_looks`, `dressing_room_looks`, `calendar_events`, `wear_logs`, `outfit_analyses`, `outfit_feedback`, `mood_board_items`, `mood_boards`, `chat_messages`, `council_conversations`, `fashion_designs`, `challenge_entries` — filtered to your `user_id`.
- Delete storage objects in `clothing-photos/` and `look-photos/` under your user folder.
- Leave `profiles`, `style_profiles`, `subscriptions`, auth intact so you don't have to re-onboard.

## Step 4 — Add Qdrant alongside Supabase

Store `QDRANT_URL` and `QDRANT_API_KEY` as Lovable Cloud secrets (backend-only, never in client bundle).

New edge functions (thin wrappers around Qdrant REST API):
- `qdrant-upsert-item` — called after a clothing_item insert; embeds the item's image/description and upserts a point tagged with `user_id` + `item_id`.
- `qdrant-find-similar` — returns nearest-neighbor item ids for an input item; used by "find similar" and to warn on duplicate uploads.

Collection: `luxor_closet_items`, cosine, filtered by `user_id` on every query. No PII stored in payload — only ids.

## Step 5 — Calendar full-outfit view (layered composition, no AI cost)

- Extract the dressing-room's layered composition renderer into a shared `<OutfitComposition items={...} />` component. Preserves current dressing-room look 1:1.
- On the calendar cell + event detail, render `<OutfitComposition />` using items from `outfit_items` for the linked look, at appropriate sizes (thumbnail vs full).
- No schema changes required; the calendar already links to outfits/looks.

## Step 6 — Polish flip effects on the dressing room

- Replace the current flip with a spring-based 3D transform (Framer Motion), correct `perspective`, `backface-visibility: hidden` on both faces, GPU-friendly `transform-gpu` + `will-change`.
- Add subtle scale + shadow curve during flip. No layout changes; only motion feels better.

## Step 7 — GitHub

Lovable syncs to GitHub automatically once the repo is connected. If it isn't connected yet: (+) menu → GitHub → Connect project. Nothing for me to run.

---

## Technical notes

- Frontend files touched: `src/contexts/AuthContext.tsx` (add `isReady`), `src/hooks/useAuthReady.ts` (new), `src/components/app/AppLayout.tsx`, `src/hooks/usePlanTier.ts`, closet upload hook, dressing-room + calendar components, new `<OutfitComposition />`, `package.json`.
- Backend: new edge functions `qdrant-upsert-item`, `qdrant-find-similar`; new secrets `QDRANT_URL`, `QDRANT_API_KEY`.
- No migrations; no destructive schema change. Data wipe runs as a scoped `DELETE` after your approval.
- After Step 1 diagnosis, Step 2's exact edits may narrow — I'll only change what the evidence shows is broken.

## Execution order

Step 0 → Step 1 (diagnose) → Step 2 (fix) → verify with Playwright → Step 3 (wipe, on your approval) → Step 4 (Qdrant) → Step 5 (calendar view) → Step 6 (flip polish).
