#!/bin/bash

# Create storage directories in writable /tmp
mkdir -p /tmp/storage/framework/cache/data
mkdir -p /tmp/storage/framework/sessions
mkdir -p /tmp/storage/framework/views
mkdir -p /tmp/storage/logs
mkdir -p /tmp/storage/app/public

# Link to storage
php artisan storage:link --force 2>/dev/null || true

# Cache configs
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start PHP-FPM
php-fpm
