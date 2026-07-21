#!/bin/bash
# Run this ONCE on your Hetzner server as root
set -e

echo "🔧 Setting up Luxor backend server..."

# System updates
apt update && apt upgrade -y
apt install -y python3 python3-pip python3-venv nginx certbot python3-certbot-nginx git

# Clone repo
cd /root
if [ -d "luxor-hub" ]; then
    cd luxor-hub && git pull
else
    git clone https://github.com/USMLE-ly/luxor-hub.git
    cd luxor-hub
fi

# Python setup
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Edit /root/luxor-hub/.env with your actual values!"
    echo "   nano /root/luxor-hub/.env"
    echo ""
fi

# Install systemd service
cp /root/luxor-hub/deploy/luxor.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable luxor

# Install nginx config
cp /root/luxor-hub/deploy/nginx-luxor.conf /etc/nginx/sites-available/luxor
ln -sf /etc/nginx/sites-available/luxor /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# SSL certificate (run after DNS points to this server)
echo ""
echo "📋 Next steps:"
echo "1. Point api.luxor.ly DNS to this server's IP"
echo "2. Edit .env: nano /root/luxor-hub/.env"
echo "3. Start the service: systemctl start luxor"
echo "4. Get SSL cert: certbot --nginx -d api.luxor.ly"
echo "5. Update Vercel rewrites to https://api.luxor.ly"
