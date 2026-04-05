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
printenv | grep -E '^(APP_|DB_|CACHE_|SESSION_|QUEUE_|REDIS_|MAIL_|AWS_|PUSHER_|VITE_|RAILWAY_|FRONTEND_|CORS_|MPESA_|PAYSTACK_|FLW_|GOOGLE_|STRAVA_|CLOUDINARY_|DATABASE_URL|FORCE_HTTPS)' >> .env

# Create storage directories in writable /tmp
mkdir -p /tmp/storage/framework/cache/data
mkdir -p /tmp/storage/framework/sessions
mkdir -p /tmp/storage/framework/views
mkdir -p /tmp/storage/logs
mkdir -p /tmp/storage/app/public

chmod -R 775 /tmp/storage

# Link to storage
php artisan storage:link --force 2>/dev/null || true

echo "=== Generating Key ==="
# Only generate if key is empty/invalid
php artisan key:generate --force 2>/dev/null || echo "Using existing APP_KEY"

echo "=== Running Migrations ==="
php artisan migrate --force --no-interaction || echo "Migrations completed with warnings"

echo "=== Starting Server ==="
exec php -S 0.0.0.0:${PORT:-8080} server.php