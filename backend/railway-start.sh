#!/bin/bash

set -e

echo "=== Setup ==="

# Create .env file with APP_KEY from environment variable
if [ -n "$APP_KEY" ]; then
    echo "Creating .env file with APP_KEY from environment..."
    if [[ "$APP_KEY" == base64:* ]]; then
        echo "APP_KEY=${APP_KEY}" > .env
    else
        echo "APP_KEY=base64:${APP_KEY}" > .env
    fi
else
    echo "WARNING: APP_KEY not set! Generating temporary key..."
    echo "APP_KEY=base64:$(openssl rand -base64 32)" > .env
fi

# Add other essential environment variables to .env
printenv | grep -E '^(APP_|DB_|CACHE_|SESSION_|QUEUE_|REDIS_|MAIL_|AWS_|PUSHER_|VITE_|RAILWAY_|FRONTEND_|CORS_|MPESA_|PAYSTACK_|FLW_|GOOGLE_|STRAVA_|CLOUDINARY_|DATABASE_URL|FORCE_HTTPS|AUDIT_|MAXMIND_|REVERB_)' >> .env

# Create storage directories in writable /tmp
mkdir -p /tmp/storage/framework/cache/data
mkdir -p /tmp/storage/framework/sessions
mkdir -p /tmp/storage/framework/views
mkdir -p /tmp/storage/logs
mkdir -p /tmp/storage/app/public

chmod -R 775 /tmp/storage

# CRITICAL: Symlink Laravel's storage path to /tmp/storage so logs/framework files write to writable disk
# Remove existing storage directory or symlink first to avoid conflicts
rm -rf storage
ln -s /tmp/storage storage
chmod -R 775 storage

# Also ensure bootstrap/cache is writable
mkdir -p /tmp/bootstrap/cache
rm -rf bootstrap/cache
ln -s /tmp/bootstrap/cache bootstrap/cache

# Link to public storage
php artisan storage:link --force 2>/dev/null || true

echo "=== MaxMind Geolocation Setup ==="
if [ ! -f /tmp/GeoLite2-City.mmdb ] && [ -n "$MAXMIND_LICENSE_KEY" ]; then
    echo "MaxMind DB not found, downloading..."
    wget -qO /tmp/maxmind.tar.gz "https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-City&license_key=${MAXMIND_LICENSE_KEY}&suffix=tar.gz" && \
    tar -xzf /tmp/maxmind.tar.gz -C /tmp/ && \
    mv /tmp/GeoLite2-City_*/GeoLite2-City.mmdb /tmp/GeoLite2-City.mmdb && \
    rm -rf /tmp/maxmind.tar.gz /tmp/GeoLite2-City_* && \
    echo "✓ MaxMind database ready ($(ls -lh /tmp/GeoLite2-City.mmdb | awk '{print $5}'))" || \
    echo "⚠ WARNING: MaxMind download failed, geolocation will be disabled"
elif [ -f /tmp/GeoLite2-City.mmdb ]; then
    echo "✓ MaxMind database already present ($(ls -lh /tmp/GeoLite2-City.mmdb | awk '{print $5}'))"
else
    echo "⚠ No MAXMIND_LICENSE_KEY set - geolocation disabled"
fi

echo "=== Generating Key ==="
php artisan key:generate --force 2>/dev/null || echo "Using existing APP_KEY"

echo "=== Running Migrations ==="
php artisan migrate --force --no-interaction || echo "Migrations completed with warnings"

echo "=== Starting Reverb Server (background) ==="
# Use a dedicated internal port, NOT Railway's $PORT
REVERB_INTERNAL_PORT=${REVERB_SERVER_PORT:-6001}
php artisan reverb:start --host=${REVERB_SERVER_HOST:-0.0.0.0} --port=${REVERB_INTERNAL_PORT} &
REVERB_PID=$!
echo "✓ Reverb started on ${REVERB_SERVER_HOST:-0.0.0.0}:${REVERB_INTERNAL_PORT} (PID: $REVERB_PID)"

# Wait for Reverb to actually bind to the port (more reliable than sleep)
for i in {1..30}; do
    if nc -z ${REVERB_SERVER_HOST:-0.0.0.0} ${REVERB_INTERNAL_PORT} 2>/dev/null; then
        echo "✓ Reverb is accepting connections"
        break
    fi
    sleep 1
done

echo "=== Starting HTTP Server ==="
# Railway's $PORT is for public HTTP traffic
exec php -S 0.0.0.0:${PORT:-8000} server.php
