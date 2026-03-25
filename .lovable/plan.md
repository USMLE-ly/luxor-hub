

# Security Hardening Plan — LEXOR® Website Launch Checklist

## Current Status Assessment

| Checklist Item | Status | Issues Found |
|---|---|---|
| Authorization (users access own data) | ✅ Solid | RLS enforced on all tables with `auth.uid() = user_id` |
| Input validation & sanitization | ⚠️ Gaps | Edge functions accept raw JSON without validation; Auth form has client validation but no server-side |
| CORS policy | ⚠️ Inconsistent | `get-weather` has incomplete CORS headers; `Allow-Origin: *` on all functions (should restrict to app domain) |
| Rate limiting | ⚠️ Passthrough only | Functions handle 429 from upstream AI gateway but don't implement their own rate limiting |
| Password reset link expiry | ✅ Handled | Supabase manages this (default 1 hour); recovery flow checks `type=recovery` |
| Error handling (no raw traces) | ✅ Good | ErrorBoundary wraps all routes; edge functions catch errors; NotFound page exists |
| Database indexing | ⚠️ Missing | No custom indexes on frequently queried columns (`user_id`, `created_at`, `worn_at`) |
| Logging for debugging | ✅ Adequate | Console.error in ErrorBoundary; edge functions log errors; FB Pixel tracks routes |

---

## Changes Required

### 1. Fix CORS Headers — `get-weather` function
The `get-weather` edge function uses a shorter CORS header list than all other functions. Update to match the standard headers.

**File:** `supabase/functions/get-weather/index.ts`
- Update `Access-Control-Allow-Headers` to include the full list: `authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version`

### 2. Add Input Validation to Edge Functions
Add basic input validation at the top of each edge function to reject malformed requests early. Focus on the most critical ones:

- **`get-weather`**: Validate `lat`/`lon` are numbers within valid ranges (-90/90, -180/180)
- **`ai-chat`**: Validate `messages` is a non-empty array, each message has `role` and `content`
- **`analyze-item`**: Validate that at least `imageUrl` or `itemName` is provided
- **`analyze-outfit`**: Validate `imageUrl` is a string
- **`design-clothing`**: Validate `prompt` is a non-empty string with max length

Pattern for each function (added after JSON parse):
```typescript
if (typeof lat !== "number" || lat < -90 || lat > 90) {
  return new Response(JSON.stringify({ error: "Invalid latitude" }), {
    status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
```

### 3. Add Database Indexes
Create a migration adding indexes on the most queried columns:

```sql
CREATE INDEX IF NOT EXISTS idx_clothing_items_user_id ON public.clothing_items(user_id);
CREATE INDEX IF NOT EXISTS idx_outfit_analyses_user_id ON public.outfit_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_wear_logs_user_id ON public.wear_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_outfits_user_id ON public.outfits(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_style_profiles_user_id ON public.style_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_wear_logs_worn_at ON public.wear_logs(worn_at);
CREATE INDEX IF NOT EXISTS idx_clothing_items_last_worn ON public.clothing_items(last_worn_at);
```

### 4. Add Client-Side Rate Limiting Utility
Create a simple throttle helper to prevent users from spamming edge function calls from the frontend (e.g., rapid-clicking "Analyze" buttons).

**New file:** `src/lib/rateLimiter.ts`
- Simple in-memory tracker: `{ [key]: lastCallTimestamp }`
- Export `canProceed(key: string, cooldownMs: number): boolean`
- Apply in Chat, OutfitAnalysis, and other AI-calling pages

### 5. Tighten ForgotPassword Input Validation
The ForgotPassword page currently has `required` on the email field but no explicit format validation before calling the API.

**File:** `src/pages/ForgotPassword.tsx`
- Add email regex validation before calling `resetPasswordForEmail`
- Show a toast error for invalid email format

---

## Files Changed Summary

| File | Action |
|---|---|
| `supabase/functions/get-weather/index.ts` | Fix CORS headers + add lat/lon validation |
| `supabase/functions/ai-chat/index.ts` | Add messages array validation |
| `supabase/functions/analyze-item/index.ts` | Add input presence validation |
| `supabase/functions/analyze-outfit/index.ts` | Add imageUrl validation |
| `supabase/functions/design-clothing/index.ts` | Add prompt validation |
| `src/lib/rateLimiter.ts` | Create — client-side throttle utility |
| `src/pages/ForgotPassword.tsx` | Add email format validation |
| Database migration | Add indexes on user_id and date columns |

No breaking changes. All additions are defensive hardening.

