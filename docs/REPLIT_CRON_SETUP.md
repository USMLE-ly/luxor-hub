# Replit Cron Job Setup — Daily Spend Aggregation

## What It Does
Runs daily at 1:00 AM UTC to aggregate API spend data from Supabase,
compute per-tier cost estimates, and store summaries for the admin dashboard.

## Setup Steps

### Option 1: Replit Cron (Recommended)
1. Open your Replit project
2. Click the **Tools** tab (left sidebar)
3. Click **Secrets** — add these env vars if not already set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
4. Click **Shell** tab
5. Run the command manually first to test:
   ```
   python3 backend/scripts/daily_spend_aggregation.py
   ```
6. If it works, add a cron job:
   - Go to **Tools → Cron Jobs**
   - Add new: `0 1 * * *`
   - Command: `cd /home/runner/luxor-hub && python3 backend/scripts/daily_spend_aggregation.py`

### Option 2: External Cron (cron-job.org)
1. Create free account at https://cron-job.org
2. Create new job:
   - Schedule: Every day at 01:00 UTC
   - URL: https://your-replit.replit.app/api/v1/cron/daily-aggregation
3. Add endpoint to main.py (see below)

### API Endpoint Version
If using external cron, add this to main.py:

```python
@app.route("/api/v1/cron/daily-aggregation", methods=["POST"])
def cron_daily_aggregation():
    \"\"\"Cron-triggered daily spend aggregation.\"\"\"
    # Verify cron secret
    auth = request.headers.get("Authorization", "")
    if auth != f"Bearer {os.environ.get('CRON_SECRET', '')}":
        return jsonify({"error": "Unauthorized"}), 401
    
    from backend.scripts.daily_spend_aggregation import aggregate_and_store
    from datetime import datetime, timedelta
    yesterday = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")
    aggregate_and_store(yesterday)
    return jsonify({"status": "ok", "date": yesterday})
```

Set `CRON_SECRET` env var to a random string for auth.
