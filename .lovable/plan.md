

# Googolplex Vision — Realistic Implementation Plan

## Reality Check

Most items in this vision require hardware (AR glasses, smart closet cameras, 3D body scanners), massive partnerships (10,000 retailer APIs), or custom ML infrastructure (proprietary vision models). Here is what we **can actually build** in this web app today, organized by impact.

---

## Phase 1: Dashboard & Daily Routine Upgrade

### Morning Dashboard Overhaul (`src/pages/Dashboard.tsx`)
- **Weather-aware outfit card**: Fetch weather via `get-weather` edge function, display temperature + condition with AI-suggested outfit from closet
- **Calendar-synced suggestions**: Pull today's `calendar_events`, show occasion-matched outfit recommendations
- **Outfit confidence score**: Show the AI's confidence % alongside each suggestion
- **"Get Ready" timer**: Countdown component with outfit steps
- **Quick outfit alternatives**: Swipeable horizontal carousel of 3 AI-generated outfit options

### Evening Reflection Widget
- **"How'd the outfit feel?"** — thumbs up/down + optional note, stored in new `outfit_feedback` table
- **Compliment tracker**: Simple counter the user taps when they get a compliment
- This feedback data feeds back into the AI chat system prompt for better future suggestions

### Database: New `outfit_feedback` table
- `id`, `user_id`, `outfit_id` (nullable), `rating` (1-5), `compliments` (int), `notes` (text), `created_at`

---

## Phase 2: Smart Wardrobe Intelligence

### Wardrobe Analytics Upgrade (`src/pages/Closet.tsx` + `src/components/app/WardrobeStats.tsx`)
- **Wear frequency heatmap**: Visual calendar grid showing which items were worn when (from `wear_logs`)
- **Cost-per-wear calculation**: `price / wear_count` displayed per item
- **Outfit repetition detection**: Query `wear_logs` to flag "You wore this combo 3 weeks ago"
- **Dormant item alerts**: Items not worn in 60+ days get a "Donate or style challenge?" prompt
- **"This item paid for itself"** badge: When cost-per-wear drops below $2

### Auto-Catalog from Receipt Photo
- New edge function `scan-receipt` that accepts a photo, uses Gemini Vision to extract item name, brand, price, category
- Auto-populates a new closet item from the receipt data
- Add a "Scan Receipt" button to the Closet page upload flow

### Database: Add columns to `clothing_items`
- `wear_count` (int, default 0) — computed from wear_logs or cached
- `last_worn_at` (date, nullable)

---

## Phase 3: AI Stylist 3.0

### Proactive Suggestions (`src/pages/Chat.tsx` + `ai-chat` edge function)
- Enhance system prompt to include: upcoming calendar events, weather forecast, recent wear history, dormant items
- AI proactively opens with context: "You have a presentation Tuesday — here's your power outfit"
- **Emotion-aware input**: Add a mood selector (5 moods) before sending a message, included in AI context
- **Image-to-closet match**: When user sends an inspo photo, AI finds similar items from THEIR closet inventory

### Rejected Suggestion Memory
- New `ai_feedback` table: `id`, `user_id`, `suggestion_hash`, `accepted` (bool), `created_at`
- Track when user dismisses an outfit → AI avoids similar combos

---

## Phase 4: Social & Gamification Expansion

### Style Challenges Upgrade (`src/pages/WeeklyChallenge.tsx`)
- Add challenge types: "7-day capsule wardrobe", "Rewear challenge", "Thrift flip"
- **Outfit Battles**: Submit outfit → community votes → AI judges on coherence, fit, creativity
- Leaderboard integration with new challenge types

### Gamification System
- **Daily style points**: +10 for wearing underutilized item, +5 for trying AI suggestion, +15 for sustainable choice
- **Achievement badges**: "Capsule Master" (30 outfits from 10 items), "Eco Warrior" (50% secondhand)
- New `style_points` table: `id`, `user_id`, `points`, `reason`, `created_at`

---

## Phase 5: Enhanced Virtual Try-On

### Upgrade `src/pages/VirtualTryOn.tsx`
- **Multi-angle results**: Generate front + side view
- **Social try-on**: "Share with friend for vote" — generates a shareable link with the try-on result
- **Try from shop**: Connect shop products directly to try-on flow (select any shop item → try it on)

---

## Phase 6: Predictive Style Evolution

### Style Evolution Timeline (`src/pages/StyleDNA.tsx`)
- Leverage existing `style_profiles.style_formula` + `wear_logs` data
- AI generates a 3-stage forecast: "Your style in 3 months / 6 months / 1 year"
- Visual timeline with predicted archetype shifts and key pieces to acquire

---

## Summary of Database Changes

| Table | Type | Purpose |
|-------|------|---------|
| `outfit_feedback` | New | Evening reflection ratings |
| `ai_feedback` | New | Track accepted/rejected suggestions |
| `style_points` | New | Gamification points ledger |
| `clothing_items` | Alter | Add `wear_count`, `last_worn_at` |

## Summary of Edge Functions

| Function | Type | Purpose |
|----------|------|---------|
| `scan-receipt` | New | Extract item data from receipt photos |
| `ai-chat` | Update | Richer context (calendar, weather, wear history, mood) |
| `style-recommendations` | Update | Proactive daily suggestions |

## New/Updated Pages

| Page | Changes |
|------|---------|
| Dashboard | Morning routine card, evening reflection widget |
| Closet | Wear heatmap, cost-per-wear, dormant alerts, receipt scan |
| Chat | Mood selector, proactive context, inspo-to-closet matching |
| WeeklyChallenge | New challenge types, outfit battles |
| StyleDNA | Evolution timeline forecast |
| VirtualTryOn | Shop integration, social sharing |

---

## What's NOT Buildable Here

These require native mobile / hardware / massive infrastructure and are excluded:
- AR camera mode / Smart Mirror (requires native camera access + ARKit)
- 3D body scanning (requires TrueDepth sensor)
- Physics-based fabric simulation
- 10,000+ retailer API integrations
- Custom foundation AI models
- On-device edge computing
- Smart closet camera hardware

