

## LLM Council Integration — Googolplex-Level Plan

### What We're Building

A 3-stage AI deliberation system where 3 different LLMs independently answer the user's fashion question, cross-rank each other's responses anonymously, and a "Chairman" model synthesizes the ultimate answer. This replaces the single-model chat with a council of AI stylists for deeper, more authoritative advice.

### Architecture

```text
User sends message
       │
       ▼
┌──────────────────────────┐
│  council-chat EF          │
│                          │
│  Stage 1: 3 models       │──► gemini-2.5-pro, gpt-5-mini, gemini-3-flash
│  answer in parallel       │
│                          │
│  Stage 2: Each model     │──► Ranks the other 2 anonymously
│  cross-ranks              │
│                          │
│  Stage 3: Chairman       │──► gemini-2.5-pro synthesizes best answer
│  synthesizes final        │     weighted by Stage 2 rankings
└──────────────────────────┘
       │  SSE stream (stage progress events + final synthesis tokens)
       ▼
┌──────────────────────────┐
│  Council UI               │
│  - 3-stage progress bar  │
│  - Expandable model cards│
│  - Final gold synthesis  │
└──────────────────────────┘
```

### Implementation Scope

**1. Edge Function: `council-chat`**
- Receives same payload as `ai-chat` (messages, userId, styleProfile, closetSummary, mood, image)
- Reuses the same AURELIA system prompt + memory fetching logic from `ai-chat`
- **Stage 1**: Fires 3 parallel requests to Lovable AI Gateway with models `google/gemini-2.5-pro`, `openai/gpt-5-mini`, `google/gemini-3-flash-preview`. Non-streaming (needs full responses for ranking).
- **Stage 2**: Sends each model's response (anonymized as "Response A/B/C") to all 3 models for ranking via tool calling (structured output: `{rankings: [{response: "A", score: 1-10, reason: "..."}]}`)
- **Stage 3**: Aggregates scores, sends top-ranked responses + rankings to `google/gemini-2.5-pro` as Chairman with instruction to synthesize the best final answer. This stage streams via SSE.
- Sends SSE progress events: `{type: "stage", stage: 1|2|3, status: "start"|"complete", data?: {...}}` between stages
- Handles 429/402 errors properly

**2. Database: `council_conversations` table**
- Columns: `id` (uuid PK), `user_id` (uuid, NOT NULL), `title` (text), `messages` (jsonb — array of user/assistant messages with council metadata), `created_at` (timestamptz)
- RLS: users can only CRUD their own rows
- The `messages` jsonb stores stage data per assistant message: `{stage1: [{model, response}], stage2: [{model, rankings}], stage3: {synthesis}}`

**3. New Page: `/council`**
- Premium dark UI matching AURELIA aesthetic
- **CouncilStageProgress**: 3 connected gold dots/nodes that fill as stages complete, with labels "Consulting", "Ranking", "Synthesizing"
- **CouncilResponseCard**: Expandable accordion showing individual model responses from Stage 1, with model name badges and ranking scores from Stage 2 (gold medal for highest)
- Final synthesis displayed prominently with gold border accent
- Same input bar, image upload, voice input, mood selector as existing Chat
- Conversation history list (saved council threads)
- Quick prompts adapted for deep-analysis use cases: "Deep style audit", "Full wardrobe gap analysis", "Complete outfit strategy for [event]"

**4. Navigation & Routing**
- Add `/council` route in `App.tsx`
- Add a toggle/tab in the Chat header to switch between "Quick Chat" (existing) and "Council" mode, or add "Council" as a BottomNav item replacing or augmenting "AI Stylist"
- Update `supabase/config.toml` with `[functions.council-chat]` entry

### Files to Create
| File | Purpose |
|------|---------|
| `supabase/functions/council-chat/index.ts` | 3-stage council orchestration edge function |
| `src/pages/Council.tsx` | Council chat page with stage progress UI |
| `src/components/app/CouncilStageProgress.tsx` | 3-stage animated progress indicator |
| `src/components/app/CouncilResponseCard.tsx` | Expandable model response card with ranking badge |

### Files to Modify
| File | Change |
|------|--------|
| `src/App.tsx` | Add `/council` route |
| `src/components/app/BottomNav.tsx` | Add Council nav or mode toggle |
| `supabase/config.toml` | Add `council-chat` function config |

### Database Migration
```sql
CREATE TABLE council_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text DEFAULT 'New Council Session',
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE council_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own council conversations"
  ON council_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own council conversations"
  ON council_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own council conversations"
  ON council_conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own council conversations"
  ON council_conversations FOR DELETE USING (auth.uid() = user_id);
```

### Models Used (all via Lovable AI Gateway — no API keys needed)
| Role | Model | Why |
|------|-------|-----|
| Council Member 1 | `google/gemini-2.5-pro` | Best multimodal reasoning |
| Council Member 2 | `openai/gpt-5-mini` | Strong reasoning, different perspective |
| Council Member 3 | `google/gemini-3-flash-preview` | Fast, latest Google architecture |
| Chairman | `google/gemini-2.5-pro` | Best synthesis capability |

### UX Flow
1. User types question → "Consulting the Council..." with Stage 1 progress
2. Stage 1 completes → 3 model cards appear (collapsed), Stage 2 starts → "Cross-ranking..."
3. Stage 2 completes → Cards update with ranking badges, Stage 3 starts → "Synthesizing..."
4. Stage 3 streams the final answer token-by-token with gold accent styling
5. User can expand any model card to see individual reasoning and ranking scores

