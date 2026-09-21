#!/bin/sh
set -e

# Read backend URL from VITE_API_BASE_URL environment variable
BACKEND_URL="${VITE_API_BASE_URL:-}"

if [ -z "$BACKEND_URL" ]; then
  echo "❌ ERROR: VITE_API_BASE_URL is not set!"
  echo ""
  echo "   For Dokploy deployments, set this in your service environment variables."
  echo "   Example: VITE_API_BASE_URL=https://memory.cofixer.site"
  echo ""
  exit 1
fi

# Remove trailing slash if present
BACKEND_URL=$(echo "$BACKEND_URL" | sed 's:/$::')

# Remove /api/v1 from the end if user included it (prevents double paths)
BACKEND_URL=$(echo "$BACKEND_URL" | sed 's|/api/v1$||')

echo "✅ Dashboard configured with backend: ${BACKEND_URL}"

# Inject runtime config into index.html
INDEX_FILE="/usr/share/nginx/html/index.html"
RUNTIME_CONFIG="<script>window.__RUNTIME_CONFIG__={VITE_API_BASE_URL:'${BACKEND_URL}/api/v1'};</script>"

if grep -q '</head>' "$INDEX_FILE"; then
  sed -i "s|</head>|${RUNTIME_CONFIG}</head>|" "$INDEX_FILE"
  echo "✅ Runtime config injected into index.html"
else
  echo "⚠️  Warning: Could not find </head> tag in index.html"
fi

# Verify injection
if grep -q '__RUNTIME_CONFIG__' "$INDEX_FILE"; then
  echo "✅ Verified: Runtime config is in index.html"
  grep '__RUNTIME_CONFIG__' "$INDEX_FILE" | head -1
else
  echo "⚠️  Warning: Runtime config injection failed"
fi

# Generate nginx config
cat > /etc/nginx/conf.d/default.conf <<'EOF'
server {
    listen 8080;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

echo "🚀 Starting nginx..."
exec nginx -g 'daemon off;'