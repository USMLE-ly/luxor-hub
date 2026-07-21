# VPS Migration Plan — Move Backend off Replit

## Why Move?
- Replit apps **sleep after 5 min** of inactivity (free tier)
- Cold start takes 10-30 seconds — users see loading spinner
- Limited to 0.5 vCPU / 512MB RAM (free tier)
- Replit URLs change when you rename the project

## Recommended: Hetzner CX22 ($4.50/mo)

| Spec | Value |
|------|-------|
| vCPU | 2 |
| RAM | 4 GB |
| Storage | 40 GB SSD |
| Bandwidth | 20 TB |
| Cost | $4.50/month |

## Migration Steps

### 1. Set up the server
```bash
# SSH into your Hetzner server
ssh root@YOUR_SERVER_IP

# Install Python + deps
apt update && apt install -y python3 python3-pip nginx certbot python3-certbot-nginx

# Clone your repo
git clone https://github.com/USMLE-ly/luxor-hub.git
cd luxor-hub

# Create venv + install
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set env vars
cp .env.example .env
nano .env  # Fill in your values

# Test
python3 main.py
```

### 2. Set up systemd service
```bash
cat > /etc/systemd/system/luxor.service << 'EOF'
[Unit]
Description=Luxor Backend
After=network.target

[Service]
User=root
WorkingDirectory=/root/luxor-hub
ExecStart=/root/luxor-hub/venv/bin/gunicorn -w 4 -b 0.0.0.0:5000 main:app
Restart=always
RestartSec=5
Environment=FLASK_ENV=production

[Install]
WantedBy=multi-user.target
EOF

systemctl enable luxor
systemctl start luxor
```

### 3. Set up Nginx reverse proxy
```bash
cat > /etc/nginx/sites-available/luxor << 'EOF'
server {
    listen 80;
    server_name api.luxor.ly;
    
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

ln -s /etc/nginx/sites-available/luxor /etc/nginx/sites-enabled/
certbot --nginx -d api.luxor.ly
```

### 4. Update Vercel rewrites
Change `vercel.json` rewrites from:
```
"destination": "https://nice-useful-plot--al-bosify.replit.app/api/:path*"
```
To:
```
"destination": "https://api.luxor.ly/api/:path*"
```

### 5. Set up monitoring
- Install Sentry (already built)
- Set up Hetzner Cloud monitoring (free)
- Add health check cron (UptimeRobot free tier)

## Cost Comparison
| Provider | Cost | RAM | Uptime |
|----------|------|-----|--------|
| Replit (free) | $0 | 512MB | Sleeps |
| Replit (Hacker) | $7/mo | 1GB | Sleeps |
| Hetzner CX22 | $4.50/mo | 4GB | 99.9% |
| Railway | $5/mo | 512MB | 99.9% |
| Fly.io | $0-5/mo | 256MB-1GB | 99.9% |

**Recommendation:** Start with Hetzner CX22 at $4.50/mo. Best value.
