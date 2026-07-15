# Do Not Execute The "Purge Protocol" As Written

I searched the repo. The claims in the prompt do not match reality, and executing it literally would break things.

## What the prompt claims vs. what's actually in the code

**Claim 1: "The frontend is still hitting `nice-useful-plot--al-bosify.replit.app` directly."**

Reality — that string appears in exactly one place:

```
luxor-hub/vercel.json:28  "destination": "https://nice-useful-plot--al-bosify.replit.app:5000/api/:path*"
luxor-hub/vercel.json:32  ...images/:path*
luxor-hub/vercel.json:36  ...media/:path*
```

That's the **Vercel rewrite target** — it's exactly how the proxy is supposed to work. It is never sent to the browser. Zero occurrences in `luxor-hub/src/`. "Search and destroy every occurrence" would delete the proxy destination and break every `/api/*` call on luxor.ly.

**Claim 2: "`api.ts` still returns a hardcoded URL; overwrite it to always return `''`."**

Reality — `luxor-hub/src/lib/api.ts` (the actual path; there is no `src/api/api.ts`) already returns `""` on Vercel/production. It only returns a non-empty URL for `localhost` (Vite dev) and for `*.replit.app` previews (so the Replit-hosted preview can reach Flask). Forcing `return ""` unconditionally would break local development and the Replit preview.

**Claim 3: "`RangeError: Maximum call stack size exceeded` proves `useEffect` loops in Closet.tsx / DressingRoom.tsx."**

A `RangeError` from an effect loop would say "Maximum update depth exceeded", not "call stack size". "Call stack size exceeded" is recursion inside a single synchronous call — usually a recursive render, an unbounded reducer, or infinite JSON/tree traversal. Blindly emptying dependency arrays and adding `useRef` guards on the 10+ effects in `Closet.tsx` will silently break real reactive behavior (mannequin sync, outfit refetch on user change, occasion recompute) without touching the actual bug.

## What I need before writing any code

1. **The exact error text and stack trace** from DevTools Console for the `RangeError`, plus the file:line at the top of the stack. That will tell us the real recursion source.
2. **A screenshot of the DevTools Network tab** showing a failing request. If the request URL is `https://luxor.ly/api/...` and returns 503, the bug is in `vercel.json` or Replit uptime — not in frontend code. If it's `https://nice-useful-plot--al-bosify.replit.app/...`, then and only then is there a hardcoded URL to hunt (and it isn't in `src/` today, so it would be somewhere new).
3. **Confirmation of which env you're testing on** — luxor.ly (Vercel), luxor-hub.lovable.app, or the Replit preview. The correct `getApiUrl` branch differs per host.

## What I will do once you provide those

- If the Network tab shows the request going to `replit.app` from luxor.ly: grep the built bundle, find the true source, remove it. (It is not in `src/` right now.)
- If the request goes to `luxor.ly/api/...` and 503s: the fix is in `vercel.json` / Replit, not the React code.
- For the `RangeError`: open the file at the top of the stack trace, fix the actual recursion. I will not carpet-bomb `useEffect` dependency arrays.

## What I will not do

- Delete the Vercel proxy destination.
- Rewrite `api.ts` to break localhost/Replit dev.
- Empty dependency arrays across `Closet.tsx` / `DressingRoom.tsx` on suspicion.

Please paste the console stack trace and a Network-tab screenshot of the failing request, and I'll fix the real bug in one focused pass.
