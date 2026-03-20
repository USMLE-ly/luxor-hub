

# TestSprite Report: Analysis and Fix Plan

## Report Summary

The TestSprite report tested both backend API and frontend UI. Here's what's real vs. false positive:

### Backend API Failures (ALL FALSE POSITIVES — No Fix Needed)
All 5 backend failures (`POST extra fields`, `POST valid data`, `POST empty body`, `POST duplicate entries`, `POST special characters`) returned 404 because TestSprite sent POST requests to the **base URL** (`https://...supabase.co`) instead of specific endpoints like `/rest/v1/table` or `/functions/v1/function-name`. This is expected behavior — the base URL doesn't accept POST. **No code changes needed.**

### Frontend UI Failures (6 failures — 4 are actionable)

---

## Plan: Fix Frontend Issues

### 1. Add client-side form validation to Auth page
**Problem:** No validation messages for empty email, invalid format, or short password. Errors only come from the server.
**Fix in `src/pages/Auth.tsx`:**
- Add validation state for email format, password length, empty fields
- Show inline error messages below each field
- Focus the first invalid field on submit
- Prevent API call if validation fails

### 2. Add network error handling and retry to Auth page
**Problem:** No handling for offline/slow network. No retry option on failure.
**Fix in `src/pages/Auth.tsx`:**
- Detect network failure (catch block) and show a "You appear to be offline" toast with a retry option
- Add a timeout for auth requests
- Prevent duplicate form submissions while loading (already partially done via `disabled={loading}`)

### 3. Add accessibility attributes to Auth and Navbar
**Problem:** Missing ARIA attributes on interactive elements, focus order issues.
**Fix in `src/pages/Auth.tsx`:**
- Add `aria-label` to the form
- Add `aria-invalid` and `aria-describedby` to inputs when validation fails
- Add `role="alert"` to error messages

**Fix in `src/components/landing/Navbar.tsx`:**
- Add `aria-label="Main navigation"` to the nav element
- Add `aria-current="true"` to active nav links
- Add `aria-expanded` to mobile menu trigger

### 4. Ensure auth form does NOT persist credentials in localStorage
**Problem:** Report flags state persistence of email/password across refresh — this is actually a security concern. Verify we are NOT storing credentials.
**Fix:** Confirm no localStorage persistence of email/password (current code uses `useState` only — this is already correct). No change needed, but add `autocomplete` attributes for proper browser behavior.

---

## Technical Details

### Auth.tsx changes
- Add `validationErrors` state object `{ email?: string; password?: string; displayName?: string }`
- Add `validate()` function checking: email regex, password >= 6 chars, displayName not empty (signup)
- Render error `<p>` elements with `role="alert"` below each input
- Wrap API call in try/catch with `navigator.onLine` check
- Add `autocomplete="email"` and `autocomplete="current-password"` to inputs
- Add `aria-label="Authentication form"` to form
- Add `aria-invalid` / `aria-describedby` to inputs

### Navbar.tsx changes
- Add `aria-label="Main navigation"` to `<motion.nav>`
- Add `aria-current={activeSection === link.id ? "page" : undefined}` to nav buttons
- Add `aria-expanded={sheetOpen}` to mobile menu trigger button

### Files to modify
1. `src/pages/Auth.tsx` — validation, error handling, a11y
2. `src/components/landing/Navbar.tsx` — a11y attributes

