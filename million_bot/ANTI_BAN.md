# SHANNON-Ω Anti-Ban Strategy
## Based on InstaTakker v2.0.0 + Tools-for-Instagram + Industry Research

### Golden Rules (Violate These = Banned)

| Rule | Limit | Why |
|---|---|---|
| Max follows/day | **100** | Instagram's "follow cliff" triggers at ~150 |
| Max likes/hour | **100** | >200 triggers action block |
| Max unfollows/day | **60** | Mass unfollow = guaranteed ban |
| Delay between actions | **8-14 seconds** | Faster = bot detection |
| Extended pauses | **8% chance, 5-12s** | Humans pause randomly |

### Built Into Our Bot

```python
# From InstaTakker core v2.0.0 — applied automatically:
- Random delays with jitter (not fixed intervals)
- 8% chance of extended pause (5-12s)
- Realistic scrolling (150-350px steps)
- Hover delays (200-800ms)
- Hourly action caps with auto-pause
- Action window (8 AM - 11 PM only)
```

### Detection Signals Instagram Checks

```
Browser fingerprint    → ✅ Patched with stealth JS
Mouse movements        → ✅ Random paths + delays
Scroll patterns        → ✅ human_scroll() function
Typing speed           → ✅ human_type() character-by-character
IP reputation          → ✅ Use residential proxy (recommended)
Action velocity        → ✅ Capped at safe limits per hour
Time of day            → ✅ Action window 8AM-11PM
Post interactions      → ✅ Randomized, not all at once
```

### If You Get Action Blocked

```bash
# 1. Stop all automation
# 2. Wait 48-72 hours (blocks expire)
# 3. Reduce all limits by 50%
# 4. Use Instagram normally for 1 week
# 5. Resume with lower limits
```

### Config Reference

```json
// million_bot/config/bot_config.json — tune these:
{
  "anti_ban": {
    "daily_follow_limit": 100,    // Max 150
    "daily_like_limit": 500,      // Max 600
    "hourly_follow_limit": 30,    // Max 40
    "hourly_like_limit": 100,     // Max 150
    "min_delay_seconds": 8,       // Min 5
    "max_delay_seconds": 14,      // Max 20
    "pause_chance_percent": 8     // 5-15%
  }
}
```
