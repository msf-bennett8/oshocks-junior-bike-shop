#!/bin/bash

set -e

echo "=== Setup ==="

# Create .env file with APP_KEY from environment variable
if [ -n "$APP_KEY" ]; then
    echo "Creating .env file with APP_KEY from environment..."
    # Ensure proper base64: prefix
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
printenv | grep -E '^(APP_|DB_|CACHE_|SESSION_|QUEUE_|REDIS_|MAIL_|AWS_|PUSHER_|VITE_|RAILWAY_|FRONTEND_|CORS_|MPESA_|PAYSTACK_|FLW_|GOOGLE_|STRAVA_|CLOUDINARY_|DATABASE_URL|FORCE_HTTPS|AUDIT_|MAXMIND_)' >> .env

# Create storage directories in writable /tmp
mkdir -p /tmp/storage/framework/cache/data
mkdir -p /tmp/storage/framework/sessions
mkdir -p /tmp/storage/framework/views
mkdir -p /tmp/storage/logs
mkdir -p /tmp/storage/app/public

chmod -R 775 /tmp/storage

# Link to storage
php artisan storage:link --force 2>/dev/null || true

echo "=== MaxMind Geolocation Setup ==="
# Download MaxMind DB if not present (runtime fallback for Railway)
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
# Only generate if key is empty/invalid
php artisan key:generate --force 2>/dev/null || echo "Using existing APP_KEY"

echo "=== Running Migrations ==="
php artisan migrate --force --no-interaction || echo "Migrations completed with warnings"

echo "=== Starting Server ==="
exec php -S 0.0.0.0:${PORT:-8080} server.php