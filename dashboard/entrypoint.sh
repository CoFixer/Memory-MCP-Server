#!/bin/sh
set -e

if [ -z "$API_BASE_URL" ]; then
  echo "❌ ERROR: API_BASE_URL is not set!"
  echo "   Example: docker run -e API_BASE_URL=https://api.yourdomain.com my-dashboard"
  exit 1
fi

# Remove trailing slash if present
API_BASE_URL=$(echo "$API_BASE_URL" | sed 's:/$::')

echo "✅ Proxying API requests to: ${API_BASE_URL}"

cat > /etc/nginx/conf.d/default.conf <<EOF
server {
    listen 8080;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api/v1/ {
        proxy_pass ${API_BASE_URL}/api/v1/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

exec nginx -g 'daemon off;'