# Fix Publish (dist-check) — Minimal Root Build Wiring

## Diagnosis

- **Dev server** is already fixed. Earlier "vite: command not found" happened because `luxor-hub/node_modules` was empty; deps are now installed and the daemon auto-restarted successfully. No script changes required.
- **Publishing fails on `dist-check`** because Lovable's builder runs `npm run build` at the repo root and expects a `dist/` folder at the root. This repo builds the React app inside `luxor-hub/`, so its output lands at `luxor-hub/dist/` and the root check finds nothing.
- The root `package.json` has `build:dev` and `vercel-build` but **no `build` script**, so `npm run build` at the root exits non-zero before anything is produced.

## Changes

**1. `package.json` (root) — add a `build` script that produces `dist/` at the root.**

```json
{
  "scripts": {
    "dev": "cd luxor-hub && npm run dev",
    "preview": "cd luxor-hub && npm run preview",
    "build": "npm --prefix luxor-hub install --no-audit --no-fund && npm --prefix luxor-hub run build && rm -rf dist && cp -r luxor-hub/dist dist",
    "build:dev": "npm --prefix luxor-hub install --no-audit --no-fund && npm --prefix luxor-hub run build -- --mode development && rm -rf dist && cp -r luxor-hub/dist dist",
    "vercel-build": "npm --prefix luxor-hub install && npm --prefix luxor-hub run build"
  }
}
```

That's the whole fix for publishing.

## What I'm intentionally not doing

You listed several extras (preflight vite check, health-check script, `npx vite` fallback, adding vite to root devDependencies). None of them address the actual failure and each has a downside:

- **`npx vite --port 8080` in root dev script** — would download vite from the registry every time the dev daemon restarts, adding latency and a network dependency. Current `cd luxor-hub && npm run dev` already works.
- **Adding vite to root `devDependencies`** — creates two copies of vite in the repo, drifting versions between root and `luxor-hub/`.
- **Custom preflight / health-check scripts** — Lovable already reports "dev server did not become healthy" with logs; a homemade script duplicates that with no new signal.

I'll skip those unless you specifically want them after publish is green.

## Verification

After the edit I'll run `npm run build` at the repo root and confirm a `dist/index.html` exists there, which is exactly what `dist-check` looks for. Then Publish should succeed.
