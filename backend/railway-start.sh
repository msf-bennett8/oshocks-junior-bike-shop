#!/bin/bash

# Create .env file from environment variables if APP_KEY exists
if [ -n "$APP_KEY" ]; then
    echo "Creating .env file with APP_KEY..."
    echo "APP_KEY=${APP_KEY}" > .env
    
    # Add other essential environment variables to .env
    printenv | grep -E '^(APP_|DB_|CACHE_|SESSION_|QUEUE_|REDIS_|MAIL_|AWS_|PUSHER_|VITE_|RAILWAY_|FRONTEND_|CORS_|MPESA_|PAYSTACK_|FLW_|GOOGLE_|STRAVA_|CLOUDINARY_|DATABASE_URL|FORCE_HTTPS)' >> .env
else
    echo "WARNING: APP_KEY not set in environment variables!"
fi

# Create storage directories in writable /tmp
mkdir -p /tmp/storage/framework/cache/data
mkdir -p /tmp/storage/framework/sessions
mkdir -p /tmp/storage/framework/views
mkdir -p /tmp/storage/logs
mkdir -p /tmp/storage/app/public

# Link to storage
php artisan storage:link --force 2>/dev/null || true

# Run migrations
php artisan migrate --force --no-interaction

# Cache configs
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start PHP-FPM
php-fpm