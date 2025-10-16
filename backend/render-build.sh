#!/bin/bash
set -e

echo "Installing dependencies..."
composer install --no-dev --optimize-autoloader

echo "Clearing config cache..."
php artisan config:clear

echo "Build complete!"
