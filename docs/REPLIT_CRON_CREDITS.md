# Replit Cron — Monthly Credit Reset

## Setup (One-time)

1. Go to your Replit project
2. Click the **Shell** tab
3. Add this cron job:

```bash
# Monthly credit reset — runs at midnight on the 1st of every month
0 0 1 * * cd /home/runner/luxor-hub && python3 backend/scripts/monthly_credit_reset.py
```

## What It Does

- Allocates fresh monthly credits to all active subscribers
- Handles 20% rollover for paid tiers (Starter/Pro/Elite)
- Free tier gets 30 credits with no rollover
- Logs summary of how many users were allocated

## Manual Run

```bash
cd /home/runner/luxor-hub
python3 backend/scripts/monthly_credit_reset.py
```

## Env Vars Required

- `VITE_SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — For admin-level writes
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Fallback if service role key not set
