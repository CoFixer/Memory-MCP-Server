#!/bin/sh
set -e

# Validate required environment variable
if [ -z "$API_BASE_URL" ]; then
  echo "❌ ERROR: API_BASE_URL is not set!"
  echo "   Example: docker run -e API_BASE_URL=https://memory.cofixer.site my-dashboard"
  exit 1
fi

echo "✅ Proxying API requests to: ${API_BASE_URL}"

# Run nginx's default entrypoint (handles envsubst on templates)
# This converts /etc/nginx/templates/*.template -> /etc/nginx/conf.d/
exec /docker-entrypoint.sh "$@"