# Cloudflare API Shield Configuration Guide

## Why Cloudflare API Shield?

LUXOR's AI endpoints are protected by our custom gateway (auth + validation + spend caps),
but Cloudflare adds an additional edge-level defense layer:

- **Schema validation** at the CDN edge (before requests hit your server)
- **Bot detection** (blocks automated abuse, scrapers, loops)
- **Rate limiting** at the CDN level (faster than Flask-level)
- **JWT validation** (Cloudflare validates Supabase tokens before they reach Replit)
- **Free tier**: 1M requests/month (more than enough for LUXOR)

## Setup Steps

### 1. Add LUXOR to Cloudflare
1. Create a Cloudflare account (free)
2. Add `luxor.ly` domain
3. Update nameservers at your domain registrar

### 2. Enable API Shield
1. Go to **Security -> API Shield**
2. Click **Get started**
3. Enable **Schema Validation** for these endpoints:

```
POST /api/v1/analyze-outfit
POST /api/v1/style-analyze
POST /api/v1/style-recommendations
POST /api/v1/outfit-review
POST /api/v1/generate-outfits
POST /api/v1/pro-tweak/generate
POST /api/v1/closet/analyze-item
```

### 3. Upload API Schemas
Create OpenAPI schemas for each endpoint and upload via the dashboard.

### 4. Enable Bot Fight Mode
1. Go to **Security -> Bots**
2. Enable **Bot Fight Mode** (blocks automated requests)

### 5. Configure Rate Limiting Rules
Go to **Security -> WAF -> Rate limiting rules**:

```
Rule 1: AI Endpoints
  Expression: http.request.uri.path contains "/api/v1/" and http.request.method eq "POST"
  Rate: 30 requests per minute per IP
  Mitigation: 60 second block

Rule 2: Auth Endpoints
  Expression: http.request.uri.path contains "/auth/"
  Rate: 10 requests per minute per IP
  Mitigation: 300 second block
```

## Cost
- **Free plan**: 1M API requests/month, basic bot detection
- **Pro plan** ($20/mo): Super Bot Fight Mode, advanced rate limiting

## Recommendation
Start with the **Free plan**. Upgrade to Pro when you hit 10K+ daily active users.
